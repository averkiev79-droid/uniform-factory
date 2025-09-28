from typing import List, Optional, Dict
from models import *
from database import *
import asyncio

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
    async def create_quote_request(request: QuoteRequestCreate) -> QuoteRequestResponse:
        """Create a new quote request"""
        quote_request = QuoteRequest(**request.dict())
        
        # Save to database
        await quote_requests_collection.insert_one(quote_request.dict())
        
        return QuoteRequestResponse(
            success=True,
            request_id=quote_request.request_id,
            message="Заявка принята. Мы свяжемся с вами в течение 2 часов."
        )
    
    @staticmethod
    async def get_quote_requests(status: Optional[str] = None) -> List[QuoteRequest]:
        """Get quote requests with optional status filter"""
        query = {}
        if status:
            query["status"] = status
            
        requests = await quote_requests_collection.find(query).to_list(1000)
        return [QuoteRequest(**request) for request in requests]

class ContactService:
    
    @staticmethod
    async def create_callback_request(request: CallbackRequestCreate) -> ContactRequestResponse:
        """Create callback request"""
        contact_request = ContactRequest(
            type=ContactType.CALLBACK,
            name=request.name,
            phone=request.phone
        )
        
        await contact_requests_collection.insert_one(contact_request.dict())
        
        return ContactRequestResponse(
            success=True,
            message="Заявка на обратный звонок принята. Мы перезвоним в течение 15 минут."
        )
    
    @staticmethod
    async def create_consultation_request(request: ConsultationRequestCreate) -> ContactRequestResponse:
        """Create consultation request"""
        contact_request = ContactRequest(
            type=ContactType.CONSULTATION,
            name=request.name,
            email=request.email,
            phone=request.phone,
            company=request.company,
            message=request.message
        )
        
        await contact_requests_collection.insert_one(contact_request.dict())
        
        return ContactRequestResponse(
            success=True,
            message="Заявка на консультацию принята. Мы свяжемся с вами в течение 2 часов."
        )

class CatalogService:
    
    @staticmethod
    async def get_categories() -> List[ProductCategory]:
        """Get all product categories"""
        categories = await categories_collection.find().to_list(1000)
        return [ProductCategory(**category) for category in categories]
    
    @staticmethod
    async def get_category_by_slug(slug: str) -> Optional[ProductCategory]:
        """Get category by slug"""
        category = await categories_collection.find_one({"slug": slug})
        return ProductCategory(**category) if category else None

class PortfolioService:
    
    @staticmethod
    async def get_portfolio_items(category: Optional[str] = None) -> List[PortfolioItem]:
        """Get portfolio items with optional category filter"""
        query = {}
        if category and category != "all":
            query["category"] = category
            
        items = await portfolio_collection.find(query).to_list(1000)
        return [PortfolioItem(**item) for item in items]
    
    @staticmethod
    async def get_portfolio_item_by_id(item_id: str) -> Optional[PortfolioItem]:
        """Get portfolio item by ID"""
        item = await portfolio_collection.find_one({"id": item_id})
        return PortfolioItem(**item) if item else None

class TestimonialService:
    
    @staticmethod
    async def get_testimonials() -> List[Testimonial]:
        """Get all testimonials"""
        testimonials = await testimonials_collection.find().to_list(1000)
        return [Testimonial(**testimonial) for testimonial in testimonials]

class StatisticsService:
    
    @staticmethod
    async def get_statistics() -> Optional[Statistics]:
        """Get company statistics"""
        stats = await statistics_collection.find_one()
        return Statistics(**stats) if stats else None