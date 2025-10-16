import React from 'react';
import { AboutContent } from '../components/AboutContent';

export const AboutPage = () => {
  return (
    <div>
      {/* Page Header */}
      <section className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4">
              О нашей компании
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Более 15 лет мы создаем корпоративную одежду, которая подчеркивает профессионализм 
              и статус вашей компании.
            </p>
          </div>
        </div>
      </section>

      {/* About Content */}
      <div className="py-8">
        <AboutContent />
      </div>

      {/* Our Mission */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Наша миссия
              </h2>
              <p className="text-gray-600 mb-6">
                Мы создаем корпоративную одежду, которая не просто выполняет свои функции, 
                но и становится частью имиджа компании, повышает лояльность сотрудников 
                и укрепляет доверие клиентов.
              </p>
              <p className="text-gray-600 mb-6">
                Наша команда состоит из опытных дизайнеров, технологов и швей, 
                которые используют современные материалы и технологии для создания 
                качественной и долговечной одежды.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-purple-50 p-6 rounded-lg text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">15+</div>
                <div className="text-sm text-gray-600">Лет опыта</div>
              </div>
              <div className="bg-blue-50 p-6 rounded-lg text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">850+</div>
                <div className="text-sm text-gray-600">Клиентов</div>
              </div>
              <div className="bg-green-50 p-6 rounded-lg text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">2500+</div>
                <div className="text-sm text-gray-600">Проектов</div>
              </div>
              <div className="bg-orange-50 p-6 rounded-lg text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">45+</div>
                <div className="text-sm text-gray-600">Городов</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Наши ценности
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Качество</h3>
              <p className="text-gray-600 text-sm">
                Используем только высококачественные материалы и проверенные технологии
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Скорость</h3>
              <p className="text-gray-600 text-sm">
                Быстрое изготовление без потери качества благодаря оптимизированным процессам
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Клиентоориентированность</h3>
              <p className="text-gray-600 text-sm">
                Индивидуальный подход к каждому проекту и потребностям клиента
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Инновации</h3>
              <p className="text-gray-600 text-sm">
                Постоянно развиваемся и внедряем новые технологии и материалы
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Готовы к сотрудничеству?
          </h2>
          <p className="text-purple-100 mb-8 max-w-2xl mx-auto">
            Свяжитесь с нами и получите персональное предложение для вашего бизнеса
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/contacts"
              className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-medium transition-colors duration-200"
            >
              Связаться с нами
            </a>
            <a 
              href="/calculator"
              className="border-2 border-white text-white hover:bg-white hover:text-purple-600 px-8 py-4 rounded-lg font-medium transition-colors duration-200"
            >
              Рассчитать стоимость
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};