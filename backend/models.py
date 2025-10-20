from pydantic import BaseModel, Field, validator
from typing import List, Optional
from datetime import datetime
import uuid
from enum import Enum

# Enums
class RequestStatus(str, Enum):
    NEW = "new"
    IN_PROGRESS = "in_progress"
    CONTACTED = "contacted"
    COMPLETED = "completed"

class ContactType(str, Enum):
    CALLBACK = "callback"
    CONSULTATION = "consultation"

# MongoDB Models
class ProductCategory(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    image: str
    products_count: int
    slug: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class PortfolioItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company: str
    description: str
    image: str
    category: str
    items_count: int
    year: int
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Testimonial(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company: str
    text: str
    author: str
    position: str
    rating: int
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Statistics(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    years_in_business: int
    completed_orders: int
    happy_clients: int
    cities: int
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class QuoteRequest(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    request_id: str = Field(default_factory=lambda: f"REQ-{datetime.now().strftime('%Y')}-{str(uuid.uuid4())[:6].upper()}")
    name: str
    email: str
    phone: str
    company: Optional[str] = None
    category: str
    quantity: str
    fabric: str
    branding: str
    estimated_price: int
    status: RequestStatus = RequestStatus.NEW
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ContactRequest(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: ContactType
    name: str
    email: Optional[str] = None
    phone: str
    company: Optional[str] = None
    message: Optional[str] = None
    status: RequestStatus = RequestStatus.NEW
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# API Request/Response Models
class CalculatorEstimateRequest(BaseModel):
    category: str
    quantity: str
    fabric: str
    branding: str

class CalculatorEstimateResponse(BaseModel):
    estimated_price: int
    breakdown: dict

class QuoteRequestCreate(BaseModel):
    name: str
    email: str
    phone: str
    company: Optional[str] = None
    category: str
    quantity: str
    fabric: str
    branding: str
    estimated_price: int
    
    @validator('name', 'company', 'category', 'quantity', 'fabric', 'branding')
    def sanitize_text_fields(cls, v):
        if v is None:
            return v
        # Strip whitespace and limit length
        return v.strip()[:500] if isinstance(v, str) else v
    
    @validator('email')
    def validate_email(cls, v):
        import re
        v = v.strip().lower()
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, v):
            raise ValueError('Недопустимый формат email')
        return v
    
    @validator('phone')
    def validate_phone(cls, v):
        import re
        v = re.sub(r'[^\d+]', '', v)
        digits_only = re.sub(r'\D', '', v)
        if len(digits_only) < 10:
            raise ValueError('Недопустимый формат телефона')
        return v

class QuoteRequestResponse(BaseModel):
    success: bool
    request_id: str
    message: str

class CallbackRequestCreate(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    company: Optional[str] = None
    
    @validator('name', 'company')
    def sanitize_text_fields(cls, v):
        if v is None:
            return v
        return v.strip()[:500] if isinstance(v, str) else v
    
    @validator('email')
    def validate_email(cls, v):
        if v is None:
            return v
        import re
        v = v.strip().lower()
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, v):
            raise ValueError('Недопустимый формат email')
        return v
    
    @validator('phone')
    def validate_phone(cls, v):
        import re
        v = re.sub(r'[^\d+]', '', v)
        digits_only = re.sub(r'\D', '', v)
        if len(digits_only) < 10:
            raise ValueError('Недопустимый формат телефона')
        return v

class ConsultationRequestCreate(BaseModel):
    name: str
    email: str
    phone: str
    company: Optional[str] = None
    message: Optional[str] = None
    
    @validator('name', 'company', 'message')
    def sanitize_text_fields(cls, v):
        if v is None:
            return v
        return v.strip()[:500] if isinstance(v, str) else v
    
    @validator('email')
    def validate_email(cls, v):
        import re
        v = v.strip().lower()
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, v):
            raise ValueError('Недопустимый формат email')
        return v
    
    @validator('phone')
    def validate_phone(cls, v):
        import re
        v = re.sub(r'[^\d+]', '', v)
        digits_only = re.sub(r'\D', '', v)
        if len(digits_only) < 10:
            raise ValueError('Недопустимый формат телефона')
        return v

class ContactRequestResponse(BaseModel):
    success: bool
    message: str

# General Contact Message
class ContactMessageCreate(BaseModel):
    name: str
    email: str
    phone: str
    company: Optional[str] = None
    message: str
    
    @validator('name', 'company', 'message')
    def sanitize_text_fields(cls, v):
        if v is None:
            return v
        return v.strip()[:1000] if isinstance(v, str) else v  # message can be longer
    
    @validator('email')
    def validate_email(cls, v):
        import re
        v = v.strip().lower()
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, v):
            raise ValueError('Недопустимый формат email')
        return v
    
    @validator('phone')
    def validate_phone(cls, v):
        import re
        v = re.sub(r'[^\d+]', '', v)
        digits_only = re.sub(r'\D', '', v)
        if len(digits_only) < 10:
            raise ValueError('Недопустимый формат телефона')
        return v

# Calculator Options
class CalculatorCategory(BaseModel):
    id: str
    name: str
    base_price: int

class CalculatorQuantity(BaseModel):
    range: str
    multiplier: float

class CalculatorFabric(BaseModel):
    id: str
    name: str
    multiplier: float

class CalculatorBranding(BaseModel):
    id: str
    name: str
    price: int

class CalculatorOptions(BaseModel):
    categories: List[CalculatorCategory]
    quantities: List[CalculatorQuantity]
    fabrics: List[CalculatorFabric]
    branding: List[CalculatorBranding]

# Product Models
class ProductImage(BaseModel):
    id: Optional[str] = None
    product_id: str
    image_url: str
    alt_text: Optional[str] = None
    order: int = 1

class ProductCharacteristic(BaseModel):
    id: Optional[str] = None
    product_id: str
    name: str
    value: str
    order: int = 1

class Product(BaseModel):
    id: Optional[str] = None
    category_id: str
    name: str
    article: Optional[str] = None  # Артикул товара
    description: str
    short_description: Optional[str] = None
    price_from: int
    price_to: Optional[int] = None
    material: Optional[str] = None
    sizes: Optional[List[str]] = None
    colors: Optional[List[str]] = None
    is_available: bool = True
    featured: bool = False
    views_count: int = 0  # Для аналитики
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class ProductCreate(BaseModel):
    category_id: str
    name: str
    article: Optional[str] = None  # Артикул товара
    description: str
    short_description: Optional[str] = None
    price_from: int
    price_to: Optional[int] = None
    material: Optional[str] = None
    sizes: Optional[List[str]] = None
    colors: Optional[List[str]] = None
    is_available: bool = True
    featured: bool = False
    images: Optional[List[str]] = None  # URLs
    characteristics: Optional[List[dict]] = None  # [{"name": "Ткань", "value": "Хлопок"}]

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    short_description: Optional[str] = None
    price_from: Optional[int] = None
    price_to: Optional[int] = None
    material: Optional[str] = None
    sizes: Optional[List[str]] = None
    colors: Optional[List[str]] = None
    is_available: Optional[bool] = None
    featured: Optional[bool] = None

class ProductWithDetails(Product):
    images: List[ProductImage] = []
    characteristics: List[ProductCharacteristic] = []
    category_name: Optional[str] = None


# App Settings Models
class AppSettingsModel(BaseModel):
    id: str = "default"
    hero_image: str = "/images/hero-main.jpg"
    hero_mobile_image: Optional[str] = None
    about_image: Optional[str] = None
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class AppSettingsUpdate(BaseModel):
    hero_image: Optional[str] = None
    hero_mobile_image: Optional[str] = None
    about_image: Optional[str] = None

# Web Vitals Models
class WebVitalsMetric(BaseModel):
    name: str
    value: float
    rating: Optional[str] = None
    delta: Optional[float] = None
    id: Optional[str] = None
    navigationType: Optional[str] = None


# Legal Documents Models
class LegalDocumentModel(BaseModel):
    id: str
    doc_type: str
    title: str
    content: str
    updated_at: datetime
    created_at: datetime

class LegalDocumentUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None

    page: str
    timestamp: str

    hero_image: Optional[str] = None
    hero_mobile_image: Optional[str] = None
    about_image: Optional[str] = None
