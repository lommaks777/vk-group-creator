# Потоки работы системы

## Основной поток создания группы

### 1. Инициация (POST /oauth/init)

```mermaid
sequenceDiagram
    participant U as Пользователь
    participant F as Фронтенд
    participant S as Сервер
    participant R as Redis

    U->>F: Заполняет форму
    F->>S: POST /oauth/init (данные ученика)
    S->>R: Сохраняет данные с state
    S->>F: Возвращает auth_url
    F->>U: Перенаправляет на VK OAuth
```

**Данные сохраняются в Redis с TTL 10 минут:**
```json
{
  "key": "oauth:state:random_state",
  "value": {
    "name": "Иван Петров",
    "city": "Москва",
    "area": "Центральный",
    "phone": "+79000000000",
    "techniques": ["классический"],
    "pricing": [{"title": "Массаж 60 мин", "price": 2500}],
    "is_home_visit": true
  },
  "ttl": 600
}
```

### 2. OAuth Callback (GET /oauth/callback)

```mermaid
sequenceDiagram
    participant VK as VK OAuth
    participant S as Сервер
    participant R as Redis
    participant DB as База данных
    participant Q as Очередь

    VK->>S: GET /oauth/callback?code=xxx&state=xxx
    S->>R: Получает данные по state
    S->>VK: Обменивает code на access_token
    S->>DB: Сохраняет ученика с зашифрованным токеном
    S->>Q: Добавляет задачу создания группы
    S->>R: Удаляет state
    S->>VK: Возвращает success
```

**Шифрование токена:**
```typescript
const encryptedToken = encrypt(accessToken);
// Сохраняется в базе данных
```

### 3. Создание группы (Worker)

```mermaid
sequenceDiagram
    participant W as Worker
    participant VK as VK API
    participant T as Templates
    participant A as Assets
    participant Q as Очередь

    W->>VK: groups.create
    W->>VK: groups.edit
    W->>A: Генерирует аватар
    W->>VK: Загружает аватар
    W->>A: Генерирует обложку
    W->>VK: Загружает обложку
    W->>T: Генерирует посты
    W->>VK: Публикует 2 поста
    W->>Q: Планирует остальные посты
    W->>VK: board.addTopic (отзывы)
    W->>VK: groups.toggleMarket
    W->>VK: market.add (услуги)
    W->>VK: groups.setLongPollSettings
```

## Детальный процесс создания группы

### Шаг 1: Создание группы

```typescript
// 1. Создаем группу
const createResponse = await vk.groups.create({
  title: "Массаж • Москва • Иван Петров",
  type: "page",
  subtype: "company",
  public_category: 1, // Бизнес и услуги
  public_subcategory: 1 // Красота и здоровье
});

// 2. Редактируем группу
await vk.groups.edit({
  group_id: groupId,
  description: generatedDescription,
  website: `https://vk.com/club${groupId}`,
  wall: 1, // Открытая стена
  topics: 1, // Открытые обсуждения
  photos: 1, // Открытые фото
  market: 1, // Включен маркет
  messages: 1 // Включены сообщения
});
```

### Шаг 2: Загрузка изображений

```typescript
// Аватар
const avatarBuffer = await assetGenerator.generateAvatar(studentData);
const uploadServer = await vk.photos.getOwnerPhotoUploadServer();
const uploadResponse = await vk.client.uploadFile(uploadServer.upload_url, avatarBuffer);
await vk.photos.saveOwnerPhoto(uploadResponse);

// Обложка
const coverBuffer = await assetGenerator.generateCover(studentData);
const coverUploadServer = await vk.photos.getOwnerCoverPhotoUploadServer({ group_id: groupId });
const coverUploadResponse = await vk.client.uploadFile(coverUploadServer.upload_url, coverBuffer);
await vk.photos.saveOwnerCoverPhoto(coverUploadResponse);
```

### Шаг 3: Публикация постов

```typescript
const posts = TemplateEngine.generatePosts(studentData);

// Публикуем первые 2 поста сразу
const immediatePosts = posts.filter(p => p.publish_immediately);
for (const post of immediatePosts.slice(0, 2)) {
  await vk.wall.post({
    owner_id: -groupId,
    message: post.content,
    from_group: 1
  });
}

// Планируем остальные посты
const delayedPosts = posts.filter(p => !p.publish_immediately);
for (const post of delayedPosts) {
  const publishDate = Math.floor(Date.now() / 1000) + (post.delay_days * 24 * 60 * 60);
  await vk.wall.post({
    owner_id: -groupId,
    message: post.content,
    from_group: 1,
    publish_date: publishDate
  });
}
```

### Шаг 4: Настройка маркета

```typescript
// Включаем маркет
await vk.groups.toggleMarket({
  group_id: groupId,
  enabled: 1,
  currency: 1 // RUB
});

// Добавляем услуги
const marketItems = TemplateEngine.generateMarketItems(studentData);
for (const item of marketItems) {
  await vk.market.add({
    owner_id: -groupId,
    name: item.title,
    description: item.description,
    category_id: item.category_id,
    price: item.price,
    currency_id: 1
  });
}
```

### Шаг 5: Настройка автоответчика

```typescript
// Включаем Long Poll
await vk.groups.setLongPollSettings({
  group_id: groupId,
  enabled: 1,
  message_new: 1
});

// Добавляем callback сервер (если нужен)
await vk.groups.addCallbackServer({
  group_id: groupId,
  url: "https://your-domain.com/webhook",
  title: "Auto Responder"
});
```

## Обработка ошибок

### VK API ошибки

```typescript
// Flood control (код 9)
if (error.error_code === 9) {
  const delay = Math.pow(2, attempts) * 1000; // Экспоненциальная задержка
  await sleep(delay);
  return retry();
}

// Captcha (код 14)
if (error.error_code === 14) {
  // Для MVP просто логируем
  logger.warn('Captcha required:', error);
  throw new Error('Captcha required');
}

// Слишком много запросов (код 6)
if (error.error_code === 6) {
  await sleep(1000);
  return retry();
}
```

### Retry механизм

```typescript
async function withRetry<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxAttempts) throw error;
      
      const delay = Math.pow(2, attempt) * 1000;
      await sleep(delay);
    }
  }
}
```

## Мониторинг прогресса

### Обновление статуса

```typescript
// В worker'е
await job.updateProgress({
  step: 'creating_group',
  group_created: false,
  avatar_uploaded: false,
  // ...
});

// На фронтенде
const pollStatus = async () => {
  const response = await api.getGroupStatus(jobId);
  setStatus(response);
  
  if (response.status === 'completed') {
    onComplete(response.result);
  }
};

setInterval(pollStatus, 2000);
```

### Логирование

```typescript
// Структурированные логи
logger.info('Group creation started', {
  studentId,
  jobId,
  groupId: null
});

logger.info('Group created', {
  studentId,
  jobId,
  groupId: 123456789
});

logger.error('Group creation failed', {
  studentId,
  jobId,
  error: error.message,
  step: 'uploading_avatar'
});
```

## Безопасность

### Шифрование токенов

```typescript
// Шифрование
const encryptedToken = encrypt(accessToken);

// Расшифровка
const decryptedToken = decrypt(encryptedToken);
```

### Валидация данных

```typescript
// Валидация входящих данных
const schema = z.object({
  name: z.string().min(1).max(100),
  phone: z.string().regex(/^\+7\d{10}$/),
  city: z.string().min(1).max(50),
  // ...
});

const validatedData = schema.parse(requestBody);
```

### Rate Limiting

```typescript
// Ограничение на создание групп
const rateLimiter = new RateLimiter({
  keyGenerator: (req) => req.ip,
  points: 5, // 5 групп
  duration: 3600, // в час
});

// Ограничение на API запросы
const apiLimiter = new RateLimiter({
  keyGenerator: (req) => req.ip,
  points: 100, // 100 запросов
  duration: 60, // в минуту
});
```

## Интеграция с GetCourse

### Встраивание в страницу курса

```html
<!-- В GetCourse -->
<iframe 
  src="https://your-domain.com/create?student_id=123&course_id=456"
  width="100%" 
  height="600px"
  frameborder="0">
</iframe>
```

### Передача данных

```typescript
// Получение данных из GetCourse
const studentData = {
  name: getCourseStudent.name,
  city: getCourseStudent.city,
  area: getCourseStudent.area,
  phone: getCourseStudent.phone,
  // ... остальные поля
};

// Создание группы
const response = await apiClient.initGroupCreation(studentData);
```

## Масштабирование

### Горизонтальное масштабирование

```yaml
# docker-compose.yml
services:
  server:
    deploy:
      replicas: 3
    environment:
      - REDIS_URL=redis://redis-cluster:6379
      - DATABASE_URL=postgresql://postgres:password@postgres-cluster:5432/db
```

### Кэширование

```typescript
// Кэширование шаблонов
const templateCache = new Map();

const getTemplate = (type: string) => {
  if (templateCache.has(type)) {
    return templateCache.get(type);
  }
  
  const template = loadTemplate(type);
  templateCache.set(type, template);
  return template;
};
```

### Мониторинг

```typescript
// Метрики
const metrics = {
  groupsCreated: 0,
  groupsFailed: 0,
  averageCreationTime: 0,
  vkApiErrors: 0
};

// Экспорт метрик для Prometheus
app.get('/metrics', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send(`
    groups_created_total ${metrics.groupsCreated}
    groups_failed_total ${metrics.groupsFailed}
    group_creation_duration_seconds ${metrics.averageCreationTime}
    vk_api_errors_total ${metrics.vkApiErrors}
  `);
});
```
