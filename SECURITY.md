# Документация по безопасности Uniform Factory

## Обзор реализованных мер безопасности

Данный документ описывает все меры безопасности, реализованные в приложении Uniform Factory для защиты от распространенных веб-угроз и обеспечения безопасной работы пользователей.

---

## 1. Заголовки безопасности HTTP (Security Headers)

### Реализация
**Файл:** `backend/security_middleware.py` - класс `SecurityHeadersMiddleware`

### Защита:
- **X-Content-Type-Options: nosniff** - Предотвращает MIME-sniffing атаки
- **X-Frame-Options: DENY** - Защита от clickjacking атак
- **X-XSS-Protection: 1; mode=block** - Включает встроенную XSS защиту браузера
- **Strict-Transport-Security** - Принудительное использование HTTPS
- **Content-Security-Policy (CSP)** - Контролирует загрузку внешних ресурсов

### CSP Директивы:
```
default-src 'self'
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://mc.yandex.ru
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com
img-src 'self' data: https: http:
font-src 'self' https://fonts.gstatic.com
frame-src 'self' https://yandex.ru https://mc.yandex.ru
connect-src 'self' https://mc.yandex.ru
```

---

## 2. Rate Limiting (Ограничение частоты запросов)

### Реализация
**Файл:** `backend/security_middleware.py` - класс `RateLimitMiddleware`

### Параметры:
- **Лимит:** 60 запросов
- **Окно времени:** 60 секунд
- **Идентификация:** По IP-адресу клиента
- **Исключения:** Статические файлы (/api/uploads/)

### Заголовки ответа:
- `X-RateLimit-Limit` - Максимальное количество запросов
- `X-RateLimit-Remaining` - Оставшееся количество запросов
- `X-RateLimit-Reset` - Время сброса счетчика (UNIX timestamp)

### Ответ при превышении лимита:
- **HTTP Status:** 429 Too Many Requests
- **Сообщение:** "Слишком много запросов. Пожалуйста, попробуйте позже."

---

## 3. Валидация загрузки файлов

### Реализация
**Файл:** `backend/security_middleware.py` - функция `validate_upload_file()`

### Ограничения:
- **Максимальный размер файла:** 10 MB
- **Разрешенные MIME-типы:**
  - image/jpeg
  - image/jpg
  - image/png
  - image/webp
  - image/gif

- **Разрешенные расширения:**
  - .jpg, .jpeg
  - .png
  - .webp
  - .gif

### Проверки:
1. ✅ Наличие файла
2. ✅ Валидность расширения файла
3. ✅ Проверка MIME-типа
4. ✅ Проверка размера файла
5. ✅ Проверка на пустой файл
6. ✅ Защита от directory traversal атак (проверка имени файла)

### Использование:
```python
from security_middleware import validate_upload_file

@admin_router.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    await validate_upload_file(file)
    # Продолжить обработку файла...
```

---

## 4. Валидация и санитизация входных данных

### Реализация
**Файл:** `backend/models.py` - Pydantic validators

### 4.1 Валидация Email
```python
@validator('email')
def validate_email(cls, v):
    v = v.strip().lower()
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, v):
        raise ValueError('Недопустимый формат email')
    return v
```

**Проверки:**
- Соответствие email паттерну
- Автоматическое приведение к нижнему регистру
- Удаление пробелов

### 4.2 Валидация телефона
```python
@validator('phone')
def validate_phone(cls, v):
    v = re.sub(r'[^\d+]', '', v)
    digits_only = re.sub(r'\D', '', v)
    if len(digits_only) < 10:
        raise ValueError('Недопустимый формат телефона')
    return v
```

**Проверки:**
- Удаление всех символов кроме цифр и +
- Минимум 10 цифр в номере
- Стандартизация формата

### 4.3 Санитизация текстовых полей
```python
@validator('name', 'company', 'message')
def sanitize_text_fields(cls, v):
    if v is None:
        return v
    return v.strip()[:500]  # или [:1000] для message
```

**Проверки:**
- Удаление начальных и конечных пробелов
- Ограничение длины (500 символов для имён, 1000 для сообщений)

### Модели с валидацией:
- ✅ `QuoteRequestCreate`
- ✅ `CallbackRequestCreate`
- ✅ `ConsultationRequestCreate`
- ✅ `ContactMessageCreate`

---

## 5. Защита от XSS (Cross-Site Scripting)

### Frontend
**Библиотека:** `react-markdown` с `remark-gfm`

**Защита:**
- React автоматически экранирует все выводимые данные
- ReactMarkdown безопасно рендерит markdown контент
- Отсутствие `dangerouslySetInnerHTML` в пользовательских данных

### Backend
- Все входные данные валидируются через Pydantic
- Санитизация текстовых полей
- CSP заголовки ограничивают выполнение скриптов

---

## 6. Защита от CSRF (Cross-Site Request Forgery)

### Текущая реализация:
- CORS настроен для разрешения запросов
- SameSite cookie политика (по умолчанию в браузерах)

### Рекомендации для продакшена:
- Реализовать CSRF токены для state-changing операций
- Использовать SameSite=Strict для cookie
- Добавить Origin/Referer проверки

---

## 7. Безопасное управление файлами

### Загрузка
**Файл:** `backend/admin_routes.py`

**Меры безопасности:**
1. Генерация уникальных имен файлов (UUID)
2. Хранение в изолированной директории (`uploads/`)
3. Валидация через `validate_upload_file()`
4. Ограничение типов и размеров файлов

### Удаление
**Файл:** `backend/admin_routes.py` - endpoint `DELETE /api/admin/uploaded-files/{filename}`

**Меры безопасности:**
```python
# Security check - ensure file is in uploads directory
if not str(file_path.resolve()).startswith(str(Path("uploads").resolve())):
    raise HTTPException(status_code=403, detail="Access denied")
```

- Проверка пути файла (защита от directory traversal)
- Подтверждение удаления от пользователя (на frontend)

---

## 8. Аутентификация админ-панели

### Текущая реализация:
**Файл:** `backend/admin_routes.py`

```python
ADMIN_PASSWORD = "avik2024admin"
```

### ⚠️ Рекомендации для продакшена:

#### 8.1 Использовать хеширование паролей
```python
from passlib.hash import bcrypt

ADMIN_PASSWORD_HASH = bcrypt.hash("avik2024admin")

def verify_password(plain_password, hashed_password):
    return bcrypt.verify(plain_password, hashed_password)
```

#### 8.2 Использовать JWT токены
```python
from jose import jwt
from datetime import datetime, timedelta

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
```

#### 8.3 Переменные окружения
```bash
# .env
ADMIN_PASSWORD_HASH=...
SECRET_KEY=...
```

---

## 9. Безопасность базы данных

### SQLite
**Файл:** `backend/database_sqlite.py`

**Защита:**
- Использование SQLAlchemy ORM (защита от SQL injection)
- Параметризованные запросы
- Валидация данных через Pydantic перед записью

---

## 10. Email безопасность

### Конфигурация SMTP
**Файл:** `backend/.env`

```env
SENDER_EMAIL=your-email@yandex.ru
EMAIL_PASSWORD=app-specific-password
ADMIN_EMAIL=admin@uniformfactory.ru
```

**Рекомендации:**
- ✅ Использовать app-specific пароли (не основной пароль)
- ✅ Хранить креденшалы в .env файле
- ✅ Добавить .env в .gitignore
- ⚠️ В продакшене использовать секреты Kubernetes/Docker

---

## 11. Логирование и мониторинг

### Текущее логирование:
**Файл:** `backend/server.py`

```python
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
```

### Что логируется:
- Ошибки приложения
- Результаты email отправки
- Ошибки валидации

### Рекомендации для продакшена:
- Добавить логирование неудачных попыток входа
- Мониторинг превышения rate limits
- Логирование подозрительной активности
- Интеграция с системами мониторинга (Sentry, DataDog)

---

## 12. Чек-лист безопасности для продакшена

### Backend
- [ ] Изменить ADMIN_PASSWORD на безопасный пароль с хешированием
- [ ] Генерировать SECRET_KEY для JWT
- [ ] Настроить CORS для конкретных доменов (не "*")
- [ ] Включить HTTPS обязательно
- [ ] Настроить firewall и ограничить доступ к портам
- [ ] Регулярно обновлять зависимости
- [ ] Настроить автоматические бэкапы БД
- [ ] Реализовать CSRF токены
- [ ] Добавить капчу для форм обратной связи

### Frontend
- [ ] Включить HTTPS
- [ ] Настроить CSP через meta теги
- [ ] Минимизировать и обфусцировать JS код
- [ ] Регулярно обновлять npm зависимости
- [ ] Проверить на XSS уязвимости

### Инфраструктура
- [ ] Настроить WAF (Web Application Firewall)
- [ ] Регулярные security аудиты
- [ ] Мониторинг подозрительной активности
- [ ] Резервное копирование
- [ ] План восстановления после инцидента

---

## 13. Тестирование безопасности

### Инструменты:
- **OWASP ZAP** - сканирование уязвимостей
- **Burp Suite** - тестирование веб-приложений
- **npm audit** - проверка зависимостей frontend
- **Safety** - проверка зависимостей Python

### Команды:
```bash
# Frontend
cd frontend
npm audit
npm audit fix

# Backend
cd backend
pip install safety
safety check
```

---

## Контакты поддержки

По вопросам безопасности обращайтесь:
- Email: security@uniformfactory.ru
- Телефон: +7 (812) 317-73-19

---

**Последнее обновление:** 18.10.2025
**Версия:** 1.0
