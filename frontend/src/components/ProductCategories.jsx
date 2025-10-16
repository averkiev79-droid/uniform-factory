import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { apiService } from '../services/api';
import { productCategories } from '../mock'; // Fallback data
import { ConsultationModal } from './ConsultationModal';

export const ProductCategories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await apiService.getCategories();
        // Transform API data to match frontend format
        const transformedData = data.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          image: item.image,
          products: item.products_count,
          slug: item.slug
        }));
        setCategories(transformedData);
        setError(null);
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
      <section id="catalog" className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-12 bg-gray-200 rounded-md w-96 mx-auto mb-4"></div>
              <div className="h-6 bg-gray-200 rounded-md w-64 mx-auto mb-16"></div>
            </div>
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
        </div>
      </section>
    );
  }

  if (error && categories.length === 0) {
    return (
      <section id="catalog" className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Каталог продукции
          </h2>
          <p className="text-red-600 mb-8">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-navy hover:bg-navy-hover text-white px-6 py-3 rounded-lg"
          >
            Попробовать снова
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="catalog" className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900">
            Каталог продукции
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Широкий ассортимент корпоративной одежды для различных сфер деятельности. 
            Подберем идеальное решение для вашего бизнеса.
          </p>
          {error && (
            <p className="text-amber-600 text-sm">
              Показаны демо-данные. {error}
            </p>
          )}
        </div>

        {/* Categories Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <Card 
              key={category.id} 
              className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-0 shadow-md overflow-hidden"
            >
              <div className="relative overflow-hidden">
                <img 
                  src={category.image} 
                  alt={category.title}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-800">
                  {category.products} моделей
                </div>
              </div>
              
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-navy transition-colors duration-300">
                    {category.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {category.description}
                  </p>
                </div>
                
                <Button 
                  variant="ghost" 
                  className="p-0 h-auto text-navy hover:text-navy-700 font-medium group/btn"
                >
                  Посмотреть каталог
                  <ArrowRight className="ml-1 w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-gray-50 rounded-2xl p-8 lg:p-12">
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
              Не нашли подходящую категорию?
            </h3>
            <p className="text-gray-600 mb-6 max-w-xl mx-auto">
              Мы изготовим корпоративную одежду по вашему индивидуальному дизайну. 
              Любая сложность, любые объемы.
            </p>
            <Button 
              size="lg" 
              onClick={() => setIsConsultationModalOpen(true)}
              className="bg-navy hover:bg-navy-hover text-white px-8"
            >
              Заказать индивидуальный дизайн
            </Button>
          </div>
        </div>
      </div>

      {/* Consultation Modal */}
      <ConsultationModal 
        isOpen={isConsultationModalOpen} 
        onClose={() => setIsConsultationModalOpen(false)} 
      />
    </section>
  );
};