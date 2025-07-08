import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

interface ScanLimitManagerProps {
  isEnabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  limit: number | null;
  onLimitChange: (limit: number | null) => void;
  expiredUrl: string;
  onExpiredUrlChange: (url: string) => void;
}

const ScanLimitManager = ({ 
  isEnabled, 
  onEnabledChange, 
  limit, 
  onLimitChange, 
  expiredUrl, 
  onExpiredUrlChange 
}: ScanLimitManagerProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Label htmlFor="scan-limit-toggle" className="text-lg font-bold uppercase">
          Enable Scan Limit
        </Label>
        <Switch
          id="scan-limit-toggle"
          checked={isEnabled}
          onCheckedChange={onEnabledChange}
        />
      </div>

      {isEnabled && (
        <Card className="brutal-card p-4 space-y-4 bg-secondary/30">
          <div className="space-y-2">
            <Label htmlFor="scan-limit-input">Max Number of Scans</Label>
            <Input
              id="scan-limit-input"
              type="number"
              min="1"
              placeholder="e.g., 100"
              value={limit || ''}
              onChange={(e) => onLimitChange(e.target.value ? parseInt(e.target.value, 10) : null)}
              className="brutal-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expired-url-input">Expired URL (Optional)</Label>
            <Input
              id="expired-url-input"
              placeholder="https://example.com/offer-expired"
              value={expiredUrl}
              onChange={(e) => onExpiredUrlChange(e.target.value)}
              className="brutal-input"
            />
            <p className="text-xs text-muted-foreground">
              If left blank, users will see an "Expired QR Code" error page.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ScanLimitManager;