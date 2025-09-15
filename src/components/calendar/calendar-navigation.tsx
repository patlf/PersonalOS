'use client';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays, addWeeks, addMonths, startOfWeek } from 'date-fns';

interface CalendarNavigationProps {
  viewType: 'day' | 'week' | 'month';
  currentDate: Date;
  onViewTypeChange: (viewType: 'day' | 'week' | 'month') => void;
  onDateChange: (date: Date) => void;
}

export function CalendarNavigation({
  viewType,
  currentDate,
  onViewTypeChange,
  onDateChange,
}: CalendarNavigationProps) {
  const handlePrevious = () => {
    const newDate = viewType === 'day' 
      ? addDays(currentDate, -1)
      : viewType === 'week'
      ? addWeeks(currentDate, -1)
      : addMonths(currentDate, -1);
    onDateChange(newDate);
  };

  const handleNext = () => {
    const newDate = viewType === 'day'
      ? addDays(currentDate, 1)
      : viewType === 'week'
      ? addWeeks(currentDate, 1)
      : addMonths(currentDate, 1);
    onDateChange(newDate);
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  const getDateRangeText = () => {
    switch (viewType) {
      case 'day':
        return format(currentDate, 'EEEE, MMMM d, yyyy');
      case 'week':
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        const weekEnd = addDays(weekStart, 6);
        return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
      case 'month':
        return format(currentDate, 'MMMM yyyy');
      default:
        return '';
    }
  };

  return (
    <div className="flex items-center justify-between p-6 border-b border-border">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-semibold text-foreground">Calendar</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={handleToday}
          className="text-sm"
        >
          Today
        </Button>
      </div>

      <div className="flex items-center gap-4">
        {/* Date navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrevious}
            className="h-8 w-8 p-0"
            aria-label="Previous"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-lg font-medium min-w-[200px] text-center">
            {getDateRangeText()}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNext}
            className="h-8 w-8 p-0"
            aria-label="Next"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* View type selector */}
        <Select value={viewType} onValueChange={onViewTypeChange}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Day</SelectItem>
            <SelectItem value="week">Week</SelectItem>
            <SelectItem value="month">Month</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}