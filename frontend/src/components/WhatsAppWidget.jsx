import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

const WhatsAppWidget = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);

  // WhatsApp configuration
  const phoneNumber = '79219492125'; // without + and spaces
  const message = encodeURIComponent('Здравствуйте, чем я могу Вам помочь?');
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  const handleClick = () => {
    window.open(whatsappUrl, '_blank');
  };

  const handleCloseTooltip = (e) => {
    e.stopPropagation();
    setShowTooltip(false);
  };

  return (
    <>
      {/* WhatsApp floating button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {/* Tooltip */}
        {showTooltip && (
          <div className="bg-white rounded-lg shadow-xl p-4 max-w-xs animate-fade-in relative">
            <button
              onClick={handleCloseTooltip}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Закрыть"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="pr-6">
              <p className="text-sm font-semibold text-navy mb-1">
                Нужна консультация?
              </p>
              <p className="text-xs text-gray-600">
                Напишите нам в WhatsApp - ответим в течение 5 минут! 💬
              </p>
            </div>
          </div>
        )}

        {/* Main button */}
        <button
          onClick={handleClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="group relative bg-navy hover:bg-navy-hover text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
          aria-label="Написать в WhatsApp"
        >
          {/* WhatsApp icon */}
          <svg
            className="w-8 h-8"
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>

          {/* Pulse animation */}
          <span className="absolute inset-0 rounded-full bg-navy animate-ping opacity-20"></span>

          {/* Notification badge (optional) */}
          <span className="absolute -top-1 -right-1 flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-5 w-5 bg-green-500 border-2 border-white"></span>
          </span>
        </button>

        {/* Hover tooltip */}
        {isHovered && (
          <div className="absolute bottom-full right-0 mb-2 whitespace-nowrap bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg animate-fade-in">
            Написать в WhatsApp
            <div className="absolute top-full right-4 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-gray-900"></div>
          </div>
        )}
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        @keyframes ping {
          75%, 100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        .animate-ping {
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </>
  );
};

export default WhatsAppWidget;
