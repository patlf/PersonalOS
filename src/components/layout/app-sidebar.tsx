"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Bot, 
  CheckSquare, 
  Calendar, 
  Mail,
  Settings
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { useNavigationStore } from "@/lib/stores/navigation-store";
import { UserAvatar } from "@/components/auth/user-avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Logo } from "@/components/ui/logo";

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  isPlaceholder?: boolean;
}

const navigationItems: NavigationItem[] = [
  {
    id: "ai",
    label: "AI Assistant",
    icon: Bot,
    href: "/ai",
    isPlaceholder: true,
  },
  {
    id: "tasks",
    label: "Tasks",
    icon: CheckSquare,
    href: "/tasks",
  },
  {
    id: "calendar",
    label: "Calendar",
    icon: Calendar,
    href: "/calendar",
    isPlaceholder: true,
  },
  {
    id: "mail",
    label: "Mail",
    icon: Mail,
    href: "/mail",
    isPlaceholder: true, // Keep as placeholder since it's still coming soon
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { state: sidebarState } = useSidebar();
  const { setSidebarCollapsed, activeRoute, setActiveRoute } = useNavigationStore();

  // Sync sidebar state with store
  useEffect(() => {
    setSidebarCollapsed(sidebarState === "collapsed");
  }, [sidebarState, setSidebarCollapsed]);

  // Update active route when pathname changes
  useEffect(() => {
    if (pathname !== activeRoute) {
      setActiveRoute(pathname);
    }
  }, [pathname, activeRoute, setActiveRoute]);

  const handleNavigation = (href: string) => {
    setActiveRoute(href);
    router.push(href);
  };

  return (
    <Sidebar 
      variant="sidebar" 
      collapsible="icon"
      className="border-r border-sidebar-border"
    >
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <Logo variant="icon" size="md" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-sidebar-foreground">
              Productivity
            </span>
            <span className="text-xs text-sidebar-foreground/60">
              Platform
            </span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-2">
        <SidebarMenu>
          {navigationItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== "/" && pathname.startsWith(item.href));
            
            return (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.label}
                  className={`
                    w-full justify-start gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                    hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
                    data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground
                    data-[active=true]:shadow-sm data-[active=true]:font-medium
                    ${item.isPlaceholder ? 'opacity-75' : ''}
                  `}
                >
                  <Link 
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigation(item.href);
                    }}
                    className="flex items-center gap-3 w-full"
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                    {item.isPlaceholder && (
                      <span className="ml-auto text-xs text-sidebar-foreground/40 group-data-[collapsible=icon]:hidden">
                        Soon
                      </span>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter className="p-2">
        <SidebarSeparator className="mb-2" />
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 px-3 py-2">
              <SidebarMenuButton
                tooltip="Settings"
                className="flex-1 justify-start gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <Settings className="h-4 w-4 shrink-0" />
                <span className="truncate">Settings</span>
              </SidebarMenuButton>
              <ThemeToggle 
                variant="ghost" 
                size="icon"
                className="h-9 w-9 shrink-0"
              />
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <UserAvatar />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}