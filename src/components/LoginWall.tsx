import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import AuthModal from "./AuthModal";

interface LoginWallProps {
  children: React.ReactNode;
  feature: "geo" | "time" | "limits";
}

const LoginWall = ({ children, feature }: LoginWallProps) => {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // If user is authenticated, show the feature
  if (user) {
    return <>{children}</>;
  }

  // Feature-specific content
  const getFeatureConfig = () => {
    switch (feature) {
      case "geo":
        return {
          image: "/img/location-pin.png",
          title: "Location-Based QR Codes",
          description:
            "Create QR codes that redirect users to different URLs based on their geographic location.",
          benefits: [
            "Event-specific redirects by location",
            "Store finder for multiple locations",
            "Regional marketing campaigns",
            "Location-aware content delivery",
          ],
        };
      case "time":
        return {
          image: "/img/clock.png",
          title: "Time-Scheduled QR Codes",
          description:
            "Set up QR codes that redirect to different URLs based on the time of day or date.",
          benefits: [
            "Business hours → Work website",
            "After hours → Contact form",
            "Lunch time → Menu page",
            "Event-specific timing",
          ],
        };
      case "limits":
        return {
          image: "/img/ticket.png",
          title: "Scan-Limited QR Codes",
          description:
            "Control QR code usage with scan limits and custom expiration handling.",
          benefits: [
            "Limited-time offer campaigns",
            "Exclusive access control",
            "Resource usage management",
            "Custom expiration redirects",
          ],
        };
      default:
        return {
          image: null,
          title: "Premium Feature",
          description: "Unlock advanced QR code capabilities.",
          benefits: ["Advanced features", "Better control", "More options"],
        };
    }
  };

  const config = getFeatureConfig();

  return (
    <>
      <div className="min-h-[400px] w-full">
        <Card className="brutal-card p-6 sm:p-8 text-center space-y-6 w-full border-primary/50 bg-gradient-to-br from-primary/5 to-secondary/30">
          <div className="flex justify-center">
            <div className="relative">
              {config.image ? (
                <img
                  src={config.image}
                  alt={config.title}
                  className="w-28 h-28 object-contain"
                />
              ) : (
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-2xl font-bold uppercase text-foreground">
              {config.title}
            </h3>
            <p className="text-muted-foreground">{config.description}</p>
          </div>

          <div className="space-y-3 text-left">
            {config.benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm font-medium">{benefit}</span>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <Button
              size="lg"
              className="w-full text-lg font-bold"
              onClick={() => setShowAuthModal(true)}
            >
              🚀 Sign in with Google
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setShowAuthModal(true)}
            >
              <Mail className="w-4 h-4 mr-2" />
              Sign up with Email
            </Button>
            <p className="text-xs text-muted-foreground">
              Free to use • No credit card required
            </p>
          </div>
        </Card>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
};

export default LoginWall;
