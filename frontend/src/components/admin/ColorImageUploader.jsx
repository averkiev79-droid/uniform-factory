import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Upload, X, Crop, Check } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ColorImageUploader = ({ colorData, onUpdate, onRemove }) => {
  const [uploading, setUploading] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Show image in cropper
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setImageSrc(reader.result);
      setShowCropper(true);
    });
    reader.readAsDataURL(file);
  };

  const handleCropSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    setUploading(true);
    try {
      // Convert base64 to blob
      const response = await fetch(imageSrc);
      const blob = await response.blob();

      // Upload original image
      const formData = new FormData();
      formData.append('file', blob, 'color-image.jpg');

      const uploadResponse = await axios.post(`${BACKEND_URL}/api/admin/upload-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const fullImageUrl = `${BACKEND_URL}${uploadResponse.data.url}`;

      // Create cropped preview (we'll store crop coordinates and create preview on display)
      // For simplicity, we'll just use the full image and store crop coordinates
      onUpdate({
        ...colorData,
        image: fullImageUrl,
        preview: fullImageUrl, // Same for now, can implement server-side crop later
        cropData: croppedAreaPixels
      });

      setShowCropper(false);
      setImageSrc(null);
      alert('Изображение загружено успешно');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Ошибка загрузки изображения');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div 
            className="w-8 h-8 rounded border-2 border-gray-300" 
            style={{ backgroundColor: colorData.color || '#ccc' }}
          ></div>
          <span className="font-medium">{colorData.color}</span>
        </div>
        <button
          onClick={onRemove}
          className="text-red-600 hover:text-red-700"
          title="Удалить цвет"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {colorData.image ? (
        <div className="space-y-2">
          <img 
            src={colorData.image} 
            alt={colorData.color}
            className="w-full h-32 object-cover rounded border"
          />
          <button
            onClick={() => onUpdate({ ...colorData, image: null, preview: null })}
            className="text-sm text-red-600 hover:text-red-700"
          >
            Удалить изображение
          </button>
        </div>
      ) : (
        <label className="block cursor-pointer">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 transition-colors">
            <div className="text-center">
              <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
              <span className="text-sm text-gray-600">Загрузить фото</span>
            </div>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
      )}

      {/* Cropper Modal */}
      {showCropper && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">Выберите область для превью</h3>
            </div>

            <div className="relative h-96 bg-gray-900">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="text-sm text-gray-600">Масштаб</label>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setShowCropper(false);
                    setImageSrc(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                  disabled={uploading}
                >
                  Отмена
                </button>
                <button
                  onClick={handleCropSave}
                  disabled={uploading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  {uploading ? 'Загрузка...' : 'Сохранить'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorImageUploader;
