import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

interface QRShapeSelectorProps {
  dotsType: string;
  cornersSquareType: string;
  cornersDotType: string;
  onDotsTypeChange: (value: string) => void;
  onCornersSquareTypeChange: (value: string) => void;
  onCornersDotTypeChange: (value: string) => void;
}

const QRShapeSelector = ({
  dotsType,
  cornersSquareType,
  cornersDotType,
  onDotsTypeChange,
  onCornersSquareTypeChange,
  onCornersDotTypeChange,
}: QRShapeSelectorProps) => {
  const dotsOptions = [
    { value: 'square', label: 'Square', preview: '■' },
    { value: 'dots', label: 'Dots', preview: '●' },
    { value: 'rounded', label: 'Rounded', preview: '▢' },
    { value: 'extra-rounded', label: 'Extra Rounded', preview: '◉' },
    { value: 'classy', label: 'Classy', preview: '◆' },
    { value: 'classy-rounded', label: 'Classy Rounded', preview: '◈' },
  ];

  const cornersSquareOptions = [
    { value: 'square', label: 'Square' },
    { value: 'dot', label: 'Dot' },
    { value: 'extra-rounded', label: 'Extra Rounded' },
  ];

  const cornersDotOptions = [
    { value: 'square', label: 'Square' },
    { value: 'dot', label: 'Dot' },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="text-lg font-bold uppercase">Data Pattern Style</Label>
        <RadioGroup value={dotsType} onValueChange={onDotsTypeChange}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {dotsOptions.map((option) => (
              <Card key={option.value} className="brutal-card p-4">
                <label
                  htmlFor={`dots-${option.value}`}
                  className="flex flex-col items-center gap-3 cursor-pointer text-center"
                >
                  <RadioGroupItem value={option.value} id={`dots-${option.value}`} />
                  <div className="space-y-2">
                    <p className="text-2xl">{option.preview}</p>
                    <p className="font-bold text-sm">{option.label}</p>
                  </div>
                </label>
              </Card>
            ))}
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-3">
        <Label className="text-lg font-bold uppercase">Corner Square Style</Label>
        <RadioGroup value={cornersSquareType} onValueChange={onCornersSquareTypeChange}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {cornersSquareOptions.map((option) => (
              <Card key={option.value} className="brutal-card p-4">
                <label
                  htmlFor={`corners-square-${option.value}`}
                  className="flex flex-col items-center gap-3 cursor-pointer text-center"
                >
                  <RadioGroupItem value={option.value} id={`corners-square-${option.value}`} />
                  <span className="font-bold text-sm">{option.label}</span>
                </label>
              </Card>
            ))}
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-3">
        <Label className="text-lg font-bold uppercase">Corner Dot Style</Label>
        <RadioGroup value={cornersDotType} onValueChange={onCornersDotTypeChange}>
          <div className="grid grid-cols-2 gap-4">
            {cornersDotOptions.map((option) => (
              <Card key={option.value} className="brutal-card p-4">
                <label
                  htmlFor={`corners-dot-${option.value}`}
                  className="flex flex-col items-center gap-3 cursor-pointer text-center"
                >
                  <RadioGroupItem value={option.value} id={`corners-dot-${option.value}`} />
                  <span className="font-bold text-sm">{option.label}</span>
                </label>
              </Card>
            ))}
          </div>
        </RadioGroup>
      </div>
    </div>
  );
};

export default QRShapeSelector;