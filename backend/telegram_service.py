"""
Telegram Bot Service for Uniform Factory
Sends notifications about new requests to admin
"""
import os
from dotenv import load_dotenv
import requests
from typing import Optional
import logging

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

# Get Telegram credentials from environment
TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')
TELEGRAM_CHAT_ID = os.getenv('TELEGRAM_CHAT_ID')

class TelegramService:
    """Service for sending Telegram notifications"""
    
    @staticmethod
    def send_message(text: str, parse_mode: str = 'HTML') -> bool:
        """
        Send message to Telegram
        
        Args:
            text: Message text (supports HTML formatting)
            parse_mode: Parse mode (HTML or Markdown)
            
        Returns:
            True if sent successfully, False otherwise
        """
        if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
            logger.warning("Telegram credentials not configured")
            return False
        
        url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
        
        payload = {
            'chat_id': TELEGRAM_CHAT_ID,
            'text': text,
            'parse_mode': parse_mode
        }
        
        try:
            response = requests.post(url, json=payload, timeout=10)
            response.raise_for_status()
            logger.info("Telegram notification sent successfully")
            return True
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to send Telegram notification: {e}")
            return False
    
    @staticmethod
    def send_quote_request_notification(request_data: dict) -> bool:
        """Send notification about new quote request"""
        company_line = f"🏢 <b>Компания:</b> {request_data.get('company')}" if request_data.get('company') else ""
        
        text = f"""
🆕 <b>Новая заявка на расчёт</b>

👤 <b>Клиент:</b> {request_data.get('name')}
📧 <b>Email:</b> {request_data.get('email')}
📱 <b>Телефон:</b> {request_data.get('phone')}
{company_line}

📦 <b>Детали заказа:</b>
• Категория: {request_data.get('category')}
• Количество: {request_data.get('quantity')}
• Ткань: {request_data.get('fabric')}
• Брендирование: {request_data.get('branding')}

💰 <b>Ориентировочная стоимость:</b> {request_data.get('estimated_price', 0):,} ₽

🆔 <b>ID заявки:</b> {request_data.get('request_id', 'N/A')}
        """.strip()
        
        return TelegramService.send_message(text)
    
    @staticmethod
    def send_callback_request_notification(request_data: dict) -> bool:
        """Send notification about callback request"""
        email_line = f"📧 <b>Email:</b> {request_data.get('email')}" if request_data.get('email') else ""
        company_line = f"🏢 <b>Компания:</b> {request_data.get('company')}" if request_data.get('company') else ""
        
        text = f"""
📞 <b>Запрос на обратный звонок</b>

👤 <b>Имя:</b> {request_data.get('name')}
📱 <b>Телефон:</b> {request_data.get('phone')}
{email_line}
{company_line}

⏰ <b>Время:</b> {request_data.get('created_at', 'Только что')}
        """.strip()
        
        return TelegramService.send_message(text)
    
    @staticmethod
    def send_consultation_request_notification(request_data: dict) -> bool:
        """Send notification about consultation request"""
        company_line = f"🏢 <b>Компания:</b> {request_data.get('company')}" if request_data.get('company') else ""
        message_line = f"📝 <b>Сообщение:</b>\n{request_data.get('message')}" if request_data.get('message') else ""
        
        text = f"""
💬 <b>Заявка на консультацию</b>

👤 <b>Клиент:</b> {request_data.get('name')}
📧 <b>Email:</b> {request_data.get('email')}
📱 <b>Телефон:</b> {request_data.get('phone')}
{company_line}

{message_line}

⏰ <b>Время:</b> {request_data.get('created_at', 'Только что')}
        """.strip()
        
        return TelegramService.send_message(text)
    
    @staticmethod
    def send_contact_message_notification(request_data: dict) -> bool:
        """Send notification about contact form message"""
        company_line = f"🏢 <b>Компания:</b> {request_data.get('company')}" if request_data.get('company') else ""
        
        text = f"""
✉️ <b>Новое сообщение с сайта</b>

👤 <b>От:</b> {request_data.get('name')}
📧 <b>Email:</b> {request_data.get('email')}
📱 <b>Телефон:</b> {request_data.get('phone')}
{company_line}

📝 <b>Сообщение:</b>
{request_data.get('message', 'Нет текста')}

⏰ <b>Время:</b> {request_data.get('created_at', 'Только что')}
        """.strip()
        
        return TelegramService.send_message(text)
    
    @staticmethod
    def send_cart_order_notification(order_data: dict) -> bool:
        """Send notification about cart order"""
        items_text = "\n".join([
            f"  • {item['name']} (Арт. {item['article']})\n"
            f"    Цвет: {item['color']}, Материал: {item['material']}\n"
            f"    Кол-во: {item['quantity']} шт, Цена: от {item['price_from']} ₽"
            for item in order_data.get('items', [])
        ])
        
        comment_line = f"\n💬 <b>Комментарий:</b>\n{order_data.get('comment')}\n" if order_data.get('comment') else ""
        
        text = f"""
🛒 <b>НОВЫЙ ЗАКАЗ ИЗ КОРЗИНЫ!</b>

📋 <b>Номер заказа:</b> {order_data.get('request_id')}

👤 <b>Клиент:</b> {order_data.get('name')}
📧 <b>Email:</b> {order_data.get('email')}
📱 <b>Телефон:</b> {order_data.get('phone')}

📦 <b>Товары:</b>
{items_text}

💰 <b>Итого:</b> от {order_data.get('total_amount', 0):,} ₽
{comment_line}
⏰ <b>Время:</b> {order_data.get('created_at', 'Только что')}
        """.strip()
        
        return TelegramService.send_message(text)


# Test function
def test_telegram_service():
    """Test Telegram notification"""
    test_message = """
🧪 <b>Тестовое уведомление</b>

Telegram бот для Uniform Factory успешно настроен! ✅

Теперь вы будете получать уведомления о:
• Заявках на расчёт
• Запросах на обратный звонок
• Заявках на консультацию
• Сообщениях с формы контактов
    """.strip()
    
    result = TelegramService.send_message(test_message)
    if result:
        print("✅ Telegram notification sent successfully!")
    else:
        print("❌ Failed to send Telegram notification")
    
    return result


if __name__ == '__main__':
    # Test the service
    test_telegram_service()
