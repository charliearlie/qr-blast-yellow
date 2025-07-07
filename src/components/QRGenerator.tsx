import { useState, useRef } from 'react';
import { QRCode } from 'react-qrcode-logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Download, Upload, Palette, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const QRGenerator = () => {
  const [url, setUrl] = useState('');
  const [logo, setLogo] = useState<string | null>(null);
  const [qrColor, setQrColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const qrRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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

  const downloadQR = () => {
    if (!qrRef.current) return;
    
    try {
      qrRef.current.download('png', 'qr-code.png');
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

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-black uppercase tracking-tight">
          QR CODE
          <br />
          <span className="text-primary">GENERATOR</span>
        </h1>
        <p className="text-xl font-bold text-muted-foreground">
          CREATE BRUTAL QR CODES WITH YOUR LOGO
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <Card className="brutal-card p-8 space-y-6">
          <div className="space-y-3">
            <Label htmlFor="url" className="text-lg font-bold uppercase">
              Website URL
            </Label>
            <Input
              id="url"
              placeholder="https://yoursite.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="brutal-input h-14 text-lg"
            />
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

          {!isColorsValid && (
            <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-3 border-4 border-destructive/20">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-bold">Colors too similar - QR won't scan!</span>
            </div>
          )}
          
          <Button
            onClick={() => validateColors()}
            className="w-full"
            size="lg"
            disabled={!url.trim() || !isColorsValid}
          >
            <Palette className="w-5 h-5 mr-2" />
            GENERATE QR CODE
          </Button>
        </Card>

        {/* Output Section */}
        <div className="space-y-6">
          <Card className="brutal-card p-8">
            <div className="aspect-square bg-secondary border-4 border-border flex items-center justify-center">
              {url.trim() && isColorsValid ? (
                <QRCode
                  ref={qrRef}
                  value={url}
                  size={350}
                  fgColor={qrColor}
                  bgColor={bgColor}
                  logoImage={logo || undefined}
                  logoWidth={70}
                  logoHeight={70}
                  logoOpacity={1}
                  removeQrCodeBehindLogo={true}
                  qrStyle="dots"
                  eyeRadius={8}
                />
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