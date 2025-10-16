import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Factory, Palette, Award, Clock, Package, Shirt, ArrowRight } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { ConsultationModal } from './ConsultationModal';
import { advantages } from '../mock';

const iconComponents = {
  Factory,
  Palette,
  Award,
  Clock,
  Package,
  Shirt
};

const advantageSlugs = {
  1: 'sobstvennoe-proizvodstvo',
  2: 'individualnyy-dizayn',
  3: 'premium-kachestvo',
  4: 'bystrye-sroki',
  5: 'lyubye-tirazhi',
  6: 'nanesenie-logotipa'
};

export const Advantages = () => {
  const navigate = useNavigate();
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
  
  return (
    <section id="advantages" className="py-16 lg:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900">
            Наши преимущества
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Почему более 1200 компаний выбирают нашу фабрику для создания своей корпоративной одежды
          </p>
        </div>

        {/* Advantages Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {advantages.map((advantage) => {
            const Icon = iconComponents[advantage.icon];
            
            return (
              <Card 
                key={advantage.id} 
                className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-white cursor-pointer"
                onClick={() => navigate(`/advantage/${advantageSlugs[advantage.id]}`)}
              >
                <CardContent className="p-8 text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-navy-100 text-navy rounded-xl group-hover:bg-navy group-hover:text-white transition-colors duration-300">
                    <Icon className="w-8 h-8" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-navy transition-colors">
                    {advantage.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed">
                    {advantage.description}
                  </p>
                  
                  <div className="flex items-center justify-center text-navy font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    Подробнее
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
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
                <div className="text-3xl font-bold text-navy">2 часа</div>
                <div className="text-gray-600">среднее время ответа</div>
              </div>
              <button 
                className="bg-navy hover:bg-navy-hover text-white px-8 py-4 rounded-lg font-medium transition-colors duration-200 w-full lg:w-auto"
                onClick={() => setIsConsultationModalOpen(true)}
              >
                Получить предложение
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <ConsultationModal 
        isOpen={isConsultationModalOpen} 
        onClose={() => setIsConsultationModalOpen(false)} 
      />
    </section>
  );
};