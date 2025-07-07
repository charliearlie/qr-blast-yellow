import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface QRBorderSelectorProps {
  borderStyle: string;
  borderColor: string;
  borderWidth: number;
  onBorderStyleChange: (value: string) => void;
  onBorderColorChange: (value: string) => void;
  onBorderWidthChange: (value: number) => void;
}

const QRBorderSelector = ({
  borderStyle,
  borderColor,
  borderWidth,
  onBorderStyleChange,
  onBorderColorChange,
  onBorderWidthChange,
}: QRBorderSelectorProps) => {
  const borderOptions = [
    { 
      value: 'none', 
      label: 'No Border',
      preview: (
        <div className="w-12 h-12 bg-secondary" />
      )
    },
    { 
      value: 'simple', 
      label: 'Simple',
      preview: (
        <div className="w-12 h-12 bg-secondary border-2 border-foreground" />
      )
    },
    { 
      value: 'thick', 
      label: 'Thick',
      preview: (
        <div className="w-12 h-12 bg-secondary border-4 border-foreground" />
      )
    },
    { 
      value: 'rounded', 
      label: 'Rounded',
      preview: (
        <div className="w-12 h-12 bg-secondary border-2 border-foreground rounded-lg" />
      )
    },
    { 
      value: 'double', 
      label: 'Double',
      preview: (
        <div className="w-12 h-12 bg-secondary border-4 border-double border-foreground" />
      )
    },
    { 
      value: 'dashed', 
      label: 'Dashed',
      preview: (
        <div className="w-12 h-12 bg-secondary border-2 border-dashed border-foreground" />
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="text-lg font-bold uppercase">Border Style</Label>
        <RadioGroup value={borderStyle} onValueChange={onBorderStyleChange}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {borderOptions.map((option) => (
              <Card key={option.value} className="brutal-card p-3">
                <label
                  htmlFor={`border-${option.value}`}
                  className="flex flex-col items-center gap-3 cursor-pointer"
                >
                  <RadioGroupItem value={option.value} id={`border-${option.value}`} />
                  {option.preview}
                  <span className="font-bold text-sm">{option.label}</span>
                </label>
              </Card>
            ))}
          </div>
        </RadioGroup>
      </div>

      {borderStyle !== 'none' && (
        <>
          <div className="space-y-3">
            <Label htmlFor="border-color" className="text-lg font-bold uppercase">
              Border Color
            </Label>
            <div className="flex gap-2 items-center">
              <input
                id="border-color"
                type="color"
                value={borderColor}
                onChange={(e) => onBorderColorChange(e.target.value)}
                className="brutal-input h-14 w-20 cursor-pointer"
              />
              <Input
                value={borderColor}
                onChange={(e) => onBorderColorChange(e.target.value)}
                className="brutal-input h-14"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="border-width" className="text-lg font-bold uppercase">
              Border Width
            </Label>
            <div className="flex items-center gap-3">
              <Input
                id="border-width"
                type="range"
                min="1"
                max="20"
                value={borderWidth}
                onChange={(e) => onBorderWidthChange(Number(e.target.value))}
                className="flex-1"
              />
              <span className="font-bold w-12 text-center">{borderWidth}px</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default QRBorderSelector;