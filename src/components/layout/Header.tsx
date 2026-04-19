'use client';

import * as React from 'react';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import { LogIn, LogOut, Cpu, Cloud, BookOpen } from 'lucide-react';
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

export default function Header() {
  const { isAuthenticated, user, loading } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="flex h-16 w-full items-center justify-between px-4 sm:px-8 lg:px-10">
        <Link href="/" className="flex items-center gap-2">
          <Cpu className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold tracking-tight text-foreground">Vikas</span>
        </Link>

        <nav className="hidden md:flex">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink render={<Link href="/" />} className={navigationMenuTriggerStyle()}>
                  Home
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink render={<Link href="/resources" />} className={navigationMenuTriggerStyle()}>
                  <span className="inline-flex items-center gap-2">
                    <Cloud className="h-4 w-4" />
                    Resources
                  </span>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink render={<Link href="/blog" />} className={navigationMenuTriggerStyle()}>
                  <span className="inline-flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Blog
                  </span>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </nav>

        <div className="flex items-center gap-4">
          <div className="mr-2">
            <ToggleTheme />
          </div>
          {!loading && (
            isAuthenticated && user ? (
              <UserAccountNav user={user} />
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </button>
            )
          )}
        </div>
      </div>
      <LoginModal isOpen={isLoginModalOpen} onOpenChange={setIsLoginModalOpen} />
      <ProfileModals />
    </header>
  );
}
