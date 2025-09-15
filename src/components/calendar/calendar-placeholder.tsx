import { Card } from '@/components/ui/card';
import { Calendar, Clock, Users, RefreshCw } from 'lucide-react';

export function CalendarPlaceholder() {
  return (
    <Card className="h-full flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="rounded-full bg-muted p-6">
            <Calendar className="h-12 w-12 text-muted-foreground" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">
            Calendar Coming Soon
          </h2>
          <p className="text-muted-foreground">
            We&apos;re building a powerful calendar integration that will sync with your existing calendar services.
          </p>
        </div>

        <div className="space-y-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-3">
            <RefreshCw className="h-4 w-4 text-blue-500" />
            <span>Sync with Google, Outlook, and iCloud calendars</span>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-green-500" />
            <span>Drag tasks directly into calendar time slots</span>
          </div>
          <div className="flex items-center gap-3">
            <Users className="h-4 w-4 text-purple-500" />
            <span>View tasks and events together in one place</span>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-orange-500" />
            <span>Day, week, and month view options</span>
          </div>
        </div>

        <div className="pt-4 space-y-2">
          <p className="text-xs text-muted-foreground">
            Expected availability: Q2 2025
          </p>
          <p className="text-xs text-muted-foreground">
            The navigation and view controls above are fully functional and ready for the calendar implementation.
          </p>
        </div>
      </div>
    </Card>
  );
}