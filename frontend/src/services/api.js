import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API,
  timeout: 15000, // Увеличим timeout
});

// Simple cache for static data
const cache = {
  settings: null,
  statistics: null,
  categories: null,
  timestamp: {}
};

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const isCacheValid = (key) => {
  return cache[key] && cache.timestamp[key] && (Date.now() - cache.timestamp[key]) < CACHE_TTL;
};

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    
    // Handle specific error cases
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      console.error(`API Error ${status}:`, data);
    } else if (error.request) {
      // Request was made but no response received
      console.error('API Network Error: No response received');
    } else {
      // Something else happened
      console.error('API Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// API service methods
export const apiService = {
  // Categories
  async getCategories() {
    try {
      // Check cache first
      if (isCacheValid('categories')) {
        console.log('Using cached categories');
        return cache.categories;
      }
      
      const response = await api.get('/categories');
      cache.categories = response.data;
      cache.timestamp.categories = Date.now();
      return response.data;
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      // Return cached data if available, even if expired
      if (cache.categories) {
        console.log('Using stale cache for categories');
        return cache.categories;
      }
      throw error;
    }
  },

  async getCategoryBySlug(slug) {
    try {
      const response = await api.get(`/categories/${slug}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch category ${slug}:`, error);
      throw error;
    }
  },

  // Portfolio
  async getPortfolio(category = null) {
    try {
      const params = category && category !== 'all' ? { category } : {};
      const response = await api.get('/portfolio', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
      throw error;
    }
  },

  async getPortfolioItem(itemId) {
    try {
      const response = await api.get(`/portfolio/${itemId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch portfolio item ${itemId}:`, error);
      throw error;
    }
  },

  // Calculator
  async getCalculatorOptions() {
    try {
      const response = await api.get('/calculator/options');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch calculator options:', error);
      throw error;
    }
  },

  async calculateEstimate(estimateData) {
    try {
      const response = await api.post('/calculator/estimate', estimateData);
      return response.data;
    } catch (error) {
      console.error('Failed to calculate estimate:', error);
      throw error;
    }
  },

  async submitQuoteRequest(quoteData) {
    try {
      const response = await api.post('/calculator/quote-request', quoteData);
      return response.data;
    } catch (error) {
      console.error('Failed to submit quote request:', error);
      throw error;
    }
  },

  // Contact
  async submitCallbackRequest(callbackData) {
    try {
      const response = await api.post('/contact/callback-request', callbackData);
      return response.data;
    } catch (error) {
      console.error('Failed to submit callback request:', error);
      throw error;
    }
  },

  async submitConsultationRequest(consultationData) {
    try {
      const response = await api.post('/contact/consultation', consultationData);
      return response.data;
    } catch (error) {
      console.error('Failed to submit consultation request:', error);
      throw error;
    }
  },

  async submitContactMessage(messageData) {
    try {
      const response = await api.post('/contact/message', messageData);
      return response.data;
    } catch (error) {
      console.error('Failed to submit contact message:', error);
      throw error;
    }
  },

  // Testimonials
  async getTestimonials() {
    try {
      const response = await api.get('/testimonials');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch testimonials:', error);
      throw error;
    }
  },

  // Statistics
  async getStatistics() {
    try {
      const response = await api.get('/statistics');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
      throw error;
    }
  },

  // Products
  async getAllProducts() {
    try {
      const response = await api.get('/products');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch products:', error);
      throw error;
    }
  },

  async getProductsByCategory(categoryId) {
    try {
      const response = await api.get(`/products/category/${categoryId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch products for category ${categoryId}:`, error);
      throw error;
    }
  },

  async getProductById(productId) {
    try {
      const response = await api.get(`/products/${productId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch product ${productId}:`, error);
      throw error;
    }
  },


  async searchProducts(params) {
    try {
      const response = await api.get('/products/search', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to search products:', error);
      throw error;
    }
  },


  // Settings
  async getSettings() {
    try {
      const response = await api.get('/settings');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      throw error;
    }
  },

  // Analytics
  async getAnalyticsOverview() {
    try {
      const response = await api.get('/analytics/overview');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      throw error;
    }
  }
};

export default api;