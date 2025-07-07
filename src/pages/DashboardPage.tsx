import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCodeManager from '@/components/QRCodeManager';
import { SEO } from '@/components/SEO';
import { SEO_CONFIG } from '@/config/seo';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, QrCode } from 'lucide-react';
import AuthModal from '@/components/AuthModal';

const DashboardPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const seoData = SEO_CONFIG['/dashboard'];

  if (loading) {
    return (
      <>
        <SEO
          title={seoData.title}
          description={seoData.description}
          keywords={seoData.keywords}
          noindex={true}
        />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-pulse">
            <div className="h-8 bg-secondary rounded w-48 mb-4"></div>
            <div className="h-4 bg-secondary rounded w-32"></div>
          </div>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <SEO
          title="Sign In Required - QR Dashboard"
          description="Sign in to access your QR code dashboard and analytics"
          keywords="QR dashboard login, QR analytics access"
          noindex={true}
        />
        <div className="min-h-screen bg-background py-8 px-4 flex items-center justify-center">
          <Card className="brutal-card p-8 max-w-md w-full mx-4">
            <div className="text-center space-y-6">
              <QrCode className="w-16 h-16 mx-auto text-primary" />
              <div>
                <h1 className="text-2xl font-bold uppercase mb-2">Dashboard Access</h1>
                <p className="text-muted-foreground">
                  Sign in to view your QR codes and analytics
                </p>
              </div>
              
              <div className="space-y-3">
                <AuthModal onSuccess={() => window.location.reload()}>
                  <Button size="lg" className="w-full">
                    <User className="w-4 h-4 mr-2" />
                    Sign In for Analytics
                  </Button>
                </AuthModal>
                
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/')}
                  className="w-full"
                >
                  Create QR Code Without Account
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        canonical="/dashboard"
        noindex={true} // Private dashboard should not be indexed
      />
      <QRCodeManager onCreateNew={() => navigate('/')} />
    </>
  );
};

export default DashboardPage;