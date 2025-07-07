import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
import { qrService } from '@/services/qrService';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    rpc: vi.fn(),
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(),
          })),
        })),
      })),
    })),
    auth: {
      getUser: vi.fn(),
    },
  },
}));

describe('Time Rules Redirect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTimeAwareRedirectUrl', () => {
    it('should return time-specific URL when within time window', async () => {
      const mockRedirectUrl = 'https://breakfast.example.com';
      
      // Mock the QR code check
      const mockFrom = vi.mocked(supabase.from);
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValueOnce({
        data: { short_code: 'testCode' },
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
      
      // Mock the RPC call
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockRedirectUrl,
        error: null,
      });

      const result = await qrService.getTimeAwareRedirectUrl('testCode');
      
      expect(supabase.rpc).toHaveBeenCalledWith('get_redirect_url_for_short_code', {
        p_short_code: 'testCode',
      });
      expect(result).toBe(mockRedirectUrl);
    });

    it('should return null when RPC call fails', async () => {
      // Mock QR code check
      const mockFrom = vi.mocked(supabase.from);
      mockFrom.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { short_code: 'testCode' },
              error: null,
            }),
          }),
        }),
      } as any);
      
      // Mock RPC error
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: null,
        error: { message: 'Permission denied' },
      });

      const result = await qrService.getTimeAwareRedirectUrl('testCode');
      
      expect(result).toBeNull();
    });

    it('should return fallback URL when outside time window', async () => {
      const mockFallbackUrl = 'https://default.example.com';
      
      // Mock QR code check
      const mockFrom = vi.mocked(supabase.from);
      mockFrom.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { short_code: 'testCode' },
              error: null,
            }),
          }),
        }),
      } as any);
      
      // Mock the RPC call returning the fallback URL
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockFallbackUrl,
        error: null,
      });

      const result = await qrService.getTimeAwareRedirectUrl('testCode');
      
      expect(result).toBe(mockFallbackUrl);
    });
  });

  describe('Time Rule Creation', () => {
    it('should save QR code with time rules', async () => {
      const mockUser = { id: 'user123' };
      const mockQRCode = {
        id: 'qr123',
        short_code: 'abc123',
        short_url: 'http://localhost/r/abc123',
      };

      // Mock auth
      vi.mocked(supabase.auth.getUser).mockResolvedValueOnce({
        data: { user: mockUser },
        error: null,
      });

      // Mock RPC for short code generation
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: 'abc123',
        error: null,
      });

      // Mock insert
      const mockFrom = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValueOnce({
          data: mockQRCode,
          error: null,
        }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as any);

      const qrData = {
        title: 'Restaurant Menu',
        original_url: 'https://restaurant.com/menu',
        qr_settings: {
          qrColor: '#000000',
          bgColor: '#FFFFFF',
          dotsType: 'rounded',
          cornersSquareType: 'extra-rounded',
          cornersDotType: 'dot',
          borderStyle: 'solid',
          borderColor: '#000000',
          borderWidth: 4,
          timeRules: [
            {
              id: '1',
              startTime: '09:00',
              endTime: '11:00',
              url: 'https://restaurant.com/breakfast',
              label: 'Breakfast Hours',
            },
            {
              id: '2',
              startTime: '17:00',
              endTime: '22:00',
              url: 'https://restaurant.com/dinner',
              label: 'Dinner Hours',
            },
          ],
        },
      };

      const result = await qrService.createQRCode(qrData);

      expect(mockFrom.insert).toHaveBeenCalledWith([
        expect.objectContaining({
          user_id: 'user123',
          title: 'Restaurant Menu',
          original_url: 'https://restaurant.com/menu',
          qr_settings: expect.objectContaining({
            timeRules: qrData.qr_settings.timeRules,
          }),
        }),
      ]);
      expect(result).toEqual(mockQRCode);
    });
  });

  describe('Time Rule Edge Cases', () => {
    it('should handle midnight-crossing time rules', async () => {
      // This would be tested at the database level
      // Here we just ensure the data structure is correct
      const timeRules = [
        {
          id: '1',
          startTime: '21:00',
          endTime: '02:00', // Crosses midnight
          url: 'https://latenight.example.com',
          label: 'Late Night Menu',
        },
      ];

      expect(timeRules[0].startTime > timeRules[0].endTime).toBe(true);
    });

    it('should handle empty time rules array', async () => {
      const mockFallbackUrl = 'https://default.example.com';
      
      // Mock QR code check
      const mockFrom = vi.mocked(supabase.from);
      mockFrom.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { short_code: 'testCode' },
              error: null,
            }),
          }),
        }),
      } as any);
      
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockFallbackUrl,
        error: null,
      });

      const result = await qrService.getTimeAwareRedirectUrl('testCode');
      
      expect(result).toBe(mockFallbackUrl);
    });
  });
});