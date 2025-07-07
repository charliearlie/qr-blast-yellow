import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Edit, 
  Trash2, 
  ExternalLink, 
  QrCode,
  Calendar,
  Eye,
  Copy,
  Plus
} from 'lucide-react';
import { qrService, QRCodeData } from '@/services/qrService';
import { useToast } from '@/hooks/use-toast';
import { QRCodePreview } from './QRCodePreview';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface QRCodeManagerProps {
  onCreateNew?: () => void;
}

const QRCodeManager = ({ onCreateNew }: QRCodeManagerProps) => {
  const navigate = useNavigate();
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadQRCodes();
  }, []);

  const loadQRCodes = async () => {
    setLoading(true);
    try {
      const codes = await qrService.getUserQRCodes();
      setQrCodes(codes);
    } catch (error) {
      toast({
        title: "Failed to load QR codes",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await qrService.deleteQRCode(id);
      setQrCodes(qrCodes.filter(qr => qr.id !== id));
      toast({
        title: "QR Code Deleted",
        description: "Your QR code has been successfully deleted",
      });
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete QR code",
        variant: "destructive",
      });
    }
  };

  const handleCopyShortUrl = (shortUrl: string) => {
    navigator.clipboard.writeText(shortUrl);
    toast({
      title: "URL Copied",
      description: "Short URL copied to clipboard",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="brutal-card p-6">
            <div className="animate-pulse">
              <div className="h-32 bg-secondary rounded mb-4"></div>
              <div className="h-6 bg-secondary rounded w-2/3 mb-2"></div>
              <div className="h-4 bg-secondary rounded w-1/2"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (qrCodes.length === 0) {
    return (
      <Card className="brutal-card p-12 text-center">
        <QrCode className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
        <h3 className="text-2xl font-bold uppercase mb-4">No QR Codes Yet</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Create your first trackable QR code to start collecting analytics and insights
        </p>
        <Button 
          onClick={onCreateNew || (() => navigate('/'))} 
          size="lg"
          className="brutal-button"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Your First QR Code
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold uppercase">My QR Codes</h2>
          <p className="text-muted-foreground">Manage and track your QR codes</p>
        </div>
        <Button 
          onClick={onCreateNew || (() => navigate('/'))} 
          size="lg" 
          className="brutal-button w-full lg:w-auto"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create New
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {qrCodes.map((qrCode) => (
          <Card key={qrCode.id} className="brutal-card-hover p-6 flex flex-col">
            <div className="flex-1 space-y-4">
              {/* QR Code Preview */}
              <div className="flex justify-center">
                <QRCodePreview
                  url={qrCode.short_url || qrCode.original_url}
                  settings={qrCode.qr_settings || {}}
                  size={150}
                  showActions={true}
                />
              </div>

              {/* QR Code Info */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg font-bold truncate flex-1">{qrCode.title}</h3>
                  <Badge variant="outline" className="shrink-0">
                    <Eye className="w-3 h-3 mr-1" />
                    {qrCode.scan_count || 0}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    <span className="break-all text-xs text-muted-foreground line-clamp-2">
                      {qrCode.original_url}
                    </span>
                  </div>

                  {qrCode.short_url && (
                    <div className="flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground truncate flex-1">
                        {qrCode.short_url}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyShortUrl(qrCode.short_url!)}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{qrCode.created_at ? formatDate(qrCode.created_at) : 'Unknown'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-dashed border-gray-300">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/analytics/${qrCode.id}`)}
                className="brutal-button-small"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="sr-only">Analytics</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/edit/${qrCode.id}`)}
                className="brutal-button-small"
              >
                <Edit className="w-4 h-4" />
                <span className="sr-only">Edit</span>
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="brutal-button-small"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="brutal-card">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-xl font-bold uppercase">
                      Delete QR Code
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{qrCode.title}"? This action cannot be undone and all analytics data will be lost.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="brutal-button">Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => handleDelete(qrCode.id!)}
                      className="brutal-button bg-red-500 hover:bg-red-600 text-white"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default QRCodeManager;