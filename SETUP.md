# Инструкция по настройке и запуску

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
# Установка pnpm (если не установлен)
npm install -g pnpm

# Клонирование и установка зависимостей
git clone <repository-url>
cd vk-group-creator
pnpm install
```

### 2. Настройка VK приложения

1. Перейдите на [vk.com/apps?act=manage](https://vk.com/apps?act=manage)
2. Нажмите "Создать приложение"
3. Заполните форму:
   - **Название**: VK Group Creator
   - **Платформа**: Standalone-приложение
4. В настройках приложения укажите:
   - **Redirect URI**: `http://localhost:3001/api/v1/oauth/callback`
   - **Scope**: `groups,photos,wall,market,docs`
5. Скопируйте **Application ID** и **Secure key**

### 3. Настройка переменных окружения

```bash
# Копируем файлы с примерами
cp apps/server/env.example apps/server/.env
cp infrastructure/env.example infrastructure/.env

# Генерируем ключи шифрования
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('COOKIE_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('ENCRYPTION_KEY=' + require('crypto').randomBytes(32).toString('hex'))"
```

Отредактируйте `apps/server/.env`:

```env
# Server Configuration
NODE_ENV=development
HOST=0.0.0.0
PORT=3001

# VK API Configuration
VK_CLIENT_ID=your_vk_app_id_here
VK_CLIENT_SECRET=your_vk_app_secret_here
VK_REDIRECT_URI=http://localhost:3001/api/v1/oauth/callback
VK_API_VERSION=5.199

# Security (замените на сгенерированные ключи)
JWT_SECRET=your_jwt_secret_key_here
COOKIE_SECRET=your_cookie_secret_key_here
ENCRYPTION_KEY=your_32_byte_hex_encryption_key_here

# Database
DATABASE_URL=file:./dev.db

# Redis
REDIS_URL=redis://localhost:6379

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# Logging
LOG_LEVEL=info
```

### 4. Запуск Redis

```bash
# Через Docker (рекомендуется)
docker run -d -p 6379:6379 --name redis redis:7-alpine

# Или установите Redis локально
# macOS: brew install redis && brew services start redis
# Ubuntu: sudo apt install redis-server && sudo systemctl start redis
```

### 5. Инициализация базы данных

```bash
# Переходим в папку сервера
cd apps/server

# Генерируем Prisma клиент
pnpm prisma generate

# Создаем базу данных
pnpm prisma db push
```

### 6. Запуск в режиме разработки

```bash
# Терминал 1: Запуск сервера
pnpm --filter @vk-group-creator/server dev

# Терминал 2: Запуск фронтенда
pnpm --filter @vk-group-creator/web dev
```

### 7. Проверка работы

1. Откройте http://localhost:3000
2. Заполните форму с данными массажиста
3. Нажмите "Создать группу ВКонтакте"
4. Авторизуйтесь в VK
5. Дождитесь завершения создания группы

## 🐳 Запуск через Docker

### 1. Подготовка

```bash
# Настройте переменные окружения
cp infrastructure/env.example infrastructure/.env
# Отредактируйте .env файл
```

### 2. Запуск

```bash
cd infrastructure
docker-compose up -d
```

### 3. Проверка

```bash
# Проверка статуса контейнеров
docker-compose ps

# Просмотр логов
docker-compose logs -f server
```

## 🔧 Устранение неполадок

### Ошибка "Redis connection failed"

```bash
# Проверьте, запущен ли Redis
docker ps | grep redis

# Или проверьте локальный Redis
redis-cli ping
```

### Ошибка "Database connection failed"

```bash
# Пересоздайте базу данных
cd apps/server
pnpm prisma db push --force-reset
```

### Ошибка "VK API Error"

1. Проверьте правильность `VK_CLIENT_ID` и `VK_CLIENT_SECRET`
2. Убедитесь, что Redirect URI совпадает с настройками в VK
3. Проверьте, что у приложения есть необходимые права

### Ошибка "Captcha required"

Это нормально для VK API. В продакшене нужно добавить обработку капчи.

### Ошибка "Flood control"

VK ограничивает количество запросов. Система автоматически делает паузы между запросами.

## 📊 Мониторинг

### Логи сервера

```bash
# Просмотр логов в реальном времени
docker-compose logs -f server

# Или для локального запуска
pnpm --filter @vk-group-creator/server dev
```

### Проверка очереди

```bash
# Подключение к Redis
redis-cli

# Просмотр очереди
LLEN bull:group-creation:waiting
LLEN bull:group-creation:active
LLEN bull:group-creation:completed
LLEN bull:group-creation:failed
```

### Проверка базы данных

```bash
cd apps/server
pnpm prisma studio
```

## 🚀 Деплой в продакшен

### Heroku

```bash
# Установите Heroku CLI
# Создайте приложение
heroku create your-app-name

# Настройте переменные окружения
heroku config:set VK_CLIENT_ID=your_id
heroku config:set VK_CLIENT_SECRET=your_secret
heroku config:set JWT_SECRET=your_jwt_secret
heroku config:set COOKIE_SECRET=your_cookie_secret
heroku config:set ENCRYPTION_KEY=your_encryption_key
heroku config:set DATABASE_URL=postgresql://...
heroku config:set REDIS_URL=redis://...

# Деплой
git push heroku main
```

### VPS

```bash
# На сервере
git clone <repository-url>
cd vk-group-creator

# Настройте переменные окружения
cp infrastructure/env.example infrastructure/.env
# Отредактируйте .env

# Запустите через Docker
cd infrastructure
docker-compose up -d
```

## 📝 Полезные команды

```bash
# Сборка всех пакетов
pnpm build

# Линтинг
pnpm lint

# Проверка типов
pnpm type-check

# Очистка
pnpm clean

# Перезапуск сервисов
docker-compose restart

# Остановка всех сервисов
docker-compose down

# Удаление всех данных
docker-compose down -v
```

## 🆘 Поддержка

При возникновении проблем:

1. Проверьте логи сервера
2. Убедитесь в правильности переменных окружения
3. Проверьте настройки VK приложения
4. Создайте issue в репозитории

## 📚 Дополнительные ресурсы

- [VK API Documentation](https://dev.vk.com/api)
- [Fastify Documentation](https://www.fastify.io/docs/latest/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [BullMQ Documentation](https://docs.bullmq.io/)
