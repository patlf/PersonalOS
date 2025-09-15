"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Bot,
  CheckSquare,
  Calendar,
  Mail,
  Menu,
  X
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { KeyboardShortcut } from "@/components/ui/kbd";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useNavigationStore } from "@/lib/stores/navigation-store";
import { UserAvatar } from "@/components/auth/user-avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  isPlaceholder?: boolean;
  shortcut?: string[];
}

const navigationItems: NavigationItem[] = [
  {
    id: "ai",
    label: "AI",
    icon: Bot,
    href: "/ai",
    shortcut: ["1"],
  },
  {
    id: "tasks",
    label: "Tasks",
    icon: CheckSquare,
    href: "/tasks",
    shortcut: ["2"],
  },
  {
    id: "calendar",
    label: "Calendar",
    icon: Calendar,
    href: "/calendar",
    shortcut: ["3"],
  },
  {
    id: "mail",
    label: "Mail",
    icon: Mail,
    href: "/mail",
    shortcut: ["4"],
  },
];

interface TopNavigationProps {
  className?: string;
}

export function TopNavigation({ className }: TopNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { activeRoute, setActiveRoute, isMobileMenuOpen, toggleMobileMenu } = useNavigationStore();
  const [mounted, setMounted] = useState(false);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Update active route when pathname changes
  useEffect(() => {
    if (pathname !== activeRoute) {
      setActiveRoute(pathname);
    }
  }, [pathname, activeRoute, setActiveRoute]);

  // Close mobile menu when clicking outside or on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        toggleMobileMenu();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (isMobileMenuOpen) {
        const target = e.target as Element;
        if (!target.closest('[data-mobile-menu]')) {
          toggleMobileMenu();
        }
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('click', handleClickOutside);
      // Prevent body scroll when mobile menu is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen, toggleMobileMenu]);

  const handleNavigation = (href: string) => {
    setActiveRoute(href);
    router.push(href);
    // Close mobile menu if open
    if (isMobileMenuOpen) {
      toggleMobileMenu();
    }
  };

  const isActive = (href: string) => {
    return pathname === href || (href !== "/" && pathname.startsWith(href));
  };

  if (!mounted) {
    return (
      <nav className={cn("h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", className)}>
        <div className="flex h-16 items-center px-4 sm:px-6 lg:px-8 w-full">
          <Logo variant="icon" size="md" />
        </div>
      </nav>
    );
  }

  return (
    <nav className={cn(
      "sticky top-0 z-50 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      className
    )}>
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 w-full">
        {/* Logo and Navigation */}
        <div className="flex items-center">
          <Link
            href="/"
            className="hover:opacity-80 transition-opacity min-w-0 flex-shrink-0"
            onClick={(e) => {
              e.preventDefault();
              handleNavigation("/");
            }}
          >
            <Logo variant="icon" size="md" />
          </Link>

          {/* Separator */}
          <div className="hidden lg:block w-px h-16 bg-border mx-6"></div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navigationItems.map((item) => {
              const active = isActive(item.href);

              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "px-4 py-2 h-9 transition-all duration-200 min-w-0 relative group",
                    "hover:bg-muted hover:text-foreground hover:scale-100",
                    active && "text-foreground font-medium bg-muted"
                  )}
                  onClick={() => handleNavigation(item.href)}
                >
                  <span className="truncate">{item.label}</span>
                  {item.shortcut && (
                    <KeyboardShortcut
                      keys={item.shortcut}
                      className="ml-1 opacity-60"
                    />
                  )}
                  {/* Hover underline effect */}
                  <span className={cn(
                    "absolute -bottom-3.5 left-0 w-full h-0.5 transition-all duration-200",
                    "bg-muted-foreground",
                    active ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  )} />
                </Button>
              );
            })}
          </div>
        </div>

        {/* Tablet Separator */}
        <div className="hidden md:block lg:hidden w-px h-16 bg-border mx-6"></div>

        {/* Tablet Navigation (md to lg) */}
        <div className="hidden md:flex lg:hidden items-center">
          {navigationItems.map((item) => {
            const active = isActive(item.href);

            return (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                className={cn(
                  "px-3 py-2 h-9 transition-colors duration-200 group relative",
                  "hover:bg-transparent hover:text-foreground hover:scale-100",
                  active && "text-foreground font-medium"
                )}
                onClick={() => handleNavigation(item.href)}
                title={item.label}
              >
                <span className="text-sm">{item.label}</span>
                {/* Hover underline effect */}
                <span className={cn(
                  "absolute -bottom-3.5 left-0 w-full h-0.5 transition-all duration-200",
                  "bg-gray-400 dark:bg-gray-500",
                  active ? "opacity-100 bg-gray-500 dark:bg-gray-400" : "opacity-0 group-hover:opacity-100"
                )} />
              </Button>
            );
          })}
        </div>

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <ThemeToggle variant="ghost" size="sm" className="h-8 w-8 sm:h-9 sm:w-9" />

          {session?.user && <UserAvatar />}

          {/* Mobile Menu */}
          <Sheet open={isMobileMenuOpen} onOpenChange={toggleMobileMenu}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden h-8 w-8 sm:h-9 sm:w-9"
                aria-label="Toggle navigation menu"
                data-mobile-menu
              >
                {isMobileMenuOpen ? (
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[280px] sm:w-80 p-0"
              data-mobile-menu
            >
              <div className="flex flex-col h-full">
                {/* Mobile Header */}
                <div className="flex items-center p-4 border-b">
                  <Logo variant="icon" size="md" />
                  <span className="ml-3 text-sm font-semibold">Menu</span>
                </div>

                {/* Mobile Navigation Items */}
                <div className="flex-1 p-4 space-y-2 overflow-y-auto">
                  {navigationItems.map((item) => {
                    const active = isActive(item.href);

                    return (
                      <Button
                        key={item.id}
                        variant={active ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start gap-3 h-12 text-left",
                          active && "bg-secondary shadow-sm font-medium",
                          item.isPlaceholder && "opacity-75"
                        )}
                        onClick={() => handleNavigation(item.href)}
                      >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        <div className="flex flex-col items-start flex-1 min-w-0">
                          <span className="truncate">{item.label}</span>
                          {item.shortcut && (
                            <KeyboardShortcut
                              keys={item.shortcut}
                              className="mt-1 opacity-60"
                            />
                          )}
                        </div>
                        {item.isPlaceholder && (
                          <span className="ml-auto text-xs text-muted-foreground flex-shrink-0">
                            Soon
                          </span>
                        )}
                      </Button>
                    );
                  })}
                </div>

                {/* Mobile User Profile */}
                {session?.user && (
                  <div className="p-4 border-t mt-auto">
                    <UserAvatar />
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}