from sqlalchemy import create_engine, Column, String, Integer, DateTime, Text, ForeignKey, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
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

# Product Tables
class SQLProduct(Base):
    __tablename__ = "products"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    category_id = Column(String, ForeignKey("product_categories.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    short_description = Column(String)
    price_from = Column(Integer, nullable=False)
    price_to = Column(Integer)
    material = Column(String)
    sizes = Column(String)  # JSON string
    colors = Column(String)  # JSON string
    is_available = Column(Boolean, default=True)
    featured = Column(Boolean, default=False)
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
        
        db.commit()
        print("SQLite database initialized with sample data")
        
    except Exception as e:
        print(f"Error initializing database: {e}")
        db.rollback()
    finally:
        db.close()