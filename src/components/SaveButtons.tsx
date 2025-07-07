import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Save, BarChart3 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import AuthModal from './AuthModal';

interface SaveButtonsProps {
  onSave: () => void;
  onReset?: () => void;
  isSaving: boolean;
  isValid: boolean;
  currentQRCode: any;
  url: string;
  title: string;
}

const SaveButtons: React.FC<SaveButtonsProps> = ({
  onSave,
  onReset,
  isSaving,
  isValid,
  currentQRCode,
  url,
  title
}) => {
  const { user } = useAuth();

  if (!user) {
    return (
      <AuthModal>
        <Card className="brutal-card p-4 cursor-pointer hover:bg-secondary/50 transition-colors">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-primary" />
            <div>
              <p className="font-bold">Want Analytics? Sign Up Now!</p>
              <p className="text-sm text-muted-foreground">
                Track scans, save QR codes, and get insights
              </p>
            </div>
          </div>
        </Card>
      </AuthModal>
    );
  }

  return (
    <div className="flex gap-3">
      <Button
        onClick={onSave}
        disabled={!url.trim() || !title.trim() || !isValid || isSaving}
        className="flex-1"
      >
        {isSaving ? (
          "Saving..."
        ) : (
          <>
            <Save className="w-5 h-5 mr-2" />
            {currentQRCode ? 'Update QR Code' : 'Save QR Code'}
          </>
        )}
      </Button>
      {currentQRCode && onReset && (
        <Button onClick={onReset} variant="outline">
          Create New
        </Button>
      )}
    </div>
  );
};

export default SaveButtons;