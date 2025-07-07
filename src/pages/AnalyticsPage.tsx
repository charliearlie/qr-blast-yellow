import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import { qrService, QRCodeData } from '@/services/qrService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';

const AnalyticsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [qrCode, setQrCode] = useState<QRCodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!id) {
      navigate('/dashboard');
      return;
    }

    loadQRCode();
  }, [id, user, navigate]);

  const loadQRCode = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const codes = await qrService.getUserQRCodes();
      const qrCode = codes.find(code => code.id === id);
      
      if (!qrCode) {
        toast({
          title: "QR Code Not Found",
          description: "The requested QR code could not be found",
          variant: "destructive",
        });
        navigate('/dashboard');
        return;
      }

      setQrCode(qrCode);
    } catch (error) {
      toast({
        title: "Failed to load QR code",
        description: "Please try again later",
        variant: "destructive",
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="outline"
            size="sm"
            className="brutal-button"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        
        <Card className="brutal-card p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-secondary rounded w-1/3"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-secondary rounded"></div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!qrCode) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="outline"
            size="sm"
            className="brutal-button"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        
        <Card className="brutal-card p-12 text-center">
          <BarChart3 className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
          <h3 className="text-2xl font-bold uppercase mb-4">QR Code Not Found</h3>
          <p className="text-muted-foreground mb-6">
            The QR code you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button onClick={() => navigate('/dashboard')} className="brutal-button">
            Return to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          onClick={() => navigate('/dashboard')}
          variant="outline"
          size="sm"
          className="brutal-button"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Dashboard</span>
          <span>/</span>
          <span>Analytics</span>
          <span>/</span>
          <span className="font-bold text-foreground">{qrCode.title}</span>
        </div>
      </div>

      {/* Analytics Dashboard */}
      <AnalyticsDashboard qrCode={qrCode} />
    </div>
  );
};

export default AnalyticsPage;