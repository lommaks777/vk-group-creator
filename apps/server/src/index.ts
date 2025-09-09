import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import jwt from '@fastify/jwt';
import cookie from '@fastify/cookie';
import { PrismaClient } from '@prisma/client';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

import { initRoutes } from './routes';
import { config } from './utils/config';
import { logger } from './utils/logger';

const prisma = new PrismaClient();
const redis = new IORedis(config.redis.url);

// Создаем очереди для обработки задач
const groupCreationQueue = new Queue('group-creation', {
  connection: redis,
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

const fastify = Fastify({
  logger: {
    level: config.log.level,
    prettyPrint: config.env === 'development',
  },
});

async function buildApp() {
  // Регистрируем плагины
  await fastify.register(cors, {
    origin: config.cors.origin,
    credentials: true,
  });

  await fastify.register(helmet, {
    contentSecurityPolicy: false,
  });

  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  await fastify.register(jwt, {
    secret: config.jwt.secret,
  });

  await fastify.register(cookie, {
    secret: config.cookie.secret,
  });

  // Добавляем контекст в запросы
  fastify.decorate('prisma', prisma);
  fastify.decorate('redis', redis);
  fastify.decorate('groupCreationQueue', groupCreationQueue);

  // Регистрируем маршруты
  await fastify.register(initRoutes, { prefix: '/api/v1' });

  // Обработчик ошибок
  fastify.setErrorHandler((error, request, reply) => {
    logger.error(error);
    reply.status(500).send({
      error: 'Internal Server Error',
      message: config.env === 'development' ? error.message : 'Something went wrong',
    });
  });

  return fastify;
}

async function start() {
  try {
    const app = await buildApp();
    
    await app.listen({
      port: config.server.port,
      host: config.server.host,
    });

    logger.info(`Server is running on http://${config.server.host}:${config.server.port}`);
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down server...');
  await prisma.$disconnect();
  await redis.disconnect();
  await groupCreationQueue.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Shutting down server...');
  await prisma.$disconnect();
  await redis.disconnect();
  await groupCreationQueue.close();
  process.exit(0);
});

start();
