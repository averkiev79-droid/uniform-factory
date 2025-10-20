import React, { useState, useEffect } from 'react';
import { ArrowRight, Star, Award } from 'lucide-react';
import { apiService } from '../services/api';
import { stats } from '../mock'; // Fallback data

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const Hero = () => {
  const [statistics, setStatistics] = useState(stats);
  const [loading, setLoading] = useState(true);
  const [heroImage, setHeroImage] = useState(null); // Start with null instead of default
  const [imageLoaded, setImageLoaded] = useState(false);

  // Helper function to get full image URL
  const getImageUrl = (path) => {
    if (!path) return '/images/hero-main.jpg';
    // If path starts with /api/, it's an uploaded file - use BACKEND_URL
    if (path.startsWith('/api/')) {
      return `${BACKEND_URL}${path}`;
    }
    // Otherwise it's a local file in public folder
    return path;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch settings for hero image first (before showing anything)
        const settings = await apiService.getSettings();
        if (settings.hero_image) {
          setHeroImage(settings.hero_image);
        } else {
          setHeroImage('/images/hero-main.jpg');
        }
        
        // Then fetch statistics
        setLoading(true);
        const statsData = await apiService.getStatistics();
        const transformedData = [
          { label: "Лет на рынке", value: `${statsData.years_in_business}+`, icon: "Calendar" },
          { label: "Выполненных заказов", value: `${statsData.completed_orders}+`, icon: "CheckCircle" },
          { label: "Довольных клиентов", value: `${statsData.happy_clients}+`, icon: "Users" },
          { label: "Городов России", value: `${statsData.cities}+`, icon: "MapPin" }
        ];
        setStatistics(transformedData);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        // Set fallback image if API fails
        if (!heroImage) {
          setHeroImage('/images/hero-main.jpg');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
                <span>Премиум качество с 1993 года</span>
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
                className="inline-flex items-center justify-center bg-navy hover:bg-navy-hover text-white px-8 py-4 text-lg rounded-lg font-medium transition-colors duration-200 group"
              >
                Получить расчет стоимости
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a 
                href="/catalog"
                className="inline-flex items-center justify-center border-2 border-gray-300 hover:border-navy hover:text-navy px-8 py-4 text-lg rounded-lg font-medium transition-colors duration-200"
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
                      <div className="text-2xl lg:text-3xl font-bold text-navy">{stat.value}</div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="aspect-square lg:aspect-auto lg:h-[600px] rounded-2xl overflow-hidden shadow-2xl bg-gray-200">
              {heroImage ? (
                <img 
                  src={getImageUrl(heroImage)} 
                  alt="Профессиональная корпоративная одежда"
                  className="w-full h-full object-cover"
                  loading="eager"
                  onLoad={() => setImageLoaded(true)}
                  onError={(e) => {
                    console.error('Hero image failed to load, using fallback');
                    e.target.src = '/images/hero-main.jpg';
                    setImageLoaded(true);
                  }}
                  style={{ opacity: imageLoaded ? 1 : 0, transition: 'opacity 0.3s ease-in-out' }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="animate-pulse text-gray-400">
                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              )}
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