import React, { useState } from 'react';
import { Menu, X, Phone, Mail } from 'lucide-react';
import { Button } from './ui/button';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation = [
    { name: 'Главная', href: '/' },
    { name: 'Каталог', href: '/catalog' },
    { name: 'О компании', href: '/about' },
    { name: 'Портфолио', href: '/portfolio' },
    { name: 'Контакты', href: '/contacts' }
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-gray-50 border-b border-gray-100 py-2">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>+7 (812) 317-73-19</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>info@uniformfactory.ru</span>
              </div>
            </div>
            <div className="hidden md:block">
              <span>Работаем по всей России</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <a href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-200">
            <img
              src="https://customer-assets.emergentagent.com/job_avik-uniforms/artifacts/nwyx8wja_%D0%9B%D0%BE%D0%B3%D0%BE.png"
              alt="Uniform Factory" 
              className="w-10 h-10"
            />
            <div>
              <div className="text-lg font-bold text-gray-900">Uniform Factory</div>
              <div className="text-sm text-gray-600">Корпоративная одежда</div>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:block">
            <ul className="flex space-x-8">
              {navigation.map((item) => (
                <li key={item.name}>
                  <a 
                    href={item.href} 
                    className="text-gray-700 hover:text-navy font-medium transition-colors duration-200"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* CTA Button & Mobile Menu */}
          <div className="flex items-center space-x-4">
            <a 
              href="/calculator"
              className="hidden md:inline-flex bg-navy hover:bg-navy-hover text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Заказать расчет
            </a>
            
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 py-4">
            <nav className="space-y-4">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block text-gray-700 hover:text-purple-600 font-medium transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              <div className="pt-4 border-t border-gray-100">
                <a 
                  href="/calculator"
                  className="block w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 text-center"
                >
                  Заказать расчет
                </a>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};