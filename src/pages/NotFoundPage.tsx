import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SEO } from '@/components/SEO';
import { Home, Search, QrCode } from 'lucide-react';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <SEO
        title="Page Not Found - 404 Error"
        description="The page you're looking for doesn't exist. Return to QR Blast to create and manage QR codes."
        keywords="404 error, page not found, QR Blast"
        noindex={true}
      />
      
      <div className="min-h-screen bg-background py-8 px-4 flex items-center justify-center">
        <Card className="brutal-card p-8 max-w-md w-full mx-4">
          <div className="text-center space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <QrCode className="w-20 h-20 mx-auto text-muted-foreground" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold">404</span>
                </div>
              </div>
              
              <div>
                <h1 className="text-3xl font-bold uppercase mb-2">Page Not Found</h1>
                <p className="text-muted-foreground">
                  Oops! The page you're looking for seems to have vanished like a broken QR code.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={() => navigate('/')}
                size="lg"
                className="w-full"
              >
                <Home className="w-4 h-4 mr-2" />
                Go to Homepage
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="w-full"
              >
                <Search className="w-4 h-4 mr-2" />
                View My QR Codes
              </Button>
            </div>

            <div className="pt-4 border-t text-sm text-muted-foreground">
              <p>Need help? The page might have moved or been deleted.</p>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};

export default NotFoundPage;