import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRedirect } from '@/hooks/useRedirect';
import { qrService } from '@/services/qrService';
import { securityService } from '@/services/securityService';
import { supabase } from '@/integrations/supabase/client';
import React from 'react';

// Mock dependencies
vi.mock('@/services/qrService');
vi.mock('@/services/securityService');
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  // eslint-disable-next-line react/display-name
  return ({ children }: { children: React.ReactNode }) => (
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  );
};

describe('useRedirect Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Time-based redirects', () => {
    it('should redirect to time-specific URL when no geo rules', async () => {
      const mockQRCode = {
        id: 'qr123',
        original_url: 'https://default.example.com',
        qr_settings: {
          timeRules: [
            {
              id: '1',
              startTime: '09:00',
              endTime: '17:00',
              url: 'https://business-hours.example.com',
            },
          ],
        },
      };

      const mockSecurityResult = {
        isSafe: true,
        score: 95,
        threats: [],
        warnings: [],
      };

      vi.mocked(qrService.getQRCodeByShortCode).mockResolvedValueOnce(mockQRCode);
      vi.mocked(qrService.getTimeAwareRedirectUrl).mockResolvedValueOnce('https://business-hours.example.com');
      vi.mocked(securityService.checkUrl).mockResolvedValueOnce(mockSecurityResult);
      vi.mocked(qrService.trackQRCodeScan).mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useRedirect('testCode'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data?.finalUrl).toBe('https://business-hours.example.com');
      expect(result.current.data?.securityResult).toEqual(mockSecurityResult);
    });

    it('should use fallback URL when time rules do not match', async () => {
      const mockQRCode = {
        id: 'qr123',
        original_url: 'https://default.example.com',
        qr_settings: {
          timeRules: [
            {
              id: '1',
              startTime: '09:00',
              endTime: '17:00',
              url: 'https://business-hours.example.com',
            },
          ],
        },
      };

      vi.mocked(qrService.getQRCodeByShortCode).mockResolvedValueOnce(mockQRCode);
      vi.mocked(qrService.getTimeAwareRedirectUrl).mockResolvedValueOnce('https://default.example.com');
      vi.mocked(securityService.checkUrl).mockResolvedValueOnce({
        isSafe: true,
        score: 95,
        threats: [],
        warnings: [],
      });
      vi.mocked(qrService.trackQRCodeScan).mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useRedirect('testCode'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      }, { timeout: 5000 });

      expect(result.current.data?.finalUrl).toBe('https://default.example.com');
    });
  });

  describe('Geo-based redirects', () => {
    it('should use geo-redirect when geo rules exist', async () => {
      const mockQRCode = {
        id: 'qr123',
        original_url: 'https://default.example.com',
        qr_settings: {
          geoRules: [
            {
              id: '1',
              lat: 40.7128,
              lon: -74.0060,
              radius_km: 10,
              url: 'https://nyc.example.com',
              label: 'NYC Store',
            },
          ],
        },
      };

      vi.mocked(qrService.getQRCodeByShortCode).mockResolvedValueOnce(mockQRCode);
      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
        data: { redirectUrl: 'https://nyc.example.com' },
        error: null,
      });
      vi.mocked(securityService.checkUrl).mockResolvedValueOnce({
        isSafe: true,
        score: 95,
        threats: [],
        warnings: [],
      });
      vi.mocked(qrService.trackQRCodeScan).mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useRedirect('testCode'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      }, { timeout: 5000 });

      expect(result.current.data?.finalUrl).toBe('https://nyc.example.com');
      expect(supabase.functions.invoke).toHaveBeenCalledWith('geo-redirect-check', {
        body: { shortCode: 'testCode' },
      });
    });

    it('should fall back to time-aware redirect when geo-redirect fails', async () => {
      const mockQRCode = {
        id: 'qr123',
        original_url: 'https://default.example.com',
        qr_settings: {
          geoRules: [
            {
              id: '1',
              lat: 40.7128,
              lon: -74.0060,
              radius_km: 10,
              url: 'https://nyc.example.com',
            },
          ],
        },
      };

      vi.mocked(qrService.getQRCodeByShortCode).mockResolvedValueOnce(mockQRCode);
      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
        data: null,
        error: { message: 'Geo lookup failed' },
      });
      vi.mocked(qrService.getTimeAwareRedirectUrl).mockResolvedValueOnce('https://default.example.com');
      vi.mocked(securityService.checkUrl).mockResolvedValueOnce({
        isSafe: true,
        score: 95,
        threats: [],
        warnings: [],
      });
      vi.mocked(qrService.trackQRCodeScan).mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useRedirect('testCode'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      }, { timeout: 5000 });

      expect(result.current.data?.finalUrl).toBe('https://default.example.com');
      expect(qrService.getTimeAwareRedirectUrl).toHaveBeenCalledWith('testCode');
    });
  });

  describe('Error handling', () => {
    it('should handle QR code not found', async () => {
      vi.mocked(qrService.getQRCodeByShortCode).mockResolvedValueOnce(null);

      const { result } = renderHook(() => useRedirect('invalidCode'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.error?.message).toBe('QR code not found or is invalid');
    });

    it('should handle missing redirect URL', async () => {
      const mockQRCode = {
        id: 'qr123',
        original_url: null, // Missing URL
        qr_settings: {},
      };

      vi.mocked(qrService.getQRCodeByShortCode).mockResolvedValueOnce(mockQRCode as any);
      vi.mocked(qrService.getTimeAwareRedirectUrl).mockResolvedValueOnce(null);

      const { result } = renderHook(() => useRedirect('testCode'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.error?.message).toBe('No valid redirect URL found');
    });
  });

  describe('Security checks', () => {
    it('should block malicious URLs', async () => {
      const mockQRCode = {
        id: 'qr123',
        original_url: 'https://malicious.example.com',
        qr_settings: {},
      };

      const mockSecurityResult = {
        isSafe: false,
        score: 20,
        threats: ['Phishing site detected'],
        warnings: [],
      };

      vi.mocked(qrService.getQRCodeByShortCode).mockResolvedValueOnce(mockQRCode);
      vi.mocked(qrService.getTimeAwareRedirectUrl).mockResolvedValueOnce('https://malicious.example.com');
      vi.mocked(securityService.checkUrl).mockResolvedValueOnce(mockSecurityResult);
      vi.mocked(qrService.trackQRCodeScan).mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useRedirect('testCode'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      }, { timeout: 5000 });

      expect(result.current.data?.securityResult.isSafe).toBe(false);
      expect(result.current.data?.securityResult.threats).toContain('Phishing site detected');
    });
  });
});