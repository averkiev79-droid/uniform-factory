import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Image as ImageIcon, Trash2, Copy, Download, X, Loader2, Check, AlertCircle } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const UploadedImagesViewer = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [deletingFile, setDeletingFile] = useState(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/admin/uploaded-files`);
      setFiles(response.data.files || []);
    } catch (error) {
      console.error('Failed to fetch files:', error);
      setMessage({ type: 'error', text: 'Ошибка загрузки списка файлов' });
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyToClipboard = (url) => {
    const fullUrl = `${BACKEND_URL}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setMessage({ type: 'success', text: 'URL скопирован в буфер обмена' });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleDelete = async (filename) => {
    if (!window.confirm(`Удалить файл ${filename}?`)) return;

    try {
      setDeletingFile(filename);
      const response = await axios.delete(`${API}/admin/uploaded-files/${filename}`);
      
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Файл успешно удален' });
        await fetchFiles();
      }
    } catch (error) {
      console.error('Failed to delete file:', error);
      setMessage({ type: 'error', text: 'Ошибка удаления файла' });
    } finally {
      setDeletingFile(null);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-navy" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Загруженные изображения</h2>
          <p className="text-gray-600 mt-1">
            Всего файлов: {files.length} ({formatFileSize(files.reduce((sum, f) => sum + f.size, 0))})
          </p>
        </div>
        <button
          onClick={fetchFiles}
          className="bg-navy hover:bg-navy-hover text-white px-4 py-2 rounded-lg transition-colors"
        >
          Обновить
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

      {/* Gallery */}
      {files.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
          <p>Нет загруженных файлов</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {files.map((file) => (
            <div
              key={file.filename}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Image preview */}
              <div
                className="aspect-square bg-gray-100 cursor-pointer relative group"
                onClick={() => setSelectedImage(file)}
              >
                <img
                  src={`${BACKEND_URL}${file.url}`}
                  alt={file.filename}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              {/* File info */}
              <div className="p-3 space-y-2">
                <div className="text-xs font-mono text-gray-600 truncate" title={file.filename}>
                  {file.filename}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{formatFileSize(file.size)}</span>
                  <span>{formatDate(file.modified)}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => copyToClipboard(file.url)}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                    title="Копировать URL"
                  >
                    <Copy className="w-3 h-3" />
                    URL
                  </button>
                  <a
                    href={`${BACKEND_URL}${file.url}`}
                    download={file.filename}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs bg-green-50 text-green-600 hover:bg-green-100 rounded transition-colors"
                    title="Скачать"
                  >
                    <Download className="w-3 h-3" />
                    Скачать
                  </a>
                  <button
                    onClick={() => handleDelete(file.filename)}
                    disabled={deletingFile === file.filename}
                    className="flex items-center justify-center gap-1 px-2 py-1.5 text-xs bg-red-50 text-red-600 hover:bg-red-100 rounded transition-colors disabled:opacity-50"
                    title="Удалить"
                  >
                    {deletingFile === file.filename ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Trash2 className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full image modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
          >
            <X className="w-8 h-8" />
          </button>
          <div className="max-w-6xl max-h-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={`${BACKEND_URL}${selectedImage.url}`}
              alt={selectedImage.filename}
              className="max-w-full max-h-[90vh] object-contain"
            />
            <div className="text-white text-center mt-4 space-y-1">
              <div className="font-mono text-sm">{selectedImage.filename}</div>
              <div className="text-xs text-gray-400">
                {formatFileSize(selectedImage.size)} • {formatDate(selectedImage.modified)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-2 text-sm text-blue-900">
            <p className="font-medium">Информация:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-800">
              <li>Нажмите на изображение для просмотра в полном размере</li>
              <li>Кнопка "URL" копирует полную ссылку на изображение</li>
              <li>Используйте скопированный URL в разделе "Изображения главной"</li>
              <li>Удаленные файлы невозможно восстановить</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadedImagesViewer;
