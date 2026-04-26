'use client'

import * as React from "react"
import Link from "next/link"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import { useAuth } from "@/hooks/useAuth"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  LayoutDashboardIcon,
  ChartBarIcon,
  FileTextIcon,
  Settings2Icon,
  CircleHelpIcon,
  UserIcon,
  CommandIcon,
} from "lucide-react"

const navMain = [
  {
    title: "Overview",
    url: "/dashboard",
    icon: <LayoutDashboardIcon />,
  },
  {
    title: "Blog Management",
    url: "/dashboard/blog",
    icon: <FileTextIcon />,
  },
  {
    title: "Analytics",
    url: "/dashboard/analytics",
    icon: <ChartBarIcon />,
  },
]

const navSecondary = [
  {
    title: "My Profile",
    url: "/profile",
    icon: <UserIcon />,
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: <Settings2Icon />,
  },
  {
    title: "Get Help",
    url: "#",
    icon: <CircleHelpIcon />,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()

  const userData = {
    name: user?.name || "User",
    email: user?.email || "",
    avatar: user?.picture || "",
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<Link href="/" />}
            >
              <CommandIcon className="size-5!" />
              <span className="text-base font-semibold">Vikas Dhavande</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
