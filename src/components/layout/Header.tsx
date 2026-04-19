'use client';

import * as React from 'react';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import { LogIn, LogOut, Cpu, Cloud, BookOpen, Menu, X } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { ToggleTheme } from '../ui/toggle-theme';
import { LoginModal } from '../auth/LoginModal';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '../ui/navigation-menu';

import { UserAccountNav } from './UserAccountNav';
import { ProfileModals } from '../auth/ProfileModals';

import { useSearchParams } from 'next/navigation';

function LoginModalHandler({ 
  onOpen: onOpenChange,
  isAuthenticated,
  loading
}: { 
  onOpen: (open: boolean) => void;
  isAuthenticated: boolean;
  loading: boolean;
}) {
  const searchParams = useSearchParams();

  React.useEffect(() => {
    if (searchParams.get('login') === 'true' && !isAuthenticated && !loading) {
      onOpenChange(true);
    }
  }, [searchParams, isAuthenticated, loading, onOpenChange]);

  return null;
}

export default function Header() {
  const { isAuthenticated, user, loading } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navLinks = [
    { href: '/', label: 'Home', icon: Cpu },
    { href: '/resources', label: 'Resources', icon: Cloud },
    { href: '/blog', label: 'Blog', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="flex h-16 w-full items-center justify-between px-4 sm:px-8 lg:px-10">
        <div className="flex items-center gap-2">
          <button 
            className="md:hidden p-2 -ml-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <Link href="/" className="flex items-center gap-2">
            <Cpu className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold tracking-tight text-foreground">Vikas</span>
          </Link>
        </div>

        <nav className="hidden md:flex">
          <NavigationMenu>
            <NavigationMenuList>
              {navLinks.map((link) => (
                <NavigationMenuItem key={link.href}>
                  <NavigationMenuLink render={<Link href={link.href} />} className={navigationMenuTriggerStyle()}>
                    <span className="inline-flex items-center gap-2">
                      <link.icon className="h-4 w-4" />
                      {link.label}
                    </span>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </nav>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="mr-1 sm:mr-2">
            <ToggleTheme />
          </div>
          {!loading && (
            isAuthenticated && user ? (
              <UserAccountNav user={user} />
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="flex items-center gap-2 rounded-full bg-primary px-4 sm:px-5 py-2 text-xs sm:text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-40 bg-background/95 backdrop-blur-md transition-all animate-in fade-in slide-in-from-top-4 duration-200">
          <nav className="container flex flex-col p-6 gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-4 p-4 rounded-xl border border-transparent hover:border-border hover:bg-muted/50 transition-all text-lg font-medium"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <link.icon className="h-5 w-5" />
                </div>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      <LoginModal isOpen={isLoginModalOpen} onOpenChange={setIsLoginModalOpen} />
      <React.Suspense fallback={null}>
        <LoginModalHandler 
          onOpen={setIsLoginModalOpen} 
          isAuthenticated={isAuthenticated} 
          loading={loading} 
        />
      </React.Suspense>
      <ProfileModals />
    </header>
  );
}
