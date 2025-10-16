import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { CallbackModal } from '../components/CallbackModal';
import { ConsultationModal } from '../components/ConsultationModal';
import { apiService } from '../services/api';

export const ContactsPage = () => {
  const [isCallbackModalOpen, setIsCallbackModalOpen] = useState(false);
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: null, message: '' });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSubmitStatus({ type: null, message: '' }); // Clear status on input
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone || !formData.message) {
      setSubmitStatus({ 
        type: 'error', 
        message: 'Заполните обязательные поля: имя, email, телефон и сообщение' 
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitStatus({ type: null, message: '' });

      await apiService.submitContactMessage(formData);
      
      setSubmitStatus({ 
        type: 'success', 
        message: 'Ваше сообщение отправлено! Мы ответим в ближайшее время.' 
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        message: ''
      });

    } catch (error) {
      console.error('Error submitting contact message:', error);
      setSubmitStatus({ 
        type: 'error', 
        message: 'Ошибка при отправке сообщения. Попробуйте еще раз.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <section className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4">
              Контакты
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Свяжитесь с нами любым удобным способом. Мы всегда готовы ответить на ваши вопросы 
              и помочь с выбором корпоративной одежды.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Details */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-8">
                Наши контакты
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-navy-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-navy" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Телефон</h3>
                    <p className="text-gray-600">+7 (812) 317-73-19</p>
                    <p className="text-sm text-gray-500">Звонки принимаем с 9:00 до 18:00 по МСК</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-navy-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-navy" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                    <p className="text-gray-600">info@uniformfactory.ru</p>
                    <p className="text-sm text-gray-500">Отвечаем в течение 2 часов</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-navy-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-navy" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Адрес</h3>
                    <p className="text-gray-600">198334, Санкт-Петербург, пр. Ветеранов, 140</p>
                    <p className="text-sm text-gray-500">Режим работы: Пн-Пт 9:00-18:00</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-navy-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-navy" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Время работы</h3>
                    <p className="text-gray-600">Пн-Пт: 9:00 - 18:00</p>
                    <p className="text-gray-600">Сб-Вс: по договоренности</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Работаем по всей России
                </h3>
                <p className="text-gray-600 mb-4">
                  У нас есть представители в 45+ городах России. Доставка готовых изделий 
                  осуществляется во все регионы.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    onClick={() => setIsCallbackModalOpen(true)}
                    className="bg-navy hover:bg-navy-hover"
                  >
                    Заказать звонок
                  </Button>
                  <Button 
                    onClick={() => setIsConsultationModalOpen(true)}
                    variant="outline"
                    className="border-navy text-navy hover:bg-navy-50"
                  >
                    Получить консультацию
                  </Button>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-gray-50 p-8 rounded-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Напишите нам
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Имя *</Label>
                    <input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent"
                      placeholder="Ваше имя"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Телефон *</Label>
                    <input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent"
                      placeholder="+7 (812) 317-73-19"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="company">Компания</Label>
                  <input
                    id="company"
                    type="text"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent"
                    placeholder="Название компании"
                  />
                </div>

                <div>
                  <Label htmlFor="message">Сообщение *</Label>
                  <textarea
                    id="message"
                    rows={4}
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent"
                    placeholder="Расскажите о ваших потребностях..."
                    required
                  />
                </div>

                {submitStatus.type && (
                  <div className={`p-4 rounded-lg ${
                    submitStatus.type === 'success' 
                      ? 'bg-green-50 border border-green-200 text-green-700'
                      : 'bg-red-50 border border-red-200 text-red-700'
                  }`}>
                    {submitStatus.message}
                  </div>
                )}

                <Button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-navy hover:bg-navy-hover disabled:opacity-50"
                >
                  {isSubmitting ? 'Отправка...' : 'Отправить сообщение'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Наше расположение
            </h2>
            <p className="text-gray-600">
              198334, Санкт-Петербург, пр. Ветеранов, 140
            </p>
          </div>
          
          {/* Interactive Yandex Map */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <iframe
              src="https://yandex.ru/map-widget/v1/?um=constructor%3A78bb7b8b94d8e7a2c2d4c6e8a6c4b2d3c4f5e6a7b8c9d0e1f2g3h4i5j6k7l8m9n0&amp;source=constructor"
              width="100%"
              height="400"
              frameBorder="0"
              title="Карта расположения Uniform Factory"
              className="w-full h-96"
            />
          </div>
          
          {/* Address and directions */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Как добраться
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>🚇 <strong>Метро:</strong> станция "Ленинский проспект"</li>
                <li>🚌 <strong>Автобус:</strong> остановка "пр. Ветеранов, 140"</li>
                <li>🚗 <strong>На автомобиле:</strong> бесплатная парковка</li>
                <li>🚶 <strong>Пешком:</strong> от метро 15 минут</li>
              </ul>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Информация для посещения
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>📞 <strong>Звонок перед приездом:</strong> обязательно</li>
                <li>🕘 <strong>Режим работы:</strong> Пн-Пт 9:00-18:00</li>
                <li>🅿️ <strong>Парковка:</strong> бесплатная на территории</li>
                <li>🏢 <strong>Офис и производство:</strong> в одном здании</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Modals */}
      <CallbackModal 
        isOpen={isCallbackModalOpen} 
        onClose={() => setIsCallbackModalOpen(false)} 
      />
      
      <ConsultationModal 
        isOpen={isConsultationModalOpen} 
        onClose={() => setIsConsultationModalOpen(false)} 
      />
    </div>
  );
};