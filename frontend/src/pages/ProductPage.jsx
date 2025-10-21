import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Heart, Share2, Phone, Mail, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { ConsultationModal } from '../components/ConsultationModal';
import { apiService } from '../services/api';
import ProductSchema from '../components/ProductSchema';
import BreadcrumbSchema from '../components/BreadcrumbSchema';
import SEO from '../components/SEO';
import RelatedProducts from '../components/RelatedProducts';

export const ProductPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Related products from search
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Touch swipe state
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  // Check if product is in favorites
  useEffect(() => {
    if (productId) {
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      setIsFavorite(favorites.includes(productId));
    }
  }, [productId]);

  // Toggle favorite
  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    let newFavorites;
    
    if (favorites.includes(productId)) {
      newFavorites = favorites.filter(id => id !== productId);
      setIsFavorite(false);
    } else {
      newFavorites = [...favorites, productId];
      setIsFavorite(true);
    }
    
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    
    // Dispatch event to update header counter
    window.dispatchEvent(new Event('favoriteUpdated'));
  };

  // Share product
  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: product.short_description || product.description,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert('Ссылка скопирована в буфер обмена!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const productData = await apiService.getProductById(productId);
        setProduct(productData);
        
        // Set default color selection
        if (productData.colors && productData.colors.length > 0) {
          setSelectedColor(productData.colors[0]);
        }

        // Load related products from search if available
        const savedQuery = sessionStorage.getItem('searchQuery');
        const savedResults = sessionStorage.getItem('searchResults');
        
        if (savedQuery && savedResults) {
          try {
            const results = JSON.parse(savedResults);
            setSearchQuery(savedQuery);
            setRelatedProducts(results);
          } catch (e) {
            console.error('Error parsing search results:', e);
          }
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Товар не найден или произошла ошибка загрузки');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  // Navigate to previous image
  const handlePreviousImage = () => {
    if (!product || !product.images) return;
    setSelectedImageIndex((prev) => 
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  // Navigate to next image
  const handleNextImage = () => {
    if (!product || !product.images) return;
    setSelectedImageIndex((prev) => 
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') {
        handlePreviousImage();
      } else if (e.key === 'ArrowRight') {
        handleNextImage();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [product]);

  // Touch swipe handlers
  const onTouchStart = (e) => {
    setTouchEnd(null); // Reset touch end
    setTouchStart(e.targetTouches[0].clientX);
    setIsDragging(true);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setIsDragging(false);
      return;
    }
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      handleNextImage(); // Swipe left = next image
    }
    if (isRightSwipe) {
      handlePreviousImage(); // Swipe right = previous image
    }
    
    setIsDragging(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка товара...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад к каталогу
          </Button>
        </div>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 
    ? product.images 
    : [{ image_url: '/images/about-factory.jpg', alt_text: product.name }];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SEO Meta Tags */}
      <SEO 
        title={product.name}
        description={product.short_description || product.description || `${product.name} - корпоративная одежда от производителя`}
        keywords={`${product.name}, ${product.category_name || 'униформа'}, корпоративная одежда, купить униформу`}
        ogImage={product.images && product.images.length > 0 ? product.images[0].image_url : undefined}
        ogType="product"
        canonical={`/product/${product.id}`}
      />
      
      {/* Product Schema.org */}
      <ProductSchema product={product} />
      
      {/* Breadcrumb Schema.org */}
      <BreadcrumbSchema items={[
        { name: 'Главная', url: '/' },
        { name: 'Каталог', url: '/catalog' },
        { name: product.category_name || 'Категория', url: `/category/${product.category_id}` },
        { name: product.name }
      ]} />
      
      {/* Breadcrumb & Back Button */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <Button
              onClick={() => navigate(`/category/${product.category_id}`)}
              variant="outline"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Вернуться в каталог
            </Button>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <button 
              onClick={() => navigate('/')}
              className="text-gray-500 hover:text-navy"
            >
              Главная
            </button>
            <span className="text-gray-300">/</span>
            <button 
              onClick={() => navigate('/catalog')}
              className="text-gray-500 hover:text-navy"
            >
              Каталог
            </button>
            <span className="text-gray-300">/</span>
            <button 
              onClick={() => navigate(`/category/${product.category_id}`)}
              className="text-gray-500 hover:text-navy"
            >
              {product.category_name}
            </button>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images Section */}
          <div className="space-y-4">
            {/* Main Image */}
            <div 
              className="relative aspect-square bg-white rounded-lg overflow-hidden shadow-sm flex items-center justify-center group"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              style={{ touchAction: 'pan-y pinch-zoom' }}
            >
              <img
                src={images[selectedImageIndex]?.image_url}
                alt={images[selectedImageIndex]?.alt_text || product.name}
                loading="eager"
                className={`w-full h-full object-cover select-none transition-opacity duration-300 ${isDragging ? 'opacity-90' : 'opacity-100'}`}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/about-factory.jpg';
                }}
                draggable={false}
              />
              
              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  {/* Previous Button */}
                  <button
                    onClick={handlePreviousImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 lg:w-12 lg:h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center opacity-70 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 z-10"
                    aria-label="Предыдущее фото"
                  >
                    <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6 text-gray-800" />
                  </button>
                  
                  {/* Next Button */}
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 lg:w-12 lg:h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center opacity-70 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 z-10"
                    aria-label="Следующее фото"
                  >
                    <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6 text-gray-800" />
                  </button>
                  
                  {/* Image Counter */}
                  <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                    {selectedImageIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </div>
            
            {/* Image Thumbnails */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square bg-white rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImageIndex === index 
                        ? 'border-navy' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image.image_url}
                      alt={image.alt_text || `${product.name} ${index + 1}`}
                      loading="lazy"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/images/about-factory.jpg';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info Section */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                    {product.name}
                  </h1>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {product.article && (
                      <p className="text-base font-bold text-navy font-mono bg-gray-100 px-3 py-1 rounded">
                        Артикул: {product.article}
                      </p>
                    )}
                    {product.on_order && (
                      <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-md font-semibold">
                        🕐 Под заказ
                      </span>
                    )}
                    {product.featured && (
                      <span className="text-sm bg-yellow-100 text-yellow-700 px-3 py-1 rounded-md font-semibold">
                        ⭐ Популярное
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={toggleFavorite}
                    className={isFavorite ? 'text-red-500 border-red-300' : ''}
                  >
                    <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500' : ''}`} />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={handleShare}
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {/* Badges */}
              <div className="flex gap-2 mb-4">
                {product.featured && (
                  <Badge className="bg-navy text-white">Популярное</Badge>
                )}
              </div>

              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Price */}
            <div className="bg-white p-6 rounded-lg border">
              <div className="mb-4">
                <span className="text-3xl font-bold text-navy">
                  от {product.price_from.toLocaleString()} ₽
                </span>
                {product.price_to && product.price_to !== product.price_from && (
                  <span className="text-xl text-gray-500 ml-2">
                    до {product.price_to.toLocaleString()} ₽
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Цена зависит от количества, размеров и дополнительных опций
              </p>
            </div>

            {/* Options */}
            <div className="space-y-4">
              {/* Colors */}
              {product.colors && product.colors.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Цвета</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 border rounded-lg transition-colors ${
                          selectedColor === color
                            ? 'border-navy bg-navy text-white'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button 
                className="w-full bg-navy hover:bg-navy-hover text-lg py-6"
                onClick={() => setIsConsultationModalOpen(true)}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Заказать консультацию
              </Button>
              
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="py-3"
                  onClick={() => window.location.href = 'tel:+78123177319'}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Позвонить
                </Button>
                <Button 
                  variant="outline" 
                  className="py-3"
                  onClick={() => window.location.href = 'mailto:mail@uniformfactory.ru'}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Написать
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details */}
        {product.characteristics && product.characteristics.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Характеристики</h2>
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  {product.characteristics.map((char, index) => (
                    <div key={index} className="flex justify-between py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-600">{char.name}:</span>
                      <span className="text-gray-900">{char.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Related Products from Search */}
        {relatedProducts.length > 0 && searchQuery && (
          <RelatedProducts 
            products={relatedProducts}
            currentProductId={productId}
            searchQuery={searchQuery}
          />
        )}
      </div>

      {/* Consultation Modal */}
      <ConsultationModal 
        isOpen={isConsultationModalOpen} 
        onClose={() => setIsConsultationModalOpen(false)} 
      />
    </div>
  );
};