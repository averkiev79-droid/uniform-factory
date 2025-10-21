from sqlalchemy import create_engine, Column, String, Integer, DateTime, Text, ForeignKey, Boolean, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os
import uuid

# SQLite database setup
DATABASE_URL = "sqlite:///./avik_uniform.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# SQLite Models
class ProductCategory(Base):
    __tablename__ = "categories"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    description = Column(Text)
    image = Column(String)
    products_count = Column(Integer, default=0)
    slug = Column(String, unique=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class PortfolioItem(Base):
    __tablename__ = "portfolio"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    company = Column(String, nullable=False)
    description = Column(Text)
    image = Column(String)
    category = Column(String)
    items_count = Column(Integer, default=0)
    year = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Testimonial(Base):
    __tablename__ = "testimonials"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    company = Column(String, nullable=False)
    text = Column(Text, nullable=False)
    author = Column(String, nullable=False)
    position = Column(String)
    rating = Column(Integer, default=5)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Statistics(Base):
    __tablename__ = "statistics"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    years_in_business = Column(Integer, default=15)
    completed_orders = Column(Integer, default=5000)
    happy_clients = Column(Integer, default=1200)
    cities = Column(Integer, default=150)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class QuoteRequest(Base):
    __tablename__ = "quote_requests"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    request_id = Column(String, unique=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    company = Column(String)
    category = Column(String, nullable=False)
    quantity = Column(String, nullable=False)
    fabric = Column(String, nullable=False)
    branding = Column(String, nullable=False)
    estimated_price = Column(Integer, nullable=False)
    status = Column(String, default="new")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ContactRequest(Base):
    __tablename__ = "contact_requests"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    type = Column(String, nullable=False)  # "callback" or "consultation"
    name = Column(String, nullable=False)
    email = Column(String)
    phone = Column(String, nullable=False)
    company = Column(String)
    message = Column(Text)
    status = Column(String, default="new")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class AppSettings(Base):
    __tablename__ = "app_settings"
    
    id = Column(String, primary_key=True, default="default")
    hero_image = Column(String, default="/images/hero-main.jpg")
    hero_mobile_image = Column(String)  # Optional: separate mobile image
    about_image = Column(String)  # Optional: for about page
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class WebVitals(Base):
    __tablename__ = "web_vitals"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)  # CLS, FID, FCP, LCP, TTFB
    value = Column(Float, nullable=False)
    rating = Column(String)  # good, needs-improvement, poor
    delta = Column(Float)
    metric_id = Column(String)
    navigation_type = Column(String)
    page = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)

class LegalDocument(Base):
    __tablename__ = "legal_documents"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    doc_type = Column(String, nullable=False)  # privacy_policy, user_agreement, company_details
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)  # Markdown content
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

# Product Tables
class SQLProduct(Base):
    __tablename__ = "products"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    category_id = Column(String, ForeignKey("categories.id"), nullable=False)
    name = Column(String, nullable=False)
    article = Column(String, unique=True, index=True)  # Артикул товара
    description = Column(Text, nullable=False)
    short_description = Column(String)
    price_from = Column(Integer, nullable=False)
    price_to = Column(Integer)
    material = Column(String)
    sizes = Column(String)  # JSON string
    colors = Column(String)  # JSON string
    is_available = Column(Boolean, default=True)  # В наличии
    on_order = Column(Boolean, default=False)  # Под заказ
    featured = Column(Boolean, default=False)  # Популярное
    views_count = Column(Integer, default=0)  # Для аналитики популярности
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    images = relationship("SQLProductImage", back_populates="product", cascade="all, delete-orphan")
    characteristics = relationship("SQLProductCharacteristic", back_populates="product", cascade="all, delete-orphan")
    category = relationship("ProductCategory", foreign_keys=[category_id])

class SQLProductImage(Base):
    __tablename__ = "product_images"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id = Column(String, ForeignKey("products.id"), nullable=False)
    image_url = Column(String, nullable=False)
    alt_text = Column(String)
    order = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    product = relationship("SQLProduct", back_populates="images")

class SQLProductCharacteristic(Base):
    __tablename__ = "product_characteristics"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id = Column(String, ForeignKey("products.id"), nullable=False)
    name = Column(String, nullable=False)
    value = Column(String, nullable=False)
    order = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    product = relationship("SQLProduct", back_populates="characteristics")

# Database session dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Initialize database with sample data
def init_sqlite_database():
    """Initialize SQLite database with sample data"""
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check if data already exists
        existing_categories = db.query(ProductCategory).count()
        if existing_categories > 0:
            print("SQLite database already initialized")
            return
        
        # Sample categories data
        categories_data = [
            ProductCategory(
                id="1",
                title="Униформа для ресторанов и отелей",
                description="Профессиональная одежда для сферы HoReCa",
                image="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop",
                products_count=120,
                slug="restaurants-hotels"
            ),
            ProductCategory(
                id="2",
                title="Деловая и офисная одежда",
                description="Элегантные костюмы для бизнеса",
                image="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
                products_count=85,
                slug="business-office"
            ),
            ProductCategory(
                id="3",
                title="Униформа для торговых сетей",
                description="Стильная одежда для продавцов и консультантов",
                image="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop",
                products_count=95,
                slug="retail"
            ),
            ProductCategory(
                id="4",
                title="Промо форма",
                description="Яркая одежда для промо-акций и мероприятий",
                image="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop",
                products_count=60,
                slug="promo"
            ),
            ProductCategory(
                id="5",
                title="Медицинская одежда",
                description="Комфортная и функциональная медицинская форма",
                image="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop",
                products_count=75,
                slug="medical"
            ),
            ProductCategory(
                id="6",
                title="Спецодежда",
                description="Защитная и рабочая одежда для производства",
                image="https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop",
                products_count=110,
                slug="workwear"
            )
        ]
        
        # Sample portfolio data
        portfolio_data = [
            PortfolioItem(
                id="1",
                company="Сбербанк",
                description="Деловые костюмы для сотрудников банка",
                image="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&h=400&fit=crop",
                category="Банки",
                items_count=2500,
                year=2023
            ),
            PortfolioItem(
                id="2",
                company="Отель Четыре Сезона",
                description="Элегантная униформа для персонала отеля",
                image="https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500&h=400&fit=crop",
                category="HoReCa",
                items_count=350,
                year=2023
            ),
            PortfolioItem(
                id="3",
                company="М.Видео",
                description="Современная униформа для продавцов-консультантов",
                image="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500&h=400&fit=crop",
                category="Торговля",
                items_count=1200,
                year=2024
            ),
            PortfolioItem(
                id="4",
                company="Ресторан White Rabbit",
                description="Стильная одежда для поваров и официантов",
                image="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500&h=400&fit=crop",
                category="HoReCa",
                items_count=85,
                year=2024
            ),
            PortfolioItem(
                id="5",
                company="Бостон Консалтинг Групп",
                description="Премиум костюмы для консультантов",
                image="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=400&fit=crop",
                category="Консалтинг",
                items_count=180,
                year=2023
            ),
            PortfolioItem(
                id="6",
                company="Клиника Скандинавия",
                description="Медицинская форма для врачей и медсестер",
                image="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=500&h=400&fit=crop",
                category="Медицина",
                items_count=420,
                year=2024
            )
        ]
        
        # Sample testimonials data
        testimonials_data = [
            Testimonial(
                id="1",
                company="ООО 'Премиум Отели'",
                text="Сотрудничаем с AVIK уже 3 года. Качество униформы превосходное, сотрудники довольны комфортом и внешним видом.",
                author="Анна Петрова",
                position="Директор по закупкам",
                rating=5
            ),
            Testimonial(
                id="2",
                company="Банк 'Столичный'",
                text="AVIK помогли создать стильный корпоративный образ для наших сотрудников. Рекомендуем как надежного партнера.",
                author="Михаил Сидоров",
                position="HR-директор",
                rating=5
            ),
            Testimonial(
                id="3",
                company="Сеть ресторанов 'Вкус'",
                text="Профессиональный подход, быстрые сроки, отличное качество. Униформа от AVIK подчеркивает статус наших заведений.",
                author="Елена Козлова",
                position="Управляющий директор",
                rating=5
            )
        ]
        
        # Sample statistics data
        statistics_data = Statistics(
            id="1",
            years_in_business=15,
            completed_orders=5000,
            happy_clients=1200,
            cities=150
        )
        
        # Insert data
        for category in categories_data:
            db.add(category)
        
        for item in portfolio_data:
            db.add(item)
            
        for testimonial in testimonials_data:
            db.add(testimonial)
            
        db.add(statistics_data)
        
        # Sample products data
        import json
        products_data = [
            # Униформа для ресторанов и отелей
            {
                "product": SQLProduct(
                    id=str(uuid.uuid4()),
                    category_id="1",
                    name="Белая рубашка для официантов",
                    description="Классическая белая рубашка из премиум хлопка с добавлением эластана для комфорта в течение всей смены. Приталенный крой подчеркивает профессионализм персонала.",
                    short_description="Классическая белая рубашка из премиум хлопка",
                    price_from=1500,
                    price_to=2200,
                    material="Хлопок 95%, Эластан 5%",
                    sizes=json.dumps(["XS", "S", "M", "L", "XL", "XXL"]),
                    colors=json.dumps(["белый"]),
                    is_available=True,
                    featured=True
                ),
                "images": [
                    "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&h=600&fit=crop",
                    "https://images.unsplash.com/photo-1621976360623-004223992275?w=600&h=600&fit=crop"
                ],
                "characteristics": [
                    {"name": "Состав", "value": "Хлопок 95%, Эластан 5%"},
                    {"name": "Уход", "value": "Машинная стирка 40°C"},
                    {"name": "Крой", "value": "Приталенный"},
                    {"name": "Воротник", "value": "Классический"},
                    {"name": "Манжеты", "value": "На пуговицах"}
                ]
            },
            {
                "product": SQLProduct(
                    id=str(uuid.uuid4()),
                    category_id="1",
                    name="Фартук для официантов премиум",
                    description="Стильный фартук из плотного хлопка с кожаными вставками. Удобные карманы для блокнота и ручки. Регулируемые ремни для идеальной посадки.",
                    short_description="Стильный фартук с кожаными вставками",
                    price_from=2500,
                    price_to=3500,
                    material="Хлопок с кожаными вставками",
                    sizes=json.dumps(["Универсальный"]),
                    colors=json.dumps(["черный", "темно-синий", "серый"]),
                    is_available=True,
                    featured=True
                ),
                "images": [
                    "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&h=600&fit=crop",
                    "https://images.unsplash.com/photo-1556742044-3c52d6e88c62?w=600&h=600&fit=crop"
                ],
                "characteristics": [
                    {"name": "Материал", "value": "Хлопок + натуральная кожа"},
                    {"name": "Карманы", "value": "3 внутренних, 1 внешний"},
                    {"name": "Регулировка", "value": "Ремни с пряжками"},
                    {"name": "Уход", "value": "Машинная стирка 30°C"}
                ]
            },
            # Деловая и офисная одежда
            {
                "product": SQLProduct(
                    id=str(uuid.uuid4()),
                    category_id="2",
                    name="Женский деловой костюм-тройка",
                    description="Элегантный костюм-тройка состоящий из жакета, жилета и юбки. Выполнен из качественной костюмной ткани с добавлением эластана. Идеально подходит для создания делового образа.",
                    short_description="Элегантный костюм-тройка для деловых встреч",
                    price_from=8500,
                    price_to=12000,
                    material="Полиэстер 70%, Вискоза 25%, Эластан 5%",
                    sizes=json.dumps(["40", "42", "44", "46", "48", "50", "52"]),
                    colors=json.dumps(["черный", "темно-синий", "серый"]),
                    is_available=True,
                    featured=True
                ),
                "images": [
                    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=600&fit=crop",
                    "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=600&h=600&fit=crop"
                ],
                "characteristics": [
                    {"name": "Состав", "value": "Полиэстер 70%, Вискоза 25%, Эластан 5%"},
                    {"name": "Комплект", "value": "Жакет, жилет, юбка"},
                    {"name": "Подкладка", "value": "Полиэстер 100%"},
                    {"name": "Уход", "value": "Сухая чистка"},
                    {"name": "Сезон", "value": "Всесезонный"}
                ]
            },
            {
                "product": SQLProduct(
                    id=str(uuid.uuid4()),
                    category_id="2",
                    name="Мужская деловая рубашка Slim Fit",
                    description="Приталенная рубашка из качественного хлопка с добавлением эластана. Современный крой Slim Fit подчеркивает фигуру. Легко гладится и долго сохраняет безупречный вид.",
                    short_description="Приталенная рубашка современного кроя",
                    price_from=2800,
                    price_to=3500,
                    material="Хлопок 97%, Эластан 3%",
                    sizes=json.dumps(["37", "38", "39", "40", "41", "42", "43", "44"]),
                    colors=json.dumps(["белый", "голубой", "розовый", "мятный"]),
                    is_available=True,
                    featured=False
                ),
                "images": [
                    "https://images.unsplash.com/photo-1602810316498-ab67cf68c8e1?w=600&h=600&fit=crop",
                    "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=600&h=600&fit=crop"
                ],
                "characteristics": [
                    {"name": "Состав", "value": "Хлопок 97%, Эластан 3%"},
                    {"name": "Крой", "value": "Slim Fit"},
                    {"name": "Воротник", "value": "Классический 4 см"},
                    {"name": "Уход", "value": "Машинная стирка 40°C"},
                    {"name": "Особенности", "value": "Non-iron технология"}
                ]
            },
            # Униформа для торговых сетей
            {
                "product": SQLProduct(
                    id=str(uuid.uuid4()),
                    category_id="3",
                    name="Поло для продавцов-консультантов",
                    description="Комфортное поло из дышащей ткани пике. Усиленные швы для долговечности. Возможность нанесения логотипа компании методом вышивки или термопечати.",
                    short_description="Комфортное поло из дышащей ткани",
                    price_from=1200,
                    price_to=1800,
                    material="Хлопок 65%, Полиэстер 35%",
                    sizes=json.dumps(["XS", "S", "M", "L", "XL", "XXL", "3XL"]),
                    colors=json.dumps(["белый", "черный", "темно-синий", "бордовый", "серый"]),
                    is_available=True,
                    featured=True
                ),
                "images": [
                    "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&h=600&fit=crop",
                    "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=600&fit=crop"
                ],
                "characteristics": [
                    {"name": "Состав", "value": "Хлопок 65%, Полиэстер 35%"},
                    {"name": "Плотность", "value": "200 г/м²"},
                    {"name": "Воротник", "value": "Рубчик с застежкой на 2 пуговицы"},
                    {"name": "Брендирование", "value": "Вышивка/термопечать"},
                    {"name": "Уход", "value": "Машинная стирка 40°C"}
                ]
            },
            # Промо форма
            {
                "product": SQLProduct(
                    id=str(uuid.uuid4()),
                    category_id="4",
                    name="Яркая промо-футболка",
                    description="Яркая футболка для промо-акций и мероприятий. Качественная ткань, устойчивая к частым стиркам. Большая площадь для нанесения логотипа.",
                    short_description="Яркая футболка для промо-акций",
                    price_from=600,
                    price_to=900,
                    material="Хлопок 100%",
                    sizes=json.dumps(["XS", "S", "M", "L", "XL", "XXL"]),
                    colors=json.dumps(["красный", "синий", "зеленый", "желтый", "оранжевый"]),
                    is_available=True,
                    featured=False
                ),
                "images": [
                    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop",
                    "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=600&fit=crop"
                ],
                "characteristics": [
                    {"name": "Состав", "value": "Хлопок 100%"},
                    {"name": "Плотность", "value": "160 г/м²"},
                    {"name": "Горловина", "value": "Круглая с резинкой"},
                    {"name": "Брендирование", "value": "Шелкография/термопечать"},
                    {"name": "Уход", "value": "Машинная стирка 60°C"}
                ]
            },
            # Медицинская одежда
            {
                "product": SQLProduct(
                    id=str(uuid.uuid4()),
                    category_id="5",
                    name="Медицинский костюм премиум",
                    description="Комфортный медицинский костюм из инновационной дышащей ткани. Антибактериальная пропитка. Множество функциональных карманов.",
                    short_description="Комфортный медицинский костюм с антибактериальной пропиткой",
                    price_from=3200,
                    price_to=4500,
                    material="Полиэстер 65%, Хлопок 35% с антибактериальной пропиткой",
                    sizes=json.dumps(["40-42", "44-46", "48-50", "52-54", "56-58"]),
                    colors=json.dumps(["белый", "голубой", "мятный", "розовый"]),
                    is_available=True,
                    featured=True
                ),
                "images": [
                    "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=600&h=600&fit=crop",
                    "https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=600&h=600&fit=crop"
                ],
                "characteristics": [
                    {"name": "Состав", "value": "Полиэстер 65%, Хлопок 35%"},
                    {"name": "Обработка", "value": "Антибактериальная пропитка"},
                    {"name": "Карманы", "value": "6 функциональных"},
                    {"name": "Уход", "value": "Машинная стирка 60°C"},
                    {"name": "Комплект", "value": "Куртка + брюки"}
                ]
            },
            # Спецодежда
            {
                "product": SQLProduct(
                    id=str(uuid.uuid4()),
                    category_id="6",
                    name="Рабочий костюм усиленный",
                    description="Прочный рабочий костюм из износостойкой ткани. Усиленные швы, светоотражающие элементы. Подходит для работы на производстве и складах.",
                    short_description="Прочный рабочий костюм из износостойкой ткани",
                    price_from=2800,
                    price_to=4200,
                    material="Смесовая ткань (Полиэстер 65%, Хлопок 35%)",
                    sizes=json.dumps(["44-46", "48-50", "52-54", "56-58", "60-62"]),
                    colors=json.dumps(["темно-синий", "серый", "хаки"]),
                    is_available=True,
                    featured=False
                ),
                "images": [
                    "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&h=600&fit=crop",
                    "https://images.unsplash.com/photo-1606335192038-f5a05f761b3a?w=600&h=600&fit=crop"
                ],
                "characteristics": [
                    {"name": "Состав", "value": "Полиэстер 65%, Хлопок 35%"},
                    {"name": "Плотность", "value": "280 г/м²"},
                    {"name": "Усиления", "value": "На локтях и коленях"},
                    {"name": "СОП", "value": "Светоотражающие полосы"},
                    {"name": "Карманы", "value": "8 функциональных"},
                    {"name": "Комплект", "value": "Куртка + полукомбинезон"}
                ]
            }
        ]
        
        # Insert products with images and characteristics
        for product_data in products_data:
            product = product_data["product"]
            db.add(product)
            db.flush()  # Get the product ID
            
            # Add images
            for i, image_url in enumerate(product_data["images"]):
                image = SQLProductImage(
                    product_id=product.id,
                    image_url=image_url,
                    alt_text=f"{product.name} - изображение {i+1}",
                    order=i+1
                )
                db.add(image)
            
            # Add characteristics
            for i, char in enumerate(product_data["characteristics"]):
                characteristic = SQLProductCharacteristic(
                    product_id=product.id,
                    name=char["name"],
                    value=char["value"],
                    order=i+1
                )
                db.add(characteristic)
        
        # Initialize legal documents with templates
        legal_docs = [
            LegalDocument(
                doc_type="privacy_policy",
                title="Политика конфиденциальности",
                content="""# Политика конфиденциальности

## 1. Общие положения

Настоящая Политика конфиденциальности определяет порядок обработки и защиты ООО «Фабрика Униформы» (далее - Компания) информации о физических лицах (далее - Пользователи), которая может быть получена Компанией при использовании Пользователем сайта uniformfactory.ru.

## 2. Персональные данные

2.1. Компания собирает и хранит только те персональные данные, которые необходимы для предоставления услуг и выполнения договорных обязательств.

2.2. Персональные данные, которые мы можем собирать:
- ФИО
- Контактный телефон
- Адрес электронной почты
- Название компании
- Данные для доставки заказов

## 3. Цели обработки персональных данных

3.1. Обработка персональных данных осуществляется в целях:
- Предоставления информации об услугах
- Обработки заказов и заявок
- Связи с клиентами
- Улучшения качества обслуживания

## 4. Защита персональных данных

4.1. Компания применяет все необходимые технические и организационные меры для защиты персональных данных от несанкционированного доступа.

4.2. Доступ к персональным данным имеют только уполномоченные сотрудники Компании.

## 5. Права пользователей

5.1. Пользователь имеет право:
- Получать информацию о своих персональных данных
- Требовать уточнения, блокирования или уничтожения своих персональных данных
- Отозвать согласие на обработку персональных данных

## 6. Контакты

По всем вопросам, связанным с обработкой персональных данных, обращайтесь:

**Email:** mail@aviktime.ru  
**Телефон:** +7 (812) 648-17-54"""
            ),
            LegalDocument(
                doc_type="user_agreement",
                title="Пользовательское соглашение",
                content="""# Пользовательское соглашение

## 1. Общие положения

1.1. Настоящее Пользовательское соглашение (далее - Соглашение) регулирует отношения между ООО «Фабрика Униформы» (далее - Компания) и пользователем сайта uniformfactory.ru (далее - Пользователь).

1.2. Использование сайта означает согласие Пользователя с настоящим Соглашением.

## 2. Предмет соглашения

2.1. Компания предоставляет Пользователю доступ к информации о товарах и услугах, размещенной на сайте.

2.2. Услуги сайта предоставляются бесплатно.

## 3. Права и обязанности Пользователя

3.1. Пользователь обязуется:
- Предоставлять достоверную информацию при оформлении заказов
- Не использовать сайт в незаконных целях
- Соблюдать авторские права на содержимое сайта

3.2. Пользователь имеет право:
- Получать консультации по товарам и услугам
- Оформлять заказы на продукцию
- Отказаться от заказа до момента его исполнения

## 4. Права и обязанности Компании

4.1. Компания обязуется:
- Предоставлять актуальную информацию о товарах
- Обрабатывать заказы в установленные сроки
- Соблюдать конфиденциальность данных Пользователя

4.2. Компания имеет право:
- Изменять условия Соглашения
- Ограничивать доступ к сайту при нарушении условий
- Отказать в обработке заказа при наличии оснований

## 5. Ответственность

5.1. Компания не несет ответственности за:
- Временные технические сбои в работе сайта
- Действия третьих лиц
- Убытки, возникшие вследствие неправомерных действий Пользователя

## 6. Разрешение споров

6.1. Все споры решаются путем переговоров.

6.2. При недостижении согласия спор подлежит рассмотрению в суде по месту нахождения Компании.

## 7. Контактная информация

**ООО «Фабрика Униформы»**  
Email: mail@aviktime.ru  
Телефон: +7 (812) 648-17-54"""
            ),
            LegalDocument(
                doc_type="company_details",
                title="Реквизиты компании",
                content="""# Реквизиты компании

## Полное наименование

**Общество с ограниченной ответственностью «Фабрика Униформы»**  
Сокращенное наименование: **ООО «Фабрика Униформы»**

## Регистрационные данные

| Параметр | Значение |
|----------|----------|
| ИНН | 7813520496 |
| КПП | 780701001 |
| ОГРН | 111 784 752 98 54 |
| ОКПО | 30704158 |
| ОКВЭД | 14.12, 14.19.11, 14.19.21 |
| ОКОГУ | 49013 |
| ОКФС | 16 |
| ОКОПФ | 65 |
| ОКАТО | 402 885 650 00 |
| ОКТМО | 40357000 |

## Адреса

**Юридический адрес:**  
198334, Санкт-Петербург, пр. Ветеранов, д. 140, лит. Г

**Для почтовых отправлений:**  
198334, Санкт-Петербург, а/я 11

## Банковские реквизиты

| Параметр | Значение |
|----------|----------|
| Расчетный счет | 4070 2810 8221 0000 0574 |
| Банк | Филиал ПАО «Банк Уралсиб» г. Санкт-Петербург |
| Корр. счет | 3010 1810 8000 0000 0706 |
| БИК | 044 030 706 |

## Страховые взносы

| Параметр | Значение |
|----------|----------|
| ФСС | 7810123990 |
| ПФР | 088-026-045-044 |

## Контактная информация

**Телефон/Факс:** +7 (812) 648-17-54  
**Email:** mail@aviktime.ru  
**Сайт:** uniformfactory.ru

## Руководство

**Генеральный директор:** Аверкиев А.В.  
**Главный бухгалтер:** Аверкиев А.В."""
            )
        ]
        
        for doc in legal_docs:
            db.add(doc)
        
        db.commit()
        print("SQLite database initialized with sample data including products")
        
    except Exception as e:
        print(f"Error initializing database: {e}")
        db.rollback()
    finally:
        db.close()