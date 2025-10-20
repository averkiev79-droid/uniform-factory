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
BACKEND_URL = "https://apparel-platform-2.preview.emergentagent.com/api"

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
            
            # Make rapid requests to health endpoint
            request_count = 0
            rate_limited = False
            
            for i in range(65):  # Try 65 requests to exceed limit of 60
                response = self.session.get(f"{self.base_url}/health")
                request_count += 1
                
                # Check for rate limit headers
                if i == 0:  # Check headers on first request
                    if 'X-RateLimit-Limit' in response.headers:
                        self.log_result('/health (rate_limit_headers)', 'GET', True, 
                                      f"Rate limit headers present: Limit={response.headers.get('X-RateLimit-Limit')}, Remaining={response.headers.get('X-RateLimit-Remaining')}")
                    else:
                        self.log_result('/health (rate_limit_headers)', 'GET', False, 
                                      f"Rate limit headers missing in response")
                
                if response.status_code == 429:
                    rate_limited = True
                    self.log_result('/health (rate_limiting)', 'GET', True, 
                                  f"Rate limiting triggered after {request_count} requests: {response.text}")
                    break
                elif response.status_code != 200:
                    self.log_result('/health (rate_limiting)', 'GET', False, 
                                  f"Unexpected status during rate limit test: {response.status_code}")
                    break
            
            if not rate_limited:
                self.log_result('/health (rate_limiting)', 'GET', False, 
                              f"Rate limiting not triggered after {request_count} requests")
                
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
            
            if response.status_code == 400:
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
            
            if response.status_code == 400:
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
        
        # Contact Forms Bug Fix Tests (Priority)
        self.run_contact_forms_tests()
        
        # Admin panel tests
        self.run_admin_tests()
        
        # NEW: Security Features Tests (Priority)
        self.run_security_features_tests()
        
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