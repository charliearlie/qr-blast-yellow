import { supabase } from '@/integrations/supabase/client';

export interface TimeRule {
  id: string;
  startTime: string;
  endTime: string;
  url: string;
  label?: string;
}

export interface GeoRule {
  id: string;
  lat: number;
  lon: number;
  radius_km: number;
  url: string;
  label?: string;
}

export interface QRCodeData {
  id?: string;
  title: string;
  original_url: string;
  short_code?: string;
  short_url?: string;
  qr_settings: {
    qrColor: string;
    bgColor: string;
    dotsType: string;
    cornersSquareType: string;
    cornersDotType: string;
    borderStyle: string;
    borderColor: string;
    borderWidth: number;
    logo?: string;
    timeRules?: TimeRule[];
    geoRules?: GeoRule[];
  };
  scan_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface QRAnalytics {
  id: string;
  qr_code_id: string;
  scanned_at: string;
  ip_address?: string;
  user_agent?: string;
  referer?: string;
  country?: string;
  city?: string;
  device_type?: string;
  browser?: string;
}

export interface AnalyticsSummary {
  total_scans: number;
  today_scans: number;
  this_week_scans: number;
  this_month_scans: number;
  top_countries: Array<{ country: string; count: number }>;
  top_devices: Array<{ device: string; count: number }>;
  daily_scans: Array<{ date: string; count: number }>;
}

class QRService {
  private baseUrl = window.location.origin;

  // Helper function to ensure URL has proper protocol
  private normalizeUrl(url: string): string {
    // Remove any leading/trailing whitespace
    url = url.trim();
    
    // If URL doesn't start with protocol, add https://
    if (!url.match(/^https?:\/\//)) {
      url = `https://${url}`;
    }
    
    return url;
  }

  async createQRCode(data: QRCodeData): Promise<QRCodeData> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated to create trackable QR codes');
    }

    // Normalize the URL to ensure it has proper protocol
    const normalizedUrl = this.normalizeUrl(data.original_url);

    // Generate short code
    const { data: shortCode, error: shortCodeError } = await supabase
      .rpc('generate_short_code');

    if (shortCodeError) {
      console.error('Short code generation error:', shortCodeError);
      throw new Error('Failed to generate short code');
    }

    const shortUrl = `${this.baseUrl}/r/${shortCode}`;
    
    const qrData = {
      user_id: user.id,
      title: data.title,
      original_url: normalizedUrl,
      short_code: shortCode,
      short_url: shortUrl,
      qr_settings: data.qr_settings,
    };

    const { data: qrCode, error } = await supabase
      .from('qr_codes')
      .insert([qrData])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw new Error(`Failed to create QR code: ${error.message}`);
    }

    return qrCode;
  }

  async updateQRCode(id: string, data: Partial<QRCodeData>): Promise<QRCodeData> {
    const { data: qrCode, error } = await supabase
      .from('qr_codes')
      .update({
        title: data.title,
        original_url: data.original_url,
        qr_settings: data.qr_settings,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error('Failed to update QR code');
    }

    return qrCode;
  }

  async deleteQRCode(id: string): Promise<void> {
    const { error } = await supabase
      .from('qr_codes')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error('Failed to delete QR code');
    }
  }

  async getUserQRCodes(): Promise<QRCodeData[]> {
    const { data: qrCodes, error } = await supabase
      .from('qr_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Failed to fetch QR codes');
    }

    return qrCodes || [];
  }

  async getQRCodeByShortCode(shortCode: string): Promise<QRCodeData | null> {
    console.log('Looking up short code:', shortCode);
    
    const { data: qrCode, error } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('short_code', shortCode)
      .single();

    if (error) {
      console.error('Short code lookup error:', error);
      return null;
    }

    console.log('Found QR code:', qrCode);
    return qrCode;
  }

  async getTimeAwareRedirectUrl(shortCode: string): Promise<string | null> {
    console.log('=== TIME-AWARE REDIRECT ===');
    console.log('Getting time-aware redirect URL for short code:', shortCode);
    console.log('Current time:', new Date().toISOString());
    console.log('Current UTC time:', new Date().toUTCString());
    
    // First, let's verify the QR code exists
    const { data: qrCheck, error: qrError } = await supabase
      .from('qr_codes')
      .select('short_code, original_url, qr_settings')
      .eq('short_code', shortCode)
      .single();
    
    console.log('QR code check:', qrCheck);
    console.log('QR code check error:', qrError);
    
    const { data: redirectUrl, error } = await supabase
      .rpc('get_redirect_url_for_short_code', { p_short_code: shortCode });

    if (error) {
      console.error('Time-aware redirect error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return null;
    }

    console.log('Time-aware redirect URL received from database:', redirectUrl);
    console.log('Type of redirectUrl:', typeof redirectUrl);
    console.log('Is redirectUrl null?', redirectUrl === null);
    console.log('Is redirectUrl undefined?', redirectUrl === undefined);
    console.log('=== END TIME-AWARE REDIRECT ===');
    return redirectUrl;
  }

  async trackQRCodeScan(qrCodeId: string, analyticsData: Partial<QRAnalytics>): Promise<void> {
    // Record the scan
    const { error: analyticsError } = await supabase
      .from('qr_analytics')
      .insert([{
        qr_code_id: qrCodeId,
        ip_address: analyticsData.ip_address,
        user_agent: analyticsData.user_agent,
        referer: analyticsData.referer,
        country: analyticsData.country,
        city: analyticsData.city,
        device_type: analyticsData.device_type,
        browser: analyticsData.browser,
      }]);

    if (analyticsError) {
      console.error('Failed to record analytics:', analyticsError);
    }

    // Increment scan count
    const { error: countError } = await supabase
      .rpc('increment_scan_count', { qr_code_uuid: qrCodeId });

    if (countError) {
      console.error('Failed to increment scan count:', countError);
    }
  }

  async getQRCodeAnalytics(qrCodeId: string): Promise<AnalyticsSummary | null> {
    const { data, error } = await supabase
      .rpc('get_qr_analytics_summary', { qr_code_uuid: qrCodeId });

    if (error) {
      throw new Error('Failed to fetch analytics');
    }

    return data?.[0] || null;
  }

  async getQRCodeScans(qrCodeId: string, limit: number = 100): Promise<QRAnalytics[]> {
    const { data: scans, error } = await supabase
      .from('qr_analytics')
      .select('*')
      .eq('qr_code_id', qrCodeId)
      .order('scanned_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error('Failed to fetch scans');
    }

    return scans || [];
  }

  // Helper function to detect device type from user agent
  detectDeviceType(userAgent: string): string {
    const ua = userAgent.toLowerCase();
    
    // Check for tablet first to avoid android tablets being detected as mobile
    if (ua.includes('tablet') || ua.includes('ipad')) {
      return 'Tablet';
    } else if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return 'Mobile';
    } else {
      return 'Desktop';
    }
  }

  // Helper function to detect browser from user agent
  detectBrowser(userAgent: string): string {
    const ua = userAgent.toLowerCase();
    
    // Check for Edge first since it contains "chrome" in its user agent
    if (ua.includes('edge') || ua.includes('edg/')) return 'Edge';
    if (ua.includes('opera') || ua.includes('opr/')) return 'Opera';
    if (ua.includes('chrome')) return 'Chrome';
    if (ua.includes('firefox')) return 'Firefox';
    if (ua.includes('safari')) return 'Safari';
    
    return 'Other';
  }
}

export const qrService = new QRService();