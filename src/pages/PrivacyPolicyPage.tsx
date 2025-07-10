import { useEffect } from 'react';
import LegalPage from '@/components/LegalPage';

const PrivacyPolicyPage = () => {
  useEffect(() => {
    document.title = 'Privacy Policy | QR Blast';
  }, []);

  return (
    <LegalPage 
      contentPath="/legal/privacy-policy.md"
      title="Privacy Policy"
    />
  );
};

export default PrivacyPolicyPage;