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