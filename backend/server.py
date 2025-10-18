from fastapi import FastAPI, APIRouter, HTTPException, BackgroundTasks
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
        
        # Send email notification in background
        if os.getenv('SENDER_EMAIL') and os.getenv('EMAIL_PASSWORD'):
            request_data = {
                'request_id': response.get('request_id'),
                'name': request.name,
                'email': request.email,
                'phone': request.phone,
                'company': request.company,
                'category': request.category,
                'quantity': request.quantity,
                'fabric': request.fabric,
                'branding': request.branding,
                'estimated_price': request.estimated_price,
                'created_at': response.get('created_at')
            }
            background_tasks.add_task(send_quote_notification_email, request_data)
        
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
        
        # Send email notification in background
        if os.getenv('SENDER_EMAIL') and os.getenv('EMAIL_PASSWORD'):
            request_data = {
                'name': request.name,
                'phone': request.phone,
                'email': request.email,
                'company': request.company,
                'message': getattr(request, 'message', None),
                'created_at': response.get('created_at')
            }
            background_tasks.add_task(send_callback_notification_email, request_data)
        
        return response
    except Exception as e:
        logger.error(f"Error creating callback request: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.post("/contact/consultation")
async def create_consultation_request(request: ConsultationRequestCreate, background_tasks: BackgroundTasks):
    """Create consultation request"""
    try:
        response = ContactService.create_consultation_request(request)
        
        # Send email notification in background
        if os.getenv('SENDER_EMAIL') and os.getenv('EMAIL_PASSWORD'):
            from datetime import datetime
            request_data = {
                'name': request.name,
                'phone': request.phone,
                'email': request.email,
                'company': request.company,
                'message': getattr(request, 'message', None),
                'created_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }
            background_tasks.add_task(send_callback_notification_email, request_data)
        
        return response
    except Exception as e:
        logger.error(f"Error creating consultation request: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.post("/contact/message")
async def create_contact_message(request: ContactMessageCreate, background_tasks: BackgroundTasks):
    """Create general contact message"""
    try:
        response = ContactService.create_contact_message(request)
        
        # Send email notification in background
        if os.getenv('SENDER_EMAIL') and os.getenv('EMAIL_PASSWORD'):
            request_data = {
                'name': request.name,
                'email': request.email,
                'phone': request.phone,
                'company': request.company,
                'message': request.message,
                'created_at': response.get('created_at')
            }
            background_tasks.add_task(send_contact_message_email, request_data)
        
        return response
    except Exception as e:
        logger.error(f"Error creating contact message: {e}")
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
    """Get product by ID"""
    try:
        from services_sqlite import ProductService
        product = ProductService.get_product_by_id(product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        return product
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting product by id: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.post("/products")
async def create_product(product: ProductCreate):
    """Create new product"""
    try:
        from services_sqlite import ProductService
        result = ProductService.create_product(product)
        return result
    except Exception as e:
        logger.error(f"Error creating product: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Serve uploaded files (public access)
from fastapi.responses import FileResponse
from pathlib import Path as FilePath

UPLOAD_DIR = FilePath("uploads")

@api_router.get("/uploads/{filename}")
async def serve_uploaded_file(filename: str):
    """Serve uploaded files publicly"""
    file_path = UPLOAD_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path)

# Include router in app
app.include_router(api_router)
# Include admin routes under /api prefix  
app.include_router(admin_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)