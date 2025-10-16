import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { apiService } from '../services/api';
import { productCategories } from '../mock'; // Fallback data

export const ProductCategoriesContent = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiService.getCategories();
        setCategories(data);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        setError('Failed to load categories');
        // Use fallback data
        setCategories(productCategories);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="animate-pulse">
              <div className="h-64 bg-gray-200"></div>
              <CardContent className="p-6">
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error && categories.length === 0) {
    return (
      <div className="container mx-auto px-4 text-center">
        <p className="text-red-600 mb-8">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-navy hover:bg-navy-hover text-white px-6 py-3 rounded-lg"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mb-8">
          <p>{error}. Показаны базовые категории.</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((category) => (
          <Card key={category.id} className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
            <div className="overflow-hidden">
              <img
                src={category.image || `https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=250&fit=crop&q=80`}
                alt={category.title}
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=250&fit=crop&q=80";
                }}
              />
            </div>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-navy transition-colors">
                  {category.title}
                </h3>
                <Badge variant="secondary" className="bg-navy-100 text-navy">
                  {category.products_count || category.count} шт
                </Badge>
              </div>
              <p className="text-gray-600 mb-4 line-clamp-2">
                {category.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  от {category.base_price || '1200'} ₽
                </span>
                <span className="text-navy font-medium group-hover:underline">
                  Подробнее →
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};