import { useQuery } from '@tanstack/react-query';
import { qrService } from '@/services/qrService';
import { securityService, SecurityCheckResult } from '@/services/securityService';
import { supabase } from '@/integrations/supabase/client';

interface RedirectData {
  qrCode: any;
  finalUrl: string;
  securityResult: SecurityCheckResult;
}

export const useRedirect = (shortCode: string) => {
  return useQuery({
    queryKey: ['redirect', shortCode],
    queryFn: async (): Promise<RedirectData> => {
      console.log('=== REDIRECT QUERY START ===');
      console.log('Short code:', shortCode);

      // Step 1: Get QR code data
      console.log('📋 Fetching QR code data...');
      const qrCode = await qrService.getQRCodeByShortCode(shortCode);
      
      if (!qrCode) {
        console.log('❌ QR code not found');
        throw new Error('QR code not found or is invalid');
      }

      console.log('✅ QR code found:', qrCode.id, qrCode.original_url);

      // Step 2: Check if scan limit is reached (highest priority)
      if (qrCode.scan_limit && qrCode.scan_count && qrCode.scan_count >= qrCode.scan_limit) {
        console.log('🚫 Scan limit reached:', qrCode.scan_count, '/', qrCode.scan_limit);
        if (qrCode.expired_url) {
          console.log('🔄 Redirecting to expired URL:', qrCode.expired_url);
          const expiredUrl = qrCode.expired_url.match(/^https?:\/\//) 
            ? qrCode.expired_url 
            : `https://${qrCode.expired_url}`;
          
          return {
            qrCode,
            finalUrl: expiredUrl,
            securityResult: await securityService.checkUrl(expiredUrl)
          };
        } else {
          console.log('❌ No expired URL set, throwing error');
          throw new Error('This QR code has reached its scan limit');
        }
      }

      // Step 3: Determine redirect strategy
      const hasGeoRules = qrCode.qr_settings?.geoRules && qrCode.qr_settings.geoRules.length > 0;
      console.log('🌍 Has geo rules:', hasGeoRules);

      let finalUrl: string | null = null;

      if (hasGeoRules) {
        console.log('🌍 Attempting geo-redirect...');
        try {
          const { data, error } = await supabase.functions.invoke('geo-redirect-check', {
            body: { shortCode },
          });

          if (!error && data?.redirectUrl) {
            finalUrl = data.redirectUrl;
            console.log('✅ Geo-redirect successful:', finalUrl);
          } else {
            console.log('⚠️ Geo-redirect failed, error:', error, 'data:', data);
            throw new Error('Geo-redirect failed');
          }
        } catch (geoError) {
          console.log('🔄 Geo-redirect failed, using time-aware fallback');
          finalUrl = await qrService.getTimeAwareRedirectUrl(shortCode);
          console.log('⏰ Time-aware fallback result:', finalUrl);
        }
      } else {
        console.log('⏰ Using time-aware redirect (no geo rules)');
        try {
          finalUrl = await qrService.getTimeAwareRedirectUrl(shortCode);
          console.log('⏰ Time-aware result:', finalUrl);
          console.log('⏰ Type of result:', typeof finalUrl);
          if (finalUrl === null) {
            console.log('⚠️ Time-aware redirect returned null');
          }
        } catch (timeError) {
          console.error('❌ Time-aware redirect threw error:', timeError);
          finalUrl = null;
        }
      }

      // Step 4: Final fallback
      if (!finalUrl) {
        console.log('🔄 All methods failed, using original URL');
        finalUrl = qrCode.original_url;
      }

      if (!finalUrl) {
        throw new Error('No valid redirect URL found');
      }

      // Step 5: Ensure proper protocol
      const processedUrl = finalUrl.match(/^https?:\/\//) 
        ? finalUrl 
        : `https://${finalUrl}`;

      console.log('🔗 Final processed URL:', processedUrl);

      // Step 6: Security check
      console.log('🔍 Running security check...');
      const securityResult = await securityService.checkUrl(processedUrl);
      console.log('🔒 Security result:', securityResult);

      // Step 7: Track analytics (async, don't wait)
      if (qrCode.id) {
        console.log('📊 Tracking analytics...');
        const userAgent = navigator.userAgent;
        const deviceType = qrService.detectDeviceType(userAgent);
        const browser = qrService.detectBrowser(userAgent);
        
        qrService.trackQRCodeScan(qrCode.id, {
          user_agent: userAgent,
          referer: document.referrer,
          device_type: deviceType,
          browser: browser,
        }).catch(err => console.error('Analytics tracking failed:', err));
      }

      console.log('=== REDIRECT QUERY SUCCESS ===');
      return {
        qrCode,
        finalUrl: processedUrl,
        securityResult
      };
    },
    retry: false, // Don't retry failed redirects
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
    staleTime: 0, // Always fetch fresh redirect data
  });
};