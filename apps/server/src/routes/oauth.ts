import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import crypto from 'crypto';
import { config } from '../utils/config';
import { encrypt } from '../utils/encryption';
import { logger } from '../utils/logger';
import { StudentData } from '../types';

interface InitRequest {
  Body: StudentData;
}

interface CallbackRequest {
  Querystring: {
    code: string;
    state: string;
  };
}

export async function initRoutes(fastify: FastifyInstance) {
  // Инициация OAuth процесса
  fastify.post<InitRequest>('/init', async (request, reply) => {
    try {
      const studentData = request.body;
      
      // Генерируем state для безопасности
      const state = crypto.randomBytes(32).toString('hex');
      
      // Сохраняем данные ученика в Redis с TTL 10 минут
      await fastify.redis.setex(
        `oauth:state:${state}`,
        600,
        JSON.stringify(studentData)
      );
      
      // Формируем URL для OAuth
      const authUrl = new URL('https://oauth.vk.com/authorize');
      authUrl.searchParams.set('client_id', config.vk.clientId);
      authUrl.searchParams.set('redirect_uri', config.vk.redirectUri);
      authUrl.searchParams.set('scope', config.vk.scope);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('state', state);
      authUrl.searchParams.set('v', config.vk.apiVersion);
      
      logger.info('OAuth initiated', { state, studentName: studentData.name });
      
      return {
        auth_url: authUrl.toString(),
        state,
      };
    } catch (error) {
      logger.error('OAuth init error', error);
      reply.status(500).send({ error: 'Failed to initiate OAuth' });
    }
  });

  // Callback от VK OAuth
  fastify.get<CallbackRequest>('/callback', async (request, reply) => {
    try {
      const { code, state } = request.query;
      
      if (!code || !state) {
        return reply.status(400).send({ error: 'Missing code or state parameter' });
      }
      
      // Получаем данные ученика из Redis
      const studentDataStr = await fastify.redis.get(`oauth:state:${state}`);
      if (!studentDataStr) {
        return reply.status(400).send({ error: 'Invalid or expired state' });
      }
      
      const studentData: StudentData = JSON.parse(studentDataStr);
      
      // Обмениваем code на access_token
      const tokenResponse = await fetch('https://oauth.vk.com/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: config.vk.clientId,
          client_secret: config.vk.clientSecret,
          redirect_uri: config.vk.redirectUri,
          code,
        }),
      });
      
      const tokenData = await tokenResponse.json();
      
      if (tokenData.error) {
        logger.error('VK token exchange error', tokenData);
        return reply.status(400).send({ error: 'Failed to exchange code for token' });
      }
      
      // Шифруем токен
      const encryptedToken = encrypt(tokenData.access_token);
      
      // Сохраняем в базу данных
      const student = await fastify.prisma.student.create({
        data: {
          name: studentData.name,
          city: studentData.city,
          area: studentData.area,
          phone: studentData.phone,
          telegram: studentData.telegram,
          techniques: studentData.techniques,
          pricing: studentData.pricing,
          is_home_visit: studentData.is_home_visit,
          address: studentData.address,
          vk_token: encryptedToken,
          vk_user_id: tokenData.user_id,
        },
      });
      
      // Добавляем задачу в очередь
      const job = await fastify.groupCreationQueue.add('create-group', {
        studentId: student.id,
        studentData,
        vkToken: tokenData.access_token,
      });
      
      // Удаляем state из Redis
      await fastify.redis.del(`oauth:state:${state}`);
      
      logger.info('OAuth completed', { studentId: student.id, vkUserId: tokenData.user_id });
      
      return {
        success: true,
        student_id: student.id,
        job_id: job.id,
        message: 'Group creation started',
      };
    } catch (error) {
      logger.error('OAuth callback error', error);
      reply.status(500).send({ error: 'OAuth callback failed' });
    }
  });
}