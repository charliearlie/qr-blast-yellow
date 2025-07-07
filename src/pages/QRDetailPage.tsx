import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SEO } from '@/components/SEO';
import { STRUCTURED_DATA } from '@/config/seo';
import { qrService, QRCodeData } from '@/services/qrService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  ExternalLink, 
  QrCode, 
  Calendar, 
  Eye, 
  BarChart3, 
  Edit,
  Copy,
  Share2
} from 'lucide-react';

const QRDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [qrCode, setQRCode] = useState<QRCodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQRCode = async () => {
      if (!id || !user) {
        setError('QR Code not found or access denied');
        setLoading(false);
        return;
      }

      try {
        const qrCodes = await qrService.getUserQRCodes(user.id);
        const foundQR = qrCodes.find(qr => qr.id === id);
        
        if (!foundQR) {
          setError('QR Code not found');
        } else {
          setQRCode(foundQR);
        }
      } catch (err) {
        setError('Failed to load QR Code');
      } finally {
        setLoading(false);
      }
    };

    fetchQRCode();
  }, [id, user]);

  const handleCopyShortUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: 'Copied!',
        description: 'Short URL copied to clipboard',
      });
    } catch (err) {
      toast({
        title: 'Failed to copy',
        description: 'Please copy the URL manually',
        variant: 'destructive',
      });
    }
  };

  const handleShare = async () => {
    if (!qrCode) return;
    
    const shareData = {
      title: `QR Code: ${qrCode.title}`,
      text: `Check out this QR code created with QR Blast`,
      url: qrCode.short_url,
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await handleCopyShortUrl(qrCode.short_url!);
      }
    } catch (err) {
      await handleCopyShortUrl(qrCode.short_url!);
    }
  };

  if (loading) {
    return (
      <>
        <SEO title="Loading QR Code..." noindex={true} />
        <div className="min-h-screen bg-background py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="brutal-card p-8">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-secondary rounded w-1/3"></div>
                <div className="h-4 bg-secondary rounded w-2/3"></div>
                <div className="h-4 bg-secondary rounded w-1/2"></div>
              </div>
            </Card>
          </div>
        </div>
      </>
    );
  }

  if (error || !qrCode) {
    return (
      <>
        <SEO title="QR Code Not Found" noindex={true} />
        <div className="min-h-screen bg-background py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="brutal-card p-8 text-center">
              <QrCode className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h1 className="text-2xl font-bold uppercase mb-2">QR Code Not Found</h1>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Card>
          </div>
        </div>
      </>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const structuredData = STRUCTURED_DATA.qrCodeProduct(
    qrCode.title,
    qrCode.original_url,
    qrCode.scan_count || 0
  );

  return (
    <>
      <SEO
        title={`${qrCode.title} - QR Code Details`}
        description={`View details and analytics for QR code "${qrCode.title}" linking to ${qrCode.original_url}`}
        keywords={`QR code ${qrCode.title}, QR analytics, QR tracking`}
        structuredData={structuredData}
        canonical={`/qr/${id}`}
        noindex={true} // Private QR details should not be indexed
      />
      
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          {/* QR Code Details */}
          <Card className="brutal-card p-6">
            <div className="space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <h1 className="text-2xl lg:text-3xl font-bold">{qrCode.title}</h1>
                    <Badge variant="outline" className="text-lg px-3 py-1">
                      <Eye className="w-4 h-4 mr-1" />
                      {qrCode.scan_count || 0} scans
                    </Badge>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <ExternalLink className="w-4 h-4" />
                        <span>Original URL:</span>
                      </div>
                      <span className="break-all font-mono bg-secondary px-2 py-1 rounded">
                        {qrCode.original_url}
                      </span>
                    </div>
                    
                    <div className="flex flex-col lg:flex-row lg:items-center gap-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <QrCode className="w-4 h-4" />
                        <span>Short URL:</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="break-all font-mono bg-secondary px-2 py-1 rounded flex-1">
                          {qrCode.short_url}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyShortUrl(qrCode.short_url!)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Created:</span>
                      <span>{qrCode.created_at ? formatDate(qrCode.created_at) : 'Unknown'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/qr/${id}/analytics`)}
                  className="w-full"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => navigate(`/qr/${id}/edit`)}
                  className="w-full"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleShare}
                  className="w-full"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                
                <Button
                  onClick={() => window.open(qrCode.original_url, '_blank')}
                  className="w-full"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Visit
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default QRDetailPage;