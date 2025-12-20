import { Helmet } from 'react-helmet-async';
import { config } from '@/lib/environment';
import { BUSINESS_NAME, BUSINESS_ADDRESS, BUSINESS_PHONE_RAW, BUSINESS_HOURS, SEO_DEFAULTS, SOCIAL_MEDIA, getSchemaOrgData } from '@/lib/businessConstants';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
  noindex?: boolean;
  structuredData?: object;
}

const SEO: React.FC<SEOProps> = ({
  title,
  description = SEO_DEFAULTS.description,
  keywords = SEO_DEFAULTS.keywords,
  image = '/images/hero-video.mp4', // Default hero image
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  section,
  tags,
  noindex = false,
  structuredData,
}) => {
  const siteTitle = BUSINESS_NAME;
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const fullUrl = url ? `${config.app.url}${url}` : config.app.url;
  const fullImage = image.startsWith('http') ? image : `${config.app.url}${image}`;

  // Generate structured data for the organization using centralized constants
  const organizationStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'BeautySalon',
    name: siteTitle,
    description: description,
    url: config.app.url,
    logo: `${config.app.url}/favicon.ico`,
    image: fullImage,
    address: {
      '@type': 'PostalAddress',
      streetAddress: BUSINESS_ADDRESS.street,
      addressLocality: BUSINESS_ADDRESS.city,
      addressRegion: BUSINESS_ADDRESS.province,
      postalCode: BUSINESS_ADDRESS.postalCode || '',
      addressCountry: 'CA',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: BUSINESS_PHONE_RAW,
      contactType: 'customer service',
      availableLanguage: 'English',
    },
    sameAs: [
      SOCIAL_MEDIA.facebook,
      SOCIAL_MEDIA.instagram,
      SOCIAL_MEDIA.twitter,
    ],
    priceRange: SEO_DEFAULTS.priceRange,
    openingHours: [
      `Mo-Su ${BUSINESS_HOURS.openTime}-${BUSINESS_HOURS.closeTime}`,
    ],
    serviceArea: {
      '@type': 'GeoCircle',
      geoMidpoint: {
        '@type': 'GeoCoordinates',
        latitude: 49.8880, // Winnipeg coordinates
        longitude: -97.1276,
      },
      geoRadius: 50000,
    },
  };

  // Article structured data if it's an article
  const articleStructuredData = type === 'article' ? {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description,
    image: fullImage,
    author: {
      '@type': 'Person',
      name: author || 'Zavira Beauty Team',
    },
    publisher: {
      '@type': 'Organization',
      name: siteTitle,
      logo: {
        '@type': 'ImageObject',
        url: `${config.app.url}/favicon.ico`,
      },
    },
    datePublished: publishedTime,
    dateModified: modifiedTime,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': fullUrl,
    },
    keywords: keywords.join(', '),
    articleSection: section,
    tags: tags,
  } : null;

  // Product structured data if it's a product
  const productStructuredData = type === 'product' ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: title,
    description: description,
    image: fullImage,
    brand: {
      '@type': 'Brand',
      name: siteTitle,
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'CAD',
      availability: 'https://schema.org/InStock',
    },
  } : null;

  const allStructuredData = [
    organizationStructuredData,
    ...(articleStructuredData ? [articleStructuredData] : []),
    ...(productStructuredData ? [productStructuredData] : []),
    ...(structuredData ? [structuredData] : []),
  ];

  return (
    <Helmet>
      {/* Basic meta tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}

      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={siteTitle} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={fullImage} />

      {/* Article specific meta tags */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}
      {type === 'article' && section && (
        <meta property="article:section" content={section} />
      )}
      {type === 'article' && tags && tags.map(tag => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}

      {/* Additional meta tags */}
      <meta name="author" content={author || siteTitle} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Language" content="en-US" />

      {/* Favicons */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

      {/* Structured Data */}
      {allStructuredData.map((data, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(data)}
        </script>
      ))}

      {/* Google Analytics */}
      {config.analytics.googleAnalyticsId && (
        <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${config.analytics.googleAnalyticsId}`}></script>
          <script>
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${config.analytics.googleAnalyticsId}');
            `}
          </script>
        </>
      )}

      {/* Sentry Error Tracking */}
      {config.analytics.sentryDsn && (
        <script
          src="https://browser.sentry-cdn.com/7.0.0/bundle.min.js"
          crossOrigin="anonymous"
        ></script>
      )}
      {config.analytics.sentryDsn && (
        <script>
          {`
            Sentry.init({
              dsn: '${config.analytics.sentryDsn}',
              environment: '${config.app.env}',
              tracesSampleRate: 1.0,
            });
          `}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;