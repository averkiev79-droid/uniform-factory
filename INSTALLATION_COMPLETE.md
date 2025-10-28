# 🎊 Uniform Factory - Успешная установка на VPS Sweb.ru

## ✅ УСТАНОВКА ЗАВЕРШЕНА: 28 октября 2025

---

## 🖥️ ИНФОРМАЦИЯ О СЕРВЕРЕ

**VPS Sweb.ru:**
- IP: 80.93.62.160
- ОС: Ubuntu 24.04 LTS
- CPU: 2 ядра
- RAM: 2 GB
- Диск: 10 GB NVMe

**SSH Доступ:**
```
ssh root@80.93.62.160
Пароль: F4d83ijkaXtn#5zw
```

---

## 🌐 ДОСТУП К САЙТУ

**Основные URL:**
- **Главная страница:** http://80.93.62.160
- **Каталог:** http://80.93.62.160/catalog
- **Админ-панель:** http://80.93.62.160/admin
  - Пароль: `avik2024admin`
- **API Health:** http://80.93.62.160/api/health

**Email для уведомлений:** alaver79@yandex.ru  
**Telegram уведомления:** Настроены и работают

---

## ✅ ЧТО РАБОТАЕТ

### Frontend (React)
- ✅ Полноценный React frontend собран и работает
- ✅ Каталог товаров (176 товаров)
- ✅ Корзина с функционалом заказа
- ✅ Админ-панель для управления
- ✅ Все страницы: Главная, Каталог, О компании, Контакты
- ✅ Адаптивный дизайн (мобильная версия)
- ✅ SEO оптимизация (robots.txt, sitemap.xml)

### Backend (FastAPI + Python)
- ✅ API запущен и работает на порту 8001
- ✅ База данных SQLite (176 товаров)
- ✅ Все эндпоинты работают
- ✅ Email уведомления (через Yandex SMTP)
- ✅ Telegram уведомления
- ✅ Автозапуск через Supervisor

### Инфраструктура
- ✅ Nginx настроен и работает
- ✅ Supervisor обеспечивает автозапуск backend
- ✅ Автоматический перезапуск при сбоях
- ✅ Логирование всех процессов

---

## 📋 ПОЛЕЗНЫЕ КОМАНДЫ

### Проверка статуса
```bash
# Статус backend
supervisorctl status uniform-backend

# Статус Nginx
systemctl status nginx

# Проверка сайта
curl http://localhost

# Проверка API
curl http://localhost/api/health
```

### Логи
```bash
# Логи backend (вывод)
tail -f /var/log/uniform-backend.out.log

# Логи backend (ошибки)
tail -f /var/log/uniform-backend.err.log

# Логи Nginx
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

### Управление сервисами
```bash
# Перезапуск backend
supervisorctl restart uniform-backend

# Перезапуск Nginx
systemctl restart nginx

# Перезапуск всех сервисов
supervisorctl restart all
systemctl restart nginx
```

### Обновление кода
```bash
cd /var/www/uniform-factory
git pull origin main
supervisorctl restart uniform-backend
```

---

## 🔄 КАК ОБНОВЛЯТЬ САЙТ

### Когда разработка на Emergent завершена:

**Шаг 1: Сохранить в GitHub**
- В Emergent нажмите "Save to GitHub"

**Шаг 2: На сервере выполнить**
```bash
ssh root@80.93.62.160
cd /var/www/uniform-factory
git pull origin main
```

**Шаг 3: Если изменения в backend**
```bash
cd /var/www/uniform-factory/backend
source venv/bin/activate
pip install -r requirements.txt
deactivate
supervisorctl restart uniform-backend
```

**Шаг 4: Если изменения в frontend**
```bash
cd /var/www/uniform-factory/frontend
yarn install
yarn build
chmod -R 755 build
chown -R www-data:www-data build
systemctl restart nginx
```

**Шаг 5: Проверка**
- Откройте http://80.93.62.160
- Проверьте что всё работает

---

## 🚨 РЕШЕНИЕ ПРОБЛЕМ

### Проблема: Backend не работает

**Диагностика:**
```bash
supervisorctl status uniform-backend
tail -50 /var/log/uniform-backend.err.log
```

**Решение:**
```bash
supervisorctl restart uniform-backend
```

### Проблема: Frontend не загружается

**Диагностика:**
```bash
ls -la /var/www/uniform-factory/frontend/build/
tail -50 /var/log/nginx/error.log
```

**Решение:**
```bash
chmod -R 755 /var/www/uniform-factory/frontend/build
chown -R www-data:www-data /var/www/uniform-factory/frontend/build
systemctl restart nginx
```

### Проблема: API не отвечает

**Проверка:**
```bash
curl http://localhost:8001/api/health
netstat -tlnp | grep 8001
```

**Решение:**
```bash
supervisorctl restart uniform-backend
sleep 3
curl http://localhost/api/health
```

### Проблема: Пропало главное изображение

```bash
cd /var/www/uniform-factory/backend
python3 fix_hero_image.py
supervisorctl restart uniform-backend
```

---

## 🔐 ВАЖНЫЕ ФАЙЛЫ КОНФИГУРАЦИИ

### Backend .env
```
/var/www/uniform-factory/backend/.env
```

Содержит:
- SENDER_EMAIL
- EMAIL_PASSWORD
- ADMIN_EMAIL
- TELEGRAM_BOT_TOKEN
- TELEGRAM_CHAT_ID

### Frontend .env
```
/var/www/uniform-factory/frontend/.env
```

Содержит:
- REACT_APP_BACKEND_URL=http://80.93.62.160

### Nginx конфигурация
```
/etc/nginx/sites-available/uniform-factory
```

### Supervisor конфигурация
```
/etc/supervisor/conf.d/uniform-backend.conf
```

---

## 💾 БЭКАПЫ

### Создание бэкапа базы данных
```bash
DATE=$(date +%Y%m%d_%H%M%S)
cp /var/www/uniform-factory/backend/avik_uniform.db /root/backups/db_$DATE.db
echo "Бэкап создан: db_$DATE.db"
```

### Восстановление из бэкапа
```bash
# Остановить backend
supervisorctl stop uniform-backend

# Восстановить БД
cp /root/backups/db_ДАТА.db /var/www/uniform-factory/backend/avik_uniform.db

# Запустить backend
supervisorctl start uniform-backend
```

### Автоматический бэкап (рекомендуется)
```bash
# Создать скрипт автобэкапа
cat > /root/backup-db.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d)
mkdir -p /root/backups
cp /var/www/uniform-factory/backend/avik_uniform.db /root/backups/db_$DATE.db
# Удалить бэкапы старше 30 дней
find /root/backups -name "db_*.db" -mtime +30 -delete
EOF

chmod +x /root/backup-db.sh

# Добавить в cron (ежедневно в 3:00)
(crontab -l 2>/dev/null; echo "0 3 * * * /root/backup-db.sh") | crontab -
```

---

## 🌍 НАСТРОЙКА ДОМЕНА (следующий шаг)

Когда захотите подключить домен uniformfactory.ru:

### 1. DNS настройки
В панели управления доменом добавьте A-запись:
```
@ (или uniformfactory.ru) → 80.93.62.160
```

### 2. Обновить Nginx конфигурацию
```bash
nano /etc/nginx/sites-available/uniform-factory
```

Изменить `server_name`:
```
server_name uniformfactory.ru www.uniformfactory.ru;
```

### 3. Установить SSL (HTTPS)
```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d uniformfactory.ru -d www.uniformfactory.ru
```

### 4. Обновить frontend .env
```bash
nano /var/www/uniform-factory/frontend/.env
```

Изменить:
```
REACT_APP_BACKEND_URL=https://uniformfactory.ru
```

### 5. Пересобрать frontend
```bash
cd /var/www/uniform-factory/frontend
yarn build
systemctl restart nginx
```

---

## 📊 МОНИТОРИНГ

### Использование ресурсов
```bash
# Использование диска
df -h

# Использование памяти
free -h

# Нагрузка CPU
top
# (нажмите q для выхода)

# Процессы
ps aux | grep uvicorn
ps aux | grep nginx
```

### Размер базы данных
```bash
ls -lh /var/www/uniform-factory/backend/avik_uniform.db
```

### Размер логов
```bash
du -sh /var/log/uniform-backend.*.log
du -sh /var/log/nginx/*.log
```

---

## 🔧 ОБСЛУЖИВАНИЕ

### Очистка старых логов (если большие)
```bash
# Очистить логи nginx (оставить последние 1000 строк)
tail -n 1000 /var/log/nginx/access.log > /tmp/access.log
mv /tmp/access.log /var/log/nginx/access.log

# Или просто обнулить
> /var/log/nginx/access.log
```

### Обновление системы
```bash
apt update
apt upgrade -y
reboot  # Если требуется
```

### Очистка npm кэша (если frontend не собирается)
```bash
cd /var/www/uniform-factory/frontend
rm -rf node_modules yarn.lock
yarn install
yarn build
```

---

## 📞 КОНТАКТЫ ПОДДЕРЖКИ

### Sweb.ru (хостинг)
- Телефон: 8 (800) 333-62-04
- Email: support@sweb.ru
- Личный кабинет: https://my.sweb.ru

### Вопросы по сайту
- Через Emergent AI (я помогу!)

---

## 📝 CHECKLIST ПОСЛЕ УСТАНОВКИ

- [x] Сервер настроен и работает
- [x] Backend API запущен
- [x] Frontend собран и загружен
- [x] Nginx настроен
- [x] Supervisor настроен
- [x] База данных с товарами работает
- [x] Админ-панель доступна
- [x] Email уведомления работают
- [x] Telegram уведомления работают
- [ ] Настроен домен (сделать позже)
- [ ] Установлен SSL (HTTPS) (сделать позже)
- [ ] Настроены автоматические бэкапы (рекомендуется)

---

## 🎓 ПОЛЕЗНЫЕ ССЫЛКИ

**Документация проекта:**
- DEPLOYMENT_SWEB_RU.md - полная инструкция по развертыванию
- SYNC_GUIDE.md - процесс синхронизации и обновления
- SWEB_COMMANDS_CHEATSHEET.md - шпаргалка команд
- ROBOTS_SITEMAP_AUDIT.md - проверка SEO
- EMAIL_SETUP_GUIDE.md - настройка почты для домена

**Внешние ресурсы:**
- GitHub репозиторий: https://github.com/averkiev79-droid/uniform-factory
- Sweb.ru панель: https://my.sweb.ru

---

## 🏆 ДОСТИЖЕНИЯ

**Время установки:** ~3 часа  
**Решено проблем:** 10+  
**Команд выполнено:** 100+  
**Результат:** Полностью рабочий сайт! 🎉

---

## 💡 СОВЕТЫ

1. **Регулярно делайте бэкапы** базы данных
2. **Проверяйте логи** если что-то не работает
3. **Обновляйте систему** раз в месяц
4. **Мониторьте место на диске** (у вас 10 GB)
5. **Сохраните все пароли** в надежном месте

---

## 🎯 СЛЕДУЮЩИЕ ШАГИ (по желанию)

1. **Подключить домен** uniformfactory.ru
2. **Настроить SSL** (HTTPS)
3. **Настроить автобэкапы**
4. **Зарегистрировать в Яндекс.Вебмастер** и Google Search Console
5. **Настроить MX записи** для mail@uniformfactory.ru

---

**Дата установки:** 28 октября 2025  
**Статус:** ✅ Успешно завершено  
**Сайт работает:** http://80.93.62.160

**Поздравляем с успешным запуском! 🎊**
