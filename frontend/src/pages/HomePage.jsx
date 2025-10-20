import React from 'react';
import { Hero } from '../components/Hero';
import { ProductCategories } from '../components/ProductCategories';
import { Advantages } from '../components/Advantages';
import SEO from '../components/SEO';

export const HomePage = () => {
  return (
    <div>
      <SEO
        title="Производство корпоративной одежды и униформы на заказ"
        description="Производство униформы для ресторанов, гостиниц, офисов, магазинов. Пошив корпоративной одежды для официантов, поваров, администраторов, продавцов. Работаем по всей России. ☎ +7 (812) 317-73-19"
        keywords="униформа на заказ, корпоративная одежда, спецодежда, униформа для ресторанов, униформа для гостиниц, пошив униформы, производство униформы, униформа для официантов, униформа для поваров, униформа москва, спецодежда для персонала, униформа для сотрудников"
        canonical="/"
      />
      <Hero />
      <ProductCategories />
      <Advantages />
      
      {/* Call to Action Section */}
      <section className="py-16 bg-navy-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
            Готовы создать униформу для вашего бизнеса?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Свяжитесь с нами для консультации и получения персонального предложения
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/calculator"
              className="bg-navy hover:bg-navy-hover text-white px-8 py-4 rounded-lg font-medium transition-colors duration-200"
            >
              Рассчитать стоимость
            </a>
            <a 
              href="/contacts"
              className="border border-navy text-navy hover:bg-navy hover:text-white px-8 py-4 rounded-lg font-medium transition-colors duration-200"
            >
              Связаться с нами
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};