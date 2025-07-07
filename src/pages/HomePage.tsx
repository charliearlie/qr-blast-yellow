import QRGenerator from '@/components/QRGenerator';
import { SEO } from '@/components/SEO';
import { SEO_CONFIG, STRUCTURED_DATA } from '@/config/seo';

const HomePage = () => {
  const seoData = SEO_CONFIG['/'];

  return (
    <>
      <SEO
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        ogType={seoData.ogType}
        structuredData={STRUCTURED_DATA.webApplication}
        canonical="/"
      />
      <QRGenerator />
    </>
  );
};

export default HomePage;