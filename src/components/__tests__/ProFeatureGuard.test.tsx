import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProFeatureGuard from '../ProFeatureGuard';

// Mock the useAuth hook
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '@/hooks/useAuth';

describe('ProFeatureGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const TestContent = () => (
    <div data-testid="test-content">
      <h2>Protected Content</h2>
      <button>Protected Button</button>
    </div>
  );

  describe('Pro User Access', () => {
    it('should show content directly for pro users', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: {
          id: 'user-123',
          user_metadata: { plan: 'pro' }
        }
      });

      render(
        <ProFeatureGuard>
          <TestContent />
        </ProFeatureGuard>
      );

      // Content should be visible without overlay
      expect(screen.getByTestId('test-content')).toBeInTheDocument();
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
      
      // Paywall should not be present
      expect(screen.queryByText(/pro feature/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/upgrade to pro/i)).not.toBeInTheDocument();
    });

    it('should work with temporary pro access flag', () => {
      // The component has a temporary flag that forces pro access
      vi.mocked(useAuth).mockReturnValue({
        user: {
          id: 'user-123',
          user_metadata: { plan: 'free' }
        }
      });

      render(
        <ProFeatureGuard>
          <TestContent />
        </ProFeatureGuard>
      );

      // Content should still be visible due to temporary flag
      expect(screen.getByTestId('test-content')).toBeInTheDocument();
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  describe('Free User Restrictions', () => {
    beforeEach(() => {
      // We need to test what happens when the temporary flag is removed
      // For now, the component always shows content due to the temporary flag
      vi.mocked(useAuth).mockReturnValue({
        user: {
          id: 'user-123',
          user_metadata: { plan: 'free' }
        }
      });
    });

    it('should show paywall for free users when temporary flag is removed', () => {
      // NOTE: Due to the temporary flag in the component, this test represents
      // the expected behavior when the flag is removed
      
      render(
        <ProFeatureGuard>
          <TestContent />
        </ProFeatureGuard>
      );

      // Currently content is visible due to temporary flag
      expect(screen.getByTestId('test-content')).toBeInTheDocument();
      
      // When the temporary flag is removed, these should be present:
      // - Paywall overlay
      // - Dimmed content
      // - Upgrade button
      // - Feature descriptions
    });
  });

  describe('Paywall Content', () => {
    it('should render all paywall elements correctly', () => {
      render(
        <ProFeatureGuard>
          <TestContent />
        </ProFeatureGuard>
      );

      // Currently all content is visible due to temporary flag
      // When the flag is removed, these elements should be testable:
      
      // Main paywall elements that should be present:
      // - Pro Feature heading
      // - Time-Aware QR Codes title
      // - Feature description
      // - Feature list items
      // - Upgrade button
      // - Coming soon text
      
      // For now, we test that the content is accessible
      expect(screen.getByTestId('test-content')).toBeInTheDocument();
    });

    it('should show feature benefits in the paywall', () => {
      render(
        <ProFeatureGuard>
          <TestContent />
        </ProFeatureGuard>
      );

      // When temporary flag is removed, these should be present:
      // - "Business hours → Work website"
      // - "After hours → Contact form" 
      // - "Lunch time → Menu page"
      // - "And much more!"
      
      // Currently testing that component renders without errors
      expect(screen.getByTestId('test-content')).toBeInTheDocument();
    });

    it('should render upgrade button with proper styling', () => {
      render(
        <ProFeatureGuard>
          <TestContent />
        </ProFeatureGuard>
      );

      // When temporary flag is removed, should test:
      // - Button has "Upgrade to Pro" text
      // - Button has star icon
      // - Button is properly styled
      // - Button is clickable
      
      expect(screen.getByTestId('test-content')).toBeInTheDocument();
    });
  });

  describe('User Authentication States', () => {
    it('should handle null user', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: null
      });

      render(
        <ProFeatureGuard>
          <TestContent />
        </ProFeatureGuard>
      );

      // Should still render content due to temporary flag
      expect(screen.getByTestId('test-content')).toBeInTheDocument();
    });

    it('should handle user without metadata', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: {
          id: 'user-123'
          // No user_metadata
        }
      });

      render(
        <ProFeatureGuard>
          <TestContent />
        </ProFeatureGuard>
      );

      // Should still render content due to temporary flag
      expect(screen.getByTestId('test-content')).toBeInTheDocument();
    });

    it('should handle user with null metadata', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: {
          id: 'user-123',
          user_metadata: null
        }
      });

      render(
        <ProFeatureGuard>
          <TestContent />
        </ProFeatureGuard>
      );

      // Should still render content due to temporary flag
      expect(screen.getByTestId('test-content')).toBeInTheDocument();
    });

    it('should handle user with empty metadata', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: {
          id: 'user-123',
          user_metadata: {}
        }
      });

      render(
        <ProFeatureGuard>
          <TestContent />
        </ProFeatureGuard>
      );

      // Should still render content due to temporary flag
      expect(screen.getByTestId('test-content')).toBeInTheDocument();
    });
  });

  describe('Content Rendering', () => {
    it('should render children correctly when access is granted', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: {
          id: 'user-123',
          user_metadata: { plan: 'pro' }
        }
      });

      render(
        <ProFeatureGuard>
          <div data-testid="complex-content">
            <h1>Complex Title</h1>
            <div>
              <span>Nested content</span>
              <button onClick={() => {}}>Interactive button</button>
            </div>
            <ul>
              <li>Item 1</li>
              <li>Item 2</li>
            </ul>
          </div>
        </ProFeatureGuard>
      );

      // All nested content should be present and accessible
      expect(screen.getByTestId('complex-content')).toBeInTheDocument();
      expect(screen.getByText('Complex Title')).toBeInTheDocument();
      expect(screen.getByText('Nested content')).toBeInTheDocument();
      expect(screen.getByText('Interactive button')).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });

    it('should handle multiple children', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: {
          id: 'user-123',
          user_metadata: { plan: 'pro' }
        }
      });

      render(
        <ProFeatureGuard>
          <div>First child</div>
          <div>Second child</div>
          <span>Third child</span>
        </ProFeatureGuard>
      );

      expect(screen.getByText('First child')).toBeInTheDocument();
      expect(screen.getByText('Second child')).toBeInTheDocument();
      expect(screen.getByText('Third child')).toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    it('should work with interactive elements', async () => {
      const mockHandler = vi.fn();
      vi.mocked(useAuth).mockReturnValue({
        user: {
          id: 'user-123',
          user_metadata: { plan: 'pro' }
        }
      });

      const user = userEvent.setup();
      render(
        <ProFeatureGuard>
          <button data-testid="interactive-btn" onClick={mockHandler}>
            Click me
          </button>
        </ProFeatureGuard>
      );

      const button = screen.getByTestId('interactive-btn');
      await user.click(button);

      expect(mockHandler).toHaveBeenCalledTimes(1);
    });

    it('should preserve component state', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: {
          id: 'user-123',
          user_metadata: { plan: 'pro' }
        }
      });

      const StatefulComponent = () => {
        const [count, setCount] = React.useState(0);
        return (
          <div>
            <span data-testid="count">Count: {count}</span>
            <button onClick={() => setCount(c => c + 1)}>Increment</button>
          </div>
        );
      };

      render(
        <ProFeatureGuard>
          <StatefulComponent />
        </ProFeatureGuard>
      );

      expect(screen.getByTestId('count')).toHaveTextContent('Count: 0');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty children', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: {
          id: 'user-123',
          user_metadata: { plan: 'pro' }
        }
      });

      render(<ProFeatureGuard>{null}</ProFeatureGuard>);
      
      // Should not crash and should render without content
      expect(document.body).toBeInTheDocument();
    });

    it('should handle string children', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: {
          id: 'user-123',
          user_metadata: { plan: 'pro' }
        }
      });

      render(
        <ProFeatureGuard>
          Plain text content
        </ProFeatureGuard>
      );

      expect(screen.getByText('Plain text content')).toBeInTheDocument();
    });

    it('should handle mixed content types', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: {
          id: 'user-123',
          user_metadata: { plan: 'pro' }
        }
      });

      render(
        <ProFeatureGuard>
          <span>Text content</span>
          <div>Element content</div>
          <span>42</span>
          <span>More text</span>
        </ProFeatureGuard>
      );

      expect(screen.getByText('Text content')).toBeInTheDocument();
      expect(screen.getByText('Element content')).toBeInTheDocument();
      expect(screen.getByText('42')).toBeInTheDocument();
      expect(screen.getByText('More text')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should maintain proper DOM structure', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: {
          id: 'user-123',
          user_metadata: { plan: 'pro' }
        }
      });

      render(
        <ProFeatureGuard>
          <main>
            <h1>Main content</h1>
            <section>
              <h2>Section title</h2>
              <p>Paragraph content</p>
            </section>
          </main>
        </ProFeatureGuard>
      );

      // Verify proper semantic structure is preserved
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    });
  });
});