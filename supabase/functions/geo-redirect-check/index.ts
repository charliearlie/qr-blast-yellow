// supabase/functions/geo-redirect-check/index.ts
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { shortCode } = await req.json();
    
    if (!shortCode) {
      return new Response(
        JSON.stringify({ error: 'shortCode is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('🌍 Starting geo-redirect check for:', shortCode);

    // Get geolocation from request
    // Note: In production, this would use a real geo-IP service
    // For now, we'll get location from CF-IPCountry header or use default
    const cfCountry = req.headers.get('CF-IPCountry');
    const cfRegion = req.headers.get('CF-Region');
    const cfCity = req.headers.get('CF-City');
    
    // For demo purposes, use some default coordinates
    // In production, you'd integrate with a proper geo-IP service
    let latitude = 40.7128; // Default to NYC
    let longitude = -74.0060;
    
    // Try to get more accurate location from geo-IP service
    try {
      const clientIP = req.headers.get('CF-Connecting-IP') || 
                      req.headers.get('X-Forwarded-For') || 
                      req.headers.get('X-Real-IP');
      
      if (clientIP) {
        // In a real implementation, you'd call a geo-IP service here
        // For now, use some sample coordinates based on common locations
        if (cfCountry === 'US') {
          latitude = 40.7128;
          longitude = -74.0060;
        } else if (cfCountry === 'GB') {
          latitude = 51.5074;
          longitude = -0.1278;
        } else if (cfCountry === 'CA') {
          latitude = 45.4215;
          longitude = -75.6972;
        }
      }
    } catch (geoError) {
      console.warn('Geo-IP lookup failed:', geoError);
      // Continue with default coordinates
    }

    console.log('📍 Using coordinates:', { latitude, longitude });

    // Call the NEW master database function with the location data
    const { data: redirectUrl, error } = await supabase.rpc('get_final_redirect_url', {
      p_short_code: shortCode,
      p_latitude: latitude,
      p_longitude: longitude,
    });

    if (error) {
      console.error('Master redirect error:', error);
      // As a fallback, just return the original URL if the master function fails
      const { data: qrCode } = await supabase
        .from('qr_codes')
        .select('original_url')
        .eq('short_code', shortCode)
        .single();
      
      return new Response(
        JSON.stringify({ redirectUrl: qrCode?.original_url || null }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('✅ Geo-redirect result:', redirectUrl);

    return new Response(
      JSON.stringify({ redirectUrl }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Geo-redirect function error:', error);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});