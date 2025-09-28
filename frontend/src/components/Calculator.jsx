import React, { useState, useEffect } from 'react';
import { Calculator as CalculatorIcon, ArrowRight, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { apiService } from '../services/api';
import { calculatorOptions } from '../mock'; // Fallback data

export const Calculator = () => {
  const [formData, setFormData] = useState({
    category: '',
    quantity: '',
    fabric: '',
    branding: '',
    name: '',
    email: '',
    phone: '',
    company: ''
  });
  
  const [options, setOptions] = useState(calculatorOptions);
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Fetch calculator options on component mount
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const data = await apiService.getCalculatorOptions();
        setOptions(data);
      } catch (err) {
        console.error('Failed to fetch calculator options:', err);
        // Keep fallback options
      }
    };

    fetchOptions();
  }, []);

  // Calculate estimate when parameters change
  useEffect(() => {
    if (formData.category && formData.quantity && formData.fabric && formData.branding) {
      calculateEstimate();
    } else {
      setShowResults(false);
      setEstimatedPrice(0);
    }
  }, [formData.category, formData.quantity, formData.fabric, formData.branding]);

  const calculateEstimate = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const estimateRequest = {
        category: formData.category,
        quantity: formData.quantity,
        fabric: formData.fabric,
        branding: formData.branding
      };
      
      const result = await apiService.calculateEstimate(estimateRequest);
      setEstimatedPrice(result.estimated_price);
      setShowResults(true);
    } catch (err) {
      console.error('Failed to calculate estimate:', err);
      setError('Не удалось рассчитать стоимость');
      
      // Fallback calculation
      const category = options.categories.find(c => c.id === formData.category);
      const quantity = options.quantities.find(q => q.range === formData.quantity);
      const fabric = options.fabrics.find(f => f.id === formData.fabric);
      const branding = options.branding.find(b => b.id === formData.branding);

      if (category && quantity && fabric && branding) {
        const basePrice = category.basePrice || category.base_price;
        const quantityMultiplier = quantity.multiplier;
        const fabricMultiplier = fabric.multiplier;
        const brandingPrice = branding.price;

        const totalPrice = Math.round((basePrice * quantityMultiplier * fabricMultiplier) + brandingPrice);
        setEstimatedPrice(totalPrice);
        setShowResults(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone) {
      setError('Заполните все обязательные поля');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const quoteRequest = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        category: formData.category,
        quantity: formData.quantity,
        fabric: formData.fabric,
        branding: formData.branding,
        estimated_price: estimatedPrice
      };

      const result = await apiService.submitQuoteRequest(quoteRequest);
      
      // Show success message
      alert(`Спасибо! ${result.message}\nНомер заявки: ${result.request_id}`);
      
      // Reset form
      setFormData({
        category: '',
        quantity: '',
        fabric: '',
        branding: '',
        name: '',
        email: '',
        phone: '',
        company: ''
      });
      setShowResults(false);
      setEstimatedPrice(0);
    } catch (err) {
      console.error('Failed to submit quote request:', err);
      setError('Не удалось отправить заявку. Попробуйте еще раз.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="calculator" className="py-16 lg:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center space-x-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium">
            <CalculatorIcon className="w-4 h-4" />
            <span>Калькулятор стоимости</span>
          </div>
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900">
            Рассчитайте стоимость заказа
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Получите предварительную стоимость вашего заказа за несколько секунд. 
            Точная цена будет рассчитана после консультации с менеджером.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-8 text-center">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Calculator Form */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-2xl">Параметры заказа</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Category Selection */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Тип изделия</Label>
                <div className="grid grid-cols-1 gap-2">
                  {options.categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleInputChange('category', category.id)}
                      className={`p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                        formData.category === category.id
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{category.name}</span>
                        <span className="text-sm text-gray-500">
                          от {category.basePrice || category.base_price}₽
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Selection */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Количество изделий</Label>
                <div className="grid grid-cols-2 gap-2">
                  {options.quantities.map((quantity) => (
                    <button
                      key={quantity.range}
                      onClick={() => handleInputChange('quantity', quantity.range)}
                      className={`p-3 text-center rounded-lg border-2 transition-all duration-200 ${
                        formData.quantity === quantity.range
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      {quantity.range}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fabric Selection */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Тип ткани</Label>
                <div className="grid grid-cols-1 gap-2">
                  {options.fabrics.map((fabric) => (
                    <button
                      key={fabric.id}
                      onClick={() => handleInputChange('fabric', fabric.id)}
                      className={`p-3 text-left rounded-lg border-2 transition-all duration-200 ${
                        formData.fabric === fabric.id
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      {fabric.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Branding Selection */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Нанесение логотипа</Label>
                <div className="grid grid-cols-1 gap-2">
                  {options.branding.map((branding) => (
                    <button
                      key={branding.id}
                      onClick={() => handleInputChange('branding', branding.id)}
                      className={`p-3 text-left rounded-lg border-2 transition-all duration-200 ${
                        formData.branding === branding.id
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span>{branding.name}</span>
                        <span className="text-sm text-gray-500">
                          {branding.price === 0 ? 'Бесплатно' : `+${branding.price}₽`}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results and Contact Form */}
          <div className="space-y-8">
            {/* Price Estimate */}
            {showResults && (
              <Card className="shadow-lg border-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                <CardContent className="p-8 text-center space-y-4">
                  <h3 className="text-2xl font-bold">Предварительная стоимость</h3>
                  {loading ? (
                    <div className="animate-pulse">
                      <div className="h-16 bg-white/20 rounded-md mb-2"></div>
                      <div className="h-4 bg-white/20 rounded-md w-32 mx-auto"></div>
                    </div>
                  ) : (
                    <>
                      <div className="text-5xl font-bold">{estimatedPrice.toLocaleString()}₽</div>
                      <p className="text-purple-100">за единицу изделия</p>
                    </>
                  )}
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-sm">
                    <div className="flex items-center justify-center space-x-2 text-white/90">
                      <Check className="w-4 h-4" />
                      <span>Окончательная цена рассчитывается индивидуально</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contact Form */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-2xl">Получить точный расчет</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Имя *</Label>
                      <input
                        id="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Ваше имя"
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
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="email@example.com"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Телефон *</Label>
                    <input
                      id="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="+7 (___) ___-__-__"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    size="lg" 
                    disabled={submitting || !showResults}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 group disabled:opacity-50"
                  >
                    {submitting ? 'Отправка...' : 'Получить точный расчет'}
                    {!submitting && <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                  </Button>
                </form>
                
                <p className="text-sm text-gray-500 mt-4 text-center">
                  * Обязательные поля. Мы свяжемся с вами в течение 2 часов.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};