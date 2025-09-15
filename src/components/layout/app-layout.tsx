"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ConditionalNavigation } from "./conditional-navigation";
import { ErrorBoundary } from "@/components/error/error-boundary";
import { useNavigationStore } from "@/lib/stores/navigation-store";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useComponentPerformance, useMemoryMonitoring } from "@/hooks/use-performance";
import { logBundleInfo } from "@/lib/performance";
import { setupGlobalErrorHandling } from "@/lib/error-handling";

interface AppLayoutProps {
  children: React.ReactNode;
}

function AppLayoutInner({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const { setActiveRoute } = useNavigationStore();
  const { startRender, endRender } = useComponentPerformance('AppLayout');

  // Monitor memory usage every 30 seconds
  useMemoryMonitoring(30000);

  // Enable keyboard shortcuts
  useKeyboardShortcuts({
    enableNavigation: true,
    enableMobileMenuToggle: false, // Disabled since we're using horizontal navigation
  });

  // Update active route when pathname changes
  useEffect(() => {
    setActiveRoute(pathname);
  }, [pathname, setActiveRoute]);

  // Log bundle info and setup global error handling on mount
  useEffect(() => {
    logBundleInfo();
    setupGlobalErrorHandling();
  }, []);

  // Measure render performance
  useEffect(() => {
    startRender();
    endRender();
  });

  return (
    <div className="flex h-screen w-full flex-col bg-background">
      <ConditionalNavigation>
        <main className="flex-1 overflow-hidden" style={{ height: 'calc(100vh - 4rem)' }}>
          <div className="h-full w-full">
            {children}
          </div>
        </main>
      </ConditionalNavigation>
    </div>
  );
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <ErrorBoundary
      moduleName="Application"
      showDetails={process.env.NODE_ENV === 'development'}
    >
      <AppLayoutInner>{children}</AppLayoutInner>
    </ErrorBoundary>
  );
}