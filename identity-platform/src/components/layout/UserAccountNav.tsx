'use client';

import * as React from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { User } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  UserIcon, 
  LockIcon, 
  MailIcon, 
  ImageIcon, 
  LogOutIcon, 
  LayoutDashboard,
  Settings,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserAccountNavProps {
  user: User;
}

export function UserAccountNav({ user }: UserAccountNavProps) {
  const { logout } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 p-1.5 rounded-full hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all outline-none group border border-transparent hover:border-border">
          <div className="flex items-center gap-3 pr-2">
            <Avatar className="size-8 ring-2 ring-border group-hover:ring-primary/20 transition-all shadow-sm">
              <AvatarImage src={user.picture} alt={user.name} />
              <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                {user.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <span className="hidden lg:inline-block text-sm font-medium text-foreground truncate max-w-[120px]">
              {user.name}
            </span>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[280px] p-1.5" align="end" sideOffset={8}>
        <DropdownMenuLabel className="font-normal px-2 py-3">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-bold leading-none text-foreground">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground truncate pt-0.5">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="py-1">
          <DropdownMenuItem asChild>
            <Link href="/dashboard/profile" className="flex items-center gap-3 cursor-pointer w-full text-foreground hover:text-primary transition-colors">
              <div className="flex size-7 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 shadow-sm border border-blue-500/10">
                <UserIcon className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-sm">Account Settings</span>
                <span className="text-[10px] text-muted-foreground leading-tight">Manage profile & security</span>
              </div>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard" className="flex items-center gap-3 cursor-pointer w-full text-foreground hover:text-purple-600 transition-colors">
              <div className="flex size-7 items-center justify-center rounded-md bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 shadow-sm border border-purple-500/10">
                <LayoutDashboard className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-sm">Dashboard</span>
                <span className="text-[10px] text-muted-foreground leading-tight">View activity & projects</span>
              </div>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => logout()} 
          className="flex items-center gap-3 mt-1 cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive group/logout font-medium"
        >
          <div className="flex size-7 items-center justify-center rounded-md bg-destructive/5 group-hover/logout:bg-destructive/10 transition-colors">
            <LogOutIcon className="size-4" />
          </div>
          <span className="text-sm">Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
