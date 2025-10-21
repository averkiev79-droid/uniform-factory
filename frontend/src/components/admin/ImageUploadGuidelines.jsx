import React from 'react';
import { Info, Image, CheckCircle } from 'lucide-react';

export const ImageUploadGuidelines = ({ type = 'product' }) => {
  const guidelines = {
    product: {
      title: 'Рекомендации для фото товаров',
      items: [
        { icon: '📏', text: 'Размер: 800x800px или больше (квадрат)', important: true },
        { icon: '📐', text: 'Соотношение сторон: 1:1 (квадрат) или 4:5', important: true },
        { icon: '📊', text: 'Разрешение: минимум 72 DPI, рекомендуется 150 DPI' },
        { icon: '🖼️', text: 'Форматы: JPG, PNG, WEBP' },
        { icon: '💾', text: 'Размер файла: до 10 MB' },
        { icon: '✨', text: 'Фон: белый или нейтральный для лучшего восприятия' },
        { icon: '📸', text: 'Качество: четкие, хорошо освещенные фотографии' },
      ]
    },
    general: {
      title: 'Рекомендации для изображений',
      items: [
        { icon: '📏', text: 'Размер: минимум 1200x800px', important: true },
        { icon: '📐', text: 'Соотношение: 3:2 или 16:9 для баннеров' },
        { icon: '🖼️', text: 'Форматы: JPG, PNG, WEBP' },
        { icon: '💾', text: 'Размер файла: до 10 MB' },
        { icon: '✨', text: 'Оптимизируйте изображения перед загрузкой' },
      ]
    },
    category: {
      title: 'Рекомендации для изображений категорий',
      items: [
        { icon: '📏', text: 'Размер: 600x400px или больше', important: true },
        { icon: '📐', text: 'Соотношение сторон: 3:2 (прямоугольник)' },
        { icon: '🖼️', text: 'Форматы: JPG, PNG, WEBP' },
        { icon: '💾', text: 'Размер файла: до 5 MB' },
        { icon: '✨', text: 'Используйте яркие, привлекающие внимание изображения' },
      ]
    }
  };

  const currentGuideline = guidelines[type] || guidelines.general;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">
            {currentGuideline.title}
          </h4>
          <ul className="space-y-1.5">
            {currentGuideline.items.map((item, index) => (
              <li 
                key={index} 
                className={`text-sm flex items-start gap-2 ${
                  item.important ? 'text-blue-900 font-medium' : 'text-blue-800'
                }`}
              >
                <span className="text-base leading-none">{item.icon}</span>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
          
          <div className="mt-3 pt-3 border-t border-blue-200">
            <p className="text-xs text-blue-700 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              <span>Совет: Используйте онлайн-инструменты для оптимизации изображений перед загрузкой</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadGuidelines;
