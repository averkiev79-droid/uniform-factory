"""
Security middleware for Uniform Factory API
Includes:
- File upload validation
- Rate limiting
- Security headers
- Input sanitization
"""

from fastapi import Request, HTTPException, UploadFile
from fastapi.responses import Response
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Dict, Tuple
import time
import re
from pathlib import Path

# File upload constraints
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_IMAGE_TYPES = {
    'image/jpeg', 'image/jpg', 'image/png', 
    'image/webp', 'image/gif'
}
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.gif'}

# Rate limiting configuration
RATE_LIMIT_WINDOW = 60  # seconds
RATE_LIMIT_MAX_REQUESTS = 60  # requests per window
rate_limit_store: Dict[str, Tuple[int, float]] = {}


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to all responses"""
    
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Security headers
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        
        # Content Security Policy (relaxed for embedded maps and external resources)
        csp_directives = [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://mc.yandex.ru",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "img-src 'self' data: https: http:",
            "font-src 'self' https://fonts.gstatic.com",
            "frame-src 'self' https://yandex.ru https://mc.yandex.ru",
            "connect-src 'self' https://mc.yandex.ru",
        ]
        response.headers['Content-Security-Policy'] = "; ".join(csp_directives)
        
        return response


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Simple rate limiting middleware"""
    
    async def dispatch(self, request: Request, call_next):
        # Skip rate limiting for static files
        if request.url.path.startswith('/api/uploads/'):
            return await call_next(request)
        
        # Get client IP
        client_ip = request.client.host
        current_time = time.time()
        
        # Clean up old entries
        global rate_limit_store
        rate_limit_store = {
            ip: (count, timestamp) 
            for ip, (count, timestamp) in rate_limit_store.items()
            if current_time - timestamp < RATE_LIMIT_WINDOW
        }
        
        # Check rate limit
        if client_ip in rate_limit_store:
            count, first_request_time = rate_limit_store[client_ip]
            
            if current_time - first_request_time < RATE_LIMIT_WINDOW:
                if count >= RATE_LIMIT_MAX_REQUESTS:
                    raise HTTPException(
                        status_code=429, 
                        detail="Слишком много запросов. Пожалуйста, попробуйте позже."
                    )
                rate_limit_store[client_ip] = (count + 1, first_request_time)
            else:
                rate_limit_store[client_ip] = (1, current_time)
        else:
            rate_limit_store[client_ip] = (1, current_time)
        
        response = await call_next(request)
        
        # Add rate limit headers
        if client_ip in rate_limit_store:
            count, _ = rate_limit_store[client_ip]
            response.headers['X-RateLimit-Limit'] = str(RATE_LIMIT_MAX_REQUESTS)
            response.headers['X-RateLimit-Remaining'] = str(max(0, RATE_LIMIT_MAX_REQUESTS - count))
            response.headers['X-RateLimit-Reset'] = str(int(current_time + RATE_LIMIT_WINDOW))
        
        return response


async def validate_upload_file(file: UploadFile) -> None:
    """
    Validate uploaded file for security
    
    Args:
        file: UploadFile object from FastAPI
        
    Raises:
        HTTPException: If file is invalid
    """
    # Check file exists
    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="Файл не предоставлен")
    
    # Check file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400, 
            detail=f"Недопустимый тип файла. Разрешены: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Check content type
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Недопустимый MIME-тип. Разрешены только изображения."
        )
    
    # Check file size
    file_content = await file.read()
    file_size = len(file_content)
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"Файл слишком большой. Максимальный размер: {MAX_FILE_SIZE // (1024*1024)}MB"
        )
    
    if file_size == 0:
        raise HTTPException(status_code=400, detail="Файл пустой")
    
    # Reset file pointer for further processing
    await file.seek(0)
    
    # Validate filename (prevent directory traversal)
    if '..' in file.filename or '/' in file.filename or '\\' in file.filename:
        raise HTTPException(
            status_code=400, 
            detail="Недопустимое имя файла"
        )


def sanitize_string(text: str, max_length: int = 500) -> str:
    """
    Sanitize user input string
    
    Args:
        text: Input string to sanitize
        max_length: Maximum allowed length
        
    Returns:
        Sanitized string
    """
    if not text:
        return ""
    
    # Truncate to max length
    text = text[:max_length]
    
    # Remove null bytes
    text = text.replace('\x00', '')
    
    # Strip leading/trailing whitespace
    text = text.strip()
    
    return text


def sanitize_email(email: str) -> str:
    """
    Validate and sanitize email
    
    Args:
        email: Email to validate
        
    Returns:
        Sanitized email
        
    Raises:
        HTTPException: If email is invalid
    """
    email = sanitize_string(email, max_length=254)
    
    # Basic email regex validation
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, email):
        raise HTTPException(status_code=400, detail="Недопустимый формат email")
    
    return email.lower()


def sanitize_phone(phone: str) -> str:
    """
    Validate and sanitize phone number
    
    Args:
        phone: Phone number to validate
        
    Returns:
        Sanitized phone
        
    Raises:
        HTTPException: If phone is invalid
    """
    phone = sanitize_string(phone, max_length=20)
    
    # Remove all non-digit characters except + at start
    phone = re.sub(r'[^\d+]', '', phone)
    
    # Basic validation - must have at least 10 digits
    digits_only = re.sub(r'\D', '', phone)
    if len(digits_only) < 10:
        raise HTTPException(status_code=400, detail="Недопустимый формат телефона")
    
    return phone


def get_safe_filename(filename: str) -> str:
    """
    Generate safe filename by removing/replacing dangerous characters
    
    Args:
        filename: Original filename
        
    Returns:
        Safe filename
    """
    # Get extension
    name, ext = Path(filename).stem, Path(filename).suffix.lower()
    
    # Remove special characters from name
    safe_name = re.sub(r'[^a-zA-Z0-9_-]', '_', name)
    
    # Truncate if too long
    safe_name = safe_name[:50]
    
    return f"{safe_name}{ext}"
