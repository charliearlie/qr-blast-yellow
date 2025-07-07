import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Lock, Star, Zap, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProFeatureGuardProps {
  children: React.ReactNode;
}

const ProFeatureGuard = ({ children }: ProFeatureGuardProps) => {
  const { user } = useAuth();
  
  // Check for the 'pro' plan in user metadata.
  // For now, we'll assume no one is 'pro' unless we manually set it in Supabase.
  const isPro = user?.user_metadata?.plan === 'pro';

  // TEMPORARY: Force pro access for testing
  // TODO: Remove this line when user metadata refresh is working
  if (true || isPro) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {/* Show the content but make it less interactive */}
      <div className="opacity-60 pointer-events-none">
        {children}
      </div>
      
      {/* Overlay with paywall */}
      <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <Card className="brutal-card p-8 text-center space-y-6 max-w-md mx-4 border-primary/50 bg-gradient-to-br from-primary/5 to-secondary/30">
          <div className="flex justify-center">
            <div className="relative">
              <Clock className="w-16 h-16 text-primary" />
              <Star className="w-6 h-6 absolute -top-1 -right-1 text-yellow-500 animate-pulse" />
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              <h3 className="text-2xl font-bold uppercase text-primary">Pro Feature</h3>
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <h4 className="text-xl font-bold">Time-Aware QR Codes</h4>
            <p className="text-muted-foreground">
              Unlock the power to redirect users to different URLs based on the time of day!
            </p>
          </div>

          <div className="space-y-3 text-left">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-sm font-medium">Business hours → Work website</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-sm font-medium">After hours → Contact form</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-sm font-medium">Lunch time → Menu page</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-sm font-medium">And much more!</span>
            </div>
          </div>

          <div className="space-y-3">
            <Button size="lg" className="w-full text-lg font-bold">
              <Star className="w-5 h-5 mr-2" />
              Upgrade to Pro
            </Button>
            <p className="text-xs text-muted-foreground">
              Coming Soon • Join the waitlist for early access
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProFeatureGuard;