import React, { useState, useEffect } from 'react';
import { Mail, Phone, Building, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

export const QuoteRequestsManager = () => {
  const [requests, setRequests] = useState([]);
  const [contactRequests, setContactRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('quotes');
  const [error, setError] = useState('');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      
      // Load quote requests
      const quotesResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/quote-requests`);
      if (quotesResponse.ok) {
        const quotesData = await quotesResponse.json();
        setRequests(quotesData);
      }

      // Load contact requests
      const contactResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/contact-requests`);
      if (contactResponse.ok) {
        const contactData = await contactResponse.json();
        setContactRequests(contactData);
      }
    } catch (err) {
      setError('Ошибка загрузки заявок');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (requestId, newStatus) => {
    try {
      const formData = new FormData();
      formData.append('status', newStatus);

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/quote-requests/${requestId}/status`, {
        method: 'PUT',
        body: formData
      });

      if (response.ok) {
        await loadRequests();
      } else {
        setError('Ошибка обновления статуса');
      }
    } catch (err) {
      setError('Ошибка подключения к серверу');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      new: { color: 'bg-blue-100 text-blue-800', icon: AlertCircle, label: 'Новая' },
      in_progress: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'В работе' },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Завершена' }
    };
    
    const config = statusConfig[status] || statusConfig.new;
    const Icon = config.icon;
    
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryName = (categoryId) => {
    const categories = {
      shirts: 'Рубашки/Блузы',
      suits: 'Костюмы',
      dresses: 'Платья',
      aprons: 'Фартуки',
      jackets: 'Жакеты/Пиджаки',
      workwear: 'Спецодежда'
    };
    return categories[categoryId] || categoryId;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Загрузка заявок...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Управление заявками</h1>
        <Button onClick={loadRequests} variant="outline">
          Обновить
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('quotes')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'quotes'
                ? 'border-navy-500 text-navy'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Заявки на расчет ({requests.length})
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'contacts'
                ? 'border-navy-500 text-navy'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Обратные звонки ({contactRequests.length})
          </button>
        </nav>
      </div>

      {activeTab === 'quotes' && (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{request.name}</CardTitle>
                    <p className="text-sm text-gray-600">
                      Заявка #{request.request_id} • {formatDate(request.created_at)}
                    </p>
                  </div>
                  {getStatusBadge(request.status)}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{request.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{request.phone}</span>
                  </div>
                  {request.company && (
                    <div className="flex items-center space-x-2">
                      <Building className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{request.company}</span>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Детали заказа:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Категория:</span><br />
                      <span className="font-medium">{getCategoryName(request.category)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Количество:</span><br />
                      <span className="font-medium">{request.quantity}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Ткань:</span><br />
                      <span className="font-medium">{request.fabric}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Нанесение:</span><br />
                      <span className="font-medium">{request.branding}</span>
                    </div>
                  </div>
                  <div className="mt-3 text-lg font-bold text-navy">
                    Предварительная стоимость: {request.estimated_price.toLocaleString()} ₽
                  </div>
                </div>

                <div className="flex space-x-2">
                  {request.status === 'new' && (
                    <Button
                      size="sm"
                      onClick={() => updateStatus(request.id, 'in_progress')}
                      className="bg-yellow-600 hover:bg-yellow-700"
                    >
                      Взять в работу
                    </Button>
                  )}
                  {request.status === 'in_progress' && (
                    <Button
                      size="sm"
                      onClick={() => updateStatus(request.id, 'completed')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Завершить
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(`mailto:${request.email}?subject=Расчет стоимости заказа AVIK №${request.request_id}`)}
                  >
                    Написать email
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(`tel:${request.phone}`)}
                  >
                    Позвонить
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {requests.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Заявки на расчет не найдены</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'contacts' && (
        <div className="space-y-4">
          {contactRequests.map((request) => (
            <Card key={request.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium text-lg">{request.name}</h3>
                    <p className="text-sm text-gray-600">{formatDate(request.created_at)}</p>
                  </div>
                  <Badge className={request.type === 'callback' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>
                    {request.type === 'callback' ? 'Обратный звонок' : 'Консультация'}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{request.phone}</span>
                  </div>
                  {request.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{request.email}</span>
                    </div>
                  )}
                  {request.company && (
                    <div className="flex items-center space-x-2">
                      <Building className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{request.company}</span>
                    </div>
                  )}
                </div>

                {request.message && (
                  <div className="mt-3 p-3 bg-gray-50 rounded">
                    <p className="text-sm">{request.message}</p>
                  </div>
                )}

                <div className="flex space-x-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(`tel:${request.phone}`)}
                  >
                    Позвонить
                  </Button>
                  {request.email && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`mailto:${request.email}?subject=Ответ на вашу заявку AVIK`)}
                    >
                      Написать email
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {contactRequests.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Заявки на звонки не найдены</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};