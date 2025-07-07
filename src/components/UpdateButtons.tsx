import React from 'react';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

interface UpdateButtonsProps {
  onUpdate: () => void;
  isSaving: boolean;
  isValid: boolean;
  url: string;
  title: string;
}

const UpdateButtons: React.FC<UpdateButtonsProps> = ({
  onUpdate,
  isSaving,
  isValid,
  url,
  title
}) => {
  return (
    <div className="flex gap-3">
      <Button
        onClick={onUpdate}
        disabled={!url.trim() || !title.trim() || !isValid || isSaving}
        className="flex-1 brutal-button"
      >
        {isSaving ? (
          "Updating..."
        ) : (
          <>
            <Save className="w-5 h-5 mr-2" />
            Update QR Code
          </>
        )}
      </Button>
    </div>
  );
};

export default UpdateButtons;