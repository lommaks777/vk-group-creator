import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

export const config = {
  env: process.env.NODE_ENV || 'development',
  
  server: {
    host: process.env.HOST || '0.0.0.0',
    port: parseInt(process.env.PORT || '3001', 10),
  },

  vk: {
    clientId: process.env.VK_CLIENT_ID!,
    clientSecret: process.env.VK_CLIENT_SECRET!,
    redirectUri: process.env.VK_REDIRECT_URI || 'http://localhost:3001/api/v1/oauth/callback',
    apiVersion: process.env.VK_API_VERSION || '5.199',
    scope: 'groups,photos,wall,market,docs',
  },

  jwt: {
    secret: process.env.JWT_SECRET!,
    expiresIn: '7d',
  },

  cookie: {
    secret: process.env.COOKIE_SECRET!,
  },

  encryption: {
    key: process.env.ENCRYPTION_KEY!,
    algorithm: 'aes-256-gcm',
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  },

  log: {
    level: process.env.LOG_LEVEL || 'info',
  },

  database: {
    url: process.env.DATABASE_URL || 'file:./dev.db',
  },
};

// Проверяем обязательные переменные окружения
const requiredEnvVars = [
  'VK_CLIENT_ID',
  'VK_CLIENT_SECRET',
  'JWT_SECRET',
  'COOKIE_SECRET',
  'ENCRYPTION_KEY',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}
