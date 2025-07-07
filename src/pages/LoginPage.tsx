import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SEO } from '@/components/SEO';
import { SEO_CONFIG } from '@/config/seo';
import { useAuth } from '@/hooks/useAuth';
import { User, QrCode, ArrowLeft } from 'lucide-react';
import AuthModal from '@/components/AuthModal';

const LoginPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const seoData = SEO_CONFIG['/login'];
  
  // Get the redirect path from location state or default to dashboard
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

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

  const handleSuccessfulLogin = () => {
    navigate(from, { replace: true });
  };

  return (
    <>
      <SEO
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        canonical="/login"
        noindex={true}
      />
      
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-md mx-auto space-y-6">
          {/* Back Button */}
          <Button variant="outline" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Generator
          </Button>

          {/* Login Card */}
          <Card className="brutal-card p-8">
            <div className="text-center space-y-6">
              <div className="space-y-4">
                <QrCode className="w-16 h-16 mx-auto text-primary" />
                <div>
                  <h1 className="text-2xl font-bold uppercase">Sign In to QR Blast</h1>
                  <p className="text-muted-foreground mt-2">
                    Access your dashboard and analytics
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <AuthModal onSuccess={handleSuccessfulLogin}>
                  <Button size="lg" className="w-full">
                    <User className="w-4 h-4 mr-2" />
                    Sign In for Analytics
                  </Button>
                </AuthModal>

                <div className="text-sm text-muted-foreground space-y-2">
                  <p>✅ Track QR code scans</p>
                  <p>✅ View detailed analytics</p>
                  <p>✅ Manage all your QR codes</p>
                  <p>✅ Export data and insights</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  Don't need an account?{' '}
                  <Button 
                    variant="link" 
                    className="h-auto p-0 text-xs"
                    onClick={() => navigate('/')}
                  >
                    Create QR codes without signing in
                  </Button>
                </p>
              </div>
            </div>
          </Card>

          {/* Features Card */}
          <Card className="brutal-card p-6 bg-primary/5 border-primary/20">
            <h3 className="font-bold text-center mb-4">🚀 PREMIUM FEATURES</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                <span>Real-time scan analytics</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                <span>Geographic tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                <span>Device & browser insights</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                <span>Custom QR code designs</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                <span>Security scanning protection</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default LoginPage;