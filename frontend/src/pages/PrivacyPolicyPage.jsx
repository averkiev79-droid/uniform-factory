import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
              <div className="prose prose-lg prose-slate max-w-none 
                prose-headings:text-gray-900 prose-headings:font-bold
                prose-h1:text-3xl prose-h1:mb-6 prose-h1:mt-8
                prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-6
                prose-h3:text-xl prose-h3:mb-3 prose-h3:mt-4
                prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4 prose-p:whitespace-pre-wrap
                prose-ul:list-disc prose-ul:ml-6 prose-ul:mb-4 prose-ul:space-y-2
                prose-ol:list-decimal prose-ol:ml-6 prose-ol:mb-4 prose-ol:space-y-2
                prose-li:mb-2 prose-li:leading-relaxed
                prose-strong:text-gray-900 prose-strong:font-semibold
                prose-table:w-full prose-table:border-collapse prose-table:my-6
                prose-th:bg-gray-100 prose-th:p-3 prose-th:text-left prose-th:font-semibold prose-th:border prose-th:border-gray-300
                prose-td:p-3 prose-td:border prose-td:border-gray-300 prose-td:align-top
                prose-tr:even:bg-gray-50
                prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
              " style={{ whiteSpace: 'pre-wrap' }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{document.content}</ReactMarkdown>
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
