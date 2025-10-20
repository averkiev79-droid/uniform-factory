import React, { useState, useEffect } from 'react';
import { ProductCategoriesContent } from '../components/ProductCategoriesContent';
import SEO from '../components/SEO';
import { seoData } from '../data/seoData';

export const CatalogPage = () => {
  return (
    <div>
      <SEO
        title={seoData.catalog.title}
        description={seoData.catalog.description}
        keywords={seoData.catalog.keywords}
        canonical="/catalog"
      />
      {/* Page Header */}
      <section className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4">
              Каталог продукции
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Полный ассортимент корпоративной одежды для различных сфер деятельности. 
              Высокое качество, индивидуальный подход к каждому клиенту.
            </p>
          </div>
        </div>
      </section>

      {/* Catalog Content */}
      <div className="py-8">
        <ProductCategoriesContent />
      </div>

      {/* Additional Info */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-navy-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Индивидуальный подход</h3>
              <p className="text-gray-600">
                Каждый заказ разрабатывается с учетом специфики вашего бизнеса
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-navy-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Быстрое изготовление</h3>
              <p className="text-gray-600">
                Сроки производства от 5 рабочих дней благодаря собственному производству
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-navy-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Гарантия качества</h3>
              <p className="text-gray-600">
                15+ лет опыта и более 2500 выполненных заказов гарантируют качество
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-navy">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Нужна консультация по выбору?
          </h2>
          <p className="text-navy-100 mb-8 max-w-2xl mx-auto">
            Наши специалисты помогут подобрать оптимальное решение для вашего бизнеса
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/calculator"
              className="bg-white text-navy hover:bg-gray-100 px-8 py-4 rounded-lg font-medium transition-colors duration-200"
            >
              Рассчитать стоимость
            </a>
            <a 
              href="/contacts"
              className="border-2 border-white text-white hover:bg-white hover:text-navy px-8 py-4 rounded-lg font-medium transition-colors duration-200"
            >
              Получить консультацию
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};