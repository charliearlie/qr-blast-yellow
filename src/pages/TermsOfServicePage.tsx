import { useEffect } from 'react';
import LegalPage from '@/components/LegalPage';

const TermsOfServicePage = () => {
  useEffect(() => {
    document.title = 'Terms of Service | QR Blast';
  }, []);

  return (
    <LegalPage 
      contentPath="/legal/terms-of-service.md"
      title="Terms of Service"
    />
  );
};

export default TermsOfServicePage;