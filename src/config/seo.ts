export interface RouteMetadata {
  title: string;
  description: string;
  keywords: string;
  ogType?: "website" | "article" | "product";
}

export const SEO_CONFIG: Record<string, RouteMetadata> = {
  "/": {
    title: "Blast QR: Intelligent & Dynamic QR Code Generator",
    description:
      "Create dynamic, intelligent QR codes that adapt to time, location, and your changing needs. Free QR code generator with analytics, security, and custom designs.",
    keywords:
      "QR code generator, dynamic QR codes, intelligent QR codes, QR analytics, custom QR codes, free QR generator, time-based QR codes, geo-fenced QR codes",
    ogType: "website",
  },
  "/generate": {
    title: "QR Code Generator - Create Custom QR Codes",
    description:
      "Generate custom QR codes with logos, colors, and shapes. Add your branding and track performance with detailed analytics.",
    keywords:
      "QR code generator, custom QR codes, QR logo, QR design, branded QR codes",
    ogType: "website",
  },
  "/dashboard": {
    title: "My QR Codes Dashboard - Manage & Track Performance",
    description:
      "Manage your QR codes, view detailed analytics, and track scan performance. Monitor user engagement and optimise your campaigns.",
    keywords:
      "QR code dashboard, QR analytics, QR management, QR tracking, QR performance",
    ogType: "website",
  },
  "/login": {
    title: "Sign In - Access Your QR Analytics",
    description:
      "Sign in to access your QR code dashboard and view detailed analytics. Track scans, locations, and user engagement.",
    keywords: "QR code login, QR analytics access, QR dashboard sign in",
    ogType: "website",
  },
  "/privacy": {
    title: "Privacy Policy - How We Protect Your Data",
    description:
      "Learn how Blast QR protects your privacy and handles your data. Transparent privacy practices for QR code analytics.",
    keywords:
      "privacy policy, data protection, QR code privacy, analytics privacy",
    ogType: "article",
  },
  "/terms": {
    title: "Terms of Service - Blast QR Usage Terms",
    description:
      "Terms of service for using Blast QR. Understand your rights and responsibilities when creating and managing QR codes.",
    keywords: "terms of service, QR code terms, usage terms, Blast QR terms",
    ogType: "article",
  },
  "/about": {
    title: "About Blast QR - Professional QR Code Solutions",
    description:
      "Learn about Blast QR, the professional QR code generator with analytics, security scanning, and custom design features.",
    keywords:
      "about Blast QR, QR code solutions, QR generator features, QR analytics platform",
    ogType: "article",
  },
};

export const STRUCTURED_DATA = {
  organization: {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Blast QR",
    description: "Professional QR Code Generator with Analytics and Security",
    url: "https://qrblast.com",
    logo: "https://qrblast.com/img/logo.png",
    sameAs: [],
  },

  webApplication: {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Blast QR",
    description:
      "Intelligent & Dynamic QR Code Generator with Advanced Features",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    featureList: [
      "Dynamic QR Code Generation",
      "Time-aware Redirects",
      "Geo-fenced Redirects",
      "Scan Limits & Control",
      "Custom Design & Branding",
      "Real-time Analytics",
      "Security Scanning",
      "A/B Testing",
      "Password Protection",
      "Logo Integration",
    ],
  },

  qrCodeProduct: (title: string, url: string, scans: number) => ({
    "@context": "https://schema.org",
    "@type": "Product",
    name: `QR Code: ${title}`,
    description: `Custom QR code linking to ${url} with ${scans} scans tracked`,
    category: "QR Code",
    brand: {
      "@type": "Brand",
      name: "Blast QR",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
  }),
};
