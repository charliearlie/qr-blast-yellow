import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ScanLimitManager from '../ScanLimitManager';

describe('ScanLimitManager', () => {
  const defaultProps = {
    isEnabled: false,
    onEnabledChange: vi.fn(),
    limit: null,
    onLimitChange: vi.fn(),
    expiredUrl: '',
    onExpiredUrlChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Enable/Disable Toggle', () => {
    it('should render with disabled state by default', () => {
      render(<ScanLimitManager {...defaultProps} />);
      
      const toggle = screen.getByRole('switch', { name: /enable scan limit/i });
      expect(toggle).not.toBeChecked();
      
      // Settings should not be visible when disabled
      expect(screen.queryByLabelText(/max number of scans/i)).not.toBeInTheDocument();
    });

    it('should call onEnabledChange when toggled', () => {
      render(<ScanLimitManager {...defaultProps} />);
      
      const toggle = screen.getByRole('switch', { name: /enable scan limit/i });
      fireEvent.click(toggle);
      
      expect(defaultProps.onEnabledChange).toHaveBeenCalledWith(true);
    });

    it('should show settings when enabled', () => {
      render(<ScanLimitManager {...defaultProps} isEnabled={true} />);
      
      expect(screen.getByLabelText(/max number of scans/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/expired url/i)).toBeInTheDocument();
    });
  });

  describe('Scan Limit Input', () => {
    it('should display the current limit value', () => {
      render(<ScanLimitManager {...defaultProps} isEnabled={true} limit={100} />);
      
      const input = screen.getByLabelText(/max number of scans/i);
      expect(input).toHaveValue(100);
    });

    it('should call onLimitChange with numeric value', () => {
      render(<ScanLimitManager {...defaultProps} isEnabled={true} />);
      
      const input = screen.getByLabelText(/max number of scans/i);
      fireEvent.change(input, { target: { value: '50' } });
      
      expect(defaultProps.onLimitChange).toHaveBeenCalledWith(50);
    });

    it('should call onLimitChange with null for empty input', () => {
      render(<ScanLimitManager {...defaultProps} isEnabled={true} limit={100} />);
      
      const input = screen.getByLabelText(/max number of scans/i);
      fireEvent.change(input, { target: { value: '' } });
      
      expect(defaultProps.onLimitChange).toHaveBeenCalledWith(null);
    });

    it('should enforce minimum value of 1', () => {
      render(<ScanLimitManager {...defaultProps} isEnabled={true} />);
      
      const input = screen.getByLabelText(/max number of scans/i);
      expect(input).toHaveAttribute('min', '1');
    });
  });

  describe('Expired URL Input', () => {
    it('should display the current expired URL', () => {
      const expiredUrl = 'https://example.com/expired';
      render(<ScanLimitManager {...defaultProps} isEnabled={true} expiredUrl={expiredUrl} />);
      
      const input = screen.getByLabelText(/expired url/i);
      expect(input).toHaveValue(expiredUrl);
    });

    it('should call onExpiredUrlChange when URL is entered', () => {
      render(<ScanLimitManager {...defaultProps} isEnabled={true} />);
      
      const newUrl = 'https://example.com/offer-ended';
      const input = screen.getByLabelText(/expired url/i);
      fireEvent.change(input, { target: { value: newUrl } });
      
      expect(defaultProps.onExpiredUrlChange).toHaveBeenCalledWith(newUrl);
    });

    it('should show help text about optional URL', () => {
      render(<ScanLimitManager {...defaultProps} isEnabled={true} />);
      
      expect(screen.getByText(/if left blank, users will see an "expired qr code" error page/i)).toBeInTheDocument();
    });
  });

  describe('Visual Styling', () => {
    it('should apply brutal-card styling to settings', () => {
      render(<ScanLimitManager {...defaultProps} isEnabled={true} />);
      
      const card = screen.getByLabelText(/max number of scans/i).closest('.brutal-card');
      expect(card).toHaveClass('brutal-card', 'p-4', 'space-y-4', 'bg-secondary/30');
    });

    it('should apply brutal-input styling to inputs', () => {
      render(<ScanLimitManager {...defaultProps} isEnabled={true} />);
      
      const limitInput = screen.getByLabelText(/max number of scans/i);
      const urlInput = screen.getByLabelText(/expired url/i);
      
      expect(limitInput).toHaveClass('brutal-input');
      expect(urlInput).toHaveClass('brutal-input');
    });
  });

  describe('Integration', () => {
    it('should handle complete user flow', () => {
      const { rerender } = render(<ScanLimitManager {...defaultProps} />);
      
      // Enable scan limits
      const toggle = screen.getByRole('switch', { name: /enable scan limit/i });
      fireEvent.click(toggle);
      expect(defaultProps.onEnabledChange).toHaveBeenCalledWith(true);
      
      // Update props to reflect enabled state
      rerender(<ScanLimitManager {...defaultProps} isEnabled={true} />);
      
      // Set scan limit
      const limitInput = screen.getByLabelText(/max number of scans/i);
      fireEvent.change(limitInput, { target: { value: '200' } });
      expect(defaultProps.onLimitChange).toHaveBeenCalledWith(200);
      
      // Set expired URL
      const urlInput = screen.getByLabelText(/expired url/i);
      fireEvent.change(urlInput, { target: { value: 'https://example.com/finished' } });
      expect(defaultProps.onExpiredUrlChange).toHaveBeenCalledWith('https://example.com/finished');
    });
  });
});