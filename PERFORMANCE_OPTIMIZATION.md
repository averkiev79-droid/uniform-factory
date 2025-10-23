# Оптимизация производительности uniformfactory.ru

## ✅ Реализованные оптимизации

### 1. API Кэширование (5 минут)
- Кэшируются: categories, settings, statistics
- TTL: 5 минут
- Fallback на устаревший кэш при ошибках сети

### 2. Ленивая загрузка изображений
- Компонент LazyImage с IntersectionObserver
- Загрузка за 50px до видимости
- Placeholder во время загрузки

### 3. Увеличен timeout API
- С 10 секунд до 15 секунд
- Для медленных соединений

## 🚀 Дополнительные рекомендации для production

### 1. Оптимизация изображений
```bash
# Установить sharp для оптимизации
npm install sharp --save

# Конвертировать в WebP (меньше размер)
# Создать разные размеры (responsive images)
```

### 2. Production build
```bash
cd /app/frontend
yarn build

# Результат в build/ - статические файлы
# Можно отдавать через nginx с gzip/brotli сжатием
```

### 3. Nginx кэширование (для production сервера)
```nginx
# Кэширование статических файлов
location ~* \.(jpg|jpeg|png|gif|ico|css|js|webp)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Сжатие
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
```

### 4. CDN для статики
- Использовать CDN (Cloudflare, AWS CloudFront)
- Кэширование изображений на CDN edge серверах

### 5. Оптимизация базы данных
```sql
-- Создать индексы для частых запросов
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_available ON products(is_available);
```

### 6. React оптимизации
- Использовать React.memo для компонентов
- useMemo/useCallback для тяжелых вычислений
- Code splitting с React.lazy()

### 7. Минимизация API запросов
- Комбинировать запросы (например, settings + statistics в один endpoint)
- Использовать pagination для списков товаров

## 📊 Проверка производительности

### Lighthouse (Chrome DevTools)
```
1. Открыть Chrome DevTools (F12)
2. Вкладка "Lighthouse"
3. Запустить аудит производительности
```

### WebPageTest
```
https://www.webpagetest.org/
Тестировать: uniformfactory.ru
```

## 🔧 Быстрые исправления

### 1. Уменьшить размер изображений
```bash
# Оптимизировать все JPG
find /app/frontend/public/images -name "*.jpg" -exec jpegoptim --max=85 {} \;

# Конвертировать в WebP
find /app/frontend/public/images -name "*.jpg" -exec cwebp -q 85 {} -o {}.webp \;
```

### 2. Отложенная загрузка неважных скриптов
```html
<!-- В index.html -->
<script defer src="..."></script>
```

### 3. Prefetch для важных ресурсов
```html
<link rel="prefetch" href="/api/categories">
```

## 📝 Мониторинг

### Метрики для отслеживания:
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms  
- **CLS (Cumulative Layout Shift)**: < 0.1
- **Time to First Byte (TTFB)**: < 600ms

### Инструменты:
- Google Analytics
- Yandex.Metrica (уже интегрирована)
- Google Search Console
