import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * BreadcrumbSchema - компонент для добавления Schema.org хлебных крошек
 * Улучшает навигацию в поисковой выдаче
 */
const BreadcrumbSchema = ({ items }) => {
  if (!items || items.length === 0) return null;

  const siteUrl = 'https://uniformfactory.ru';

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url ? `${siteUrl}${item.url}` : undefined
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema, null, 2)}
      </script>
    </Helmet>
  );
};

export default BreadcrumbSchema;
