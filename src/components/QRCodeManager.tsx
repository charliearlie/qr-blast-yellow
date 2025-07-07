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
import AnalyticsDashboard from './AnalyticsDashboard';
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
  const [selectedQRCode, setSelectedQRCode] = useState<QRCodeData | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
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

  if (showAnalytics && selectedQRCode) {
    return (
      <AnalyticsDashboard 
        qrCode={selectedQRCode} 
        onClose={() => {
          setShowAnalytics(false);
          setSelectedQRCode(null);
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="brutal-card p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-secondary rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-secondary rounded w-2/3 mb-2"></div>
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
          className="w-full lg:w-auto"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create New
        </Button>
      </div>

      <div className="grid gap-6">
        {qrCodes.map((qrCode) => (
          <Card key={qrCode.id} className="brutal-card p-4 lg:p-6">
            <div className="space-y-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-3 mb-3">
                    <h3 className="text-lg lg:text-xl font-bold truncate">{qrCode.title}</h3>
                    <Badge variant="outline" className="w-fit">
                      <Eye className="w-3 h-3 mr-1" />
                      {qrCode.scan_count || 0} scans
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-1 lg:gap-2">
                      <div className="flex items-center gap-2 shrink-0">
                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Original URL:</span>
                      </div>
                      <span className="break-all text-xs lg:text-sm">{qrCode.original_url}</span>
                    </div>
                    
                    <div className="flex flex-col lg:flex-row lg:items-center gap-1 lg:gap-2">
                      <div className="flex items-center gap-2 shrink-0">
                        <QrCode className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Short URL:</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="break-all text-xs lg:text-sm flex-1">{qrCode.short_url}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyShortUrl(qrCode.short_url!)}
                          className="h-6 w-6 p-0 shrink-0"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Created:</span>
                      <span className="text-xs lg:text-sm">{qrCode.created_at ? formatDate(qrCode.created_at) : 'Unknown'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 lg:flex lg:gap-2 lg:justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedQRCode(qrCode);
                    setShowAnalytics(true);
                  }}
                  className="w-full lg:w-auto"
                >
                  <BarChart3 className="w-4 h-4 lg:mr-2" />
                  <span className="hidden lg:inline">Analytics</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // TODO: Implement edit functionality
                    toast({
                      title: "Edit Feature",
                      description: "Edit functionality coming soon!",
                    });
                  }}
                  className="w-full lg:w-auto"
                >
                  <Edit className="w-4 h-4 lg:mr-2" />
                  <span className="hidden lg:inline">Edit</span>
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="w-full lg:w-auto">
                      <Trash2 className="w-4 h-4 lg:mr-2" />
                      <span className="hidden lg:inline">Delete</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete QR Code</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{qrCode.title}"? This action cannot be undone and all analytics data will be lost.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => handleDelete(qrCode.id!)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default QRCodeManager;