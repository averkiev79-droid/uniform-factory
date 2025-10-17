import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, Save, Image as ImageIcon, Loader2, Check, AlertCircle, FolderOpen } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ImageManager = () => {
  const [settings, setSettings] = useState({
    hero_image: '/images/hero-main.jpg',
    hero_mobile_image: '',
    about_image: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Input mode: 'path' or 'upload'
  const [inputMode, setInputMode] = useState({
    hero_image: 'path',
    hero_mobile_image: 'path',
    about_image: 'path'
  });

  // Helper function to get full image URL
  const getImageUrl = (path) => {
    if (!path) return '';
    // If path starts with /api/, it's an uploaded file - use BACKEND_URL
    if (path.startsWith('/api/')) {
      return `${BACKEND_URL}${path}`;
    }
    // Otherwise it's a local file in public folder
    return path;
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/admin/settings`);
      setSettings({
        hero_image: response.data.hero_image || '/images/hero-main.jpg',
        hero_mobile_image: response.data.hero_mobile_image || '',
        about_image: response.data.about_image || ''
      });
      setMessage({ type: '', text: '' });
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      setMessage({ type: 'error', text: 'Ошибка загрузки настроек' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = async (field, file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Пожалуйста, выберите изображение' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Размер файла не должен превышать 5MB' });
      return;
    }

    try {
      setUploadingField(field);
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API}/admin/upload-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        handleInputChange(field, response.data.url);
        setMessage({ type: 'success', text: 'Файл загружен успешно' });
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
      setMessage({ type: 'error', text: 'Ошибка загрузки файла' });
    } finally {
      setUploadingField(null);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });

      const formData = new FormData();
      formData.append('hero_image', settings.hero_image);
      if (settings.hero_mobile_image) {
        formData.append('hero_mobile_image', settings.hero_mobile_image);
      }
      if (settings.about_image) {
        formData.append('about_image', settings.about_image);
      }

      const response = await axios.put(`${API}/admin/settings`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Настройки сохранены успешно!' });
        await fetchSettings();
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      setMessage({ type: 'error', text: 'Ошибка сохранения настроек' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-navy" />
      </div>
    );
  }

  const renderImageField = (field, label, description) => {
    const isUploading = uploadingField === field;
    const mode = inputMode[field];

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{label}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>

        {/* Mode selector */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setInputMode(prev => ({ ...prev, [field]: 'path' }))}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              mode === 'path'
                ? 'bg-navy text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FolderOpen className="w-4 h-4 inline mr-2" />
            Указать путь
          </button>
          <button
            type="button"
            onClick={() => setInputMode(prev => ({ ...prev, [field]: 'upload' }))}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              mode === 'upload'
                ? 'bg-navy text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Upload className="w-4 h-4 inline mr-2" />
            Загрузить файл
          </button>
        </div>

        {/* Input based on mode */}
        {mode === 'path' ? (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Путь к изображению
            </label>
            <input
              type="text"
              value={settings[field]}
              onChange={(e) => handleInputChange(field, e.target.value)}
              placeholder="/images/hero-main.jpg"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent"
            />
            <p className="text-xs text-gray-500">
              Например: /images/hero-main.jpg или /uploads/filename.jpg
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Выберите файл
            </label>
            <div className="flex items-center gap-3">
              <label className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(field, e.target.files[0])}
                  className="hidden"
                  disabled={isUploading}
                />
                <div className={`w-full px-4 py-3 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${
                  isUploading
                    ? 'bg-gray-50 border-gray-300 cursor-not-allowed'
                    : 'border-gray-300 hover:border-navy hover:bg-gray-50'
                }`}>
                  {isUploading ? (
                    <div className="flex items-center justify-center gap-2 text-gray-500">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Загрузка...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-gray-600">
                      <Upload className="w-5 h-5" />
                      <span>Нажмите для выбора файла</span>
                    </div>
                  )}
                </div>
              </label>
            </div>
            <p className="text-xs text-gray-500">
              Максимальный размер: 5MB. Форматы: JPG, PNG, WebP
            </p>
          </div>
        )}

        {/* Image preview */}
        {settings[field] && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Текущее изображение
            </label>
            <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={getImageUrl(settings[field])}
                alt={label}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3EНет изображения%3C/text%3E%3C/svg%3E';
                }}
              />
            </div>
            <p className="text-xs text-gray-600">
              <strong>Путь:</strong> {settings[field]}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Управление изображениями</h2>
          <p className="text-gray-600 mt-1">
            Настройте изображения для главной страницы
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-navy hover:bg-navy-hover text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Сохранение...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Сохранить изменения
            </>
          )}
        </button>
      </div>

      {/* Message */}
      {message.text && (
        <div
          className={`p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {message.type === 'success' ? (
            <Check className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <p className="font-medium">{message.text}</p>
        </div>
      )}

      {/* Image fields */}
      <div className="space-y-6">
        {renderImageField(
          'hero_image',
          'Главное изображение Hero',
          'Изображение в главной секции сайта (рекомендуемый размер: 1920x1080)'
        )}

        {renderImageField(
          'hero_mobile_image',
          'Мобильное изображение Hero (опционально)',
          'Отдельное изображение для мобильных устройств'
        )}

        {renderImageField(
          'about_image',
          'Изображение страницы "О нас" (опционально)',
          'Изображение для страницы "О компании"'
        )}
      </div>

      {/* Additional info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <ImageIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-2 text-sm text-blue-900">
            <p className="font-medium">Управление изображениями категорий и портфолио:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-800">
              <li>Изображения категорий редактируются в разделе "Категории"</li>
              <li>Изображения портфолио редактируются в разделе "Портфолио"</li>
              <li>Все изображения можно загружать или указывать путь к существующим файлам</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageManager;
