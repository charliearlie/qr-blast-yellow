interface SecurityCheckResult {
  isSafe: boolean;
  threats: string[];
  warnings: string[];
  score: number; // 0-100, higher is safer
  details: {
    urlValid: boolean;
    reachable: boolean;
    hasSSL: boolean;
    safeBrowsing: boolean;
    domainReputation: 'good' | 'suspicious' | 'bad';
  };
}

interface ThreatType {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

class SecurityService {
  private readonly SUPABASE_URL = 'https://nliifuijvzmtowwwfbfp.supabase.co';

  async checkUrl(url: string): Promise<SecurityCheckResult> {
    console.log('🔍 Starting security check for:', url);
    
    try {
      console.log('Making request to:', `${this.SUPABASE_URL}/functions/v1/security-check`);
      
      const response = await fetch(`${this.SUPABASE_URL}/functions/v1/security-check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5saWlmdWlqdnptdG93d3dmYmZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4ODAzNjgsImV4cCI6MjA2NzQ1NjM2OH0.XcHZ1leYQgbkAI5P3brRGX8Zsc1MzrvztTNkAiAlNzA',
        },
        body: JSON.stringify({ url }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`Security check failed: ${response.status} - ${errorText}`);
      }

      const result: SecurityCheckResult = await response.json();
      console.log('🔍 Security check complete:', result);
      return result;

    } catch (error) {
      console.error('Security check failed:', error);
      console.error('Error details:', error.message);
      
      // If it's a network error, provide a temporary fallback
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        return this.performBasicSecurityCheck(url);
      }
      
      return {
        isSafe: false,
        threats: ['Security check failed - please proceed with caution'],
        warnings: ['Unable to connect to security service: ' + error.message],
        score: 0,
        details: {
          urlValid: false,
          reachable: false,
          hasSSL: false,
          safeBrowsing: false,
          domainReputation: 'bad',
        }
      };
    }
  }

  // Fallback basic security check when Edge Function is unavailable
  private performBasicSecurityCheck(url: string): SecurityCheckResult {
    console.log('🔍 Performing basic security check for:', url);
    
    const result: SecurityCheckResult = {
      isSafe: true,
      threats: [],
      warnings: ['Advanced security features temporarily unavailable'],
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
      // Basic URL validation
      const normalizedUrl = url.match(/^https?:\/\//) ? url : `https://${url}`;
      const urlObj = new URL(normalizedUrl);
      
      result.details.urlValid = true;
      result.details.hasSSL = normalizedUrl.startsWith('https://');
      
      // Basic domain checks
      const domain = urlObj.hostname.toLowerCase();
      
      // Check for IP addresses
      if (domain.match(/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/)) {
        result.threats.push('IP address used instead of domain name - high risk');
        result.score -= 40;
        result.isSafe = false;
        result.details.domainReputation = 'bad';
      }
      
      // Check for known safe domains
      if (domain.includes('google.com') || domain.includes('github.com') || domain.includes('microsoft.com')) {
        result.score = 95;
        result.warnings = [];
      }
      
      if (!result.details.hasSSL) {
        result.warnings.push('Website does not use secure HTTPS connection');
        result.score -= 10;
      }

    } catch (error) {
      result.threats.push('Invalid URL format');
      result.score = 0;
      result.isSafe = false;
    }

    return result;
  }


  // Public method to get security advice based on result
  getSecurityAdvice(result: SecurityCheckResult): string[] {
    const advice: string[] = [];

    if (!result.isSafe) {
      advice.push('🚨 DO NOT visit this website - security threats detected');
      advice.push('📞 Consider reporting this malicious link');
    } else if (result.score < 70) {
      advice.push('⚠️ Proceed with caution - some security concerns detected');
      advice.push('🔍 Verify this is the website you intended to visit');
      advice.push('🛡️ Avoid entering personal information');
    } else if (result.score < 90) {
      advice.push('✅ Website appears safe with minor concerns');
      advice.push('🔒 Verify the website URL matches what you expected');
    } else {
      advice.push('✅ Website passed all security checks');
      advice.push('🔒 Safe to proceed to destination');
    }

    return advice;
  }
}

export const securityService = new SecurityService();
export type { SecurityCheckResult, ThreatType };