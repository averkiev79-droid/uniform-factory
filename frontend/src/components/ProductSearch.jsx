import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

const ProductSearch = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchProducts = async () => {
      if (query.trim().length < 1) {
        setResults([]);
        setShowResults(false);
        return;
      }

      setLoading(true);
      setShowResults(true);
      try {
        const data = await apiService.searchProducts({ q: query, limit: 10 });
        setResults(data);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchProducts, 150);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim().length >= 2) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
      setShowResults(false);
      if (onClose) onClose();
    }
  };

  const handleProductClick = (productId) => {
    // Сохраняем поисковый запрос для показа похожих товаров
    sessionStorage.setItem('searchQuery', query);
    sessionStorage.setItem('searchResults', JSON.stringify(results));
    navigate(`/product/${productId}`);
    setQuery('');
    setShowResults(false);
    if (onClose) onClose();
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto" ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по названию или артикулу..."
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {showResults && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Поиск...</span>
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleProductClick(product.id)}
                  className="w-full px-4 py-3 hover:bg-gray-50 flex items-center gap-4 text-left transition-colors border-b border-gray-100 last:border-b-0"
                >
                  {product.images && product.images.length > 0 && product.images[0]?.image_url ? (
                    <img
                      src={product.images[0].image_url}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded-lg shadow-sm"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/images/about-factory.jpg';
                      }}
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gradient-to-br from-navy to-blue-500 rounded-lg flex items-center justify-center shadow-sm">
                      <span className="text-white text-2xl font-bold">
                        {product.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 truncate">{product.name}</div>
                    <div className="flex items-center gap-2 text-sm mt-1">
                      {product.article && (
                        <span className="font-mono font-semibold text-navy bg-blue-50 px-2 py-0.5 rounded">
                          {product.article}
                        </span>
                      )}
                      <span className="text-gray-500">{product.category_name}</span>
                    </div>
                    <div className="text-base font-bold text-blue-600 mt-1">
                      от {product.price_from.toLocaleString('ru-RU')} ₽
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : query.length >= 2 ? (
            <div className="py-8 text-center text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Ничего не найдено</p>
              <p className="text-sm mt-1">Попробуйте изменить запрос</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default ProductSearch;
