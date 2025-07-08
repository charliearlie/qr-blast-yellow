import { templates, QRTemplate } from '@/config/templates';

interface TemplateSelectorProps {
  selectedTemplateId: string;
  onSelectTemplate: (template: QRTemplate) => void;
}

const TemplateSelector = ({ selectedTemplateId, onSelectTemplate }: TemplateSelectorProps) => {
  return (
    <div className="grid grid-cols-5 gap-3">
      {templates.map((template) => (
        <button
          key={template.id}
          className={`
            relative p-4 text-center cursor-pointer transition-all duration-200 
            border-4 border-black font-black uppercase tracking-tight
            aspect-square flex flex-col items-center justify-center
            ${selectedTemplateId === template.id 
              ? 'bg-primary text-primary-foreground shadow-[6px_6px_0px_0px_#000] translate-x-0 translate-y-0' 
              : 'bg-white hover:bg-secondary shadow-[4px_4px_0px_0px_#000] hover:shadow-[5px_5px_0px_0px_#000] hover:-translate-x-1 hover:-translate-y-1'
            }
            focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
            active:shadow-[2px_2px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px]
          `}
          onClick={() => onSelectTemplate(template)}
          aria-label={`Select ${template.name} template`}
        >
          <template.icon className="w-6 h-6 mb-0 md:mb-2" />
          <p className="text-xs font-black leading-tight text-center hidden md:block">{template.name}</p>
        </button>
      ))}
    </div>
  );
};

export default TemplateSelector;