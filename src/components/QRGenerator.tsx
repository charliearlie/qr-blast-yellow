import { useState, useRef, useEffect } from "react";
import QRCodeStyling from "qr-code-styling";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Download,
  Upload,
  Palette,
  AlertTriangle,
  Save,
  BarChart3,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { qrService, QRCodeData } from "@/services/qrService";
import { supabase } from "@/integrations/supabase/client";
import QRShapeSelector from "./QRShapeSelector";
import QRBorderSelector from "./QRBorderSelector";
import AuthModal from "./AuthModal";
import TimeRuleManager, { TimeRule } from "./TimeRuleManager";
import GeoRuleManager, { GeoRule } from "./GeoRuleManager";
import LoginWall from "./LoginWall";
import SaveButtons from "./SaveButtons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import ScanLimitManager from "./ScanLimitManager";
import TemplateSelector from "./TemplateSelector";
import { templates, QRTemplate } from "@/config/templates";

const QRGenerator = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<QRTemplate>(
    templates.find((t) => t.isDefault)!
  );
  const [userInput, setUserInput] = useState("");
  const [title, setTitle] = useState("");
  const [logo, setLogo] = useState<string | null>(null);
  const [qrColor, setQrColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [dotsType, setDotsType] = useState("square");
  const [cornersSquareType, setCornersSquareType] = useState("square");
  const [cornersDotType, setCornersDotType] = useState("square");
  const [borderStyle, setBorderStyle] = useState("none");
  const [borderColor, setBorderColor] = useState("#000000");
  const [borderWidth, setBorderWidth] = useState(4);
  const [enableAnalytics, setEnableAnalytics] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentQRCode, setCurrentQRCode] = useState<QRCodeData | null>(null);
  const [timeRules, setTimeRules] = useState<TimeRule[]>([]);
  const [geoRules, setGeoRules] = useState<GeoRule[]>([]);
  const [scanLimitEnabled, setScanLimitEnabled] = useState(false);
  const [scanLimit, setScanLimit] = useState<number | null>(100);
  const [expiredUrl, setExpiredUrl] = useState("");
  const [isSuggesting, setIsSuggesting] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);
  const qrCodeRef = useRef<QRCodeStyling | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Derive the full URL from template and user input
  const url = userInput.trim()
    ? `${selectedTemplate.urlPrefix}${userInput.trim()}`
    : "";

  // Check if colors are too similar
  const getColorContrast = (color1: string, color2: string) => {
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : null;
    };

    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    if (!rgb1 || !rgb2) return 1;

    const luminance = (r: number, g: number, b: number) => {
      const [rs, gs, bs] = [r, g, b].map((c) => {
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
        description:
          "QR and background colors are too similar. The QR code won't be scannable.",
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
    // Only generate QR code if user has entered content
    if (!userInput.trim()) {
      return;
    }

    const displayUrl = getDisplayUrl();
    console.log("=== QR CODE GENERATION ===");
    console.log("Display URL for QR code:", displayUrl);
    console.log("Current QR Code object:", currentQRCode);
    console.log("User:", user ? "authenticated" : "not authenticated");
    console.log("Analytics enabled:", enableAnalytics);

    if (!qrCodeRef.current) {
      qrCodeRef.current = new QRCodeStyling({
        width: 250,
        height: 250,
        type: "svg",
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
          crossOrigin: "anonymous",
          margin: 10,
        },
        image: logo || selectedTemplate.logoUrl,
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
      image: logo || selectedTemplate.logoUrl,
    });

    if (qrRef.current && qrCodeRef.current) {
      // Clear existing content safely
      while (qrRef.current.firstChild) {
        qrRef.current.removeChild(qrRef.current.firstChild);
      }
      qrCodeRef.current.append(qrRef.current);
    }
  }, [
    userInput,
    url,
    qrColor,
    bgColor,
    dotsType,
    cornersSquareType,
    cornersDotType,
    logo,
    enableAnalytics,
    currentQRCode,
    selectedTemplate,
  ]);

  const getDisplayUrl = () => {
    if (!url.trim()) return "https://example.com";

    // For authenticated users with analytics enabled and saved QR code
    if (user && enableAnalytics && currentQRCode?.short_url) {
      console.log("Using short URL:", currentQRCode.short_url);
      return currentQRCode.short_url;
    }

    // For all other cases (non-authenticated users or not saved yet), use direct URL
    try {
      const directUrl = url.match(/^https?:\/\//) ? url : `https://${url}`;
      // Validate URL format
      new URL(directUrl);
      console.log("Using direct URL:", directUrl);
      return directUrl;
    } catch (error) {
      console.log("Invalid URL, using fallback:", url);
      return "https://example.com";
    }
  };

  const handleSelectTemplate = (template: QRTemplate) => {
    setSelectedTemplate(template);
    setUserInput("");
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
      console.log("=== SAVING QR CODE ===");
      console.log("Time rules being saved:", timeRules);
      console.log("Geo rules being saved:", geoRules);

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
          geoRules,
        },
        scan_limit: scanLimitEnabled ? scanLimit : null,
        expired_url: scanLimitEnabled ? expiredUrl : null,
      };

      console.log("Complete qrData object:", JSON.stringify(qrData, null, 2));

      const savedQRCode = await qrService.createQRCode(qrData);
      console.log("Saved QR code response:", savedQRCode);
      setCurrentQRCode(savedQRCode);

      toast({
        title: "QR Code Saved!",
        description: `"${title}" has been saved with analytics tracking enabled`,
      });
    } catch (error) {
      console.error("Save error:", error);
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
      const filename = title.trim()
        ? title.replace(/[^a-z0-9]/gi, "_")
        : "qr-code";
      qrCodeRef.current.download({ name: filename, extension: "png" });
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
    setTitle("");
    setUserInput("");
    setLogo(null);
    setTimeRules([]);
    setGeoRules([]);
    setScanLimitEnabled(false);
    setScanLimit(100);
    setExpiredUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const clearLogo = () => {
    setLogo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSuggestBranding = async () => {
    if (!userInput.trim()) {
      toast({ title: "Please enter a URL first.", variant: "destructive" });
      return;
    }

    setIsSuggesting(true);
    try {
      const { data, error } = await supabase.functions.invoke("url-inspector", {
        body: { url: userInput.trim() },
      });

      if (error || data.error) {
        throw new Error(error?.message || data.error);
      }

      let updated = false;
      if (data.faviconUrl) {
        setLogo(data.faviconUrl);
        updated = true;
      }
      if (data.themeColor) {
        setQrColor(data.themeColor);
        updated = true;
      }

      if (updated) {
        const logoText = data.faviconUrl ? "logo" : "";
        const colorText = data.themeColor ? "theme color" : "";

        let description = "We found ";
        if (logoText && colorText) {
          description += `a ${logoText} and ${colorText} for you.`;
        } else if (logoText) {
          description += `a ${logoText} for you.`;
        } else if (colorText) {
          description += `a ${colorText} for you.`;
        }

        toast({ title: "Branding applied!", description });
      } else {
        toast({
          title: "No branding found.",
          description: "We couldn't automatically find a logo or theme color.",
        });
      }
    } catch (err: any) {
      toast({
        title: "Analysis Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsSuggesting(false);
    }
  };

  const isColorsValid = getColorContrast(qrColor, bgColor) >= 3;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Input Section */}
        <Card className="brutal-card p-8 space-y-6 lg:col-span-2">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 h-auto p-1 gap-1">
              <TabsTrigger value="basic" className="text-xs px-2 py-2">
                Basic
              </TabsTrigger>
              <TabsTrigger value="shapes" className="text-xs px-2 py-2">
                Shapes
              </TabsTrigger>
              <TabsTrigger value="borders" className="text-xs px-2 py-2">
                Borders
              </TabsTrigger>
              <TabsTrigger value="geo" className="text-xs px-2 py-2">
                Geo
              </TabsTrigger>
              <TabsTrigger value="time" className="text-xs px-2 py-2">
                Time
              </TabsTrigger>
              <TabsTrigger value="limits" className="text-xs px-2 py-2">
                Limits
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              {user && (
                <div className="space-y-3">
                  <Label
                    htmlFor="title"
                    className="text-lg font-bold uppercase"
                  >
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
                <Label className="text-lg font-bold uppercase">
                  Choose a Template
                </Label>
                <TemplateSelector
                  selectedTemplateId={selectedTemplate.id}
                  onSelectTemplate={handleSelectTemplate}
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="url" className="text-lg font-bold uppercase">
                  {selectedTemplate.name} URL
                </Label>
                <Input
                  id="url"
                  placeholder={selectedTemplate.placeholder}
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
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
                    <p className="text-sm font-bold text-primary mb-1">
                      🎯 Analytics Enabled
                    </p>
                    <p className="text-xs text-muted-foreground break-all">
                      Tracking URL: {currentQRCode.short_url}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label className="text-lg font-bold uppercase">
                  Company Logo
                </Label>
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
                      <Button onClick={clearLogo} variant="destructive">
                        CLEAR
                      </Button>
                    )}
                  </div>
                  {logo && (
                    <div className="p-4 border-4 border-border bg-secondary">
                      <img
                        src={logo}
                        alt="Logo preview"
                        className="h-16 mx-auto"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center mb-4">
                <Label className="text-lg font-bold uppercase">
                  Colors & Branding
                </Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSuggestBranding}
                  disabled={isSuggesting || !userInput.trim()}
                >
                  {isSuggesting ? "Analyzing..." : "Suggest from URL"}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label
                    htmlFor="qr-color"
                    className="text-lg font-bold uppercase"
                  >
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
                  <Label
                    htmlFor="bg-color"
                    className="text-lg font-bold uppercase"
                  >
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
                    <Label
                      htmlFor="analytics-switch"
                      className="text-lg font-bold uppercase"
                    >
                      Enable Analytics
                    </Label>
                    <Switch
                      id="analytics-switch"
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
                  <span className="text-sm font-bold">
                    Colors too similar - QR won't scan!
                  </span>
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

            <TabsContent value="geo">
              <LoginWall feature="geo">
                <GeoRuleManager
                  rules={geoRules}
                  onRulesChange={setGeoRules}
                  defaultUrl={url || "https://example.com"}
                />
              </LoginWall>
            </TabsContent>

            <TabsContent value="time">
              <LoginWall feature="time">
                <TimeRuleManager
                  rules={timeRules}
                  onRulesChange={setTimeRules}
                  defaultUrl={url || "https://example.com"}
                />
              </LoginWall>
            </TabsContent>

            <TabsContent value="limits">
              <LoginWall feature="limits">
                <ScanLimitManager
                  isEnabled={scanLimitEnabled}
                  onEnabledChange={setScanLimitEnabled}
                  limit={scanLimit}
                  onLimitChange={setScanLimit}
                  expiredUrl={expiredUrl}
                  onExpiredUrlChange={setExpiredUrl}
                />
              </LoginWall>
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
        <div className="space-y-6 lg:col-span-1">
          <Card className="brutal-card p-4">
            <div
              className={`aspect-square bg-secondary flex items-center justify-center ${
                borderStyle !== "none"
                  ? `border-${borderWidth} border-${
                      borderStyle === "double"
                        ? "double"
                        : borderStyle === "dashed"
                        ? "dashed"
                        : "solid"
                    } ${borderStyle === "rounded" ? "rounded-lg" : ""}`
                  : "border-4 border-border"
              }`}
              style={{
                borderColor: borderStyle !== "none" ? borderColor : undefined,
                borderWidth:
                  borderStyle !== "none" ? `${borderWidth}px` : undefined,
              }}
            >
              {userInput.trim() && isColorsValid ? (
                <div ref={qrRef} className="flex items-center justify-center" />
              ) : (
                <div className="text-center text-muted-foreground">
                  <img
                    src="/img/qr.png"
                    alt="QR Code placeholder"
                    className="w-24 h-24 mx-auto mb-4"
                  />
                  <p className="font-bold">QR CODE WILL APPEAR HERE</p>
                  {!isColorsValid && userInput.trim() && (
                    <p className="text-sm mt-2 text-destructive">
                      Fix color contrast first
                    </p>
                  )}
                </div>
              )}
            </div>
            {userInput.trim() && isColorsValid && (
              <Button onClick={downloadQR} className="w-full mt-4" size="sm">
                <Download className="w-4 h-4 mr-1" />
                DOWNLOAD QR CODE
              </Button>
            )}
          </Card>

          {/* Coming Soon Button - outside the QR preview card */}
          <div className="text-center">
            <Button variant="link" disabled className="text-sm">
              Order High-Quality Stickers (Coming Soon)
            </Button>
          </div>

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
