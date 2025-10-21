#!/bin/bash
#
# Скрипт для обновления сайта на sweb.ru
# Использование: ./deploy-to-sweb.sh
#
# Этот скрипт запускается НА СЕРВЕРЕ sweb.ru после получения обновлений из Git
#

set -e  # Остановка при ошибке

echo "🚀 Начинаю обновление Uniform Factory..."
echo "================================================"

# Переменные
PROJECT_DIR="/var/www/uniform-factory"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

# Переход в директорию проекта
cd $PROJECT_DIR

# 1. Получение последних изменений из Git
echo "📥 Получение последних изменений..."
git pull origin main

# 2. Обновление Backend
echo ""
echo "🔧 Обновление Backend..."
cd $BACKEND_DIR

# Активация виртуального окружения
source venv/bin/activate

# Установка/обновление зависимостей
pip install -r requirements.txt --quiet

# Проверка базы данных
if [ ! -f "avik_uniform.db" ]; then
    echo "⚠️  База данных не найдена, инициализация..."
    python3 -c "from database_sqlite import init_sqlite_database; init_sqlite_database()"
fi

# Применение миграций (если есть)
echo "🔄 Проверка миграций..."
if [ -f "migrate_add_articles_to_products.py" ]; then
    echo "   Применение миграции: добавление артикулов товарам..."
    python3 migrate_add_articles_to_products.py
fi

# Перезапуск backend через supervisor
echo "🔄 Перезапуск Backend..."
sudo supervisorctl restart uniform-backend

# Проверка статуса
sleep 2
BACKEND_STATUS=$(sudo supervisorctl status uniform-backend | awk '{print $2}')
if [ "$BACKEND_STATUS" != "RUNNING" ]; then
    echo "❌ Backend не запустился! Проверьте логи:"
    echo "   tail -n 50 /var/log/uniform-backend.err.log"
    exit 1
fi
echo "✅ Backend перезапущен успешно"

# 3. Обновление Frontend
echo ""
echo "🎨 Обновление Frontend..."
cd $FRONTEND_DIR

# Установка/обновление зависимостей
npm install --quiet

# Сборка для продакшена
echo "📦 Сборка Frontend..."
npm run build

# Проверка сборки
if [ ! -d "build" ]; then
    echo "❌ Ошибка сборки Frontend!"
    exit 1
fi
echo "✅ Frontend собран успешно"

# 4. Установка правильных прав доступа
echo ""
echo "🔐 Настройка прав доступа..."
sudo chown -R www-data:www-data $FRONTEND_DIR/build
sudo chown -R www-data:www-data $BACKEND_DIR/uploads
sudo chmod -R 755 $FRONTEND_DIR/build
sudo chmod -R 755 $BACKEND_DIR/uploads

# 5. Перезапуск Nginx
echo ""
echo "🌐 Перезапуск Nginx..."
sudo nginx -t
sudo systemctl reload nginx
echo "✅ Nginx перезапущен успешно"

# 6. Создание бэкапа
echo ""
echo "💾 Создание бэкапа базы данных..."
BACKUP_DIR="/root/backups"
mkdir -p $BACKUP_DIR
DATE=$(date +%Y%m%d_%H%M%S)
cp $BACKEND_DIR/avik_uniform.db $BACKUP_DIR/db_$DATE.db
echo "✅ Бэкап создан: db_$DATE.db"

# 7. Проверка работы сайта
echo ""
echo "🔍 Проверка работы сайта..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost)
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Сайт работает (HTTP $HTTP_CODE)"
else
    echo "⚠️  Сайт вернул код $HTTP_CODE"
fi

# 8. Финал
echo ""
echo "================================================"
echo "✅ Обновление завершено успешно!"
echo ""
echo "📊 Статус сервисов:"
sudo supervisorctl status uniform-backend
sudo systemctl status nginx --no-pager | head -3
echo ""
echo "📝 Полезные команды:"
echo "   Логи Backend:  tail -f /var/log/uniform-backend.out.log"
echo "   Логи Nginx:    tail -f /var/log/nginx/error.log"
echo "   Перезапуск:    sudo supervisorctl restart uniform-backend"
echo ""
