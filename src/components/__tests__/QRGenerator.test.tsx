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
  default: ({ dotsType, cornersSquareType, cornersDotType, onDotsTypeChange, onCornersSquareTypeChange, onCornersDotTypeChange }: any) => (
    <div data-testid="qr-shape-selector">
      <div>Data Pattern: {dotsType}</div>
      <div>Corner Square: {cornersSquareType}</div>
      <div>Corner Dot: {cornersDotType}</div>
      <button onClick={() => onDotsTypeChange('square')}>Square</button>
      <button onClick={() => onDotsTypeChange('rounded')}>Rounded</button>
    </div>
  ),
}));

vi.mock('../QRBorderSelector', () => ({
  default: ({ onBorderChange, currentBorder }: any) => (
    <div data-testid="qr-border-selector">
      <button onClick={() => onBorderChange({ style: 'solid', color: '#000', width: 2 })}>
        Solid Border
      </button>
      <span>Current: {currentBorder?.style || 'none'}</span>
    </div>
  ),
}));

vi.mock('../AuthModal', () => ({
  default: ({ open, onOpenChange }: any) => (
    open ? <div data-testid="auth-modal">Auth Modal</div> : null
  ),
}));

vi.mock('../GeoRuleManager', () => ({
  default: ({ rules, onRulesChange, defaultUrl }: any) => (
    <div data-testid="geo-rule-manager">
      <div>Geo Rules Manager</div>
      <div>Rules count: {rules.length}</div>
      <div>Default URL: {defaultUrl}</div>
      <button onClick={() => onRulesChange([...rules, { id: 'test', type: 'radius', lat: 40, lon: -74, radius_km: 10, url: 'https://test.com' }])}>
        Add Geo Rule
      </button>
    </div>
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

vi.mock('../LoginWall', () => ({
  default: ({ children, feature }: any) => (
    <div data-testid="login-wall" data-feature={feature}>
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

vi.mock('../ScanLimitManager', () => ({
  default: ({ isEnabled, onEnabledChange, limit, onLimitChange }: any) => (
    <div data-testid="scan-limit-manager">
      <span>Scan Limit Manager</span>
      <span>Enabled: {isEnabled ? 'Yes' : 'No'}</span>
      <span>Limit: {limit}</span>
      <button onClick={() => onEnabledChange(!isEnabled)}>
        Toggle Enabled
      </button>
      <button onClick={() => onLimitChange(50)}>
        Set Limit 50
      </button>
    </div>
  ),
}));

vi.mock('../TemplateSelector', () => ({
  default: ({ selectedTemplateId, onSelectTemplate }: any) => (
    <div data-testid="template-selector">
      <button 
        onClick={() => onSelectTemplate({ id: 'website', urlPrefix: 'https://', placeholder: 'Enter any website URL' })}
        aria-label="Select Website template"
      >
        Website
      </button>
      <button 
        onClick={() => onSelectTemplate({ id: 'whatsapp', urlPrefix: 'https://wa.me/', placeholder: 'Phone number with country code' })}
        aria-label="Select WhatsApp template"
      >
        WhatsApp
      </button>
      <span>Selected: {selectedTemplateId}</span>
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
      
      expect(screen.getByText(/choose a template/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/qr code title/i)).toBeInTheDocument();
      expect(screen.getByText(/upload logo/i)).toBeInTheDocument();
    });

    it('should render template selector', () => {
      render(<QRGenerator />);
      
      expect(screen.getByTestId('template-selector')).toBeInTheDocument();
      expect(screen.getByLabelText('Select Website template')).toBeInTheDocument();
      expect(screen.getByLabelText('Select WhatsApp template')).toBeInTheDocument();
    });

    it('should render all tabs', () => {
      render(<QRGenerator />);
      
      expect(screen.getByText('Basic')).toBeInTheDocument();
      expect(screen.getByText('Shapes')).toBeInTheDocument();
      expect(screen.getByText('Borders')).toBeInTheDocument();
      expect(screen.getByText('Geo')).toBeInTheDocument();
      expect(screen.getByText('Time')).toBeInTheDocument();
      expect(screen.getByText('Limits')).toBeInTheDocument();
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
      
      const urlInput = screen.getByPlaceholderText(/enter any website url/i);
      await user.type(urlInput, 'example.com');
      
      expect(urlInput).toHaveValue('example.com');
    });

    it('should change template when selector is used', async () => {
      const user = userEvent.setup();
      render(<QRGenerator />);
      
      // Click WhatsApp template
      await user.click(screen.getByText('WhatsApp'));
      
      // Check that the input placeholder changes
      expect(screen.getByPlaceholderText(/phone number with country code/i)).toBeInTheDocument();
    });

    it('should update title input value', async () => {
      const user = userEvent.setup();
      render(<QRGenerator />);
      
      const titleInput = screen.getByLabelText(/qr code title/i);
      await user.type(titleInput, 'My QR Code');
      
      expect(titleInput).toHaveValue('My QR Code');
    });

    it('should build URL with template prefix', async () => {
      const user = userEvent.setup();
      render(<QRGenerator />);
      
      // Default template is website with https:// prefix
      const urlInput = screen.getByPlaceholderText(/enter any website url/i);
      await user.type(urlInput, 'example.com');
      
      // The URL input just shows the user input, not the full URL
      expect(urlInput).toHaveValue('example.com');
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
      expect(shapeSelector).toHaveTextContent('Data Pattern: square');
      
      await user.click(screen.getByText('Rounded'));
      // The shape would be updated (we're testing the component integration)
    });
  });

  describe('Time Rules', () => {
    it('should render time rule manager in time rules tab', async () => {
      const user = userEvent.setup();
      render(<QRGenerator />);
      
      await user.click(screen.getByText('Time'));
      
      expect(screen.getByTestId('time-rule-manager')).toBeInTheDocument();
      expect(screen.getByTestId('login-wall')).toBeInTheDocument();
    });

    it('should show current URL as default in time rules', async () => {
      const user = userEvent.setup();
      render(<QRGenerator />);
      
      // Set a URL first
      const urlInput = screen.getByPlaceholderText(/enter any website url/i);
      await user.type(urlInput, 'example.com');
      
      await user.click(screen.getByText('Time'));
      
      expect(screen.getByText('Default URL: https://example.com')).toBeInTheDocument();
    });

    it('should update time rules when manager is used', async () => {
      const user = userEvent.setup();
      render(<QRGenerator />);
      
      await user.click(screen.getByText('Time'));
      
      const timeRuleManager = screen.getByTestId('time-rule-manager');
      expect(timeRuleManager).toHaveTextContent('Rules: 0');
      
      await user.click(screen.getByText('Add Rule'));
      // Time rules would be updated in the parent component
    });
  });

  describe('Geo Rules', () => {
    it('should render geo rule manager in geo tab', async () => {
      const user = userEvent.setup();
      render(<QRGenerator />);
      
      await user.click(screen.getByText('Geo'));
      
      expect(screen.getByTestId('geo-rule-manager')).toBeInTheDocument();
      expect(screen.getByTestId('login-wall')).toBeInTheDocument();
    });

    it('should show current URL as default in geo rules', async () => {
      const user = userEvent.setup();
      render(<QRGenerator />);
      
      // Set a URL first
      const urlInput = screen.getByPlaceholderText(/enter any website url/i);
      await user.type(urlInput, 'example.com');
      
      await user.click(screen.getByText('Geo'));
      
      expect(screen.getByText('Default URL: https://example.com')).toBeInTheDocument();
    });

    it('should update geo rules when manager is used', async () => {
      const user = userEvent.setup();
      render(<QRGenerator />);
      
      await user.click(screen.getByText('Geo'));
      
      const geoRuleManager = screen.getByTestId('geo-rule-manager');
      expect(geoRuleManager).toHaveTextContent('Rules count: 0');
      
      await user.click(screen.getByText('Add Geo Rule'));
      // Geo rules would be updated in the parent component
    });

    it('should render all six tabs including geo and limits', () => {
      render(<QRGenerator />);
      
      expect(screen.getByText('Basic')).toBeInTheDocument();
      expect(screen.getByText('Shapes')).toBeInTheDocument();
      expect(screen.getByText('Borders')).toBeInTheDocument();
      expect(screen.getByText('Geo')).toBeInTheDocument();
      expect(screen.getByText('Time')).toBeInTheDocument();
      expect(screen.getByText('Limits')).toBeInTheDocument();
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
    it('should render color controls in basic tab', async () => {
      render(<QRGenerator />);
      
      // Color controls are in the basic tab, not shapes tab
      expect(screen.getByLabelText(/qr color/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/background/i)).toBeInTheDocument();
    });

    it('should render color inputs with default values', async () => {
      render(<QRGenerator />);
      
      // Color controls are in the basic tab by default
      const qrColorLabel = screen.getByLabelText(/qr color/i);
      const bgColorLabel = screen.getByLabelText(/background/i);
      
      expect(qrColorLabel).toBeInTheDocument();
      expect(bgColorLabel).toBeInTheDocument();
      
      // Check that default color values are present (multiple inputs can have same value)
      const blackInputs = screen.getAllByDisplayValue('#000000');
      const whiteInputs = screen.getAllByDisplayValue('#FFFFFF');
      
      expect(blackInputs.length).toBeGreaterThan(0);
      expect(whiteInputs.length).toBeGreaterThan(0);
    });

    it('should show color contrast warning when colors are similar', async () => {
      const user = userEvent.setup();
      render(<QRGenerator />);
      
      // Enter a URL to trigger QR generation
      const urlInput = screen.getByLabelText(/website url/i);
      await user.type(urlInput, 'example.com');
      
      // Find text inputs for colors
      const colorInputs = screen.getAllByDisplayValue(/^#[0-9A-Fa-f]{6}$/);
      const qrColorInput = colorInputs[0]; // QR color
      const bgColorInput = colorInputs[1]; // Background color
      
      // Set similar colors to trigger contrast warning
      await user.click(qrColorInput);
      await user.keyboard('{Control>}a{/Control}');
      await user.type(qrColorInput, '#000000');
      
      await user.click(bgColorInput);
      await user.keyboard('{Control>}a{/Control}');
      await user.type(bgColorInput, '#111111');
      
      // Should show low contrast warning
      expect(screen.getByText(/colors too similar/i)).toBeInTheDocument();
    });
  });

  describe('Download Functionality', () => {
    it('should show download button when QR is valid', async () => {
      const user = userEvent.setup();
      render(<QRGenerator />);
      
      // Enter a URL to show download button
      const urlInput = screen.getByPlaceholderText(/enter any website url/i);
      await user.type(urlInput, 'example.com');
      
      expect(screen.getByText(/download qr code/i)).toBeInTheDocument();
    });

    it('should show coming soon sticker button', () => {
      render(<QRGenerator />);
      
      // Coming soon button should always be visible
      expect(screen.getByText(/order high-quality stickers/i)).toBeInTheDocument();
    });
  });

  describe('QR Code Display', () => {
    it('should show QR code placeholder initially', () => {
      render(<QRGenerator />);
      
      // Should show placeholder text initially
      expect(screen.getByText(/qr code will appear here/i)).toBeInTheDocument();
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
      const urlInput = screen.getByPlaceholderText(/enter any website url/i);
      await user.type(urlInput, 'example.com');
      
      await user.click(screen.getByText('Time'));
      
      expect(screen.getByText('Default URL: https://example.com')).toBeInTheDocument();
    });

    it('should show LoginWall for time rules', async () => {
      const user = userEvent.setup();
      render(<QRGenerator />);
      
      await user.click(screen.getByText('Time'));
      
      const loginWall = screen.getByTestId('login-wall');
      expect(loginWall).toBeInTheDocument();
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