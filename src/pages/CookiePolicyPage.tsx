import { useEffect } from 'react';
import LegalPage from '@/components/LegalPage';

const CookiePolicyPage = () => {
  useEffect(() => {
    document.title = 'Cookie Policy | QR Blast';
  }, []);

  return (
    <LegalPage 
      contentPath="/legal/cookie-policy.md"
      title="Cookie Policy"
    />
  );
};

export default CookiePolicyPage;