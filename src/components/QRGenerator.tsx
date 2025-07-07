import { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Download, Upload, Palette } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const QRGenerator = () => {
  const [url, setUrl] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [logo, setLogo] = useState<string | null>(null);
  const [qrColor, setQrColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const generateQR = async () => {
    if (!url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a URL to generate QR code",
        variant: "destructive",
      });
      return;
    }

    try {
      const qrData = await QRCode.toDataURL(url, {
        width: 400,
        margin: 2,
        color: {
          dark: qrColor,
          light: bgColor,
        },
      });
      setQrDataUrl(qrData);
      
      // If there's a logo, composite it
      if (logo) {
        compositeLogoOnQR(qrData);
      }
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate QR code",
        variant: "destructive",
      });
    }
  };

  const compositeLogoOnQR = (qrData: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const qrImg = new Image();
    const logoImg = new Image();

    qrImg.onload = () => {
      canvas.width = qrImg.width;
      canvas.height = qrImg.height;
      
      // Draw QR code
      ctx.drawImage(qrImg, 0, 0);

      logoImg.onload = () => {
        // Logo size (20% of QR code)
        const logoSize = Math.min(qrImg.width, qrImg.height) * 0.2;
        const x = (qrImg.width - logoSize) / 2;
        const y = (qrImg.height - logoSize) / 2;

        // White background for logo
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x - 8, y - 8, logoSize + 16, logoSize + 16);
        
        // Draw logo
        ctx.drawImage(logoImg, x, y, logoSize, logoSize);
        
        // Update QR data URL with composited image
        setQrDataUrl(canvas.toDataURL());
      };
      
      logoImg.src = logo!;
    };
    
    qrImg.src = qrData;
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
    if (!qrDataUrl) return;
    
    const link = document.createElement('a');
    link.download = 'qr-code.png';
    link.href = qrDataUrl;
    link.click();
  };

  const clearLogo = () => {
    setLogo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    if (url && qrDataUrl) {
      generateQR();
    }
  }, [logo, qrColor, bgColor]);

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

          <Button
            onClick={generateQR}
            className="w-full"
            size="lg"
          >
            <Palette className="w-5 h-5 mr-2" />
            GENERATE QR CODE
          </Button>
        </Card>

        {/* Output Section */}
        <div className="space-y-6">
          <Card className="brutal-card p-8">
            <div className="aspect-square bg-secondary border-4 border-border flex items-center justify-center">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="Generated QR Code" className="max-w-full max-h-full" />
              ) : (
                <div className="text-center text-muted-foreground">
                  <Palette className="w-12 h-12 mx-auto mb-4" />
                  <p className="font-bold">QR CODE WILL APPEAR HERE</p>
                </div>
              )}
            </div>
            {qrDataUrl && (
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

      {/* Hidden canvas for logo composition */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default QRGenerator;