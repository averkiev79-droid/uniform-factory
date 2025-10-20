import React, { useState, useEffect } from 'react';
import { Factory, Award, Users, Clock, Target, Handshake } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { apiService } from '../services/api';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const AboutContent = () => {
  const [aboutImage, setAboutImage] = useState(null); // Start with null
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await apiService.getSettings();
        if (settings.about_image) {
          setAboutImage(settings.about_image);
        } else {
          setAboutImage('/images/about-factory.jpg');
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err);
        // Set fallback image
        setAboutImage('/images/about-factory.jpg');
      }
    };

    fetchSettings();
  }, []);

  // Helper function to get full image URL
  const getImageUrl = (path) => {
    if (!path) return '/images/about-factory.jpg';
    // If path starts with /api/, it's an uploaded file - use BACKEND_URL
    if (path.startsWith('/api/')) {
      return `${BACKEND_URL}${path}`;
    }
    // Otherwise it's a local file in public folder
    return path;
  };

  const features = [
    {
      icon: Factory,
      title: "Собственное производство",
      description: "Современное оборудование и полный цикл производства. Адрес: пр. Ветеранов, 140, Санкт-Петербург"
    },
    {
      icon: Award,
      title: "30+ лет опыта",
      description: "С 1993 года создаем качественную корпоративную одежду для бизнеса"
    },
    {
      icon: Users,
      title: "1200+ клиентов",
      description: "Доверяют нам ведущие компании России в различных отраслях"
    },
    {
      icon: Clock,
      title: "Быстрые сроки",
      description: "Изготовление заказа от 7 дней, срочные заказы за 3 дня"
    },
    {
      icon: Target,
      title: "Индивидуальный подход",
      description: "Разрабатываем уникальный дизайн с учетом специфики вашего бизнеса"
    },
    {
      icon: Handshake,
      title: "Гарантия качества",
      description: "Полная гарантия на всю продукцию и бесплатная замена при браке"
    }
  ];

  return (
    <div className="container mx-auto px-4">
      {/* Content Grid */}
      <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
        <div>
          <div className="space-y-4 text-gray-600 leading-relaxed">
            <p>
              Наша компания была основана в 1993 году с целью создания высококачественной 
              корпоративной одежды для российского бизнеса. Начав как небольшое семейное 
              предприятие, мы выросли в одного из лидеров отрасли.
            </p>
            <p>
              Сегодня наша фабрика расположена по адресу пр. Ветеранов, 140, Санкт-Петербург, оснащена современным европейским 
              оборудованием, а команда из 150+ профессионалов ежедневно работает над 
              созданием униформы для ведущих компаний России.
            </p>
            <p>
              За 15 лет работы мы выполнили более 5000 заказов, одели более 250 000 сотрудников 
              и помогли сотням компаний создать узнаваемый корпоративный стиль.
            </p>
          </div>
        </div>
        
        <div className="relative">
          <div className="w-full h-80 rounded-2xl shadow-lg overflow-hidden bg-gray-200">
            {aboutImage ? (
              <img 
                src={getImageUrl(aboutImage)} 
                alt="Фабрика Uniform Factory"
                className="w-full h-full object-cover"
                onLoad={() => setImageLoaded(true)}
                onError={(e) => {
                  console.error('About image failed to load, using fallback');
                  e.target.src = '/images/about-factory.jpg';
                  setImageLoaded(true);
                }}
                style={{ opacity: imageLoaded ? 1 : 0, transition: 'opacity 0.3s ease-in-out' }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="animate-pulse text-gray-400">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            )}
          </div>
          <div className="absolute -bottom-6 -left-6 bg-navy text-white p-6 rounded-xl shadow-lg">
            <div className="text-3xl font-bold">5000+</div>
            <div className="text-navy-100">выполненных заказов</div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {features.map((feature, index) => (
          <Card key={index} className="border-0 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardContent className="p-8 text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-navy-100 text-navy rounded-xl">
                <feature.icon className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-gray-900">
                {feature.title}
              </h4>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Call to Action */}
      <div className="text-center bg-gray-50 rounded-2xl p-12">
        <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">
          Начните работу с нами уже сегодня
        </h3>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Получите персональную консультацию и коммерческое предложение для вашего бизнеса. 
          Мы поможем создать идеальную униформу для ваших сотрудников.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a 
            href="/contacts" 
            className="bg-navy hover:bg-navy-hover text-white px-8 py-4 rounded-lg font-medium transition-colors duration-200"
          >
            Получить консультацию
          </a>
          <a 
            href="/portfolio" 
            className="border border-navy text-navy hover:bg-navy hover:text-white px-8 py-4 rounded-lg font-medium transition-colors duration-200"
          >
            Посмотреть работы
          </a>
        </div>
      </div>
    </div>
  );
};