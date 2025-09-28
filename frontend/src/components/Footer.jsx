import React from 'react';
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, Linkedin } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { name: 'О компании', href: '#about' },
      { name: 'Портфолио', href: '#portfolio' },
      { name: 'Производство', href: '#production' },
      { name: 'Вакансии', href: '#careers' }
    ],
    catalog: [
      { name: 'Офисная одежда', href: '#office' },
      { name: 'HoReCa униформа', href: '#horeca' },
      { name: 'Медицинская одежда', href: '#medical' },
      { name: 'Спецодежда', href: '#workwear' }
    ],
    services: [
      { name: 'Индивидуальный пошив', href: '#custom' },
      { name: 'Дизайн разработка', href: '#design' },
      { name: 'Нанесение логотипов', href: '#branding' },
      { name: 'Доставка', href: '#delivery' }
    ]
  };

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="flex items-center space-x-3">
              <img 
                src="https://customer-assets.emergentagent.com/job_business-wear/artifacts/iol8x16n_Logo_new_short.jpg" 
                alt="AVIK Uniform Factory" 
                className="h-10 w-auto filter brightness-200"
              />
              <div>
                <div className="text-xl font-bold">AVIK</div>
                <div className="text-sm text-gray-400">Uniform Factory</div>
              </div>
            </div>
            
            <p className="text-gray-300 leading-relaxed">
              Производство качественной корпоративной одежды с 2009 года. 
              Создаем стильную униформу для бизнеса любой сферы.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors duration-200">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors duration-200">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors duration-200">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid md:grid-cols-3 lg:grid-cols-3 lg:col-span-2 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">Компания</h3>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <a href={link.href} className="text-gray-300 hover:text-white transition-colors duration-200">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Каталог</h3>
              <ul className="space-y-3">
                {footerLinks.catalog.map((link) => (
                  <li key={link.name}>
                    <a href={link.href} className="text-gray-300 hover:text-white transition-colors duration-200">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Услуги</h3>
              <ul className="space-y-3">
                {footerLinks.services.map((link) => (
                  <li key={link.name}>
                    <a href={link.href} className="text-gray-300 hover:text-white transition-colors duration-200">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold">Контакты</h3>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-purple-400 mt-1 flex-shrink-0" />
                <div>
                  <div className="font-medium">+7 (812) 648-17-54</div>
                  <div className="text-sm text-gray-400">Основной номер</div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-purple-400 mt-1 flex-shrink-0" />
                <div>
                  <div className="font-medium">mail@aviktime.ru</div>
                  <div className="text-sm text-gray-400">Общие вопросы</div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-purple-400 mt-1 flex-shrink-0" />
                <div>
                  <div className="font-medium">Санкт-Петербург</div>
                  <div className="text-sm text-gray-400">ул. Промышленная, 15</div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-purple-400 mt-1 flex-shrink-0" />
                <div>
                  <div className="font-medium">Пн-Пт: 9:00-18:00</div>
                  <div className="text-sm text-gray-400">Сб-Вс: выходной</div>
                </div>
              </div>
            </div>
            
            {/* CTA */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="font-medium mb-2">Нужна консультация?</h4>
              <p className="text-sm text-gray-400 mb-3">
                Оставьте номер телефона, и мы перезвоним в течение 15 минут
              </p>
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors duration-200 w-full">
                Заказать звонок
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-400">
              © {currentYear} AVIK Uniform Factory. Все права защищены.
            </div>
            <div className="flex space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors duration-200">
                Политика конфиденциальности
              </a>
              <a href="#" className="hover:text-white transition-colors duration-200">
                Пользовательское соглашение
              </a>
              <a href="#" className="hover:text-white transition-colors duration-200">
                Реквизиты
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};