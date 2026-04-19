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

export default function Header() {
  const { isAuthenticated, user, logout, loading } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="flex h-16 w-full items-center justify-between px-4 sm:px-8 lg:px-10">
        <Link href="/" className="flex items-center gap-2">
          <Cpu className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold tracking-tight text-foreground">V. Dhavande</span>
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
            isAuthenticated ? (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-3">
                  <Avatar className="h-8 w-8 hover:ring-2 hover:ring-primary/20 transition-all cursor-pointer">
                    <AvatarImage src={user?.picture} alt={user?.name || 'User'} referrerPolicy="no-referrer" />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-foreground">{user?.name}</span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
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
    </header>
  );
}
