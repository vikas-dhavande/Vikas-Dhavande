'use client';

import * as React from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { User } from '@/types';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { UserIcon, LockIcon, MailIcon, ImageIcon, LogOutIcon, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserAccountNavProps {
  user: User;
}

export function UserAccountNav({ user }: UserAccountNavProps) {
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);

  const menuItems = [
    {
      label: 'My Profile',
      href: '/dashboard/profile',
      icon: UserIcon,
      description: 'View and edit your personal details',
    },
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      description: 'Manage your projects and resources',
    },
  ];

  const updateActions = [
    {
      label: 'Change Password',
      icon: LockIcon,
      action: 'password',
    },
    {
      label: 'Update Email',
      icon: MailIcon,
      action: 'email',
    },
    {
      label: 'Update Profile Image',
      icon: ImageIcon,
      action: 'image',
    },
  ];

  const handleAction = (action: string) => {
    setIsOpen(false);
    window.dispatchEvent(new CustomEvent('open-profile-modal', { detail: action }));
  };

  return (
    <NavigationMenu align="end" open={isOpen} onOpenChange={setIsOpen}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="flex items-center gap-2 p-1 hover:bg-transparent data-[state=open]:bg-transparent">
            <div className="flex items-center gap-3 pr-2">
              <Avatar className="size-8 ring-2 ring-border hover:ring-primary/20 transition-all">
                <AvatarImage src={user.picture} alt={user.name} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                  {user.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="hidden lg:inline-block text-sm font-medium text-foreground truncate max-w-[120px]">
                {user.name}
              </span>
            </div>
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="w-[280px] p-2 flex flex-col gap-1">
              <div className="px-3 py-2 border-b border-border mb-1">
                <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>

              {menuItems.map((item) => (
                <NavigationMenuLink
                  key={item.label}
                  render={
                    <Link href={item.href} onClick={() => setIsOpen(false)} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted focus:bg-muted">
                      <item.icon className="size-4 text-muted-foreground" />
                      <div className="flex flex-col">
                        <span>{item.label}</span>
                      </div>
                    </Link>
                  }
                />
              ))}

              <div className="h-px bg-border my-1" />

              {updateActions.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleAction(item.action)}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-left transition-colors hover:bg-muted focus:bg-muted outline-none"
                >
                  <item.icon className="size-4 text-muted-foreground" />
                  <span>{item.label}</span>
                </button>
              ))}

              <div className="h-px bg-border my-1" />

              <button
                onClick={logout}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-red-500 transition-colors hover:bg-red-500/10 focus:bg-red-500/10 outline-none"
              >
                <LogOutIcon className="size-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
