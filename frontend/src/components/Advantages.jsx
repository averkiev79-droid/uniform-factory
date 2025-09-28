import React from 'react';
import { Factory, Palette, Award, Clock, Package, Shirt } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { advantages } from '../mock';

const iconComponents = {
  Factory,
  Palette,
  Award,
  Clock,
  Package,
  Shirt
};

export const Advantages = () => {
  return (
    <section id="advantages" className="py-16 lg:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900">
            Наши преимущества
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Почему более 1200 компаний выбирают AVIK Uniform Factory для создания своей корпоративной одежды
          </p>
        </div>

        {/* Advantages Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {advantages.map((advantage) => {
            const Icon = iconComponents[advantage.icon];
            
            return (
              <Card 
                key={advantage.id} 
                className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-white"
              >
                <CardContent className="p-8 text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
                    <Icon className="w-8 h-8" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900">
                    {advantage.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed">
                    {advantage.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-white rounded-2xl p-8 lg:p-12 shadow-sm">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h3 className="text-2xl lg:text-3xl font-bold text-gray-900">
                Готовы начать сотрудничество?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Оставьте заявку и получите персональное коммерческое предложение в течение 2 часов. 
                Наш менеджер поможет выбрать оптимальное решение для вашего бизнеса.
              </p>
            </div>
            
            <div className="lg:text-right space-y-4">
              <div className="space-y-2">
                <div className="text-3xl font-bold text-purple-600">2 часа</div>
                <div className="text-gray-600">среднее время ответа</div>
              </div>
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg font-medium transition-colors duration-200 w-full lg:w-auto">
                Получить предложение
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};