import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrandingManager } from '@/components/BrandingManager';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';

vi.mock('@supabase/auth-helpers-react', () => ({
  useUser: vi.fn(),
  useSupabaseClient: vi.fn(),
}));

vi.mock('@/components/ui/alert', () => ({
  Alert: ({ children, ...props }: any) => <div role="alert" {...props}>{children}</div>,
  AlertDescription: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@/components/ui/label', () => ({
  Label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
}));

vi.mock('@/components/ui/switch', () => ({
  Switch: ({ checked, onCheckedChange, disabled, id }: any) => (
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
      disabled={disabled}
      role="switch"
      aria-checked={checked}
    />
  ),
}));

vi.mock('@/components/ui/slider', () => ({
  Slider: ({ value, onValueChange, min, max, disabled }: any) => (
    <input
      type="range"
      value={value?.[0] || min}
      onChange={(e) => onValueChange([parseInt(e.target.value)])}
      min={min}
      max={max}
      disabled={disabled}
      role="slider"
    />
  ),
}));

vi.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input {...props} />,
}));

vi.mock('@/components/ui/radio-group', () => {
  const React = require('react');
  const RadioGroupContext = React.createContext(false);
  
  return {
    RadioGroup: ({ value, onValueChange, disabled, children }: any) => (
      <RadioGroupContext.Provider value={disabled}>
        <div role="radiogroup" {...(disabled && { disabled: true })} onChange={(e: any) => {
          if (e.target.type === 'radio' && !disabled) {
            onValueChange(e.target.value);
          }
        }}>
          {children}
        </div>
      </RadioGroupContext.Provider>
    ),
    RadioGroupItem: ({ value, id }: any) => {
      const disabled = React.useContext(RadioGroupContext);
      return (
        <input 
          type="radio" 
          value={value} 
          id={id} 
          name="branding-style" 
          disabled={disabled}
        />
      );
    },
  };
});

vi.mock('@/components/ProFeatureGuard', () => ({
  default: ({ children }: any) => (
    <div data-testid="pro-feature-guard">
      {children}
    </div>
  ),
}));

describe('BrandingManager', () => {
  const mockSupabase = {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  };

  const defaultProps = {
    brandingEnabled: false,
    setBrandingEnabled: vi.fn(),
    brandingDuration: 3,
    setBrandingDuration: vi.fn(),
    brandingStyle: 'minimal' as const,
    setBrandingStyle: vi.fn(),
    customBrandingText: '',
    setCustomBrandingText: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useSupabaseClient as any).mockReturnValue(mockSupabase);
  });

  describe('Free User', () => {
    beforeEach(() => {
      (useUser as any).mockReturnValue({
        id: 'user-123',
        user_metadata: { plan: 'free' },
      });
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: {
            id: 'user-123',
            user_metadata: { plan: 'free' },
          },
        },
        error: null,
      });
    });

    it('should disable all controls for free users', async () => {
      render(<BrandingManager {...defaultProps} />);
      
      // Wait for the component to check pro status
      await waitFor(() => {
        const toggle = screen.getByRole('switch');
        expect(toggle).toBeDisabled();
      });
      
      const slider = screen.getByRole('slider');
      expect(slider).toBeDisabled();
      
      // Note: radiogroups don't have a disabled attribute, individual radio buttons do
      const radioButtons = screen.getAllByRole('radio');
      radioButtons.forEach(button => {
        expect(button).toBeDisabled();
      });
    });

    it('should show upgrade prompt for free users', async () => {
      render(<BrandingManager {...defaultProps} />);
      
      // Wait for the component to load and check pro status
      await waitFor(() => {
        expect(screen.getByText(/add professional branding that displays before redirecting visitors/i)).toBeInTheDocument();
      });
    });
  });

  describe('Pro User', () => {
    beforeEach(() => {
      (useUser as any).mockReturnValue({
        id: 'user-123',
        user_metadata: { plan: 'pro' },
      });
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: {
            id: 'user-123',
            user_metadata: { plan: 'pro' },
          },
        },
        error: null,
      });
    });

    it('should enable all controls for pro users', async () => {
      render(<BrandingManager {...defaultProps} />);
      
      // Wait for the component to check pro status
      await waitFor(() => {
        const toggle = screen.getByRole('switch');
        expect(toggle).not.toBeDisabled();
      });
      
      const slider = screen.getByRole('slider');
      expect(slider).not.toBeDisabled();
      
      // Check individual radio buttons are enabled
      const radioButtons = screen.getAllByRole('radio');
      radioButtons.forEach(button => {
        expect(button).not.toBeDisabled();
      });
    });

    it('should toggle branding enabled state', async () => {
      render(<BrandingManager {...defaultProps} />);
      
      // Wait for the component to enable controls
      await waitFor(() => {
        const toggle = screen.getByRole('switch');
        expect(toggle).not.toBeDisabled();
      });
      
      const toggle = screen.getByRole('switch');
      fireEvent.click(toggle);
      
      expect(defaultProps.setBrandingEnabled).toHaveBeenCalledWith(true);
    });

    it('should update branding duration', async () => {
      render(<BrandingManager {...defaultProps} />);
      
      // Wait for the component to enable controls
      await waitFor(() => {
        const slider = screen.getByRole('slider');
        expect(slider).not.toBeDisabled();
      });
      
      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '5' } });
      
      expect(defaultProps.setBrandingDuration).toHaveBeenCalledWith(5);
    });

    it('should update branding style', async () => {
      render(<BrandingManager {...defaultProps} />);
      
      // Wait for the component to enable controls
      await waitFor(() => {
        const fullOption = screen.getByLabelText(/Full Branding/i);
        expect(fullOption).not.toBeDisabled();
      });
      
      const fullOption = screen.getByLabelText(/Full Branding/i);
      fireEvent.click(fullOption);
      
      expect(defaultProps.setBrandingStyle).toHaveBeenCalledWith('full');
    });

    it('should show custom text input when custom style is selected', async () => {
      render(<BrandingManager {...defaultProps} brandingStyle="custom" />);
      
      // Wait for the component to load
      await waitFor(() => {
        const customInput = screen.getByPlaceholderText(/Your custom message/i);
        expect(customInput).toBeInTheDocument();
      });
      
      const customInput = screen.getByPlaceholderText(/Your custom message/i);
      fireEvent.change(customInput, { target: { value: 'Custom text' } });
      expect(defaultProps.setCustomBrandingText).toHaveBeenCalledWith('Custom text');
    });

    it('should not show custom text input for non-custom styles', async () => {
      render(<BrandingManager {...defaultProps} brandingStyle="minimal" />);
      
      // Wait for the component to load and ensure custom input is not present
      await waitFor(() => {
        const customInput = screen.queryByPlaceholderText(/Your custom message/i);
        expect(customInput).not.toBeInTheDocument();
      });
    });

    it('should display current duration value', () => {
      render(<BrandingManager {...defaultProps} brandingDuration={7} />);
      
      expect(screen.getByText('Display Duration: 7 seconds')).toBeInTheDocument();
    });

    it('should show preview section when branding is enabled', async () => {
      render(<BrandingManager {...defaultProps} brandingEnabled={true} />);
      
      // Wait for pro status to be loaded, then check for preview
      await waitFor(() => {
        expect(screen.getByText('Preview')).toBeInTheDocument();
      });
    });

    it('should show correct preview for minimal style', async () => {
      render(<BrandingManager {...defaultProps} brandingEnabled={true} brandingStyle="minimal" />);
      
      // Wait for pro status and preview to be shown
      await waitFor(() => {
        expect(screen.getByText('Blast QR')).toBeInTheDocument();
        expect(screen.getByText('Powered by Blast QR')).toBeInTheDocument();
      });
    });

    it('should show correct preview for full style', async () => {
      render(<BrandingManager {...defaultProps} brandingEnabled={true} brandingStyle="full" />);
      
      // Wait for pro status and preview to be shown
      await waitFor(() => {
        expect(screen.getByText('Blast QR')).toBeInTheDocument();
        expect(screen.getByText('Smart QR Codes for Modern Business')).toBeInTheDocument();
        expect(screen.getByText(/Redirecting in/i)).toBeInTheDocument();
      });
    });

    it('should show correct preview for custom style', async () => {
      render(<BrandingManager {...defaultProps} 
        brandingEnabled={true} 
        brandingStyle="custom" 
        customBrandingText="My custom message" 
      />);
      
      // Wait for pro status and preview to be shown
      await waitFor(() => {
        expect(screen.getByText('My custom message')).toBeInTheDocument();
        expect(screen.getByText('Powered by Blast QR')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      (useUser as any).mockReturnValue({
        id: 'user-123',
        user_metadata: { plan: 'pro' },
      });
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: {
            id: 'user-123',
            user_metadata: { plan: 'pro' },
          },
        },
        error: null,
      });
    });

    it('should have proper labels for all form controls', async () => {
      render(<BrandingManager {...defaultProps} />);
      
      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByLabelText('Enable Branding Display')).toBeInTheDocument();
      });
      
      // For radio buttons, check by their text content since they have complex labels
      expect(screen.getByText('Minimal')).toBeInTheDocument();
      expect(screen.getByText('Full Branding')).toBeInTheDocument();
      expect(screen.getByText('Custom')).toBeInTheDocument();
      
      // Check that the radio inputs exist
      expect(screen.getByRole('radio', { name: /minimal/i })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /full branding/i })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /custom/i })).toBeInTheDocument();
    });

    it('should have proper ARIA attributes', () => {
      render(<BrandingManager {...defaultProps} />);
      
      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-checked', 'false');
      
      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('min', '1');
      expect(slider).toHaveAttribute('max', '10');
    });
  });
});