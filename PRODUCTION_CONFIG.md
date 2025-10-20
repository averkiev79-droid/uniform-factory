# Настройки для продакшена

## Файлы для редактирования перед развертыванием на sweb.ru

### 1. Backend .env файл
**Файл:** `/backend/.env`

```env
# Email настройки (замените на свои)
SENDER_EMAIL=your-email@yandex.ru
EMAIL_PASSWORD=your-yandex-app-password
ADMIN_EMAIL=admin@uniformfactory.ru

# Настройки для продакшена
ENVIRONMENT=production
SECRET_KEY=ваш-случайный-секретный-ключ-минимум-32-символа

# Опционально: если используете PostgreSQL вместо SQLite
# DATABASE_URL=postgresql://user:password@localhost/uniform_factory
```

**Как получить Yandex App Password:**
1. Зайдите на https://passport.yandex.ru/
2. Безопасность → Пароли приложений
3. Создайте новый пароль для "Почта"
4. Используйте этот пароль в EMAIL_PASSWORD

**Генерация SECRET_KEY:**
```python
import secrets
print(secrets.token_urlsafe(32))
```

---

### 2. Frontend .env файл
**Файл:** `/frontend/.env`

**Для разработки (Emergent):**
```env
REACT_APP_BACKEND_URL=https://apparel-platform-2.preview.emergentagent.com
WDS_SOCKET_PORT=443
```

**Для продакшена (sweb.ru):**
```env
REACT_APP_BACKEND_URL=https://ваш-домен.ru
```

⚠️ **ВАЖНО:** Не забудьте изменить `ваш-домен.ru` на ваш реальный домен!

---

### 3. Nginx конфигурация
**Файл:** `/etc/nginx/sites-available/uniform-factory`

```nginx
server {
    listen 80;
    server_name ваш-домен.ru www.ваш-домен.ru;  # ← ИЗМЕНИТЬ!

    # Frontend
    root /var/www/uniform-factory/frontend/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API
    location /api {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploads
    location /uploads {
        alias /var/www/uniform-factory/backend/uploads;
        expires 30d;
    }

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
}
```

---

### 4. Supervisor конфигурация
**Файл:** `/etc/supervisor/conf.d/uniform-backend.conf`

```ini
[program:uniform-backend]
directory=/var/www/uniform-factory/backend
command=/var/www/uniform-factory/backend/venv/bin/uvicorn server:app --host 127.0.0.1 --port 8001
user=www-data  # ← Рекомендуется вместо root
autostart=true
autorestart=true
stderr_logfile=/var/log/uniform-backend.err.log
stdout_logfile=/var/log/uniform-backend.out.log
environment=ENVIRONMENT="production"
```

---

## Проверка настроек перед запуском

### Checklist Backend
```bash
cd /var/www/uniform-factory/backend

# Проверить .env файл
cat .env | grep -v PASSWORD

# Проверить зависимости
source venv/bin/activate
pip list | grep fastapi
pip list | grep uvicorn
pip list | grep sqlalchemy

# Проверить базу данных
python3 -c "from database_sqlite import init_sqlite_database; init_sqlite_database(); print('✅ DB OK')"

# Тестовый запуск
uvicorn server:app --host 127.0.0.1 --port 8001
# Ctrl+C для остановки
```

### Checklist Frontend
```bash
cd /var/www/uniform-factory/frontend

# Проверить .env файл
cat .env

# Проверить зависимости
npm list react
npm list react-router-dom

# Тестовая сборка
npm run build

# Проверить результат
ls -lh build/
```

### Checklist Nginx
```bash
# Проверить конфигурацию
sudo nginx -t

# Проверить домен в конфиге
grep server_name /etc/nginx/sites-available/uniform-factory

# Перезапуск
sudo systemctl restart nginx
sudo systemctl status nginx
```

---

## Безопасность для продакшена

### 1. Изменить пароль админ-панели
**Файл:** `/backend/admin_routes.py`

```python
# ИЗМЕНИТЬ ЭТО!
ADMIN_PASSWORD = "avik2024admin"  

# На что-то вроде:
ADMIN_PASSWORD = "ваш-сложный-пароль-2025"
```

**Или еще лучше - использовать хеширование:**
```python
from passlib.hash import bcrypt

# Сгенерировать хеш (запустить один раз)
password = "ваш-сложный-пароль"
ADMIN_PASSWORD_HASH = bcrypt.hash(password)
print(ADMIN_PASSWORD_HASH)

# В коде использовать:
if bcrypt.verify(request.password, ADMIN_PASSWORD_HASH):
    return {"success": True, "token": "admin-authenticated"}
```

### 2. Ограничить доступ к админ-панели по IP
**В Nginx добавить:**
```nginx
location /admin {
    # Разрешить только с вашего IP
    allow 123.456.789.0;  # ← Ваш IP
    deny all;
    
    try_files $uri $uri/ /index.html;
}
```

### 3. Настроить firewall
```bash
# Установить UFW
sudo apt install ufw -y

# Разрешить только нужные порты
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS

# Включить
sudo ufw enable
```

---

## Оптимизация для продакшена

### 1. Кеширование статики в Nginx
```nginx
# В location / добавить:
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 365d;
    add_header Cache-Control "public, immutable";
}
```

### 2. Сжатие файлов
```nginx
# Gzip настройки
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript 
           application/x-javascript application/xml+rss 
           application/json image/svg+xml;
```

### 3. Rate limiting для API
```nginx
# В http блок добавить:
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

# В location /api добавить:
limit_req zone=api_limit burst=20 nodelay;
```

---

## Мониторинг

### 1. Логи для отслеживания
```bash
# Backend логи
tail -f /var/log/uniform-backend.out.log
tail -f /var/log/uniform-backend.err.log

# Nginx логи
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# System логи
journalctl -u nginx -f
journalctl -u supervisor -f
```

### 2. Мониторинг ресурсов
```bash
# CPU и память
htop

# Дисковое пространство
df -h

# Сетевые соединения
netstat -tlnp
```

### 3. Проверка доступности
Создайте простой скрипт мониторинга:

**Файл:** `/root/check-site.sh`
```bash
#!/bin/bash
URL="https://ваш-домен.ru"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $URL)

if [ "$HTTP_CODE" != "200" ]; then
    echo "⚠️ Сайт недоступен! HTTP код: $HTTP_CODE"
    # Отправить уведомление (настроить)
    # curl -X POST https://api.telegram.org/bot<TOKEN>/sendMessage \
    #   -d chat_id=<CHAT_ID> \
    #   -d text="Сайт $URL недоступен!"
else
    echo "✅ Сайт работает"
fi
```

Добавить в crontab (проверка каждые 5 минут):
```bash
crontab -e
# Добавить:
*/5 * * * * /root/check-site.sh
```

---

## Переменные окружения - Итоговая версия

### Backend (.env)
```env
# Email (Yandex SMTP)
SENDER_EMAIL=your-email@yandex.ru
EMAIL_PASSWORD=your-app-password
ADMIN_EMAIL=admin@uniformfactory.ru

# Безопасность
ENVIRONMENT=production
SECRET_KEY=ваш-секретный-ключ-32-символа-минимум
ADMIN_PASSWORD_HASH=$2b$12$...hash...

# База данных (SQLite по умолчанию)
DATABASE_URL=sqlite:///avik_uniform.db

# Опционально
DEBUG=false
LOG_LEVEL=INFO
```

### Frontend (.env)
```env
# API URL - ВАЖНО!
REACT_APP_BACKEND_URL=https://ваш-домен.ru

# Опционально
REACT_APP_ENVIRONMENT=production
GENERATE_SOURCEMAP=false
```

---

## Финальная проверка перед запуском

```bash
# 1. Проверить все сервисы
sudo supervisorctl status
sudo systemctl status nginx

# 2. Проверить порты
sudo netstat -tlnp | grep 8001  # Backend
sudo netstat -tlnp | grep 80    # Nginx

# 3. Проверить логи на ошибки
sudo tail -n 100 /var/log/uniform-backend.err.log | grep ERROR
sudo tail -n 100 /var/log/nginx/error.log

# 4. Тест с localhost
curl http://localhost/
curl http://localhost/api/health

# 5. Тест с домена
curl https://ваш-домен.ru/
curl https://ваш-домен.ru/api/health
```

Если все 5 проверок прошли успешно ✅ - сайт готов к работе!

---

## Контакты и поддержка

**Техническая поддержка sweb.ru:**
- 📞 8 (800) 333-62-04
- 📧 support@sweb.ru
- 💬 Онлайн-чат на сайте

**Документация:**
- sweb.ru - https://sweb.ru/help
- Nginx - https://nginx.org/ru/docs/
- FastAPI - https://fastapi.tiangolo.com/
- React - https://react.dev/

---

Готово! Следуйте этому гайду и ваш сайт будет работать стабильно на продакшене 🚀
