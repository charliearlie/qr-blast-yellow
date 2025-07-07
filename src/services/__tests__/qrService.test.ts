import { describe, it, expect, vi, beforeEach } from 'vitest';
import { qrService, QRCodeData } from '../qrService';

// Mock the supabase client at the top level
vi.mock('@/integrations/supabase/client', () => {
  return {
    supabase: {
      auth: {
        getUser: vi.fn(),
      },
      from: vi.fn(() => ({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(),
          })),
        })),
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(),
            order: vi.fn(() => ({
              limit: vi.fn(),
            })),
          })),
          order: vi.fn(() => ({
            limit: vi.fn(),
          })),
        })),
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(),
            })),
          })),
        })),
        delete: vi.fn(() => ({
          eq: vi.fn(),
        })),
      })),
      rpc: vi.fn(),
    },
  };
});

// Import the mocked supabase after the mock is set up
import { supabase } from '@/integrations/supabase/client';

describe('qrService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('URL Normalization', () => {
    it('should add https:// prefix to URLs without protocol', async () => {
      const mockUser = { id: 'user-123' };
      vi.mocked(supabase.auth.getUser).mockResolvedValue({ data: { user: mockUser } });
      vi.mocked(supabase.rpc).mockResolvedValue({ data: 'ABC123', error: null });
      
      const mockQRCode = { id: 'qr-123', original_url: 'https://example.com' };
      const mockSingle = vi.fn().mockResolvedValue({ data: mockQRCode, error: null });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
      vi.mocked(supabase.from).mockReturnValue({ insert: mockInsert } as any);

      const qrData: QRCodeData = {
        title: 'Test QR',
        original_url: 'example.com', // No protocol
        qr_settings: {
          qrColor: '#000000',
          bgColor: '#FFFFFF',
          dotsType: 'square',
          cornersSquareType: 'square',
          cornersDotType: 'square',
          borderStyle: 'none',
          borderColor: '#000000',
          borderWidth: 4,
        },
      };

      await qrService.createQRCode(qrData);

      // Verify that URL was normalized with https://
      expect(mockInsert).toHaveBeenCalledWith([
        expect.objectContaining({
          original_url: 'https://example.com',
        }),
      ]);
    });

    it('should preserve existing https:// protocol', async () => {
      const mockUser = { id: 'user-123' };
      vi.mocked(supabase.auth.getUser).mockResolvedValue({ data: { user: mockUser } });
      vi.mocked(supabase.rpc).mockResolvedValue({ data: 'ABC123', error: null });
      
      const mockQRCode = { id: 'qr-123', original_url: 'https://example.com' };
      const mockSingle = vi.fn().mockResolvedValue({ data: mockQRCode, error: null });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
      vi.mocked(supabase.from).mockReturnValue({ insert: mockInsert } as any);

      const qrData: QRCodeData = {
        title: 'Test QR',
        original_url: 'https://example.com', // Already has protocol
        qr_settings: {
          qrColor: '#000000',
          bgColor: '#FFFFFF',
          dotsType: 'square',
          cornersSquareType: 'square',
          cornersDotType: 'square',
          borderStyle: 'none',
          borderColor: '#000000',
          borderWidth: 4,
        },
      };

      await qrService.createQRCode(qrData);

      expect(mockInsert).toHaveBeenCalledWith([
        expect.objectContaining({
          original_url: 'https://example.com',
        }),
      ]);
    });

    it('should preserve existing http:// protocol', async () => {
      const mockUser = { id: 'user-123' };
      vi.mocked(supabase.auth.getUser).mockResolvedValue({ data: { user: mockUser } });
      vi.mocked(supabase.rpc).mockResolvedValue({ data: 'ABC123', error: null });
      
      const mockQRCode = { id: 'qr-123', original_url: 'http://example.com' };
      const mockSingle = vi.fn().mockResolvedValue({ data: mockQRCode, error: null });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
      vi.mocked(supabase.from).mockReturnValue({ insert: mockInsert } as any);

      const qrData: QRCodeData = {
        title: 'Test QR',
        original_url: 'http://example.com', // Has http protocol
        qr_settings: {
          qrColor: '#000000',
          bgColor: '#FFFFFF',
          dotsType: 'square',
          cornersSquareType: 'square',
          cornersDotType: 'square',
          borderStyle: 'none',
          borderColor: '#000000',
          borderWidth: 4,
        },
      };

      await qrService.createQRCode(qrData);

      expect(mockInsert).toHaveBeenCalledWith([
        expect.objectContaining({
          original_url: 'http://example.com',
        }),
      ]);
    });

    it('should trim whitespace from URLs', async () => {
      const mockUser = { id: 'user-123' };
      vi.mocked(supabase.auth.getUser).mockResolvedValue({ data: { user: mockUser } });
      vi.mocked(supabase.rpc).mockResolvedValue({ data: 'ABC123', error: null });
      
      const mockQRCode = { id: 'qr-123', original_url: 'https://example.com' };
      const mockSingle = vi.fn().mockResolvedValue({ data: mockQRCode, error: null });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
      vi.mocked(supabase.from).mockReturnValue({ insert: mockInsert } as any);

      const qrData: QRCodeData = {
        title: 'Test QR',
        original_url: '  example.com  ', // Has whitespace
        qr_settings: {
          qrColor: '#000000',
          bgColor: '#FFFFFF',
          dotsType: 'square',
          cornersSquareType: 'square',
          cornersDotType: 'square',
          borderStyle: 'none',
          borderColor: '#000000',
          borderWidth: 4,
        },
      };

      await qrService.createQRCode(qrData);

      expect(mockInsert).toHaveBeenCalledWith([
        expect.objectContaining({
          original_url: 'https://example.com',
        }),
      ]);
    });
  });

  describe('QR Code Creation', () => {
    it('should create QR code with all required fields', async () => {
      const mockUser = { id: 'user-123' };
      vi.mocked(supabase.auth.getUser).mockResolvedValue({ data: { user: mockUser } });
      vi.mocked(supabase.rpc).mockResolvedValue({ data: 'ABC123', error: null });
      
      const mockQRCode = {
        id: 'qr-123',
        user_id: 'user-123',
        title: 'Test QR',
        original_url: 'https://example.com',
        short_code: 'ABC123',
        short_url: 'http://localhost:3000/r/ABC123',
        qr_settings: {
          qrColor: '#000000',
          bgColor: '#FFFFFF',
          dotsType: 'square',
          cornersSquareType: 'square',
          cornersDotType: 'square',
          borderStyle: 'none',
          borderColor: '#000000',
          borderWidth: 4,
        },
      };
      
      const mockSingle = vi.fn().mockResolvedValue({ data: mockQRCode, error: null });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
      vi.mocked(supabase.from).mockReturnValue({ insert: mockInsert } as any);

      const qrData: QRCodeData = {
        title: 'Test QR',
        original_url: 'example.com',
        qr_settings: {
          qrColor: '#000000',
          bgColor: '#FFFFFF',
          dotsType: 'square',
          cornersSquareType: 'square',
          cornersDotType: 'square',
          borderStyle: 'none',
          borderColor: '#000000',
          borderWidth: 4,
        },
      };

      const result = await qrService.createQRCode(qrData);

      expect(result).toEqual(mockQRCode);
      expect(supabase.rpc).toHaveBeenCalledWith('generate_short_code');
      expect(supabase.from).toHaveBeenCalledWith('qr_codes');
    });

    it('should throw error when user is not authenticated', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({ data: { user: null } });

      const qrData: QRCodeData = {
        title: 'Test QR',
        original_url: 'example.com',
        qr_settings: {
          qrColor: '#000000',
          bgColor: '#FFFFFF',
          dotsType: 'square',
          cornersSquareType: 'square',
          cornersDotType: 'square',
          borderStyle: 'none',
          borderColor: '#000000',
          borderWidth: 4,
        },
      };

      await expect(qrService.createQRCode(qrData)).rejects.toThrow(
        'User must be authenticated to create trackable QR codes'
      );
    });

    it('should handle short code generation error', async () => {
      const mockUser = { id: 'user-123' };
      vi.mocked(supabase.auth.getUser).mockResolvedValue({ data: { user: mockUser } });
      vi.mocked(supabase.rpc).mockResolvedValue({ data: null, error: { message: 'Failed to generate' } });

      const qrData: QRCodeData = {
        title: 'Test QR',
        original_url: 'example.com',
        qr_settings: {
          qrColor: '#000000',
          bgColor: '#FFFFFF',
          dotsType: 'square',
          cornersSquareType: 'square',
          cornersDotType: 'square',
          borderStyle: 'none',
          borderColor: '#000000',
          borderWidth: 4,
        },
      };

      await expect(qrService.createQRCode(qrData)).rejects.toThrow('Failed to generate short code');
    });

    it('should include time rules in qr_settings', async () => {
      const mockUser = { id: 'user-123' };
      vi.mocked(supabase.auth.getUser).mockResolvedValue({ data: { user: mockUser } });
      vi.mocked(supabase.rpc).mockResolvedValue({ data: 'ABC123', error: null });
      
      const mockQRCode = { id: 'qr-123' };
      const mockSingle = vi.fn().mockResolvedValue({ data: mockQRCode, error: null });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
      vi.mocked(supabase.from).mockReturnValue({ insert: mockInsert } as any);

      const qrData: QRCodeData = {
        title: 'Test QR',
        original_url: 'example.com',
        qr_settings: {
          qrColor: '#000000',
          bgColor: '#FFFFFF',
          dotsType: 'square',
          cornersSquareType: 'square',
          cornersDotType: 'square',
          borderStyle: 'none',
          borderColor: '#000000',
          borderWidth: 4,
          timeRules: [
            {
              id: '1',
              startTime: '09:00',
              endTime: '17:00',
              url: 'https://business.com',
              label: 'Business Hours',
            },
          ],
        },
      };

      await qrService.createQRCode(qrData);

      expect(mockInsert).toHaveBeenCalledWith([
        expect.objectContaining({
          qr_settings: expect.objectContaining({
            timeRules: [
              {
                id: '1',
                startTime: '09:00',
                endTime: '17:00',
                url: 'https://business.com',
                label: 'Business Hours',
              },
            ],
          }),
        }),
      ]);
    });
  });

  describe('Time-Aware Redirect', () => {
    it('should call the time-aware RPC function', async () => {
      const mockUrl = 'https://time-aware-result.com';
      
      // Mock the QR code check that happens first
      const mockFrom = vi.mocked(supabase.from);
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValueOnce({
        data: { short_code: 'ABC123' },
        error: null,
      });
      
      mockFrom.mockReturnValueOnce({
        select: mockSelect,
      } as any);
      mockSelect.mockReturnValueOnce({
        eq: mockEq,
      } as any);
      mockEq.mockReturnValueOnce({
        single: mockSingle,
      } as any);
      
      vi.mocked(supabase.rpc).mockResolvedValue({ data: mockUrl, error: null });

      const result = await qrService.getTimeAwareRedirectUrl('ABC123');

      expect(result).toBe(mockUrl);
      expect(supabase.rpc).toHaveBeenCalledWith('get_redirect_url_for_short_code', {
        p_short_code: 'ABC123',
      });
    });

    it('should return null on RPC error', async () => {
      // Mock the QR code check that happens first
      const mockFrom = vi.mocked(supabase.from);
      mockFrom.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { short_code: 'ABC123' },
              error: null,
            }),
          }),
        }),
      } as any);
      
      vi.mocked(supabase.rpc).mockResolvedValue({ 
        data: null, 
        error: { message: 'Function error' } 
      });

      const result = await qrService.getTimeAwareRedirectUrl('ABC123');

      expect(result).toBeNull();
    });

    it('should log errors appropriately', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock the QR code check that happens first
      const mockFrom = vi.mocked(supabase.from);
      mockFrom.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { short_code: 'ABC123' },
              error: null,
            }),
          }),
        }),
      } as any);
      
      vi.mocked(supabase.rpc).mockResolvedValue({ 
        data: null, 
        error: { message: 'Permission denied' } 
      });

      await qrService.getTimeAwareRedirectUrl('ABC123');

      expect(consoleSpy).toHaveBeenCalledWith(
        'Time-aware redirect error:',
        { message: 'Permission denied' }
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('Device and Browser Detection', () => {
    it('should detect mobile devices correctly', () => {
      const mobileUserAgents = [
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        'Mozilla/5.0 (Linux; Android 10; SM-G973F)',
        'Mozilla/5.0 (Mobile; rv:40.0) Gecko/40.0 Firefox/40.0',
      ];

      mobileUserAgents.forEach(ua => {
        expect(qrService.detectDeviceType(ua)).toBe('Mobile');
      });
    });

    it('should detect tablet devices correctly', () => {
      const tabletUserAgents = [
        'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)',
        // Android tablet should contain "tablet" keyword
        'Mozilla/5.0 (Linux; Android 10; SM-T290) AppleWebKit/537.36 tablet',
      ];

      tabletUserAgents.forEach(ua => {
        expect(qrService.detectDeviceType(ua)).toBe('Tablet');
      });
    });

    it('should detect desktop devices correctly', () => {
      const desktopUserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
      expect(qrService.detectDeviceType(desktopUserAgent)).toBe('Desktop');
    });

    it('should detect browsers correctly', () => {
      const browserTests = [
        { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124', expected: 'Chrome' },
        { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0', expected: 'Firefox' },
        { ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15', expected: 'Safari' },
        { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59', expected: 'Edge' },
        { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 OPR/77.0.4054.277', expected: 'Opera' },
        { ua: 'Some unknown browser', expected: 'Other' },
      ];

      browserTests.forEach(({ ua, expected }) => {
        expect(qrService.detectBrowser(ua)).toBe(expected);
      });
    });
  });
});