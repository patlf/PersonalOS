import { Suspense, lazy } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { MailErrorBoundary } from "@/components/error/error-boundary";

const MailView = lazy(() => import("@/components/mail").then(module => ({ default: module.MailView })));

function MailPageSkeleton() {
  return (
    <div className="flex h-full">
      <div className="w-64 border-r bg-muted/10 p-4">
        <Skeleton className="h-8 w-32 mb-4" />
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
      <div className="w-80 border-r p-4">
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 p-4">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}

export default function MailPage() {
  return (
    <MailErrorBoundary>
      <div className="h-full">
        <Suspense fallback={<MailPageSkeleton />}>
          <MailView />
        </Suspense>
      </div>
    </MailErrorBoundary>
  );
}