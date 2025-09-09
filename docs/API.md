# API Documentation

## Обзор

API для автоматического создания групп ВКонтакте. Все эндпоинты возвращают JSON и используют стандартные HTTP коды ответов.

**Base URL**: `http://localhost:3001/api/v1`

## Аутентификация

API использует OAuth 2.0 flow через ВКонтакте. Пользователь должен авторизоваться через VK, после чего токен сохраняется в зашифрованном виде.

## Эндпоинты

### Health Check

#### GET /health

Проверка состояния сервера.

**Ответ:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### OAuth

#### POST /oauth/init

Инициация процесса OAuth авторизации.

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
    {
      "title": "Классический массаж 60 мин",
      "price": 2500
    },
    {
      "title": "ШВЗ 30 мин",
      "price": 1500
    }
  ],
  "is_home_visit": true,
  "address": "ул. Примерная, 1"
}
```

**Ответ:**
```json
{
  "auth_url": "https://oauth.vk.com/authorize?client_id=...",
  "state": "random_state_string"
}
```

**Ошибки:**
- `400` - Неверные данные запроса
- `500` - Внутренняя ошибка сервера

#### GET /oauth/callback

Callback для OAuth авторизации (вызывается VK).

**Параметры:**
- `code` - Код авторизации от VK
- `state` - Состояние для проверки безопасности

**Ответ:**
```json
{
  "success": true,
  "student_id": "student_uuid",
  "message": "Group creation started"
}
```

**Ошибки:**
- `400` - Неверный код или состояние
- `500` - Ошибка обмена кода на токен

### Группы

#### GET /groups/:id/status

Получение статуса создания группы.

**Параметры:**
- `id` - ID задачи создания группы

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
  },
  "error": null,
  "created_at": "2024-01-01T12:00:00.000Z",
  "updated_at": "2024-01-01T12:01:00.000Z"
}
```

**Статусы:**
- `waiting` - Ожидает выполнения
- `active` - Выполняется
- `completed` - Завершено успешно
- `failed` - Завершено с ошибкой
- `delayed` - Отложено

**Ошибки:**
- `404` - Задача не найдена
- `500` - Внутренняя ошибка сервера

#### GET /groups/student/:studentId

Получение всех групп ученика.

**Параметры:**
- `studentId` - ID ученика

**Ответ:**
```json
{
  "groups": [
    {
      "id": "group_uuid",
      "vk_group_id": 123456789,
      "screen_name": "club123456789",
      "url": "https://vk.com/club123456789",
      "status": "completed",
      "created_at": "2024-01-01T12:00:00.000Z"
    }
  ]
}
```

#### DELETE /groups/:id/revoke

Отзыв доступа к группе.

**Параметры:**
- `id` - ID группы

**Ответ:**
```json
{
  "success": true,
  "message": "Access revoked successfully"
}
```

## Модели данных

### StudentData

```typescript
interface StudentData {
  name: string;                    // Имя и фамилия
  city: string;                    // Город
  area: string;                    // Район
  phone: string;                   // Телефон (+7XXXXXXXXXX)
  telegram?: string;               // Telegram username
  techniques: string[];            // Техники массажа
  pricing: Array<{                 // Услуги и цены
    title: string;
    price: number;
  }>;
  is_home_visit: boolean;          // Выезд на дом или кабинет
  address?: string;                // Адрес кабинета (если не выезд)
}
```

### GroupStatus

```typescript
interface GroupStatus {
  id: string;                      // ID задачи
  status: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed';
  progress: {
    group_created: boolean;
    avatar_uploaded: boolean;
    cover_uploaded: boolean;
    posts_published: number;
    total_posts: number;
    reviews_topic_created: boolean;
    market_enabled: boolean;
    services_added: number;
    total_services: number;
    address_added: boolean;
    auto_responder_enabled: boolean;
  };
  result?: {
    group_id: number;
    screen_name: string;
    url: string;
  };
  error?: string;
  created_at: string;
  updated_at: string;
}
```

## Коды ошибок

### HTTP коды

- `200` - Успешный запрос
- `400` - Неверные данные запроса
- `401` - Не авторизован
- `403` - Доступ запрещен
- `404` - Ресурс не найден
- `429` - Слишком много запросов
- `500` - Внутренняя ошибка сервера

### VK API ошибки

- `6` - Слишком много запросов в секунду
- `9` - Flood control
- `14` - Требуется ввод капчи
- `15` - Доступ запрещен
- `18` - Страница удалена или заблокирована

## Rate Limiting

API имеет ограничения на количество запросов:
- 100 запросов в минуту на IP
- 5 одновременных созданий групп
- 10 запросов в секунду к VK API

## Webhooks

Система поддерживает webhooks для уведомлений о статусе создания группы:

```json
{
  "event": "group.created",
  "data": {
    "student_id": "uuid",
    "group_id": 123456789,
    "url": "https://vk.com/club123456789",
    "status": "completed"
  }
}
```

## Примеры использования

### JavaScript/TypeScript

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api/v1'
});

// Инициация создания группы
const initResponse = await api.post('/oauth/init', {
  name: 'Иван Петров',
  city: 'Москва',
  area: 'Центральный',
  phone: '+79000000000',
  techniques: ['классический'],
  pricing: [{ title: 'Массаж 60 мин', price: 2500 }],
  is_home_visit: true
});

// Получение статуса
const statusResponse = await api.get(`/groups/${jobId}/status`);
console.log(statusResponse.data.progress);
```

### cURL

```bash
# Инициация создания группы
curl -X POST http://localhost:3001/api/v1/oauth/init \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Иван Петров",
    "city": "Москва",
    "area": "Центральный",
    "phone": "+79000000000",
    "techniques": ["классический"],
    "pricing": [{"title": "Массаж 60 мин", "price": 2500}],
    "is_home_visit": true
  }'

# Получение статуса
curl http://localhost:3001/api/v1/groups/job_id/status
```
