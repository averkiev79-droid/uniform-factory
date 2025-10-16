import React, { useState, useEffect } from 'react';
import { X, Cookie } from 'lucide-react';
import { Button } from './ui/button';

export const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Check if user has already accepted/declined cookies
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      // Show banner after a short delay for better UX
      setTimeout(() => {
        setIsVisible(true);
      }, 1000);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setIsVisible(false);
    
    // Here you can initialize analytics or other tracking services
    console.log('Cookies accepted');
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setIsVisible(false);
    
    console.log('Cookies declined');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
      <div className="bg-white border-t-2 border-navy shadow-2xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            {/* Icon and Message */}
            <div className="flex items-start gap-4 flex-1">
              <div className="flex-shrink-0 bg-navy/10 p-3 rounded-lg">
                <Cookie className="w-6 h-6 text-navy" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Мы используем файлы cookie
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Мы используем файлы cookie для улучшения работы сайта, анализа трафика и персонализации контента. 
                  Продолжая использовать наш сайт, вы соглашаетесь с использованием файлов cookie.
                  {!showDetails && (
                    <button
                      onClick={() => setShowDetails(true)}
                      className="text-navy hover:underline ml-1 font-medium"
                    >
                      Подробнее
                    </button>
                  )}
                </p>

                {/* Detailed Information */}
                {showDetails && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg text-xs text-gray-600 space-y-2">
                    <div>
                      <strong className="text-gray-900">Необходимые cookies:</strong> Обеспечивают базовую функциональность сайта (сохранение избранного, предпочтения языка).
                    </div>
                    <div>
                      <strong className="text-gray-900">Аналитические cookies:</strong> Помогают понять, как посетители взаимодействуют с сайтом (анонимная статистика посещений).
                    </div>
                    <div>
                      <strong className="text-gray-900">Маркетинговые cookies:</strong> Используются для показа релевантной рекламы и отслеживания эффективности рекламных кампаний.
                    </div>
                    <button
                      onClick={() => setShowDetails(false)}
                      className="text-navy hover:underline font-medium"
                    >
                      Скрыть детали
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <Button
                variant="outline"
                onClick={handleDecline}
                className="flex-1 lg:flex-none"
              >
                Отклонить
              </Button>
              <Button
                onClick={handleAccept}
                className="flex-1 lg:flex-none bg-navy hover:bg-navy-hover text-white"
              >
                Принять все
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
