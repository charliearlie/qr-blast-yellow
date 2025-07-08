import { useEffect, useState } from 'react';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ProFeatureGuard from '@/components/ProFeatureGuard';
import { Sparkles } from 'lucide-react';

interface BrandingManagerProps {
  brandingEnabled: boolean;
  setBrandingEnabled: (enabled: boolean) => void;
  brandingDuration: number;
  setBrandingDuration: (duration: number) => void;
  brandingStyle: 'minimal' | 'full' | 'custom';
  setBrandingStyle: (style: 'minimal' | 'full' | 'custom') => void;
  customBrandingText: string;
  setCustomBrandingText: (text: string) => void;
}

export function BrandingManager({
  brandingEnabled,
  setBrandingEnabled,
  brandingDuration,
  setBrandingDuration,
  brandingStyle,
  setBrandingStyle,
  customBrandingText,
  setCustomBrandingText,
}: BrandingManagerProps) {
  const user = useUser();
  const supabase = useSupabaseClient();
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkProStatus() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      const isProUser = user?.user_metadata?.subscription_tier === 'pro';
      setIsPro(isProUser);
      setLoading(false);
    }
    checkProStatus();
  }, [supabase, user]);

  return (
    <ProFeatureGuard featureName="Branding Display">
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="branding-enabled" className="text-base font-medium">
              Enable Branding Display
            </Label>
            <Switch
              id="branding-enabled"
              checked={brandingEnabled}
              onCheckedChange={setBrandingEnabled}
              disabled={!isPro}
              aria-checked={brandingEnabled}
            />
          </div>

          {!isPro && (
            <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertDescription>
                Upgrade to Pro to add professional branding that displays before redirecting visitors.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label className="text-base font-medium">
              Display Duration: {brandingDuration} seconds
            </Label>
            <Slider
              value={[brandingDuration]}
              onValueChange={(value) => setBrandingDuration(value[0])}
              min={1}
              max={10}
              step={1}
              disabled={!isPro}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">
              How long to display your branding before redirecting
            </p>
          </div>

          <div className="space-y-3">
            <Label className="text-base font-medium">Branding Style</Label>
            <RadioGroup
              value={brandingStyle}
              onValueChange={(value) => setBrandingStyle(value as 'minimal' | 'full' | 'custom')}
              disabled={!isPro}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="minimal" id="minimal" />
                <Label htmlFor="minimal" className="cursor-pointer">
                  Minimal
                  <span className="block text-sm text-muted-foreground">
                    Small logo and "Powered by Blast QR"
                  </span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="full" id="full" />
                <Label htmlFor="full" className="cursor-pointer">
                  Full Branding
                  <span className="block text-sm text-muted-foreground">
                    Large branding with tagline
                  </span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="custom" />
                <Label htmlFor="custom" className="cursor-pointer">
                  Custom
                  <span className="block text-sm text-muted-foreground">
                    Your custom message with Blast QR attribution
                  </span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {brandingStyle === 'custom' && (
            <div className="space-y-2">
              <Label htmlFor="custom-text">Custom Message</Label>
              <Input
                id="custom-text"
                placeholder="Your custom message"
                value={customBrandingText}
                onChange={(e) => setCustomBrandingText(e.target.value)}
                disabled={!isPro}
                maxLength={100}
              />
              <p className="text-sm text-muted-foreground">
                This will be displayed with "Powered by Blast QR" attribution
              </p>
            </div>
          )}
        </div>

        {brandingEnabled && isPro && (
          <div className="border rounded-lg p-6 bg-muted/50">
            <h3 className="font-semibold mb-4">Preview</h3>
            <div className="bg-background rounded-lg p-8 text-center space-y-4">
              {brandingStyle === 'minimal' && (
                <>
                  <div className="text-2xl font-bold">Blast QR</div>
                  <p className="text-sm text-muted-foreground">Powered by Blast QR</p>
                </>
              )}
              {brandingStyle === 'full' && (
                <>
                  <div className="text-3xl font-bold">Blast QR</div>
                  <p className="text-lg text-muted-foreground">
                    Smart QR Codes for Modern Business
                  </p>
                  <p className="text-sm text-muted-foreground mt-4">
                    Redirecting in {brandingDuration} seconds...
                  </p>
                </>
              )}
              {brandingStyle === 'custom' && (
                <>
                  <p className="text-xl">{customBrandingText || 'Your custom message'}</p>
                  <p className="text-sm text-muted-foreground mt-4">Powered by Blast QR</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </ProFeatureGuard>
  );
}