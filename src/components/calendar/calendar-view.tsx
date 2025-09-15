'use client';

import { useCalendarStore } from '@/lib/stores/calendar-store';
import { useTaskStore } from '@/lib/stores/task-store';
import { CalendarNavigation } from './calendar-navigation';
import { DayView } from './day-view';
import { WeekView } from './week-view';
import { MonthView } from './month-view';
import { Task } from '@/lib/types';
import { CalendarEvent } from '@/lib/stores/calendar-store';

export function CalendarView() {
  const { 
    viewType, 
    currentDate, 
    events,
    setViewType, 
    setCurrentDate 
  } = useCalendarStore();

  const { 
    tasks,
    setSelectedTask 
  } = useTaskStore();

  const handleEventClick = (event: CalendarEvent) => {
    // TODO: Implement event details modal
    console.log('Event clicked:', event);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    // TODO: Open task edit modal
    console.log('Task clicked:', task);
  };

  const handleTimeSlotClick = (date: Date, hour: number) => {
    // TODO: Implement quick task/event creation
    console.log('Time slot clicked:', date, hour);
  };

  const handleDateClick = (date: Date) => {
    // Switch to day view for the clicked date
    setCurrentDate(date);
    setViewType('day');
  };

  const renderCalendarView = () => {
    const commonProps = {
      date: currentDate,
      events,
      tasks,
      onEventClick: handleEventClick,
      onTaskClick: handleTaskClick,
    };

    switch (viewType) {
      case 'day':
        return (
          <DayView
            {...commonProps}
            onTimeSlotClick={handleTimeSlotClick}
          />
        );
      case 'week':
        return (
          <WeekView
            {...commonProps}
            onTimeSlotClick={handleTimeSlotClick}
          />
        );
      case 'month':
        return (
          <MonthView
            {...commonProps}
            onDateClick={handleDateClick}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <CalendarNavigation
        viewType={viewType}
        currentDate={currentDate}
        onViewTypeChange={setViewType}
        onDateChange={setCurrentDate}
      />
      
      <div className="flex-1 overflow-hidden">
        {renderCalendarView()}
      </div>
    </div>
  );
}