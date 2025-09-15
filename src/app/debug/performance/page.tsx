import { PerformanceDashboard } from '@/components/debug/performance-dashboard';
import { redirect } from 'next/navigation';

export default function PerformanceDebugPage() {
  // Only allow access in development
  if (process.env.NODE_ENV !== 'development') {
    redirect('/');
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Performance Monitoring</h1>
        <p className="text-gray-600 mt-2">
          Real-time performance metrics for the productivity platform.
          This page is only available in development mode.
        </p>
      </div>
      
      <PerformanceDashboard />
    </div>
  );
}