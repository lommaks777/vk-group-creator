# VK Group Creator

Автоматическое создание групп ВКонтакте для учеников школы массажа.

## 🎯 Описание

Система позволяет за 30-60 секунд создать полностью оформленную группу ВКонтакте с:
- Профессиональным аватаром и обложкой
- Готовыми постами (8 штук)
- Разделом услуг с ценами
- Темой для отзывов
- Автоответчиком
- Настроенными сообщениями

## 🏗️ Архитектура

```
/apps
  /web        # Next.js фронтенд
  /server     # Fastify бэкенд
/packages
  /vk         # VK API SDK
  /templates  # Шаблоны контента
  /assets     # Генерация изображений
/infrastructure
  docker-compose.yml
  Dockerfile.*
```

## 🚀 Быстрый старт

### 1. Клонирование и установка

```bash
git clone <repository-url>
cd vk-group-creator
pnpm install
```

### 2. Настройка переменных окружения

Скопируйте файл с примером переменных:

```bash
cp apps/server/env.example apps/server/.env
cp infrastructure/env.example infrastructure/.env
```

Заполните необходимые переменные:

```env
# VK API Configuration
VK_CLIENT_ID=your_vk_app_id
VK_CLIENT_SECRET=your_vk_app_secret
VK_REDIRECT_URI=http://localhost:3001/api/v1/oauth/callback

# Security
JWT_SECRET=your_jwt_secret_key_here
COOKIE_SECRET=your_cookie_secret_key_here
ENCRYPTION_KEY=your_32_byte_hex_encryption_key_here

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

### 3. Настройка VK приложения

1. Создайте приложение на [vk.com/apps?act=manage](https://vk.com/apps?act=manage)
2. В настройках приложения укажите:
   - **Redirect URI**: `http://localhost:3001/api/v1/oauth/callback`
   - **Scope**: `groups,photos,wall,market,docs`
3. Скопируйте `Application ID` и `Secure key` в переменные окружения

### 4. Запуск в режиме разработки

```bash
# Запуск Redis (обязательно)
docker run -d -p 6379:6379 redis:7-alpine

# Запуск сервера
pnpm --filter @vk-group-creator/server dev

# Запуск фронтенда (в другом терминале)
pnpm --filter @vk-group-creator/web dev
```

### 5. Запуск через Docker

```bash
cd infrastructure
docker-compose up -d
```

## 📋 Использование

1. Откройте http://localhost:3000
2. Заполните форму с информацией о массажисте
3. Нажмите "Создать группу ВКонтакте"
4. Авторизуйтесь в VK
5. Дождитесь завершения создания группы
6. Получите ссылку на готовую группу

## 🔧 API

### POST /api/v1/oauth/init
Инициация OAuth процесса

**Тело запроса:**
```json
{
  "name": "Иван Петров",
  "city": "Москва",
  "area": "Центральный",
  "phone": "+79000000000",
  "telegram": "@ivan_massage",
  "techniques": ["классический", "шейно-воротниковая"],
  "pricing": [
    {"title": "Классический массаж 60 мин", "price": 2500}
  ],
  "is_home_visit": true,
  "address": "ул. Примерная, 1"
}
```

**Ответ:**
```json
{
  "auth_url": "https://oauth.vk.com/authorize?...",
  "state": "random_state_string"
}
```

### GET /api/v1/groups/:id/status
Получение статуса создания группы

**Ответ:**
```json
{
  "id": "job_id",
  "status": "completed",
  "progress": {
    "group_created": true,
    "avatar_uploaded": true,
    "cover_uploaded": true,
    "posts_published": 2,
    "total_posts": 8,
    "reviews_topic_created": true,
    "market_enabled": true,
    "services_added": 3,
    "total_services": 3,
    "address_added": false,
    "auto_responder_enabled": true
  },
  "result": {
    "group_id": 123456789,
    "screen_name": "club123456789",
    "url": "https://vk.com/club123456789"
  }
}
```

## 🛠️ Разработка

### Структура проекта

- **apps/web** - Next.js фронтенд с React Hook Form
- **apps/server** - Fastify сервер с Prisma ORM
- **packages/vk** - SDK для работы с VK API
- **packages/templates** - Handlebars шаблоны для контента
- **packages/assets** - Генерация изображений с Canvas

### Команды

```bash
# Установка зависимостей
pnpm install

# Сборка всех пакетов
pnpm build

# Запуск в режиме разработки
pnpm dev

# Линтинг
pnpm lint

# Проверка типов
pnpm type-check

# Тесты
pnpm test
```

### Добавление новых шаблонов

1. Отредактируйте файлы в `packages/templates/src/`
2. Добавьте новые поля в типы `StudentData`
3. Обновите форму в `apps/web/src/components/StudentForm.tsx`

## 🔒 Безопасность

- Все токены шифруются с помощью AES-256-GCM
- Используется HTTPS в продакшене
- Настроены CORS политики
- Валидация всех входящих данных
- Rate limiting для API

## 📊 Мониторинг

- Логирование всех операций
- Отслеживание прогресса создания групп
- Обработка ошибок VK API
- Retry механизм для сбоев

## 🚀 Деплой

### Heroku

```bash
# Установите Heroku CLI
heroku create your-app-name

# Настройте переменные окружения
heroku config:set VK_CLIENT_ID=your_id
heroku config:set VK_CLIENT_SECRET=your_secret
# ... остальные переменные

# Деплой
git push heroku main
```

### VPS

```bash
# Клонируйте репозиторий
git clone <repository-url>
cd vk-group-creator

# Настройте переменные окружения
cp infrastructure/env.example infrastructure/.env
# Отредактируйте .env

# Запустите через Docker
cd infrastructure
docker-compose up -d
```

## 📝 Лицензия

MIT License

## 🤝 Поддержка

При возникновении проблем:
1. Проверьте логи сервера
2. Убедитесь в правильности переменных окружения
3. Проверьте настройки VK приложения
4. Создайте issue в репозитории
