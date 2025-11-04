from fastapi import FastAPI, APIRouter, HTTPException, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pathlib import Path
import os
import logging
from contextlib import asynccontextmanager

# Import SQLite modules
from models import *
from services_sqlite import *
from database_sqlite import init_sqlite_database

# Import admin routes
from admin_routes import admin_router

# Import email service
from email_service import send_quote_notification_email, send_callback_notification_email, send_contact_message_email, EmailDeliveryError

# Import Telegram service
from telegram_service import TelegramService

# Import security middleware
from security_middleware import SecurityHeadersMiddleware, RateLimitMiddleware, sanitize_string, sanitize_email, sanitize_phone

# Import geo service
from geo_service import get_region_by_ip

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Lifespan manager for startup/shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    init_sqlite_database()
    yield
    # Shutdown - SQLite doesn't need explicit closing

# Create FastAPI app
app = FastAPI(lifespan=lifespan)

# Create API router
api_router = APIRouter(prefix="/api")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add security middlewares
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RateLimitMiddleware)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Basic health check
@api_router.get("/")
async def root():
    return {"message": "Uniform Factory API with SQLite"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "uniform-factory-api", "database": "sqlite"}

@api_router.get("/region")
async def get_user_region(request: Request):
    """
    Определяет регион пользователя по IP адресу и возвращает соответствующий телефон
    
    Возвращает:
    - ip: IP адрес пользователя
    - city: Город
    - region: Регион
    - country: Страна
    - phone: Телефон для региона
    - source: Источник данных (ipapi/fallback/local)
    """
    try:
        # Получаем IP из заголовков (если за прокси) или из клиента
        client_ip = request.client.host
        forwarded_for = request.headers.get("X-Forwarded-For")
        real_ip = request.headers.get("X-Real-IP")
        
        # Используем первый доступный IP
        ip_address = forwarded_for.split(",")[0].strip() if forwarded_for else (real_ip or client_ip)
        
        logger.info(f"Getting region for IP: {ip_address}")
        
        # Получаем регион и телефон
        result = get_region_by_ip(ip_address)
        
        return result
    except Exception as e:
        logger.error(f"Error in get_user_region: {str(e)}")
        # Возвращаем fallback в случае ошибки
        return {
            "ip": "unknown",
            "city": "Unknown",
            "region": "Unknown",
            "country": "RU",
            "phone": "+7 (812) 317-73-19",
            "source": "error"
        }

# Categories endpoints
@api_router.get("/categories")
async def get_categories():
    """Get all product categories"""
    try:
        categories = CatalogService.get_categories()
        return categories
    except Exception as e:
        logger.error(f"Error getting categories: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.get("/categories/{slug}")
async def get_category_by_slug(slug: str):
    """Get category by slug"""
    try:
        category = CatalogService.get_category_by_slug(slug)
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
        return category
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting category {slug}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Portfolio endpoints
@api_router.get("/portfolio")
async def get_portfolio(category: Optional[str] = None):
    """Get portfolio items with optional category filter"""
    try:
        items = PortfolioService.get_portfolio_items(category)
        return items
    except Exception as e:
        logger.error(f"Error getting portfolio: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.get("/portfolio/{item_id}")
async def get_portfolio_item(item_id: str):
    """Get portfolio item by ID"""
    try:
        item = PortfolioService.get_portfolio_item_by_id(item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Portfolio item not found")
        return item
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting portfolio item {item_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Calculator endpoints
@api_router.get("/calculator/options")
async def get_calculator_options():
    """Get calculator configuration options"""
    try:
        return CalculatorService.get_calculator_options()
    except Exception as e:
        logger.error(f"Error getting calculator options: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.post("/calculator/estimate")
async def calculate_estimate(request: CalculatorEstimateRequest):
    """Calculate price estimate"""
    try:
        estimate = CalculatorService.calculate_estimate(request)
        return estimate
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error calculating estimate: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.post("/calculator/quote-request")
async def create_quote_request(request: QuoteRequestCreate, background_tasks: BackgroundTasks):
    """Create a new quote request"""
    try:
        response = QuoteService.create_quote_request(request)
        
        # Prepare notification data
        from datetime import datetime
        request_data = {
            'request_id': response.request_id,
            'name': request.name,
            'email': request.email,
            'phone': request.phone,
            'company': request.company,
            'category': request.category,
            'quantity': request.quantity,
            'fabric': request.fabric,
            'branding': request.branding,
            'estimated_price': request.estimated_price,
            'created_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        
        # Send email notification in background
        if os.getenv('SENDER_EMAIL') and os.getenv('EMAIL_PASSWORD'):
            background_tasks.add_task(send_quote_notification_email, request_data)
        
        # Send Telegram notification in background
        background_tasks.add_task(TelegramService.send_quote_request_notification, request_data)
        
        return response
    except Exception as e:
        logger.error(f"Error creating quote request: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Contact endpoints
@api_router.post("/contact/callback-request")
async def create_callback_request(request: CallbackRequestCreate, background_tasks: BackgroundTasks):
    """Create callback request"""
    try:
        response = ContactService.create_callback_request(request)
        
        # Prepare notification data
        from datetime import datetime
        request_data = {
            'name': request.name,
            'phone': request.phone,
            'email': request.email,
            'company': request.company,
            'message': getattr(request, 'message', None),
            'created_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        
        # Send email notification in background
        if os.getenv('SENDER_EMAIL') and os.getenv('EMAIL_PASSWORD'):
            background_tasks.add_task(send_callback_notification_email, request_data)
        
        # Send Telegram notification in background
        background_tasks.add_task(TelegramService.send_callback_request_notification, request_data)
        
        return response
    except Exception as e:
        logger.error(f"Error creating callback request: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.post("/contact/consultation")
async def create_consultation_request(request: ConsultationRequestCreate, background_tasks: BackgroundTasks):
    """Create consultation request"""
    try:
        response = ContactService.create_consultation_request(request)
        
        # Prepare notification data
        from datetime import datetime
        request_data = {
            'name': request.name,
            'phone': request.phone,
            'email': request.email,
            'company': request.company,
            'message': getattr(request, 'message', None),
            'created_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        
        # Send email notification in background
        if os.getenv('SENDER_EMAIL') and os.getenv('EMAIL_PASSWORD'):
            background_tasks.add_task(send_callback_notification_email, request_data)
        
        # Send Telegram notification in background
        background_tasks.add_task(TelegramService.send_consultation_request_notification, request_data)
        
        return response
    except Exception as e:
        logger.error(f"Error creating consultation request: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.post("/contact/message")
async def create_contact_message(request: ContactMessageCreate, background_tasks: BackgroundTasks):
    """Create general contact message"""
    try:
        response = ContactService.create_contact_message(request)
        
        # Prepare notification data
        from datetime import datetime
        request_data = {
            'name': request.name,
            'email': request.email,
            'phone': request.phone,
            'company': request.company,
            'message': request.message,
            'created_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        
        # Send email notification in background
        if os.getenv('SENDER_EMAIL') and os.getenv('EMAIL_PASSWORD'):
            background_tasks.add_task(send_contact_message_email, request_data)
        
        # Send Telegram notification in background
        background_tasks.add_task(TelegramService.send_contact_message_notification, request_data)
        
        return response
    except Exception as e:
        logger.error(f"Error creating contact message: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Cart Order endpoint
@api_router.post("/cart/submit-order")
async def submit_cart_order(order: CartOrderCreate, background_tasks: BackgroundTasks):
    """Submit order from cart"""
    try:
        from datetime import datetime
        from database_sqlite import SessionLocal, QuoteRequest as DBQuoteRequest
        import uuid
        
        db = SessionLocal()
        try:
            # Save order as quote request
            order_id = str(uuid.uuid4())
            request_id = f"CART-{datetime.now().strftime('%Y')}-{str(uuid.uuid4())[:6].upper()}"
            
            # Format items for storage
            items_list = []
            for item in order.items:
                item_text = f"- {item.product_name} (Арт. {item.article or 'N/A'})\n"
                item_text += f"  Цвет: {item.color or 'не указан'}, Размер: {item.size or 'не указан'}, Материал: {item.material or 'не указан'}\n"
                
                # Add branding if exists
                if item.branding and len(item.branding) > 0:
                    branding_text = ", ".join([
                        f"{b.get('type')} - {b.get('location', {}).get('name')} ({b.get('location', {}).get('size')})"
                        for b in item.branding
                    ])
                    item_text += f"  Нанесение: {branding_text} (+{item.branding_price} ₽)\n"
                
                item_text += f"  Количество: {item.quantity} шт, Цена: от {item.price_from} ₽"
                items_list.append(item_text)
            
            items_text = "\n".join(items_list)
            
            full_message = f"ЗАКАЗ ИЗ КОРЗИНЫ\n\n{items_text}\n\nИтого: от {order.total_amount} ₽"
            if order.comment:
                full_message += f"\n\nКомментарий: {order.comment}"
            
            db_order = DBQuoteRequest(
                id=order_id,
                request_id=request_id,
                name=order.customer_name,
                phone=order.customer_phone,
                email=order.customer_email,
                company="",
                category="Заказ из корзины",
                quantity=f"{sum([item.quantity for item in order.items])} товаров",
                fabric="",
                branding="",
                estimated_price=order.total_amount,
                status="new"
            )
            db.add(db_order)
            db.commit()
            
            # Prepare notification data
            order_data = {
                'request_id': request_id,
                'name': order.customer_name,
                'phone': order.customer_phone,
                'email': order.customer_email,
                'items': [
                    {
                        'name': item.product_name,
                        'article': item.article or 'N/A',
                        'color': item.color or 'не указан',
                        'size': item.size or 'не указан',
                        'material': item.material or 'не указан',
                        'branding': item.branding or [],
                        'branding_price': item.branding_price or 0,
                        'quantity': item.quantity,
                        'price_from': item.price_from
                    }
                    for item in order.items
                ],
                'total_amount': order.total_amount,
                'comment': order.comment,
                'created_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }
            
            # Send Telegram notification in background
            background_tasks.add_task(TelegramService.send_cart_order_notification, order_data)
            
            # Send email if configured
            if os.getenv('SENDER_EMAIL') and os.getenv('EMAIL_PASSWORD'):
                background_tasks.add_task(send_quote_notification_email, {
                    'request_id': request_id,
                    'name': order.customer_name,
                    'email': order.customer_email,
                    'phone': order.customer_phone,
                    'company': '',
                    'category': 'Заказ из корзины',
                    'quantity': f"{sum([item.quantity for item in order.items])} товаров",
                    'fabric': '',
                    'branding': '',
                    'estimated_price': order.total_amount,
                    'created_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                })
            
            return {
                'success': True,
                'message': 'Заказ успешно отправлен на расчет',
                'request_id': request_id
            }
        finally:
            db.close()
    except Exception as e:
        logger.error(f"Error submitting cart order: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Testimonials endpoint
@api_router.get("/testimonials")
async def get_testimonials():
    """Get all testimonials"""
    try:
        testimonials = TestimonialService.get_testimonials()
        return testimonials
    except Exception as e:
        logger.error(f"Error getting testimonials: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Statistics endpoint
@api_router.get("/statistics")
async def get_statistics():
    """Get company statistics"""
    try:
        stats = StatisticsService.get_statistics()
        if not stats:
            raise HTTPException(status_code=404, detail="Statistics not found")
        return stats
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting statistics: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.get("/settings")
async def get_settings():
    """Get app settings (public endpoint for frontend)"""
    try:
        settings = SettingsService.get_settings()
        return settings
    except Exception as e:
        logger.error(f"Error getting settings: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Legal Documents endpoints (public)
@api_router.get("/legal/{doc_type}")
async def get_legal_document_public(doc_type: str):
    """Get legal document (public access)"""
    try:
        from database_sqlite import LegalDocument, SessionLocal
        
        db = SessionLocal()
        try:
            doc = db.query(LegalDocument).filter(LegalDocument.doc_type == doc_type).first()
            if not doc:
                raise HTTPException(status_code=404, detail="Document not found")
            
            return {
                'id': doc.id,
                'doc_type': doc.doc_type,
                'title': doc.title,
                'content': doc.content,
                'updated_at': doc.updated_at.isoformat()
            }
        finally:
            db.close()
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting legal document: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Analytics endpoints
@api_router.post("/analytics/web-vitals")
async def save_web_vitals(metric: WebVitalsMetric):
    """Save Web Vitals metric"""
    try:
        from database_sqlite import WebVitals, SessionLocal
        from datetime import datetime
        
        db = SessionLocal()
        try:
            web_vital = WebVitals(
                name=metric.name,
                value=metric.value,
                rating=metric.rating,
                delta=metric.delta,
                metric_id=metric.id,
                navigation_type=metric.navigationType,
                page=metric.page,
                timestamp=datetime.fromisoformat(metric.timestamp.replace('Z', '+00:00'))
            )
            db.add(web_vital)
            db.commit()
            return {"success": True}
        finally:
            db.close()
    except Exception as e:
        logger.error(f"Error saving web vitals: {e}")
        return {"success": False}

# Admin endpoints (for future use)
@api_router.get("/admin/quote-requests")
async def get_quote_requests(status: Optional[str] = None):
    """Get quote requests (admin only)"""
    try:
        requests = QuoteService.get_quote_requests(status)
        return requests
    except Exception as e:
        logger.error(f"Error getting quote requests: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Product endpoints
@api_router.get("/products")
async def get_all_products():
    """Get all products"""
    try:
        from services_sqlite import ProductService
        products = ProductService.get_all_products()
        return products
    except Exception as e:
        logger.error(f"Error getting products: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@api_router.get("/products/search")
async def search_products(
    q: Optional[str] = None,
    category_id: Optional[str] = None,
    price_from: Optional[int] = None,
    price_to: Optional[int] = None,
    material: Optional[str] = None,
    limit: int = 50
):
    """
    Search and filter products
    
    Query parameters:
    - q: Search query (название или артикул)
    - category_id: Filter by category ID
    - price_from: Minimum price
    - price_to: Maximum price  
    - material: Filter by material
    - limit: Max results (default 50)
    """
    try:
        from services_sqlite import ProductService
        products = ProductService.search_products(
            query=q,
            category_id=category_id,
            price_from=price_from,
            price_to=price_to,
            material=material,
            limit=limit
        )
        return products
    except Exception as e:
        logger.error(f"Error searching products: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@api_router.get("/products/category/{category_id}")
async def get_products_by_category(category_id: str):
    """Get products by category"""
    try:
        from services_sqlite import ProductService
        products = ProductService.get_products_by_category(category_id)
        return products
    except Exception as e:
        logger.error(f"Error getting products by category: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.get("/products/{product_id}")
async def get_product_by_id(product_id: str):
    """Get product by ID and increment views"""
    try:
        from services_sqlite import ProductService
        product = ProductService.get_product_by_id(product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        # Increment views count for analytics
        ProductService.increment_views(product_id)
        
        return product
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting product by id: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.post("/products")
async def create_product(product: ProductCreate):
    """Create new product"""


# Analytics endpoints
@api_router.get("/analytics/overview")
async def get_analytics_overview():
    """Get analytics overview (popular products, categories, conversion, etc.)"""
    try:
        from services_sqlite import AnalyticsService
        analytics = AnalyticsService.get_analytics_overview()
        return analytics
    except Exception as e:
        logger.error(f"Error getting analytics overview: {e}")


# SEO endpoints
@api_router.get("/sitemap.xml")
async def get_sitemap():
    """Generate and return sitemap.xml"""
    try:
        from pathlib import Path
        from fastapi.responses import Response
        import subprocess
        
        # Generate fresh sitemap
        subprocess.run(['python3', 'generate_sitemap.py'], cwd='/app/backend', check=True)
        
        # Read and return sitemap
        sitemap_path = Path('/app/backend/sitemap.xml')
        if sitemap_path.exists():
            with open(sitemap_path, 'r', encoding='utf-8') as f:
                content = f.read()
            return Response(content=content, media_type='application/xml')
        else:
            raise HTTPException(status_code=404, detail="Sitemap not found")
    except Exception as e:
        logger.error(f"Error generating sitemap: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate sitemap")

@api_router.get("/yandex_b5b79ad64d21de08.html")
async def yandex_verification():
    """Return Yandex verification file"""
    from fastapi.responses import HTMLResponse
    return HTMLResponse(content="<html><body>Verification: b5b79ad64d21de08</body></html>")


@api_router.get("/robots.txt")
async def get_robots():
    """Return robots.txt"""
    from fastapi.responses import PlainTextResponse
    
    robots_txt = """User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/admin
Disallow: /calculator/result
Disallow: /favorites

# Yandex
User-agent: Yandex
Allow: /
Disallow: /admin
Disallow: /api/admin

# Google
User-agent: Googlebot
Allow: /
Disallow: /admin
Disallow: /api/admin

# Sitemaps
Sitemap: https://uniformfactory.ru/sitemap.xml
Sitemap: https://uniformfactory.ru/api/sitemap.xml

# Crawl-delay
Crawl-delay: 1

# Block bad bots
User-agent: AhrefsBot
Disallow: /

User-agent: SemrushBot
Disallow: /
"""
    return PlainTextResponse(content=robots_txt)


# Serve uploaded files (public access)
from fastapi.responses import FileResponse
from pathlib import Path as FilePath

UPLOAD_DIR = FilePath("uploads")

@api_router.get("/uploads/{filename}")
async def serve_uploaded_file(filename: str):
    """Serve uploaded files publicly"""
    from fastapi.responses import FileResponse
    file_path = UPLOAD_DIR / filename
    if file_path.exists() and file_path.is_file():
        response = FileResponse(file_path)
        # Explicitly add CORS headers for images
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "*"
        response.headers["Cache-Control"] = "public, max-age=31536000"
        return response
    raise HTTPException(status_code=404, detail="File not found")

@api_router.options("/uploads/{filename}")
async def options_uploaded_file(filename: str):
    """Handle CORS preflight for uploaded files"""
    from fastapi.responses import Response
    response = Response()
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "*"
    return response


# Include router in app
app.include_router(api_router)

# Admin routes
app.include_router(admin_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)