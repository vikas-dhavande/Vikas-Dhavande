'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Dock } from '@/components/lightswind/dock';
import {
  Cpu,
  Cloud,
  BookOpen,
  LayoutDashboard,
  User,
  LogIn,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthModal } from '@/contexts/AuthModalContext';

export function AppDockNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, loading } = useAuth();
  const { openAuthModal } = useAuthModal();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || loading) {
    return null;
  }

  // Hide the dock on specific full-screen or auth routes
  const isAuthPage = pathname === '/sign-in' || pathname === '/sign-up';
  if (isAuthPage) {
    return null;
  }

  const isAdmin = user?.role === 'admin' || user?.role === 'super_user';
  const isUnverified = isAuthenticated && user && !user.emailVerification;

  // Build items for the Desktop Lightswind Dock
  const dockItems = [
    {
      icon: (
        <Cpu
          className={cn(
            'w-5 h-5 transition-colors',
            pathname === '/' ? 'text-primary' : 'text-foreground/80'
          )}
        />
      ),
      label: 'Home',
      onClick: () => router.push('/'),
    },
    {
      icon: (
        <Cloud
          className={cn(
            'w-5 h-5 transition-colors',
            pathname.startsWith('/resources') ? 'text-primary' : 'text-foreground/80'
          )}
        />
      ),
      label: 'Resources',
      onClick: () => router.push('/resources'),
    },
    {
      icon: (
        <BookOpen
          className={cn(
            'w-5 h-5 transition-colors',
            pathname.startsWith('/blog') ? 'text-primary' : 'text-foreground/80'
          )}
        />
      ),
      label: 'Blog',
      onClick: () => router.push('/blog'),
    },
    ...(isAdmin
      ? [
          {
            icon: (
              <LayoutDashboard
                className={cn(
                  'w-5 h-5 transition-colors',
                  pathname.startsWith('/dashboard') ? 'text-purple-500' : 'text-foreground/80'
                )}
              />
            ),
            label: 'Dashboard',
            onClick: () => router.push('/dashboard'),
            badgeCount: 1,
          },
        ]
      : []),
    {
      icon: isAuthenticated ? (
        <User
          className={cn(
            'w-5 h-5 transition-colors',
            pathname === '/profile' ? 'text-blue-500' : 'text-foreground/80'
          )}
        />
      ) : (
        <LogIn className="w-5 h-5 text-foreground/80" />
      ),
      label: isAuthenticated
        ? user?.name
          ? user.name.split(' ')[0]
          : 'Profile'
        : 'Sign In',
      onClick: () => {
        if (isAuthenticated) {
          router.push('/profile');
        } else {
          openAuthModal('sign-in');
        }
      },
      badgeCount: isUnverified ? 1 : undefined,
    },
  ];

  // Mobile Bottom Tab Bar items definition
  const mobileNavItems = [
    {
      label: 'Home',
      href: '/',
      icon: Cpu,
      active: pathname === '/',
    },
    {
      label: 'Resources',
      href: '/resources',
      icon: Cloud,
      active: pathname.startsWith('/resources'),
    },
    {
      label: 'Blog',
      href: '/blog',
      icon: BookOpen,
      active: pathname.startsWith('/blog'),
    },
    ...(isAdmin
      ? [
          {
            label: 'Admin',
            href: '/dashboard',
            icon: LayoutDashboard,
            active: pathname.startsWith('/dashboard'),
            badge: true,
          },
        ]
      : []),
    {
      label: isAuthenticated ? 'Profile' : 'Sign In',
      href: isAuthenticated ? '/profile' : '#sign-in',
      icon: isAuthenticated ? User : LogIn,
      active: isAuthenticated ? pathname === '/profile' : false,
      badge: isUnverified,
      onClick: () => {
        if (isAuthenticated) {
          router.push('/profile');
        } else {
          openAuthModal('sign-in');
        }
      },
    },
  ];

  return (
    <>
      {/* ======================================================== */}
      {/* DESKTOP: Lightswind 3D Floating Dock (Screen Width >= md) */}
      {/* ======================================================== */}
      <div
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 hidden md:block select-none"
        style={{
          perspective: '1000px',
        }}
      >
        <div className="relative group">
          {/* Subtle 3D ambient shadow & under-glow matching Hairline tokens */}
          <div className="absolute -inset-1 rounded-[28px] bg-gradient-to-r from-primary/10 via-purple-500/10 to-blue-500/10 blur-xl opacity-75 group-hover:opacity-100 transition-opacity pointer-events-none" />

          <Dock
            items={dockItems}
            magnification={68}
            baseItemSize={44}
            borderRadius="rounded-xl"
            itemBackground="bg-zinc-100/90 dark:bg-zinc-800/90 hover:bg-white dark:hover:bg-zinc-700 transition-colors shadow-sm"
            itemBorderColor="border-zinc-300/80 dark:border-zinc-700/80"
            gap="gap-3"
            badgeColor="bg-amber-500"
            className="shadow-2xl shadow-primary/5 hover:shadow-primary/10 border border-border/60"
            blurBackground={true}
            multiBorder={true}
          />
        </div>
      </div>

      {/* ======================================================== */}
      {/* MOBILE: Native Edge-to-Edge App Tab Bar (Screen Width < md) */}
      {/* ======================================================== */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 block md:hidden bg-background/95 backdrop-blur-xl border-t border-border/80 px-2 py-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-2xl"
      >
        <div className="flex items-center justify-around max-w-md mx-auto">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => (item.onClick ? item.onClick() : router.push(item.href))}
                className={cn(
                  'relative flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-200 active:scale-95 touch-manipulation',
                  item.active
                    ? 'text-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <div className="relative">
                  <Icon
                    className={cn(
                      'w-5 h-5 transition-transform duration-200',
                      item.active && 'scale-110'
                    )}
                  />
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                    </span>
                  )}
                </div>

                <span
                  className={cn(
                    'text-[10px] mt-1 tracking-tight transition-colors',
                    item.active ? 'text-primary font-semibold' : 'text-muted-foreground'
                  )}
                >
                  {item.label}
                </span>

                {item.active && (
                  <span className="absolute bottom-0.5 h-1 w-4 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}

export default AppDockNav;
