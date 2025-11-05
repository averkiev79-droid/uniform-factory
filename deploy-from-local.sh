#!/bin/bash
# Uniform Factory - Deploy from Local Machine
# Использование: ./deploy-from-local.sh

set -e

# Конфигурация
SERVER_IP="80.93.62.160"
SERVER_USER="root"
SERVER_PATH="/var/www/uniform-factory"

# Цвета
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Uniform Factory - Deploy to Production   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

# Шаг 1: Проверка подключения к серверу
echo -e "${YELLOW}[1/3] Проверка подключения к серверу...${NC}"
if ssh -o ConnectTimeout=5 -o BatchMode=yes $SERVER_USER@$SERVER_IP "echo 2>&1" >/dev/null 2>&1; then
    echo -e "${GREEN}✓ Подключение успешно${NC}"
else
    echo -e "${RED}✗ Не удалось подключиться к серверу${NC}"
    echo -e "${YELLOW}Попробуйте подключиться с паролем:${NC}"
    echo -e "  ssh $SERVER_USER@$SERVER_IP"
    exit 1
fi
echo ""

# Шаг 2: Копируем скрипт обновления на сервер
echo -e "${YELLOW}[2/3] Копирование скрипта обновления на сервер...${NC}"
scp update-production.sh $SERVER_USER@$SERVER_IP:$SERVER_PATH/
echo -e "${GREEN}✓ Скрипт скопирован${NC}"
echo ""

# Шаг 3: Запускаем обновление на сервере
echo -e "${YELLOW}[3/3] Запуск обновления на production сервере...${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && chmod +x update-production.sh && ./update-production.sh"
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo ""

echo -e "${GREEN}✓ Деплой завершен!${NC}"
echo -e ""
echo -e "${YELLOW}Проверьте сайт:${NC} https://uniformfactory.ru"
echo -e "${YELLOW}Не забудьте очистить кеш браузера!${NC} (Ctrl+Shift+R)"
echo ""
