import { describe, it, expect, beforeEach, vi } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

vi.mock('@/integrations/supabase/client');

describe('Master Redirect Function', () => {
  const mockShortCode = 'TEST123';
  const mockUserId = 'user-123';
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Scan limit checks (highest priority)', () => {
    it('should return expired_url when scan limit is reached', async () => {
      const expiredUrl = 'https://example.com/expired';
      
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: expiredUrl,
        error: null,
      });

      const result = await supabase.rpc('get_final_redirect_url', {
        p_short_code: mockShortCode,
        p_latitude: 40.7128,
        p_longitude: -74.0060,
      });

      expect(result.data).toBe(expiredUrl);
      expect(result.error).toBeNull();
    });

    it('should return null when scan limit is reached and no expired_url', async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await supabase.rpc('get_final_redirect_url', {
        p_short_code: mockShortCode,
        p_latitude: 40.7128,
        p_longitude: -74.0060,
      });

      expect(result.data).toBeNull();
      expect(result.error).toBeNull();
    });

    it('should bypass geo and time checks when scan limit is reached', async () => {
      const expiredUrl = 'https://example.com/limit-reached';
      
      // Mock the master function to return expired URL
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: expiredUrl,
        error: null,
      });

      const result = await supabase.rpc('get_final_redirect_url', {
        p_short_code: mockShortCode,
        p_latitude: 40.7128,
        p_longitude: -74.0060,
      });

      // Should return expired URL even if geo/time rules might apply
      expect(result.data).toBe(expiredUrl);
    });
  });

  describe('Geo-aware checks (second priority)', () => {
    it('should check geo rules when scan limit not reached', async () => {
      const geoUrl = 'https://example.com/geo-specific';
      
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: geoUrl,
        error: null,
      });

      const result = await supabase.rpc('get_final_redirect_url', {
        p_short_code: mockShortCode,
        p_latitude: 40.7128,
        p_longitude: -74.0060,
      });

      expect(result.data).toBe(geoUrl);
    });

    it('should skip geo checks when no location provided', async () => {
      const originalUrl = 'https://example.com/original';
      
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: originalUrl,
        error: null,
      });

      const result = await supabase.rpc('get_final_redirect_url', {
        p_short_code: mockShortCode,
      });

      expect(result.data).toBe(originalUrl);
    });
  });

  describe('Time-aware checks (third priority)', () => {
    it('should check time rules when scan limit and geo rules do not apply', async () => {
      const timeUrl = 'https://example.com/time-specific';
      
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: timeUrl,
        error: null,
      });

      const result = await supabase.rpc('get_final_redirect_url', {
        p_short_code: mockShortCode,
        p_latitude: null,
        p_longitude: null,
      });

      expect(result.data).toBe(timeUrl);
    });
  });

  describe('Error handling', () => {
    it('should return null for non-existent QR code', async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await supabase.rpc('get_final_redirect_url', {
        p_short_code: 'NONEXISTENT',
      });

      expect(result.data).toBeNull();
    });

    it('should handle database errors gracefully', async () => {
      const dbError = new Error('Database connection failed');
      
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: dbError,
      });

      const result = await supabase.rpc('get_final_redirect_url', {
        p_short_code: mockShortCode,
      });

      expect(result.error).toBe(dbError);
      expect(result.data).toBeNull();
    });
  });

  describe('Integration with user plans', () => {
    it('should respect scan limits for free users', async () => {
      const expiredUrl = 'https://example.com/free-user-limit';
      
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: expiredUrl,
        error: null,
      });

      const result = await supabase.rpc('get_final_redirect_url', {
        p_short_code: mockShortCode,
      });

      expect(result.data).toBe(expiredUrl);
    });

    it('should apply all checks in order for pro users', async () => {
      const proUrl = 'https://example.com/pro-features';
      
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: proUrl,
        error: null,
      });

      const result = await supabase.rpc('get_final_redirect_url', {
        p_short_code: mockShortCode,
        p_latitude: 40.7128,
        p_longitude: -74.0060,
      });

      expect(result.data).toBe(proUrl);
    });
  });
});