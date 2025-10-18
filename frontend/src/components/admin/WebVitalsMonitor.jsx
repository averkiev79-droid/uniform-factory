import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Zap, Eye, MousePointer, Clock, TrendingUp, AlertCircle } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const WebVitalsMonitor = () => {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    cls: { avg: 0, rating: 'good' },
    inp: { avg: 0, rating: 'good' },
    fcp: { avg: 0, rating: 'good' },
    lcp: { avg: 0, rating: 'good' },
    ttfb: { avg: 0, rating: 'good' }
  });

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/admin/web-vitals`);
      setMetrics(response.data.metrics || []);
      calculateStats(response.data.metrics || []);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (metricsData) => {
    const grouped = {
      CLS: [],
      INP: [],
      FCP: [],
      LCP: [],
      TTFB: []
    };

    metricsData.forEach(metric => {
      if (grouped[metric.name]) {
        grouped[metric.name].push(metric.value);
      }
    });

    const newStats = {};
    Object.keys(grouped).forEach(key => {
      const values = grouped[key];
      if (values.length > 0) {
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        newStats[key.toLowerCase()] = {
          avg: avg.toFixed(2),
          rating: getRating(key, avg)
        };
      }
    });

    setStats(prev => ({ ...prev, ...newStats }));
  };

  const getRating = (metricName, value) => {
    const thresholds = {
      CLS: { good: 0.1, poor: 0.25 },
      INP: { good: 200, poor: 500 },
      FCP: { good: 1800, poor: 3000 },
      LCP: { good: 2500, poor: 4000 },
      TTFB: { good: 800, poor: 1800 }
    };

    const threshold = thresholds[metricName];
    if (!threshold) return 'good';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  };

  const getRatingColor = (rating) => {
    switch (rating) {
      case 'good': return 'text-green-600 bg-green-50 border-green-200';
      case 'needs-improvement': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'poor': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRatingText = (rating) => {
    switch (rating) {
      case 'good': return 'Отлично';
      case 'needs-improvement': return 'Требует улучшения';
      case 'poor': return 'Плохо';
      default: return 'Нет данных';
    }
  };

  const metricCards = [
    {
      key: 'cls',
      name: 'CLS',
      title: 'Cumulative Layout Shift',
      description: 'Визуальная стабильность',
      icon: Eye,
      unit: '',
      info: 'Измеряет стабильность макета. Значение < 0.1 считается хорошим.'
    },
    {
      key: 'fid',
      name: 'FID',
      title: 'First Input Delay',
      description: 'Время до первого взаимодействия',
      icon: MousePointer,
      unit: 'мс',
      info: 'Время ответа на первое взаимодействие пользователя. < 100мс хорошо.'
    },
    {
      key: 'fcp',
      name: 'FCP',
      title: 'First Contentful Paint',
      description: 'Время до первого контента',
      icon: Zap,
      unit: 'мс',
      info: 'Время до отрисовки первого контента. < 1.8с хорошо.'
    },
    {
      key: 'lcp',
      name: 'LCP',
      title: 'Largest Contentful Paint',
      description: 'Время загрузки основного контента',
      icon: Activity,
      unit: 'мс',
      info: 'Время до отрисовки самого большого элемента. < 2.5с хорошо.'
    },
    {
      key: 'ttfb',
      name: 'TTFB',
      title: 'Time to First Byte',
      description: 'Время до первого байта',
      icon: Clock,
      unit: 'мс',
      info: 'Время ответа сервера. < 800мс хорошо.'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Web Vitals - Мониторинг производительности</h2>
          <p className="text-gray-600 mt-1">
            Отслеживание скорости загрузки и пользовательского опыта
          </p>
        </div>
        <button
          onClick={fetchMetrics}
          className="bg-navy hover:bg-navy-hover text-white px-4 py-2 rounded-lg transition-colors"
        >
          Обновить
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metricCards.map(card => {
          const Icon = card.icon;
          const stat = stats[card.key] || { avg: 0, rating: 'good' };
          
          return (
            <div
              key={card.key}
              className={`bg-white rounded-lg border-2 p-6 ${getRatingColor(stat.rating)}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${getRatingColor(stat.rating)}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{card.name}</h3>
                    <p className="text-sm opacity-75">{card.description}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-bold">
                    {stat.avg}{card.unit}
                  </span>
                  <span className={`text-sm font-medium px-3 py-1 rounded-full ${getRatingColor(stat.rating)}`}>
                    {getRatingText(stat.rating)}
                  </span>
                </div>

                <div className="flex items-start gap-2 pt-3 border-t">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 opacity-50" />
                  <p className="text-xs opacity-75">{card.info}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Yandex.Metrika Integration Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex gap-4">
          <TrendingUp className="w-6 h-6 text-blue-600 flex-shrink-0" />
          <div className="space-y-2">
            <h3 className="font-semibold text-blue-900">Интеграция с Яндекс.Метрикой</h3>
            <p className="text-sm text-blue-800">
              Все метрики Web Vitals также отправляются в Яндекс.Метрику (ID: 45908091) для дополнительного анализа. 
              Вы можете просматривать детальную статистику в личном кабинете Метрики.
            </p>
            <a
              href="https://metrika.yandex.ru/dashboard?id=45908091"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 mt-2"
            >
              Открыть Яндекс.Метрику
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-3">О метриках</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
          <div>
            <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span>
            <strong>Отлично:</strong> Оптимальная производительность
          </div>
          <div>
            <span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>
            <strong>Требует улучшения:</strong> Средняя производительность
          </div>
          <div>
            <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-2"></span>
            <strong>Плохо:</strong> Требуется оптимизация
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebVitalsMonitor;
