import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TemplateSelector from '../TemplateSelector';
import { templates } from '@/config/templates';

describe('TemplateSelector', () => {
  const mockOnSelectTemplate = vi.fn();

  beforeEach(() => {
    mockOnSelectTemplate.mockClear();
  });

  it('renders all templates', () => {
    render(
      <TemplateSelector
        selectedTemplateId="website"
        onSelectTemplate={mockOnSelectTemplate}
      />
    );

    templates.forEach((template) => {
      expect(screen.getByLabelText(`Select ${template.name} template`)).toBeInTheDocument();
    });
  });

  it('highlights the selected template', () => {
    render(
      <TemplateSelector
        selectedTemplateId="whatsapp"
        onSelectTemplate={mockOnSelectTemplate}
      />
    );

    const whatsappButton = screen.getByLabelText('Select WhatsApp template');
    expect(whatsappButton).toHaveClass('bg-primary');
    expect(whatsappButton).toHaveClass('text-primary-foreground');
  });

  it('calls onSelectTemplate when a template is clicked', () => {
    render(
      <TemplateSelector
        selectedTemplateId="website"
        onSelectTemplate={mockOnSelectTemplate}
      />
    );

    const instagramButton = screen.getByLabelText('Select Instagram template');
    fireEvent.click(instagramButton);

    expect(mockOnSelectTemplate).toHaveBeenCalledTimes(1);
    expect(mockOnSelectTemplate).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'instagram',
        name: 'Instagram',
      })
    );
  });

  it('renders template icons', () => {
    const { container } = render(
      <TemplateSelector
        selectedTemplateId="website"
        onSelectTemplate={mockOnSelectTemplate}
      />
    );

    const icons = container.querySelectorAll('.w-6.h-6');
    expect(icons).toHaveLength(templates.length);
  });

  it('applies hover styles to non-selected templates', () => {
    render(
      <TemplateSelector
        selectedTemplateId="website"
        onSelectTemplate={mockOnSelectTemplate}
      />
    );

    const telegramButton = screen.getByLabelText('Select Telegram template');
    expect(telegramButton).toHaveClass('hover:bg-secondary');
    expect(telegramButton).not.toHaveClass('bg-primary');
  });
});