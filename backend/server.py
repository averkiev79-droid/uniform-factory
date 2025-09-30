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
    return {"message": "AVIK Uniform Factory API with SQLite"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "avik-uniform-api", "database": "sqlite"}

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
async def create_consultation_request(request: ConsultationRequestCreate):
    """Create consultation request"""
    try:
        response = ContactService.create_consultation_request(request)
        return response
    except Exception as e:
        logger.error(f"Error creating consultation request: {e}")
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

# Include router in app
app.include_router(api_router)
# Include admin routes under /api prefix  
app.include_router(admin_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)