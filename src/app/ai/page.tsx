import { Suspense, lazy } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AIErrorBoundary } from "@/components/error/error-boundary";

const ChatInterface = lazy(() => import("@/components/ai").then(module => ({ default: module.ChatInterface })));

function AIPageSkeleton() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 p-4 space-y-4">
        <div className="flex justify-start">
          <Skeleton className="h-12 w-64 rounded-lg" />
        </div>
        <div className="flex justify-end">
          <Skeleton className="h-12 w-48 rounded-lg" />
        </div>
        <div className="flex justify-start">
          <Skeleton className="h-16 w-72 rounded-lg" />
        </div>
      </div>
      <div className="border-t p-4">
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </div>
  );
}

export default function AIPage() {
  return (
    <AIErrorBoundary>
      <div className="h-full">
        <Suspense fallback={<AIPageSkeleton />}>
          <ChatInterface />
        </Suspense>
      </div>
    </AIErrorBoundary>
  );
}