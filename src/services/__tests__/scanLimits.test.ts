import { describe, it, expect, beforeEach, vi } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
import { qrService } from '../qrService';

vi.mock('@/integrations/supabase/client');

describe('Scan Limits Database Operations', () => {
  const mockUserId = 'test-user-123';
  const mockQRCode = {
    id: 'qr-123',
    short_code: 'TEST123',
    original_url: 'https://example.com',
    user_id: mockUserId,
    scan_count: 0,
    scan_limit: null,
    expired_url: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock auth
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: { id: mockUserId } },
      error: null,
    });

    // Mock generate_short_code RPC
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: 'TEST123',
      error: null,
    });
  });

  describe('Creating QR code with scan limits', () => {
    it('should create a QR code with scan limit', async () => {
      const scanLimit = 100;
      const expiredUrl = 'https://example.com/expired';
      
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { ...mockQRCode, scan_limit: scanLimit, expired_url: expiredUrl },
              error: null,
            }),
          }),
        }),
      } as any);

      const result = await qrService.createQRCode({
        title: 'Test QR Code',
        original_url: 'https://example.com',
        qr_settings: {
          qrColor: '#000000',
          bgColor: '#FFFFFF',
          dotsType: 'rounded',
          cornersSquareType: 'extra-rounded',
          cornersDotType: 'dot',
          borderStyle: 'solid',
          borderColor: '#000000',
          borderWidth: 0,
        },
        scan_limit: scanLimit,
        expired_url: expiredUrl,
      });

      expect(result).toMatchObject({
        scan_limit: scanLimit,
        expired_url: expiredUrl,
      });
    });

    it('should create a QR code without scan limit when not provided', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockQRCode,
              error: null,
            }),
          }),
        }),
      } as any);

      const result = await qrService.createQRCode({
        title: 'Test QR Code',
        original_url: 'https://example.com',
        qr_settings: {
          qrColor: '#000000',
          bgColor: '#FFFFFF',
          dotsType: 'rounded',
          cornersSquareType: 'extra-rounded',
          cornersDotType: 'dot',
          borderStyle: 'solid',
          borderColor: '#000000',
          borderWidth: 0,
        },
      });

      expect(result.scan_limit).toBeNull();
      expect(result.expired_url).toBeNull();
    });
  });

  describe('Updating QR code scan limits', () => {
    it('should update scan limit and expired URL', async () => {
      const newScanLimit = 50;
      const newExpiredUrl = 'https://example.com/new-expired';
      
      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { ...mockQRCode, scan_limit: newScanLimit, expired_url: newExpiredUrl },
                  error: null,
                }),
              }),
            }),
          }),
        }),
      } as any);

      const result = await qrService.updateQRCode('qr-123', {
        scan_limit: newScanLimit,
        expired_url: newExpiredUrl,
      });

      expect(result).toMatchObject({
        scan_limit: newScanLimit,
        expired_url: newExpiredUrl,
      });
    });

    it('should remove scan limit when set to null', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { ...mockQRCode, scan_limit: null, expired_url: null },
                  error: null,
                }),
              }),
            }),
          }),
        }),
      } as any);

      const result = await qrService.updateQRCode('qr-123', {
        scan_limit: null,
        expired_url: null,
      });

      expect(result.scan_limit).toBeNull();
      expect(result.expired_url).toBeNull();
    });
  });

  describe('Checking scan limit status', () => {
    it('should indicate when scan limit is not reached', async () => {
      const qrWithLimit = { ...mockQRCode, scan_count: 50, scan_limit: 100 };
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: qrWithLimit,
              error: null,
            }),
          }),
        }),
      } as any);

      const result = await qrService.getQRCode('TEST123');
      expect(result).toBeDefined();
      expect(result!.scan_count).toBeLessThan(result!.scan_limit!);
    });

    it('should indicate when scan limit is reached', async () => {
      const qrWithLimit = { ...mockQRCode, scan_count: 100, scan_limit: 100 };
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: qrWithLimit,
              error: null,
            }),
          }),
        }),
      } as any);

      const result = await qrService.getQRCode('TEST123');
      expect(result).toBeDefined();
      expect(result!.scan_count).toEqual(result!.scan_limit!);
    });

    it('should indicate when scan limit is exceeded', async () => {
      const qrWithLimit = { ...mockQRCode, scan_count: 101, scan_limit: 100 };
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: qrWithLimit,
              error: null,
            }),
          }),
        }),
      } as any);

      const result = await qrService.getQRCode('TEST123');
      expect(result).toBeDefined();
      expect(result!.scan_count).toBeGreaterThan(result!.scan_limit!);
    });
  });

  describe('Error handling', () => {
    it('should handle database errors when creating QR code with scan limit', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: new Error('Database error'),
            }),
          }),
        }),
      } as any);

      await expect(qrService.createQRCode({
        title: 'Test QR Code',
        original_url: 'https://example.com',
        qr_settings: {
          qrColor: '#000000',
          bgColor: '#FFFFFF',
          dotsType: 'rounded',
          cornersSquareType: 'extra-rounded',
          cornersDotType: 'dot',
          borderStyle: 'solid',
          borderColor: '#000000',
          borderWidth: 0,
        },
        scan_limit: 100,
      })).rejects.toThrow('Database error');
    });

    it('should handle database errors when updating scan limit', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: null,
                  error: new Error('Update failed'),
                }),
              }),
            }),
          }),
        }),
      } as any);

      await expect(qrService.updateQRCode('qr-123', {
        scan_limit: 50,
      })).rejects.toThrow('Update failed');
    });
  });
});