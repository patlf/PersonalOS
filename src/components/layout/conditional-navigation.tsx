"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { TopNavigation } from "./top-navigation";
import { AuthNavigation } from "./auth-navigation";

interface ConditionalNavigationProps {
  children?: React.ReactNode;
}

export function ConditionalNavigation({ children }: ConditionalNavigationProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  // Show loading state during session check
  if (status === "loading") {
    return (
      <>
        <nav className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-primary shadow-sm">
                <div className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-pulse bg-primary-foreground rounded" />
              </div>
              <div className="hidden xs:flex flex-col">
                <div className="h-3 w-16 sm:w-20 bg-muted animate-pulse rounded" />
                <div className="h-2 w-12 sm:w-16 bg-muted animate-pulse rounded mt-1" />
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="h-7 w-7 sm:h-8 sm:w-8 bg-muted animate-pulse rounded" />
              <div className="h-7 w-12 sm:h-8 sm:w-16 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </nav>
        {children}
      </>
    );
  }

  // Check if user is authenticated
  const isAuthenticated = !!session?.user;

  // For auth pages, don't show any navigation (they have their own layout)
  const isAuthPage = pathname?.startsWith('/auth/');

  // Determine which navigation to show
  if (isAuthPage) {
    return <>{children}</>;
  }

  const shouldShowTopNavigation = isAuthenticated;

  return (
    <>
      {shouldShowTopNavigation ? <TopNavigation /> : <AuthNavigation />}
      {children}
    </>
  );
}