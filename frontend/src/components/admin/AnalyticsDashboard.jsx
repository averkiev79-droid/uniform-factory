import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Eye, ShoppingBag, FileText, Users, Activity } from 'lucide-react';
import { apiService } from '../../services/api';

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAnalyticsOverview();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Не удалось загрузить аналитику</p>
        <button
          onClick={fetchAnalytics}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  const stats = [
    {
      name: 'Всего товаров',
      value: analytics.total_products,
      icon: ShoppingBag,
      color: 'blue'
    },
    {
      name: 'Категорий',
      value: analytics.total_categories,
      icon: BarChart3,
      color: 'purple'
    },
    {
      name: 'Просмотров',
      value: analytics.total_views,
      icon: Eye,
      color: 'green'
    },
    {
      name: 'Заявок на расчет',
      value: analytics.total_quote_requests,
      icon: FileText,
      color: 'orange'
    },
    {
      name: 'Обращений',
      value: analytics.total_contact_requests,
      icon: Users,
      color: 'pink'
    },
    {
      name: 'Конверсия',
      value: `${analytics.conversion_rate}%`,
      icon: TrendingUp,
      color: 'teal',
      suffix: ''
    }
  ];

  const getColorClass = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      purple: 'bg-purple-100 text-purple-600',
      green: 'bg-green-100 text-green-600',
      orange: 'bg-orange-100 text-orange-600',
      pink: 'bg-pink-100 text-pink-600',
      teal: 'bg-teal-100 text-teal-600'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Аналитика</h2>
          <p className="text-gray-600 mt-1">Статистика и популярные товары</p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Activity className="w-4 h-4" />
          Обновить
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {typeof stat.value === 'number' ? stat.value.toLocaleString('ru-RU') : stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${getColorClass(stat.color)}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Popular Products */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Популярные товары (по просмотрам)
        </h3>
        <div className="space-y-3">
          {analytics.popular_products.length > 0 ? (
            analytics.popular_products.map((product, index) => (
              <div
                key={product.product_id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-gray-400 w-6">
                    #{index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">{product.product_name}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      {product.article && (
                        <>
                          <span className="font-mono">Арт. {product.article}</span>
                          <span>•</span>
                        </>
                      )}
                      <span>{product.category_name}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Eye className="w-4 h-4" />
                  <span className="font-semibold">{product.views_count}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">Нет данных о просмотрах</p>
          )}
        </div>
      </div>

      {/* Popular Categories */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Популярные категории
        </h3>
        <div className="space-y-3">
          {analytics.popular_categories.length > 0 ? (
            analytics.popular_categories.map((category, index) => (
              <div
                key={category.category_id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-gray-400 w-6">
                    #{index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">{category.category_name}</p>
                    <p className="text-sm text-gray-500">
                      {category.products_count} {category.products_count === 1 ? 'товар' : 'товаров'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Eye className="w-4 h-4" />
                  <span className="font-semibold">{category.views_count}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">Нет данных о категориях</p>
          )}
        </div>
      </div>

      {/* Additional Info */}
      {analytics.quote_requests_pending > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-yellow-600" />
            <p className="text-yellow-800">
              <span className="font-semibold">{analytics.quote_requests_pending}</span>{' '}
              {analytics.quote_requests_pending === 1 ? 'заявка требует' : 'заявок требуют'} обработки
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
