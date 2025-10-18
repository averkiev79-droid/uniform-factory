import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, Loader2 } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const PrivacyPolicyPage = () => {
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocument();
  }, []);

  const fetchDocument = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/legal/privacy_policy`);
      setDocument(response.data);
    } catch (error) {
      console.error('Failed to fetch document:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-navy" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-navy hover:text-navy-hover mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Назад</span>
        </button>

        <div className="bg-white rounded-lg shadow-sm p-8 lg:p-12">
          {document ? (
            <>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                {document.title}
              </h1>
              <p className="text-sm text-gray-500 mb-8">
                Последнее обновление: {new Date(document.updated_at).toLocaleDateString('ru-RU')}
              </p>
              <div className="prose prose-lg max-w-none">
                <ReactMarkdown>{document.content}</ReactMarkdown>
              </div>
            </>
          ) : (
            <p className="text-gray-600">Документ не найден</p>
          )}
        </div>
      </div>
    </div>
  );
};
