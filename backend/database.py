from motor.motor_asyncio import AsyncIOMotorClient
import os
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Collections
categories_collection = db.categories
portfolio_collection = db.portfolio
testimonials_collection = db.testimonials
statistics_collection = db.statistics
quote_requests_collection = db.quote_requests
contact_requests_collection = db.contact_requests

async def init_database():
    """Initialize database with sample data"""
    
    # Check if data already exists
    if await categories_collection.count_documents({}) > 0:
        print("Database already initialized")
        return
    
    # Sample categories data
    categories_data = [
        {
            "id": "1",
            "title": "Униформа для ресторанов и отелей",
            "description": "Профессиональная одежда для сферы HoReCa",
            "image": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop",
            "products_count": 120,
            "slug": "restaurants-hotels"
        },
        {
            "id": "2",
            "title": "Деловая и офисная одежда",
            "description": "Элегантные костюмы для бизнеса",
            "image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
            "products_count": 85,
            "slug": "business-office"
        },
        {
            "id": "3",
            "title": "Униформа для торговых сетей",
            "description": "Стильная одежда для продавцов и консультантов",
            "image": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop",
            "products_count": 95,
            "slug": "retail"
        },
        {
            "id": "4",
            "title": "Промо форма",
            "description": "Яркая одежда для промо-акций и мероприятий",
            "image": "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop",
            "products_count": 60,
            "slug": "promo"
        },
        {
            "id": "5",
            "title": "Медицинская одежда",
            "description": "Комфортная и функциональная медицинская форма",
            "image": "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop",
            "products_count": 75,
            "slug": "medical"
        },
        {
            "id": "6",
            "title": "Спецодежда",
            "description": "Защитная и рабочая одежда для производства",
            "image": "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop",
            "products_count": 110,
            "slug": "workwear"
        }
    ]
    
    # Sample portfolio data
    portfolio_data = [
        {
            "id": "1",
            "company": "Сбербанк",
            "description": "Деловые костюмы для сотрудников банка",
            "image": "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&h=400&fit=crop",
            "category": "Банки",
            "items_count": 2500,
            "year": 2023
        },
        {
            "id": "2",
            "company": "Отель Четыре Сезона",
            "description": "Элегантная униформа для персонала отеля",
            "image": "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500&h=400&fit=crop",
            "category": "HoReCa",
            "items_count": 350,
            "year": 2023
        },
        {
            "id": "3",
            "company": "М.Видео",
            "description": "Современная униформа для продавцов-консультантов",
            "image": "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500&h=400&fit=crop",
            "category": "Торговля",
            "items_count": 1200,
            "year": 2024
        },
        {
            "id": "4",
            "company": "Ресторан White Rabbit",
            "description": "Стильная одежда для поваров и официантов",
            "image": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500&h=400&fit=crop",
            "category": "HoReCa",
            "items_count": 85,
            "year": 2024
        },
        {
            "id": "5",
            "company": "Бостон Консалтинг Групп",
            "description": "Премиум костюмы для консультантов",
            "image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=400&fit=crop",
            "category": "Консалтинг",
            "items_count": 180,
            "year": 2023
        },
        {
            "id": "6",
            "company": "Клиника Скандинавия",
            "description": "Медицинская форма для врачей и медсестер",
            "image": "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=500&h=400&fit=crop",
            "category": "Медицина",
            "items_count": 420,
            "year": 2024
        }
    ]
    
    # Sample testimonials data
    testimonials_data = [
        {
            "id": "1",
            "company": "ООО 'Премиум Отели'",
            "text": "Сотрудничаем с AVIK уже 3 года. Качество униформы превосходное, сотрудники довольны комфортом и внешним видом.",
            "author": "Анна Петрова",
            "position": "Директор по закупкам",
            "rating": 5
        },
        {
            "id": "2",
            "company": "Банк 'Столичный'",
            "text": "AVIK помогли создать стильный корпоративный образ для наших сотрудников. Рекомендуем как надежного партнера.",
            "author": "Михаил Сидоров",
            "position": "HR-директор",
            "rating": 5
        },
        {
            "id": "3",
            "company": "Сеть ресторанов 'Вкус'",
            "text": "Профессиональный подход, быстрые сроки, отличное качество. Униформа от AVIK подчеркивает статус наших заведений.",
            "author": "Елена Козлова",
            "position": "Управляющий директор",
            "rating": 5
        }
    ]
    
    # Sample statistics data
    statistics_data = {
        "id": "1",
        "years_in_business": 15,
        "completed_orders": 5000,
        "happy_clients": 1200,
        "cities": 150
    }
    
    # Insert data
    await categories_collection.insert_many(categories_data)
    await portfolio_collection.insert_many(portfolio_data)
    await testimonials_collection.insert_many(testimonials_data)
    await statistics_collection.insert_one(statistics_data)
    
    print("Database initialized with sample data")

async def close_database():
    """Close database connection"""
    client.close()