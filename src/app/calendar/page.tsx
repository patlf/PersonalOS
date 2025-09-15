import { Suspense, lazy } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarErrorBoundary } from "@/components/error/error-boundary";

const CalendarView = lazy(() => import("@/components/calendar/calendar-view").then(module => ({ default: module.CalendarView })));

function CalendarPageSkeleton() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
        <Skeleton className="h-6 sm:h-8 w-24 sm:w-32" />
        <div className="flex gap-1 sm:gap-2">
          <Skeleton className="h-6 sm:h-8 w-12 sm:w-16" />
          <Skeleton className="h-6 sm:h-8 w-12 sm:w-16" />
          <Skeleton className="h-6 sm:h-8 w-16 sm:w-20" />
        </div>
      </div>
      <div className="flex-1 p-2 sm:p-4">
        <div className="grid grid-cols-1 sm:grid-cols-7 gap-2 sm:gap-4 h-full">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 sm:h-6 w-12 sm:w-16" />
              <div className="space-y-1">
                {Array.from({ length: 4 }).map((_, j) => (
                  <Skeleton key={j} className="h-6 sm:h-8 w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CalendarPage() {
  return (
    <CalendarErrorBoundary>
      <Suspense fallback={<CalendarPageSkeleton />}>
        <CalendarView />
      </Suspense>
    </CalendarErrorBoundary>
  );
}