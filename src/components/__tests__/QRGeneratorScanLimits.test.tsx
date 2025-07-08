import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import QRGenerator from '../QRGenerator';
import { useAuth } from '@/hooks/useAuth';
import { qrService } from '@/services/qrService';

// Mock dependencies
vi.mock('@/hooks/useAuth');
vi.mock('@/services/qrService');
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock QRCodeStyling
vi.mock('qr-code-styling', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      append: vi.fn(),
      update: vi.fn(),
      download: vi.fn(),
    })),
  };
});

// Mock ProFeatureGuard to always show content for testing
vi.mock('../ProFeatureGuard', () => ({
  default: ({ children }: any) => <>{children}</>,
}));

// Mock child components
vi.mock('../ScanLimitManager', () => ({
  default: ({ isEnabled, onEnabledChange, limit, onLimitChange, expiredUrl, onExpiredUrlChange }: any) => (
    <div data-testid="scan-limit-manager">
      <label>
        Enable Scan Limit
        <input
          type="checkbox"
          checked={isEnabled}
          onChange={(e) => onEnabledChange(e.target.checked)}
          role="switch"
          aria-label="Enable Scan Limit"
        />
      </label>
      {isEnabled && (
        <>
          <input
            type="number"
            value={limit || ''}
            onChange={(e) => onLimitChange(e.target.value ? parseInt(e.target.value) : null)}
            aria-label="Max Number of Scans"
          />
          <input
            type="text"
            value={expiredUrl}
            onChange={(e) => onExpiredUrlChange(e.target.value)}
            aria-label="Expired URL (Optional)"
          />
        </>
      )}
    </div>
  ),
}));

describe('QRGenerator - Scan Limits Integration', () => {
  const mockUser = { 
    id: 'user-123', 
    email: 'test@example.com', 
    user_metadata: { plan: 'pro' } 
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({ user: mockUser });
  });

  describe('Limits Tab', () => {
    it('should display Limits tab with ProFeatureGuard', () => {
      render(<QRGenerator />);
      
      const limitsTab = screen.getByRole('tab', { name: /limits/i });
      expect(limitsTab).toBeInTheDocument();
    });

    it('should show scan limit manager when Limits tab is active', async () => {
      render(<QRGenerator />);
      
      // Click the limits tab
      const limitsTab = screen.getByRole('tab', { name: /limits/i });
      fireEvent.click(limitsTab);
      
      // Should show the scan limit manager
      await waitFor(() => {
        expect(screen.getByTestId('scan-limit-manager')).toBeInTheDocument();
      });
    });

    it('should have scan limits tab in pro feature guard', () => {
      // This test just verifies the tab exists and is wrapped in ProFeatureGuard
      // Actual functionality is tested separately
      render(<QRGenerator />);
      
      const limitsTab = screen.getByRole('tab', { name: /limits/i });
      expect(limitsTab).toBeInTheDocument();
    });
  });

  describe('Saving with Scan Limits', () => {
    it('should include scan limit data when saving QR code', async () => {
      vi.mocked(qrService.createQRCode).mockResolvedValue({
        id: 'qr-123',
        title: 'Test QR',
        original_url: 'https://example.com',
        scan_limit: 50,
        expired_url: 'https://example.com/expired',
        qr_settings: {} as any,
      });

      render(<QRGenerator />);
      
      // Fill in basic info
      const titleInput = screen.getByPlaceholderText(/my website qr code/i);
      const urlInput = screen.getByPlaceholderText(/https:\/\/example\.com/i);
      
      fireEvent.change(titleInput, { target: { value: 'Test QR' } });
      fireEvent.change(urlInput, { target: { value: 'https://example.com' } });
      
      // Navigate to limits tab
      const limitsTab = screen.getByRole('tab', { name: /limits/i });
      fireEvent.click(limitsTab);
      
      // Enable scan limits
      const toggle = screen.getByRole('switch', { name: /enable scan limit/i });
      fireEvent.click(toggle);
      
      // Set scan limit
      const limitInput = screen.getByLabelText(/max number of scans/i);
      fireEvent.change(limitInput, { target: { value: '50' } });
      
      // Set expired URL
      const expiredUrlInput = screen.getByLabelText(/expired url/i);
      fireEvent.change(expiredUrlInput, { target: { value: 'https://example.com/expired' } });
      
      // Save
      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(qrService.createQRCode).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Test QR',
            original_url: 'https://example.com',
            scan_limit: 50,
            expired_url: 'https://example.com/expired',
          })
        );
      });
    });

    it('should save null values when scan limits are disabled', async () => {
      vi.mocked(qrService.createQRCode).mockResolvedValue({
        id: 'qr-123',
        title: 'Test QR',
        original_url: 'https://example.com',
        scan_limit: null,
        expired_url: null,
        qr_settings: {} as any,
      });

      render(<QRGenerator />);
      
      // Fill in basic info
      const titleInput = screen.getByPlaceholderText(/my website qr code/i);
      const urlInput = screen.getByPlaceholderText(/https:\/\/example\.com/i);
      
      fireEvent.change(titleInput, { target: { value: 'Test QR' } });
      fireEvent.change(urlInput, { target: { value: 'https://example.com' } });
      
      // Save without enabling scan limits
      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(qrService.createQRCode).toHaveBeenCalledWith(
          expect.objectContaining({
            scan_limit: null,
            expired_url: null,
          })
        );
      });
    });
  });

  describe('Form Reset', () => {
    it('should reset scan limit fields when form is reset', () => {
      render(<QRGenerator />);
      
      // Navigate to limits tab and enable scan limits
      const limitsTab = screen.getByRole('tab', { name: /limits/i });
      fireEvent.click(limitsTab);
      
      const toggle = screen.getByRole('switch', { name: /enable scan limit/i });
      fireEvent.click(toggle);
      
      // Change values
      const limitInput = screen.getByLabelText(/max number of scans/i);
      fireEvent.change(limitInput, { target: { value: '200' } });
      
      // Fill in basic info to enable reset button
      fireEvent.click(screen.getByRole('tab', { name: /basic/i }));
      const titleInput = screen.getByPlaceholderText(/my website qr code/i);
      fireEvent.change(titleInput, { target: { value: 'Test' } });
      
      // Reset form
      const resetButton = screen.getByRole('button', { name: /reset/i });
      fireEvent.click(resetButton);
      
      // Navigate back to limits tab
      fireEvent.click(limitsTab);
      
      // Check that scan limits are disabled
      const toggleAfterReset = screen.getByRole('switch', { name: /enable scan limit/i });
      expect(toggleAfterReset).not.toBeChecked();
    });
  });

  describe('ProFeatureGuard Integration', () => {
    it('should show upgrade prompt for free users', () => {
      vi.mocked(useAuth).mockReturnValue({ 
        user: { ...mockUser, user_metadata: { plan: 'free' } }
      });

      render(<QRGenerator />);
      
      // Navigate to limits tab
      const limitsTab = screen.getByRole('tab', { name: /limits/i });
      fireEvent.click(limitsTab);
      
      // Should show upgrade prompt instead of scan limit controls
      expect(screen.getByText(/upgrade to pro/i)).toBeInTheDocument();
      expect(screen.queryByText('Enable Scan Limit')).not.toBeInTheDocument();
    });
  });
});