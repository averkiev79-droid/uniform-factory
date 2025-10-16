import React, { useState } from 'react';
import { X, Phone } from 'lucide-react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { apiService } from '../services/api';

export const CallbackModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
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
    
    if (!formData.name || !formData.phone) {
      setError('Заполните все поля');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const callbackRequest = {
        name: formData.name,
        phone: formData.phone
      };

      const result = await apiService.submitCallbackRequest(callbackRequest);
      
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setFormData({ name: '', phone: '' });
      }, 2000);
      
    } catch (err) {
      console.error('Failed to submit callback request:', err);
      setError('Не удалось отправить заявку. Попробуйте еще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setFormData({ name: '', phone: '' });
    setError(null);
    setSuccess(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6 relative">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>

        {success ? (
          /* Success message */
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Заявка отправлена!
            </h3>
            <p className="text-gray-600">
              Мы перезвоним вам в течение 15 минут
            </p>
          </div>
        ) : (
          /* Form */
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-navy-100 text-navy rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Заказать звонок
              </h3>
              <p className="text-gray-600">
                Оставьте свой номер, и мы перезвоним в течение 15 минут
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="callback-name">Ваше имя *</Label>
                <input
                  id="callback-name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent"
                  placeholder="Как к вам обращаться?"
                />
              </div>
              
              <div>
                <Label htmlFor="callback-phone">Номер телефона *</Label>
                <input
                  id="callback-phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent"
                  placeholder="+7 (812) 317-73-19"
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Отмена
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-navy hover:bg-navy-hover text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Отправка...' : 'Заказать звонок'}
                </Button>
              </div>
            </form>
            
            <p className="text-xs text-gray-500 mt-4 text-center">
              * Звонок бесплатный. Мы не передаем данные третьим лицам.
            </p>
          </>
        )}
      </div>
    </div>
  );
};