import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useRedirect } from '@/hooks/useRedirect';
import { securityService } from '@/services/securityService';
import { Card } from '@/components/ui/card';
import { Shield, ExternalLink, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Redirect = () => {
  const { shortCode } = useParams<{ shortCode: string }>();
  const [countdown, setCountdown] = useState(4);
  const [isSecurityCheck, setIsSecurityCheck] = useState(true);
  const [securityPhase, setSecurityPhase] = useState<'checking' | 'complete' | 'blocked'>('checking');
  
  const { data: redirectData, isLoading, error } = useRedirect(shortCode || '');

  useEffect(() => {
    if (!redirectData || !redirectData.securityResult) return;

    // Show security results
    setTimeout(() => {
      if (redirectData.securityResult.isSafe) {
        setSecurityPhase('complete');
        setIsSecurityCheck(false);
        
        // Start countdown for safe URLs
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              console.log('Redirecting to:', redirectData.finalUrl);
              window.location.href = redirectData.finalUrl;
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        // Cleanup function
        return () => clearInterval(timer);
      } else {
        // Block malicious URLs
        setSecurityPhase('blocked');
        setIsSecurityCheck(false);
        console.log('🚨 Malicious URL blocked:', redirectData.finalUrl);
      }
    }, 2000); // Allow 2 seconds for security check to complete
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
              Checking for malware, phishing & threats...
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

    // securityPhase === 'complete'
    return (
      <>
        <div className="relative">
          <img src="/img/shield.png" alt="Security Shield" className="w-20 h-20 mx-auto" />
          <CheckCircle className="w-6 h-6 absolute -top-1 -right-1 text-green-500 bg-background rounded-full" />
        </div>
        <div>
          <h1 className="text-2xl font-bold uppercase mb-2 text-green-600">✓ Verified Safe</h1>
          <p className="text-muted-foreground">
            Security check passed • Redirecting safely...
          </p>
        </div>
      </>
    );
  };

  const renderSecurityDetails = () => {
    if (!redirectData?.securityResult) return null;

    const securityResult = redirectData.securityResult;
    const getBorderColor = () => {
      if (securityPhase === 'blocked') return 'border-red-500 bg-red-50';
      if (securityResult.score >= 90) return 'border-green-500 bg-green-50';
      if (securityResult.score >= 70) return 'border-yellow-500 bg-yellow-50';
      return 'border-orange-500 bg-orange-50';
    };

    return (
      <div className={`p-4 border-4 rounded ${getBorderColor()}`}>
        <div className="flex items-center gap-2 mb-2">
          <img src="/img/shield.png" alt="Security Shield" className="w-4 h-4" />
          <p className="text-sm font-bold uppercase">
            Security Check Complete
          </p>
        </div>
        <p className="text-sm break-all font-bold mb-2">{redirectData.finalUrl}</p>
        
        {securityResult.threats.length > 0 && (
          <div className="text-xs text-red-700 space-y-1">
            {securityResult.threats.map((threat, i) => (
              <p key={i}>🚨 {threat}</p>
            ))}
          </div>
        )}
        
        {securityResult.warnings.length > 0 && (
          <div className="text-xs text-orange-700 space-y-1">
            {securityResult.warnings.map((warning, i) => (
              <p key={i}>⚠️ {warning}</p>
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
          {isSecurityCheck ? renderSecurityCheck() : (
            <>
              <ExternalLink className="w-12 h-12 mx-auto text-primary" />
              <div>
                <h1 className="text-2xl font-bold uppercase mb-2">Redirecting...</h1>
                <p className="text-muted-foreground">
                  Taking you to your destination in <span className="font-bold text-primary">{countdown}</span> seconds
                </p>
              </div>
            </>
          )}

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

          {securityPhase === 'complete' && !isSecurityCheck && (
            <div className="space-y-3">
              <Button 
                onClick={handleManualRedirect}
                className="w-full"
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
            <p>Real-time threat detection & malware scanning</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Redirect;