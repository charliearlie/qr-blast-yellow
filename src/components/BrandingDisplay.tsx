import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface BrandingDisplayProps {
  style: 'minimal' | 'full' | 'custom';
  customText?: string;
  duration: number;
  onComplete: () => void;
}

export function BrandingDisplay({ style, customText, duration, onComplete }: BrandingDisplayProps) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [duration, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background flex items-center justify-center z-50"
    >
      <div className="text-center space-y-6 p-8 max-w-lg">
        {style === 'minimal' && (
          <>
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="text-4xl font-bold text-primary"
            >
              QR Blast
            </motion.div>
            <p className="text-sm text-muted-foreground">
              Powered by QR Blast
            </p>
          </>
        )}
        
        {style === 'full' && (
          <>
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="text-5xl font-bold text-primary"
            >
              QR Blast
            </motion.div>
            <p className="text-xl text-muted-foreground">
              Smart QR Codes for Modern Business
            </p>
            <div className="space-y-2">
              <div className="w-full bg-secondary rounded-full h-2">
                <motion.div
                  className="bg-primary h-2 rounded-full"
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: duration, ease: 'linear' }}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Redirecting in {timeLeft} seconds...
              </p>
            </div>
          </>
        )}
        
        {style === 'custom' && (
          <>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-2xl font-medium"
            >
              {customText || 'Welcome'}
            </motion.p>
            <p className="text-sm text-muted-foreground mt-8">
              Powered by QR Blast
            </p>
            {timeLeft > 0 && (
              <p className="text-xs text-muted-foreground">
                Continuing in {timeLeft}...
              </p>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}