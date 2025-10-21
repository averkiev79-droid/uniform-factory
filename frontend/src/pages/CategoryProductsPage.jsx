import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Heart, Share2 } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { apiService } from '../services/api';
import SEO from '../components/SEO';
import BreadcrumbSchema from '../components/BreadcrumbSchema';

export const CategoryProductsPage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get category info
        const categoriesData = await apiService.getCategories();
        const categoryData = categoriesData.find(cat => cat.id === categoryId);
        setCategory(categoryData);
        
        // Get products for this category
        const productsData = await apiService.getProductsByCategory(categoryId);
        setProducts(productsData);
        
        // Load favorites
        const storedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        setFavorites(storedFavorites);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Ошибка загрузки товаров');
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchData();
    }
  }, [categoryId]);

  // Toggle favorite
  const toggleFavorite = (productId, e) => {
    e.stopPropagation();
    
    const storedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    let newFavorites;
    
    if (storedFavorites.includes(productId)) {
      newFavorites = storedFavorites.filter(id => id !== productId);
    } else {
      newFavorites = [...storedFavorites, productId];
    }
    
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    setFavorites(newFavorites);
    
    // Dispatch event to update header counter
    window.dispatchEvent(new Event('favoriteUpdated'));
  };

  // Share product
  const handleShare = async (product, e) => {
    e.stopPropagation();
    
    const shareData = {
      title: product.name,
      text: product.short_description || product.description,
      url: `${window.location.origin}/product/${product.id}`
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        alert('Ссылка скопирована в буфер обмена!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка товаров...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => navigate('/catalog')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад к каталогу
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SEO Meta Tags */}
      {category && (
        <>
          <SEO 
            title={`${category.title} - каталог униформы`}
            description={`${category.description || category.title} - широкий выбор моделей корпоративной одежды. ${products.length} товаров в наличии. Доставка по России.`}
            keywords={`${category.title}, униформа ${category.title.toLowerCase()}, корпоративная одежда, купить униформу`}
            canonical={`/category/${categoryId}`}
          />
          
          <BreadcrumbSchema items={[
            { name: 'Главная', url: '/' },
            { name: 'Каталог', url: '/catalog' },
            { name: category.title }
          ]} />
        </>
      )}
      
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="space-y-4">
            {/* Back button and count */}
            <div className="flex items-center justify-between">
              <Button
                onClick={() => navigate('/catalog')}
                variant="outline"
                size="sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Назад к каталогу
              </Button>
              <div className="text-sm text-gray-500">
                Найдено: {products.length}
              </div>
            </div>
            
            {/* Title and description */}
            <div>
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
                {category?.title || 'Товары категории'}
              </h1>
              <p className="text-sm md:text-base text-gray-600 mt-1">
                {category?.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-8">
        {products.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Товары скоро появятся
            </h2>
            <p className="text-gray-600">
              В этой категории пока нет товаров. Мы работаем над наполнением каталога.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card 
                key={product.id}
                className="group hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
              >
                <div 
                  className="relative"
                  onClick={() => handleProductClick(product.id)}
                >
                  {/* Main Image */}
                  <div className="aspect-square overflow-hidden bg-gray-100 flex items-center justify-center">
                    <img
                      src={product.images?.[0]?.image_url || '/images/about-factory.jpg'}
                      alt={product.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/images/about-factory.jpg';
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
                    {!product.is_available && (
                      <Badge variant="secondary" className="bg-red-100 text-red-700">
                        Нет в наличии
                      </Badge>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className={`w-10 h-10 p-0 bg-white/90 hover:bg-white ${
                          favorites.includes(product.id) ? 'text-red-500 border-red-300' : ''
                        }`}
                        onClick={(e) => toggleFavorite(product.id, e)}
                      >
                        <Heart className={`w-4 h-4 ${favorites.includes(product.id) ? 'fill-red-500' : ''}`} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-10 h-10 p-0 bg-white/90 hover:bg-white"
                        onClick={(e) => handleShare(product, e)}
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <CardContent 
                  className="p-4 cursor-pointer"
                  onClick={() => handleProductClick(product.id)}
                >
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-navy transition-colors">
                      {product.name}
                    </h3>
                    
                    {product.article && (
                      <p className="text-sm font-semibold text-navy font-mono">
                        Артикул: {product.article}
                      </p>
                    )}
                    
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
                      <div className="flex-1">
                        <span className="text-lg font-bold text-navy">
                          от {product.price_from.toLocaleString()} ₽
                        </span>
                        {product.price_to && product.price_to !== product.price_from && (
                          <span className="text-sm text-gray-500 ml-1">
                            до {product.price_to.toLocaleString()} ₽
                          </span>
                        )}
                        
                        {/* Status badges */}
                        <div className="flex gap-1 mt-1 flex-wrap">
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
                      
                      <Button
                        size="sm"
                        className="bg-navy hover:bg-navy-hover"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Add to cart or request quote
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