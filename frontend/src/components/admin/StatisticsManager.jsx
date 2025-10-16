import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';

export const StatisticsManager = () => {
  const [statistics, setStatistics] = useState({
    years_in_business: 15,
    completed_orders: 5000,
    happy_clients: 1200,
    cities: 150
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/statistics`);
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setStatistics({
            years_in_business: data.years_in_business,
            completed_orders: data.completed_orders,
            happy_clients: data.happy_clients,
            cities: data.cities
          });
        }
      }
    } catch (err) {
      setError('Ошибка загрузки статистики');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      Object.keys(statistics).forEach(key => {
        formData.append(key, statistics[key]);
      });

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/statistics`, {
        method: 'PUT',
        body: formData
      });

      if (response.ok) {
        setSuccess('Статистика успешно обновлена!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Ошибка сохранения статистики');
      }
    } catch (err) {
      setError('Ошибка подключения к серверу');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setStatistics(prev => ({
      ...prev,
      [field]: parseInt(value) || 0
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Загрузка статистики...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Управление статистикой</h1>
      
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Цифры компании на главной странице</CardTitle>
        </CardHeader>
        
        <CardContent>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="years_in_business">Лет на рынке</Label>
                <input
                  id="years_in_business"
                  type="number"
                  value={statistics.years_in_business}
                  onChange={(e) => handleInputChange('years_in_business', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy"
                  placeholder="15"
                  min="1"
                  required
                />
                <p className="text-sm text-gray-600 mt-1">
                  Будет отображаться как "{statistics.years_in_business}+"
                </p>
              </div>

              <div>
                <Label htmlFor="completed_orders">Выполненных заказов</Label>
                <input
                  id="completed_orders"
                  type="number"
                  value={statistics.completed_orders}
                  onChange={(e) => handleInputChange('completed_orders', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy"
                  placeholder="5000"
                  min="1"
                  required
                />
                <p className="text-sm text-gray-600 mt-1">
                  Будет отображаться как "{statistics.completed_orders.toLocaleString()}+"
                </p>
              </div>

              <div>
                <Label htmlFor="happy_clients">Довольных клиентов</Label>
                <input
                  id="happy_clients"
                  type="number"
                  value={statistics.happy_clients}
                  onChange={(e) => handleInputChange('happy_clients', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy"
                  placeholder="1200"
                  min="1"
                  required
                />
                <p className="text-sm text-gray-600 mt-1">
                  Будет отображаться как "{statistics.happy_clients.toLocaleString()}+"
                </p>
              </div>

              <div>
                <Label htmlFor="cities">Городов России</Label>
                <input
                  id="cities"
                  type="number"
                  value={statistics.cities}
                  onChange={(e) => handleInputChange('cities', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy"
                  placeholder="150"
                  min="1"
                  required
                />
                <p className="text-sm text-gray-600 mt-1">
                  Будет отображаться как "{statistics.cities}+"
                </p>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-medium mb-4">Предварительный просмотр:</h4>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-navy">{statistics.years_in_business}+</div>
                  <div className="text-sm text-gray-600">Лет на рынке</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-navy">{statistics.completed_orders.toLocaleString()}+</div>
                  <div className="text-sm text-gray-600">Выполненных заказов</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-navy">{statistics.happy_clients.toLocaleString()}+</div>
                  <div className="text-sm text-gray-600">Довольных клиентов</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-navy">{statistics.cities}+</div>
                  <div className="text-sm text-gray-600">Городов России</div>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={saving}
              className="bg-navy hover:bg-navy-hover"
            >
              <Save className="mr-2 w-5 h-5" />
              {saving ? 'Сохранение...' : 'Сохранить статистику'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Где отображается статистика</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>Главная страница:</strong> Hero секция под заголовком</p>
            <p><strong>Обновления:</strong> Изменения отображаются сразу после сохранения</p>
            <p><strong>Форматирование:</strong> Числа автоматически форматируются (1,200 вместо 1200)</p>
            <p><strong>Знак "+":</strong> Автоматически добавляется ко всем значениям</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};