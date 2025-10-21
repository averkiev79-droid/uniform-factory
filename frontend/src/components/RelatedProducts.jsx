import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from './ui/card';

const RelatedProducts = ({ products, currentProductId, searchQuery }) => {
  const navigate = useNavigate();

  // Фильтруем текущий товар
  const relatedProducts = products.filter(p => p.id !== currentProductId).slice(0, 4);

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <div className="mt-12 mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Другие результаты по запросу "{searchQuery}"
        </h2>
        <p className="text-gray-600 mt-1">
          Найдено ещё {relatedProducts.length} товаров
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((product) => (
          <Card
            key={product.id}
            className="group cursor-pointer hover:shadow-lg transition-all duration-300"
            onClick={() => {
              window.scrollTo(0, 0);
              navigate(`/product/${product.id}`);
            }}
          >
            <div className="aspect-square overflow-hidden bg-gray-100 rounded-t-lg">
              <img
                src={product.images?.[0]?.image_url || '/images/about-factory.jpg'}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/about-factory.jpg';
                }}
              />
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-navy transition-colors min-h-[3rem]">
                {product.name}
              </h3>
              
              {product.article && (
                <p className="text-sm font-mono font-semibold text-navy mt-2">
                  Артикул: {product.article}
                </p>
              )}
              
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                {product.short_description || product.description}
              </p>
              
              <div className="mt-3 flex items-center justify-between">
                <span className="text-lg font-bold text-navy">
                  от {product.price_from.toLocaleString()} ₽
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
