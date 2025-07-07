import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Globe, 
  Smartphone, 
  Calendar, 
  Download,
  Eye,
  Users,
  MousePointer
} from 'lucide-react';
import { qrService, QRCodeData, AnalyticsSummary } from '@/services/qrService';
import { useToast } from '@/hooks/use-toast';

interface AnalyticsDashboardProps {
  qrCode: QRCodeData;
  onClose?: () => void;
}

const AnalyticsDashboard = ({ qrCode, onClose }: AnalyticsDashboardProps) => {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAnalytics();
  }, [qrCode.id]);

  const loadAnalytics = async () => {
    if (!qrCode.id) return;
    
    setLoading(true);
    try {
      const data = await qrService.getQRCodeAnalytics(qrCode.id);
      setAnalytics(data);
    } catch (error) {
      toast({
        title: "Failed to load analytics",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const exportAnalytics = () => {
    if (!analytics) return;

    const data = {
      qr_code: qrCode.title,
      url: qrCode.original_url,
      total_scans: analytics.total_scans,
      today_scans: analytics.today_scans,
      this_week_scans: analytics.this_week_scans,
      this_month_scans: analytics.this_month_scans,
      top_countries: analytics.top_countries,
      top_devices: analytics.top_devices,
      daily_scans: analytics.daily_scans,
      exported_at: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qr-analytics-${qrCode.title.replace(/[^a-z0-9]/gi, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Analytics Exported",
      description: "Your analytics data has been downloaded",
    });
  };

  if (loading) {
    return (
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
    );
  }

  if (!analytics) {
    return (
      <Card className="brutal-card p-8 text-center">
        <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-bold mb-2">No Analytics Data</h3>
        <p className="text-muted-foreground">Analytics will appear after your QR code is scanned</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold uppercase">{qrCode.title}</h2>
          <p className="text-muted-foreground break-all">{qrCode.original_url}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportAnalytics} variant="outline" size="sm" className="brutal-button">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          {onClose && (
            <Button onClick={onClose} variant="outline" size="sm" className="brutal-button">
              Close
            </Button>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="brutal-card p-4">
          <div className="flex items-center gap-3">
            <Eye className="w-8 h-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{analytics.total_scans}</p>
              <p className="text-sm text-muted-foreground font-bold uppercase">Total Scans</p>
            </div>
          </div>
        </Card>

        <Card className="brutal-card p-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{analytics.today_scans}</p>
              <p className="text-sm text-muted-foreground font-bold uppercase">Today</p>
            </div>
          </div>
        </Card>

        <Card className="brutal-card p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{analytics.this_week_scans}</p>
              <p className="text-sm text-muted-foreground font-bold uppercase">This Week</p>
            </div>
          </div>
        </Card>

        <Card className="brutal-card p-4">
          <div className="flex items-center gap-3">
            <MousePointer className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-2xl font-bold">{analytics.this_month_scans}</p>
              <p className="text-sm text-muted-foreground font-bold uppercase">This Month</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Countries */}
        <Card className="brutal-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5" />
            <h3 className="font-bold uppercase">Top Countries</h3>
          </div>
          <div className="space-y-3">
            {analytics.top_countries && analytics.top_countries.length > 0 ? (
              analytics.top_countries.map((country, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="font-bold">{country.country || 'Unknown'}</span>
                  <Badge variant="secondary">{country.count}</Badge>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No country data available</p>
            )}
          </div>
        </Card>

        {/* Top Devices */}
        <Card className="brutal-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Smartphone className="w-5 h-5" />
            <h3 className="font-bold uppercase">Top Devices</h3>
          </div>
          <div className="space-y-3">
            {analytics.top_devices && analytics.top_devices.length > 0 ? (
              analytics.top_devices.map((device, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="font-bold">{device.device || 'Unknown'}</span>
                  <Badge variant="secondary">{device.count}</Badge>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No device data available</p>
            )}
          </div>
        </Card>
      </div>

      {/* Daily Scans Chart */}
      <Card className="brutal-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5" />
          <h3 className="font-bold uppercase">Daily Scans (Last 30 Days)</h3>
        </div>
        <div className="space-y-2">
          {analytics.daily_scans && analytics.daily_scans.length > 0 ? (
            analytics.daily_scans.slice(0, 10).map((day, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="font-bold">{formatDate(day.date)}</span>
                <div className="flex items-center gap-2">
                  <div 
                    className="bg-primary h-2 rounded"
                    style={{ 
                      width: `${Math.max((day.count / Math.max(...analytics.daily_scans.map(d => d.count))) * 100, 5)}px`,
                      minWidth: '20px'
                    }}
                  ></div>
                  <Badge variant="secondary">{day.count}</Badge>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">No daily scan data available</p>
          )}
        </div>
      </Card>

      {/* QR Code Info */}
      <Card className="brutal-card p-6">
        <h3 className="font-bold uppercase mb-4">QR Code Details</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-bold text-muted-foreground">Short URL:</p>
            <p className="break-all">{qrCode.short_url}</p>
          </div>
          <div>
            <p className="font-bold text-muted-foreground">Created:</p>
            <p>{qrCode.created_at ? formatDate(qrCode.created_at) : 'Unknown'}</p>
          </div>
          <div>
            <p className="font-bold text-muted-foreground">Last Updated:</p>
            <p>{qrCode.updated_at ? formatDate(qrCode.updated_at) : 'Unknown'}</p>
          </div>
          <div>
            <p className="font-bold text-muted-foreground">Total Scans:</p>
            <p>{qrCode.scan_count || 0}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;