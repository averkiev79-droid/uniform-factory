import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title, 
  description, 
  keywords, 
  ogImage = '/images/og-default.jpg',
  ogType = 'website',
  canonical,
  noindex = false 
}) => {
  const siteUrl = 'https://uniformfactory.ru';
  const defaultTitle = 'Uniform Factory - Производство корпоративной одежды и униформы на заказ';
  const defaultDescription = 'Производство корпоративной одежды, униформы для ресторанов, гостиниц, офисов. Пошив спецодежды для официантов, поваров, персонала. Работаем по всей России. ☎ +7 (812) 317-73-19';
  const defaultKeywords = 'униформа на заказ, корпоративная одежда, спецодежда для персонала, униформа для ресторанов, униформа для гостиниц, пошив униформы, производство униформы, униформа для официантов, униформа для поваров, униформа москва, спецодежда для продавцов';

  const pageTitle = title ? `${title} | Uniform Factory` : defaultTitle;
  const pageDescription = description || defaultDescription;
  const pageKeywords = keywords || defaultKeywords;
  const pageUrl = canonical ? `${siteUrl}${canonical}` : siteUrl;
  const imageUrl = ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={pageKeywords} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={pageUrl} />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:site_name" content="Uniform Factory" />
      <meta property="og:locale" content="ru_RU" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={pageUrl} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={imageUrl} />
      
      {/* Additional SEO */}
      <meta name="author" content="Uniform Factory" />
      <meta name="language" content="Russian" />
      <meta name="geo.region" content="RU-SPE" />
      <meta name="geo.placename" content="Санкт-Петербург" />
      <meta name="geo.position" content="59.832462;30.16947" />
      <meta name="ICBM" content="59.832462, 30.16947" />
      
      {/* Schema.org Organization */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Uniform Factory",
          "url": siteUrl,
          "logo": `${siteUrl}/images/logo.png`,
          "description": "Производство корпоративной одежды и униформы на заказ",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "пр. Ветеранов, 140",
            "addressLocality": "Санкт-Петербург",
            "postalCode": "198334",
            "addressCountry": "RU"
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+7-812-317-73-19",
            "contactType": "sales",
            "email": "mail@uniformfactory.ru",
            "areaServed": "RU",
            "availableLanguage": ["Russian"]
          },
          "sameAs": [
            // Добавьте ссылки на соцсети если есть
          ]
        })}
      </script>
    </Helmet>
  );
};

export default SEO;
