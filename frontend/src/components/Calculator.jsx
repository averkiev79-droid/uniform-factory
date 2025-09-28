import React, { useState, useEffect } from 'react';
import { Calculator as CalculatorIcon, ArrowRight, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { calculatorOptions } from '../mock';

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
  
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const calculatePrice = () => {
    const category = calculatorOptions.categories.find(c => c.id === formData.category);
    const quantity = calculatorOptions.quantities.find(q => q.range === formData.quantity);
    const fabric = calculatorOptions.fabrics.find(f => f.id === formData.fabric);
    const branding = calculatorOptions.branding.find(b => b.id === formData.branding);

    if (!category || !quantity || !fabric || !branding) return 0;

    const basePrice = category.basePrice;
    const quantityMultiplier = quantity.multiplier;
    const fabricMultiplier = fabric.multiplier;
    const brandingPrice = branding.price;

    const totalPrice = (basePrice * quantityMultiplier * fabricMultiplier) + brandingPrice;
    return Math.round(totalPrice);
  };

  useEffect(() => {
    if (formData.category && formData.quantity && formData.fabric && formData.branding) {
      const price = calculatePrice();
      setEstimatedPrice(price);
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  }, [formData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock form submission
    alert('Спасибо! Ваша заявка отправлена. Мы свяжемся с вами в течение 2 часов.');
  };

  return (
    <section className="py-16 lg:py-24 bg-gray-50">
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
                  {calculatorOptions.categories.map((category) => (
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
                        <span className="text-sm text-gray-500">от {category.basePrice}₽</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Selection */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Количество изделий</Label>
                <div className="grid grid-cols-2 gap-2">
                  {calculatorOptions.quantities.map((quantity) => (
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
                  {calculatorOptions.fabrics.map((fabric) => (
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
                  {calculatorOptions.branding.map((branding) => (
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
                  <div className="text-5xl font-bold">{estimatedPrice.toLocaleString()}₽</div>
                  <p className="text-purple-100">за единицу изделия</p>
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
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 group"
                  >
                    Получить точный расчет
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
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