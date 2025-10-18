from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional
from models import ProductCreate
import os
import uuid
from pathlib import Path
import shutil

from database_sqlite import SessionLocal
from database_sqlite import (
    ProductCategory as DBProductCategory,
    PortfolioItem as DBPortfolioItem,
    Testimonial as DBTestimonial,
    Statistics as DBStatistics,
    QuoteRequest as DBQuoteRequest,
    ContactRequest as DBContactRequest
)

admin_router = APIRouter(prefix="/admin", tags=["admin"])

# Upload directory
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Admin Authentication (простая реализация)
ADMIN_PASSWORD = "avik2024admin"  # В продакшене использовать хеширование

class LoginRequest(BaseModel):
    password: str

@admin_router.post("/login")
async def admin_login(request: LoginRequest):
    """Admin login"""
    if request.password == ADMIN_PASSWORD:
        return {"success": True, "token": "admin-authenticated"}
    raise HTTPException(status_code=401, detail="Invalid password")

# File Upload
@admin_router.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    """Upload image file"""
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Generate unique filename
    file_extension = file.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = UPLOAD_DIR / unique_filename
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Return URL for accessing the image (via public API endpoint)
    return {"success": True, "url": f"/api/uploads/{unique_filename}"}

@admin_router.get("/uploads/{filename}")
async def get_uploaded_file(filename: str):
    """Serve uploaded files"""
    file_path = UPLOAD_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path)

# Categories Management
@admin_router.get("/categories")
async def get_admin_categories():
    """Get all categories for admin"""
    db = SessionLocal()
    try:
        categories = db.query(DBProductCategory).all()
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

@admin_router.post("/categories")
async def create_category(
    title: str = Form(...),
    description: str = Form(...),
    products_count: int = Form(...),
    slug: str = Form(...),
    image: str = Form(...)
):
    """Create new category"""
    db = SessionLocal()
    try:
        category = DBProductCategory(
            title=title,
            description=description,
            image=image,
            products_count=products_count,
            slug=slug
        )
        db.add(category)
        db.commit()
        db.refresh(category)
        return {"success": True, "id": category.id}
    finally:
        db.close()

@admin_router.put("/categories/{category_id}")
async def update_category(
    category_id: str,
    title: str = Form(...),
    description: str = Form(...),
    products_count: int = Form(...),
    slug: str = Form(...),
    image: str = Form(None)  # Made optional for editing
):
    """Update category"""
    db = SessionLocal()
    try:
        category = db.query(DBProductCategory).filter(DBProductCategory.id == category_id).first()
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
        
        category.title = title
        category.description = description
        if image:  # Only update image if provided
            category.image = image
        category.products_count = products_count
        category.slug = slug
        
        db.commit()
        return {"success": True}
    finally:
        db.close()

@admin_router.delete("/categories/{category_id}")
async def delete_category(category_id: str):
    """Delete category"""
    db = SessionLocal()
    try:
        category = db.query(DBProductCategory).filter(DBProductCategory.id == category_id).first()
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
        
        db.delete(category)
        db.commit()
        return {"success": True}
    finally:
        db.close()

# Portfolio Management
@admin_router.get("/portfolio")
async def get_admin_portfolio():
    """Get all portfolio items for admin"""
    db = SessionLocal()
    try:
        items = db.query(DBPortfolioItem).all()
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

@admin_router.post("/portfolio")
async def create_portfolio_item(
    company: str = Form(...),
    description: str = Form(...),
    category: str = Form(...),
    items_count: int = Form(...),
    year: int = Form(...),
    image: str = Form(...)
):
    """Create new portfolio item"""
    db = SessionLocal()
    try:
        item = DBPortfolioItem(
            company=company,
            description=description,
            image=image,
            category=category,
            items_count=items_count,
            year=year
        )
        db.add(item)
        db.commit()
        db.refresh(item)
        return {"success": True, "id": item.id}
    finally:
        db.close()

@admin_router.put("/portfolio/{item_id}")
async def update_portfolio_item(
    item_id: str,
    company: str = Form(...),
    description: str = Form(...),
    category: str = Form(...),
    items_count: int = Form(...),
    year: int = Form(...),
    image: str = Form(None)  # Made optional for editing
):
    """Update portfolio item"""
    db = SessionLocal()
    try:
        item = db.query(DBPortfolioItem).filter(DBPortfolioItem.id == item_id).first()
        if not item:
            raise HTTPException(status_code=404, detail="Portfolio item not found")
        
        item.company = company
        item.description = description
        if image:  # Only update image if provided
            item.image = image
        item.category = category
        item.items_count = items_count
        item.year = year
        
        db.commit()
        return {"success": True}
    finally:
        db.close()

@admin_router.delete("/portfolio/{item_id}")
async def delete_portfolio_item(item_id: str):
    """Delete portfolio item"""
    db = SessionLocal()
    try:
        item = db.query(DBPortfolioItem).filter(DBPortfolioItem.id == item_id).first()
        if not item:
            raise HTTPException(status_code=404, detail="Portfolio item not found")
        
        db.delete(item)
        db.commit()
        return {"success": True}
    finally:
        db.close()

# Quote Requests Management
@admin_router.get("/quote-requests")
async def get_quote_requests_admin(status: Optional[str] = None):
    """Get quote requests for admin with optional status filter"""
    db = SessionLocal()
    try:
        query = db.query(DBQuoteRequest).order_by(DBQuoteRequest.created_at.desc())
        if status:
            query = query.filter(DBQuoteRequest.status == status)
            
        requests = query.limit(100).all()
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

@admin_router.put("/quote-requests/{request_id}/status")
async def update_quote_status(request_id: str, status: str = Form(...)):
    """Update quote request status"""
    db = SessionLocal()
    try:
        request = db.query(DBQuoteRequest).filter(DBQuoteRequest.id == request_id).first()
        if not request:
            raise HTTPException(status_code=404, detail="Request not found")
        
        request.status = status
        db.commit()
        return {"success": True}
    finally:
        db.close()

# Contact Requests Management  
@admin_router.get("/contact-requests")
async def get_contact_requests_admin():
    """Get contact requests for admin"""
    db = SessionLocal()
    try:
        requests = db.query(DBContactRequest).order_by(DBContactRequest.created_at.desc()).limit(100).all()
        return [
            {
                "id": req.id,
                "type": req.type,
                "name": req.name,
                "email": req.email,
                "phone": req.phone,
                "company": req.company,
                "message": req.message,
                "status": req.status,
                "created_at": req.created_at,
                "updated_at": req.updated_at
            }
            for req in requests
        ]
    finally:
        db.close()

# Statistics Management
@admin_router.get("/statistics")
async def get_admin_statistics():
    """Get statistics for admin"""
    db = SessionLocal()
    try:
        stats = db.query(DBStatistics).first()
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

@admin_router.put("/statistics")
async def update_statistics(
    years_in_business: int = Form(...),
    completed_orders: int = Form(...),
    happy_clients: int = Form(...),
    cities: int = Form(...)
):
    """Update statistics"""
    db = SessionLocal()
    try:
        stats = db.query(DBStatistics).first()
        if not stats:
            # Create new statistics record
            stats = DBStatistics(
                years_in_business=years_in_business,
                completed_orders=completed_orders,
                happy_clients=happy_clients,
                cities=cities
            )
            db.add(stats)
        else:
            stats.years_in_business = years_in_business
            stats.completed_orders = completed_orders
            stats.happy_clients = happy_clients
            stats.cities = cities
        
        db.commit()
        return {"success": True}
    finally:
        db.close()

# Product Management Routes
@admin_router.get("/products")
async def admin_get_products():
    """Get all products for admin"""
    from services_sqlite import ProductService
    return ProductService.get_all_products()

@admin_router.post("/products")
async def admin_create_product(product: ProductCreate):
    """Create new product"""
    from services_sqlite import ProductService
    return ProductService.create_product(product)

@admin_router.get("/products/{product_id}")
async def admin_get_product(product_id: str):
    """Get product by ID"""
    from services_sqlite import ProductService
    product = ProductService.get_product_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@admin_router.put("/products/{product_id}")
async def admin_update_product(product_id: str, product: ProductCreate):
    """Update product"""
    db = SessionLocal()
    try:
        from database_sqlite import SQLProduct, SQLProductImage, SQLProductCharacteristic
        import json
        from datetime import datetime, timezone
        
        # Get existing product
        existing_product = db.query(SQLProduct).filter(SQLProduct.id == product_id).first()
        if not existing_product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        # Update product fields
        existing_product.category_id = product.category_id
        existing_product.name = product.name
        existing_product.description = product.description
        existing_product.short_description = product.short_description
        existing_product.price_from = product.price_from
        existing_product.price_to = product.price_to
        existing_product.material = product.material
        existing_product.sizes = json.dumps(product.sizes) if product.sizes else None
        existing_product.colors = json.dumps(product.colors) if product.colors else None
        existing_product.is_available = product.is_available
        existing_product.featured = product.featured
        existing_product.updated_at = datetime.now(timezone.utc)
        
        # Delete existing images and characteristics
        db.query(SQLProductImage).filter(SQLProductImage.product_id == product_id).delete()
        db.query(SQLProductCharacteristic).filter(SQLProductCharacteristic.product_id == product_id).delete()
        
        # Add new images
        if product.images:
            for i, image_url in enumerate(product.images):
                image = SQLProductImage(
                    product_id=product_id,
                    image_url=image_url,
                    alt_text=f"{product.name} - изображение {i+1}",
                    order=i+1
                )
                db.add(image)
        
        # Add new characteristics
        if product.characteristics:
            for i, char in enumerate(product.characteristics):
                characteristic = SQLProductCharacteristic(
                    product_id=product_id,
                    name=char["name"],
                    value=char["value"],
                    order=i+1
                )
                db.add(characteristic)
        
        db.commit()
        return {"success": True, "message": "Товар обновлен", "product_id": product_id}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@admin_router.delete("/products/{product_id}")
async def admin_delete_product(product_id: str):
    """Delete product"""
    db = SessionLocal()
    try:
        from database_sqlite import SQLProduct
        product = db.query(SQLProduct).filter(SQLProduct.id == product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        db.delete(product)
        db.commit()
        return {"success": True, "message": "Товар удален"}
    finally:
        db.close()


# App Settings Management
@admin_router.get("/settings")
async def admin_get_settings():
    """Get app settings"""
    try:
        from services_sqlite import SettingsService
        settings = SettingsService.get_settings()
        return settings
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@admin_router.put("/settings")
async def admin_update_settings(
    hero_image: Optional[str] = Form(None),
    hero_mobile_image: Optional[str] = Form(None),
    about_image: Optional[str] = Form(None)
):
    """Update app settings"""
    try:
        from services_sqlite import SettingsService
        
        settings_update = {}
        if hero_image is not None:
            settings_update["hero_image"] = hero_image
        if hero_mobile_image is not None:
            settings_update["hero_mobile_image"] = hero_mobile_image
        if about_image is not None:
            settings_update["about_image"] = about_image
        
        settings = SettingsService.update_settings(settings_update)
        return {"success": True, "message": "Настройки обновлены", "settings": settings}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Web Vitals Management
@admin_router.get("/web-vitals")
async def get_web_vitals_metrics():
    """Get Web Vitals metrics for monitoring"""
    try:
        from database_sqlite import WebVitals, SessionLocal
        from datetime import datetime, timedelta
        
        db = SessionLocal()
        try:
            # Get metrics from last 7 days
            week_ago = datetime.utcnow() - timedelta(days=7)
            metrics = db.query(WebVitals).filter(
                WebVitals.timestamp >= week_ago
            ).order_by(WebVitals.timestamp.desc()).all()
            
            result = []
            for metric in metrics:
                result.append({
                    'id': metric.id,
                    'name': metric.name,
                    'value': metric.value,
                    'rating': metric.rating,
                    'delta': metric.delta,
                    'page': metric.page,
                    'timestamp': metric.timestamp.isoformat()
                })
            
            return {'metrics': result}
        finally:
            db.close()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))