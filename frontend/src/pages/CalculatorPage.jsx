import React from 'react';
import { Calculator } from '../components/Calculator';

export const CalculatorPage = () => {
  return (
    <div>
      {/* Page Header */}
      <section className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4">
              Калькулятор стоимости
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Рассчитайте предварительную стоимость корпоративной одежды для вашего бизнеса. 
              Получите точную оценку за несколько минут.
            </p>
          </div>
        </div>
      </section>

      {/* Calculator Content */}
      <div className="py-8">
        <Calculator />
      </div>

      {/* Additional Info */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Что влияет на стоимость?
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-navy-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Тип изделия</h3>
              <p className="text-gray-600 text-sm">
                Рубашки, костюмы, спецодежда имеют разную сложность изготовления
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Количество</h3>
              <p className="text-gray-600 text-sm">
                Чем больше тираж, тем выгоднее стоимость за единицу изделия
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Материал</h3>
              <p className="text-gray-600 text-sm">
                От базовых до премиальных тканей - каждая имеет свою стоимость
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Брендинг</h3>
              <p className="text-gray-600 text-sm">
                Вышивка, печать логотипов и другие способы персонализации
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Часто задаваемые вопросы
            </h2>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-3">
                Насколько точен калькулятор?
              </h3>
              <p className="text-gray-600">
                Калькулятор дает приблизительную стоимость на основе базовых параметров. 
                Финальная стоимость может отличаться в зависимости от дополнительных требований, 
                размерной сетки и других факторов.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-3">
                Что дальше после расчета?
              </h3>
              <p className="text-gray-600">
                После получения предварительного расчета наш менеджер свяжется с вами для 
                уточнения деталей и подготовки коммерческого предложения с точными ценами и условиями.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-3">
                Можно ли изменить параметры после заказа?
              </h3>
              <p className="text-gray-600">
                Небольшие изменения возможны на этапе согласования макета. 
                Кардинальные изменения после запуска производства могут повлиять на стоимость и сроки.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};