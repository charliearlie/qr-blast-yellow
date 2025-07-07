export interface RouteMetadata {
  title: string;
  description: string;
  keywords: string;
  ogType?: 'website' | 'article' | 'product';
}

export const SEO_CONFIG: Record<string, RouteMetadata> = {
  '/': {
    title: 'Free QR Code Generator with Analytics & Security',
    description: 'Create professional QR codes with built-in analytics, custom designs, and security scanning. Track scans, locations, and user engagement in real-time.',
    keywords: 'QR code generator, free QR codes, QR analytics, custom QR codes, QR security, QR tracking, QR scanner',
    ogType: 'website',
  },
  '/generate': {
    title: 'QR Code Generator - Create Custom QR Codes',
    description: 'Generate custom QR codes with logos, colors, and shapes. Add your branding and track performance with detailed analytics.',
    keywords: 'QR code generator, custom QR codes, QR logo, QR design, branded QR codes',
    ogType: 'website',
  },
  '/dashboard': {
    title: 'My QR Codes Dashboard - Manage & Track Performance',
    description: 'Manage your QR codes, view detailed analytics, and track scan performance. Monitor user engagement and optimize your campaigns.',
    keywords: 'QR code dashboard, QR analytics, QR management, QR tracking, QR performance',
    ogType: 'website',
  },
  '/login': {
    title: 'Sign In - Access Your QR Analytics',
    description: 'Sign in to access your QR code dashboard and view detailed analytics. Track scans, locations, and user engagement.',
    keywords: 'QR code login, QR analytics access, QR dashboard sign in',
    ogType: 'website',
  },
  '/privacy': {
    title: 'Privacy Policy - How We Protect Your Data',
    description: 'Learn how QR Blast protects your privacy and handles your data. Transparent privacy practices for QR code analytics.',
    keywords: 'privacy policy, data protection, QR code privacy, analytics privacy',
    ogType: 'article',
  },
  '/terms': {
    title: 'Terms of Service - QR Blast Usage Terms',
    description: 'Terms of service for using QR Blast. Understand your rights and responsibilities when creating and managing QR codes.',
    keywords: 'terms of service, QR code terms, usage terms, QR Blast terms',
    ogType: 'article',
  },
  '/about': {
    title: 'About QR Blast - Professional QR Code Solutions',
    description: 'Learn about QR Blast, the professional QR code generator with analytics, security scanning, and custom design features.',
    keywords: 'about QR Blast, QR code solutions, QR generator features, QR analytics platform',
    ogType: 'article',
  },
};

export const STRUCTURED_DATA = {
  organization: {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'QR Blast',
    description: 'Professional QR Code Generator with Analytics and Security',
    url: 'https://qrblast.com',
    logo: 'https://qrblast.com/img/logo.png',
    sameAs: [],
  },
  
  webApplication: {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'QR Blast',
    description: 'Professional QR Code Generator with Analytics and Security',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    featureList: [
      'QR Code Generation',
      'Custom Design & Branding',
      'Real-time Analytics',
      'Security Scanning',
      'Mobile Responsive',
      'Bulk QR Creation',
    ],
  },

  qrCodeProduct: (title: string, url: string, scans: number) => ({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `QR Code: ${title}`,
    description: `Custom QR code linking to ${url} with ${scans} scans tracked`,
    category: 'QR Code',
    brand: {
      '@type': 'Brand',
      name: 'QR Blast',
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
  }),
};