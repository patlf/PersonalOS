"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";

interface AuthNavigationProps {
  className?: string;
}

export function AuthNavigation({ className }: AuthNavigationProps) {
  const [mounted, setMounted] = useState(false);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <nav className={cn("h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", className)}>
        <div className="container flex h-16 items-center justify-between">
          <Logo />
        </div>
      </nav>
    );
  }

  return (
    <nav className={cn(
      "sticky top-0 z-50 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      className
    )}>
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Logo */}
        <Link 
          href="/" 
          className="hover:opacity-80 transition-opacity min-w-0 flex-shrink-0"
        >
          <Logo />
        </Link>

        {/* Right Side Controls - Auth Actions and Theme Toggle */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <ThemeToggle variant="ghost" size="sm" className="h-8 w-8 sm:h-9 sm:w-9" />
          
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="hidden sm:inline-flex h-8 sm:h-9 px-2 sm:px-3"
            >
              <Link href="/auth/signin">Sign In</Link>
            </Button>
            
            <Button
              size="sm"
              asChild
              className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
            >
              <Link href="/auth/signup">
                <span className="hidden xs:inline">Sign Up</span>
                <span className="xs:hidden">Join</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}