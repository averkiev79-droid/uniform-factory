import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * ProductSchema - компонент для добавления Schema.org разметки товара
 * Улучшает SEO и отображение товаров в поисковой выдаче
 */
const ProductSchema = ({ product }) => {
  if (!product) return null;

  const siteUrl = 'https://uniformfactory.ru';
  
  // Формируем URL изображений
  const images = product.images && product.images.length > 0
    ? product.images.map(img => {
        const imageUrl = img.image_url || img;
        return imageUrl.startsWith('http') ? imageUrl : `${siteUrl}${imageUrl}`;
      })
    : [`${siteUrl}/images/product-placeholder.jpg`];

  // Определяем доступность
  const availability = product.is_available 
    ? "https://schema.org/InStock" 
    : "https://schema.org/OutOfStock";

  // Формируем цену
  const price = product.price_from || product.price || 0;
  const priceRange = product.price_to 
    ? `${product.price_from}-${product.price_to}` 
    : `${price}`;

  const schema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "description": product.description || product.short_description || `Корпоративная одежда ${product.name}`,
    "image": images,
    "sku": product.article || product.id,
    "brand": {
      "@type": "Brand",
      "name": "Uniform Factory"
    },
    "offers": {
      "@type": "Offer",
      "url": `${siteUrl}/product/${product.id}`,
      "priceCurrency": "RUB",
      "price": price,
      "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      "availability": availability,
      "seller": {
        "@type": "Organization",
        "name": "Uniform Factory",
        "telephone": "+7-812-317-73-19",
        "email": "mail@uniformfactory.ru"
      }
    },
    "aggregateRating": product.rating ? {
      "@type": "AggregateRating",
      "ratingValue": product.rating,
      "reviewCount": product.review_count || 1
    } : undefined
  };

  // Добавляем категорию если есть
  if (product.category_name) {
    schema.category = product.category_name;
  }

  // Добавляем материал если есть
  if (product.material) {
    schema.material = product.material;
  }

  // Добавляем размеры если есть
  if (product.sizes && product.sizes.length > 0) {
    schema.size = Array.isArray(product.sizes) 
      ? product.sizes.join(', ') 
      : product.sizes;
  }

  // Добавляем цвета если есть
  if (product.colors && product.colors.length > 0) {
    schema.color = Array.isArray(product.colors) 
      ? product.colors.join(', ') 
      : product.colors;
  }

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema, null, 2)}
      </script>
    </Helmet>
  );
};

export default ProductSchema;
