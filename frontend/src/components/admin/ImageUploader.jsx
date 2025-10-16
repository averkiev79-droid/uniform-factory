import React, { useState } from 'react';
import { Upload, Image, Copy, Check, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export const ImageUploader = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        setError('');
      } else {
        setError('Выберите изображение (JPG, PNG, GIF, WebP)');
        setSelectedFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/upload-image`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        const fullUrl = `${process.env.REACT_APP_BACKEND_URL}${data.url}`;
        setUploadedUrl(fullUrl);
        setSelectedFile(null);
        // Reset file input
        document.getElementById('file-upload').value = '';
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Ошибка загрузки файла');
      }
    } catch (err) {
      setError('Ошибка подключения к серверу');
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(uploadedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = uploadedUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const clearResult = () => {
    setUploadedUrl('');
    setError('');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Загрузка изображений</h1>
      
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="mr-2 w-5 h-5" />
            Загрузить новое изображение
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
              <span>{error}</span>
              <Button variant="ghost" size="sm" onClick={() => setError('')}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* File Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            
            <label htmlFor="file-upload" className="cursor-pointer">
              <span className="text-lg font-medium text-gray-900">
                Выберите изображение
              </span>
              <span className="block text-sm text-gray-600 mt-1">
                JPG, PNG, GIF, WebP до 10MB
              </span>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
              />
            </label>
          </div>

          {selectedFile && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Выбранный файл:</h4>
                <div className="flex items-center space-x-3">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Image className="w-6 h-6 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-gray-600">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button 
                  onClick={handleUpload}
                  disabled={uploading}
                  className="bg-navy hover:bg-navy-hover"
                >
                  {uploading ? 'Загрузка...' : 'Загрузить изображение'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSelectedFile(null);
                    document.getElementById('file-upload').value = '';
                  }}
                >
                  Отмена
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {uploadedUrl && (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center text-green-600">
              <Check className="mr-2 w-5 h-5" />
              Изображение успешно загружено!
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Preview */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3">Предварительный просмотр:</h4>
              <div className="max-w-xs">
                <img 
                  src={uploadedUrl} 
                  alt="Uploaded" 
                  className="w-full h-auto rounded-lg shadow-sm"
                  onError={() => setError('Ошибка загрузки изображения')}
                />
              </div>
            </div>

            {/* URL */}
            <div>
              <h4 className="font-medium mb-2">URL для использования:</h4>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={uploadedUrl}
                  readOnly
                  className="flex-1 p-3 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                />
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  className={copied ? 'text-green-600' : ''}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              {copied && (
                <p className="text-sm text-green-600 mt-1">URL скопирован в буфер обмена!</p>
              )}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Как использовать:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Скопируйте URL выше</li>
                <li>• Используйте его в формах для категорий или портфолио</li>
                <li>• Изображение доступно по этому адресу постоянно</li>
              </ul>
            </div>

            <Button variant="outline" onClick={clearResult}>
              Загрузить другое изображение
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Инструкция по загрузке изображений</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>1. Выберите изображение:</strong> Поддерживаются JPG, PNG, GIF, WebP</p>
            <p><strong>2. Загрузите файл:</strong> Изображение сохранится на сервере</p>
            <p><strong>3. Скопируйте URL:</strong> Используйте ссылку в категориях и портфолио</p>
            <p><strong>4. Рекомендуемые размеры:</strong></p>
            <ul className="ml-4 space-y-1">
              <li>• Категории: 400x300px (соотношение 4:3)</li>
              <li>• Портфолио: 500x400px (соотношение 5:4)</li>
              <li>• Максимальный размер файла: 10MB</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};