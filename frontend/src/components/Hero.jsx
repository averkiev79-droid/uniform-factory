import React from 'react';
import { ArrowRight, Star, Award } from 'lucide-react';
import { Button } from './ui/button';
import { stats } from '../mock';

export const Hero = () => {
  return (
    <section id="home" className="bg-gradient-to-br from-gray-50 to-gray-100 py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-full text-sm font-medium">
                <Award className="w-4 h-4" />
                <span>Премиум качество с 2009 года</span>
              </div>
              
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight">
                Корпоративная одежда
                <span className="block text-purple-600">любой сложности</span>
              </h1>
              
              <p className="text-lg lg:text-xl text-gray-600 leading-relaxed max-w-2xl">
                Создаем стильную униформу для вашего бизнеса. От офисных костюмов до специализированной рабочей одежды. 
                Индивидуальный подход к каждому клиенту.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg group"
              >
                Получить расчет стоимости
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-2 border-gray-300 hover:border-purple-600 hover:text-purple-600 px-8 py-4 text-lg"
              >
                Посмотреть каталог
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="pt-8 border-t border-gray-200">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center lg:text-left">
                    <div className="text-2xl lg:text-3xl font-bold text-purple-600">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="aspect-square lg:aspect-auto lg:h-[600px] rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=800&fit=crop&crop=faces" 
                alt="Профессиональная корпоративная одежда"
                className="w-full h-full object-cover"
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
                <strong>1200+ клиентов</strong> доверяют качеству AVIK
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};