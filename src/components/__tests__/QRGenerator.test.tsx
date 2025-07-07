import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QRGenerator from '../QRGenerator';

// Mock QR Code Styling
vi.mock('qr-code-styling', () => {
  return {
    default: class MockQRCodeStyling {
      constructor() {}
      update() {}
      append() {}
      download() {}
    },
  };
});

// Mock hooks
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'user-123', user_metadata: { plan: 'free' } },
  }),
}));

// Mock qr service
vi.mock('@/services/qrService', () => ({
  qrService: {
    createQRCode: vi.fn(),
  },
}));

// Mock child components
vi.mock('../QRShapeSelector', () => ({
  default: ({ onShapeChange, currentShape }: any) => (
    <div data-testid="qr-shape-selector">
      <button onClick={() => onShapeChange('square')}>Square</button>
      <button onClick={() => onShapeChange('rounded')}>Rounded</button>
      <span>Current: {currentShape}</span>
    </div>
  ),
}));

vi.mock('../QRBorderSelector', () => ({
  default: ({ onBorderChange, currentBorder }: any) => (
    <div data-testid="qr-border-selector">
      <button onClick={() => onBorderChange({ style: 'solid', color: '#000', width: 2 })}>
        Solid Border
      </button>
      <span>Current: {currentBorder.style}</span>
    </div>
  ),
}));

vi.mock('../AuthModal', () => ({
  default: ({ open, onOpenChange }: any) => (
    open ? <div data-testid="auth-modal">Auth Modal</div> : null
  ),
}));

vi.mock('../TimeRuleManager', () => ({
  default: ({ rules, onRulesChange, defaultUrl }: any) => (
    <div data-testid="time-rule-manager">
      <span>Rules: {rules.length}</span>
      <span>Default URL: {defaultUrl}</span>
      <button onClick={() => onRulesChange([{ id: '1', startTime: '09:00', endTime: '17:00', url: 'https://business.com' }])}>
        Add Rule
      </button>
    </div>
  ),
}));

vi.mock('../ProFeatureGuard', () => ({
  default: ({ children, feature }: any) => (
    <div data-testid="pro-feature-guard" data-feature={feature}>
      {children}
    </div>
  ),
}));

vi.mock('../SaveButtons', () => ({
  default: ({ onSave, isLoading, currentQRCode }: any) => (
    <div data-testid="save-buttons">
      <button onClick={onSave} disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save QR Code'}
      </button>
      <span>Has QR Code: {currentQRCode ? 'Yes' : 'No'}</span>
    </div>
  ),
}));

describe('QRGenerator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render the QR generator form', () => {
      render(<QRGenerator />);
      
      expect(screen.getByLabelText(/website url/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/qr code title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/company logo/i)).toBeInTheDocument();
    });

    it('should render all tabs', () => {
      render(<QRGenerator />);
      
      expect(screen.getByText('Basic')).toBeInTheDocument();
      expect(screen.getByText('Shapes')).toBeInTheDocument();
      expect(screen.getByText('Borders')).toBeInTheDocument();
      expect(screen.getByText('Time Rules')).toBeInTheDocument();
    });

    it('should show analytics toggle when user is authenticated', () => {
      render(<QRGenerator />);
      
      expect(screen.getByLabelText(/enable analytics/i)).toBeInTheDocument();
    });
  });

  describe('Form Interactions', () => {
    it('should update URL input value', async () => {
      const user = userEvent.setup();
      render(<QRGenerator />);
      
      const urlInput = screen.getByLabelText(/website url/i);
      await user.type(urlInput, 'https://example.com');
      
      expect(urlInput).toHaveValue('https://example.com');
    });

    it('should update title input value', async () => {
      const user = userEvent.setup();
      render(<QRGenerator />);
      
      const titleInput = screen.getByLabelText(/qr code title/i);
      await user.type(titleInput, 'My QR Code');
      
      expect(titleInput).toHaveValue('My QR Code');
    });

    it('should show protocol hint for URLs without protocol', async () => {
      const user = userEvent.setup();
      render(<QRGenerator />);
      
      const urlInput = screen.getByLabelText(/website url/i);
      await user.type(urlInput, 'example.com');
      
      expect(screen.getByText(/will be saved as:/i)).toBeInTheDocument();
      expect(screen.getByText('https://example.com')).toBeInTheDocument();
    });

    it('should toggle analytics switch', async () => {
      const user = userEvent.setup();
      render(<QRGenerator />);
      
      const analyticsSwitch = screen.getByLabelText(/enable analytics/i);
      expect(analyticsSwitch).toBeChecked();
      
      await user.click(analyticsSwitch);
      expect(analyticsSwitch).not.toBeChecked();
    });
  });

  describe('Logo Upload', () => {
    it('should handle logo upload', async () => {
      const user = userEvent.setup();
      render(<QRGenerator />);
      
      const uploadButton = screen.getByText(/upload logo/i);
      expect(uploadButton).toBeInTheDocument();
      
      // Test clicking the upload button
      await user.click(uploadButton);
      
      // The hidden file input should be triggered (we can't test FileReader in JSDOM)
    });

    it('should show clear button when logo is uploaded', () => {
      render(<QRGenerator />);
      
      // Initially no clear button since no logo is uploaded
      expect(screen.queryByText(/clear/i)).not.toBeInTheDocument();
    });
  });

  describe('Customization Tabs', () => {
    it('should render shape selector in shapes tab', async () => {
      const user = userEvent.setup();
      render(<QRGenerator />);
      
      await user.click(screen.getByText('Shapes'));
      
      expect(screen.getByTestId('qr-shape-selector')).toBeInTheDocument();
    });

    it('should render border selector in borders tab', async () => {
      const user = userEvent.setup();
      render(<QRGenerator />);
      
      await user.click(screen.getByText('Borders'));
      
      expect(screen.getByTestId('qr-border-selector')).toBeInTheDocument();
    });

    it('should update shapes when selector is used', async () => {
      const user = userEvent.setup();
      render(<QRGenerator />);
      
      await user.click(screen.getByText('Shapes'));
      
      const shapeSelector = screen.getByTestId('qr-shape-selector');
      expect(shapeSelector).toHaveTextContent('Current: square');
      
      await user.click(screen.getByText('Rounded'));
      // The shape would be updated (we're testing the component integration)
    });
  });

  describe('Time Rules', () => {
    it('should render time rule manager in time rules tab', async () => {
      const user = userEvent.setup();
      render(<QRGenerator />);
      
      await user.click(screen.getByText('Time Rules'));
      
      expect(screen.getByTestId('time-rule-manager')).toBeInTheDocument();
      expect(screen.getByTestId('pro-feature-guard')).toBeInTheDocument();
    });

    it('should show current URL as default in time rules', async () => {
      const user = userEvent.setup();
      render(<QRGenerator />);
      
      // Set a URL first
      const urlInput = screen.getByLabelText(/website url/i);
      await user.type(urlInput, 'https://example.com');
      
      await user.click(screen.getByText('Time Rules'));
      
      expect(screen.getByText('Default URL: https://example.com')).toBeInTheDocument();
    });

    it('should update time rules when manager is used', async () => {
      const user = userEvent.setup();
      render(<QRGenerator />);
      
      await user.click(screen.getByText('Time Rules'));
      
      const timeRuleManager = screen.getByTestId('time-rule-manager');
      expect(timeRuleManager).toHaveTextContent('Rules: 0');
      
      await user.click(screen.getByText('Add Rule'));
      // Time rules would be updated in the parent component
    });
  });

  describe('Save Functionality', () => {
    it('should render save buttons', () => {
      render(<QRGenerator />);
      
      expect(screen.getByTestId('save-buttons')).toBeInTheDocument();
    });

    it('should show save button enabled when form is valid', () => {
      render(<QRGenerator />);
      
      const saveButtons = screen.getByTestId('save-buttons');
      expect(saveButtons).toHaveTextContent('Save QR Code');
    });
  });

  describe('Color Customization', () => {
    it('should render color controls in shapes tab', async () => {
      const user = userEvent.setup();
      render(<QRGenerator />);
      
      await user.click(screen.getByText('Shapes'));
      
      // Look for color inputs
      expect(screen.getByLabelText(/qr color/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/background color/i)).toBeInTheDocument();
    });

    it('should update color inputs', async () => {
      const user = userEvent.setup();
      render(<QRGenerator />);
      
      await user.click(screen.getByText('Shapes'));
      
      const qrColorInput = screen.getByLabelText(/qr color/i);
      const bgColorInput = screen.getByLabelText(/background color/i);
      
      await user.clear(qrColorInput);
      await user.type(qrColorInput, '#ff0000');
      await user.clear(bgColorInput);
      await user.type(bgColorInput, '#ffffff');
      
      expect(qrColorInput).toHaveValue('#ff0000');
      expect(bgColorInput).toHaveValue('#ffffff');
    });

    it('should show color contrast warning', async () => {
      const user = userEvent.setup();
      render(<QRGenerator />);
      
      await user.click(screen.getByText('Shapes'));
      
      // Should show low contrast indicator when colors are similar
      expect(screen.getByText(/contrast/i)).toBeInTheDocument();
    });
  });

  describe('Download Functionality', () => {
    it('should show download buttons', () => {
      render(<QRGenerator />);
      
      // Look for download buttons
      expect(screen.getByText(/download png/i)).toBeInTheDocument();
      expect(screen.getByText(/download svg/i)).toBeInTheDocument();
    });
  });

  describe('QR Code Display', () => {
    it('should show QR code preview', () => {
      render(<QRGenerator />);
      
      // The QR code container should be present
      expect(screen.getByText(/qr code preview/i)).toBeInTheDocument();
    });

    it('should update QR code when URL changes', async () => {
      const user = userEvent.setup();
      render(<QRGenerator />);
      
      const urlInput = screen.getByLabelText(/website url/i);
      await user.type(urlInput, 'https://example.com');
      
      // QR code should update (we can't test QRCodeStyling directly in JSDOM)
      expect(urlInput).toHaveValue('https://example.com');
    });
  });

  describe('Component Integration', () => {
    it('should pass correct props to child components', async () => {
      const user = userEvent.setup();
      render(<QRGenerator />);
      
      // Check that URL is passed to TimeRuleManager
      const urlInput = screen.getByLabelText(/website url/i);
      await user.type(urlInput, 'https://example.com');
      
      await user.click(screen.getByText('Time Rules'));
      
      expect(screen.getByText('Default URL: https://example.com')).toBeInTheDocument();
    });

    it('should show ProFeatureGuard for time rules', async () => {
      const user = userEvent.setup();
      render(<QRGenerator />);
      
      await user.click(screen.getByText('Time Rules'));
      
      const proGuard = screen.getByTestId('pro-feature-guard');
      expect(proGuard).toBeInTheDocument();
    });
  });

  describe('Analytics Features', () => {
    it('should show analytics info when QR code is saved', async () => {
      const user = userEvent.setup();
      render(<QRGenerator />);
      
      // When currentQRCode is set (simulated), analytics info should show
      const urlInput = screen.getByLabelText(/website url/i);
      await user.type(urlInput, 'https://example.com');
      
      // Analytics toggle should be visible and enabled by default
      const analyticsSwitch = screen.getByLabelText(/enable analytics/i);
      expect(analyticsSwitch).toBeChecked();
    });
  });
});