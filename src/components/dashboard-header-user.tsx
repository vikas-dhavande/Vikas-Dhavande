'use client';

import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOutIcon, UserIcon, LayoutDashboardIcon } from 'lucide-react';
import Link from 'next/link';

export function DashboardHeaderUser() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const initials = user.name?.charAt(0)?.toUpperCase() ?? 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button className="flex items-center gap-2.5 rounded-full p-1 pr-3 hover:bg-muted transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring" />
        }
      >
        <Avatar className="size-8">
          <AvatarImage src={user.picture} alt={user.name} />
          <AvatarFallback className="text-xs font-bold">{initials}</AvatarFallback>
        </Avatar>
        <span className="hidden sm:block text-sm font-medium truncate max-w-[120px]">
          {user.name}
        </span>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end" sideOffset={8}>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-semibold">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          render={<Link href="/dashboard/profile" className="flex items-center gap-2 w-full cursor-pointer" />}
        >
          <UserIcon className="size-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem
          render={<Link href="/dashboard" className="flex items-center gap-2 w-full cursor-pointer" />}
        >
          <LayoutDashboardIcon className="size-4" />
          Dashboard
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => logout()}
          className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer gap-2"
        >
          <LogOutIcon className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
