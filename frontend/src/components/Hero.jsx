import React, { useState, useEffect } from 'react';
import { ArrowRight, Star, Award } from 'lucide-react';
import { apiService } from '../services/api';
import { stats } from '../mock'; // Fallback data

export const Hero = () => {
  const [statistics, setStatistics] = useState(stats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        const data = await apiService.getStatistics();
        // Transform API data to match frontend format
        const transformedData = [
          { label: "Лет на рынке", value: `${data.years_in_business}+`, icon: "Calendar" },
          { label: "Выполненных заказов", value: `${data.completed_orders}+`, icon: "CheckCircle" },
          { label: "Довольных клиентов", value: `${data.happy_clients}+`, icon: "Users" },
          { label: "Городов России", value: `${data.cities}+`, icon: "MapPin" }
        ];
        setStatistics(transformedData);
      } catch (err) {
        console.error('Failed to fetch statistics:', err);
        // Keep fallback data
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  return (
    <section id="home" className="bg-gradient-to-br from-gray-50 to-gray-100 py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 bg-navy-50 text-navy-700 px-4 py-2 rounded-full text-sm font-medium">
                <Award className="w-4 h-4" />
                <span>Премиум качество с 2009 года</span>
              </div>
              
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight">
                Корпоративная одежда
                <span className="block text-navy">любой сложности</span>
              </h1>
              
              <p className="text-lg lg:text-xl text-gray-600 leading-relaxed max-w-2xl">
                Создаем стильную униформу для вашего бизнеса. От офисных костюмов до специализированной рабочей одежды. 
                Индивидуальный подход к каждому клиенту.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="/calculator"
                className="inline-flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg rounded-lg font-medium transition-colors duration-200 group"
              >
                Получить расчет стоимости
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a 
                href="/catalog"
                className="inline-flex items-center justify-center border-2 border-gray-300 hover:border-purple-600 hover:text-purple-600 px-8 py-4 text-lg rounded-lg font-medium transition-colors duration-200"
              >
                Посмотреть каталог
              </a>
            </div>

            {/* Trust indicators */}
            <div className="pt-8 border-t border-gray-200">
              {loading ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, index) => (
                    <div key={index} className="text-center lg:text-left animate-pulse">
                      <div className="h-8 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {statistics.map((stat, index) => (
                    <div key={index} className="text-center lg:text-left">
                      <div className="text-2xl lg:text-3xl font-bold text-purple-600">{stat.value}</div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="aspect-square lg:aspect-auto lg:h-[600px] rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=800&fit=crop&crop=faces" 
                alt="Профессиональная корпоративная одежда"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            
            {/* Floating card */}
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg border border-gray-100 max-w-xs">
              <div className="flex items-center space-x-3">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <div className="text-sm text-gray-600">5.0</div>
              </div>
              <div className="mt-2 text-sm text-gray-700">
                <strong>1200+ клиентов</strong> доверяют нашему качеству
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};