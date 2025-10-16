import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { apiService } from '../services/api';

export const FavoritesPage = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const favoriteIds = JSON.parse(localStorage.getItem('favorites') || '[]');
        setFavorites(favoriteIds);

        if (favoriteIds.length > 0) {
          // Fetch all products and filter favorites
          const allProducts = await apiService.getAllProducts();
          const favoriteProducts = allProducts.filter(p => favoriteIds.includes(p.id));
          setProducts(favoriteProducts);
        }
      } catch (error) {
        console.error('Error fetching favorites:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();

    // Listen for storage changes (when favorites are updated from another tab/page)
    const handleStorageChange = () => {
      fetchFavorites();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('favoriteUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('favoriteUpdated', handleStorageChange);
    };
  }, []);

  const removeFavorite = (productId) => {
    const newFavorites = favorites.filter(id => id !== productId);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    setFavorites(newFavorites);
    setProducts(products.filter(p => p.id !== productId));
    
    // Dispatch event to notify other components
    window.dispatchEvent(new Event('favoriteUpdated'));
  };

  const clearAllFavorites = () => {
    if (window.confirm('Вы уверены, что хотите очистить все избранное?')) {
      localStorage.setItem('favorites', JSON.stringify([]));
      setFavorites([]);
      setProducts([]);
      window.dispatchEvent(new Event('favoriteUpdated'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка избранного...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center">
                <Heart className="w-8 h-8 mr-3 text-red-500 fill-red-500" />
                Избранное
              </h1>
              <p className="text-gray-600 mt-1">
                Ваши любимые товары ({products.length})
              </p>
            </div>
            {products.length > 0 && (
              <Button
                variant="outline"
                onClick={clearAllFavorites}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Очистить все
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-8">
        {products.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-24 h-24 mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Избранное пусто
            </h2>
            <p className="text-gray-600 mb-6">
              Добавьте товары в избранное, чтобы не потерять их
            </p>
            <Button 
              onClick={() => navigate('/catalog')}
              className="bg-navy hover:bg-navy-hover"
            >
              Перейти в каталог
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card 
                key={product.id}
                className="group hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden relative"
              >
                {/* Remove button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFavorite(product.id);
                  }}
                  className="absolute top-3 right-3 z-10 bg-white/90 hover:bg-white p-2 rounded-full shadow-md transition-all"
                  title="Удалить из избранного"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>

                <div 
                  className="relative"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  {/* Main Image */}
                  <div className="aspect-square overflow-hidden bg-gray-100 flex items-center justify-center">
                    <img
                      src={product.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop'}
                      alt={product.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/400x400/e5e7eb/9ca3af?text=' + encodeURIComponent(product.name.substring(0, 20));
                      }}
                    />
                  </div>
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {product.featured && (
                      <Badge className="bg-navy text-white">
                        Популярное
                      </Badge>
                    )}
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h3 
                      className="font-semibold text-gray-900 line-clamp-2 group-hover:text-navy transition-colors cursor-pointer"
                      onClick={() => navigate(`/product/${product.id}`)}
                    >
                      {product.name}
                    </h3>
                    
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {product.short_description || product.description}
                    </p>

                    {/* Characteristics */}
                    {product.material && (
                      <div className="flex items-center text-xs text-gray-500">
                        <span className="font-medium">Материал:</span>
                        <span className="ml-1">{product.material}</span>
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <span className="text-lg font-bold text-navy">
                          от {product.price_from.toLocaleString()} ₽
                        </span>
                        {product.price_to && product.price_to !== product.price_from && (
                          <span className="text-sm text-gray-500 ml-1">
                            до {product.price_to.toLocaleString()} ₽
                          </span>
                        )}
                      </div>
                      
                      <Button
                        size="sm"
                        className="bg-navy hover:bg-navy-hover"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/product/${product.id}`);
                        }}
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Colors */}
                    {product.colors && product.colors.length > 0 && (
                      <div className="flex items-center gap-1 pt-1">
                        <span className="text-xs text-gray-500">Цвета:</span>
                        <div className="flex gap-1">
                          {product.colors.slice(0, 4).map((color, index) => (
                            <div
                              key={index}
                              className="w-3 h-3 rounded-full border border-gray-300"
                              style={{
                                backgroundColor: color === 'белый' ? '#ffffff' :
                                  color === 'черный' ? '#000000' :
                                  color === 'серый' ? '#808080' :
                                  color === 'темно-синий' ? '#1e3a8a' :
                                  color === 'голубой' ? '#60a5fa' :
                                  color === 'мятный' ? '#34d399' :
                                  color === 'розовый' ? '#f472b6' :
                                  color === 'бордовый' ? '#7f1d1d' : '#e5e7eb'
                              }}
                              title={color}
                            />
                          ))}
                          {product.colors.length > 4 && (
                            <span className="text-xs text-gray-400">+{product.colors.length - 4}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
