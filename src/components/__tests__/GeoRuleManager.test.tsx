import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GeoRuleManager, { GeoRule } from '../GeoRuleManager';

describe('GeoRuleManager', () => {
  const mockOnRulesChange = vi.fn();
  const defaultProps = {
    rules: [] as GeoRule[],
    onRulesChange: mockOnRulesChange,
    defaultUrl: 'https://example.com',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render the geo-rule manager with title and description', () => {
      render(<GeoRuleManager {...defaultProps} />);
      
      expect(screen.getByText('Geo-Fenced QR Code')).toBeInTheDocument();
      expect(screen.getByText('Set different URLs for different locations')).toBeInTheDocument();
    });

    it('should show default URL when no rules are configured', () => {
      render(<GeoRuleManager {...defaultProps} />);
      
      expect(screen.getByText('Using default URL (no geo-rules configured)')).toBeInTheDocument();
      expect(screen.getAllByText('https://example.com')).toHaveLength(2); // Current status + default URL section
    });

    it('should show rule count when rules are configured', () => {
      const rulesWithData = [{
        id: '1',
        type: 'radius' as const,
        lat: 40.7128,
        lon: -74.0060,
        radius_km: 10,
        url: 'https://nyc.example.com',
        label: 'NYC Office'
      }];

      render(<GeoRuleManager {...defaultProps} rules={rulesWithData} />);
      
      expect(screen.getByText('✓ 1 geo-rule configured')).toBeInTheDocument();
    });
  });

  describe('Adding Geo Rules', () => {
    it('should add a new geo rule when form is filled correctly', async () => {
      const user = userEvent.setup();
      render(<GeoRuleManager {...defaultProps} />);

      // Switch to Manual Coordinates tab
      await user.click(screen.getByText('Manual Coordinates'));

      // Clear and fill in the form
      const latInput = screen.getByLabelText(/latitude/i);
      const lonInput = screen.getByLabelText(/longitude/i);
      const radiusInput = screen.getByLabelText(/radius/i);
      
      await user.clear(latInput);
      await user.type(latInput, '40.7128');
      await user.clear(lonInput);
      await user.type(lonInput, '-74.0060');
      await user.clear(radiusInput);
      await user.type(radiusInput, '10');
      await user.type(screen.getByLabelText(/redirect url/i), 'https://nyc.example.com');
      await user.type(screen.getByLabelText(/label/i), 'NYC Office');

      // Submit the form
      await user.click(screen.getByText('Add Rule'));

      // Verify the function was called with correct data
      expect(mockOnRulesChange).toHaveBeenCalledWith([
        expect.objectContaining({
          type: 'radius',
          lat: 40.7128,
          lon: -74.0060,
          radius_km: 10,
          url: 'https://nyc.example.com',
          label: 'NYC Office'
        })
      ]);
    });

    it('should disable add button when required fields are missing', async () => {
      const user = userEvent.setup();
      render(<GeoRuleManager {...defaultProps} />);

      // Switch to Manual Coordinates tab
      await user.click(screen.getByText('Manual Coordinates'));

      const addButton = screen.getByText('Add Rule');
      expect(addButton).toBeDisabled();

      // Fill only some fields
      const latInput = screen.getByLabelText(/latitude/i);
      const lonInput = screen.getByLabelText(/longitude/i);
      const radiusInput = screen.getByLabelText(/radius/i);
      
      await user.clear(latInput);
      await user.type(latInput, '40.7128');
      expect(addButton).toBeDisabled();

      await user.clear(lonInput);
      await user.type(lonInput, '-74.0060');
      expect(addButton).toBeDisabled();

      await user.clear(radiusInput);
      await user.type(radiusInput, '10');
      expect(addButton).toBeDisabled();

      // Only after all required fields are filled should button be enabled
      await user.type(screen.getByLabelText(/redirect url/i), 'https://nyc.example.com');
      expect(addButton).not.toBeDisabled();
    });

    it('should generate automatic label when no custom label provided', async () => {
      const user = userEvent.setup();
      render(<GeoRuleManager {...defaultProps} />);

      // Switch to Manual Coordinates tab
      await user.click(screen.getByText('Manual Coordinates'));

      // Clear and fill form without label
      const latInput = screen.getByLabelText(/latitude/i);
      const lonInput = screen.getByLabelText(/longitude/i);
      const radiusInput = screen.getByLabelText(/radius/i);
      
      await user.clear(latInput);
      await user.type(latInput, '40.7128');
      await user.clear(lonInput);
      await user.type(lonInput, '-74.0060');
      await user.clear(radiusInput);
      await user.type(radiusInput, '10');
      await user.type(screen.getByLabelText(/redirect url/i), 'https://nyc.example.com');

      await user.click(screen.getByText('Add Rule'));

      expect(mockOnRulesChange).toHaveBeenCalledWith([
        expect.objectContaining({
          label: 'Within 10km of 40.7128, -74.0060'
        })
      ]);
    });
  });

  describe('Managing Existing Rules', () => {
    it('should display existing geo rules correctly', () => {
      const existingRules: GeoRule[] = [
        {
          id: '1',
          type: 'radius',
          lat: 40.7128,
          lon: -74.0060,
          radius_km: 10,
          url: 'https://nyc.example.com',
          label: 'NYC Office'
        },
        {
          id: '2',
          type: 'radius',
          lat: 51.5074,
          lon: -0.1278,
          radius_km: 5,
          url: 'https://london.example.com',
          label: 'London Office'
        }
      ];

      render(<GeoRuleManager {...defaultProps} rules={existingRules} />);

      // Check that both rules are displayed
      expect(screen.getByText('Within 10km of 40.7128, -74.0060')).toBeInTheDocument();
      expect(screen.getByText('Within 5km of 51.5074, -0.1278')).toBeInTheDocument();
      expect(screen.getByText('https://nyc.example.com')).toBeInTheDocument();
      expect(screen.getByText('https://london.example.com')).toBeInTheDocument();
      expect(screen.getByText('NYC Office')).toBeInTheDocument();
      expect(screen.getByText('London Office')).toBeInTheDocument();
    });

    it('should remove a rule when delete button is clicked', async () => {
      const user = userEvent.setup();
      const existingRules: GeoRule[] = [
        {
          id: '1',
          type: 'radius',
          lat: 40.7128,
          lon: -74.0060,
          radius_km: 10,
          url: 'https://nyc.example.com',
          label: 'NYC Office'
        }
      ];

      render(<GeoRuleManager {...defaultProps} rules={existingRules} />);

      // Check that the rule is displayed first
      expect(screen.getByText('NYC Office')).toBeInTheDocument();
      
      // Find and click the delete button by looking for a button with destructive variant style
      const buttons = screen.getAllByRole('button');
      // The delete button should be the last button (after add rule button)
      const deleteButton = buttons.find(btn => 
        btn.className.includes('destructive') || 
        btn.querySelector('[data-lucide="trash-2"]') ||
        btn.textContent === '' // Empty text content indicates it might be icon-only button
      ) || buttons[buttons.length - 1];
      
      await user.click(deleteButton);

      expect(mockOnRulesChange).toHaveBeenCalledWith([]);
    });
  });

  describe('Form Validation', () => {
    it('should handle numeric input correctly', async () => {
      const user = userEvent.setup();
      render(<GeoRuleManager {...defaultProps} />);

      // Switch to Manual Coordinates tab
      await user.click(screen.getByText('Manual Coordinates'));

      const latInput = screen.getByLabelText(/latitude/i);
      const lonInput = screen.getByLabelText(/longitude/i);
      const radiusInput = screen.getByLabelText(/radius/i);

      // Clear and test decimal values
      await user.clear(latInput);
      await user.type(latInput, '40.7128');
      await user.clear(lonInput);
      await user.type(lonInput, '-74.0060');
      await user.clear(radiusInput);
      await user.type(radiusInput, '10.5');
      await user.type(screen.getByLabelText(/redirect url/i), 'https://test.com');

      await user.click(screen.getByText('Add Rule'));

      expect(mockOnRulesChange).toHaveBeenCalledWith([
        expect.objectContaining({
          lat: 40.7128,
          lon: -74.0060,
          radius_km: 10.5
        })
      ]);
    });
  });

  describe('Common Locations Reference', () => {
    it('should display common location examples', () => {
      render(<GeoRuleManager {...defaultProps} />);
      
      expect(screen.getByText('Common Locations')).toBeInTheDocument();
      expect(screen.getByText('40.7128, -74.0060')).toBeInTheDocument();
      expect(screen.getByText('51.5074, -0.1278')).toBeInTheDocument();
      expect(screen.getByText('35.6762, 139.6503')).toBeInTheDocument();
      expect(screen.getByText('-33.8688, 151.2093')).toBeInTheDocument();
    });
  });

  describe('Default URL Display', () => {
    it('should show default URL information', () => {
      render(<GeoRuleManager {...defaultProps} />);
      
      expect(screen.getByText('Default URL')).toBeInTheDocument();
      expect(screen.getByText('Used when no geo-rules match the scanner\'s location')).toBeInTheDocument();
      expect(screen.getAllByText('https://example.com')).toHaveLength(2); // Shows in multiple places
    });
  });
});