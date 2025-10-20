import React, { useState, useEffect } from 'react';
import { Save, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ContentEditor = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  
  const [content, setContent] = useState({
    home: {
      heroTitle: 'Корпоративная одежда любой сложности',
      heroSubtitle: 'Премиум качество с 1993 года',
      heroDescription: 'Индивидуальный подход к каждому клиенту. От разработки дизайна до пошива готового изделия.',
      aboutTitle: 'Почему выбирают нас',
      advantage1Title: 'Собственное производство',
      advantage1Text: 'Полный контроль качества на всех этапах',
      advantage2Title: 'Более 30 лет опыта',
      advantage2Text: 'Работаем с 1993 года',
      advantage3Title: 'Более 1200 клиентов',
      advantage3Text: 'Доверяют нам свой бренд',
    },
    about: {
      title: 'О нашей компании',
      subtitle: 'История с 1993 года',
      description: 'Более 30 лет мы создаем корпоративную одежду, которая подчеркивает индивидуальность бренда и создает профессиональный имидж компании.',
      feature1: 'Собственное производство',
      feature2: 'Более 30 лет опыта',
      feature3: 'Более 5000 выполненных заказов',
      feature4: 'Более 1200 клиентов'
    },
    catalog: {
      title: 'Каталог униформы',
      description: 'Широкий выбор моделей для любой сферы деятельности'
    },
    contacts: {
      title: 'Контакты',
      description: 'Свяжитесь с нами удобным способом',
      phone: '+7 (812) 317-73-19',
      email: 'mail@uniformfactory.ru',
      address: 'Санкт-Петербург, пр. Ветеранов, 140'
    }
  });

  const sections = [
    { id: 'home', name: 'Главная страница' },
    { id: 'about', name: 'О компании' },
    { id: 'catalog', name: 'Каталог' },
    { id: 'contacts', name: 'Контакты' }
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.post(`${BACKEND_URL}/api/admin/content`, content);
      alert('Контент успешно сохранен!');
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Ошибка сохранения контента');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    setContent(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Редактор текстов</h2>
          <p className="text-gray-600 mt-1">Управление текстовым контентом всех страниц</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-green-600 hover:bg-green-700"
        >
          {saving ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Сохранение...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Сохранить все
            </>
          )}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-200">
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`px-4 py-2 font-medium transition-colors ${
              activeSection === section.id
                ? 'text-navy border-b-2 border-navy'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {section.name}
          </button>
        ))}
      </div>

      {/* Content Forms */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Home Section */}
        {activeSection === 'home' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Главная страница</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Заголовок Hero секции
              </label>
              <input
                type="text"
                value={content.home.heroTitle}
                onChange={(e) => handleInputChange('home', 'heroTitle', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Подзаголовок (год основания)
              </label>
              <input
                type="text"
                value={content.home.heroSubtitle}
                onChange={(e) => handleInputChange('home', 'heroSubtitle', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent"
              />
              <p className="mt-1 text-sm text-gray-500">Измените год на 1993</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Описание
              </label>
              <textarea
                value={content.home.heroDescription}
                onChange={(e) => handleInputChange('home', 'heroDescription', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent"
              />
            </div>

            <hr className="my-6" />

            <h4 className="font-semibold text-gray-900">Преимущества</h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Преимущество 1 - Заголовок
                </label>
                <input
                  type="text"
                  value={content.home.advantage1Title}
                  onChange={(e) => handleInputChange('home', 'advantage1Title', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent"
                />
                <label className="block text-sm font-medium text-gray-700 mb-2 mt-2">
                  Текст
                </label>
                <input
                  type="text"
                  value={content.home.advantage1Text}
                  onChange={(e) => handleInputChange('home', 'advantage1Text', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Преимущество 2 - Заголовок
                </label>
                <input
                  type="text"
                  value={content.home.advantage2Title}
                  onChange={(e) => handleInputChange('home', 'advantage2Title', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent"
                />
                <label className="block text-sm font-medium text-gray-700 mb-2 mt-2">
                  Текст
                </label>
                <input
                  type="text"
                  value={content.home.advantage2Text}
                  onChange={(e) => handleInputChange('home', 'advantage2Text', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Преимущество 3 - Заголовок
                </label>
                <input
                  type="text"
                  value={content.home.advantage3Title}
                  onChange={(e) => handleInputChange('home', 'advantage3Title', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent"
                />
                <label className="block text-sm font-medium text-gray-700 mb-2 mt-2">
                  Текст
                </label>
                <input
                  type="text"
                  value={content.home.advantage3Text}
                  onChange={(e) => handleInputChange('home', 'advantage3Text', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}

        {/* About Section */}
        {activeSection === 'about' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Страница "О компании"</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Заголовок
              </label>
              <input
                type="text"
                value={content.about.title}
                onChange={(e) => handleInputChange('about', 'title', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Подзаголовок (с годом)
              </label>
              <input
                type="text"
                value={content.about.subtitle}
                onChange={(e) => handleInputChange('about', 'subtitle', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Описание компании
              </label>
              <textarea
                value={content.about.description}
                onChange={(e) => handleInputChange('about', 'description', e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <hr className="my-6" />

            <h4 className="font-semibold text-gray-900">Показатели</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Показатель 1
                </label>
                <input
                  type="text"
                  value={content.about.feature1}
                  onChange={(e) => handleInputChange('about', 'feature1', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Показатель 2
                </label>
                <input
                  type="text"
                  value={content.about.feature2}
                  onChange={(e) => handleInputChange('about', 'feature2', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Показатель 3
                </label>
                <input
                  type="text"
                  value={content.about.feature3}
                  onChange={(e) => handleInputChange('about', 'feature3', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Показатель 4
                </label>
                <input
                  type="text"
                  value={content.about.feature4}
                  onChange={(e) => handleInputChange('about', 'feature4', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>
        )}

        {/* Catalog Section */}
        {activeSection === 'catalog' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Страница "Каталог"</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Заголовок
              </label>
              <input
                type="text"
                value={content.catalog.title}
                onChange={(e) => handleInputChange('catalog', 'title', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Описание
              </label>
              <textarea
                value={content.catalog.description}
                onChange={(e) => handleInputChange('catalog', 'description', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        )}

        {/* Contacts Section */}
        {activeSection === 'contacts' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Страница "Контакты"</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Телефон
              </label>
              <input
                type="text"
                value={content.contacts.phone}
                onChange={(e) => handleInputChange('contacts', 'phone', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={content.contacts.email}
                onChange={(e) => handleInputChange('contacts', 'email', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Адрес
              </label>
              <input
                type="text"
                value={content.contacts.address}
                onChange={(e) => handleInputChange('contacts', 'address', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        )}
      </div>

      {/* Save Button Bottom */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-green-600 hover:bg-green-700"
        >
          {saving ? 'Сохранение...' : 'Сохранить изменения'}
        </Button>
      </div>
    </div>
  );
};

export default ContentEditor;
