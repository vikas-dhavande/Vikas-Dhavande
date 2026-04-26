'use client';

import * as React from 'react';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import { 
  LogIn, 
  LogOut, 
  Cpu, 
  Cloud, 
  BookOpen, 
  Menu, 
  X, 
  User as UserIcon, 
  LayoutDashboard
} from 'lucide-react';
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
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '../ui/sheet';

import { UserAccountNav } from './UserAccountNav';
import { LoginModalHandler } from '../auth/LoginModalHandler';

export default function Header() {
  const { isAuthenticated, user, loading, logout } = useAuth();
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
          
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger render={
              <button 
                className="md:hidden p-2 -mr-2 text-foreground"
                aria-label="Toggle Menu"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            } />
            <SheetContent 
              side="top" 
              showCloseButton={false}
              className="top-16 h-[calc(100vh-64px)] w-full border-t border-border/50 bg-background/95 backdrop-blur-xl p-0 overflow-y-auto"
            >
              <nav className="container flex flex-col p-6 gap-8 pb-20">
                <div className="flex flex-col gap-3">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-4 opacity-70">Navigation</p>
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-4 p-4 rounded-2xl border border-transparent hover:border-border/50 hover:bg-muted/30 transition-all text-lg font-semibold active:scale-[0.98]"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary shadow-sm">
                        <link.icon className="h-5 w-5" />
                      </div>
                      {link.label}
                    </Link>
                  ))}
                </div>

                {isAuthenticated && user && (
                  <div className="flex flex-col gap-3">
                    <div className="h-px bg-border/50 my-2 mx-4" />
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-4 opacity-70">Account</p>
                    
                    <Link
                      href="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-4 p-4 rounded-2xl border border-transparent hover:border-border/50 hover:bg-muted/30 transition-all text-lg font-semibold active:scale-[0.98]"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 shadow-sm border border-blue-500/10">
                        <UserIcon className="h-5 w-5" />
                      </div>
                      My Profile
                    </Link>

                    <Link
                      href="/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-4 p-4 rounded-2xl border border-transparent hover:border-border/50 hover:bg-muted/30 transition-all text-lg font-semibold active:scale-[0.98]"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10 text-purple-600 shadow-sm border border-purple-500/10">
                        <LayoutDashboard className="h-5 w-5" />
                      </div>
                      Dashboard
                    </Link>

                    <div className="h-px bg-border/50 my-2 mx-4" />

                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        logout();
                      }}
                      className="flex items-center gap-4 p-4 rounded-2xl border border-transparent hover:border-red-500/20 hover:bg-red-500/5 transition-all text-lg font-bold text-red-500 w-full active:scale-[0.98]"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10 text-red-500 shadow-sm">
                        <LogOut className="h-5 w-5" />
                      </div>
                      Sign Out
                    </button>
                  </div>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>


      <LoginModal isOpen={isLoginModalOpen} onOpenChange={setIsLoginModalOpen} />
      <React.Suspense fallback={null}>
        <LoginModalHandler 
          onOpen={setIsLoginModalOpen} 
          isAuthenticated={isAuthenticated} 
          loading={loading} 
        />
      </React.Suspense>
    </header>
  );
}
