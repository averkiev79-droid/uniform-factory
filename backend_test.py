#!/usr/bin/env python3
"""
Backend API Testing for AVIK Uniform Factory
Tests all API endpoints with proper data validation and error handling
"""

import requests
import json
import sys
from typing import Dict, Any, List
import time

# Backend URL from frontend .env
BACKEND_URL = "https://avik-uniforms.preview.emergentagent.com/api"

class APITester:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
        self.results = []
        
    def log_result(self, endpoint: str, method: str, success: bool, details: str, response_data: Any = None):
        """Log test result"""
        result = {
            'endpoint': endpoint,
            'method': method,
            'success': success,
            'details': details,
            'response_data': response_data,
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
        }
        self.results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {method} {endpoint}: {details}")
        
    def test_health_check(self):
        """Test GET /api/health"""
        try:
            response = self.session.get(f"{self.base_url}/health")
            
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'healthy' and 'service' in data:
                    self.log_result('/health', 'GET', True, 
                                  f"Health check passed - Status: {data['status']}, Service: {data['service']}", data)
                else:
                    self.log_result('/health', 'GET', False, 
                                  f"Invalid response structure: {data}", data)
            else:
                self.log_result('/health', 'GET', False, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result('/health', 'GET', False, f"Exception: {str(e)}")
    
    def test_categories(self):
        """Test GET /api/categories"""
        try:
            response = self.session.get(f"{self.base_url}/categories")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    # Validate structure of first category
                    first_category = data[0]
                    required_fields = ['id', 'title', 'description', 'image', 'products_count', 'slug']
                    
                    if all(field in first_category for field in required_fields):
                        self.log_result('/categories', 'GET', True, 
                                      f"Retrieved {len(data)} categories successfully", 
                                      {'count': len(data), 'sample': first_category})
                    else:
                        missing = [f for f in required_fields if f not in first_category]
                        self.log_result('/categories', 'GET', False, 
                                      f"Missing required fields: {missing}", first_category)
                else:
                    self.log_result('/categories', 'GET', False, 
                                  f"Expected non-empty list, got: {type(data)}", data)
            else:
                self.log_result('/categories', 'GET', False, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result('/categories', 'GET', False, f"Exception: {str(e)}")
    
    def test_portfolio(self):
        """Test GET /api/portfolio"""
        try:
            response = self.session.get(f"{self.base_url}/portfolio")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    # Validate structure of first portfolio item
                    first_item = data[0]
                    required_fields = ['id', 'company', 'description', 'image', 'category', 'items_count', 'year']
                    
                    if all(field in first_item for field in required_fields):
                        self.log_result('/portfolio', 'GET', True, 
                                      f"Retrieved {len(data)} portfolio items successfully", 
                                      {'count': len(data), 'sample': first_item})
                    else:
                        missing = [f for f in required_fields if f not in first_item]
                        self.log_result('/portfolio', 'GET', False, 
                                      f"Missing required fields: {missing}", first_item)
                else:
                    self.log_result('/portfolio', 'GET', False, 
                                  f"Expected non-empty list, got: {type(data)}", data)
            else:
                self.log_result('/portfolio', 'GET', False, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result('/portfolio', 'GET', False, f"Exception: {str(e)}")
    
    def test_calculator_options(self):
        """Test GET /api/calculator/options"""
        try:
            response = self.session.get(f"{self.base_url}/calculator/options")
            
            if response.status_code == 200:
                data = response.json()
                required_sections = ['categories', 'quantities', 'fabrics', 'branding']
                
                if all(section in data for section in required_sections):
                    # Validate each section has items
                    all_valid = True
                    details = {}
                    
                    for section in required_sections:
                        if isinstance(data[section], list) and len(data[section]) > 0:
                            details[section] = len(data[section])
                        else:
                            all_valid = False
                            details[section] = f"Invalid or empty: {type(data[section])}"
                    
                    if all_valid:
                        self.log_result('/calculator/options', 'GET', True, 
                                      f"Calculator options retrieved: {details}", data)
                    else:
                        self.log_result('/calculator/options', 'GET', False, 
                                      f"Invalid sections: {details}", data)
                else:
                    missing = [s for s in required_sections if s not in data]
                    self.log_result('/calculator/options', 'GET', False, 
                                  f"Missing sections: {missing}", data)
            else:
                self.log_result('/calculator/options', 'GET', False, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result('/calculator/options', 'GET', False, f"Exception: {str(e)}")
    
    def test_calculator_estimate(self):
        """Test POST /api/calculator/estimate"""
        test_data = {
            "category": "shirts",
            "quantity": "51-100",
            "fabric": "cotton",
            "branding": "embroidery"
        }
        
        try:
            response = self.session.post(f"{self.base_url}/calculator/estimate", 
                                       json=test_data)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ['estimated_price', 'breakdown']
                
                if all(field in data for field in required_fields):
                    if isinstance(data['estimated_price'], int) and isinstance(data['breakdown'], dict):
                        self.log_result('/calculator/estimate', 'POST', True, 
                                      f"Estimate calculated: {data['estimated_price']} руб.", data)
                    else:
                        self.log_result('/calculator/estimate', 'POST', False, 
                                      f"Invalid data types in response", data)
                else:
                    missing = [f for f in required_fields if f not in data]
                    self.log_result('/calculator/estimate', 'POST', False, 
                                  f"Missing fields: {missing}", data)
            elif response.status_code == 400:
                self.log_result('/calculator/estimate', 'POST', False, 
                              f"Validation error: {response.text}")
            else:
                self.log_result('/calculator/estimate', 'POST', False, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result('/calculator/estimate', 'POST', False, f"Exception: {str(e)}")
    
    def test_quote_request(self):
        """Test POST /api/calculator/quote-request"""
        test_data = {
            "name": "Анна Тестова",
            "email": "anna.testova@example.com",
            "phone": "+7 999 123 45 67",
            "company": "Тестовая Компания ООО",
            "category": "shirts",
            "quantity": "51-100",
            "fabric": "cotton",
            "branding": "embroidery",
            "estimated_price": 1470
        }
        
        try:
            response = self.session.post(f"{self.base_url}/calculator/quote-request", 
                                       json=test_data)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ['success', 'request_id', 'message']
                
                if all(field in data for field in required_fields):
                    if data['success'] and data['request_id'] and data['message']:
                        self.log_result('/calculator/quote-request', 'POST', True, 
                                      f"Quote request created: {data['request_id']}", data)
                    else:
                        self.log_result('/calculator/quote-request', 'POST', False, 
                                      f"Invalid response values", data)
                else:
                    missing = [f for f in required_fields if f not in data]
                    self.log_result('/calculator/quote-request', 'POST', False, 
                                  f"Missing fields: {missing}", data)
            else:
                self.log_result('/calculator/quote-request', 'POST', False, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result('/calculator/quote-request', 'POST', False, f"Exception: {str(e)}")
    
    def test_callback_request(self):
        """Test POST /api/contact/callback-request"""
        test_data = {
            "name": "Иван Петров",
            "phone": "+7 999 888 77 66"
        }
        
        try:
            response = self.session.post(f"{self.base_url}/contact/callback-request", 
                                       json=test_data)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ['success', 'message']
                
                if all(field in data for field in required_fields):
                    if data['success'] and data['message']:
                        self.log_result('/contact/callback-request', 'POST', True, 
                                      f"Callback request created successfully", data)
                    else:
                        self.log_result('/contact/callback-request', 'POST', False, 
                                      f"Invalid response values", data)
                else:
                    missing = [f for f in required_fields if f not in data]
                    self.log_result('/contact/callback-request', 'POST', False, 
                                  f"Missing fields: {missing}", data)
            else:
                self.log_result('/contact/callback-request', 'POST', False, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result('/contact/callback-request', 'POST', False, f"Exception: {str(e)}")
    
    def test_testimonials(self):
        """Test GET /api/testimonials"""
        try:
            response = self.session.get(f"{self.base_url}/testimonials")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    # Validate structure of first testimonial
                    first_testimonial = data[0]
                    required_fields = ['id', 'company', 'text', 'author', 'position', 'rating']
                    
                    if all(field in first_testimonial for field in required_fields):
                        self.log_result('/testimonials', 'GET', True, 
                                      f"Retrieved {len(data)} testimonials successfully", 
                                      {'count': len(data), 'sample': first_testimonial})
                    else:
                        missing = [f for f in required_fields if f not in first_testimonial]
                        self.log_result('/testimonials', 'GET', False, 
                                      f"Missing required fields: {missing}", first_testimonial)
                else:
                    self.log_result('/testimonials', 'GET', False, 
                                  f"Expected non-empty list, got: {type(data)}", data)
            else:
                self.log_result('/testimonials', 'GET', False, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result('/testimonials', 'GET', False, f"Exception: {str(e)}")
    
    def test_statistics(self):
        """Test GET /api/statistics"""
        try:
            response = self.session.get(f"{self.base_url}/statistics")
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ['years_in_business', 'completed_orders', 'happy_clients', 'cities']
                
                if all(field in data for field in required_fields):
                    # Validate all values are positive integers
                    if all(isinstance(data[field], int) and data[field] > 0 for field in required_fields):
                        self.log_result('/statistics', 'GET', True, 
                                      f"Statistics retrieved successfully", data)
                    else:
                        self.log_result('/statistics', 'GET', False, 
                                      f"Invalid statistics values", data)
                else:
                    missing = [f for f in required_fields if f not in data]
                    self.log_result('/statistics', 'GET', False, 
                                  f"Missing fields: {missing}", data)
            else:
                self.log_result('/statistics', 'GET', False, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result('/statistics', 'GET', False, f"Exception: {str(e)}")
    
    def test_invalid_calculator_estimate(self):
        """Test POST /api/calculator/estimate with invalid data"""
        invalid_data = {
            "category": "invalid_category",
            "quantity": "invalid_quantity",
            "fabric": "invalid_fabric",
            "branding": "invalid_branding"
        }
        
        try:
            response = self.session.post(f"{self.base_url}/calculator/estimate", 
                                       json=invalid_data)
            
            if response.status_code == 400:
                self.log_result('/calculator/estimate (invalid)', 'POST', True, 
                              f"Correctly rejected invalid data: {response.text}")
            else:
                self.log_result('/calculator/estimate (invalid)', 'POST', False, 
                              f"Should have returned 400, got {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result('/calculator/estimate (invalid)', 'POST', False, f"Exception: {str(e)}")
    
    def test_missing_fields_quote_request(self):
        """Test POST /api/calculator/quote-request with missing required fields"""
        incomplete_data = {
            "name": "Test User"
            # Missing required fields: email, phone, etc.
        }
        
        try:
            response = self.session.post(f"{self.base_url}/calculator/quote-request", 
                                       json=incomplete_data)
            
            if response.status_code == 422:  # FastAPI validation error
                self.log_result('/calculator/quote-request (incomplete)', 'POST', True, 
                              f"Correctly rejected incomplete data: validation error")
            else:
                self.log_result('/calculator/quote-request (incomplete)', 'POST', False, 
                              f"Should have returned 422, got {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result('/calculator/quote-request (incomplete)', 'POST', False, f"Exception: {str(e)}")

    # ===== ADMIN PANEL TESTS =====
    
    def test_admin_login_success(self):
        """Test POST /api/admin/login with correct password"""
        login_data = {"password": "avik2024admin"}
        
        try:
            response = self.session.post(f"{self.base_url}/admin/login", json=login_data)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('token'):
                    self.log_result('/admin/login', 'POST', True, 
                                  f"Admin login successful with token: {data['token']}", data)
                else:
                    self.log_result('/admin/login', 'POST', False, 
                                  f"Invalid response structure: {data}", data)
            else:
                self.log_result('/admin/login', 'POST', False, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result('/admin/login', 'POST', False, f"Exception: {str(e)}")
    
    def test_admin_login_failure(self):
        """Test POST /api/admin/login with incorrect password"""
        login_data = {"password": "wrongpassword"}
        
        try:
            response = self.session.post(f"{self.base_url}/admin/login", json=login_data)
            
            if response.status_code == 401:
                self.log_result('/admin/login (invalid)', 'POST', True, 
                              f"Correctly rejected invalid password: {response.text}")
            else:
                self.log_result('/admin/login (invalid)', 'POST', False, 
                              f"Should have returned 401, got {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result('/admin/login (invalid)', 'POST', False, f"Exception: {str(e)}")
    
    def test_admin_categories_get(self):
        """Test GET /api/admin/categories"""
        try:
            response = self.session.get(f"{self.base_url}/admin/categories")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_result('/admin/categories', 'GET', True, 
                                  f"Retrieved {len(data)} admin categories successfully", 
                                  {'count': len(data)})
                else:
                    self.log_result('/admin/categories', 'GET', False, 
                                  f"Expected list, got: {type(data)}", data)
            else:
                self.log_result('/admin/categories', 'GET', False, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result('/admin/categories', 'GET', False, f"Exception: {str(e)}")
    
    def test_admin_categories_crud(self):
        """Test POST/PUT/DELETE /api/admin/categories"""
        # Test data for creating category
        category_data = {
            "title": "Тестовая Категория",
            "description": "Описание тестовой категории для проверки CRUD операций",
            "products_count": 25,
            "slug": "test-category-crud",
            "image": "/images/test-category.jpg"
        }
        
        created_id = None
        
        try:
            # Test CREATE
            response = self.session.post(f"{self.base_url}/admin/categories", data=category_data)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('id'):
                    created_id = data['id']
                    self.log_result('/admin/categories', 'POST', True, 
                                  f"Category created successfully with ID: {created_id}", data)
                else:
                    self.log_result('/admin/categories', 'POST', False, 
                                  f"Invalid create response: {data}", data)
                    return
            else:
                self.log_result('/admin/categories', 'POST', False, 
                              f"HTTP {response.status_code}: {response.text}")
                return
            
            # Test UPDATE
            update_data = category_data.copy()
            update_data["title"] = "Обновленная Тестовая Категория"
            update_data["products_count"] = 30
            
            response = self.session.put(f"{self.base_url}/admin/categories/{created_id}", data=update_data)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log_result('/admin/categories/{id}', 'PUT', True, 
                                  f"Category updated successfully", data)
                else:
                    self.log_result('/admin/categories/{id}', 'PUT', False, 
                                  f"Invalid update response: {data}", data)
            else:
                self.log_result('/admin/categories/{id}', 'PUT', False, 
                              f"HTTP {response.status_code}: {response.text}")
            
            # Test DELETE
            response = self.session.delete(f"{self.base_url}/admin/categories/{created_id}")
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log_result('/admin/categories/{id}', 'DELETE', True, 
                                  f"Category deleted successfully", data)
                else:
                    self.log_result('/admin/categories/{id}', 'DELETE', False, 
                                  f"Invalid delete response: {data}", data)
            else:
                self.log_result('/admin/categories/{id}', 'DELETE', False, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result('/admin/categories (CRUD)', 'POST/PUT/DELETE', False, f"Exception: {str(e)}")
    
    def test_admin_portfolio_get(self):
        """Test GET /api/admin/portfolio"""
        try:
            response = self.session.get(f"{self.base_url}/admin/portfolio")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_result('/admin/portfolio', 'GET', True, 
                                  f"Retrieved {len(data)} admin portfolio items successfully", 
                                  {'count': len(data)})
                else:
                    self.log_result('/admin/portfolio', 'GET', False, 
                                  f"Expected list, got: {type(data)}", data)
            else:
                self.log_result('/admin/portfolio', 'GET', False, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result('/admin/portfolio', 'GET', False, f"Exception: {str(e)}")
    
    def test_admin_portfolio_crud(self):
        """Test POST/PUT/DELETE /api/admin/portfolio"""
        # Test data for creating portfolio item
        portfolio_data = {
            "company": "Тестовая Компания ООО",
            "description": "Тестовый проект для проверки CRUD операций портфолио",
            "category": "shirts",
            "items_count": 150,
            "year": 2024,
            "image": "/images/test-portfolio.jpg"
        }
        
        created_id = None
        
        try:
            # Test CREATE
            response = self.session.post(f"{self.base_url}/admin/portfolio", data=portfolio_data)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('id'):
                    created_id = data['id']
                    self.log_result('/admin/portfolio', 'POST', True, 
                                  f"Portfolio item created successfully with ID: {created_id}", data)
                else:
                    self.log_result('/admin/portfolio', 'POST', False, 
                                  f"Invalid create response: {data}", data)
                    return
            else:
                self.log_result('/admin/portfolio', 'POST', False, 
                              f"HTTP {response.status_code}: {response.text}")
                return
            
            # Test UPDATE
            update_data = portfolio_data.copy()
            update_data["company"] = "Обновленная Тестовая Компания"
            update_data["items_count"] = 200
            
            response = self.session.put(f"{self.base_url}/admin/portfolio/{created_id}", data=update_data)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log_result('/admin/portfolio/{id}', 'PUT', True, 
                                  f"Portfolio item updated successfully", data)
                else:
                    self.log_result('/admin/portfolio/{id}', 'PUT', False, 
                                  f"Invalid update response: {data}", data)
            else:
                self.log_result('/admin/portfolio/{id}', 'PUT', False, 
                              f"HTTP {response.status_code}: {response.text}")
            
            # Test DELETE
            response = self.session.delete(f"{self.base_url}/admin/portfolio/{created_id}")
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log_result('/admin/portfolio/{id}', 'DELETE', True, 
                                  f"Portfolio item deleted successfully", data)
                else:
                    self.log_result('/admin/portfolio/{id}', 'DELETE', False, 
                                  f"Invalid delete response: {data}", data)
            else:
                self.log_result('/admin/portfolio/{id}', 'DELETE', False, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result('/admin/portfolio (CRUD)', 'POST/PUT/DELETE', False, f"Exception: {str(e)}")
    
    def test_admin_quote_requests(self):
        """Test GET /api/admin/quote-requests"""
        try:
            response = self.session.get(f"{self.base_url}/admin/quote-requests")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_result('/admin/quote-requests', 'GET', True, 
                                  f"Retrieved {len(data)} quote requests successfully", 
                                  {'count': len(data)})
                else:
                    self.log_result('/admin/quote-requests', 'GET', False, 
                                  f"Expected list, got: {type(data)}", data)
            else:
                self.log_result('/admin/quote-requests', 'GET', False, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result('/admin/quote-requests', 'GET', False, f"Exception: {str(e)}")
    
    def test_admin_quote_status_update(self):
        """Test PUT /api/admin/quote-requests/{id}/status"""
        # First, create a quote request to test status update
        quote_data = {
            "name": "Тест Статус",
            "email": "test.status@example.com",
            "phone": "+7 999 111 22 33",
            "company": "Тестовая Компания",
            "category": "shirts",
            "quantity": "51-100",
            "fabric": "cotton",
            "branding": "embroidery",
            "estimated_price": 1500
        }
        
        try:
            # Create quote request first
            create_response = self.session.post(f"{self.base_url}/calculator/quote-request", json=quote_data)
            
            if create_response.status_code == 200:
                create_data = create_response.json()
                request_id = create_data.get('request_id')
                
                if request_id:
                    # Now test status update
                    status_data = {"status": "processed"}
                    response = self.session.put(f"{self.base_url}/admin/quote-requests/{request_id}/status", 
                                              data=status_data)
                    
                    if response.status_code == 200:
                        data = response.json()
                        if data.get('success'):
                            self.log_result('/admin/quote-requests/{id}/status', 'PUT', True, 
                                          f"Quote status updated successfully", data)
                        else:
                            self.log_result('/admin/quote-requests/{id}/status', 'PUT', False, 
                                          f"Invalid status update response: {data}", data)
                    else:
                        self.log_result('/admin/quote-requests/{id}/status', 'PUT', False, 
                                      f"HTTP {response.status_code}: {response.text}")
                else:
                    self.log_result('/admin/quote-requests/{id}/status', 'PUT', False, 
                                  f"No request_id in create response: {create_data}")
            else:
                self.log_result('/admin/quote-requests/{id}/status', 'PUT', False, 
                              f"Failed to create test quote request: {create_response.status_code}")
                
        except Exception as e:
            self.log_result('/admin/quote-requests/{id}/status', 'PUT', False, f"Exception: {str(e)}")
    
    def test_admin_statistics_get(self):
        """Test GET /api/admin/statistics"""
        try:
            response = self.session.get(f"{self.base_url}/admin/statistics")
            
            if response.status_code == 200:
                data = response.json()
                if data and isinstance(data, dict):
                    required_fields = ['years_in_business', 'completed_orders', 'happy_clients', 'cities']
                    if all(field in data for field in required_fields):
                        self.log_result('/admin/statistics', 'GET', True, 
                                      f"Admin statistics retrieved successfully", data)
                    else:
                        missing = [f for f in required_fields if f not in data]
                        self.log_result('/admin/statistics', 'GET', False, 
                                      f"Missing required fields: {missing}", data)
                else:
                    self.log_result('/admin/statistics', 'GET', True, 
                                  f"No statistics found (empty response)", data)
            else:
                self.log_result('/admin/statistics', 'GET', False, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result('/admin/statistics', 'GET', False, f"Exception: {str(e)}")
    
    def test_admin_statistics_update(self):
        """Test PUT /api/admin/statistics"""
        stats_data = {
            "years_in_business": 15,
            "completed_orders": 2500,
            "happy_clients": 850,
            "cities": 45
        }
        
        try:
            response = self.session.put(f"{self.base_url}/admin/statistics", data=stats_data)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log_result('/admin/statistics', 'PUT', True, 
                                  f"Statistics updated successfully", data)
                else:
                    self.log_result('/admin/statistics', 'PUT', False, 
                                  f"Invalid update response: {data}", data)
            else:
                self.log_result('/admin/statistics', 'PUT', False, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result('/admin/statistics', 'PUT', False, f"Exception: {str(e)}")
    
    def test_admin_image_upload(self):
        """Test POST /api/admin/upload-image"""
        # Create a simple test image file in memory
        import io
        from PIL import Image
        
        try:
            # Create a simple test image
            img = Image.new('RGB', (100, 100), color='red')
            img_bytes = io.BytesIO()
            img.save(img_bytes, format='JPEG')
            img_bytes.seek(0)
            
            files = {'file': ('test_image.jpg', img_bytes, 'image/jpeg')}
            
            # Remove Content-Type header for file upload
            headers = {k: v for k, v in self.session.headers.items() if k.lower() != 'content-type'}
            
            response = self.session.post(f"{self.base_url}/admin/upload-image", 
                                       files=files, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('url'):
                    self.log_result('/admin/upload-image', 'POST', True, 
                                  f"Image uploaded successfully: {data['url']}", data)
                else:
                    self.log_result('/admin/upload-image', 'POST', False, 
                                  f"Invalid upload response: {data}", data)
            else:
                self.log_result('/admin/upload-image', 'POST', False, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except ImportError:
            self.log_result('/admin/upload-image', 'POST', False, 
                          f"PIL library not available for image testing")
        except Exception as e:
            self.log_result('/admin/upload-image', 'POST', False, f"Exception: {str(e)}")
    
    def run_admin_tests(self):
        """Run all admin panel tests"""
        print(f"\n🔐 Starting Admin Panel API tests")
        print("=" * 50)
        
        # Admin authentication tests
        self.test_admin_login_success()
        self.test_admin_login_failure()
        
        # Admin CRUD tests
        self.test_admin_categories_get()
        self.test_admin_categories_crud()
        self.test_admin_portfolio_get()
        self.test_admin_portfolio_crud()
        
        # Admin management tests
        self.test_admin_quote_requests()
        self.test_admin_quote_status_update()
        self.test_admin_statistics_get()
        self.test_admin_statistics_update()
        
        # File upload test
        self.test_admin_image_upload()
        
        print("=" * 50)
    
    def run_all_tests(self):
        """Run all API tests"""
        print(f"🚀 Starting API tests for AVIK Uniform Factory")
        print(f"Backend URL: {self.base_url}")
        print("=" * 80)
        
        # Core functionality tests
        self.test_health_check()
        self.test_categories()
        self.test_portfolio()
        self.test_calculator_options()
        self.test_calculator_estimate()
        self.test_quote_request()
        self.test_callback_request()
        self.test_testimonials()
        self.test_statistics()
        
        # Error handling tests
        self.test_invalid_calculator_estimate()
        self.test_missing_fields_quote_request()
        
        # Admin panel tests
        self.run_admin_tests()
        
        print("=" * 80)
        self.print_summary()
    
    def print_summary(self):
        """Print test summary"""
        total_tests = len(self.results)
        passed_tests = sum(1 for r in self.results if r['success'])
        failed_tests = total_tests - passed_tests
        
        print(f"📊 TEST SUMMARY")
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print(f"\n🔍 FAILED TESTS:")
            for result in self.results:
                if not result['success']:
                    print(f"  • {result['method']} {result['endpoint']}: {result['details']}")
        
        return failed_tests == 0

def main():
    """Main test execution"""
    tester = APITester(BACKEND_URL)
    success = tester.run_all_tests()
    
    # Save detailed results to file
    with open('/app/test_results_detailed.json', 'w', encoding='utf-8') as f:
        json.dump(tester.results, f, ensure_ascii=False, indent=2, default=str)
    
    print(f"\n📄 Detailed results saved to: /app/test_results_detailed.json")
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())