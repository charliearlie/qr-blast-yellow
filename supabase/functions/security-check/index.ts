import "jsr:@supabase/functions-js/edge-runtime.d.ts";

interface SecurityCheckResult {
  isSafe: boolean;
  threats: string[];
  warnings: string[];
  score: number;
  details: {
    urlValid: boolean;
    reachable: boolean;
    hasSSL: boolean;
    safeBrowsing: boolean;
    domainReputation: 'good' | 'suspicious' | 'bad';
  };
}

Deno.serve(async (req: Request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { url } = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('🔍 Starting security check for:', url);
    
    const result = await performSecurityCheck(url);
    
    return new Response(
      JSON.stringify(result),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Security check error:', error);
    
    const errorResult: SecurityCheckResult = {
      isSafe: false,
      threats: ['Security check failed - please proceed with caution'],
      warnings: ['Unable to process security check: ' + error.message],
      score: 0,
      details: {
        urlValid: false,
        reachable: false,
        hasSSL: false,
        safeBrowsing: false,
        domainReputation: 'bad',
      }
    };
    
    return new Response(
      JSON.stringify(errorResult),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function performSecurityCheck(url: string): Promise<SecurityCheckResult> {
  const result: SecurityCheckResult = {
    isSafe: true,
    threats: [],
    warnings: [],
    score: 85,
    details: {
      urlValid: false,
      reachable: false,
      hasSSL: false,
      safeBrowsing: true,
      domainReputation: 'good',
    }
  };

  try {
    const normalizedUrl = url.match(/^https?:\/\//) ? url : `https://${url}`;
    const urlObj = new URL(normalizedUrl);
    
    result.details.urlValid = true;
    result.details.hasSSL = normalizedUrl.startsWith('https://');
    
    const domain = urlObj.hostname.toLowerCase();
    
    if (domain.match(/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/)) {
      result.threats.push('IP address used instead of domain name - high risk');
      result.score -= 40;
      result.isSafe = false;
      result.details.domainReputation = 'bad';
    }
    
    if (domain.includes('bit.ly') || domain.includes('tinyurl') || domain.includes('t.co')) {
      result.warnings.push('Shortened URL detected - verify destination');
      result.score -= 5;
    }
    
    const safeDomains = [
      'google.com', 'github.com', 'microsoft.com', 'apple.com',
      'amazon.com', 'facebook.com', 'twitter.com', 'linkedin.com',
      'youtube.com', 'instagram.com', 'wikipedia.org', 'stackoverflow.com'
    ];
    
    if (safeDomains.some(safe => domain.includes(safe))) {
      result.score = 95;
      result.warnings = [];
    }
    
    if (domain.includes('phishing') || domain.includes('malware') || domain.includes('virus')) {
      result.threats.push('Suspicious domain name detected');
      result.score = 0;
      result.isSafe = false;
      result.details.domainReputation = 'bad';
    }
    
    if (!result.details.hasSSL) {
      result.warnings.push('Website does not use secure HTTPS connection');
      result.score -= 10;
    }
    
    try {
      const response = await fetch(normalizedUrl, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      });
      
      result.details.reachable = response.ok;
      
      if (!response.ok) {
        result.warnings.push(`Website returned ${response.status} status`);
        result.score -= 5;
      }
    } catch (fetchError) {
      result.warnings.push('Unable to verify website availability');
      result.score -= 5;
    }
    
    result.isSafe = result.score >= 70 && result.threats.length === 0;
    
  } catch (error) {
    result.threats.push('Invalid URL format');
    result.score = 0;
    result.isSafe = false;
  }

  return result;
}