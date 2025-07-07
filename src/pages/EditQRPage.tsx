import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QRCodeStyling from 'qr-code-styling';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Download, Upload, Palette, AlertTriangle, Save, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { qrService, QRCodeData } from '@/services/qrService';
import QRShapeSelector from '@/components/QRShapeSelector';
import QRBorderSelector from '@/components/QRBorderSelector';
import TimeRuleManager, { TimeRule } from '@/components/TimeRuleManager';
import ProFeatureGuard from '@/components/ProFeatureGuard';
import UpdateButtons from '@/components/UpdateButtons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const EditQRPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [qrCodeData, setQRCodeData] = useState<QRCodeData | null>(null);
  const [loading, setLoading] = useState(true);
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
  const [timeRules, setTimeRules] = useState<TimeRule[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);
  const qrCodeRef = useRef<QRCodeStyling | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

      setQRCodeData(qrCode);
      
      // Populate form fields
      setTitle(qrCode.title);
      setUrl(qrCode.original_url);
      
      // Populate QR settings
      const settings = qrCode.qr_settings;
      if (settings) {
        setQrColor(settings.qrColor || '#000000');
        setBgColor(settings.bgColor || '#FFFFFF');
        setDotsType(settings.dotsType || 'square');
        setCornersSquareType(settings.cornersSquareType || 'square');
        setCornersDotType(settings.cornersDotType || 'square');
        setBorderStyle(settings.borderStyle || 'none');
        setBorderColor(settings.borderColor || '#000000');
        setBorderWidth(settings.borderWidth || 4);
        setLogo(settings.logo || null);
        setTimeRules(settings.timeRules || []);
      }
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
    if (!url.trim()) return;

    // Use the short URL for preview since this is an existing QR code
    const displayUrl = qrCodeData?.short_url || url;
    
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
  }, [url, qrColor, bgColor, dotsType, cornersSquareType, cornersDotType, logo, qrCodeData]);

  const updateQRCode = async () => {
    if (!qrCodeData?.id) return;

    if (!url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a URL",
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
      const updatedData = {
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

      await qrService.updateQRCode(qrCodeData.id, updatedData);
      
      toast({
        title: "QR Code Updated!",
        description: `"${title}" has been successfully updated`,
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Update error:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update QR code. Please try again.",
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

  const clearLogo = () => {
    setLogo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isColorsValid = getColorContrast(qrColor, bgColor) >= 3;

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
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="h-6 bg-secondary rounded w-1/4"></div>
                <div className="h-10 bg-secondary rounded"></div>
                <div className="h-6 bg-secondary rounded w-1/4"></div>
                <div className="h-10 bg-secondary rounded"></div>
              </div>
              <div className="aspect-square bg-secondary rounded"></div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!qrCodeData) {
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
          <h3 className="text-2xl font-bold uppercase mb-4">QR Code Not Found</h3>
          <p className="text-muted-foreground mb-6">
            The QR code you're trying to edit doesn't exist or you don't have access to it.
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
          <span>Edit</span>
          <span>/</span>
          <span className="font-bold text-foreground">{qrCodeData.title}</span>
        </div>
      </div>

      {/* Header */}
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-4xl lg:text-6xl font-black uppercase tracking-tight">
          EDIT QR CODE
          <br />
          <span className="text-primary">{qrCodeData.title}</span>
        </h1>
        <p className="text-lg font-bold text-muted-foreground">
          Update your QR code settings and design
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
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
                  {qrCodeData.short_url && (
                    <div className="p-3 bg-primary/10 border-2 border-primary/20 rounded">
                      <p className="text-sm font-bold text-primary mb-1">🎯 Analytics Enabled</p>
                      <p className="text-xs text-muted-foreground break-all">
                        Tracking URL: {qrCodeData.short_url}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Note: Changing the URL will update where your QR code redirects to, but the tracking URL stays the same.
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
                        className="flex-1 brutal-button"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        UPLOAD LOGO
                      </Button>
                      {logo && (
                        <Button
                          onClick={clearLogo}
                          variant="destructive"
                          className="brutal-button"
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
                    defaultUrl={url || qrCodeData?.original_url || 'https://example.com'}
                  />
                </ProFeatureGuard>
              </TabsContent>
            </Tabs>
            
            {/* Update button outside tabs - always visible */}
            <UpdateButtons
              onUpdate={updateQRCode}
              isSaving={isSaving}
              isValid={isColorsValid}
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
                    <p className="font-bold">QR CODE PREVIEW</p>
                    {!isColorsValid && url.trim() && (
                      <p className="text-sm mt-2 text-destructive">Fix color contrast first</p>
                    )}
                  </div>
                )}
              </div>
              {url.trim() && isColorsValid && (
                <Button
                  onClick={downloadQR}
                  className="w-full mt-6 brutal-button"
                  size="lg"
                >
                  <Download className="w-5 h-5 mr-2" />
                  DOWNLOAD QR CODE
                </Button>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditQRPage;