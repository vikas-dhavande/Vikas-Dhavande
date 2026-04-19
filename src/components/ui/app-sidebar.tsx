import * as React from "react";
import { 
  BookOpen, 
  Hash, 
  Calendar, 
  User as UserIcon,
  Search,
  ChevronRight
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./sidebar";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // Demo categories - in a real app, these could be fetched from Supabase
  const categories = [
    { name: "Tutorials", icon: BookOpen, count: 12 },
    { name: "Productivity", icon: Hash, count: 8 },
    { name: "Development", icon: Calendar, count: 15 },
    { name: "Design", icon: UserIcon, count: 6 },
  ];

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/blog">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <BookOpen className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Dev Blog</span>
                  <span className="truncate text-xs">Insights & Tutorials</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        
        <div className="px-2 mt-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search posts..."
              className="w-full rounded-md bg-transparent border border-sidebar-border px-9 py-2 text-sm outline-none focus:ring-2 focus:ring-sidebar-ring"
            />
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Categories</SidebarGroupLabel>
          <SidebarMenu>
            {categories.map((item) => (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton tooltip={item.name}>
                  <item.icon />
                  <span>{item.name}</span>
                  <ChevronRight className="ml-auto size-4 opacity-50" />
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="text-muted-foreground">
               <span className="text-xs">© 2026 V. Dhavande</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function SidebarFooter({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={`mt-auto p-2 border-t border-sidebar-border ${className}`} {...props}>
      {children}
    </div>
  )
}
