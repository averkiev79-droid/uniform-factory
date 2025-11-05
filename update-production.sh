#!/bin/bash
# Uniform Factory - Production Update Script
# Использование: ./update-production.sh

set -e  # Остановить выполнение при ошибке

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Uniform Factory - Production Update      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

# Переходим в директорию проекта
cd /var/www/uniform-factory

# Шаг 1: Создаем бэкап БД
echo -e "${YELLOW}[1/6] Создание бэкапа базы данных...${NC}"
BACKUP_FILE="backend/avik_uniform.db.backup_$(date +%Y%m%d_%H%M%S)"
cp backend/avik_uniform.db "$BACKUP_FILE"
echo -e "${GREEN}✓ Бэкап создан: $BACKUP_FILE${NC}"
echo ""

# Шаг 2: Получаем обновления из GitHub
echo -e "${YELLOW}[2/6] Получение обновлений из GitHub...${NC}"
git fetch origin
BEFORE=$(git rev-parse HEAD)
git pull origin main
AFTER=$(git rev-parse HEAD)

if [ "$BEFORE" = "$AFTER" ]; then
    echo -e "${BLUE}ℹ Нет новых изменений${NC}"
else
    echo -e "${GREEN}✓ Код обновлен${NC}"
    git log --oneline "$BEFORE".."$AFTER" | head -5
fi
echo ""

# Шаг 3: Обновляем backend
echo -e "${YELLOW}[3/6] Обновление backend...${NC}"
cd backend
source venv/bin/activate
pip install -r requirements.txt --quiet
echo -e "${GREEN}✓ Backend зависимости обновлены${NC}"
echo ""

# Шаг 4: Перезапускаем backend
echo -e "${YELLOW}[4/6] Перезапуск backend сервиса...${NC}"
sudo supervisorctl restart uniform-backend
sleep 2
STATUS=$(sudo supervisorctl status uniform-backend | awk '{print $2}')
if [ "$STATUS" = "RUNNING" ]; then
    echo -e "${GREEN}✓ Backend запущен${NC}"
else
    echo -e "${RED}✗ Ошибка запуска backend (статус: $STATUS)${NC}"
    echo -e "${RED}Проверьте логи: tail -f /var/log/uniform-backend.err.log${NC}"
    exit 1
fi
echo ""

# Шаг 5: Обновляем frontend
echo -e "${YELLOW}[5/6] Сборка frontend...${NC}"
cd ../frontend

# Проверяем наличие новых зависимостей
if [ -f "package.json" ]; then
    yarn install --silent 2>/dev/null || true
fi

# Собираем production build
yarn build
echo -e "${GREEN}✓ Frontend собран${NC}"
echo ""

# Шаг 6: Перезагружаем Nginx
echo -e "${YELLOW}[6/6] Перезагрузка Nginx...${NC}"
sudo systemctl reload nginx
if sudo systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✓ Nginx перезагружен${NC}"
else
    echo -e "${RED}✗ Ошибка Nginx${NC}"
    exit 1
fi
echo ""

# Итоговая информация
echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           ${GREEN}✓ Обновление завершено!${BLUE}          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Важно:${NC}"
echo -e "  1. Очистите кеш браузера (Ctrl+Shift+R)"
echo -e "  2. Проверьте сайт: https://uniformfactory.ru"
echo ""
echo -e "${BLUE}Полезные команды:${NC}"
echo -e "  • Backend логи: ${YELLOW}tail -f /var/log/uniform-backend.err.log${NC}"
echo -e "  • Nginx логи:   ${YELLOW}tail -f /var/log/nginx/error.log${NC}"
echo -e "  • Статус:       ${YELLOW}sudo supervisorctl status${NC}"
echo -e "  • Откат БД:     ${YELLOW}cp $BACKUP_FILE backend/avik_uniform.db${NC}"
echo ""
