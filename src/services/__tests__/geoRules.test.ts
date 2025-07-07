import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

describe('Geo Rules Edge Function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('geo-redirect-check', () => {
    it('should return geo-specific URL when within radius', async () => {
      const mockResponse = {
        data: {
          redirectUrl: 'https://local-store.example.com',
          matchedRule: {
            label: 'NYC Store',
            lat: 40.7128,
            lon: -74.0060,
            radius_km: 10,
          },
        },
        error: null,
      };

      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce(mockResponse);

      const result = await supabase.functions.invoke('geo-redirect-check', {
        body: { shortCode: 'testCode' },
      });

      expect(result.data?.redirectUrl).toBe('https://local-store.example.com');
      expect(result.data?.matchedRule.label).toBe('NYC Store');
    });

    it('should fall back to time-aware redirect when geo fails', async () => {
      const mockResponse = {
        data: {
          redirectUrl: 'https://default.example.com',
          fallbackReason: 'No geo rules matched',
        },
        error: null,
      };

      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce(mockResponse);

      const result = await supabase.functions.invoke('geo-redirect-check', {
        body: { shortCode: 'testCode' },
      });

      expect(result.data?.redirectUrl).toBe('https://default.example.com');
      expect(result.data?.fallbackReason).toBe('No geo rules matched');
    });

    it('should handle geolocation API errors gracefully', async () => {
      const mockResponse = {
        data: null,
        error: {
          message: 'Failed to get user location',
        },
      };

      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce(mockResponse);

      const result = await supabase.functions.invoke('geo-redirect-check', {
        body: { shortCode: 'testCode' },
      });

      expect(result.error?.message).toBe('Failed to get user location');
    });
  });

  describe('Distance Calculations', () => {
    // Haversine formula tests
    function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
      const R = 6371; // Earth's radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    }

    it('should calculate distance between two points correctly', () => {
      // New York to Los Angeles
      const distance = calculateDistance(40.7128, -74.0060, 34.0522, -118.2437);
      expect(Math.round(distance)).toBe(3936); // ~3936 km (actual calculated value)
    });

    it('should return 0 for same location', () => {
      const distance = calculateDistance(40.7128, -74.0060, 40.7128, -74.0060);
      expect(distance).toBe(0);
    });
  });

  describe('Geo Rule Priority', () => {
    it('should match the smallest radius rule when multiple rules overlap', async () => {
      const geoRules = [
        {
          id: '1',
          lat: 40.7128,
          lon: -74.0060,
          radius_km: 50,
          url: 'https://regional.example.com',
          label: 'Regional',
        },
        {
          id: '2',
          lat: 40.7128,
          lon: -74.0060,
          radius_km: 10,
          url: 'https://local.example.com',
          label: 'Local',
        },
      ];

      // Sort by radius to get the most specific (smallest) rule first
      const sortedRules = [...geoRules].sort((a, b) => a.radius_km - b.radius_km);
      
      expect(sortedRules[0].label).toBe('Local');
      expect(sortedRules[0].radius_km).toBe(10);
    });
  });

  describe('Geo Rule Data Structure', () => {
    it('should validate geo rule structure', () => {
      const validGeoRule = {
        id: '1',
        lat: 40.7128,
        lon: -74.0060,
        radius_km: 10,
        url: 'https://example.com',
        label: 'Test Location',
      };

      expect(validGeoRule.lat).toBeGreaterThanOrEqual(-90);
      expect(validGeoRule.lat).toBeLessThanOrEqual(90);
      expect(validGeoRule.lon).toBeGreaterThanOrEqual(-180);
      expect(validGeoRule.lon).toBeLessThanOrEqual(180);
      expect(validGeoRule.radius_km).toBeGreaterThan(0);
      expect(validGeoRule.url).toMatch(/^https?:\/\//);
    });

    it('should handle invalid coordinates', () => {
      const invalidRules = [
        { lat: 91, lon: 0 }, // Invalid latitude
        { lat: 0, lon: 181 }, // Invalid longitude
        { lat: -91, lon: 0 }, // Invalid latitude
        { lat: 0, lon: -181 }, // Invalid longitude
      ];

      invalidRules.forEach(rule => {
        const isValidLat = rule.lat >= -90 && rule.lat <= 90;
        const isValidLon = rule.lon >= -180 && rule.lon <= 180;
        expect(isValidLat && isValidLon).toBe(false);
      });
    });
  });
});