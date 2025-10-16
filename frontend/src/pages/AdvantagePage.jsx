import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Check, Factory, Palette, Award, Clock, Package, Shirt } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

const advantagesData = {
  'sobstvennoe-proizvodstvo': {
    icon: Factory,
    title: 'Собственное производство',
    subtitle: 'Полный цикл от проектирования до готовой продукции',
    heroImage: '/images/about-factory.jpg',
    description: 'Наша фабрика располагает современным производственным комплексом площадью более 3000 кв.м., оснащенным передовым оборудованием из Германии и Японии. Мы контролируем каждый этап производства - от закупки тканей до финальной упаковки готовых изделий.',
    sections: [
      {
        title: 'Производственные мощности',
        content: 'Наше производство включает несколько специализированных цехов: раскройный цех с автоматизированными системами кроя, швейный цех с более чем 150 рабочими местами, цех нанесения логотипов и финишной обработки. Такая структура позволяет нам производить от 500 до 5000 единиц продукции ежедневно.'
      },
      {
        title: 'Контроль качества на всех этапах',
        content: 'Каждое изделие проходит многоступенчатый контроль качества. Проверка начинается с входного контроля тканей и фурнитуры, продолжается на этапе раскроя и пошива, и завершается финальной приемкой готовой продукции. Наши специалисты проверяют ровность швов, соответствие размеров, качество нанесения логотипов.'
      },
      {
        title: 'Собственный склад материалов',
        content: 'Мы поддерживаем постоянный запас более 200 видов тканей различных цветов и фактур. Это позволяет нам оперативно запускать производство и сокращать сроки изготовления. Работаем только с проверенными поставщиками из России, Турции и Италии.'
      }
    ],
    benefits: [
      'Гарантия качества на каждое изделие',
      'Отсутствие посредников - прямые цены производителя',
      'Возможность внесения изменений на любом этапе',
      'Прозрачность процесса производства для клиента',
      'Сертифицированное оборудование и технологии'
    ],
    stats: [
      { number: '3000', label: 'кв.м. производственных площадей' },
      { number: '150+', label: 'швейных машин' },
      { number: '5000', label: 'изделий в день' },
      { number: '25+', label: 'лет опыта' }
    ]
  },
  'individualnyy-dizayn': {
    icon: Palette,
    title: 'Индивидуальный дизайн',
    subtitle: 'Разработка уникального дизайна с учетом вашего бренда',
    heroImage: '/images/hero-main.jpg',
    description: 'Наша команда профессиональных дизайнеров создаст уникальную униформу, которая идеально отразит философию и ценности вашего бренда. Мы учитываем специфику вашего бизнеса, корпоративные цвета, пожелания по стилю и функциональности.',
    sections: [
      {
        title: 'Процесс разработки дизайна',
        content: 'Работа начинается с детального брифинга, где мы изучаем ваш бренд, целевую аудиторию и особенности рабочих процессов. Наши дизайнеры создают 3-5 концептов униформы, каждый из которых представлен в виде эскизов и 3D-визуализации. После выбора концепции мы дорабатываем детали и создаем технические карты для производства.'
      },
      {
        title: 'Подбор тканей и цветов',
        content: 'Мы предлагаем более 200 вариантов тканей различных фактур, плотности и составов. Наши специалисты помогут подобрать оптимальный материал с учетом сезонности, интенсивности эксплуатации и требований к уходу. Цветовая палитра согласуется с вашим брендбуком для создания целостного образа.'
      },
      {
        title: 'Создание прототипа',
        content: 'Перед запуском массового производства мы изготавливаем опытные образцы в различных размерах. Это позволяет оценить посадку, комфорт и внешний вид униформы в реальных условиях. При необходимости вносим корректировки в конструкцию и детали.'
      }
    ],
    benefits: [
      'Бесплатная первичная консультация дизайнера',
      'До 5 вариантов эскизов на выбор',
      '3D-визуализация готового изделия',
      'Создание технического описания и лекал',
      'Изготовление пробных образцов',
      'Учет эргономики и функциональности'
    ],
    stats: [
      { number: '500+', label: 'уникальных дизайнов создано' },
      { number: '15', label: 'профессиональных дизайнеров' },
      { number: '7-10', label: 'дней на разработку концепции' },
      { number: '100%', label: 'соответствие вашему бренду' }
    ]
  },
  'premium-kachestvo': {
    icon: Award,
    title: 'Премиум качество',
    subtitle: 'Используем только высококачественные ткани и фурнитуру',
    heroImage: '/images/categories/category2.jpg',
    description: 'Качество - наш главный приоритет. Мы используем только сертифицированные ткани и фурнитуру от ведущих европейских и российских производителей. Каждое изделие проходит строгий контроль качества и соответствует международным стандартам.',
    sections: [
      {
        title: 'Премиальные ткани',
        content: 'В производстве используются натуральные и высокотехнологичные синтетические ткани. Хлопок из Египта и Турции, шерсть из Италии, инновационные смесовые ткани с антибактериальными свойствами и мембранные материалы с защитой от влаги и ветра. Все ткани имеют сертификаты качества и гигиенические заключения.'
      },
      {
        title: 'Качественная фурнитура',
        content: 'Используем только проверенную фурнитуру: японские молнии YKK, итальянские пуговицы, металлическую фурнитуру с антикоррозийным покрытием. Все элементы подбираются с учетом интенсивности эксплуатации и проходят испытания на прочность.'
      },
      {
        title: 'Многоступенчатый контроль',
        content: 'Входной контроль тканей и фурнитуры, пооперационный контроль в процессе производства, финальная приемка готовых изделий. Каждое изделие проверяется по 25 параметрам качества. Бракованная продукция не допускается к отгрузке.'
      }
    ],
    benefits: [
      'Гарантия на все изделия до 2 лет',
      'Сертификаты качества на все материалы',
      'Износостойкость - выдерживает более 100 стирок',
      'Устойчивость цвета - не выгорает на солнце',
      'Гипоаллергенные материалы',
      'Соответствие ГОСТ и международным стандартам'
    ],
    stats: [
      { number: '98%', label: 'положительных отзывов о качестве' },
      { number: '100+', label: 'стирок без потери вида' },
      { number: '2 года', label: 'гарантия на изделия' },
      { number: '0.5%', label: 'процент брака' }
    ]
  },
  'bystrye-sroki': {
    icon: Clock,
    title: 'Быстрые сроки',
    subtitle: 'Изготовление от 7 дней, срочные заказы за 3 дня',
    heroImage: '/images/categories/category3.jpg',
    description: 'Мы понимаем, что время - это деньги. Наша отлаженная система производства позволяет выполнять заказы в кратчайшие сроки без потери качества. Для особо срочных заказов работаем в режиме 24/7.',
    sections: [
      {
        title: 'Стандартные сроки производства',
        content: 'Заказы из каталога изготавливаются за 7-10 рабочих дней. Это включает раскрой, пошив, нанесение логотипов и финальную обработку. При наличии тканей на складе срок может быть сокращен до 5 дней. Крупные заказы от 500 единиц - 14-21 день.'
      },
      {
        title: 'Срочное производство',
        content: 'Для особо срочных случаев предлагаем экспресс-производство. Небольшие партии до 50 единиц можем изготовить за 3 рабочих дня. Средние партии до 200 единиц - за 5-7 дней. Работаем в две смены и при необходимости в выходные дни.'
      },
      {
        title: 'Прозрачность сроков',
        content: 'При оформлении заказа вы получаете точный график производства с указанием всех этапов. Менеджер держит вас в курсе процесса и сообщает о готовности на каждом этапе. Предоставляем фото готовой продукции перед отправкой.'
      }
    ],
    benefits: [
      'Заказы из каталога - от 7 дней',
      'Срочные заказы - от 3 дней',
      'Индивидуальный дизайн - от 14 дней',
      'Работа в выходные при необходимости',
      'Точное соблюдение согласованных сроков',
      'Возможность поэтапной поставки'
    ],
    stats: [
      { number: '7', label: 'дней средний срок производства' },
      { number: '3', label: 'дня срочное изготовление' },
      { number: '95%', label: 'заказов сдается в срок' },
      { number: '24/7', label: 'работа при срочных заказах' }
    ]
  },
  'lyubye-tirazhi': {
    icon: Package,
    title: 'Любые тиражи',
    subtitle: 'От 1 единицы до крупных корпоративных заказов',
    heroImage: '/images/categories/category4.jpg',
    description: 'Наше производство одинаково эффективно работает как с единичными заказами, так и с крупными партиями. Мы не устанавливаем минимальный объем заказа и предлагаем гибкую ценовую политику в зависимости от тиража.',
    sections: [
      {
        title: 'Малые тиражи',
        content: 'Изготовим даже 1 единицу униформы для индивидуального заказа или замены износившегося изделия. Наш экспериментальный цех специализируется на единичных и малосерийных заказах. Идеально для стартапов, небольших ресторанов или бутиков.'
      },
      {
        title: 'Средние партии',
        content: 'Заказы от 50 до 500 единиц оптимальны для средних предприятий. При таком объеме мы можем предложить более выгодную цену и широкие возможности по кастомизации. Возможна поэтапная поставка для удобства клиента.'
      },
      {
        title: 'Крупные корпоративные заказы',
        content: 'Выполняем заказы для крупных торговых сетей, отельных групп и корпораций объемом до 10000 единиц. Для таких заказов предусмотрены специальные условия, индивидуальный менеджер и возможность отсрочки платежа.'
      }
    ],
    benefits: [
      'Без минимального заказа - от 1 единицы',
      'Гибкие цены в зависимости от тиража',
      'Скидки на крупные заказы до 30%',
      'Возможность поэтапной поставки',
      'Постоянным клиентам - специальные условия',
      'Возможность дозаказа по старым ценам'
    ],
    stats: [
      { number: '1', label: 'минимальный заказ' },
      { number: '10000+', label: 'максимальный заказ' },
      { number: '30%', label: 'скидка на крупные партии' },
      { number: '500+', label: 'постоянных клиентов' }
    ]
  },
  'nanesenie-logotipa': {
    icon: Shirt,
    title: 'Нанесение логотипа',
    subtitle: 'Вышивка, печать, шелкография - любые виды брендинга',
    heroImage: '/images/categories/category5.jpg',
    description: 'Мы предлагаем все современные технологии нанесения логотипов и корпоративной символики. Наше оборудование позволяет создавать изображения любой сложности с высокой детализацией и стойкостью.',
    sections: [
      {
        title: 'Компьютерная вышивка',
        content: 'Самый престижный и долговечный способ нанесения. Используем профессиональные вышивальные машины с 15 головками. Можем выполнить вышивку любой сложности - от простых логотипов до многоцветных изображений. Максимальный размер вышивки 40x40 см. Используем качественные полиэстеровые и вискозные нити, устойчивые к выцветанию.'
      },
      {
        title: 'Термотрансферная печать',
        content: 'Идеально подходит для фотореалистичных изображений и градиентов. Позволяет наносить полноцветные логотипы любой сложности. Изображение получается яркое, детализированное, выдерживает до 50 стирок. Особенно эффективно для промо-одежды и спортивной формы.'
      },
      {
        title: 'Шелкография и прямая печать',
        content: 'Классическая технология для нанесения простых логотипов в 1-4 цвета. Отличается высокой стойкостью - выдерживает более 100 стирок. Идеально для больших тиражей. Также предлагаем флексопечать, флокирование и нанесение светоотражающих элементов.'
      }
    ],
    benefits: [
      'Все виды нанесения: вышивка, печать, шелкография',
      'Разработка макета бесплатно',
      'Высокая стойкость - не выцветает и не трескается',
      'Возможность нанесения на любые материалы',
      'Точная передача корпоративных цветов',
      'Нанесение на готовые изделия'
    ],
    stats: [
      { number: '7', label: 'технологий нанесения' },
      { number: '100+', label: 'стирок без потери качества' },
      { number: '24 часа', label: 'срок нанесения на малые партии' },
      { number: '100%', label: 'точность передачи цветов' }
    ]
  }
};

export const AdvantagePage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const advantage = advantagesData[slug];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!advantage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Страница не найдена</h1>
          <Button onClick={() => navigate('/')}>Вернуться на главную</Button>
        </div>
      </div>
    );
  }

  const Icon = advantage.icon;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-navy text-white py-20 lg:py-32">
        <div 
          className="absolute inset-0 opacity-10 bg-cover bg-center"
          style={{ backgroundImage: `url(${advantage.heroImage})` }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="mb-6 text-white border-white hover:bg-white hover:text-navy"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            На главную
          </Button>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
              <Icon className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold">{advantage.title}</h1>
              <p className="text-xl text-gray-200 mt-2">{advantage.subtitle}</p>
            </div>
          </div>
          
          <p className="text-lg text-gray-100 max-w-3xl mt-6 leading-relaxed">
            {advantage.description}
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {advantage.stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-navy mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-12">
          {advantage.sections.map((section, index) => (
            <Card key={index} className="border-0 shadow-lg">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {section.title}
                </h2>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {section.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Benefits List */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Ключевые преимущества
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {advantage.benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3 bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <Card className="bg-navy text-white border-0">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Готовы обсудить ваш проект?
            </h2>
            <p className="text-gray-200 mb-8 text-lg max-w-2xl mx-auto">
              Свяжитесь с нами для консультации. Наши специалисты ответят на все вопросы
              и помогут выбрать оптимальное решение для вашего бизнеса.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button
                onClick={() => navigate('/contacts')}
                className="bg-white text-navy hover:bg-gray-100"
              >
                Связаться с нами
              </Button>
              <Button
                onClick={() => navigate('/calculator')}
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-navy"
              >
                Рассчитать стоимость
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Other Advantages */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Другие наши преимущества
          </h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {Object.entries(advantagesData)
              .filter(([key]) => key !== slug)
              .slice(0, 3)
              .map(([key, adv]) => {
                const AdvIcon = adv.icon;
                return (
                  <Link key={key} to={`/advantage/${key}`}>
                    <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer h-full">
                      <CardContent className="p-6 text-center">
                        <div className="inline-flex items-center justify-center w-14 h-14 bg-navy/10 text-navy rounded-xl group-hover:bg-navy group-hover:text-white transition-colors duration-300 mb-4">
                          <AdvIcon className="w-7 h-7" />
                        </div>
                        <h3 className="font-bold text-lg mb-2">{adv.title}</h3>
                        <p className="text-gray-600 text-sm">{adv.subtitle}</p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};
