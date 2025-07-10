import { useEffect } from 'react';
import LegalPage from '@/components/LegalPage';

const GDPRPage = () => {
  useEffect(() => {
    document.title = 'GDPR Compliance | QR Blast';
  }, []);

  return (
    <LegalPage 
      contentPath="/legal/gdpr.md"
      title="GDPR Compliance"
    />
  );
};

export default GDPRPage;