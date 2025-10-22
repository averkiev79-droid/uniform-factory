import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { apiService } from '../services/api';
import SEO from '../components/SEO';

export const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query || query.length < 2) {
        setResults([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await apiService.searchProducts(query, 50);
        setResults(data);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title={`Поиск: ${query} - Фабрика Спецодежды`}
        description={`Результаты поиска по запросу "${query}". Найдено ${results.length} товаров.`}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Результаты поиска
          </h1>
          <p className="text-gray-600">
            По запросу "<span className="font-semibold">{query}</span>" найдено {results.length} товаров
          </p>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Поиск товаров...</p>
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {results.map((product) => (
              <div
                key={product.id}
                onClick={() => navigate(`/product/${product.id}`)}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer group"
              >
                {/* Image */}
                <div className="aspect-square overflow-hidden rounded-t-lg bg-gray-100">
                  {product.images && product.images.length > 0 && product.images[0]?.image_url ? (
                    <img
                      src={product.images[0].image_url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/images/about-factory.jpg';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-navy to-blue-500 flex items-center justify-center">
                      <span className="text-white text-4xl font-bold">
                        {product.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-navy transition-colors min-h-[3rem]">
                    {product.name}
                  </h3>
                  
                  {product.article && (
                    <p className="text-sm font-semibold text-navy font-mono mt-2">
                      Артикул: {product.article}
                    </p>
                  )}

                  <p className="text-sm text-gray-600 mt-1">
                    {product.category_name}
                  </p>
                  
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-lg font-bold text-navy">
                      от {product.price_from.toLocaleString()} ₽
                    </span>
                  </div>

                  {/* Status badges */}
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {product.on_order && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-semibold">
                        Под заказ
                      </span>
                    )}
                    {product.featured && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded font-semibold">
                        Популярное
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Ничего не найдено
            </h3>
            <p className="text-gray-500 mb-6">
              По запросу "{query}" товары не найдены
            </p>
            <Button onClick={() => navigate('/')}>
              Вернуться на главную
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage;
