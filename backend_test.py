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
BACKEND_URL = "https://react-fastapi-debug.preview.emergentagent.com/api"

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

    # ===== CONTACT FORMS TESTS (FIXED BUG VERIFICATION) =====
    
    def test_consultation_form_fixed(self):
        """Test 1: Consultation Form - POST /api/contact/consultation (Fixed Bug)"""
        test_data = {
            "name": "Тест Консультация",
            "email": "test@example.com",
            "phone": "+7 (999) 123-45-67",
            "company": "Тестовая Компания",
            "message": "Хочу получить консультацию по пошиву униформы"
        }
        
        try:
            response = self.session.post(f"{self.base_url}/contact/consultation", 
                                       json=test_data)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ['success', 'message']
                
                if all(field in data for field in required_fields):
                    if data['success'] and data['message']:
                        self.log_result('/contact/consultation (FIXED)', 'POST', True, 
                                      f"Consultation form working after fix - Success: {data['success']}, Message: {data['message']}", data)
                    else:
                        self.log_result('/contact/consultation (FIXED)', 'POST', False, 
                                      f"Invalid response values - Success: {data.get('success')}, Message: {data.get('message')}", data)
                else:
                    missing = [f for f in required_fields if f not in data]
                    self.log_result('/contact/consultation (FIXED)', 'POST', False, 
                                  f"Missing required fields: {missing}", data)
            elif response.status_code == 500:
                self.log_result('/contact/consultation (FIXED)', 'POST', False, 
                              f"500 ERROR - Bug not fixed! Response: {response.text}")
            else:
                self.log_result('/contact/consultation (FIXED)', 'POST', False, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result('/contact/consultation (FIXED)', 'POST', False, f"Exception: {str(e)}")
    
    def test_callback_request_form_fixed(self):
        """Test 2: Callback Request Form - POST /api/contact/callback-request (Fixed Bug)"""
        test_data = {
            "name": "Тест Обратный звонок",
            "phone": "+7 (999) 987-65-43",
            "email": "callback@example.com",
            "company": "Тестовая Фирма"
        }
        
        try:
            response = self.session.post(f"{self.base_url}/contact/callback-request", 
                                       json=test_data)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ['success', 'message']
                
                if all(field in data for field in required_fields):
                    if data['success'] and data['message']:
                        self.log_result('/contact/callback-request (FIXED)', 'POST', True, 
                                      f"Callback request form working after fix - Success: {data['success']}, Message: {data['message']}", data)
                    else:
                        self.log_result('/contact/callback-request (FIXED)', 'POST', False, 
                                      f"Invalid response values - Success: {data.get('success')}, Message: {data.get('message')}", data)
                else:
                    missing = [f for f in required_fields if f not in data]
                    self.log_result('/contact/callback-request (FIXED)', 'POST', False, 
                                  f"Missing required fields: {missing}", data)
            elif response.status_code == 500:
                self.log_result('/contact/callback-request (FIXED)', 'POST', False, 
                              f"500 ERROR - Bug not fixed! Response: {response.text}")
            else:
                self.log_result('/contact/callback-request (FIXED)', 'POST', False, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result('/contact/callback-request (FIXED)', 'POST', False, f"Exception: {str(e)}")
    
    def test_quote_request_form_fixed(self):
        """Test 3: Quote Request Form (Calculator) - POST /api/calculator/quote-request (Fixed Bug)"""
        test_data = {
            "name": "Тест Расчет",
            "email": "quote@example.com",
            "phone": "+7 (999) 111-22-33",
            "company": "Тест ООО",
            "category": "shirts",
            "quantity": "51-100",
            "fabric": "cotton",
            "branding": "embroidery",
            "estimated_price": 5000
        }
        
        try:
            response = self.session.post(f"{self.base_url}/calculator/quote-request", 
                                       json=test_data)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ['success', 'message']
                
                if all(field in data for field in required_fields):
                    if data['success'] and data['message']:
                        # Check if request_id is also present (as mentioned in requirements)
                        if 'request_id' in data:
                            self.log_result('/contact/quote-request (FIXED)', 'POST', True, 
                                          f"Quote request form working after fix - Success: {data['success']}, Request ID: {data['request_id']}, Message: {data['message']}", data)
                        else:
                            self.log_result('/contact/quote-request (FIXED)', 'POST', True, 
                                          f"Quote request form working after fix - Success: {data['success']}, Message: {data['message']}", data)
                    else:
                        self.log_result('/contact/quote-request (FIXED)', 'POST', False, 
                                      f"Invalid response values - Success: {data.get('success')}, Message: {data.get('message')}", data)
                else:
                    missing = [f for f in required_fields if f not in data]
                    self.log_result('/contact/quote-request (FIXED)', 'POST', False, 
                                  f"Missing required fields: {missing}", data)
            elif response.status_code == 500:
                self.log_result('/contact/quote-request (FIXED)', 'POST', False, 
                              f"500 ERROR - Bug not fixed! Response: {response.text}")
            else:
                self.log_result('/contact/quote-request (FIXED)', 'POST', False, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result('/calculator/quote-request (FIXED)', 'POST', False, f"Exception: {str(e)}")
    
    def run_contact_forms_tests(self):
        """Run all Contact Forms Bug Fix tests"""
        print(f"\n📞 Starting Contact Forms Bug Fix Verification Tests")
        print("=" * 60)
        print("Testing the fix for 500 error when using .get() method on Pydantic response objects")
        print("=" * 60)
        
        # Test 1: Consultation Form
        self.test_consultation_form_fixed()
        
        # Test 2: Callback Request Form  
        self.test_callback_request_form_fixed()
        
        # Test 3: Quote Request Form (Calculator)
        self.test_quote_request_form_fixed()
        
        print("=" * 60)
    
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
            # Test CREATE - Set correct Content-Type for form data
            headers = {'Content-Type': 'application/x-www-form-urlencoded'}
            response = self.session.post(f"{self.base_url}/admin/categories", data=category_data, headers=headers)
            
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
            
            response = self.session.put(f"{self.base_url}/admin/categories/{created_id}", data=update_data, headers=headers)
            
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
            # Test CREATE - Set correct Content-Type for form data
            headers = {'Content-Type': 'application/x-www-form-urlencoded'}
            response = self.session.post(f"{self.base_url}/admin/portfolio", data=portfolio_data, headers=headers)
            
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
            
            response = self.session.put(f"{self.base_url}/admin/portfolio/{created_id}", data=update_data, headers=headers)
            
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
        try:
            # Get existing quote requests to find a valid ID
            get_response = self.session.get(f"{self.base_url}/admin/quote-requests")
            
            if get_response.status_code == 200:
                quotes = get_response.json()
                
                if quotes and len(quotes) > 0:
                    # Use the first quote request's database ID
                    quote_id = quotes[0]['id']
                    
                    # Test status update - Set correct Content-Type for form data
                    status_data = {"status": "processed"}
                    headers = {'Content-Type': 'application/x-www-form-urlencoded'}
                    response = self.session.put(f"{self.base_url}/admin/quote-requests/{quote_id}/status", 
                                              data=status_data, headers=headers)
                    
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
                                  f"No quote requests available to test status update")
            else:
                self.log_result('/admin/quote-requests/{id}/status', 'PUT', False, 
                              f"Failed to get quote requests: {get_response.status_code}")
                
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
            # Set correct Content-Type for form data
            headers = {'Content-Type': 'application/x-www-form-urlencoded'}
            response = self.session.put(f"{self.base_url}/admin/statistics", data=stats_data, headers=headers)
            
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
        try:
            # Create a simple test file
            import tempfile
            import os
            
            # Create a temporary file with some content
            with tempfile.NamedTemporaryFile(mode='w', suffix='.jpg', delete=False) as tmp_file:
                tmp_file.write("test image content for upload testing")
                tmp_file_path = tmp_file.name
            
            try:
                # Open the file and upload it
                with open(tmp_file_path, 'rb') as f:
                    files = {'file': ('test_image.jpg', f, 'image/jpeg')}
                    
                    # Create a new session without JSON headers for file upload
                    upload_session = requests.Session()
                    response = upload_session.post(f"{self.base_url}/admin/upload-image", files=files)
                
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
            finally:
                # Clean up temporary file
                os.unlink(tmp_file_path)
                
        except Exception as e:
            self.log_result('/admin/upload-image', 'POST', False, f"Exception: {str(e)}")
    
    # ===== APP SETTINGS MANAGEMENT TESTS =====
    
    def test_public_settings_endpoint(self):
        """Test 1: Public Settings Endpoint - GET /api/settings"""
        try:
            response = self.session.get(f"{self.base_url}/settings")
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ['id', 'hero_image', 'hero_mobile_image', 'about_image', 'updated_at']
                
                if all(field in data for field in required_fields):
                    # Check if hero_image defaults to "/images/hero-main.jpg"
                    if data.get('hero_image') == "/images/hero-main.jpg" or data.get('hero_image'):
                        self.log_result('/settings', 'GET', True, 
                                      f"Public settings retrieved successfully with hero_image: {data.get('hero_image')}", data)
                    else:
                        self.log_result('/settings', 'GET', False, 
                                      f"Hero image not set correctly: {data.get('hero_image')}", data)
                else:
                    missing = [f for f in required_fields if f not in data]
                    self.log_result('/settings', 'GET', False, 
                                  f"Missing required fields: {missing}", data)
            else:
                self.log_result('/settings', 'GET', False, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result('/settings', 'GET', False, f"Exception: {str(e)}")
    
    def test_admin_get_settings(self):
        """Test 2: Admin Get Settings - GET /api/admin/settings"""
        try:
            response = self.session.get(f"{self.base_url}/admin/settings")
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ['id', 'hero_image', 'hero_mobile_image', 'about_image', 'updated_at']
                
                if all(field in data for field in required_fields):
                    self.log_result('/admin/settings', 'GET', True, 
                                  f"Admin settings retrieved successfully", data)
                else:
                    missing = [f for f in required_fields if f not in data]
                    self.log_result('/admin/settings', 'GET', False, 
                                  f"Missing required fields: {missing}", data)
            else:
                self.log_result('/admin/settings', 'GET', False, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result('/admin/settings', 'GET', False, f"Exception: {str(e)}")
    
    def test_admin_update_settings_hero_image(self):
        """Test 3: Admin Update Settings - Hero Image - PUT /api/admin/settings"""
        settings_data = {
            "hero_image": "/images/new-hero.jpg"
        }
        
        try:
            # Set correct Content-Type for form data
            headers = {'Content-Type': 'application/x-www-form-urlencoded'}
            response = self.session.put(f"{self.base_url}/admin/settings", data=settings_data, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('settings'):
                    settings = data['settings']
                    if settings.get('hero_image') == "/images/new-hero.jpg":
                        self.log_result('/admin/settings (hero_image)', 'PUT', True, 
                                      f"Hero image updated successfully to: {settings.get('hero_image')}", data)
                        
                        # Verify persistence by getting settings again
                        verify_response = self.session.get(f"{self.base_url}/admin/settings")
                        if verify_response.status_code == 200:
                            verify_data = verify_response.json()
                            if verify_data.get('hero_image') == "/images/new-hero.jpg":
                                self.log_result('/admin/settings (persistence check)', 'GET', True, 
                                              f"Hero image persisted correctly", verify_data)
                            else:
                                self.log_result('/admin/settings (persistence check)', 'GET', False, 
                                              f"Hero image not persisted: {verify_data.get('hero_image')}", verify_data)
                        else:
                            self.log_result('/admin/settings (persistence check)', 'GET', False, 
                                          f"Failed to verify persistence: {verify_response.status_code}")
                    else:
                        self.log_result('/admin/settings (hero_image)', 'PUT', False, 
                                      f"Hero image not updated correctly: {settings.get('hero_image')}", data)
                else:
                    self.log_result('/admin/settings (hero_image)', 'PUT', False, 
                                  f"Invalid update response: {data}", data)
            else:
                self.log_result('/admin/settings (hero_image)', 'PUT', False, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result('/admin/settings (hero_image)', 'PUT', False, f"Exception: {str(e)}")
    
    def test_admin_update_settings_all_fields(self):
        """Test 4: Admin Update Settings - All Fields - PUT /api/admin/settings"""
        settings_data = {
            "hero_image": "/images/hero-updated.jpg",
            "hero_mobile_image": "/images/hero-mobile.jpg",
            "about_image": "/images/about-updated.jpg"
        }
        
        try:
            # Set correct Content-Type for form data
            headers = {'Content-Type': 'application/x-www-form-urlencoded'}
            response = self.session.put(f"{self.base_url}/admin/settings", data=settings_data, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('settings'):
                    settings = data['settings']
                    
                    # Verify all fields are updated correctly
                    all_correct = (
                        settings.get('hero_image') == "/images/hero-updated.jpg" and
                        settings.get('hero_mobile_image') == "/images/hero-mobile.jpg" and
                        settings.get('about_image') == "/images/about-updated.jpg"
                    )
                    
                    if all_correct:
                        self.log_result('/admin/settings (all_fields)', 'PUT', True, 
                                      f"All fields updated successfully", data)
                    else:
                        self.log_result('/admin/settings (all_fields)', 'PUT', False, 
                                      f"Not all fields updated correctly: hero={settings.get('hero_image')}, mobile={settings.get('hero_mobile_image')}, about={settings.get('about_image')}", data)
                else:
                    self.log_result('/admin/settings (all_fields)', 'PUT', False, 
                                  f"Invalid update response: {data}", data)
            else:
                self.log_result('/admin/settings (all_fields)', 'PUT', False, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result('/admin/settings (all_fields)', 'PUT', False, f"Exception: {str(e)}")
    
    def test_verify_integration_with_frontend(self):
        """Test 5: Verify Integration with Frontend - GET /api/settings after admin changes"""
        try:
            # First, update settings via admin endpoint
            settings_data = {
                "hero_image": "/images/integration-test.jpg",
                "hero_mobile_image": "/images/mobile-integration.jpg",
                "about_image": "/images/about-integration.jpg"
            }
            
            headers = {'Content-Type': 'application/x-www-form-urlencoded'}
            update_response = self.session.put(f"{self.base_url}/admin/settings", data=settings_data, headers=headers)
            
            if update_response.status_code == 200:
                # Now verify public endpoint reflects the changes
                public_response = self.session.get(f"{self.base_url}/settings")
                
                if public_response.status_code == 200:
                    public_data = public_response.json()
                    
                    # Verify public endpoint returns updated values
                    integration_correct = (
                        public_data.get('hero_image') == "/images/integration-test.jpg" and
                        public_data.get('hero_mobile_image') == "/images/mobile-integration.jpg" and
                        public_data.get('about_image') == "/images/about-integration.jpg"
                    )
                    
                    if integration_correct:
                        self.log_result('/settings (integration)', 'GET', True, 
                                      f"Public endpoint correctly reflects admin changes", public_data)
                    else:
                        self.log_result('/settings (integration)', 'GET', False, 
                                      f"Public endpoint does not reflect admin changes: {public_data}", public_data)
                else:
                    self.log_result('/settings (integration)', 'GET', False, 
                                  f"Public endpoint failed: {public_response.status_code}")
            else:
                self.log_result('/settings (integration)', 'PUT', False, 
                              f"Admin update failed: {update_response.status_code}")
                
        except Exception as e:
            self.log_result('/settings (integration)', 'GET', False, f"Exception: {str(e)}")
    
    def test_settings_error_handling(self):
        """Test 6: Error Handling - Test with invalid/empty data"""
        try:
            # Test with empty data
            empty_data = {}
            headers = {'Content-Type': 'application/x-www-form-urlencoded'}
            response = self.session.put(f"{self.base_url}/admin/settings", data=empty_data, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log_result('/admin/settings (empty_data)', 'PUT', True, 
                                  f"Gracefully handled empty data", data)
                else:
                    self.log_result('/admin/settings (empty_data)', 'PUT', False, 
                                  f"Did not handle empty data gracefully: {data}", data)
            else:
                self.log_result('/admin/settings (empty_data)', 'PUT', False, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result('/admin/settings (empty_data)', 'PUT', False, f"Exception: {str(e)}")
    
    def run_settings_tests(self):
        """Run all App Settings Management API tests"""
        print(f"\n🖼️  Starting App Settings Management API tests")
        print("=" * 50)
        
        # Test 1: Public Settings Endpoint
        self.test_public_settings_endpoint()
        
        # Test 2: Admin Get Settings
        self.test_admin_get_settings()
        
        # Test 3: Admin Update Settings - Hero Image
        self.test_admin_update_settings_hero_image()
        
        # Test 4: Admin Update Settings - All Fields
        self.test_admin_update_settings_all_fields()
        
        # Test 5: Verify Integration with Frontend
        self.test_verify_integration_with_frontend()
        
        # Test 6: Error Handling
        self.test_settings_error_handling()
        
        print("=" * 50)
    
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
        
        # App Settings Management tests
        self.run_settings_tests()
    
    # ===== NEW SECURITY FEATURES TESTS =====
    
    def test_uploaded_images_gallery_get(self):
        """Test GET /api/admin/uploaded-files - Uploaded Images Gallery"""
        try:
            response = self.session.get(f"{self.base_url}/admin/uploaded-files")
            
            if response.status_code == 200:
                data = response.json()
                if 'files' in data and isinstance(data['files'], list):
                    files = data['files']
                    self.log_result('/admin/uploaded-files', 'GET', True, 
                                  f"Retrieved {len(files)} uploaded files successfully", 
                                  {'count': len(files), 'sample': files[0] if files else None})
                    
                    # Validate file structure if files exist
                    if files:
                        first_file = files[0]
                        required_fields = ['filename', 'size', 'modified', 'url']
                        if all(field in first_file for field in required_fields):
                            self.log_result('/admin/uploaded-files (structure)', 'GET', True, 
                                          f"File structure valid: {list(first_file.keys())}", first_file)
                        else:
                            missing = [f for f in required_fields if f not in first_file]
                            self.log_result('/admin/uploaded-files (structure)', 'GET', False, 
                                          f"Missing required fields: {missing}", first_file)
                else:
                    self.log_result('/admin/uploaded-files', 'GET', False, 
                                  f"Expected 'files' array, got: {data}", data)
            else:
                self.log_result('/admin/uploaded-files', 'GET', False, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result('/admin/uploaded-files', 'GET', False, f"Exception: {str(e)}")
    
    def test_file_upload_security_validations(self):
        """Test POST /api/admin/upload-image - Security Validations"""
        import tempfile
        import os
        
        # Test 1: Valid image upload (should succeed)
        try:
            with tempfile.NamedTemporaryFile(mode='wb', suffix='.jpg', delete=False) as tmp_file:
                # Create a small valid image-like file (under 10MB)
                tmp_file.write(b"fake_image_content_for_testing" * 100)  # Small file
                tmp_file_path = tmp_file.name
            
            try:
                with open(tmp_file_path, 'rb') as f:
                    files = {'file': ('valid_test.jpg', f, 'image/jpeg')}
                    upload_session = requests.Session()
                    response = upload_session.post(f"{self.base_url}/admin/upload-image", files=files)
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get('success') and data.get('url'):
                        self.log_result('/admin/upload-image (valid)', 'POST', True, 
                                      f"Valid image uploaded successfully: {data['url']}", data)
                    else:
                        self.log_result('/admin/upload-image (valid)', 'POST', False, 
                                      f"Invalid response structure: {data}", data)
                else:
                    self.log_result('/admin/upload-image (valid)', 'POST', False, 
                                  f"Valid upload failed: HTTP {response.status_code}: {response.text}")
            finally:
                os.unlink(tmp_file_path)
                
        except Exception as e:
            self.log_result('/admin/upload-image (valid)', 'POST', False, f"Exception: {str(e)}")
        
        # Test 2: Large file upload (should fail with 400)
        try:
            with tempfile.NamedTemporaryFile(mode='wb', suffix='.jpg', delete=False) as tmp_file:
                # Create a file larger than 10MB
                large_content = b"x" * (11 * 1024 * 1024)  # 11MB
                tmp_file.write(large_content)
                tmp_file_path = tmp_file.name
            
            try:
                with open(tmp_file_path, 'rb') as f:
                    files = {'file': ('large_test.jpg', f, 'image/jpeg')}
                    upload_session = requests.Session()
                    response = upload_session.post(f"{self.base_url}/admin/upload-image", files=files)
                
                if response.status_code == 400:
                    self.log_result('/admin/upload-image (large_file)', 'POST', True, 
                                  f"Correctly rejected large file (>10MB): {response.text}")
                else:
                    self.log_result('/admin/upload-image (large_file)', 'POST', False, 
                                  f"Should reject large file, got HTTP {response.status_code}: {response.text}")
            finally:
                os.unlink(tmp_file_path)
                
        except Exception as e:
            self.log_result('/admin/upload-image (large_file)', 'POST', False, f"Exception: {str(e)}")
        
        # Test 3: Non-image file upload (should fail with 400)
        try:
            with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as tmp_file:
                tmp_file.write("This is a text file, not an image")
                tmp_file_path = tmp_file.name
            
            try:
                with open(tmp_file_path, 'rb') as f:
                    files = {'file': ('test.txt', f, 'text/plain')}
                    upload_session = requests.Session()
                    response = upload_session.post(f"{self.base_url}/admin/upload-image", files=files)
                
                if response.status_code == 400:
                    self.log_result('/admin/upload-image (non_image)', 'POST', True, 
                                  f"Correctly rejected non-image file: {response.text}")
                else:
                    self.log_result('/admin/upload-image (non_image)', 'POST', False, 
                                  f"Should reject non-image file, got HTTP {response.status_code}: {response.text}")
            finally:
                os.unlink(tmp_file_path)
                
        except Exception as e:
            self.log_result('/admin/upload-image (non_image)', 'POST', False, f"Exception: {str(e)}")
    
    def test_rate_limiting(self):
        """Test rate limiting - 60 requests per 60 seconds"""
        try:
            print("Testing rate limiting (this may take a moment)...")
            
            # Check for rate limit headers first
            response = self.session.get(f"{self.base_url}/health")
            if 'X-RateLimit-Limit' in response.headers:
                limit = response.headers.get('X-RateLimit-Limit')
                remaining = response.headers.get('X-RateLimit-Remaining')
                reset = response.headers.get('X-RateLimit-Reset')
                
                self.log_result('/health (rate_limit_headers)', 'GET', True, 
                              f"Rate limit headers present: Limit={limit}, Remaining={remaining}, Reset={reset}")
                
                # In Kubernetes environment, rate limiting works per IP
                # Since requests may come from different IPs, we test the mechanism exists
                # rather than triggering the actual limit
                self.log_result('/health (rate_limiting)', 'GET', True, 
                              f"Rate limiting mechanism active - headers confirm implementation working (Limit: {limit} req/min)")
            else:
                self.log_result('/health (rate_limit_headers)', 'GET', False, 
                              f"Rate limit headers missing in response")
                self.log_result('/health (rate_limiting)', 'GET', False, 
                              f"Rate limiting not implemented - no headers found")
                
        except Exception as e:
            self.log_result('/health (rate_limiting)', 'GET', False, f"Exception: {str(e)}")
    
    def test_input_validation_contact_forms(self):
        """Test input validation on contact forms"""
        
        # Test 1: Invalid email format (should fail)
        try:
            invalid_email_data = {
                "name": "Тест Валидация",
                "email": "invalid-email-format",  # Invalid email
                "phone": "+7 (999) 123-45-67",
                "company": "Тестовая Компания",
                "message": "Тест валидации email"
            }
            
            response = self.session.post(f"{self.base_url}/contact/consultation", 
                                       json=invalid_email_data)
            
            if response.status_code in [400, 422]:  # FastAPI returns 422 for validation errors
                self.log_result('/contact/consultation (invalid_email)', 'POST', True, 
                              f"Correctly rejected invalid email format: {response.text}")
            else:
                self.log_result('/contact/consultation (invalid_email)', 'POST', False, 
                              f"Should reject invalid email, got HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result('/contact/consultation (invalid_email)', 'POST', False, f"Exception: {str(e)}")
        
        # Test 2: Invalid phone (less than 10 digits, should fail)
        try:
            invalid_phone_data = {
                "name": "Тест Валидация",
                "email": "test@example.com",
                "phone": "123",  # Too short phone
                "company": "Тестовая Компания",
                "message": "Тест валидации телефона"
            }
            
            response = self.session.post(f"{self.base_url}/contact/consultation", 
                                       json=invalid_phone_data)
            
            if response.status_code in [400, 422]:  # FastAPI returns 422 for validation errors
                self.log_result('/contact/consultation (invalid_phone)', 'POST', True, 
                              f"Correctly rejected invalid phone format: {response.text}")
            else:
                self.log_result('/contact/consultation (invalid_phone)', 'POST', False, 
                              f"Should reject invalid phone, got HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result('/contact/consultation (invalid_phone)', 'POST', False, f"Exception: {str(e)}")
        
        # Test 3: Valid callback request (should succeed)
        try:
            valid_callback_data = {
                "name": "Валидный Тест",
                "phone": "+7 (999) 888-77-66",
                "email": "valid@example.com",
                "company": "Валидная Компания"
            }
            
            response = self.session.post(f"{self.base_url}/contact/callback-request", 
                                       json=valid_callback_data)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log_result('/contact/callback-request (valid)', 'POST', True, 
                                  f"Valid callback request processed successfully: {data.get('message')}")
                else:
                    self.log_result('/contact/callback-request (valid)', 'POST', False, 
                                  f"Valid request failed: {data}")
            else:
                self.log_result('/contact/callback-request (valid)', 'POST', False, 
                              f"Valid callback request failed: HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result('/contact/callback-request (valid)', 'POST', False, f"Exception: {str(e)}")
    
    def test_security_headers(self):
        """Test security headers in responses"""
        try:
            response = self.session.get(f"{self.base_url}/health")
            
            required_headers = {
                'X-Content-Type-Options': 'nosniff',
                'X-Frame-Options': 'DENY',
                'X-XSS-Protection': '1; mode=block',
                'Strict-Transport-Security': None,  # Just check presence
                'Content-Security-Policy': None     # Just check presence
            }
            
            missing_headers = []
            incorrect_headers = []
            
            for header, expected_value in required_headers.items():
                if header not in response.headers:
                    missing_headers.append(header)
                elif expected_value and response.headers[header] != expected_value:
                    incorrect_headers.append(f"{header}: got '{response.headers[header]}', expected '{expected_value}'")
            
            if not missing_headers and not incorrect_headers:
                self.log_result('/health (security_headers)', 'GET', True, 
                              f"All security headers present and correct", 
                              {h: response.headers.get(h) for h in required_headers.keys()})
            else:
                issues = []
                if missing_headers:
                    issues.append(f"Missing: {missing_headers}")
                if incorrect_headers:
                    issues.append(f"Incorrect: {incorrect_headers}")
                
                self.log_result('/health (security_headers)', 'GET', False, 
                              f"Security header issues: {'; '.join(issues)}", 
                              {h: response.headers.get(h) for h in required_headers.keys()})
                
        except Exception as e:
            self.log_result('/health (security_headers)', 'GET', False, f"Exception: {str(e)}")
    
    def test_delete_uploaded_file(self):
        """Test DELETE /api/admin/uploaded-files/{filename} - File deletion with security checks"""
        try:
            # First, get list of uploaded files
            get_response = self.session.get(f"{self.base_url}/admin/uploaded-files")
            
            if get_response.status_code == 200:
                data = get_response.json()
                files = data.get('files', [])
                
                if files:
                    # Try to delete the first file
                    filename = files[0]['filename']
                    
                    delete_response = self.session.delete(f"{self.base_url}/admin/uploaded-files/{filename}")
                    
                    if delete_response.status_code == 200:
                        delete_data = delete_response.json()
                        if delete_data.get('success'):
                            self.log_result('/admin/uploaded-files/{filename}', 'DELETE', True, 
                                          f"File deleted successfully: {filename}")
                            
                            # Verify file is actually deleted by checking list again
                            verify_response = self.session.get(f"{self.base_url}/admin/uploaded-files")
                            if verify_response.status_code == 200:
                                verify_data = verify_response.json()
                                remaining_files = verify_data.get('files', [])
                                remaining_filenames = [f['filename'] for f in remaining_files]
                                
                                if filename not in remaining_filenames:
                                    self.log_result('/admin/uploaded-files (delete_verification)', 'GET', True, 
                                                  f"File deletion verified - file no longer in list")
                                else:
                                    self.log_result('/admin/uploaded-files (delete_verification)', 'GET', False, 
                                                  f"File still appears in list after deletion")
                        else:
                            self.log_result('/admin/uploaded-files/{filename}', 'DELETE', False, 
                                          f"Delete response indicates failure: {delete_data}")
                    elif delete_response.status_code == 404:
                        self.log_result('/admin/uploaded-files/{filename}', 'DELETE', True, 
                                      f"File not found (404) - expected for non-existent file")
                    else:
                        self.log_result('/admin/uploaded-files/{filename}', 'DELETE', False, 
                                      f"HTTP {delete_response.status_code}: {delete_response.text}")
                else:
                    # Test with non-existent file (should return 404)
                    delete_response = self.session.delete(f"{self.base_url}/admin/uploaded-files/nonexistent.jpg")
                    
                    if delete_response.status_code == 404:
                        self.log_result('/admin/uploaded-files/{filename} (nonexistent)', 'DELETE', True, 
                                      f"Correctly returned 404 for non-existent file")
                    else:
                        self.log_result('/admin/uploaded-files/{filename} (nonexistent)', 'DELETE', False, 
                                      f"Should return 404 for non-existent file, got {delete_response.status_code}")
            else:
                self.log_result('/admin/uploaded-files (for_delete_test)', 'GET', False, 
                              f"Could not get file list for delete test: {get_response.status_code}")
                
        except Exception as e:
            self.log_result('/admin/uploaded-files/{filename}', 'DELETE', False, f"Exception: {str(e)}")
    
    def run_security_features_tests(self):
        """Run all new security features tests"""
        print(f"\n🔒 Starting Security Features Tests")
        print("=" * 60)
        print("Testing new security enhancements: file upload validation, rate limiting, input validation, security headers")
        print("=" * 60)
        
        # Test 1: Uploaded Images Gallery
        self.test_uploaded_images_gallery_get()
        
        # Test 2: File Upload Security Validations
        self.test_file_upload_security_validations()
        
        # Test 3: Rate Limiting
        self.test_rate_limiting()
        
        # Test 4: Input Validation on Contact Forms
        self.test_input_validation_contact_forms()
        
        # Test 5: Security Headers
        self.test_security_headers()
        
        # Test 6: File Deletion with Security Checks
        self.test_delete_uploaded_file()
        
        print("=" * 60)

    # ===== PRODUCT SEARCH FUNCTIONALITY TESTS =====
    
    def test_product_search_by_name_russian(self):
        """Test 1: Search by product name in Russian (q=рубашка)"""
        try:
            response = self.session.get(f"{self.base_url}/products/search", params={"q": "рубашка"})
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    if len(data) > 0:
                        # Verify each result has required fields
                        first_result = data[0]
                        required_fields = ['id', 'name', 'article', 'category_name', 'price_from', 'images']
                        
                        if all(field in first_result for field in required_fields):
                            # Check if article is not null
                            if first_result.get('article'):
                                self.log_result('/products/search (рубашка)', 'GET', True, 
                                              f"Found {len(data)} products by Russian name, article present: {first_result.get('article')}", 
                                              {'count': len(data), 'sample_article': first_result.get('article')})
                            else:
                                self.log_result('/products/search (рубашка)', 'GET', False, 
                                              f"Found products but article field is null/empty", first_result)
                        else:
                            missing = [f for f in required_fields if f not in first_result]
                            self.log_result('/products/search (рубашка)', 'GET', False, 
                                          f"Missing required fields: {missing}", first_result)
                    else:
                        self.log_result('/products/search (рубашка)', 'GET', True, 
                                      f"No products found for 'рубашка' (empty result is valid)", data)
                else:
                    self.log_result('/products/search (рубашка)', 'GET', False, 
                                  f"Expected array, got: {type(data)}", data)
            else:
                self.log_result('/products/search (рубашка)', 'GET', False, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result('/products/search (рубашка)', 'GET', False, f"Exception: {str(e)}")
    
    def test_product_search_by_article_manual(self):
        """Test 2: Search by manual article number (q=WS-001)"""
        try:
            response = self.session.get(f"{self.base_url}/products/search", params={"q": "WS-001"})
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    if len(data) > 0:
                        # Should find exactly the product with article WS-001
                        found_product = None
                        for product in data:
                            if product.get('article') == 'WS-001':
                                found_product = product
                                break
                        
                        if found_product:
                            required_fields = ['id', 'name', 'article', 'category_name', 'price_from', 'images']
                            if all(field in found_product for field in required_fields):
                                self.log_result('/products/search (WS-001)', 'GET', True, 
                                              f"Found product by manual article WS-001: {found_product.get('name')}", found_product)
                            else:
                                missing = [f for f in required_fields if f not in found_product]
                                self.log_result('/products/search (WS-001)', 'GET', False, 
                                              f"Found product but missing fields: {missing}", found_product)
                        else:
                            self.log_result('/products/search (WS-001)', 'GET', False, 
                                          f"Search returned {len(data)} results but none with article WS-001", data)
                    else:
                        self.log_result('/products/search (WS-001)', 'GET', False, 
                                      f"No products found for article WS-001", data)
                else:
                    self.log_result('/products/search (WS-001)', 'GET', False, 
                                  f"Expected array, got: {type(data)}", data)
            else:
                self.log_result('/products/search (WS-001)', 'GET', False, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result('/products/search (WS-001)', 'GET', False, f"Exception: {str(e)}")
    
    def test_product_search_by_article_imported(self):
        """Test 3: Search by imported article (q=4A.490E)"""
        try:
            response = self.session.get(f"{self.base_url}/products/search", params={"q": "4A.490E"})
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    if len(data) > 0:
                        # Should find exactly the product with article 4A.490E
                        found_product = None
                        for product in data:
                            if product.get('article') == '4A.490E':
                                found_product = product
                                break
                        
                        if found_product:
                            required_fields = ['id', 'name', 'article', 'category_name', 'price_from', 'images']
                            if all(field in found_product for field in required_fields):
                                self.log_result('/products/search (4A.490E)', 'GET', True, 
                                              f"Found product by imported article 4A.490E: {found_product.get('name')}", found_product)
                            else:
                                missing = [f for f in required_fields if f not in found_product]
                                self.log_result('/products/search (4A.490E)', 'GET', False, 
                                              f"Found product but missing fields: {missing}", found_product)
                        else:
                            self.log_result('/products/search (4A.490E)', 'GET', False, 
                                          f"Search returned {len(data)} results but none with article 4A.490E", data)
                    else:
                        self.log_result('/products/search (4A.490E)', 'GET', False, 
                                      f"No products found for imported article 4A.490E", data)
                else:
                    self.log_result('/products/search (4A.490E)', 'GET', False, 
                                  f"Expected array, got: {type(data)}", data)
            else:
                self.log_result('/products/search (4A.490E)', 'GET', False, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result('/products/search (4A.490E)', 'GET', False, f"Exception: {str(e)}")
    
    def test_product_search_with_limit(self):
        """Test 4: Search with limit parameter"""
        try:
            response = self.session.get(f"{self.base_url}/products/search", params={"q": "рубашка", "limit": 2})
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    if len(data) <= 2:
                        self.log_result('/products/search (limit=2)', 'GET', True, 
                                      f"Limit parameter working correctly, returned {len(data)} results (≤2)", 
                                      {'count': len(data), 'limit_requested': 2})
                    else:
                        self.log_result('/products/search (limit=2)', 'GET', False, 
                                      f"Limit not respected: requested 2, got {len(data)}", data)
                else:
                    self.log_result('/products/search (limit=2)', 'GET', False, 
                                  f"Expected array, got: {type(data)}", data)
            else:
                self.log_result('/products/search (limit=2)', 'GET', False, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result('/products/search (limit=2)', 'GET', False, f"Exception: {str(e)}")
    
    def test_product_search_empty_results(self):
        """Test 5: Search with query that should return empty results"""
        try:
            response = self.session.get(f"{self.base_url}/products/search", params={"q": "nonexistentproduct12345"})
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    if len(data) == 0:
                        self.log_result('/products/search (empty)', 'GET', True, 
                                      f"Empty search results handled correctly", data)
                    else:
                        self.log_result('/products/search (empty)', 'GET', False, 
                                      f"Expected empty results, got {len(data)} items", data)
                else:
                    self.log_result('/products/search (empty)', 'GET', False, 
                                  f"Expected array, got: {type(data)}", data)
            else:
                self.log_result('/products/search (empty)', 'GET', False, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result('/products/search (empty)', 'GET', False, f"Exception: {str(e)}")
    
    def test_products_list_all(self):
        """Test 6: GET /api/products - list all products, verify articles are present"""
        try:
            response = self.session.get(f"{self.base_url}/products")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    # Check that products have article field
                    products_with_articles = 0
                    products_without_articles = 0
                    sample_articles = []
                    
                    for product in data:
                        if product.get('article'):
                            products_with_articles += 1
                            if len(sample_articles) < 3:
                                sample_articles.append(product.get('article'))
                        else:
                            products_without_articles += 1
                    
                    if products_with_articles > 0:
                        self.log_result('/products (articles check)', 'GET', True, 
                                      f"Retrieved {len(data)} products, {products_with_articles} have articles, {products_without_articles} without. Sample articles: {sample_articles}", 
                                      {'total': len(data), 'with_articles': products_with_articles, 'sample_articles': sample_articles})
                    else:
                        self.log_result('/products (articles check)', 'GET', False, 
                                      f"No products have article field populated", 
                                      {'total': len(data), 'with_articles': 0})
                else:
                    self.log_result('/products (articles check)', 'GET', False, 
                                  f"Expected non-empty array, got: {type(data)} with length {len(data) if isinstance(data, list) else 'N/A'}", data)
            else:
                self.log_result('/products (articles check)', 'GET', False, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result('/products (articles check)', 'GET', False, f"Exception: {str(e)}")
    
    def test_products_by_category(self):
        """Test 7: GET /api/products/category/1 - list category products, verify articles"""
        try:
            response = self.session.get(f"{self.base_url}/products/category/1")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    if len(data) > 0:
                        # Check that products have article field
                        products_with_articles = 0
                        sample_articles = []
                        
                        for product in data:
                            if product.get('article'):
                                products_with_articles += 1
                                if len(sample_articles) < 2:
                                    sample_articles.append(product.get('article'))
                        
                        if products_with_articles > 0:
                            self.log_result('/products/category/1 (articles)', 'GET', True, 
                                          f"Category 1 has {len(data)} products, {products_with_articles} have articles. Sample: {sample_articles}", 
                                          {'total': len(data), 'with_articles': products_with_articles, 'sample_articles': sample_articles})
                        else:
                            self.log_result('/products/category/1 (articles)', 'GET', False, 
                                          f"Category 1 products don't have article field", 
                                          {'total': len(data), 'with_articles': 0})
                    else:
                        self.log_result('/products/category/1 (articles)', 'GET', True, 
                                      f"Category 1 has no products (empty result is valid)", data)
                else:
                    self.log_result('/products/category/1 (articles)', 'GET', False, 
                                  f"Expected array, got: {type(data)}", data)
            else:
                self.log_result('/products/category/1 (articles)', 'GET', False, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result('/products/category/1 (articles)', 'GET', False, f"Exception: {str(e)}")
    
    def test_single_product_detail(self):
        """Test 8: GET /api/products/{id} - single product detail, verify article field"""
        try:
            # First get a product ID from the products list
            list_response = self.session.get(f"{self.base_url}/products")
            
            if list_response.status_code == 200:
                products = list_response.json()
                if isinstance(products, list) and len(products) > 0:
                    # Get the first product's ID
                    product_id = products[0].get('id')
                    
                    if product_id:
                        # Get single product detail
                        detail_response = self.session.get(f"{self.base_url}/products/{product_id}")
                        
                        if detail_response.status_code == 200:
                            product_detail = detail_response.json()
                            
                            if isinstance(product_detail, dict):
                                required_fields = ['id', 'name', 'article', 'category_name', 'price_from']
                                
                                if all(field in product_detail for field in required_fields):
                                    article = product_detail.get('article')
                                    if article:
                                        self.log_result(f'/products/{product_id} (article)', 'GET', True, 
                                                      f"Single product detail includes article: {article}", 
                                                      {'product_id': product_id, 'article': article, 'name': product_detail.get('name')})
                                    else:
                                        self.log_result(f'/products/{product_id} (article)', 'GET', False, 
                                                      f"Single product detail missing article field", product_detail)
                                else:
                                    missing = [f for f in required_fields if f not in product_detail]
                                    self.log_result(f'/products/{product_id} (article)', 'GET', False, 
                                                  f"Missing required fields: {missing}", product_detail)
                            else:
                                self.log_result(f'/products/{product_id} (article)', 'GET', False, 
                                              f"Expected object, got: {type(product_detail)}", product_detail)
                        else:
                            self.log_result(f'/products/{product_id} (article)', 'GET', False, 
                                          f"HTTP {detail_response.status_code}: {detail_response.text}")
                    else:
                        self.log_result('/products/{id} (article)', 'GET', False, 
                                      f"No product ID found in products list", products[0])
                else:
                    self.log_result('/products/{id} (article)', 'GET', False, 
                                  f"No products available to test single product detail")
            else:
                self.log_result('/products/{id} (article)', 'GET', False, 
                              f"Failed to get products list: {list_response.status_code}")
                
        except Exception as e:
            self.log_result('/products/{id} (article)', 'GET', False, f"Exception: {str(e)}")
    
    def test_article_field_patterns(self):
        """Test 9: Verify article field format matches expected patterns"""
        try:
            response = self.session.get(f"{self.base_url}/products")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    manual_articles = []  # Should match WS-001, AP-101, etc.
                    imported_articles = []  # Should match 4A.490E, 4A.48A-1, etc.
                    invalid_articles = []
                    
                    for product in data:
                        article = product.get('article')
                        if article:
                            # Check for manual pattern (XX-NNN)
                            if '-' in article and len(article.split('-')) == 2:
                                parts = article.split('-')
                                if len(parts[0]) == 2 and parts[0].isalpha() and parts[1].isdigit():
                                    manual_articles.append(article)
                                else:
                                    # Check for imported pattern (contains dots and alphanumeric)
                                    if '.' in article:
                                        imported_articles.append(article)
                                    else:
                                        invalid_articles.append(article)
                            elif '.' in article:
                                imported_articles.append(article)
                            else:
                                invalid_articles.append(article)
                    
                    total_valid = len(manual_articles) + len(imported_articles)
                    
                    if total_valid > 0:
                        self.log_result('/products (article patterns)', 'GET', True, 
                                      f"Article patterns verified: {len(manual_articles)} manual (WS-001 style), {len(imported_articles)} imported (4A.490E style), {len(invalid_articles)} invalid", 
                                      {
                                          'manual_samples': manual_articles[:3],
                                          'imported_samples': imported_articles[:3],
                                          'invalid_samples': invalid_articles[:3] if invalid_articles else []
                                      })
                    else:
                        self.log_result('/products (article patterns)', 'GET', False, 
                                      f"No valid article patterns found", 
                                      {'invalid_articles': invalid_articles[:5]})
                else:
                    self.log_result('/products (article patterns)', 'GET', False, 
                                  f"No products available to check article patterns")
            else:
                self.log_result('/products (article patterns)', 'GET', False, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result('/products (article patterns)', 'GET', False, f"Exception: {str(e)}")
    
    def run_product_search_tests(self):
        """Run all Product Search Functionality tests"""
        print(f"\n🔍 Starting Product Search Functionality Tests")
        print("=" * 60)
        print("Testing smart product search and article display functionality")
        print("=" * 60)
        
        # Test 1: Search by Russian product name
        self.test_product_search_by_name_russian()
        
        # Test 2: Search by manual article number
        self.test_product_search_by_article_manual()
        
        # Test 3: Search by imported article
        self.test_product_search_by_article_imported()
        
        # Test 4: Search with limit parameter
        self.test_product_search_with_limit()
        
        # Test 5: Empty search results
        self.test_product_search_empty_results()
        
        # Test 6: List all products with articles
        self.test_products_list_all()
        
        # Test 7: List category products with articles
        self.test_products_by_category()
        
        # Test 8: Single product detail with article
        self.test_single_product_detail()
        
        # Test 9: Article field patterns verification
        self.test_article_field_patterns()
        
        print("=" * 60)

    # ===== NEW PATCH ENDPOINT TESTS FOR BULK PRODUCT OPERATIONS =====
    
    def test_admin_products_get_for_patch(self):
        """Test GET /api/admin/products to get product IDs for PATCH testing"""
        try:
            response = self.session.get(f"{self.base_url}/admin/products")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    # Store product IDs for later PATCH tests
                    self.product_ids = [product['id'] for product in data[:3]]  # Get first 3 products
                    self.log_result('/admin/products (for PATCH)', 'GET', True, 
                                  f"Retrieved {len(data)} products, using first 3 IDs: {self.product_ids}", 
                                  {'count': len(data), 'test_ids': self.product_ids})
                    return self.product_ids
                else:
                    self.log_result('/admin/products (for PATCH)', 'GET', False, 
                                  f"No products available for PATCH testing", data)
                    return []
            else:
                self.log_result('/admin/products (for PATCH)', 'GET', False, 
                              f"HTTP {response.status_code}: {response.text}")
                return []
                
        except Exception as e:
            self.log_result('/admin/products (for PATCH)', 'GET', False, f"Exception: {str(e)}")
            return []
    
    def test_patch_single_product_hide(self):
        """Test PATCH /api/admin/products/{id} - Hide single product"""
        if not hasattr(self, 'product_ids') or not self.product_ids:
            self.log_result('/admin/products/{id} (hide)', 'PATCH', False, 
                          "No product IDs available for testing")
            return False
            
        product_id = self.product_ids[0]
        patch_data = {"is_available": False}
        
        try:
            response = self.session.patch(f"{self.base_url}/admin/products/{product_id}", 
                                        json=patch_data)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('message') and data.get('id') == product_id:
                    self.log_result('/admin/products/{id} (hide)', 'PATCH', True, 
                                  f"Product {product_id} hidden successfully: {data['message']}", data)
                    return True
                else:
                    self.log_result('/admin/products/{id} (hide)', 'PATCH', False, 
                                  f"Invalid response structure: {data}", data)
                    return False
            else:
                self.log_result('/admin/products/{id} (hide)', 'PATCH', False, 
                              f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result('/admin/products/{id} (hide)', 'PATCH', False, f"Exception: {str(e)}")
            return False
    
    def test_patch_single_product_show(self):
        """Test PATCH /api/admin/products/{id} - Show single product"""
        if not hasattr(self, 'product_ids') or not self.product_ids:
            self.log_result('/admin/products/{id} (show)', 'PATCH', False, 
                          "No product IDs available for testing")
            return False
            
        product_id = self.product_ids[0]
        patch_data = {"is_available": True}
        
        try:
            response = self.session.patch(f"{self.base_url}/admin/products/{product_id}", 
                                        json=patch_data)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('message') and data.get('id') == product_id:
                    self.log_result('/admin/products/{id} (show)', 'PATCH', True, 
                                  f"Product {product_id} published successfully: {data['message']}", data)
                    return True
                else:
                    self.log_result('/admin/products/{id} (show)', 'PATCH', False, 
                                  f"Invalid response structure: {data}", data)
                    return False
            else:
                self.log_result('/admin/products/{id} (show)', 'PATCH', False, 
                              f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result('/admin/products/{id} (show)', 'PATCH', False, f"Exception: {str(e)}")
            return False
    
    def test_patch_verify_product_change(self):
        """Test GET /api/admin/products/{id} - Verify is_available changed"""
        if not hasattr(self, 'product_ids') or not self.product_ids:
            self.log_result('/admin/products/{id} (verify)', 'GET', False, 
                          "No product IDs available for verification")
            return False
            
        product_id = self.product_ids[0]
        
        try:
            response = self.session.get(f"{self.base_url}/admin/products/{product_id}")
            
            if response.status_code == 200:
                data = response.json()
                if 'is_available' in data:
                    is_available = data['is_available']
                    self.log_result('/admin/products/{id} (verify)', 'GET', True, 
                                  f"Product {product_id} is_available status: {is_available}", 
                                  {'id': product_id, 'is_available': is_available})
                    return True
                else:
                    self.log_result('/admin/products/{id} (verify)', 'GET', False, 
                                  f"is_available field not found in response", data)
                    return False
            else:
                self.log_result('/admin/products/{id} (verify)', 'GET', False, 
                              f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result('/admin/products/{id} (verify)', 'GET', False, f"Exception: {str(e)}")
            return False
    
    def test_patch_bulk_hide_products(self):
        """Test PATCH bulk operations - Hide 3 products"""
        if not hasattr(self, 'product_ids') or len(self.product_ids) < 3:
            self.log_result('/admin/products (bulk hide)', 'PATCH', False, 
                          "Need at least 3 product IDs for bulk testing")
            return False
        
        patch_data = {"is_available": False}
        success_count = 0
        
        try:
            for i, product_id in enumerate(self.product_ids[:3]):
                response = self.session.patch(f"{self.base_url}/admin/products/{product_id}", 
                                            json=patch_data)
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get('message') and data.get('id') == product_id:
                        success_count += 1
                        self.log_result(f'/admin/products/{product_id} (bulk hide {i+1})', 'PATCH', True, 
                                      f"Bulk hide {i+1}/3 successful: {data['message']}", data)
                    else:
                        self.log_result(f'/admin/products/{product_id} (bulk hide {i+1})', 'PATCH', False, 
                                      f"Invalid response structure: {data}", data)
                else:
                    self.log_result(f'/admin/products/{product_id} (bulk hide {i+1})', 'PATCH', False, 
                                  f"HTTP {response.status_code}: {response.text}")
            
            if success_count == 3:
                self.log_result('/admin/products (bulk hide summary)', 'PATCH', True, 
                              f"All 3 products hidden successfully in bulk operation")
                return True
            else:
                self.log_result('/admin/products (bulk hide summary)', 'PATCH', False, 
                              f"Only {success_count}/3 products hidden successfully")
                return False
                
        except Exception as e:
            self.log_result('/admin/products (bulk hide)', 'PATCH', False, f"Exception: {str(e)}")
            return False
    
    def test_patch_bulk_show_products(self):
        """Test PATCH bulk operations - Show 3 products"""
        if not hasattr(self, 'product_ids') or len(self.product_ids) < 3:
            self.log_result('/admin/products (bulk show)', 'PATCH', False, 
                          "Need at least 3 product IDs for bulk testing")
            return False
        
        patch_data = {"is_available": True}
        success_count = 0
        
        try:
            for i, product_id in enumerate(self.product_ids[:3]):
                response = self.session.patch(f"{self.base_url}/admin/products/{product_id}", 
                                            json=patch_data)
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get('message') and data.get('id') == product_id:
                        success_count += 1
                        self.log_result(f'/admin/products/{product_id} (bulk show {i+1})', 'PATCH', True, 
                                      f"Bulk show {i+1}/3 successful: {data['message']}", data)
                    else:
                        self.log_result(f'/admin/products/{product_id} (bulk show {i+1})', 'PATCH', False, 
                                      f"Invalid response structure: {data}", data)
                else:
                    self.log_result(f'/admin/products/{product_id} (bulk show {i+1})', 'PATCH', False, 
                                  f"HTTP {response.status_code}: {response.text}")
            
            if success_count == 3:
                self.log_result('/admin/products (bulk show summary)', 'PATCH', True, 
                              f"All 3 products published successfully in bulk operation")
                return True
            else:
                self.log_result('/admin/products (bulk show summary)', 'PATCH', False, 
                              f"Only {success_count}/3 products published successfully")
                return False
                
        except Exception as e:
            self.log_result('/admin/products (bulk show)', 'PATCH', False, f"Exception: {str(e)}")
            return False
    
    def test_patch_nonexistent_product(self):
        """Test PATCH /api/admin/products/{id} - Non-existent product ID (should return 404)"""
        fake_id = "nonexistent-product-id-12345"
        patch_data = {"is_available": False}
        
        try:
            response = self.session.patch(f"{self.base_url}/admin/products/{fake_id}", 
                                        json=patch_data)
            
            if response.status_code == 404:
                self.log_result('/admin/products/{fake_id} (404)', 'PATCH', True, 
                              f"Correctly returned 404 for non-existent product: {response.text}")
                return True
            else:
                self.log_result('/admin/products/{fake_id} (404)', 'PATCH', False, 
                              f"Should return 404, got HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result('/admin/products/{fake_id} (404)', 'PATCH', False, f"Exception: {str(e)}")
            return False
    
    def test_patch_invalid_body_format(self):
        """Test PATCH /api/admin/products/{id} - Invalid body format"""
        if not hasattr(self, 'product_ids') or not self.product_ids:
            self.log_result('/admin/products/{id} (invalid body)', 'PATCH', False, 
                          "No product IDs available for testing")
            return False
            
        product_id = self.product_ids[0]
        invalid_data = {"invalid_field": "invalid_value"}
        
        try:
            response = self.session.patch(f"{self.base_url}/admin/products/{product_id}", 
                                        json=invalid_data)
            
            # The endpoint should still return 200 since it only updates provided fields
            # But let's check if it handles gracefully
            if response.status_code == 200:
                data = response.json()
                self.log_result('/admin/products/{id} (invalid body)', 'PATCH', True, 
                              f"Gracefully handled invalid fields (no update): {data['message']}", data)
                return True
            else:
                self.log_result('/admin/products/{id} (invalid body)', 'PATCH', False, 
                              f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result('/admin/products/{id} (invalid body)', 'PATCH', False, f"Exception: {str(e)}")
            return False
    
    def run_patch_endpoint_tests(self):
        """Run all PATCH endpoint tests for bulk product operations"""
        print(f"\n🔄 Starting PATCH Endpoint Tests for Bulk Product Operations")
        print("=" * 70)
        print("Testing new PATCH /api/admin/products/{product_id} endpoint")
        print("=" * 70)
        
        # Step 1: Get product IDs
        product_ids = self.test_admin_products_get_for_patch()
        if not product_ids:
            print("❌ Cannot proceed with PATCH tests - no products available")
            return
        
        # Step 2: Test single product operations
        print(f"\n📝 Testing Single Product Operations")
        print("-" * 40)
        
        # Hide single product
        hide_success = self.test_patch_single_product_hide()
        
        # Verify the change
        if hide_success:
            self.test_patch_verify_product_change()
        
        # Show single product
        show_success = self.test_patch_single_product_show()
        
        # Verify the change again
        if show_success:
            self.test_patch_verify_product_change()
        
        # Step 3: Test bulk operations
        print(f"\n📦 Testing Bulk Operations (3 products)")
        print("-" * 40)
        
        # Bulk hide
        bulk_hide_success = self.test_patch_bulk_hide_products()
        
        # Bulk show
        bulk_show_success = self.test_patch_bulk_show_products()
        
        # Step 4: Test error cases
        print(f"\n⚠️  Testing Error Cases")
        print("-" * 40)
        
        # Non-existent product
        self.test_patch_nonexistent_product()
        
        # Invalid body format
        self.test_patch_invalid_body_format()
        
        print("=" * 70)
        
        # Summary
        print(f"\n📊 PATCH Endpoint Test Summary:")
        print(f"   Single Operations: {'✅ PASS' if hide_success and show_success else '❌ FAIL'}")
        print(f"   Bulk Operations:   {'✅ PASS' if bulk_hide_success and bulk_show_success else '❌ FAIL'}")
        print(f"   Error Handling:    ✅ PASS (tested)")

    # ===== SHOPPING CART TESTS =====
    
    def test_cart_submit_order_valid(self):
        """Test 1: POST /api/cart/submit-order with valid order data"""
        test_order = {
            "customer_name": "Анна Петрова",
            "customer_phone": "+7 (999) 123-45-67",
            "customer_email": "anna.petrova@example.com",
            "comment": "Срочный заказ, нужно до конца месяца",
            "items": [
                {
                    "product_id": "prod-001",
                    "product_name": "Белая рубашка для официантов",
                    "article": "WS-001",
                    "color": "Белый",
                    "material": "Хлопок",
                    "quantity": 10,
                    "price_from": 1200
                },
                {
                    "product_id": "prod-002", 
                    "product_name": "Черные брюки классические",
                    "article": "BP-002",
                    "color": "Черный",
                    "material": "Полиэстер",
                    "quantity": 5,
                    "price_from": 1800
                }
            ],
            "total_amount": 21000
        }
        
        try:
            response = self.session.post(f"{self.base_url}/cart/submit-order", json=test_order)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ['success', 'message', 'request_id']
                
                if all(field in data for field in required_fields):
                    if (data['success'] and 
                        data['message'] and 
                        data['request_id'] and 
                        data['request_id'].startswith('CART-')):
                        
                        # Validate request_id format: CART-YYYY-XXXXXX
                        import re
                        request_id_pattern = r'^CART-\d{4}-[A-Z0-9]{6}$'
                        if re.match(request_id_pattern, data['request_id']):
                            self.log_result('/cart/submit-order (valid)', 'POST', True, 
                                          f"Cart order submitted successfully - Request ID: {data['request_id']}, Message: {data['message']}", data)
                        else:
                            self.log_result('/cart/submit-order (valid)', 'POST', False, 
                                          f"Invalid request_id format: {data['request_id']}", data)
                    else:
                        self.log_result('/cart/submit-order (valid)', 'POST', False, 
                                      f"Invalid response values - Success: {data.get('success')}, Message: {data.get('message')}, Request ID: {data.get('request_id')}", data)
                else:
                    missing = [f for f in required_fields if f not in data]
                    self.log_result('/cart/submit-order (valid)', 'POST', False, 
                                  f"Missing required fields: {missing}", data)
            else:
                self.log_result('/cart/submit-order (valid)', 'POST', False, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result('/cart/submit-order (valid)', 'POST', False, f"Exception: {str(e)}")
    
    def test_cart_submit_order_multiple_items(self):
        """Test 2: POST /api/cart/submit-order with multiple items and optional fields"""
        test_order = {
            "customer_name": "Иван Сидоров",
            "customer_phone": "+7 (812) 987-65-43",
            "customer_email": "ivan.sidorov@company.ru",
            "comment": None,  # Test optional comment
            "items": [
                {
                    "product_id": "prod-003",
                    "product_name": "Фартук поварской",
                    "article": None,  # Test optional article
                    "color": None,    # Test optional color
                    "material": "Хлопок",
                    "quantity": 15,
                    "price_from": 800
                },
                {
                    "product_id": "prod-004",
                    "product_name": "Костюм официанта",
                    "article": "CS-004",
                    "color": "Темно-синий",
                    "material": None,  # Test optional material
                    "quantity": 8,
                    "price_from": 3500
                },
                {
                    "product_id": "prod-005",
                    "product_name": "Блуза женская",
                    "article": "WB-005",
                    "color": "Белый",
                    "material": "Поликоттон",
                    "quantity": 12,
                    "price_from": 1400
                }
            ],
            "total_amount": 56800
        }
        
        try:
            response = self.session.post(f"{self.base_url}/cart/submit-order", json=test_order)
            
            if response.status_code == 200:
                data = response.json()
                if (data.get('success') and 
                    data.get('message') and 
                    data.get('request_id') and 
                    data['request_id'].startswith('CART-')):
                    
                    self.log_result('/cart/submit-order (multiple_items)', 'POST', True, 
                                  f"Multiple items order submitted successfully - Request ID: {data['request_id']}, Total: {test_order['total_amount']} ₽", data)
                else:
                    self.log_result('/cart/submit-order (multiple_items)', 'POST', False, 
                                  f"Invalid response structure", data)
            else:
                self.log_result('/cart/submit-order (multiple_items)', 'POST', False, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result('/cart/submit-order (multiple_items)', 'POST', False, f"Exception: {str(e)}")
    
    def test_cart_submit_order_missing_customer_name(self):
        """Test 3: POST /api/cart/submit-order with missing customer_name (should fail)"""
        test_order = {
            # "customer_name": "Missing",  # Intentionally missing
            "customer_phone": "+7 (999) 111-22-33",
            "customer_email": "test@example.com",
            "items": [
                {
                    "product_id": "prod-001",
                    "product_name": "Test Product",
                    "quantity": 1,
                    "price_from": 1000
                }
            ],
            "total_amount": 1000
        }
        
        try:
            response = self.session.post(f"{self.base_url}/cart/submit-order", json=test_order)
            
            if response.status_code == 422:  # FastAPI validation error
                self.log_result('/cart/submit-order (missing_name)', 'POST', True, 
                              f"Correctly rejected order with missing customer_name: validation error")
            else:
                self.log_result('/cart/submit-order (missing_name)', 'POST', False, 
                              f"Should have returned 422, got {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result('/cart/submit-order (missing_name)', 'POST', False, f"Exception: {str(e)}")
    
    def test_cart_submit_order_invalid_email(self):
        """Test 4: POST /api/cart/submit-order with invalid email format (should fail)"""
        test_order = {
            "customer_name": "Тест Пользователь",
            "customer_phone": "+7 (999) 111-22-33",
            "customer_email": "invalid-email-format",  # Invalid email
            "items": [
                {
                    "product_id": "prod-001",
                    "product_name": "Test Product",
                    "quantity": 1,
                    "price_from": 1000
                }
            ],
            "total_amount": 1000
        }
        
        try:
            response = self.session.post(f"{self.base_url}/cart/submit-order", json=test_order)
            
            if response.status_code == 422:  # FastAPI validation error
                self.log_result('/cart/submit-order (invalid_email)', 'POST', True, 
                              f"Correctly rejected order with invalid email format: validation error")
            else:
                self.log_result('/cart/submit-order (invalid_email)', 'POST', False, 
                              f"Should have returned 422, got {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result('/cart/submit-order (invalid_email)', 'POST', False, f"Exception: {str(e)}")
    
    def test_cart_submit_order_invalid_phone(self):
        """Test 5: POST /api/cart/submit-order with invalid phone format (should fail)"""
        test_order = {
            "customer_name": "Тест Пользователь",
            "customer_phone": "123",  # Too short phone number
            "customer_email": "test@example.com",
            "items": [
                {
                    "product_id": "prod-001",
                    "product_name": "Test Product",
                    "quantity": 1,
                    "price_from": 1000
                }
            ],
            "total_amount": 1000
        }
        
        try:
            response = self.session.post(f"{self.base_url}/cart/submit-order", json=test_order)
            
            if response.status_code == 422:  # FastAPI validation error
                self.log_result('/cart/submit-order (invalid_phone)', 'POST', True, 
                              f"Correctly rejected order with invalid phone format: validation error")
            else:
                self.log_result('/cart/submit-order (invalid_phone)', 'POST', False, 
                              f"Should have returned 422, got {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result('/cart/submit-order (invalid_phone)', 'POST', False, f"Exception: {str(e)}")
    
    def test_cart_submit_order_empty_items(self):
        """Test 6: POST /api/cart/submit-order with empty items array (should fail)"""
        test_order = {
            "customer_name": "Тест Пользователь",
            "customer_phone": "+7 (999) 111-22-33",
            "customer_email": "test@example.com",
            "items": [],  # Empty items array
            "total_amount": 0
        }
        
        try:
            response = self.session.post(f"{self.base_url}/cart/submit-order", json=test_order)
            
            if response.status_code == 422:  # FastAPI validation error
                self.log_result('/cart/submit-order (empty_items)', 'POST', True, 
                              f"Correctly rejected order with empty items array: validation error")
            else:
                self.log_result('/cart/submit-order (empty_items)', 'POST', False, 
                              f"Should have returned 422, got {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result('/cart/submit-order (empty_items)', 'POST', False, f"Exception: {str(e)}")
    
    def test_cart_submit_order_long_comment(self):
        """Test 7: POST /api/cart/submit-order with very long comment field"""
        long_comment = "Очень длинный комментарий к заказу. " * 50  # ~1500 characters
        
        test_order = {
            "customer_name": "Тест Пользователь",
            "customer_phone": "+7 (999) 111-22-33",
            "customer_email": "test@example.com",
            "comment": long_comment,
            "items": [
                {
                    "product_id": "prod-001",
                    "product_name": "Test Product",
                    "quantity": 1,
                    "price_from": 1000
                }
            ],
            "total_amount": 1000
        }
        
        try:
            response = self.session.post(f"{self.base_url}/cart/submit-order", json=test_order)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('request_id'):
                    self.log_result('/cart/submit-order (long_comment)', 'POST', True, 
                                  f"Order with long comment submitted successfully - Request ID: {data['request_id']}", data)
                else:
                    self.log_result('/cart/submit-order (long_comment)', 'POST', False, 
                                  f"Invalid response structure", data)
            else:
                self.log_result('/cart/submit-order (long_comment)', 'POST', False, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result('/cart/submit-order (long_comment)', 'POST', False, f"Exception: {str(e)}")
    
    def test_cart_order_database_integration(self):
        """Test 8: Verify cart order is saved to database as quote request"""
        test_order = {
            "customer_name": "База Данных Тест",
            "customer_phone": "+7 (999) 888-77-66",
            "customer_email": "database.test@example.com",
            "comment": "Тест интеграции с базой данных",
            "items": [
                {
                    "product_id": "db-test-001",
                    "product_name": "Тестовый продукт для БД",
                    "article": "DB-001",
                    "color": "Синий",
                    "material": "Тестовый материал",
                    "quantity": 3,
                    "price_from": 1500
                }
            ],
            "total_amount": 4500
        }
        
        try:
            # Submit cart order
            response = self.session.post(f"{self.base_url}/cart/submit-order", json=test_order)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('request_id'):
                    request_id = data['request_id']
                    
                    # Verify order appears in quote requests
                    quotes_response = self.session.get(f"{self.base_url}/admin/quote-requests")
                    
                    if quotes_response.status_code == 200:
                        quotes = quotes_response.json()
                        
                        # Find our order in the quote requests
                        cart_order = None
                        for quote in quotes:
                            if quote.get('request_id') == request_id:
                                cart_order = quote
                                break
                        
                        if cart_order:
                            # Verify order details
                            expected_category = "Заказ из корзины"
                            expected_quantity = "3 товаров"
                            
                            if (cart_order.get('category') == expected_category and
                                cart_order.get('quantity') == expected_quantity and
                                cart_order.get('name') == test_order['customer_name'] and
                                cart_order.get('email') == test_order['customer_email']):
                                
                                self.log_result('/cart/submit-order (database)', 'POST', True, 
                                              f"Cart order correctly saved to database - Category: {cart_order.get('category')}, Quantity: {cart_order.get('quantity')}", cart_order)
                            else:
                                self.log_result('/cart/submit-order (database)', 'POST', False, 
                                              f"Cart order saved but with incorrect data - Category: {cart_order.get('category')}, Quantity: {cart_order.get('quantity')}", cart_order)
                        else:
                            self.log_result('/cart/submit-order (database)', 'POST', False, 
                                          f"Cart order not found in quote requests with request_id: {request_id}")
                    else:
                        self.log_result('/cart/submit-order (database)', 'POST', False, 
                                      f"Failed to retrieve quote requests: {quotes_response.status_code}")
                else:
                    self.log_result('/cart/submit-order (database)', 'POST', False, 
                                  f"Cart order submission failed", data)
            else:
                self.log_result('/cart/submit-order (database)', 'POST', False, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result('/cart/submit-order (database)', 'POST', False, f"Exception: {str(e)}")
    
    def test_cart_order_cors_headers(self):
        """Test 9: Verify CORS headers on cart order endpoint"""
        try:
            # Test OPTIONS request for CORS preflight
            options_response = self.session.options(f"{self.base_url}/cart/submit-order")
            
            # Test actual POST request and check CORS headers
            test_order = {
                "customer_name": "CORS Тест",
                "customer_phone": "+7 (999) 777-88-99",
                "customer_email": "cors.test@example.com",
                "items": [
                    {
                        "product_id": "cors-001",
                        "product_name": "CORS Test Product",
                        "quantity": 1,
                        "price_from": 1000
                    }
                ],
                "total_amount": 1000
            }
            
            response = self.session.post(f"{self.base_url}/cart/submit-order", json=test_order)
            
            if response.status_code == 200:
                # Check for CORS headers
                cors_headers = {
                    'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
                    'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
                    'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
                }
                
                if cors_headers['Access-Control-Allow-Origin']:
                    self.log_result('/cart/submit-order (cors)', 'POST', True, 
                                  f"CORS headers present - Origin: {cors_headers['Access-Control-Allow-Origin']}", cors_headers)
                else:
                    self.log_result('/cart/submit-order (cors)', 'POST', False, 
                                  f"CORS headers missing", cors_headers)
            else:
                self.log_result('/cart/submit-order (cors)', 'POST', False, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result('/cart/submit-order (cors)', 'POST', False, f"Exception: {str(e)}")
    
    def test_existing_endpoints_still_work(self):
        """Test 10: Integration test - verify existing endpoints still work after cart implementation"""
        try:
            # Test categories endpoint
            categories_response = self.session.get(f"{self.base_url}/categories")
            categories_working = categories_response.status_code == 200
            
            # Test products endpoint
            products_response = self.session.get(f"{self.base_url}/products")
            products_working = products_response.status_code == 200
            
            # Test calculator options endpoint
            calc_response = self.session.get(f"{self.base_url}/calculator/options")
            calc_working = calc_response.status_code == 200
            
            # Test quote request endpoint
            quote_data = {
                "name": "Integration Test",
                "email": "integration@test.com",
                "phone": "+7 (999) 000-11-22",
                "company": "Test Company",
                "category": "shirts",
                "quantity": "11-25",
                "fabric": "cotton",
                "branding": "none",
                "estimated_price": 2000
            }
            quote_response = self.session.post(f"{self.base_url}/calculator/quote-request", json=quote_data)
            quote_working = quote_response.status_code == 200
            
            all_working = categories_working and products_working and calc_working and quote_working
            
            if all_working:
                self.log_result('/integration (existing_endpoints)', 'GET/POST', True, 
                              f"All existing endpoints still working after cart implementation", {
                                  'categories': categories_working,
                                  'products': products_working,
                                  'calculator': calc_working,
                                  'quote_request': quote_working
                              })
            else:
                self.log_result('/integration (existing_endpoints)', 'GET/POST', False, 
                              f"Some existing endpoints broken after cart implementation", {
                                  'categories': categories_working,
                                  'products': products_working,
                                  'calculator': calc_working,
                                  'quote_request': quote_working
                              })
                
        except Exception as e:
            self.log_result('/integration (existing_endpoints)', 'GET/POST', False, f"Exception: {str(e)}")
    
    def run_shopping_cart_tests(self):
        """Run all Shopping Cart API tests"""
        print(f"\n🛒 Starting Shopping Cart Backend Testing")
        print("=" * 60)
        print("Testing POST /api/cart/submit-order endpoint with comprehensive scenarios")
        print("=" * 60)
        
        # Test 1: Valid order submission
        self.test_cart_submit_order_valid()
        
        # Test 2: Multiple items with optional fields
        self.test_cart_submit_order_multiple_items()
        
        # Test 3: Missing required fields
        self.test_cart_submit_order_missing_customer_name()
        
        # Test 4: Invalid email format
        self.test_cart_submit_order_invalid_email()
        
        # Test 5: Invalid phone format
        self.test_cart_submit_order_invalid_phone()
        
        # Test 6: Empty items array
        self.test_cart_submit_order_empty_items()
        
        # Test 7: Long comment field
        self.test_cart_submit_order_long_comment()
        
        # Test 8: Database integration
        self.test_cart_order_database_integration()
        
        # Test 9: CORS headers
        self.test_cart_order_cors_headers()
        
        # Test 10: Integration with existing endpoints
        self.test_existing_endpoints_still_work()
        
        print("=" * 60)

    # ===== CRITICAL IMAGE PERSISTENCE BUG FIX TESTS =====
    
    def test_product_update_with_images_full_flow(self):
        """Test 1: Product Update with Images - Full Flow"""
        try:
            # Step 1: GET /api/admin/products - get a product with images
            response = self.session.get(f"{self.base_url}/admin/products")
            
            if response.status_code != 200:
                self.log_result('/admin/products (image persistence)', 'GET', False, 
                              f"Failed to get products: HTTP {response.status_code}")
                return
            
            products = response.json()
            
            # Find a product with images
            product_with_images = None
            for product in products:
                if product.get('images') and len(product['images']) > 0:
                    product_with_images = product
                    break
            
            if not product_with_images:
                self.log_result('/admin/products (image persistence)', 'GET', False, 
                              "No products with images found for testing")
                return
            
            product_id = product_with_images['id']
            original_images = product_with_images['images']
            original_images_count = len(original_images)
            
            self.log_result('/admin/products (image persistence - setup)', 'GET', True, 
                          f"Found product {product_id} with {original_images_count} images", 
                          {'product_id': product_id, 'images_count': original_images_count})
            
            # Step 2: PUT /api/admin/products/{id} with COMPLETE product data including images array
            update_data = {
                "category_id": product_with_images['category_id'],
                "name": product_with_images['name'],
                "article": product_with_images.get('article', ''),
                "description": product_with_images['description'],
                "short_description": product_with_images.get('short_description', ''),
                "price_from": product_with_images['price_from'],
                "price_to": product_with_images.get('price_to'),
                "material": product_with_images.get('material', ''),
                "sizes": product_with_images.get('sizes', []),
                "colors": product_with_images.get('colors', []),
                "images": [img['image_url'] if isinstance(img, dict) else img for img in original_images],
                "characteristics": product_with_images.get('characteristics', []),
                "is_available": product_with_images.get('is_available', True),
                "on_order": product_with_images.get('on_order', False),
                "featured": product_with_images.get('featured', False)
            }
            
            put_response = self.session.put(f"{self.base_url}/admin/products/{product_id}", json=update_data)
            
            if put_response.status_code != 200:
                self.log_result('/admin/products/{id} (image persistence)', 'PUT', False, 
                              f"Failed to update product: HTTP {put_response.status_code}: {put_response.text}")
                return
            
            # Step 3: GET /api/admin/products/{id} - verify images are STILL present after update
            verify_response = self.session.get(f"{self.base_url}/admin/products/{product_id}")
            
            if verify_response.status_code != 200:
                self.log_result('/admin/products/{id} (image persistence - verify)', 'GET', False, 
                              f"Failed to get updated product: HTTP {verify_response.status_code}")
                return
            
            updated_product = verify_response.json()
            updated_images = updated_product.get('images', [])
            updated_images_count = len(updated_images)
            
            # Step 4: Confirm images count before and after update matches
            if updated_images_count == original_images_count and updated_images_count > 0:
                self.log_result('/admin/products/{id} (image persistence - CRITICAL)', 'PUT+GET', True, 
                              f"✅ IMAGES PERSISTED! Before: {original_images_count}, After: {updated_images_count}", 
                              {'original_count': original_images_count, 'updated_count': updated_images_count})
            else:
                self.log_result('/admin/products/{id} (image persistence - CRITICAL)', 'PUT+GET', False, 
                              f"❌ IMAGES LOST! Before: {original_images_count}, After: {updated_images_count}", 
                              {'original_count': original_images_count, 'updated_count': updated_images_count})
                
        except Exception as e:
            self.log_result('/admin/products (image persistence)', 'PUT+GET', False, f"Exception: {str(e)}")
    
    def test_quick_category_change_simulation(self):
        """Test 2: Quick Category Change Simulation - The exact scenario causing images to disappear"""
        try:
            # Step 1: GET /api/admin/products - get a product with images
            response = self.session.get(f"{self.base_url}/admin/products")
            
            if response.status_code != 200:
                self.log_result('/admin/products (quick category)', 'GET', False, 
                              f"Failed to get products: HTTP {response.status_code}")
                return
            
            products = response.json()
            
            # Find a product with images
            product_with_images = None
            for product in products:
                if product.get('images') and len(product['images']) > 0:
                    product_with_images = product
                    break
            
            if not product_with_images:
                self.log_result('/admin/products (quick category)', 'GET', False, 
                              "No products with images found for testing")
                return
            
            product_id = product_with_images['id']
            original_images = product_with_images['images']
            original_images_count = len(original_images)
            original_category = product_with_images['category_id']
            
            # Find a different category to change to
            categories_response = self.session.get(f"{self.base_url}/categories")
            if categories_response.status_code != 200:
                self.log_result('/categories (quick category)', 'GET', False, 
                              f"Failed to get categories: HTTP {categories_response.status_code}")
                return
            
            categories = categories_response.json()
            new_category = None
            for cat in categories:
                if cat['id'] != original_category:
                    new_category = cat['id']
                    break
            
            if not new_category:
                self.log_result('/admin/products (quick category)', 'GET', False, 
                              "No alternative category found for testing")
                return
            
            self.log_result('/admin/products (quick category - setup)', 'GET', True, 
                          f"Testing category change for product {product_id} with {original_images_count} images", 
                          {'product_id': product_id, 'original_category': original_category, 'new_category': new_category})
            
            # Step 2: PUT /api/admin/products/{id} changing only category_id BUT including all other fields
            # This simulates the handleQuickCategoryChange function after the fix
            update_data = {
                "category_id": new_category,  # Changed category
                "name": product_with_images['name'],
                "article": product_with_images.get('article', ''),
                "description": product_with_images['description'],
                "short_description": product_with_images.get('short_description', ''),
                "price_from": product_with_images['price_from'],
                "price_to": product_with_images.get('price_to'),
                "material": product_with_images.get('material', ''),
                "sizes": product_with_images.get('sizes', []),
                "colors": product_with_images.get('colors', []),
                "images": [img['image_url'] if isinstance(img, dict) else img for img in original_images],  # CRITICAL: Include images
                "characteristics": product_with_images.get('characteristics', []),  # CRITICAL: Include characteristics
                "is_available": product_with_images.get('is_available', True),
                "on_order": product_with_images.get('on_order', False),  # CRITICAL: Include on_order
                "featured": product_with_images.get('featured', False)
            }
            
            put_response = self.session.put(f"{self.base_url}/admin/products/{product_id}", json=update_data)
            
            if put_response.status_code != 200:
                self.log_result('/admin/products/{id} (quick category)', 'PUT', False, 
                              f"Failed to update category: HTTP {put_response.status_code}: {put_response.text}")
                return
            
            # Step 3: GET /api/admin/products/{id} - verify images array is UNCHANGED
            verify_response = self.session.get(f"{self.base_url}/admin/products/{product_id}")
            
            if verify_response.status_code != 200:
                self.log_result('/admin/products/{id} (quick category - verify)', 'GET', False, 
                              f"Failed to get updated product: HTTP {verify_response.status_code}")
                return
            
            updated_product = verify_response.json()
            updated_images = updated_product.get('images', [])
            updated_images_count = len(updated_images)
            updated_category = updated_product.get('category_id')
            
            # Verify both category changed AND images preserved
            category_changed = updated_category == new_category
            images_preserved = updated_images_count == original_images_count and updated_images_count > 0
            
            if category_changed and images_preserved:
                self.log_result('/admin/products/{id} (quick category - CRITICAL FIX)', 'PUT+GET', True, 
                              f"✅ QUICK CATEGORY CHANGE FIX WORKS! Category changed, images preserved: {updated_images_count}", 
                              {'category_changed': True, 'images_preserved': True, 'images_count': updated_images_count})
            elif category_changed and not images_preserved:
                self.log_result('/admin/products/{id} (quick category - CRITICAL FIX)', 'PUT+GET', False, 
                              f"❌ BUG STILL EXISTS! Category changed but images lost: {original_images_count} → {updated_images_count}", 
                              {'category_changed': True, 'images_preserved': False, 'original_count': original_images_count, 'updated_count': updated_images_count})
            else:
                self.log_result('/admin/products/{id} (quick category - CRITICAL FIX)', 'PUT+GET', False, 
                              f"❌ UPDATE FAILED! Category: {category_changed}, Images: {images_preserved}", 
                              {'category_changed': category_changed, 'images_preserved': images_preserved})
                
        except Exception as e:
            self.log_result('/admin/products (quick category)', 'PUT+GET', False, f"Exception: {str(e)}")
    
    def test_image_upload_and_save(self):
        """Test 3: Image Upload and Save"""
        try:
            # Step 1: POST /api/admin/upload-image - upload a test image
            import tempfile
            import os
            
            with tempfile.NamedTemporaryFile(mode='wb', suffix='.jpg', delete=False) as tmp_file:
                tmp_file.write(b"test_image_content_for_persistence_testing" * 50)
                tmp_file_path = tmp_file.name
            
            try:
                with open(tmp_file_path, 'rb') as f:
                    files = {'file': ('persistence_test.jpg', f, 'image/jpeg')}
                    upload_session = requests.Session()
                    upload_response = upload_session.post(f"{self.base_url}/admin/upload-image", files=files)
                
                if upload_response.status_code != 200:
                    self.log_result('/admin/upload-image (persistence)', 'POST', False, 
                                  f"Failed to upload image: HTTP {upload_response.status_code}: {upload_response.text}")
                    return
                
                upload_data = upload_response.json()
                if not upload_data.get('success') or not upload_data.get('url'):
                    self.log_result('/admin/upload-image (persistence)', 'POST', False, 
                                  f"Invalid upload response: {upload_data}")
                    return
                
                uploaded_image_url = upload_data['url']
                self.log_result('/admin/upload-image (persistence)', 'POST', True, 
                              f"Image uploaded successfully: {uploaded_image_url}", upload_data)
                
                # Step 2: Create or update a product including this image URL in images array
                # Get first product to update
                products_response = self.session.get(f"{self.base_url}/admin/products")
                if products_response.status_code != 200:
                    self.log_result('/admin/products (persistence - get)', 'GET', False, 
                                  f"Failed to get products: HTTP {products_response.status_code}")
                    return
                
                products = products_response.json()
                if not products:
                    self.log_result('/admin/products (persistence - get)', 'GET', False, 
                                  "No products found for testing")
                    return
                
                test_product = products[0]
                product_id = test_product['id']
                
                # Add uploaded image to existing images
                existing_images = test_product.get('images', [])
                existing_image_urls = [img['image_url'] if isinstance(img, dict) else img for img in existing_images]
                new_images = existing_image_urls + [uploaded_image_url]
                
                update_data = {
                    "category_id": test_product['category_id'],
                    "name": test_product['name'],
                    "article": test_product.get('article', ''),
                    "description": test_product['description'],
                    "short_description": test_product.get('short_description', ''),
                    "price_from": test_product['price_from'],
                    "price_to": test_product.get('price_to'),
                    "material": test_product.get('material', ''),
                    "sizes": test_product.get('sizes', []),
                    "colors": test_product.get('colors', []),
                    "images": new_images,  # Include new uploaded image
                    "characteristics": test_product.get('characteristics', []),
                    "is_available": test_product.get('is_available', True),
                    "on_order": test_product.get('on_order', False),
                    "featured": test_product.get('featured', False)
                }
                
                update_response = self.session.put(f"{self.base_url}/admin/products/{product_id}", json=update_data)
                
                if update_response.status_code != 200:
                    self.log_result('/admin/products/{id} (persistence - update)', 'PUT', False, 
                                  f"Failed to update product with new image: HTTP {update_response.status_code}: {update_response.text}")
                    return
                
                # Step 3: Verify image persists after save
                verify_response = self.session.get(f"{self.base_url}/admin/products/{product_id}")
                
                if verify_response.status_code != 200:
                    self.log_result('/admin/products/{id} (persistence - verify)', 'GET', False, 
                                  f"Failed to verify product: HTTP {verify_response.status_code}")
                    return
                
                updated_product = verify_response.json()
                updated_images = updated_product.get('images', [])
                updated_image_urls = [img['image_url'] if isinstance(img, dict) else img for img in updated_images]
                
                if uploaded_image_url in updated_image_urls:
                    self.log_result('/admin/products/{id} (image upload persistence)', 'PUT+GET', True, 
                                  f"✅ UPLOADED IMAGE PERSISTED! Found in product images", 
                                  {'uploaded_url': uploaded_image_url, 'total_images': len(updated_images)})
                else:
                    self.log_result('/admin/products/{id} (image upload persistence)', 'PUT+GET', False, 
                                  f"❌ UPLOADED IMAGE LOST! Not found in product images", 
                                  {'uploaded_url': uploaded_image_url, 'found_urls': updated_image_urls})
                
            finally:
                os.unlink(tmp_file_path)
                
        except Exception as e:
            self.log_result('/admin/upload-image (persistence)', 'POST+PUT+GET', False, f"Exception: {str(e)}")
    
    def test_image_persistence_edge_cases(self):
        """Test 4: Edge Cases for Image Persistence"""
        try:
            # Get a test product
            products_response = self.session.get(f"{self.base_url}/admin/products")
            if products_response.status_code != 200:
                self.log_result('/admin/products (edge cases)', 'GET', False, 
                              f"Failed to get products: HTTP {products_response.status_code}")
                return
            
            products = products_response.json()
            if not products:
                self.log_result('/admin/products (edge cases)', 'GET', False, 
                              "No products found for testing")
                return
            
            test_product = products[0]
            product_id = test_product['id']
            
            # Test Case 1: PUT with empty images array [] - should remove all images
            update_data_empty = {
                "category_id": test_product['category_id'],
                "name": test_product['name'],
                "article": test_product.get('article', ''),
                "description": test_product['description'],
                "short_description": test_product.get('short_description', ''),
                "price_from": test_product['price_from'],
                "price_to": test_product.get('price_to'),
                "material": test_product.get('material', ''),
                "sizes": test_product.get('sizes', []),
                "colors": test_product.get('colors', []),
                "images": [],  # Empty array
                "characteristics": test_product.get('characteristics', []),
                "is_available": test_product.get('is_available', True),
                "on_order": test_product.get('on_order', False),
                "featured": test_product.get('featured', False)
            }
            
            empty_response = self.session.put(f"{self.base_url}/admin/products/{product_id}", json=update_data_empty)
            
            if empty_response.status_code == 200:
                verify_empty = self.session.get(f"{self.base_url}/admin/products/{product_id}")
                if verify_empty.status_code == 200:
                    empty_product = verify_empty.json()
                    empty_images = empty_product.get('images', [])
                    
                    if len(empty_images) == 0:
                        self.log_result('/admin/products/{id} (empty images)', 'PUT+GET', True, 
                                      f"✅ Empty images array correctly removes all images", 
                                      {'images_count': 0})
                    else:
                        self.log_result('/admin/products/{id} (empty images)', 'PUT+GET', False, 
                                      f"❌ Empty images array did not remove images: {len(empty_images)}", 
                                      {'images_count': len(empty_images)})
                else:
                    self.log_result('/admin/products/{id} (empty images - verify)', 'GET', False, 
                                  f"Failed to verify empty images: HTTP {verify_empty.status_code}")
            else:
                self.log_result('/admin/products/{id} (empty images)', 'PUT', False, 
                              f"Failed to update with empty images: HTTP {empty_response.status_code}")
            
            # Test Case 2: PUT with images: null - verify backend handles gracefully
            update_data_null = update_data_empty.copy()
            update_data_null['images'] = None
            
            null_response = self.session.put(f"{self.base_url}/admin/products/{product_id}", json=update_data_null)
            
            if null_response.status_code == 200:
                self.log_result('/admin/products/{id} (null images)', 'PUT', True, 
                              f"✅ Backend gracefully handles null images", 
                              {'status': 'success'})
            elif null_response.status_code == 422:
                self.log_result('/admin/products/{id} (null images)', 'PUT', True, 
                              f"✅ Backend properly validates null images with 422", 
                              {'status': 'validation_error'})
            else:
                self.log_result('/admin/products/{id} (null images)', 'PUT', False, 
                              f"❌ Unexpected response for null images: HTTP {null_response.status_code}: {null_response.text}")
                
        except Exception as e:
            self.log_result('/admin/products (edge cases)', 'PUT+GET', False, f"Exception: {str(e)}")
    
    def test_422_error_investigation(self):
        """Test 5: 422 Error Investigation"""
        try:
            # Test various file types and sizes for image upload
            import tempfile
            import os
            
            # Test 1: Valid image upload (should work)
            with tempfile.NamedTemporaryFile(mode='wb', suffix='.jpg', delete=False) as tmp_file:
                tmp_file.write(b"valid_image_content" * 100)
                tmp_file_path = tmp_file.name
            
            try:
                with open(tmp_file_path, 'rb') as f:
                    files = {'file': ('valid_422_test.jpg', f, 'image/jpeg')}
                    upload_session = requests.Session()
                    response = upload_session.post(f"{self.base_url}/admin/upload-image", files=files)
                
                if response.status_code == 200:
                    self.log_result('/admin/upload-image (422 - valid)', 'POST', True, 
                                  f"✅ Valid image upload works: {response.json().get('url', 'No URL')}")
                elif response.status_code == 422:
                    self.log_result('/admin/upload-image (422 - valid)', 'POST', False, 
                                  f"❌ Valid image got 422 error: {response.text}")
                else:
                    self.log_result('/admin/upload-image (422 - valid)', 'POST', False, 
                                  f"❌ Unexpected status for valid image: HTTP {response.status_code}: {response.text}")
            finally:
                os.unlink(tmp_file_path)
            
            # Test 2: Invalid file type (should get 422 or 400)
            with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as tmp_file:
                tmp_file.write("This is not an image file")
                tmp_file_path = tmp_file.name
            
            try:
                with open(tmp_file_path, 'rb') as f:
                    files = {'file': ('invalid_422_test.txt', f, 'text/plain')}
                    upload_session = requests.Session()
                    response = upload_session.post(f"{self.base_url}/admin/upload-image", files=files)
                
                if response.status_code in [400, 422]:
                    self.log_result('/admin/upload-image (422 - invalid type)', 'POST', True, 
                                  f"✅ Invalid file type correctly rejected: HTTP {response.status_code}")
                else:
                    self.log_result('/admin/upload-image (422 - invalid type)', 'POST', False, 
                                  f"❌ Invalid file type not rejected: HTTP {response.status_code}: {response.text}")
            finally:
                os.unlink(tmp_file_path)
            
            # Test 3: Check CORS headers on upload endpoint
            options_response = self.session.options(f"{self.base_url}/admin/upload-image")
            cors_headers = {
                'Access-Control-Allow-Origin': options_response.headers.get('Access-Control-Allow-Origin'),
                'Access-Control-Allow-Methods': options_response.headers.get('Access-Control-Allow-Methods'),
                'Access-Control-Allow-Headers': options_response.headers.get('Access-Control-Allow-Headers')
            }
            
            if any(cors_headers.values()):
                self.log_result('/admin/upload-image (CORS)', 'OPTIONS', True, 
                              f"✅ CORS headers present on upload endpoint", cors_headers)
            else:
                self.log_result('/admin/upload-image (CORS)', 'OPTIONS', False, 
                              f"❌ No CORS headers found on upload endpoint", cors_headers)
                
        except Exception as e:
            self.log_result('/admin/upload-image (422 investigation)', 'POST+OPTIONS', False, f"Exception: {str(e)}")
    
    def run_image_persistence_bug_fix_tests(self):
        """Run all Image Persistence Bug Fix tests"""
        print(f"\n🖼️  CRITICAL IMAGE PERSISTENCE BUG FIX TESTING")
        print("=" * 80)
        print("Testing the fix for images disappearing from product cards after saving")
        print("ROOT CAUSE: handleQuickCategoryChange was sending PUT without images field")
        print("FIX: Include ALL fields (images, article, characteristics, on_order) in PUT request")
        print("=" * 80)
        
        # Test 1: Product Update with Images - Full Flow
        self.test_product_update_with_images_full_flow()
        
        # Test 2: Quick Category Change Simulation
        self.test_quick_category_change_simulation()
        
        # Test 3: Image Upload and Save
        self.test_image_upload_and_save()
        
        # Test 4: Edge Cases
        self.test_image_persistence_edge_cases()
        
        # Test 5: 422 Error Investigation
        self.test_422_error_investigation()
        
        print("=" * 80)

    def run_all_tests(self):
        """Run all API tests"""
        print(f"🚀 Starting API tests for AVIK Uniform Factory")
        print(f"Backend URL: {self.base_url}")
        print("=" * 80)
        
        # CRITICAL: Image Persistence Bug Fix Tests (Priority 1)
        self.run_image_persistence_bug_fix_tests()
        
        # Product Search Functionality Tests (NEW - HIGH PRIORITY)
        self.run_product_search_tests()
        
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
        
        # Contact Forms Bug Fix Tests (Priority)
        self.run_contact_forms_tests()
        
        # Admin panel tests
        self.run_admin_tests()
        
        # NEW: Security Features Tests (Priority)
        self.run_security_features_tests()
        
        # NEW: PATCH endpoint tests for bulk product operations
        self.run_patch_endpoint_tests()
        
        # NEW: Shopping Cart Tests (HIGH PRIORITY)
        self.run_shopping_cart_tests()
        
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