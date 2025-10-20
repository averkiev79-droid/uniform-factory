import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { CallbackModal } from './CallbackModal';
import { ConsultationModal } from './ConsultationModal';

// VK Icon Component
const VKIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.785 16.241s.288-.032.436-.193c.136-.148.132-.427.132-.427s-.02-1.304.572-1.496c.583-.19 1.331 1.26 2.125 1.817.6.42 1.056.328 1.056.328l2.124-.03s1.11-.07.584-.963c-.043-.073-.308-.664-1.583-1.88-1.335-1.273-1.156-.1.452-3.053.98-1.798 1.372-2.896 1.249-3.365-.117-.447-.84-.329-.84-.329l-2.393.015s-.177-.025-.309.056c-.129.079-.212.263-.212.263s-.379 1.036-.884 1.918c-1.064 1.86-1.491 1.958-1.665 1.841-.404-.27-.303-1.084-.303-1.662 0-1.807.267-2.561-.52-2.756-.262-.065-.454-.107-1.123-.114-.858-.009-1.585.003-1.996.21-.273.137-.484.443-.355.461.159.022.52.1.71.366.247.343.238 1.114.238 1.114s.142 2.127-.331 2.391c-.324.182-.768-.189-1.723-1.88-.489-.856-.858-1.803-.858-1.803s-.071-.179-.198-.275c-.154-.116-.37-.152-.37-.152l-2.274.015s-.341.01-.467.161c-.111.134-.009.411-.009.411s1.778 4.268 3.793 6.418c1.847 1.972 3.945 1.842 3.945 1.842h.953z"/>
  </svg>
);

export const Footer = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const [isCallbackModalOpen, setIsCallbackModalOpen] = useState(false);
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);

  const handleLinkClick = (e, link) => {
    e.preventDefault();
    
    if (link.action === 'callback') {
      setIsCallbackModalOpen(true);
    } else if (link.action === 'consultation') {
      setIsConsultationModalOpen(true);
    } else if (link.href) {
      navigate(link.href);
    }
  };

  const footerLinks = {
    company: [
      { name: 'О компании', href: '/about' },
      { name: 'Портфолио', href: '/portfolio' },
      { name: 'Наши преимущества', href: '/' },
      { name: 'Калькулятор', href: '/calculator' }
    ],
    catalog: [
      { name: 'Весь каталог', href: '/catalog' },
      { name: 'Офисная одежда', href: '/category/2' },
      { name: 'HoReCa униформа', href: '/category/1' },
      { name: 'Медицинская одежда', href: '/category/5' }
    ],
    services: [
      { name: 'Расчет стоимости', href: '/calculator' },
      { name: 'Заказать звонок', action: 'callback' },
      { name: 'Консультация', action: 'consultation' },
      { name: 'Контакты', href: '/contacts' }
    ]
  };

  return (
    <footer id="contacts" className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-8 md:py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1 space-y-4 md:space-y-6">
            <div className="flex items-center space-x-2 md:space-x-3">
              <img 
                src="https://customer-assets.emergentagent.com/job_avik-uniforms/artifacts/99qofzb8_%D0%9F%D0%BE%D0%B4%D0%B2%D0%B0%D0%BB.png" 
                alt="Uniform Factory" 
                className="h-10 md:h-12 w-auto filter brightness-0 invert"
              />
              <div>
                <div className="text-lg md:text-xl font-bold">Uniform Factory</div>
                <div className="text-xs md:text-sm text-gray-400">Корпоративная одежда</div>
              </div>
            </div>
            
            <p className="text-sm md:text-base text-gray-300 leading-relaxed">
              Производство качественной корпоративной одежды с 1993 года. 
              Создаем стильную униформу для бизнеса любой сферы.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-3 md:space-x-4">
              <a href="#" className="w-9 h-9 md:w-10 md:h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-navy transition-colors duration-200">
                <Facebook className="w-4 h-4 md:w-5 md:h-5" />
              </a>
              <a href="#" className="w-9 h-9 md:w-10 md:h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-navy transition-colors duration-200">
                <Instagram className="w-4 h-4 md:w-5 md:h-5" />
              </a>
              <a href="#" className="w-9 h-9 md:w-10 md:h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-navy transition-colors duration-200">
                <Linkedin className="w-4 h-4 md:w-5 md:h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:col-span-2 gap-6 md:gap-8">
            <div>
              <h3 className="text-base md:text-lg font-bold mb-3 md:mb-4">Компания</h3>
              <ul className="space-y-2 md:space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <a 
                      href={link.href} 
                      onClick={(e) => handleLinkClick(e, link)}
                      className="text-sm md:text-base text-gray-300 hover:text-white transition-colors duration-200"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-base md:text-lg font-bold mb-3 md:mb-4">Каталог</h3>
              <ul className="space-y-2 md:space-y-3">
                {footerLinks.catalog.map((link) => (
                  <li key={link.name}>
                    <a 
                      href={link.href}
                      onClick={(e) => handleLinkClick(e, link)} 
                      className="text-sm md:text-base text-gray-300 hover:text-white transition-colors duration-200"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-base md:text-lg font-bold mb-3 md:mb-4">Услуги</h3>
              <ul className="space-y-2 md:space-y-3">
                {footerLinks.services.map((link) => (
                  <li key={link.name}>
                    <a 
                      href={link.href}
                      onClick={(e) => handleLinkClick(e, link)}
                      className="text-sm md:text-base text-gray-300 hover:text-white transition-colors duration-200"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4 md:space-y-6">
            <h3 className="text-base md:text-lg font-bold">Контакты</h3>
            
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-start space-x-2 md:space-x-3">
                <Phone className="w-4 h-4 md:w-5 md:h-5 text-navy-400 mt-1 flex-shrink-0" />
                <div>
                  <div className="text-sm md:text-base font-medium">+7 (812) 317-73-19</div>
                  <div className="text-xs md:text-sm text-gray-400">Основной номер</div>
                </div>
              </div>
              
              <div className="flex items-start space-x-2 md:space-x-3">
                <Mail className="w-4 h-4 md:w-5 md:h-5 text-navy-400 mt-1 flex-shrink-0" />
                <div>
                  <div className="text-sm md:text-base font-medium break-all">mail@uniformfactory.ru</div>
                  <div className="text-xs md:text-sm text-gray-400">Общие вопросы</div>
                </div>
              </div>
              
              <div className="flex items-start space-x-2 md:space-x-3">
                <MapPin className="w-4 h-4 md:w-5 md:h-5 text-navy-400 mt-1 flex-shrink-0" />
                <div>
                  <div className="text-sm md:text-base font-medium">Санкт-Петербург</div>
                  <div className="text-xs md:text-sm text-gray-400">пр. Ветеранов, 140, лит Г</div>
                </div>
              </div>
              
              <div className="flex items-start space-x-2 md:space-x-3">
                <Clock className="w-4 h-4 md:w-5 md:h-5 text-navy-400 mt-1 flex-shrink-0" />
                <div>
                  <div className="text-sm md:text-base font-medium">Пн-Пт: 9:00-18:00</div>
                  <div className="text-xs md:text-sm text-gray-400">Сб-Вс: выходной</div>
                </div>
              </div>
            </div>
            
            {/* CTA */}
            <div className="bg-white rounded-lg p-3 md:p-4 shadow-lg">
              <h4 className="text-sm md:text-base font-semibold mb-2 text-gray-900">Нужна консультация?</h4>
              <p className="text-xs md:text-sm text-gray-600 mb-3">
                Оставьте номер телефона, и мы перезвоним в течение 15 минут
              </p>
              <button 
                onClick={() => setIsCallbackModalOpen(true)}
                className="bg-navy hover:bg-navy-hover text-white px-3 md:px-4 py-2 rounded text-xs md:text-sm font-medium transition-colors duration-200 w-full"
              >
                Заказать звонок
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
            <div className="text-xs md:text-sm text-gray-400 text-center md:text-left">
              © {currentYear} Uniform Factory. Все права защищены.
            </div>
            <div className="flex flex-wrap justify-center gap-3 md:gap-6 text-xs md:text-sm text-gray-400">
              <button
                onClick={() => navigate('/privacy-policy')}
                className="hover:text-white transition-colors duration-200 whitespace-nowrap"
              >
                Политика конфиденциальности
              </button>
              <button
                onClick={() => navigate('/user-agreement')}
                className="hover:text-white transition-colors duration-200 whitespace-nowrap"
              >
                Пользовательское соглашение
              </button>
              <button
                onClick={() => navigate('/company-details')}
                className="hover:text-white transition-colors duration-200 whitespace-nowrap"
              >
                Реквизиты
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Callback Modal */}
      <CallbackModal 
        isOpen={isCallbackModalOpen} 
        onClose={() => setIsCallbackModalOpen(false)} 
      />

      {/* Consultation Modal */}
      <ConsultationModal 
        isOpen={isConsultationModalOpen} 
        onClose={() => setIsConsultationModalOpen(false)} 
      />
    </footer>
  );
};