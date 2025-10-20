# Инструкция по развертыванию Uniform Factory на sweb.ru

## Предварительные требования

### 1. Выбор тарифа на sweb.ru
Для вашего сайта (React + FastAPI + SQLite) рекомендуется:
- **VPS тариф** (от 300₽/мес) - полный контроль, можно запустить FastAPI
- Или **Hosting Premium** с поддержкой Python CGI (ограничения для FastAPI)

**Рекомендация**: VPS тариф для стабильной работы FastAPI

## Шаг 1: Экспорт кода с Emergent

### Вариант A: Через GitHub (рекомендуется)
1. В чате Emergent нажмите кнопку **"Save to GitHub"**
2. Если GitHub не подключен: Профиль → Connect GitHub
3. Выберите репозиторий или создайте новый
4. Код будет сохранен в GitHub

### Вариант B: Скачать файлы напрямую
1. Нажмите кнопку **"VS Code"** в интерфейсе
2. Скачайте все файлы проекта через File → Download

## Шаг 2: Подключение к VPS на sweb.ru

### 2.1 Получение доступа
После заказа VPS на sweb.ru вы получите:
- IP адрес сервера
- Root пароль
- SSH доступ

### 2.2 Подключение по SSH
```bash
ssh root@ваш-ip-адрес
# Введите пароль
```

## Шаг 3: Настройка сервера

### 3.1 Обновление системы
```bash
apt update && apt upgrade -y
```

### 3.2 Установка необходимых пакетов
```bash
# Python 3 и pip
apt install python3 python3-pip python3-venv -y

# Node.js и npm
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install nodejs -y

# Nginx (веб-сервер)
apt install nginx -y

# Supervisor (для автозапуска)
apt install supervisor -y

# Git
apt install git -y
```

## Шаг 4: Загрузка кода на сервер

### Вариант A: Из GitHub
```bash
cd /var/www
git clone https://github.com/ваш-username/ваш-репозиторий.git uniform-factory
cd uniform-factory
```

### Вариант B: Загрузка по SFTP
Используйте FileZilla или WinSCP:
- Host: ваш-ip-адрес
- Port: 22
- Username: root
- Password: ваш-пароль
- Загрузите файлы в `/var/www/uniform-factory`

## Шаг 5: Настройка Backend (FastAPI)

### 5.1 Создание виртуального окружения
```bash
cd /var/www/uniform-factory/backend
python3 -m venv venv
source venv/bin/activate
```

### 5.2 Установка зависимостей
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 5.3 Настройка .env файла
```bash
nano .env
```

Добавьте/измените:
```env
# Email настройки (Yandex SMTP)
SENDER_EMAIL=your-email@yandex.ru
EMAIL_PASSWORD=your-app-password
ADMIN_EMAIL=admin@uniformfactory.ru

# Для продакшена можно добавить
SECRET_KEY=ваш-секретный-ключ-для-jwt
ENVIRONMENT=production
```

Сохраните: `Ctrl+O`, `Enter`, `Ctrl+X`

### 5.4 Инициализация базы данных
```bash
# База данных SQLite создастся автоматически при первом запуске
# Но можно проверить:
python3 -c "from database_sqlite import init_sqlite_database; init_sqlite_database()"
```

### 5.5 Настройка Supervisor для автозапуска Backend
```bash
nano /etc/supervisor/conf.d/uniform-backend.conf
```

Добавьте:
```ini
[program:uniform-backend]
directory=/var/www/uniform-factory/backend
command=/var/www/uniform-factory/backend/venv/bin/uvicorn server:app --host 127.0.0.1 --port 8001
user=root
autostart=true
autorestart=true
stderr_logfile=/var/log/uniform-backend.err.log
stdout_logfile=/var/log/uniform-backend.out.log
```

Сохраните и перезапустите supervisor:
```bash
supervisorctl reread
supervisorctl update
supervisorctl start uniform-backend
supervisorctl status
```

## Шаг 6: Настройка Frontend (React)

### 6.1 Установка зависимостей
```bash
cd /var/www/uniform-factory/frontend
npm install
```

### 6.2 Настройка .env для продакшена
```bash
nano .env
```

Измените на ваш домен:
```env
REACT_APP_BACKEND_URL=https://ваш-домен.ru
```

### 6.3 Сборка для продакшена
```bash
npm run build
```

Это создаст папку `build` со статическими файлами

## Шаг 7: Настройка Nginx

### 7.1 Создание конфигурации
```bash
nano /etc/nginx/sites-available/uniform-factory
```

Добавьте:
```nginx
server {
    listen 80;
    server_name ваш-домен.ru www.ваш-домен.ru;

    # Frontend (React build)
    root /var/www/uniform-factory/frontend/build;
    index index.html;

    # Основная локация для React
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Проксирование API запросов к FastAPI
    location /api {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Статические файлы (загруженные изображения)
    location /uploads {
        alias /var/www/uniform-factory/backend/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Gzip сжатие
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;
    gzip_vary on;
}
```

### 7.2 Активация сайта
```bash
# Создать симлинк
ln -s /etc/nginx/sites-available/uniform-factory /etc/nginx/sites-enabled/

# Удалить дефолтный сайт
rm /etc/nginx/sites-enabled/default

# Проверить конфигурацию
nginx -t

# Перезапустить Nginx
systemctl restart nginx
```

## Шаг 8: Настройка домена на sweb.ru

### 8.1 В панели управления sweb.ru
1. Перейдите в раздел **"Домены"**
2. Добавьте ваш домен или используйте поддомен
3. Настройте DNS записи:
   - **A запись**: ваш-домен.ru → IP-адрес-VPS
   - **A запись**: www.ваш-домен.ru → IP-адрес-VPS

### 8.2 Ожидание распространения DNS
Подождите 1-24 часа для распространения DNS записей

## Шаг 9: Установка SSL сертификата (HTTPS)

### 9.1 Установка Certbot
```bash
apt install certbot python3-certbot-nginx -y
```

### 9.2 Получение SSL сертификата
```bash
certbot --nginx -d ваш-домен.ru -d www.ваш-домен.ru
```

Следуйте инструкциям:
- Введите email
- Согласитесь с условиями
- Выберите опцию редиректа HTTP → HTTPS (рекомендуется)

### 9.3 Автообновление сертификата
```bash
# Проверить автообновление
certbot renew --dry-run
```

Сертификат будет обновляться автоматически

## Шаг 10: Проверка работы сайта

### 10.1 Проверьте статус сервисов
```bash
# Backend
supervisorctl status uniform-backend

# Nginx
systemctl status nginx

# Логи backend
tail -f /var/log/uniform-backend.out.log

# Логи Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### 10.2 Откройте сайт в браузере
```
https://ваш-домен.ru
```

Проверьте:
- ✅ Главная страница загружается
- ✅ Изображения отображаются
- ✅ Каталог работает
- ✅ Формы отправляются
- ✅ Админ-панель доступна: https://ваш-домен.ru/admin

## Шаг 11: Настройка firewall (безопасность)

```bash
# Установка UFW
apt install ufw -y

# Разрешить SSH
ufw allow 22/tcp

# Разрешить HTTP и HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Включить firewall
ufw enable
ufw status
```

## Дополнительные настройки

### Настройка автоматических бэкапов
```bash
# Создать скрипт бэкапа
nano /root/backup.sh
```

Добавьте:
```bash
#!/bin/bash
BACKUP_DIR="/root/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Бэкап базы данных
cp /var/www/uniform-factory/backend/avik_uniform.db $BACKUP_DIR/db_$DATE.db

# Бэкап загруженных файлов
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /var/www/uniform-factory/backend/uploads

# Удалить старые бэкапы (старше 7 дней)
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $DATE"
```

Сделайте исполняемым:
```bash
chmod +x /root/backup.sh
```

Добавьте в cron (ежедневный бэкап в 3:00):
```bash
crontab -e
```

Добавьте строку:
```
0 3 * * * /root/backup.sh
```

### Мониторинг ресурсов
```bash
# Установка htop
apt install htop -y

# Запуск
htop
```

## Обновление сайта

Когда нужно обновить код:

```bash
# 1. Перейти в папку проекта
cd /var/www/uniform-factory

# 2. Получить обновления из GitHub
git pull

# 3. Обновить backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
supervisorctl restart uniform-backend

# 4. Обновить frontend
cd ../frontend
npm install
npm run build

# 5. Перезапустить Nginx
systemctl restart nginx
```

## Решение проблем

### Backend не запускается
```bash
# Проверить логи
tail -n 50 /var/log/uniform-backend.err.log

# Перезапустить
supervisorctl restart uniform-backend
```

### Frontend не отображается
```bash
# Проверить логи Nginx
tail -n 50 /var/log/nginx/error.log

# Проверить права доступа
chmod -R 755 /var/www/uniform-factory/frontend/build

# Перезапустить Nginx
systemctl restart nginx
```

### Изображения не загружаются
```bash
# Проверить права на папку uploads
chmod -R 755 /var/www/uniform-factory/backend/uploads

# Проверить путь в Nginx конфигурации
nano /etc/nginx/sites-available/uniform-factory
```

### SSL сертификат не работает
```bash
# Проверить сертификат
certbot certificates

# Обновить сертификат
certbot renew

# Проверить Nginx конфигурацию
nginx -t
```

## Полезные команды

```bash
# Просмотр всех процессов
ps aux | grep python
ps aux | grep nginx

# Использование диска
df -h

# Использование памяти
free -m

# Перезапуск всех сервисов
supervisorctl restart all
systemctl restart nginx
```

## Контакты поддержки sweb.ru

- Сайт: https://sweb.ru
- Телефон: 8 (800) 333-62-04
- Email: support@sweb.ru
- Документация: https://sweb.ru/help

## Стоимость хостинга на sweb.ru

**VPS тарифы (рекомендуется):**
- VPS-1: от 300₽/мес (1 ядро, 1GB RAM, 25GB SSD)
- VPS-2: от 600₽/мес (2 ядра, 2GB RAM, 50GB SSD)
- VPS-3: от 1200₽/мес (4 ядра, 4GB RAM, 100GB SSD)

Для вашего сайта достаточно VPS-1 или VPS-2.

---

## Чеклист после развертывания

- [ ] Сайт открывается по домену
- [ ] HTTPS работает (SSL сертификат установлен)
- [ ] Все страницы загружаются
- [ ] Изображения отображаются
- [ ] Формы отправляются (проверить email уведомления)
- [ ] Админ-панель работает (login: avik2024admin)
- [ ] Каталог товаров отображается
- [ ] Мобильная версия работает
- [ ] Настроены автоматические бэкапы
- [ ] Firewall настроен

Готово! Ваш сайт развернут на sweb.ru 🎉
