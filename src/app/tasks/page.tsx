import { Suspense, lazy } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const TasksView = lazy(() => import("@/components/tasks/tasks-view").then(module => ({ default: module.TasksView })));

function TasksPageSkeleton() {
  return (
    <div className="flex h-full">
      {/* Someday Column - Hidden on mobile */}
      <div className="hidden lg:block w-80 border-r bg-muted/10 p-4">
        <Skeleton className="h-8 w-32 mb-4" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="border-b px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <Skeleton className="h-6 sm:h-8 w-16 sm:w-24" />
            <Skeleton className="h-4 sm:h-5 w-20 sm:w-32" />
          </div>
          <Skeleton className="h-8 sm:h-10 w-full" />
        </div>

        {/* Timeline */}
        <div className="flex-1 p-2 sm:p-4">
          <div className="grid grid-cols-1 sm:grid-cols-7 gap-2 sm:gap-4 h-full">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 sm:h-6 w-12 sm:w-16" />
                <Skeleton className="h-24 sm:h-32 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TasksPage() {
  return (
    <Suspense fallback={<TasksPageSkeleton />}>
      <TasksView />
    </Suspense>
  );
}