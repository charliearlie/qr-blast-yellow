import { Helmet } from 'react-helmet-async';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  structuredData?: object;
  noindex?: boolean;
}

const defaultMeta = {
  title: 'Blast QR - Free QR Code Generator with Analytics & Security',
  description: 'Create professional QR codes with built-in analytics, custom designs, and security scanning. Track scans, locations, and user engagement in real-time.',
  keywords: 'QR code generator, free QR codes, QR analytics, custom QR codes, QR security, QR tracking',
  ogImage: '/img/og-image.png',
  ogType: 'website' as const,
  twitterCard: 'summary_large_image' as const,
};

export const SEO = ({
  title,
  description,
  keywords,
  canonical,
  ogImage,
  ogType = defaultMeta.ogType,
  twitterCard = defaultMeta.twitterCard,
  structuredData,
  noindex = false,
}: SEOProps) => {
  const fullTitle = title ? `${title} | Blast QR` : defaultMeta.title;
  const metaDescription = description || defaultMeta.description;
  const metaKeywords = keywords || defaultMeta.keywords;
  const metaImage = ogImage || defaultMeta.ogImage;
  const canonicalUrl = canonical || typeof window !== 'undefined' ? window.location.href : '';

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={metaKeywords} />
      {canonical && <link rel="canonical" href={canonical} />}
      
      {/* Robots */}
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content="Blast QR" />
      
      {/* Twitter Cards */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};