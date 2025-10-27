# 📝 Шпаргалка команд для Sweb.ru

## 🔐 Подключение к серверу

```bash
ssh root@ваш-ip-адрес
```

---

## 🔄 Обновление сайта (основная команда)

```bash
cd /var/www/uniform-factory
git pull origin main
./deploy-to-sweb.sh
```

**Скрипт автоматически:**
- Получит последние изменения
- Обновит зависимости
- Перезапустит backend
- Пересоберет frontend
- Создаст бэкап базы данных

---

## 📊 Проверка статуса

### Все сервисы
```bash
sudo supervisorctl status
```

### Backend
```bash
sudo supervisorctl status uniform-backend
```

### Nginx
```bash
sudo systemctl status nginx
```

### Проверка сайта
```bash
curl http://localhost
curl http://localhost/api/health
```

---

## 🔧 Управление сервисами

### Backend
```bash
# Перезапуск
sudo supervisorctl restart uniform-backend

# Остановка
sudo supervisorctl stop uniform-backend

# Запуск
sudo supervisorctl start uniform-backend

# Перечитать конфигурацию
sudo supervisorctl reread
sudo supervisorctl update
```

### Nginx
```bash
# Проверка конфигурации
sudo nginx -t

# Перезагрузка (без простоя)
sudo systemctl reload nginx

# Перезапуск
sudo systemctl restart nginx

# Остановка
sudo systemctl stop nginx

# Запуск
sudo systemctl start nginx
```

---

## 📜 Просмотр логов

### Backend логи
```bash
# Последние 50 строк
tail -n 50 /var/log/uniform-backend.out.log

# В реальном времени
tail -f /var/log/uniform-backend.out.log

# Ошибки
tail -n 50 /var/log/uniform-backend.err.log
```

### Nginx логи
```bash
# Логи доступа
tail -f /var/log/nginx/access.log

# Логи ошибок
tail -f /var/log/nginx/error.log

# Последние ошибки
tail -n 50 /var/log/nginx/error.log
```

### Supervisor логи
```bash
tail -f /var/log/supervisor/supervisord.log
```

---

## 💾 Работа с базой данных

### Бэкап вручную
```bash
DATE=$(date +%Y%m%d_%H%M%S)
cp /var/www/uniform-factory/backend/avik_uniform.db /root/backups/db_$DATE.db
echo "Бэкап создан: db_$DATE.db"
```

### Восстановление из бэкапа
```bash
# Остановить backend
sudo supervisorctl stop uniform-backend

# Восстановить
cp /root/backups/db_ДАТА.db /var/www/uniform-factory/backend/avik_uniform.db

# Запустить backend
sudo supervisorctl start uniform-backend
```

### Просмотр бэкапов
```bash
ls -lh /root/backups/
```

---

## 🌐 Работа с Git

### Получить изменения
```bash
cd /var/www/uniform-factory
git pull origin main
```

### Проверить статус
```bash
git status
```

### Откатить локальные изменения
```bash
git reset --hard origin/main
git pull origin main
```

### Просмотр истории
```bash
git log --oneline -10
```

### Переключение веток
```bash
# Переключиться на dev ветку
git checkout dev
git pull origin dev

# Вернуться на main
git checkout main
git pull origin main
```

---

## 🔄 Ручное обновление (если скрипт не работает)

### Backend
```bash
cd /var/www/uniform-factory/backend
source venv/bin/activate
pip install -r requirements.txt
sudo supervisorctl restart uniform-backend
```

### Frontend
```bash
cd /var/www/uniform-factory/frontend
npm install
npm run build
sudo systemctl reload nginx
```

---

## 📁 Работа с файлами

### Загрузка файлов
```bash
# Через SCP с компьютера
scp файл.txt root@ваш-ip:/var/www/uniform-factory/

# Через SFTP клиент (FileZilla)
# Host: ваш-ip
# Username: root
# Password: ваш-пароль
# Port: 22
```

### Права доступа
```bash
# Frontend build
sudo chown -R www-data:www-data /var/www/uniform-factory/frontend/build
sudo chmod -R 755 /var/www/uniform-factory/frontend/build

# Backend uploads
sudo chown -R www-data:www-data /var/www/uniform-factory/backend/uploads
sudo chmod -R 755 /var/www/uniform-factory/backend/uploads
```

---

## 🧹 Очистка

### Очистка кэша npm
```bash
cd /var/www/uniform-factory/frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Очистка старых бэкапов (старше 30 дней)
```bash
find /root/backups/ -name "db_*.db" -mtime +30 -delete
```

### Очистка логов (осторожно!)
```bash
# Очистить логи Nginx (оставить последние 1000 строк)
tail -n 1000 /var/log/nginx/access.log > /tmp/access.log
mv /tmp/access.log /var/log/nginx/access.log

# Или просто обнулить
> /var/log/nginx/access.log
```

---

## 🐛 Диагностика проблем

### Проверка портов
```bash
# Какие порты слушаются
netstat -tlnp

# Проверить конкретный порт
netstat -tlnp | grep :8001  # Backend
netstat -tlnp | grep :80    # Nginx HTTP
netstat -tlnp | grep :443   # Nginx HTTPS
```

### Проверка процессов
```bash
# Backend процессы
ps aux | grep uvicorn

# Nginx процессы
ps aux | grep nginx

# Убить зависший процесс
kill -9 PID
```

### Проверка места на диске
```bash
df -h
du -sh /var/www/uniform-factory/*
```

### Проверка памяти
```bash
free -h
```

### Проверка CPU
```bash
top
# Или
htop  # (если установлен)
```

---

## 🔒 SSL сертификат

### Получение сертификата
```bash
certbot --nginx -d uniformfactory.ru -d www.uniformfactory.ru
```

### Обновление сертификата
```bash
certbot renew
```

### Проверка автообновления
```bash
certbot renew --dry-run
```

### Просмотр сертификатов
```bash
certbot certificates
```

---

## ⚙️ Переменные окружения

### Просмотр
```bash
cat /var/www/uniform-factory/backend/.env
```

### Редактирование
```bash
nano /var/www/uniform-factory/backend/.env
# После изменений: Ctrl+O, Enter, Ctrl+X
# Перезапустить backend
sudo supervisorctl restart uniform-backend
```

---

## 🆘 Экстренные команды

### Полный перезапуск всего
```bash
sudo supervisorctl restart all
sudo systemctl restart nginx
```

### Если сайт не работает
```bash
# 1. Проверить статус
sudo supervisorctl status
sudo systemctl status nginx

# 2. Проверить логи
tail -n 50 /var/log/uniform-backend.err.log
tail -n 50 /var/log/nginx/error.log

# 3. Перезапустить всё
sudo supervisorctl restart all
sudo systemctl restart nginx

# 4. Проверить доступность
curl http://localhost
curl http://localhost/api/health
```

### Откат к предыдущей версии
```bash
cd /var/www/uniform-factory

# Посмотреть последние коммиты
git log --oneline -5

# Откатиться на предыдущий коммит
git reset --hard HEAD~1

# Или на конкретный коммит
git reset --hard COMMIT_HASH

# Обновить
./deploy-to-sweb.sh
```

---

## 📈 Мониторинг в реальном времени

### Следить за всеми логами одновременно
```bash
# В отдельных терминалах или используйте tmux/screen

# Терминал 1: Backend
tail -f /var/log/uniform-backend.out.log

# Терминал 2: Nginx доступ
tail -f /var/log/nginx/access.log

# Терминал 3: Nginx ошибки
tail -f /var/log/nginx/error.log
```

---

## 💡 Полезные алиасы

Добавьте в `~/.bashrc` для быстрого доступа:

```bash
# Открыть для редактирования
nano ~/.bashrc

# Добавить в конец файла:
alias uf='cd /var/www/uniform-factory'
alias ufb='cd /var/www/uniform-factory/backend'
alias uff='cd /var/www/uniform-factory/frontend'
alias uflog='tail -f /var/log/uniform-backend.out.log'
alias uferr='tail -f /var/log/uniform-backend.err.log'
alias ufrestart='sudo supervisorctl restart uniform-backend && sudo systemctl reload nginx'
alias ufstatus='sudo supervisorctl status && sudo systemctl status nginx --no-pager | head -3'
alias ufdeploy='cd /var/www/uniform-factory && git pull origin main && ./deploy-to-sweb.sh'

# Сохранить: Ctrl+O, Enter, Ctrl+X
# Применить:
source ~/.bashrc

# Теперь можно использовать:
uf          # перейти в папку проекта
uflog       # смотреть логи
ufdeploy    # обновить сайт
```

---

## 🎯 Чек-лист после обновления

После каждого обновления проверяйте:

```bash
# 1. Статус сервисов
sudo supervisorctl status

# 2. Сайт открывается
curl -I http://localhost

# 3. API работает
curl http://localhost/api/health

# 4. Backend логи чистые
tail -n 20 /var/log/uniform-backend.err.log

# 5. Nginx логи чистые
tail -n 20 /var/log/nginx/error.log
```

Если всё ОК - обновление прошло успешно! ✅

---

**Сохраните эту шпаргалку!** 
Распечатайте или держите открытой во время работы с сервером.
