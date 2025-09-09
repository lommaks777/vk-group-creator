import { PrismaClient } from '@prisma/client';
import { createVKAPI } from '@vk-group-creator/vk';
import { TemplateEngine } from '@vk-group-creator/templates';
import { AssetGenerator } from '@vk-group-creator/assets';
import { decrypt } from '../utils/encryption';
import { logger } from '../utils/logger';
import { StudentData, VKGroupCreationResult } from '../types';

export class GroupCreationService {
  constructor(private prisma: PrismaClient) {}

  async createGroup(studentId: string, studentData: StudentData): Promise<VKGroupCreationResult> {
    // Получаем зашифрованный токен из базы
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new Error('Student not found');
    }

    // Расшифровываем токен
    const vkToken = decrypt(student.vk_token);
    const vk = createVKAPI(vkToken);

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
      logger.info('Creating group', { studentId });
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
      logger.info('Uploading avatar', { studentId, groupId });
      const assetGenerator = new AssetGenerator();
      const avatarBuffer = await assetGenerator.generateAvatar(studentData);
      await this.uploadAvatar(vk, avatarBuffer);
      progress.avatar_uploaded = true;

      // 4. Генерируем и загружаем обложку
      logger.info('Uploading cover', { studentId, groupId });
      const coverBuffer = await assetGenerator.generateCover(studentData);
      await this.uploadCover(vk, groupId, coverBuffer);
      progress.cover_uploaded = true;

      // 5. Публикуем стартовые посты
      logger.info('Publishing posts', { studentId, groupId });
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
      }

      // 6. Создаем тему "Отзывы"
      logger.info('Creating reviews topic', { studentId, groupId });
      await vk.board.addTopic({
        group_id: groupId,
        title: 'Отзывы',
        text: 'Оставляйте свои отзывы о качестве массажа и сервиса. Ваше мнение очень важно для нас!',
        from_group: 1,
      });
      progress.reviews_topic_created = true;

      // 7. Включаем маркет и добавляем услуги
      logger.info('Setting up market', { studentId, groupId });
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
      }

      // 8. Настраиваем автоответчик
      logger.info('Setting up auto responder', { studentId, groupId });
      await vk.groups.setLongPollSettings({
        group_id: groupId,
        enabled: 1,
        message_new: 1,
      });
      progress.auto_responder_enabled = true;

      // Сохраняем результат в базу
      await this.prisma.group.create({
        data: {
          studentId,
          vk_group_id: groupId,
          screen_name: `club${groupId}`,
          url: `https://vk.com/club${groupId}`,
          status: 'completed',
          progress,
          result: {
            group_id: groupId,
            screen_name: `club${groupId}`,
            url: `https://vk.com/club${groupId}`,
          },
        },
      });

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
}
