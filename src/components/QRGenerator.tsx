import { useState, useRef, useEffect } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Download, Upload, Palette, AlertTriangle, Save, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { qrService, QRCodeData } from '@/services/qrService';
import QRShapeSelector from './QRShapeSelector';
import QRBorderSelector from './QRBorderSelector';
import AuthModal from './AuthModal';
import TimeRuleManager, { TimeRule } from './TimeRuleManager';
import ProFeatureGuard from './ProFeatureGuard';
import SaveButtons from './SaveButtons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';

const QRGenerator = () => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [logo, setLogo] = useState<string | null>(null);
  const [qrColor, setQrColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [dotsType, setDotsType] = useState('square');
  const [cornersSquareType, setCornersSquareType] = useState('square');
  const [cornersDotType, setCornersDotType] = useState('square');
  const [borderStyle, setBorderStyle] = useState('none');
  const [borderColor, setBorderColor] = useState('#000000');
  const [borderWidth, setBorderWidth] = useState(4);
  const [enableAnalytics, setEnableAnalytics] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentQRCode, setCurrentQRCode] = useState<QRCodeData | null>(null);
  const [timeRules, setTimeRules] = useState<TimeRule[]>([]);
  const qrRef = useRef<HTMLDivElement>(null);
  const qrCodeRef = useRef<QRCodeStyling | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Check if colors are too similar
  const getColorContrast = (color1: string, color2: string) => {
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };

    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    if (!rgb1 || !rgb2) return 1;

    const luminance = (r: number, g: number, b: number) => {
      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const l1 = luminance(rgb1.r, rgb1.g, rgb1.b);
    const l2 = luminance(rgb2.r, rgb2.g, rgb2.b);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  };

  const validateColors = () => {
    if (!url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a URL to generate QR code",
        variant: "destructive",
      });
      return false;
    }

    const contrast = getColorContrast(qrColor, bgColor);
    if (contrast < 3) {
      toast({
        title: "Color Contrast Too Low",
        description: "QR and background colors are too similar. The QR code won't be scannable.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogo(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const displayUrl = getDisplayUrl();
    console.log('=== QR CODE GENERATION ===');
    console.log('Display URL for QR code:', displayUrl);
    console.log('Current QR Code object:', currentQRCode);
    console.log('User:', user ? 'authenticated' : 'not authenticated');
    console.log('Analytics enabled:', enableAnalytics);
    
    if (!qrCodeRef.current) {
      qrCodeRef.current = new QRCodeStyling({
        width: 350,
        height: 350,
        type: 'svg',
        data: displayUrl,
        dotsOptions: {
          color: qrColor,
          type: dotsType as any,
        },
        cornersSquareOptions: {
          color: qrColor,
          type: cornersSquareType as any,
        },
        cornersDotOptions: {
          color: qrColor,
          type: cornersDotType as any,
        },
        backgroundOptions: {
          color: bgColor,
        },
        imageOptions: {
          crossOrigin: 'anonymous',
          margin: 10,
        },
      });
    }

    qrCodeRef.current.update({
      data: displayUrl,
      dotsOptions: {
        color: qrColor,
        type: dotsType as any,
      },
      cornersSquareOptions: {
        color: qrColor,
        type: cornersSquareType as any,
      },
      cornersDotOptions: {
        color: qrColor,
        type: cornersDotType as any,
      },
      backgroundOptions: {
        color: bgColor,
      },
      image: logo || undefined,
    });

    if (qrRef.current) {
      qrRef.current.innerHTML = '';
      qrCodeRef.current.append(qrRef.current);
    }
  }, [url, qrColor, bgColor, dotsType, cornersSquareType, cornersDotType, logo, enableAnalytics, currentQRCode]);

  const getDisplayUrl = () => {
    if (!url.trim()) return 'https://example.com';
    
    // For authenticated users with analytics enabled and saved QR code
    if (user && enableAnalytics && currentQRCode?.short_url) {
      console.log('Using short URL:', currentQRCode.short_url);
      return currentQRCode.short_url;
    }
    
    // For all other cases (non-authenticated users or not saved yet), use direct URL
    const directUrl = url.match(/^https?:\/\//) ? url : `https://${url}`;
    console.log('Using direct URL:', directUrl);
    return directUrl;
  };

  const saveQRCode = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save and track QR codes",
        variant: "destructive",
      });
      return;
    }

    if (!url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a URL to save",
        variant: "destructive",
      });
      return;
    }

    if (!title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for your QR code",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const qrData = {
        title: title.trim(),
        original_url: url.trim(),
        qr_settings: {
          qrColor,
          bgColor,
          dotsType,
          cornersSquareType,
          cornersDotType,
          borderStyle,
          borderColor,
          borderWidth,
          logo,
          timeRules,
        },
      };

      const savedQRCode = await qrService.createQRCode(qrData);
      setCurrentQRCode(savedQRCode);
      
      toast({
        title: "QR Code Saved!",
        description: `"${title}" has been saved with analytics tracking enabled`,
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save QR code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const downloadQR = () => {
    if (!qrCodeRef.current) return;
    
    try {
      const filename = title.trim() ? title.replace(/[^a-z0-9]/gi, '_') : 'qr-code';
      qrCodeRef.current.download({ name: filename, extension: 'png' });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download QR code",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setCurrentQRCode(null);
    setTitle('');
    setUrl('');
    setLogo(null);
    setTimeRules([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const clearLogo = () => {
    setLogo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isColorsValid = getColorContrast(qrColor, bgColor) >= 3;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-6">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="relative group">
            <img 
              src="/img/qr.png" 
              alt="QR Blast Logo" 
              className="w-24 h-24 transition-transform duration-300 group-hover:scale-110 drop-shadow-lg"
            />
            <div className="absolute -inset-2 bg-primary/20 rounded-xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-6xl font-black uppercase tracking-tight">
            QR CODE
            <br />
            <span className="text-primary">GENERATOR</span>
          </h1>
          <p className="text-xl font-bold text-muted-foreground">
            CREATE BRUTAL QR CODES WITH YOUR LOGO
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <Card className="brutal-card p-8 space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="shapes">Shapes</TabsTrigger>
              <TabsTrigger value="borders">Borders</TabsTrigger>
              <TabsTrigger value="time">Time Rules</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-6">
              {user && (
                <div className="space-y-3">
                  <Label htmlFor="title" className="text-lg font-bold uppercase">
                    QR Code Title
                  </Label>
                  <Input
                    id="title"
                    placeholder="My Website QR Code"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="brutal-input h-14 text-lg"
                  />
                </div>
              )}
              
              <div className="space-y-3">
                <Label htmlFor="url" className="text-lg font-bold uppercase">
                  Website URL
                </Label>
                <Input
                  id="url"
                  placeholder="Enter: www.example.com or https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="brutal-input h-14 text-lg"
                />
                {url && !url.match(/^https?:\/\//) && (
                  <div className="p-2 bg-blue-50 border-2 border-blue-200 rounded">
                    <p className="text-sm text-blue-700">
                      ℹ️ Will be saved as: <strong>https://{url}</strong>
                    </p>
                  </div>
                )}
                {user && enableAnalytics && currentQRCode && (
                  <div className="p-3 bg-primary/10 border-2 border-primary/20 rounded">
                    <p className="text-sm font-bold text-primary mb-1">🎯 Analytics Enabled</p>
                    <p className="text-xs text-muted-foreground break-all">
                      Tracking URL: {currentQRCode.short_url}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label className="text-lg font-bold uppercase">Company Logo</Label>
                <div className="space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <div className="flex gap-3">
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      className="flex-1"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      UPLOAD LOGO
                    </Button>
                    {logo && (
                      <Button
                        onClick={clearLogo}
                        variant="destructive"
                      >
                        CLEAR
                      </Button>
                    )}
                  </div>
                  {logo && (
                    <div className="p-4 border-4 border-border bg-secondary">
                      <img src={logo} alt="Logo preview" className="h-16 mx-auto" />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="qr-color" className="text-lg font-bold uppercase">
                    QR Color
                  </Label>
                  <div className="flex gap-2 items-center">
                    <input
                      id="qr-color"
                      type="color"
                      value={qrColor}
                      onChange={(e) => setQrColor(e.target.value)}
                      className="brutal-input h-14 w-20 cursor-pointer"
                    />
                    <Input
                      value={qrColor}
                      onChange={(e) => setQrColor(e.target.value)}
                      className="brutal-input h-14"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="bg-color" className="text-lg font-bold uppercase">
                    Background
                  </Label>
                  <div className="flex gap-2 items-center">
                    <input
                      id="bg-color"
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="brutal-input h-14 w-20 cursor-pointer"
                    />
                    <Input
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="brutal-input h-14"
                    />
                  </div>
                </div>
              </div>

              {user && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-bold uppercase">Enable Analytics</Label>
                    <Switch
                      checked={enableAnalytics}
                      onCheckedChange={setEnableAnalytics}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Track scans, locations, devices, and get detailed insights
                  </p>
                </div>
              )}

              {!isColorsValid && (
                <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-3 border-4 border-destructive/20">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-bold">Colors too similar - QR won't scan!</span>
                </div>
              )}

            </TabsContent>
            
            <TabsContent value="shapes">
              <QRShapeSelector
                dotsType={dotsType}
                cornersSquareType={cornersSquareType}
                cornersDotType={cornersDotType}
                onDotsTypeChange={setDotsType}
                onCornersSquareTypeChange={setCornersSquareType}
                onCornersDotTypeChange={setCornersDotType}
              />
            </TabsContent>
            
            <TabsContent value="borders">
              <QRBorderSelector
                borderStyle={borderStyle}
                borderColor={borderColor}
                borderWidth={borderWidth}
                onBorderStyleChange={setBorderStyle}
                onBorderColorChange={setBorderColor}
                onBorderWidthChange={setBorderWidth}
              />
            </TabsContent>
            
            <TabsContent value="time">
              <ProFeatureGuard>
                <TimeRuleManager
                  rules={timeRules}
                  onRulesChange={setTimeRules}
                  defaultUrl={url || 'https://example.com'}
                />
              </ProFeatureGuard>
            </TabsContent>
          </Tabs>
          
          {/* Save buttons outside tabs - always visible */}
          <SaveButtons
            onSave={saveQRCode}
            onReset={resetForm}
            isSaving={isSaving}
            isValid={isColorsValid}
            currentQRCode={currentQRCode}
            url={url}
            title={title}
          />
        </Card>

        {/* Output Section */}
        <div className="space-y-6">
          <Card className="brutal-card p-8">
            <div 
              className={`aspect-square bg-secondary flex items-center justify-center ${
                borderStyle !== 'none' 
                  ? `border-${borderWidth} border-${borderStyle === 'double' ? 'double' : borderStyle === 'dashed' ? 'dashed' : 'solid'} ${
                      borderStyle === 'rounded' ? 'rounded-lg' : ''
                    }`
                  : 'border-4 border-border'
              }`}
              style={{
                borderColor: borderStyle !== 'none' ? borderColor : undefined,
                borderWidth: borderStyle !== 'none' ? `${borderWidth}px` : undefined,
              }}
            >
              {url.trim() && isColorsValid ? (
                <div ref={qrRef} className="flex items-center justify-center" />
              ) : (
                <div className="text-center text-muted-foreground">
                  <Palette className="w-12 h-12 mx-auto mb-4" />
                  <p className="font-bold">QR CODE WILL APPEAR HERE</p>
                  {!isColorsValid && url.trim() && (
                    <p className="text-sm mt-2 text-destructive">Fix color contrast first</p>
                  )}
                </div>
              )}
            </div>
            {url.trim() && isColorsValid && (
              <Button
                onClick={downloadQR}
                className="w-full mt-6"
                size="lg"
              >
                <Download className="w-5 h-5 mr-2" />
                DOWNLOAD QR CODE
              </Button>
            )}
          </Card>

          {/* Ad Space */}
          <div className="ad-space p-8 min-h-[200px] flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <p className="font-bold text-lg">ADVERTISEMENT SPACE</p>
              <p className="text-sm mt-2">Help us keep this service free!</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default QRGenerator;