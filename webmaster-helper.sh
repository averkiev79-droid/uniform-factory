#!/bin/bash

# Вспомогательный скрипт для регистрации в вебмастерах
# Uniform Factory - Webmaster Tools Helper

echo "=============================================="
echo "  Uniform Factory - Webmaster Tools Helper"
echo "=============================================="
echo ""

# Функция для создания файла подтверждения Яндекса
create_yandex_verification() {
    echo "Введите имя файла Яндекса (например: yandex_a1b2c3d4e5f6.html):"
    read filename
    
    echo "Введите содержимое файла (или просто нажмите Enter для пустого):"
    read content
    
    if [ -z "$content" ]; then
        content="<html><head><meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\"></head><body>Verification: yandex</body></html>"
    fi
    
    echo "$content" > "/app/frontend/public/$filename"
    echo "✅ Файл создан: /app/frontend/public/$filename"
    echo "📍 URL: https://uniformfactory.ru/$filename"
}

# Функция для создания файла подтверждения Google
create_google_verification() {
    echo "Введите имя файла Google (например: google1a2b3c4d5e6f.html):"
    read filename
    
    echo "Введите содержимое файла (или просто нажмите Enter для стандартного):"
    read content
    
    if [ -z "$content" ]; then
        content="google-site-verification: $filename"
    fi
    
    echo "$content" > "/app/frontend/public/$filename"
    echo "✅ Файл создан: /app/frontend/public/$filename"
    echo "📍 URL: https://uniformfactory.ru/$filename"
}

# Функция для обновления sitemap
update_sitemap() {
    echo "🔄 Обновление sitemap.xml..."
    cd /app/backend
    python generate_sitemap.py
    cp sitemap.xml /app/frontend/public/sitemap.xml
    echo "✅ Sitemap обновлен"
    echo "📍 URL: https://uniformfactory.ru/sitemap.xml"
    echo "📍 Количество URL: $(grep -c '<url>' /app/frontend/public/sitemap.xml)"
}

# Функция для проверки файлов
check_files() {
    echo "📋 Проверка файлов подтверждения..."
    echo ""
    
    if [ -f "/app/frontend/public/robots.txt" ]; then
        echo "✅ robots.txt найден"
    else
        echo "❌ robots.txt не найден"
    fi
    
    if [ -f "/app/frontend/public/sitemap.xml" ]; then
        echo "✅ sitemap.xml найден ($(grep -c '<url>' /app/frontend/public/sitemap.xml) URLs)"
    else
        echo "❌ sitemap.xml не найден"
    fi
    
    echo ""
    echo "Файлы подтверждения:"
    ls -lh /app/frontend/public/*.html 2>/dev/null | grep -E "(yandex|google)" || echo "  Нет файлов подтверждения"
}

# Главное меню
echo "Выберите действие:"
echo "1) Создать файл подтверждения Яндекса"
echo "2) Создать файл подтверждения Google"
echo "3) Обновить sitemap.xml"
echo "4) Проверить файлы"
echo "5) Выполнить всё (обновить sitemap + проверить)"
echo "0) Выход"
echo ""
read -p "Ваш выбор: " choice

case $choice in
    1)
        create_yandex_verification
        ;;
    2)
        create_google_verification
        ;;
    3)
        update_sitemap
        ;;
    4)
        check_files
        ;;
    5)
        update_sitemap
        echo ""
        check_files
        ;;
    0)
        echo "Выход"
        exit 0
        ;;
    *)
        echo "❌ Неверный выбор"
        exit 1
        ;;
esac

echo ""
echo "=============================================="
echo "✅ Готово!"
echo "=============================================="
