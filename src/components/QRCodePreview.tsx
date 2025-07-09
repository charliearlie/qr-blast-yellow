import React, { useRef, useState, useCallback } from "react";
import QRCodeStyling from "qr-code-styling";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Maximize2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Separate component for modal QR code to handle its own rendering
const ModalQRCode: React.FC<{ url: string; settings: any; containerStyle: React.CSSProperties }> = ({ url, settings, containerStyle }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<QRCodeStyling | null>(null);

  const createQROptions = useCallback((width: number, height: number) => ({
    width,
    height,
    type: "svg" as const,
    data: url,
    dotsOptions: {
      color: settings?.qrColor || "#000000",
      type: (settings?.dotsType || "square") as any,
    },
    cornersSquareOptions: {
      color: settings?.qrColor || "#000000",
      type: (settings?.cornersSquareType || "square") as any,
    },
    cornersDotOptions: {
      color: settings?.qrColor || "#000000",
      type: (settings?.cornersDotType || "square") as any,
    },
    backgroundOptions: {
      color: settings?.bgColor || "#FFFFFF",
    },
    imageOptions: {
      crossOrigin: "anonymous" as const,
      margin: 10,
    },
    image: settings?.logo || undefined,
  }), [url, settings]);

  React.useLayoutEffect(() => {
    if (!modalRef.current || !url) return;

    const options = createQROptions(300, 300);
    
    if (!qrRef.current) {
      qrRef.current = new QRCodeStyling(options);
    } else {
      qrRef.current.update(options);
    }

    modalRef.current.innerHTML = "";
    qrRef.current.append(modalRef.current);
  }, [url, settings, createQROptions]);

  return (
    <div 
      ref={modalRef}
      style={containerStyle}
      className="qr-modal-container bg-white p-4 border-2 border-black"
      data-testid="modal-qr-container"
    />
  );
};

interface QRCodePreviewProps {
  url: string;
  settings: any;
  size?: number;
  className?: string;
  showActions?: boolean;
}

export const QRCodePreview: React.FC<QRCodePreviewProps> = ({
  url,
  settings,
  size = 120,
  className = "",
  showActions = true,
}) => {
  const [showModal, setShowModal] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const qrCodeRef = useRef<QRCodeStyling | null>(null);
  const { toast } = useToast();

  const createQROptions = useCallback((width: number, height: number, type: "svg" | "canvas" = "svg") => ({
    width,
    height,
    type,
    data: url,
    dotsOptions: {
      color: settings?.qrColor || "#000000",
      type: (settings?.dotsType || "square") as any,
    },
    cornersSquareOptions: {
      color: settings?.qrColor || "#000000",
      type: (settings?.cornersSquareType || "square") as any,
    },
    cornersDotOptions: {
      color: settings?.qrColor || "#000000",
      type: (settings?.cornersDotType || "square") as any,
    },
    backgroundOptions: {
      color: settings?.bgColor || "#FFFFFF",
    },
    imageOptions: {
      crossOrigin: "anonymous" as const,
      margin: 10,
    },
    image: settings?.logo || undefined,
  }), [url, settings]);

  const renderQRCode = useCallback(() => {
    if (!url || !ref.current) return;

    const options = createQROptions(size, size);
    
    if (!qrCodeRef.current) {
      qrCodeRef.current = new QRCodeStyling(options);
    } else {
      qrCodeRef.current.update(options);
    }

    ref.current.innerHTML = "";
    qrCodeRef.current.append(ref.current);
  }, [url, settings, size, createQROptions]);


  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!url) return;

    try {
      const downloadQr = new QRCodeStyling(createQROptions(1024, 1024));

      await downloadQr.download({
        name: "qr-code",
        extension: "png",
      });

      toast({
        title: "Success",
        description: "QR code downloaded successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download QR code",
        variant: "destructive",
      });
    }
  };

  const borderStyle = settings?.borderStyle || "solid";
  const borderWidth = settings?.borderWidth || 0;
  const borderColor = settings?.borderColor || "#000000";

  const containerStyle: React.CSSProperties = {
    border: borderWidth > 0 ? `${borderWidth}px ${borderStyle} ${borderColor}` : "none",
    borderRadius: borderStyle === "rounded" ? "8px" : "0",
  };

  // Render QR code when component mounts or data changes
  React.useLayoutEffect(() => {
    renderQRCode();
  }, [renderQRCode]);

  if (!url) {
    return (
      <div className={`brutal-card-yellow p-4 ${className}`}>
        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
          <p className="text-sm">No URL</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div 
        className={`brutal-card-yellow p-4 cursor-pointer relative group ${className}`}
        onClick={() => setShowModal(true)}
      >
        <div 
          ref={ref} 
          style={containerStyle}
          className="qr-preview-container"
        />
        
        {showActions && (
          <div className="absolute inset-0 bg-black bg-opacity-80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              onClick={handleDownload}
              className="brutal-button"
              size="sm"
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setShowModal(true);
              }}
              className="brutal-button"
              size="sm"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="brutal-card max-w-md">
          <div className="flex flex-col items-center gap-6 p-2">
            <h3 className="text-2xl font-bold uppercase text-center">QR Code Preview</h3>
            
            <div className="flex flex-col items-center gap-3">
              {showModal && (
                <ModalQRCode 
                  url={url} 
                  settings={settings} 
                  containerStyle={containerStyle}
                />
              )}
              
              <div className="text-center text-sm text-muted-foreground max-w-xs">
                <p className="font-medium truncate">{url}</p>
              </div>
            </div>
            
            <div className="flex gap-3 w-full">
              <Button
                onClick={handleDownload}
                className="brutal-button flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PNG
              </Button>
              <Button
                onClick={() => setShowModal(false)}
                variant="outline"
                className="brutal-button flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};