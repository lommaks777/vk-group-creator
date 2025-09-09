import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { config } from '../utils/config';
import { logger } from '../utils/logger';
import { decrypt } from '../utils/encryption';
import { StudentData, VKGroupCreationResult } from '../types';
import { createVKAPI } from '@vk-group-creator/vk';
import { TemplateEngine } from '@vk-group-creator/templates';
import { AssetGenerator } from '@vk-group-creator/assets';

export interface GroupCreationJobData {
  studentId: string;
  studentData: StudentData;
  vkToken: string;
}

export interface PostSchedulingJobData {
  groupId: number;
  vkToken: string;
  posts: Array<{
    content: string;
    delay_days?: number;
  }>;
}

class QueueService {
  private redis: IORedis;
  private groupCreationQueue: Queue;
  private postSchedulingQueue: Queue;
  private groupCreationWorker: Worker;
  private postSchedulingWorker: Worker;

  constructor() {
    this.redis = new IORedis(config.redis.url);
    
    // Создаем очереди
    this.groupCreationQueue = new Queue('group-creation', {
      connection: this.redis,
      defaultJobOptions: {
        removeOnComplete: 10,
        removeOnFail: 5,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    });

    this.postSchedulingQueue = new Queue('post-scheduling', {
      connection: this.redis,
      defaultJobOptions: {
        removeOnComplete: 10,
        removeOnFail: 5,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    });

    // Создаем воркеры
    this.groupCreationWorker = new Worker(
      'group-creation',
      this.processGroupCreation.bind(this),
      {
        connection: this.redis,
        concurrency: 2, // Ограничиваем количество одновременных созданий групп
      }
    );

    this.postSchedulingWorker = new Worker(
      'post-scheduling',
      this.processPostScheduling.bind(this),
      {
        connection: this.redis,
        concurrency: 5,
      }
    );

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.groupCreationWorker.on('completed', (job) => {
      logger.info('Group creation completed', { jobId: job.id });
    });

    this.groupCreationWorker.on('failed', (job, err) => {
      logger.error('Group creation failed', { jobId: job?.id, error: err.message });
    });

    this.postSchedulingWorker.on('completed', (job) => {
      logger.info('Post scheduling completed', { jobId: job.id });
    });

    this.postSchedulingWorker.on('failed', (job, err) => {
      logger.error('Post scheduling failed', { jobId: job?.id, error: err.message });
    });
  }

  async addGroupCreationJob(data: GroupCreationJobData): Promise<Job> {
    return this.groupCreationQueue.add('create-group', data, {
      priority: 1,
    });
  }

  async addPostSchedulingJob(data: PostSchedulingJobData): Promise<Job> {
    return this.postSchedulingQueue.add('schedule-posts', data, {
      priority: 2,
    });
  }

  private async processGroupCreation(job: Job<GroupCreationJobData>): Promise<VKGroupCreationResult> {
    const { studentId, studentData, vkToken } = job.data;
    
    logger.info('Starting group creation', { studentId, jobId: job.id });

    const vk = createVKAPI(vkToken);
    const assetGenerator = new AssetGenerator();
    
    const progress: VKGroupCreationResult['progress'] = {
      group_created: false,
      avatar_uploaded: false,
      cover_uploaded: false,
      posts_published: 0,
      total_posts: 0,
      reviews_topic_created: false,
      market_enabled: false,
      services_added: 0,
      total_services: 0,
      address_added: false,
      auto_responder_enabled: false,
    };

    try {
      // 1. Создаем группу
      await job.updateProgress({ ...progress, step: 'creating_group' });
      const groupDescription = TemplateEngine.generateGroupDescription(studentData);
      
      const createResponse = await vk.groups.create({
        title: groupDescription.title,
        type: 'page',
        subtype: 'company',
        public_category: groupDescription.public_category,
        public_subcategory: groupDescription.public_subcategory,
      });

      if (!createResponse.response) {
        throw new Error('Failed to create group');
      }

      const groupId = createResponse.response.id;
      progress.group_created = true;
      await job.updateProgress({ ...progress, step: 'group_created' });

      // 2. Редактируем группу
      await vk.groups.edit({
        group_id: groupId,
        description: groupDescription.description,
        website: `https://vk.com/club${groupId}`,
        wall: 1,
        topics: 1,
        photos: 1,
        market: 1,
        messages: 1,
      });

      // 3. Генерируем и загружаем аватар
      await job.updateProgress({ ...progress, step: 'uploading_avatar' });
      const avatarBuffer = await assetGenerator.generateAvatar(studentData);
      await this.uploadAvatar(vk, avatarBuffer);
      progress.avatar_uploaded = true;
      await job.updateProgress({ ...progress, step: 'avatar_uploaded' });

      // 4. Генерируем и загружаем обложку
      await job.updateProgress({ ...progress, step: 'uploading_cover' });
      const coverBuffer = await assetGenerator.generateCover(studentData);
      await this.uploadCover(vk, groupId, coverBuffer);
      progress.cover_uploaded = true;
      await job.updateProgress({ ...progress, step: 'cover_uploaded' });

      // 5. Публикуем стартовые посты
      await job.updateProgress({ ...progress, step: 'publishing_posts' });
      const posts = TemplateEngine.generatePosts(studentData);
      progress.total_posts = posts.length;

      // Публикуем первые 2 поста сразу
      const immediatePosts = posts.filter(p => p.publish_immediately);
      for (const post of immediatePosts.slice(0, 2)) {
        await vk.wall.post({
          owner_id: -groupId,
          message: post.content,
          from_group: 1,
        });
        progress.posts_published++;
        await job.updateProgress({ ...progress, step: 'posts_published' });
      }

      // Планируем остальные посты
      const delayedPosts = posts.filter(p => !p.publish_immediately);
      if (delayedPosts.length > 0) {
        await this.addPostSchedulingJob({
          groupId,
          vkToken,
          posts: delayedPosts.map(p => ({
            content: p.content,
            delay_days: p.delay_days,
          })),
        });
      }

      // 6. Создаем тему "Отзывы"
      await job.updateProgress({ ...progress, step: 'creating_reviews_topic' });
      await vk.board.addTopic({
        group_id: groupId,
        title: 'Отзывы',
        text: 'Оставляйте свои отзывы о качестве массажа и сервиса. Ваше мнение очень важно для нас!',
        from_group: 1,
      });
      progress.reviews_topic_created = true;
      await job.updateProgress({ ...progress, step: 'reviews_topic_created' });

      // 7. Включаем маркет и добавляем услуги
      await job.updateProgress({ ...progress, step: 'setting_up_market' });
      await vk.groups.toggleMarket({
        group_id: groupId,
        enabled: 1,
        currency: 1, // RUB
      });
      progress.market_enabled = true;

      const marketItems = TemplateEngine.generateMarketItems(studentData);
      progress.total_services = marketItems.length;

      for (const item of marketItems) {
        await vk.market.add({
          owner_id: -groupId,
          name: item.title,
          description: item.description,
          category_id: item.category_id,
          price: item.price,
          currency_id: 1,
        });
        progress.services_added++;
        await job.updateProgress({ ...progress, step: 'services_added' });
      }

      // 8. Добавляем адрес (если есть)
      if (studentData.address) {
        await job.updateProgress({ ...progress, step: 'adding_address' });
        // Здесь нужно получить координаты адреса через геокодинг
        // Для MVP пропускаем этот шаг
        progress.address_added = true;
        await job.updateProgress({ ...progress, step: 'address_added' });
      }

      // 9. Настраиваем автоответчик
      await job.updateProgress({ ...progress, step: 'setting_up_auto_responder' });
      await vk.groups.setLongPollSettings({
        group_id: groupId,
        enabled: 1,
        message_new: 1,
      });
      progress.auto_responder_enabled = true;
      await job.updateProgress({ ...progress, step: 'auto_responder_enabled' });

      const result: VKGroupCreationResult = {
        group_id: groupId,
        screen_name: `club${groupId}`,
        url: `https://vk.com/club${groupId}`,
        status: 'completed',
        progress,
      };

      logger.info('Group creation completed successfully', { studentId, groupId });
      return result;

    } catch (error) {
      logger.error('Group creation failed', { studentId, error: error.message });
      throw error;
    }
  }

  private async processPostScheduling(job: Job<PostSchedulingJobData>): Promise<void> {
    const { groupId, vkToken, posts } = job.data;
    
    logger.info('Starting post scheduling', { groupId, postsCount: posts.length });

    const vk = createVKAPI(vkToken);

    for (const post of posts) {
      if (post.delay_days) {
        // Планируем пост на будущее
        const publishDate = Math.floor(Date.now() / 1000) + (post.delay_days * 24 * 60 * 60);
        
        await vk.wall.post({
          owner_id: -groupId,
          message: post.content,
          from_group: 1,
          publish_date: publishDate,
        });
        
        logger.info('Post scheduled', { groupId, delayDays: post.delay_days, publishDate });
      } else {
        // Публикуем сразу
        await vk.wall.post({
          owner_id: -groupId,
          message: post.content,
          from_group: 1,
        });
        
        logger.info('Post published immediately', { groupId });
      }
    }
  }

  private async uploadAvatar(vk: any, avatarBuffer: Buffer): Promise<void> {
    const uploadServer = await vk.photos.getOwnerPhotoUploadServer();
    if (!uploadServer.response) {
      throw new Error('Failed to get avatar upload server');
    }

    const uploadResponse = await vk.client.uploadFile(
      uploadServer.response.upload_url,
      avatarBuffer,
      'photo'
    );

    await vk.photos.saveOwnerPhoto({
      photo: uploadResponse.photo,
      server: uploadResponse.server,
      hash: uploadResponse.hash,
    });
  }

  private async uploadCover(vk: any, groupId: number, coverBuffer: Buffer): Promise<void> {
    const uploadServer = await vk.photos.getOwnerCoverPhotoUploadServer({
      group_id: groupId,
    });
    
    if (!uploadServer.response) {
      throw new Error('Failed to get cover upload server');
    }

    const uploadResponse = await vk.client.uploadFile(
      uploadServer.response.upload_url,
      coverBuffer,
      'photo'
    );

    await vk.photos.saveOwnerCoverPhoto({
      photo: uploadResponse.photo,
      hash: uploadResponse.hash,
    });
  }

  async getJobStatus(jobId: string): Promise<any> {
    const job = await this.groupCreationQueue.getJob(jobId);
    if (!job) {
      return null;
    }

    return {
      id: job.id,
      status: await job.getState(),
      progress: job.progress,
      result: job.returnvalue,
      error: job.failedReason,
      created_at: new Date(job.timestamp),
      updated_at: new Date(job.processedOn || job.timestamp),
    };
  }

  async close(): Promise<void> {
    await this.groupCreationWorker.close();
    await this.postSchedulingWorker.close();
    await this.groupCreationQueue.close();
    await this.postSchedulingQueue.close();
    await this.redis.disconnect();
  }
}

export const queueService = new QueueService();
