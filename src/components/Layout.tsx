import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { User, LogOut, QrCode, BarChart3, Menu, X } from 'lucide-react';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/hooks/useAuth';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path === '/dashboard' && location.pathname === '/dashboard') return true;
    return false;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 bg-secondary rounded w-48 mb-4"></div>
          <div className="h-4 bg-secondary rounded w-32"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      {/* Header with Authentication */}
      <div className="max-w-4xl mx-auto mb-8">
        {/* Desktop Header */}
        <div className="hidden lg:flex lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            {user && (
              <div className="flex gap-2">
                <Button
                  variant={isActive('/') ? 'default' : 'outline'}
                  onClick={() => handleNavigation('/')}
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  Generator
                </Button>
                <Button
                  variant={isActive('/dashboard') ? 'default' : 'outline'}
                  onClick={() => handleNavigation('/dashboard')}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  My QR Codes
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Card className="brutal-card px-3 py-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span className="font-bold text-sm">{user.email}</span>
                  </div>
                </Card>
                <Button variant="outline" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <AuthModal onSuccess={() => handleNavigation('/dashboard')}>
                <Button>
                  <User className="w-4 h-4 mr-2" />
                  Sign In for Analytics
                </Button>
              </AuthModal>
            )}
          </div>
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {user && (
                <Button
                  variant="outline"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              )}
              <Link to="/" className="text-xl font-bold hover:text-primary transition-colors">
                QR BLAST
              </Link>
            </div>

            <div className="flex items-center gap-2">
              {user ? (
                <Button variant="outline" onClick={handleSignOut} size="sm">
                  <LogOut className="w-4 h-4" />
                </Button>
              ) : (
                <AuthModal onSuccess={() => handleNavigation('/dashboard')}>
                  <Button size="sm">
                    <User className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                </AuthModal>
              )}
            </div>
          </div>

          {/* Mobile Menu */}
          {user && mobileMenuOpen && (
            <Card className="brutal-card mt-4 p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    variant={isActive('/') ? 'default' : 'outline'}
                    onClick={() => handleNavigation('/')}
                    className="justify-start"
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    Generator
                  </Button>
                  <Button
                    variant={isActive('/dashboard') ? 'default' : 'outline'}
                    onClick={() => handleNavigation('/dashboard')}
                    className="justify-start"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    My QR Codes
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>

        {!user && (
          <Card className="brutal-card p-4 mt-6 bg-primary/10 border-primary/20">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-primary" />
              <div>
                <p className="font-bold">🎯 UNLOCK QR ANALYTICS!</p>
                <p className="text-sm text-muted-foreground">
                  Sign up to track scans, locations, devices & get detailed insights
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        {children}
      </div>
      
      {/* Footer Ad Space */}
      <div className="max-w-4xl mx-auto mt-16">
        <div className="ad-space p-8 min-h-[100px] flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p className="font-bold">BANNER AD SPACE</p>
            <p className="text-sm mt-1">728x90 or responsive banner</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;