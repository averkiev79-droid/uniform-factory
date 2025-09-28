import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { productCategories } from '../mock';

export const ProductCategories = () => {
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
        </div>

        {/* Categories Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {productCategories.map((category) => (
            <Card 
              key={category.id} 
              className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-0 shadow-md overflow-hidden"
            >
              <div className="relative overflow-hidden">
                <img 
                  src={category.image} 
                  alt={category.title}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-800">
                  {category.products} моделей
                </div>
              </div>
              
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors duration-300">
                    {category.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {category.description}
                  </p>
                </div>
                
                <Button 
                  variant="ghost" 
                  className="p-0 h-auto text-purple-600 hover:text-purple-700 font-medium group/btn"
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
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8">
              Заказать индивидуальный дизайн
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};