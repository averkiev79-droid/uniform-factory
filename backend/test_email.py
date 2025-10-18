#!/usr/bin/env python3
"""Test email sending functionality"""

import os
import sys
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from email_service import send_quote_notification_email

# Test data
test_quote = {
    "request_id": "TEST-2025-ABC123",
    "name": "Тестовый Пользователь",
    "email": "test@example.com",
    "phone": "+7 (999) 123-45-67",
    "company": "Тестовая Компания",
    "category": "Офисная одежда",
    "quantity": "50-100",
    "fabric": "Хлопок",
    "branding": "Вышивка",
    "estimated_price": 5000
}

def test_email():
    """Test sending email notification"""
    admin_email = os.getenv('ADMIN_EMAIL')
    sender_email = os.getenv('SENDER_EMAIL')
    
    print("=" * 60)
    print("ТЕСТ EMAIL УВЕДОМЛЕНИЙ")
    print("=" * 60)
    print(f"От кого: {sender_email}")
    print(f"Кому: {admin_email}")
    print(f"Тема: Новая заявка на расчет (ТЕСТ)")
    print("-" * 60)
    
    if not admin_email or not sender_email:
        print("❌ ОШИБКА: Email настройки не найдены в .env файле!")
        return False
    
    try:
        print("Отправка тестового письма...")
        send_quote_notification_email(test_quote, admin_email)
        print("✅ УСПЕХ! Тестовое письмо отправлено!")
        print(f"Проверьте почту: {admin_email}")
        return True
    except Exception as e:
        print(f"❌ ОШИБКА при отправке: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_email()
    sys.exit(0 if success else 1)
