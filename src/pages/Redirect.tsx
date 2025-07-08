import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useRedirect } from '@/hooks/useRedirect';
import { securityService } from '@/services/securityService';
import { Card } from '@/components/ui/card';
import { Shield, ExternalLink, AlertTriangle, CheckCircle, XCircle, Clock, Globe, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Redirect = () => {
  const { shortCode } = useParams<{ shortCode: string }>();
  const [isSecurityCheck, setIsSecurityCheck] = useState(true);
  const [securityPhase, setSecurityPhase] = useState<'checking' | 'complete' | 'blocked'>('checking');
  const [showTransition, setShowTransition] = useState(false);
  
  const { data: redirectData, isLoading, error } = useRedirect(shortCode || '');

  useEffect(() => {
    if (!redirectData || !redirectData.securityResult) return;

    // Show security results with transition
    setTimeout(() => {
      if (redirectData.securityResult.isSafe) {
        setSecurityPhase('complete');
        setShowTransition(true);
        
        // After transition, redirect immediately
        setTimeout(() => {
          setIsSecurityCheck(false);
          console.log('Redirecting to:', redirectData.finalUrl);
          window.location.href = redirectData.finalUrl;
        }, 800); // Short delay for visual transition
      } else {
        // Block malicious URLs
        setSecurityPhase('blocked');
        setIsSecurityCheck(false);
        console.log('🚨 Malicious URL blocked:', redirectData.finalUrl);
      }
    }, 1500); // Reduced from 2000ms to 1500ms
  }, [redirectData]);

  const handleManualRedirect = () => {
    if (redirectData?.finalUrl) {
      window.location.href = redirectData.finalUrl;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="brutal-card p-8 max-w-md w-full mx-4">
          <div className="text-center space-y-4">
            <img src="/img/shield.png" alt="Security Shield" className="w-20 h-20 mx-auto animate-pulse" />
            <h1 className="text-2xl font-bold uppercase">Security Check</h1>
            <p className="text-muted-foreground">Verifying QR code safety...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="brutal-card p-8 max-w-md w-full mx-4">
          <div className="text-center space-y-4">
            <AlertTriangle className="w-12 h-12 mx-auto text-destructive" />
            <h1 className="text-2xl font-bold uppercase text-destructive">QR Code Error</h1>
            <p className="text-muted-foreground">{error.message}</p>
            <Button 
              onClick={() => window.location.href = '/'}
              className="w-full"
            >
              Go to QR Generator
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const renderSecurityCheck = () => {
    if (securityPhase === 'checking') {
      return (
        <>
          <div className="relative">
            <img src="/img/shield.png" alt="Security Shield" className="w-20 h-20 mx-auto animate-pulse" />
            <Clock className="w-6 h-6 absolute -top-1 -right-1 text-blue-500 bg-background rounded-full animate-spin" />
          </div>
          <div>
            <h1 className="text-2xl font-bold uppercase mb-2 text-blue-600">Security Scan</h1>
            <p className="text-muted-foreground">
              Verifying destination safety...
            </p>
          </div>
        </>
      );
    }

    if (securityPhase === 'blocked') {
      return (
        <>
          <div className="relative">
            <img src="/img/shield.png" alt="Security Shield" className="w-20 h-20 mx-auto" />
            <XCircle className="w-6 h-6 absolute -top-1 -right-1 text-red-500 bg-background rounded-full" />
          </div>
          <div>
            <h1 className="text-2xl font-bold uppercase mb-2 text-red-600">⚠️ Threat Detected</h1>
            <p className="text-red-600 font-bold">
              This website has been blocked for your safety
            </p>
          </div>
        </>
      );
    }

    // securityPhase === 'complete' with transition
    return (
      <>
        <div className="relative">
          <img 
            src={showTransition ? "/img/smile.png" : "/img/shield.png"} 
            alt={showTransition ? "Safe Destination" : "Security Shield"} 
            className={`w-20 h-20 mx-auto transition-all duration-700 ${showTransition ? 'scale-110' : ''}`} 
          />
          <CheckCircle className="w-6 h-6 absolute -top-1 -right-1 text-green-500 bg-background rounded-full" />
        </div>
        <div>
          <h1 className="text-2xl font-bold uppercase mb-2 text-green-600">✓ Destination Verified</h1>
          <p className="text-green-600 font-medium">
            Taking you there now...
          </p>
        </div>
      </>
    );
  };

  const extractDomainInfo = (url: string) => {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      const domain = urlObj.hostname;
      const path = urlObj.pathname;
      return {
        domain,
        path: path === '/' ? '' : path,
        protocol: urlObj.protocol,
        isSecure: urlObj.protocol === 'https:'
      };
    } catch {
      return { domain: url, path: '', protocol: 'unknown:', isSecure: false };
    }
  };

  const renderSecurityDetails = () => {
    if (!redirectData?.securityResult) return null;

    const securityResult = redirectData.securityResult;
    const domainInfo = extractDomainInfo(redirectData.finalUrl);
    
    const getScoreColor = () => {
      if (securityPhase === 'blocked') return 'text-red-600';
      if (securityResult.score >= 50) return 'text-green-600';
      return 'text-orange-600';
    };

    const getBorderColor = () => {
      if (securityPhase === 'blocked') return 'border-red-500 bg-red-50';
      if (securityResult.score >= 50) return 'border-green-500 bg-green-50';
      return 'border-orange-500 bg-orange-50';
    };

    const getScoreText = () => {
      if (securityPhase === 'blocked') return 'Blocked';
      if (securityResult.score >= 80) return 'Excellent';
      if (securityResult.score >= 60) return 'Good';
      if (securityResult.score >= 50) return 'Safe';
      return 'Caution';
    };

    return (
      <div className={`p-4 border-2 rounded-lg ${getBorderColor()}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-bold">Destination</span>
          </div>
          <div className="flex items-center gap-2">
            {domainInfo.isSecure && <Lock className="w-3 h-3 text-green-500" />}
            <span className={`text-sm font-bold ${getScoreColor()}`}>
              {getScoreText()}
            </span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="text-sm">
            <p className="font-bold text-gray-800">{domainInfo.domain}</p>
            {domainInfo.path && <p className="text-gray-600 text-xs">{domainInfo.path}</p>}
          </div>
          
          {securityResult.score >= 50 && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-xs font-medium">Safe to visit</span>
            </div>
          )}
        </div>
        
        {securityResult.threats.length > 0 && (
          <div className="text-xs text-red-700 space-y-1 mt-2">
            {securityResult.threats.map((threat, i) => (
              <p key={i}>🚨 {threat}</p>
            ))}
          </div>
        )}
        
        {securityResult.warnings.length > 0 && securityResult.score >= 50 && (
          <div className="text-xs text-orange-700 space-y-1 mt-2">
            {securityResult.warnings.map((warning, i) => (
              <p key={i}>ℹ️ {warning}</p>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="brutal-card p-8 max-w-md w-full mx-4">
        <div className="text-center space-y-6">
          {renderSecurityCheck()}

          {renderSecurityDetails()}

          {securityPhase === 'blocked' && redirectData?.securityResult && (
            <div className="space-y-3">
              <div className="text-left space-y-2">
                <h3 className="font-bold text-red-600">Security Advice:</h3>
                {securityService.getSecurityAdvice(redirectData.securityResult).map((advice, i) => (
                  <p key={i} className="text-sm text-red-700">{advice}</p>
                ))}
              </div>
              <Button 
                onClick={() => window.location.href = '/'}
                className="w-full"
                variant="destructive"
              >
                Return to Safety
              </Button>
            </div>
          )}

          {securityPhase === 'complete' && redirectData?.securityResult && (
            <div className="space-y-3">
              <Button 
                onClick={handleManualRedirect}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Continue Now
              </Button>
              
              <Button 
                onClick={() => window.location.href = '/'}
                variant="outline"
                className="w-full"
              >
                Back to Generator
              </Button>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            <p className="flex items-center justify-center gap-2">
              <img src="/img/shield.png" alt="Security Shield" className="w-3 h-3" />
              Protected by QR Blast Security
            </p>
            <p>Real-time destination verification</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Redirect;