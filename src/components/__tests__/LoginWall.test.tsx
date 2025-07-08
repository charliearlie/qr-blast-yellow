import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginWall from '../LoginWall';

// Mock the useAuth hook
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

// Mock AuthModal
vi.mock('../AuthModal', () => ({
  default: ({ isOpen, onClose }: any) => (
    isOpen ? <div data-testid="auth-modal">Auth Modal</div> : null
  ),
}));

import { useAuth } from '@/hooks/useAuth';

describe('LoginWall', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const TestContent = () => (
    <div data-testid="protected-content">
      <h2>Protected Feature</h2>
      <p>This is behind the login wall</p>
    </div>
  );

  describe('Authenticated User', () => {
    it('should show content directly for authenticated users', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: {
          id: 'user-123',
          email: 'test@example.com',
        },
      });

      render(
        <LoginWall feature="geo">
          <TestContent />
        </LoginWall>
      );

      // Content should be visible without login wall
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.getByText('Protected Feature')).toBeInTheDocument();
      
      // Login wall should not be present
      expect(screen.queryByText(/location-based qr codes/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/sign in with google/i)).not.toBeInTheDocument();
    });
  });

  describe('Unauthenticated User', () => {
    beforeEach(() => {
      vi.mocked(useAuth).mockReturnValue({
        user: null,
      });
    });

    it('should show geo feature login wall for unauthenticated users', () => {
      render(
        <LoginWall feature="geo">
          <TestContent />
        </LoginWall>
      );

      // Content should not be visible
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      
      // Geo feature wall should be present
      expect(screen.getByText('Location-Based QR Codes')).toBeInTheDocument();
      expect(screen.getByText(/create qr codes that redirect users to different urls based on their geographic location/i)).toBeInTheDocument();
      expect(screen.getByText('Event-specific redirects by location')).toBeInTheDocument();
      expect(screen.getByText('Store finder for multiple locations')).toBeInTheDocument();
    });

    it('should show time feature login wall for unauthenticated users', () => {
      render(
        <LoginWall feature="time">
          <TestContent />
        </LoginWall>
      );

      // Content should not be visible
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      
      // Time feature wall should be present
      expect(screen.getByText('Time-Scheduled QR Codes')).toBeInTheDocument();
      expect(screen.getByText(/set up qr codes that redirect to different urls based on the time/i)).toBeInTheDocument();
      expect(screen.getByText('Business hours → Work website')).toBeInTheDocument();
      expect(screen.getByText('After hours → Contact form')).toBeInTheDocument();
    });

    it('should show limits feature login wall for unauthenticated users', () => {
      render(
        <LoginWall feature="limits">
          <TestContent />
        </LoginWall>
      );

      // Content should not be visible
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      
      // Limits feature wall should be present
      expect(screen.getByText('Scan-Limited QR Codes')).toBeInTheDocument();
      expect(screen.getByText(/control qr code usage with scan limits/i)).toBeInTheDocument();
      expect(screen.getByText('Limited-time offer campaigns')).toBeInTheDocument();
      expect(screen.getByText('Exclusive access control')).toBeInTheDocument();
    });

    it('should show auth buttons', () => {
      render(
        <LoginWall feature="geo">
          <TestContent />
        </LoginWall>
      );

      expect(screen.getByText('🚀 Sign in with Google')).toBeInTheDocument();
      expect(screen.getByText('Sign up with Email')).toBeInTheDocument();
      expect(screen.getByText('Free to use • No credit card required')).toBeInTheDocument();
    });

    it('should open auth modal when sign in button is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <LoginWall feature="geo">
          <TestContent />
        </LoginWall>
      );

      // Initially no auth modal
      expect(screen.queryByTestId('auth-modal')).not.toBeInTheDocument();

      // Click sign in button
      await user.click(screen.getByText('🚀 Sign in with Google'));

      // Auth modal should appear
      expect(screen.getByTestId('auth-modal')).toBeInTheDocument();
    });

    it('should open auth modal when email signup is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <LoginWall feature="time">
          <TestContent />
        </LoginWall>
      );

      // Click email signup button
      await user.click(screen.getByText('Sign up with Email'));

      // Auth modal should appear
      expect(screen.getByTestId('auth-modal')).toBeInTheDocument();
    });
  });

  describe('Feature-specific Content', () => {
    beforeEach(() => {
      vi.mocked(useAuth).mockReturnValue({
        user: null,
      });
    });

    it('should display correct icon for each feature', () => {
      const { rerender } = render(
        <LoginWall feature="geo">
          <TestContent />
        </LoginWall>
      );

      // Geo should have MapPin icon (we can't directly test lucide icons, but we can check the title)
      expect(screen.getByText('Location-Based QR Codes')).toBeInTheDocument();

      rerender(
        <LoginWall feature="time">
          <TestContent />
        </LoginWall>
      );

      // Time should have Clock icon
      expect(screen.getByText('Time-Scheduled QR Codes')).toBeInTheDocument();

      rerender(
        <LoginWall feature="limits">
          <TestContent />
        </LoginWall>
      );

      // Limits should have BarChart3 icon
      expect(screen.getByText('Scan-Limited QR Codes')).toBeInTheDocument();
    });

    it('should display all benefits for each feature', () => {
      const { rerender } = render(
        <LoginWall feature="geo">
          <TestContent />
        </LoginWall>
      );

      // Check geo benefits
      expect(screen.getByText('Event-specific redirects by location')).toBeInTheDocument();
      expect(screen.getByText('Store finder for multiple locations')).toBeInTheDocument();
      expect(screen.getByText('Regional marketing campaigns')).toBeInTheDocument();
      expect(screen.getByText('Location-aware content delivery')).toBeInTheDocument();

      rerender(
        <LoginWall feature="time">
          <TestContent />
        </LoginWall>
      );

      // Check time benefits
      expect(screen.getByText('Business hours → Work website')).toBeInTheDocument();
      expect(screen.getByText('After hours → Contact form')).toBeInTheDocument();
      expect(screen.getByText('Lunch time → Menu page')).toBeInTheDocument();
      expect(screen.getByText('Event-specific timing')).toBeInTheDocument();

      rerender(
        <LoginWall feature="limits">
          <TestContent />
        </LoginWall>
      );

      // Check limits benefits
      expect(screen.getByText('Limited-time offer campaigns')).toBeInTheDocument();
      expect(screen.getByText('Exclusive access control')).toBeInTheDocument();
      expect(screen.getByText('Resource usage management')).toBeInTheDocument();
      expect(screen.getByText('Custom expiration redirects')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined user object', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: undefined as any,
      });

      render(
        <LoginWall feature="geo">
          <TestContent />
        </LoginWall>
      );

      // Should show login wall
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(screen.getByText('Location-Based QR Codes')).toBeInTheDocument();
    });

    it('should render multiple children when authenticated', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: {
          id: 'user-123',
          email: 'test@example.com',
        },
      });

      render(
        <LoginWall feature="geo">
          <div>First child</div>
          <div>Second child</div>
          <span>Third child</span>
        </LoginWall>
      );

      expect(screen.getByText('First child')).toBeInTheDocument();
      expect(screen.getByText('Second child')).toBeInTheDocument();
      expect(screen.getByText('Third child')).toBeInTheDocument();
    });
  });

  describe('UI Styling', () => {
    beforeEach(() => {
      vi.mocked(useAuth).mockReturnValue({
        user: null,
      });
    });

    it('should have proper styling classes', () => {
      render(
        <LoginWall feature="geo">
          <TestContent />
        </LoginWall>
      );

      // Check for brutal-card class
      const card = screen.getByText('Location-Based QR Codes').closest('.brutal-card');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('brutal-card');
      
      // Check for gradient background
      expect(card).toHaveClass('bg-gradient-to-br');
    });

    it('should display sparkle emoji badge', () => {
      render(
        <LoginWall feature="time">
          <TestContent />
        </LoginWall>
      );

      // Check for sparkle emoji
      expect(screen.getByText('✨')).toBeInTheDocument();
    });
  });
});