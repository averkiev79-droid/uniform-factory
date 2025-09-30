import React from 'react';
import { Portfolio } from '../components/Portfolio';

export const PortfolioPage = () => {
  return (
    <div>
      {/* Page Header */}
      <section className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4">
              Наши работы
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Более 2500 успешно реализованных проектов для компаний различных сфер деятельности. 
              Каждый проект — это уникальное решение, созданное специально для наших клиентов.
            </p>
          </div>
        </div>
      </section>

      {/* Portfolio Content */}
      <div className="py-8">
        <Portfolio />
      </div>

      {/* Additional Statistics */}
      <section className="py-16 bg-purple-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Наши достижения в цифрах
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">15+</div>
              <div className="text-gray-600">Лет на рынке</div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">2500+</div>
              <div className="text-gray-600">Выполненных заказов</div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">850+</div>
              <div className="text-gray-600">Довольных клиентов</div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">45+</div>
              <div className="text-gray-600">Городов России</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Отзывы наших клиентов
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "Отличное качество пошива и быстрые сроки. Заказывали форму для всей сети ресторанов."
              </p>
              <div className="font-semibold text-gray-900">— Директор сети ресторанов "Вкус дома"</div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "Профессиональный подход к каждой детали. Сотрудники выглядят стильно и элегантно."
              </p>
              <div className="font-semibold text-gray-900">— HR-директор IT компании</div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "Удобная медицинская одежда, качественные ткани. Персонал доволен!"
              </p>
              <div className="font-semibold text-gray-900">— Главврач клиники "Здоровье+"</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};