import React from 'react';
import { Factory, Award, Users, Clock, Target, Handshake } from 'lucide-react';
import { Card, CardContent } from './ui/card';

export const About = () => {
  const features = [
    {
      icon: Factory,
      title: "Собственное производство",
      description: "Современное оборудование и полный цикл производства в Санкт-Петербурге"
    },
    {
      icon: Award,
      title: "15+ лет опыта",
      description: "С 2009 года создаем качественную корпоративную одежду для бизнеса"
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
      title: "Полное сопровождение",
      description: "От идеи до готовой продукции - помогаем на каждом этапе"
    }
  ];

  return (
    <section id="about" className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900">
            О нашей компании
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Мы — ведущий производитель корпоративной одежды в России. Наша миссия — создавать стильную 
            и функциональную униформу, которая подчеркивает профессионализм вашего бизнеса и повышает 
            лояльность сотрудников.
          </p>
        </div>

        {/* Company Story */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="space-y-6">
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Наша история
            </h3>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                Компания AVIK была основана в 2009 году с целью создания высококачественной 
                корпоративной одежды для российского бизнеса. Начав как небольшое семейное 
                предприятие, мы выросли в одного из лидеров отрасли.
              </p>
              <p>
                Сегодня наша фабрика в Санкт-Петербурге оснащена современным европейским 
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
            <img 
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop" 
              alt="Фабрика AVIK Uniform Factory"
              className="w-full h-80 object-cover rounded-2xl shadow-lg"
            />
            <div className="absolute -bottom-6 -left-6 bg-purple-600 text-white p-6 rounded-xl shadow-lg">
              <div className="text-3xl font-bold">5000+</div>
              <div className="text-purple-100">выполненных заказов</div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-sm hover:shadow-lg transition-all duration-300">
              <CardContent className="p-8 text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 text-purple-600 rounded-xl">
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

        {/* Values */}
        <div className="bg-gray-50 rounded-2xl p-8 lg:p-12">
          <div className="text-center mb-12">
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
              Наши ценности
            </h3>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <h4 className="text-xl font-bold text-purple-600 mb-3">Качество</h4>
              <p className="text-gray-600">
                Используем только лучшие материалы и проверенные технологии производства
              </p>
            </div>
            <div className="text-center">
              <h4 className="text-xl font-bold text-purple-600 mb-3">Надежность</h4>
              <p className="text-gray-600">
                Соблюдаем сроки, выполняем обязательства и всегда держим слово
              </p>
            </div>
            <div className="text-center">
              <h4 className="text-xl font-bold text-purple-600 mb-3">Инновации</h4>
              <p className="text-gray-600">
                Постоянно развиваемся и внедряем новые решения для наших клиентов
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};