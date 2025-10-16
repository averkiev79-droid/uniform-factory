import React, { useState } from 'react';
import { X, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { apiService } from '../services/api';

export const PortfolioModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    industry: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone) {
      setError('Заполните обязательные поля');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const portfolioRequest = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        message: `Запрос полного портфолио для отрасли: ${formData.industry || 'не указана'}`
      };

      const result = await apiService.submitConsultationRequest(portfolioRequest);
      
      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      console.error('Error submitting portfolio request:', err);
      setError('Ошибка при отправке запроса. Попробуйте еще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      industry: ''
    });
    setError(null);
    setSuccess(false);
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Запросить полное портфолио
              </h3>
              <p className="text-sm text-gray-600">
                Получите подборку проектов для вашей отрасли
              </p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Заявка отправлена!
              </h4>
              <p className="text-gray-600">
                Мы вышлем вам подборку проектов на указанную почту в течение 24 часов.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Ваше имя *</Label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Введите ваше имя"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Введите ваш email"
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
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="+7 (812) 317-73-19"
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
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Название компании"
                />
              </div>

              <div>
                <Label htmlFor="industry">Отрасль</Label>
                <select
                  id="industry"
                  value={formData.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Выберите отрасль</option>
                  <option value="Ресторанный бизнес">Ресторанный бизнес</option>
                  <option value="Гостиничный бизнес">Гостиничный бизнес</option>
                  <option value="Розничная торговля">Розничная торговля</option>
                  <option value="Медицина">Медицина</option>
                  <option value="Производство">Производство</option>
                  <option value="Автосервис">Автосервис</option>
                  <option value="Салоны красоты">Салоны красоты</option>
                  <option value="Банки и финансы">Банки и финансы</option>
                  <option value="Другое">Другое</option>
                </select>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={handleClose}
                  variant="outline"
                  className="flex-1"
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  {isSubmitting ? 'Отправка...' : 'Отправить запрос'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};