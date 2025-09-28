from typing import List, Optional
from sqlalchemy.orm import Session
from database_sqlite import (
    SessionLocal, 
    ProductCategory as SQLProductCategory, 
    PortfolioItem as SQLPortfolioItem, 
    Testimonial as SQLTestimonial, 
    Statistics as SQLStatistics, 
    QuoteRequest as SQLQuoteRequest, 
    ContactRequest as SQLContactRequest
)
from models import *
import uuid
from datetime import datetime

class CalculatorService:
    
    @staticmethod
    def get_calculator_options() -> CalculatorOptions:
        """Get calculator configuration options"""
        return CalculatorOptions(
            categories=[
                CalculatorCategory(id="shirts", name="Рубашки/Блузы", base_price=1200),
                CalculatorCategory(id="suits", name="Костюмы", base_price=3500),
                CalculatorCategory(id="dresses", name="Платья", base_price=2100),
                CalculatorCategory(id="aprons", name="Фартуки", base_price=800),
                CalculatorCategory(id="jackets", name="Жакеты/Пиджаки", base_price=2800),
                CalculatorCategory(id="workwear", name="Спецодежда", base_price=1800)
            ],
            quantities=[
                CalculatorQuantity(range="1-10", multiplier=1.5),
                CalculatorQuantity(range="11-50", multiplier=1.2),
                CalculatorQuantity(range="51-100", multiplier=1.1),
                CalculatorQuantity(range="101-500", multiplier=1.0),
                CalculatorQuantity(range="501+", multiplier=0.9)
            ],
            fabrics=[
                CalculatorFabric(id="cotton", name="Хлопок", multiplier=1.0),
                CalculatorFabric(id="polyester", name="Полиэстер", multiplier=0.8),
                CalculatorFabric(id="wool", name="Шерсть", multiplier=1.4),
                CalculatorFabric(id="premium", name="Премиум ткани", multiplier=1.8)
            ],
            branding=[
                CalculatorBranding(id="none", name="Без нанесения", price=0),
                CalculatorBranding(id="embroidery", name="Вышивка", price=150),
                CalculatorBranding(id="print", name="Печать", price=80),
                CalculatorBranding(id="both", name="Вышивка + Печать", price=200)
            ]
        )
    
    @staticmethod
    def calculate_estimate(request: CalculatorEstimateRequest) -> CalculatorEstimateResponse:
        """Calculate price estimate based on parameters"""
        options = CalculatorService.get_calculator_options()
        
        # Find matching options
        category = next((c for c in options.categories if c.id == request.category), None)
        quantity = next((q for q in options.quantities if q.range == request.quantity), None)
        fabric = next((f for f in options.fabrics if f.id == request.fabric), None)
        branding = next((b for b in options.branding if b.id == request.branding), None)
        
        if not all([category, quantity, fabric, branding]):
            raise ValueError("Invalid calculator parameters")
        
        # Calculate price
        base_price = category.base_price
        quantity_multiplier = quantity.multiplier
        fabric_multiplier = fabric.multiplier
        branding_price = branding.price
        
        total_price = int((base_price * quantity_multiplier * fabric_multiplier) + branding_price)
        
        breakdown = {
            "basePrice": base_price,
            "quantityMultiplier": quantity_multiplier,
            "fabricMultiplier": fabric_multiplier,
            "brandingPrice": branding_price
        }
        
        return CalculatorEstimateResponse(
            estimated_price=total_price,
            breakdown=breakdown
        )

class QuoteService:
    
    @staticmethod
    def create_quote_request(request: QuoteRequestCreate) -> QuoteRequestResponse:
        """Create a new quote request"""
        db = SessionLocal()
        try:
            request_id = f"REQ-{datetime.now().strftime('%Y')}-{str(uuid.uuid4())[:6].upper()}"
            
            quote_request = SQLQuoteRequest(
                request_id=request_id,
                name=request.name,
                email=request.email,
                phone=request.phone,
                company=request.company,
                category=request.category,
                quantity=request.quantity,
                fabric=request.fabric,
                branding=request.branding,
                estimated_price=request.estimated_price,
                status="new"
            )
            
            db.add(quote_request)
            db.commit()
            
            return QuoteRequestResponse(
                success=True,
                request_id=request_id,
                message="Заявка принята. Мы свяжемся с вами в течение 2 часов."
            )
        finally:
            db.close()
    
    @staticmethod
    def get_quote_requests(status: Optional[str] = None) -> List[dict]:
        """Get quote requests with optional status filter"""
        db = SessionLocal()
        try:
            query = db.query(SQLQuoteRequest)
            if status:
                query = query.filter(SQLQuoteRequest.status == status)
            
            requests = query.all()
            return [
                {
                    "id": req.id,
                    "request_id": req.request_id,
                    "name": req.name,
                    "email": req.email,
                    "phone": req.phone,
                    "company": req.company,
                    "category": req.category,
                    "quantity": req.quantity,
                    "fabric": req.fabric,
                    "branding": req.branding,
                    "estimated_price": req.estimated_price,
                    "status": req.status,
                    "created_at": req.created_at,
                    "updated_at": req.updated_at
                }
                for req in requests
            ]
        finally:
            db.close()

class ContactService:
    
    @staticmethod
    def create_callback_request(request: CallbackRequestCreate) -> ContactRequestResponse:
        """Create callback request"""
        db = SessionLocal()
        try:
            contact_request = SQLContactRequest(
                type="callback",
                name=request.name,
                phone=request.phone,
                status="new"
            )
            
            db.add(contact_request)
            db.commit()
            
            return ContactRequestResponse(
                success=True,
                message="Заявка на обратный звонок принята. Мы перезвоним в течение 15 минут."
            )
        finally:
            db.close()
    
    @staticmethod
    def create_consultation_request(request: ConsultationRequestCreate) -> ContactRequestResponse:
        """Create consultation request"""
        db = SessionLocal()
        try:
            contact_request = SQLContactRequest(
                type="consultation",
                name=request.name,
                email=request.email,
                phone=request.phone,
                company=request.company,
                message=request.message,
                status="new"
            )
            
            db.add(contact_request)
            db.commit()
            
            return ContactRequestResponse(
                success=True,
                message="Заявка на консультацию принята. Мы свяжемся с вами в течение 2 часов."
            )
        finally:
            db.close()

class CatalogService:
    
    @staticmethod
    def get_categories() -> List[dict]:
        """Get all product categories"""
        db = SessionLocal()
        try:
            categories = db.query(SQLProductCategory).all()
            return [
                {
                    "id": cat.id,
                    "title": cat.title,
                    "description": cat.description,
                    "image": cat.image,
                    "products_count": cat.products_count,
                    "slug": cat.slug,
                    "created_at": cat.created_at,
                    "updated_at": cat.updated_at
                }
                for cat in categories
            ]
        finally:
            db.close()
    
    @staticmethod
    def get_category_by_slug(slug: str) -> Optional[dict]:
        """Get category by slug"""
        db = SessionLocal()
        try:
            category = db.query(SQLProductCategory).filter(SQLProductCategory.slug == slug).first()
            if category:
                return {
                    "id": category.id,
                    "title": category.title,
                    "description": category.description,
                    "image": category.image,
                    "products_count": category.products_count,
                    "slug": category.slug,
                    "created_at": category.created_at,
                    "updated_at": category.updated_at
                }
            return None
        finally:
            db.close()

class PortfolioService:
    
    @staticmethod
    def get_portfolio_items(category: Optional[str] = None) -> List[dict]:
        """Get portfolio items with optional category filter"""
        db = SessionLocal()
        try:
            query = db.query(PortfolioItem)
            if category and category != "all":
                query = query.filter(PortfolioItem.category == category)
            
            items = query.all()
            return [
                {
                    "id": item.id,
                    "company": item.company,
                    "description": item.description,
                    "image": item.image,
                    "category": item.category,
                    "items_count": item.items_count,
                    "year": item.year,
                    "created_at": item.created_at,
                    "updated_at": item.updated_at
                }
                for item in items
            ]
        finally:
            db.close()
    
    @staticmethod
    def get_portfolio_item_by_id(item_id: str) -> Optional[dict]:
        """Get portfolio item by ID"""
        db = SessionLocal()
        try:
            item = db.query(PortfolioItem).filter(PortfolioItem.id == item_id).first()
            if item:
                return {
                    "id": item.id,
                    "company": item.company,
                    "description": item.description,
                    "image": item.image,
                    "category": item.category,
                    "items_count": item.items_count,
                    "year": item.year,
                    "created_at": item.created_at,
                    "updated_at": item.updated_at
                }
            return None
        finally:
            db.close()

class TestimonialService:
    
    @staticmethod
    def get_testimonials() -> List[dict]:
        """Get all testimonials"""
        db = SessionLocal()
        try:
            testimonials = db.query(Testimonial).all()
            return [
                {
                    "id": test.id,
                    "company": test.company,
                    "text": test.text,
                    "author": test.author,
                    "position": test.position,
                    "rating": test.rating,
                    "created_at": test.created_at,
                    "updated_at": test.updated_at
                }
                for test in testimonials
            ]
        finally:
            db.close()

class StatisticsService:
    
    @staticmethod
    def get_statistics() -> Optional[dict]:
        """Get company statistics"""
        db = SessionLocal()
        try:
            stats = db.query(Statistics).first()
            if stats:
                return {
                    "id": stats.id,
                    "years_in_business": stats.years_in_business,
                    "completed_orders": stats.completed_orders,
                    "happy_clients": stats.happy_clients,
                    "cities": stats.cities,
                    "updated_at": stats.updated_at
                }
            return None
        finally:
            db.close()