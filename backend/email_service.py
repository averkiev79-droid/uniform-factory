from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
import os
from typing import Optional

class EmailDeliveryError(Exception):
    pass

def send_email(to: str, subject: str, html_content: str, plain_text_content: Optional[str] = None):
    """
    Send email via SendGrid

    Args:
        to: Recipient email address
        subject: Email subject line
        html_content: HTML email content
        plain_text_content: Plain text email content (optional)
    """
    message = Mail(
        from_email=os.getenv('SENDER_EMAIL', 'no-reply@avik-uniforms.com'),
        to_emails=to,
        subject=subject,
        html_content=html_content,
        plain_text_content=plain_text_content
    )

    try:
        sg = SendGridAPIClient(os.getenv('SENDGRID_API_KEY'))
        response = sg.send(message)
        return response.status_code == 202
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        raise EmailDeliveryError(f"Failed to send email: {str(e)}")

def send_quote_notification_email(request_data: dict):
    """
    Send quote request notification email to admin
    """
    admin_email = os.getenv('ADMIN_EMAIL', 'admin@avik-uniforms.com')
    
    subject = f"Новая заявка на расчет - {request_data.get('request_id', 'N/A')}"
    
    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #7C3AED; border-bottom: 2px solid #7C3AED; padding-bottom: 10px;">
                    Новая заявка на расчет
                </h2>
                
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #495057;">Информация о заявке:</h3>
                    <p><strong>ID заявки:</strong> {request_data.get('request_id', 'N/A')}</p>
                    <p><strong>Дата:</strong> {request_data.get('created_at', 'N/A')}</p>
                </div>
                
                <div style="background-color: #fff; padding: 15px; border: 1px solid #dee2e6; border-radius: 5px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #495057;">Контактная информация:</h3>
                    <p><strong>Имя:</strong> {request_data.get('name', 'Не указано')}</p>
                    <p><strong>Email:</strong> {request_data.get('email', 'Не указан')}</p>
                    <p><strong>Телефон:</strong> {request_data.get('phone', 'Не указан')}</p>
                    <p><strong>Компания:</strong> {request_data.get('company', 'Не указана')}</p>
                </div>
                
                <div style="background-color: #fff; padding: 15px; border: 1px solid #dee2e6; border-radius: 5px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #495057;">Параметры заказа:</h3>
                    <p><strong>Категория:</strong> {request_data.get('category', 'Не указана')}</p>
                    <p><strong>Количество:</strong> {request_data.get('quantity', 'Не указано')}</p>
                    <p><strong>Ткань:</strong> {request_data.get('fabric', 'Не указана')}</p>
                    <p><strong>Нанесение логотипа:</strong> {request_data.get('branding', 'Не указано')}</p>
                    <p><strong>Предварительная стоимость:</strong> <span style="color: #28a745; font-weight: bold;">{request_data.get('estimated_price', 'Не рассчитана')}</span></p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <p style="color: #6c757d; font-style: italic;">
                        Это автоматическое уведомление от сайта AVIK Uniform Factory
                    </p>
                </div>
            </div>
        </body>
    </html>
    """
    
    plain_text = f"""
    Новая заявка на расчет - {request_data.get('request_id', 'N/A')}
    
    Информация о заявке:
    ID заявки: {request_data.get('request_id', 'N/A')}
    Дата: {request_data.get('created_at', 'N/A')}
    
    Контактная информация:
    Имя: {request_data.get('name', 'Не указано')}
    Email: {request_data.get('email', 'Не указан')}
    Телефон: {request_data.get('phone', 'Не указан')}
    Компания: {request_data.get('company', 'Не указана')}
    
    Параметры заказа:
    Категория: {request_data.get('category', 'Не указана')}
    Количество: {request_data.get('quantity', 'Не указано')}
    Ткань: {request_data.get('fabric', 'Не указана')}
    Нанесение логотипа: {request_data.get('branding', 'Не указано')}
    Предварительная стоимость: {request_data.get('estimated_price', 'Не рассчитана')}
    
    Это автоматическое уведомление от сайта AVIK Uniform Factory
    """
    
    return send_email(admin_email, subject, html_content, plain_text)

def send_callback_notification_email(request_data: dict):
    """
    Send callback request notification email to admin
    """
    admin_email = os.getenv('ADMIN_EMAIL', 'admin@avik-uniforms.com')
    
    subject = f"Новая заявка на звонок от {request_data.get('name', 'Неизвестно')}"
    
    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #7C3AED; border-bottom: 2px solid #7C3AED; padding-bottom: 10px;">
                    Новая заявка на обратный звонок
                </h2>
                
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #495057;">Контактная информация:</h3>
                    <p><strong>Имя:</strong> {request_data.get('name', 'Не указано')}</p>
                    <p><strong>Телефон:</strong> <span style="color: #007bff; font-weight: bold;">{request_data.get('phone', 'Не указан')}</span></p>
                    <p><strong>Email:</strong> {request_data.get('email', 'Не указан')}</p>
                    <p><strong>Компания:</strong> {request_data.get('company', 'Не указана')}</p>
                    <p><strong>Дата заявки:</strong> {request_data.get('created_at', 'N/A')}</p>
                </div>
                
                {f'<div style="background-color: #fff; padding: 15px; border: 1px solid #dee2e6; border-radius: 5px; margin: 20px 0;"><h3 style="margin-top: 0; color: #495057;">Сообщение:</h3><p>{request_data.get("message", "")}</p></div>' if request_data.get('message') else ''}
                
                <div style="text-align: center; margin: 30px 0;">
                    <p style="color: #6c757d; font-style: italic;">
                        Это автоматическое уведомление от сайта AVIK Uniform Factory
                    </p>
                </div>
            </div>
        </body>
    </html>
    """
    
    plain_text = f"""
    Новая заявка на обратный звонок от {request_data.get('name', 'Неизвестно')}
    
    Контактная информация:
    Имя: {request_data.get('name', 'Не указано')}
    Телефон: {request_data.get('phone', 'Не указан')}
    Email: {request_data.get('email', 'Не указан')}
    Компания: {request_data.get('company', 'Не указана')}
    Дата заявки: {request_data.get('created_at', 'N/A')}
    
    {f'Сообщение: {request_data.get("message", "")}' if request_data.get('message') else ''}
    
    Это автоматическое уведомление от сайта AVIK Uniform Factory
    """
    
    return send_email(admin_email, subject, html_content, plain_text)