# API Контракты для AVIK Uniform Factory

## Обзор

Данный документ описывает API контракты для интеграции frontend и backend приложения AVIK Uniform Factory.

## Mock данные, которые нужно заменить на backend

### 1. Категории продукции (mock.js - productCategories)
- **Endpoint**: `GET /api/categories`
- **Модель**: ProductCategory
- **Поля**: id, title, description, image, productsCount, slug

### 2. Портфолио проектов (mock.js - portfolioItems)
- **Endpoint**: `GET /api/portfolio`
- **Модель**: PortfolioItem
- **Поля**: id, company, description, image, category, itemsCount, year

### 3. Отзывы клиентов (mock.js - testimonials)
- **Endpoint**: `GET /api/testimonials`
- **Модель**: Testimonial
- **Поля**: id, company, text, author, position, rating

### 4. Статистика (mock.js - stats)
- **Endpoint**: `GET /api/stats`
- **Модель**: Statistics
- **Поля**: yearsInBusiness, completedOrders, happyClients, cities

## API Endpoints для реализации

### 1. Калькулятор стоимости

#### POST /api/calculator/estimate
**Описание**: Расчет предварительной стоимости заказа
**Body**:
```json
{
  "category": "shirts",
  "quantity": "51-100",
  "fabric": "cotton",
  "branding": "embroidery"
}
```
**Response**:
```json
{
  "estimatedPrice": 1350,
  "breakdown": {
    "basePrice": 1200,
    "fabricMultiplier": 1.0,
    "quantityMultiplier": 1.1,
    "brandingPrice": 150
  }
}
```

#### POST /api/calculator/quote-request
**Описание**: Отправка заявки на точный расчет
**Body**:
```json
{
  "name": "Иван Иванов",
  "email": "ivan@company.ru",
  "phone": "+7 (999) 123-45-67",
  "company": "ООО Компания",
  "category": "shirts",
  "quantity": "51-100",
  "fabric": "cotton",
  "branding": "embroidery",
  "estimatedPrice": 1350
}
```
**Response**:
```json
{
  "success": true,
  "requestId": "REQ-2024-001",
  "message": "Заявка принята. Мы свяжемся с вами в течение 2 часов."
}
```

### 2. Обратная связь

#### POST /api/contact/callback-request
**Описание**: Заявка на обратный звонок
**Body**:
```json
{
  "name": "Иван Иванов",
  "phone": "+7 (999) 123-45-67"
}
```

#### POST /api/contact/consultation
**Описание**: Запрос консультации
**Body**:
```json
{
  "name": "Иван Иванов",
  "email": "ivan@company.ru",
  "phone": "+7 (999) 123-45-67",
  "company": "ООО Компания",
  "message": "Нужна консультация по корпоративной одежде"
}
```

### 3. Портфолио

#### GET /api/portfolio?category={category}
**Описание**: Получение портфолио с фильтрацией по категории
**Parameters**: category (optional) - фильтр по категории

#### GET /api/portfolio/{id}
**Описание**: Детальная информация о проекте

### 4. Каталог

#### GET /api/categories
**Описание**: Получение списка категорий продукции

#### GET /api/categories/{slug}
**Описание**: Детальная информация о категории

#### GET /api/products?category={slug}&page={page}&limit={limit}
**Описание**: Получение списка продуктов в категории

## Модели данных MongoDB

### ProductCategory
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  image: String,
  productsCount: Number,
  slug: String,
  createdAt: Date,
  updatedAt: Date
}
```

### PortfolioItem
```javascript
{
  _id: ObjectId,
  company: String,
  description: String,
  image: String,
  category: String,
  itemsCount: Number,
  year: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### QuoteRequest
```javascript
{
  _id: ObjectId,
  requestId: String, // Уникальный номер заявки
  name: String,
  email: String,
  phone: String,
  company: String,
  category: String,
  quantity: String,
  fabric: String,
  branding: String,
  estimatedPrice: Number,
  status: String, // new, in_progress, completed
  createdAt: Date,
  updatedAt: Date
}
```

### ContactRequest
```javascript
{
  _id: ObjectId,
  type: String, // callback, consultation
  name: String,
  email: String,
  phone: String,
  company: String,
  message: String,
  status: String, // new, contacted, completed
  createdAt: Date,
  updatedAt: Date
}
```

### Statistics
```javascript
{
  _id: ObjectId,
  yearsInBusiness: Number,
  completedOrders: Number,
  happyClients: Number,
  cities: Number,
  updatedAt: Date
}
```

## Интеграция с frontend

### Замена mock данных
1. **productCategories** → API call to `/api/categories`
2. **portfolioItems** → API call to `/api/portfolio`
3. **testimonials** → API call to `/api/testimonials`
4. **stats** → API call to `/api/stats`
5. **calculatorOptions** → может остаться статичным или вынести в `/api/calculator/options`

### Обработка форм
1. **Calculator form** → POST to `/api/calculator/quote-request`
2. **Contact forms** → POST to `/api/contact/callback-request` или `/api/contact/consultation`
3. **Header CTA buttons** → Скролл к форме или открытие модального окна

### Error handling
- Показывать пользовательские сообщения об ошибках
- Fallback на mock данные в случае недоступности API
- Loading состояния для всех запросов

## Приоритет реализации

1. **Высокий приоритет**:
   - POST /api/calculator/quote-request
   - POST /api/contact/callback-request
   - GET /api/categories
   - GET /api/portfolio

2. **Средний приоритет**:
   - GET /api/testimonials
   - GET /api/stats
   - POST /api/contact/consultation

3. **Низкий приоритет**:
   - Детальные страницы категорий и проектов
   - Административная панель для управления контентом