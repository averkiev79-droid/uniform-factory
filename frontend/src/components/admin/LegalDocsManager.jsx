import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SimpleMDE from 'react-simplemde-editor';
import 'easymde/dist/easymde.min.css';
import { Save, FileText, Loader2, Check, AlertCircle } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const LegalDocsManager = () => {
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const docTypes = [
    { type: 'privacy_policy', name: 'Политика конфиденциальности', icon: '🔒' },
    { type: 'user_agreement', name: 'Пользовательское соглашение', icon: '📋' },
    { type: 'company_details', name: 'Реквизиты компании', icon: '🏢' }
  ];

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/admin/legal-documents`);
      setDocuments(response.data.documents || []);
      if (response.data.documents && response.data.documents.length > 0) {
        loadDocument(response.data.documents[0].doc_type);
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      setMessage({ type: 'error', text: 'Ошибка загрузки документов' });
    } finally {
      setLoading(false);
    }
  };

  const loadDocument = async (docType) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/admin/legal-documents/${docType}`);
      setSelectedDoc(docType);
      setTitle(response.data.title);
      setContent(response.data.content);
      setMessage({ type: '', text: '' });
    } catch (error) {
      console.error('Failed to load document:', error);
      setMessage({ type: 'error', text: 'Ошибка загрузки документа' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedDoc) return;

    try {
      setSaving(true);
      setMessage({ type: '', text: '' });

      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);

      const response = await axios.put(
        `${API}/admin/legal-documents/${selectedDoc}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Документ успешно сохранен!' });
        await fetchDocuments();
      }
    } catch (error) {
      console.error('Failed to save document:', error);
      setMessage({ type: 'error', text: 'Ошибка сохранения документа' });
    } finally {
      setSaving(false);
    }
  };

  if (loading && !selectedDoc) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-navy" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Юридические документы</h2>
        <p className="text-gray-600 mt-1">
          Редактирование документов сайта (Markdown формат)
        </p>
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Document selector */}
        <div className="lg:col-span-1 space-y-2">
          <h3 className="font-semibold text-gray-900 mb-3">Выберите документ</h3>
          {docTypes.map(doc => (
            <button
              key={doc.type}
              onClick={() => loadDocument(doc.type)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                selectedDoc === doc.type
                  ? 'border-navy bg-navy text-white'
                  : 'border-gray-200 hover:border-navy hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{doc.icon}</span>
                <div className="flex-1">
                  <div className="font-medium text-sm">{doc.name}</div>
                  <div className={`text-xs ${selectedDoc === doc.type ? 'text-white/80' : 'text-gray-500'}`}>
                    {doc.type}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Editor */}
        <div className="lg:col-span-3 space-y-4">
          {selectedDoc ? (
            <>
              {/* Title input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Заголовок документа
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent"
                  placeholder="Введите заголовок"
                />
              </div>

              {/* Markdown editor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Содержимое (Markdown)
                </label>
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <SimpleMDE
                    value={content}
                    onChange={setContent}
                    options={{
                      spellChecker: false,
                      placeholder: 'Введите содержимое документа в формате Markdown...',
                      status: false,
                      toolbar: [
                        'bold', 'italic', 'heading', '|',
                        'quote', 'unordered-list', 'ordered-list', '|',
                        'link', 'table', '|',
                        'preview', 'side-by-side', 'fullscreen', '|',
                        'guide'
                      ],
                      minHeight: '400px'
                    }}
                  />
                </div>
              </div>

              {/* Save button */}
              <div className="flex justify-end">
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
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <FileText className="w-16 h-16 mb-4 opacity-50" />
              <p>Выберите документ для редактирования</p>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-2 text-sm text-blue-900">
            <p className="font-medium">О Markdown формате:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-800">
              <li># Заголовок 1, ## Заголовок 2, ### Заголовок 3</li>
              <li>**жирный текст**, *курсив*</li>
              <li>- маркированный список, 1. нумерованный список</li>
              <li>[текст ссылки](url) для создания ссылок</li>
              <li>| таблица | с | колонками | для структурированных данных</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalDocsManager;
