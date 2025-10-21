# Инструкция по применению обновлений на uniformfactory.ru

## Проблема
На production сайте (uniformfactory.ru) не отображаются артикулы товаров и не работает поиск, хотя на preview домене всё работает.

## Причина
У preview и production разные базы данных. Изменения были применены только на preview.

## Решение: Обновление production

### Шаг 1: Подключитесь к серверу sweb.ru

```bash
ssh root@ваш-ip-адрес
cd /var/www/uniform-factory
```

### Шаг 2: Получите последние изменения кода

```bash
# Создайте бэкап текущей базы данных
cp backend/avik_uniform.db backend/avik_uniform.db.backup_$(date +%Y%m%d_%H%M%S)

# Получите обновления из GitHub
git pull origin main
```

### Шаг 3: Обновите backend зависимости

```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

### Шаг 4: Примените миграцию базы данных

```bash
# Запустите скрипт миграции для добавления артикулов
python3 migrate_add_articles_to_products.py
```

Вы увидите вывод типа:
```
=== Starting article migration ===

Total products in database: 176
Products with articles: 173
Products without articles: 3

✓ Updated manual product: 'Яркая промо-футболка' → PT-701
✓ Updated manual product: 'Медицинский костюм премиум' → MC-801
✓ Updated manual product: 'Рабочий костюм усиленный' → WS-901

✅ Successfully updated 3 products with article numbers

=== Migration completed successfully! ===
```

### Шаг 5: Перезапустите backend

```bash
cd /var/www/uniform-factory/backend
sudo supervisorctl restart uniform-backend
```

### Шаг 6: Обновите frontend

```bash
cd /var/www/uniform-factory/frontend
npm install  # если есть новые зависимости
npm run build
```

### Шаг 7: Очистите кеш Nginx и перезапустите

```bash
sudo systemctl reload nginx
```

### Шаг 8: Проверьте работу

Откройте в браузере (с очисткой кеша Ctrl+Shift+R):

1. **Проверка артикулов:**
   ```
   https://uniformfactory.ru/product/d45fa9ae-5b58-4453-a270-43cfd54074a9
   ```
   Должен отображаться: "Артикул: 2.03B"

2. **Проверка поиска:**
   - Нажмите иконку поиска в header
   - Введите "блуза" - должны найтись товары
   - Введите "2.03B" - должен найтись конкретный товар

## Изменения в коде

### 1. Исправлен поиск (services_sqlite.py)
**Проблема:** ILIKE в SQLite не работает с кириллицей
**Решение:** Использование `func.upper().like()` для регистронезависимого поиска

### 2. Добавлено поле article (services_sqlite.py)
**Проблема:** Метод `get_product_by_id` не возвращал поле `article`
**Решение:** Добавлено `"article": product.article` в ответ API

### 3. Добавлены артикулы в базу данных
**Проблема:** У товаров не было артикулов
**Решение:** Скрипт миграции `migrate_add_articles_to_products.py`

## Быстрая команда (всё в одной строке)

```bash
cd /var/www/uniform-factory && \
cp backend/avik_uniform.db backend/avik_uniform.db.backup_$(date +%Y%m%d_%H%M%S) && \
git pull origin main && \
cd backend && source venv/bin/activate && \
pip install -r requirements.txt && \
python3 migrate_add_articles_to_products.py && \
sudo supervisorctl restart uniform-backend && \
cd ../frontend && npm run build && \
sudo systemctl reload nginx && \
echo "✅ Update completed! Clear browser cache and test."
```

## Проверка API напрямую

```bash
# Проверить поиск
curl "https://uniformfactory.ru/api/products/search?q=блуза&limit=3"

# Проверить конкретный товар
curl "https://uniformfactory.ru/api/products/d45fa9ae-5b58-4453-a270-43cfd54074a9"
```

## Откат при проблемах

Если что-то пошло не так:

```bash
cd /var/www/uniform-factory/backend

# Восстановите бэкап базы данных
cp avik_uniform.db.backup_YYYYMMDD_HHMMSS avik_uniform.db

# Перезапустите backend
sudo supervisorctl restart uniform-backend
```

## Важные заметки

1. **Очистка кеша браузера обязательна!** (Ctrl+Shift+R или Cmd+Shift+R)
2. Миграция безопасна - можно запускать несколько раз
3. Скрипт автоматически создаёт бэкап перед изменениями
4. Если импортируете товары из aviktime.ru заново, артикулы сохранятся

## Автоматизация будущих обновлений

Создайте файл `/var/www/uniform-factory/update.sh`:

```bash
#!/bin/bash
set -e

echo "=== Uniform Factory Update Script ==="
echo ""

# Backup
echo "1. Creating backup..."
cp backend/avik_uniform.db backend/avik_uniform.db.backup_$(date +%Y%m%d_%H%M%S)

# Pull code
echo "2. Pulling latest code..."
git pull origin main

# Update backend
echo "3. Updating backend..."
cd backend
source venv/bin/activate
pip install -r requirements.txt
sudo supervisorctl restart uniform-backend

# Update frontend
echo "4. Updating frontend..."
cd ../frontend
npm install
npm run build

# Reload nginx
echo "5. Reloading nginx..."
sudo systemctl reload nginx

echo ""
echo "✅ Update completed successfully!"
echo "Remember to clear browser cache (Ctrl+Shift+R)"
```

Сделайте исполняемым:
```bash
chmod +x /var/www/uniform-factory/update.sh
```

Теперь для обновлений просто запускайте:
```bash
cd /var/www/uniform-factory
./update.sh
```

---

## Контакты

Если возникли проблемы:
- Проверьте логи: `tail -f /var/log/uniform-backend.err.log`
- Проверьте статус: `sudo supervisorctl status`
- Напишите мне с текстом ошибки
