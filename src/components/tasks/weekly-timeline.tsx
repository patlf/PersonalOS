"use client";

import { useState, useMemo, useEffect, useCallback, memo, useRef, forwardRef, useImperativeHandle } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar, Eye, EyeOff, Plus } from 'lucide-react';
import { Task, CreateTaskInput } from '@/lib/types';
import { TaskCard } from './task-card';

import { DroppableArea } from './droppable-area';
import { UnifiedTaskContainer } from './unified-task-container';
import { cn } from '@/lib/utils';
import { formatDateForId, startOfDay, isSameDay, isToday, isPast } from '@/lib/date-utils';

interface WeeklyTimelineProps {
  tasks: Task[];
  currentWeek: Date;
  onWeekChange?: (direction: 'prev' | 'next') => void;
  onTaskMove?: (taskId: string, newDate: Date, newTime?: string) => void;
  onTaskReorder?: (taskId: string, newIndex: number, dayDate: Date) => void;
  onOpenCreateModal?: (date?: Date, title?: string) => void;
  onToggleComplete?: (taskId: string, completed: boolean) => void;
  showPastDays: boolean;
  onTogglePastDays: () => void;
  onTaskClick?: (task: Task) => void;
  hideNavigation?: boolean;
  onGoToToday?: () => void;
}

export interface WeeklyTimelineRef {
  goToToday: () => void;
}

interface DayColumn {
  date: Date;
  dayName: string;
  dayNumber: number;
  isToday: boolean;
  isPast: boolean;
  tasks: Task[];
  scheduledHours: number;
}

const WeeklyTimelineComponent = memo(forwardRef<WeeklyTimelineRef, WeeklyTimelineProps>(function WeeklyTimeline({
  tasks,
  currentWeek,
  onWeekChange,
  onTaskMove: _onTaskMove,
  onTaskReorder,
  onOpenCreateModal,
  onToggleComplete,
  showPastDays,
  onTogglePastDays,
  onTaskClick,
  hideNavigation = false,
  onGoToToday,
}, ref) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const dayRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const isScrollingProgrammatically = useRef(false);
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const shouldAutoScrollRef = useRef(false); // Flag to control when to auto-scroll
  
  // Static timeline configuration - large enough for free scrolling
  const PAST_DAYS = 30; // Show 30 days in the past
  const FUTURE_DAYS = 60; // Show 60 days in the future
  const TOTAL_DAYS = PAST_DAYS + FUTURE_DAYS + 1; // +1 for today

  // Handle escape key for date picker and arrow key navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showDatePicker) {
        event.preventDefault();
        setShowDatePicker(false);
        return;
      }

      // Arrow key navigation (when not in an input field)
      if (document.activeElement?.tagName !== 'INPUT' && 
          document.activeElement?.tagName !== 'TEXTAREA') {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          scrollToDay('prev');
        } else if (event.key === 'ArrowRight') {
          event.preventDefault();
          scrollToDay('next');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showDatePicker]);

  // Listen for drag events from DND context
  useEffect(() => {
    const handleDragStart = () => {
      setIsDragging(true);
    };

    const handleDragEnd = () => {
      setIsDragging(false);
      // Clear any auto-scroll
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
        autoScrollIntervalRef.current = null;
      }
    };

    // Listen for drag events on the document
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('dragend', handleDragEnd);
    
    // Also listen for DND kit events
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-task-id]')) {
        setIsDragging(true);
      }
    };

    const handleMouseUp = () => {
      setTimeout(() => setIsDragging(false), 100); // Small delay to ensure drag end
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('dragend', handleDragEnd);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }
    };
  }, []);

  // Auto-scroll and timeline extension during drag
  useEffect(() => {
    if (!isDragging) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const containerRect = container.getBoundingClientRect();
      const mouseX = e.clientX;
      const scrollThreshold = 100; // Pixels from edge to trigger scroll
      const scrollSpeed = 5; // Pixels per scroll step

      // Check if mouse is near the right edge
      const distanceFromRightEdge = containerRect.right - mouseX;
      const distanceFromLeftEdge = mouseX - containerRect.left;

      // Clear existing auto-scroll
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
        autoScrollIntervalRef.current = null;
      }

      // Auto-scroll right (towards future)
      if (distanceFromRightEdge < scrollThreshold && distanceFromRightEdge > 0) {
        autoScrollIntervalRef.current = setInterval(() => {
          container.scrollBy({ left: scrollSpeed, behavior: 'auto' });
        }, 16); // ~60fps
      }
      // Auto-scroll left (towards past)
      else if (distanceFromLeftEdge < scrollThreshold && distanceFromLeftEdge > 0) {
        autoScrollIntervalRef.current = setInterval(() => {
          container.scrollBy({ left: -scrollSpeed, behavior: 'auto' });
        }, 16);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
        autoScrollIntervalRef.current = null;
      }
    };
  }, [isDragging]);

  // Note: Removed auto-scroll effect to prevent jumping during natural scrolling

  // Initial scroll to position today as first column on mount
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Find today in the timeline and scroll to it
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayKey = formatDateForId(today);
    
    const scrollTimeout = setTimeout(() => {
      const todayElement = dayRefs.current.get(todayKey);
      if (todayElement) {
        // Calculate position with left padding for initial load
        const containerRect = container.getBoundingClientRect();
        const elementRect = todayElement.getBoundingClientRect();
        const leftPadding = 16; // 16px padding from the left edge
        
        const scrollLeft = container.scrollLeft + (elementRect.left - containerRect.left) - leftPadding;
        
        container.scrollTo({
          left: Math.max(0, scrollLeft), // Ensure we don't scroll to negative position
          behavior: 'auto' // No animation for initial positioning
        });
      }
    }, 100);

    return () => clearTimeout(scrollTimeout);
  }, []); // Only run on mount

  // Smooth scroll to specific day
  const scrollToDay = useCallback((direction: 'prev' | 'next' | Date) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    if (direction === 'prev' || direction === 'next') {
      // Scroll by one day width
      const dayWidth = container.scrollWidth / TOTAL_DAYS;
      const scrollAmount = direction === 'next' ? dayWidth : -dayWidth;
      
      isScrollingProgrammatically.current = true;
      container.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
      
      // Reset flag after scroll completes
      setTimeout(() => {
        isScrollingProgrammatically.current = false;
      }, 300);
    } else if (direction instanceof Date) {
      // Scroll to specific date
      const dateKey = formatDateForId(direction);
      const dayElement = dayRefs.current.get(dateKey);
      
      if (dayElement) {
        isScrollingProgrammatically.current = true;
        dayElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
        
        setTimeout(() => {
          isScrollingProgrammatically.current = false;
        }, 300);
      }
    }
  }, []);

  // Note: Removed automatic week change during scrolling to prevent jumping
  // Users can scroll freely without timeline regeneration

  // Calculate overdue tasks (exclude completed tasks)
  const overdueTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return tasks.filter(task => {
      if (!task.scheduledDate || task.status === 'completed' || task.status === 'someday') return false;
      const taskDate = new Date(task.scheduledDate);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate < today;
    });
  }, [tasks]);

  // Generate continuous timeline of days - static timeline based on today
  const timelineData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Start from PAST_DAYS before today
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - PAST_DAYS);
    
    const days: DayColumn[] = [];
    const fullDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    for (let i = 0; i < TOTAL_DAYS; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      // Get all tasks for this date (including completed)
      const allDayTasks = tasks
        .filter(task => {
          if (!task.scheduledDate || task.status === 'someday') return false;
          const taskDate = new Date(task.scheduledDate);
          return isSameDay(taskDate, date);
        });

      // Separate completed and active tasks
      const activeTasks = allDayTasks.filter(task => task.status !== 'completed');
      const completedTasks = allDayTasks.filter(task => task.status === 'completed');

      // Sort active tasks first, then completed tasks at the bottom
      const dayTasks = [
        ...activeTasks.sort((a, b) => {
          // Sort by creation time (oldest first) for consistent ordering
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }),
        ...completedTasks.sort((a, b) => {
          // Sort completed tasks by completion time (most recent first)
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        })
      ];

      // Only count active tasks for scheduled hours
      const scheduledHours = activeTasks.reduce((total, task) => {
        return total + (task.estimatedDuration / 60);
      }, 0);

      const dayOfWeek = date.getDay();
      const isDateToday = isToday(date);
      const dayName = isDateToday ? 'Today' : fullDayNames[dayOfWeek];

      days.push({
        date,
        dayName,
        dayNumber: date.getDate(),
        isToday: isDateToday,
        isPast: isPast(date),
        tasks: dayTasks,
        scheduledHours
      });
    }

    return days;
  }, [tasks]); // Only depend on tasks, not currentWeek

  // Format week range for display (show current week range)
  const weekRange = useMemo(() => {
    const start = new Date(currentWeek);
    const end = new Date(currentWeek);
    end.setDate(start.getDate() + 6);
    
    const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
    const startDay = start.getDate();
    const endDay = end.getDate();
    const year = start.getFullYear();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);

    if (start.getTime() === today.getTime()) {
      return `Today - ${endMonth} ${endDay}, ${year}`;
    } else if (startMonth === endMonth) {
      return `${startMonth} ${startDay} - ${endDay}, ${year}`;
    } else {
      return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
    }
  }, [currentWeek]);

  const handleTaskClick = useCallback((task: Task) => {
    onTaskClick?.(task);
  }, [onTaskClick]);

  const handleDateClick = useCallback((date: Date) => {
    setSelectedDate(selectedDate?.getTime() === date.getTime() ? null : date);
  }, [selectedDate]);



  const handleDatePickerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = new Date(event.target.value);
    if (!isNaN(selectedDate.getTime())) {
      // Since we start from today, we need to calculate how many days to move
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      selectedDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.round((selectedDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
      
      // Navigate to the target date by moving the appropriate number of days
      for (let i = 0; i < Math.abs(daysDiff); i++) {
        if (daysDiff > 0) {
          onWeekChange?.('next');
        } else {
          onWeekChange?.('prev');
        }
      }
    }
    setShowDatePicker(false);
  };

  const goToToday = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayKey = formatDateForId(today);
    
    const container = scrollContainerRef.current;
    const todayElement = dayRefs.current.get(todayKey);
    
    if (container && todayElement) {
      // Calculate position with left padding
      const containerRect = container.getBoundingClientRect();
      const elementRect = todayElement.getBoundingClientRect();
      const leftPadding = 16; // 16px padding from the left edge
      
      const scrollLeft = container.scrollLeft + (elementRect.left - containerRect.left) - leftPadding;
      
      container.scrollTo({
        left: Math.max(0, scrollLeft), // Ensure we don't scroll to negative position
        behavior: 'smooth'
      });
    }
  }, []);

  // Expose goToToday function via ref
  useImperativeHandle(ref, () => ({
    goToToday
  }), [goToToday]);

  return (
    <div className="flex flex-col h-full">
      {/* Top Bar */}
      {!hideNavigation && (
        <div className="flex items-center justify-between p-4 border-b border-border bg-background">
        <div className="flex items-center gap-4">
          {/* Week Navigation */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onWeekChange?.('prev')}
              className="h-8 w-8 p-0 hover:bg-muted"
              aria-label="Previous week (←)"
              title="Previous week (←)"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onWeekChange?.('next')}
              className="h-8 w-8 p-0 hover:bg-muted"
              aria-label="Next week (→)"
              title="Next week (→)"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Week Range and Date Picker */}
          <div className="flex items-center gap-2 relative">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="text-sm font-medium text-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
              title="Click to select date"
            >
              {weekRange}
            </button>
            
            {showDatePicker && (
              <div className="absolute top-full left-0 mt-2 z-50">
                <div className="bg-popover border border-border rounded-lg shadow-lg p-2">
                  <input
                    type="date"
                    onChange={handleDatePickerChange}
                    className="text-sm border border-border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                    autoFocus
                  />
                </div>
              </div>
            )}
          </div>

          {/* Today Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="text-xs px-3 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 dark:hover:bg-blue-950 dark:hover:text-blue-400 dark:hover:border-blue-800"
          >
            Today
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* Overdue Tasks Indicator */}
          {overdueTasks.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 px-2 py-1 rounded-full border border-destructive/20">
              <span className="font-medium">{overdueTasks.length} overdue</span>
            </div>
          )}
          
          {/* Past Days Toggle */}
          <Button
            variant={showPastDays ? "default" : "outline"}
            size="sm"
            onClick={onTogglePastDays}
            className={cn(
              "text-xs px-3 transition-all",
              showPastDays 
                ? "bg-blue-600 hover:bg-blue-700 text-white" 
                : "hover:bg-muted/50"
            )}
            title="Toggle past days visibility (Ctrl/Cmd + P)"
            aria-label={`${showPastDays ? 'Hide' : 'Show'} past days`}
            aria-pressed={showPastDays}
          >
            {showPastDays ? (
              <>
                <EyeOff className="h-3 w-3 mr-1" />
                Hide Past
              </>
            ) : (
              <>
                <Eye className="h-3 w-3 mr-1" />
                Show Past
              </>
            )}
          </Button>

          {/* Scroll Hint */}
          <div className="text-xs text-muted-foreground hidden sm:block">
            Scroll horizontally or use ← → keys to navigate
          </div>
        </div>
      </div>
      )}

      {/* Continuous Timeline */}
      <div className="flex-1 flex flex-col bg-gradient-to-br from-background to-muted/20">
        {/* Overdue Tasks Row */}
        {overdueTasks.length > 0 && (
          <div className="p-4 pb-0">
            <DroppableArea 
              id="overdue"
              className="relative"
              activeClassName="border-destructive/50 bg-destructive/5"
            >
              <Card className="p-4 bg-destructive/5 border-destructive/20 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold text-destructive">Overdue Tasks</div>
                    <span className="inline-flex items-center rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive border border-destructive/20">
                      {overdueTasks.length}
                    </span>
                  </div>
                  <div className="text-xs text-destructive/80">
                    Drag tasks to reschedule
                  </div>
                </div>
                <UnifiedTaskContainer
                  id="overdue"
                  tasks={overdueTasks.sort((a, b) => {
                    // Sort by scheduled date (oldest first)
                    if (!a.scheduledDate || !b.scheduledDate) return 0;
                    return new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
                  })}
                  onTaskClick={handleTaskClick}
                  onToggleComplete={onToggleComplete}
                  enableSorting={false}
                  emptyMessage="No overdue tasks"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
                />
              </Card>
            </DroppableArea>
          </div>
        )}
        
        {/* Horizontal Scrolling Timeline */}
        <div 
          ref={scrollContainerRef}
          className={cn(
            "flex-1 overflow-x-auto overflow-y-hidden p-4 pt-2 relative",
            isDragging && "scroll-smooth"
          )}
          style={{ 
            cursor: 'grab'
          }}
          onMouseDown={(e) => {
            if (e.currentTarget === e.target) {
              e.currentTarget.style.cursor = 'grabbing';
            }
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.cursor = 'grab';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.cursor = 'grab';
          }}
        >
          {/* Auto-scroll indicators */}
          {isDragging && (
            <>
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 pointer-events-none">
                <div className="w-2 h-16 bg-gradient-to-r from-blue-500/50 to-transparent rounded-r-full opacity-60" />
              </div>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 pointer-events-none">
                <div className="w-2 h-16 bg-gradient-to-l from-blue-500/50 to-transparent rounded-l-full opacity-60" />
              </div>
            </>
          )}
          <div className="flex gap-4 h-full min-w-max">
            {timelineData.map((day) => {
              const shouldShow = showPastDays || !day.isPast || day.isToday;
              const dayId = `day-${formatDateForId(day.date)}`;
              const dateKey = formatDateForId(day.date);
              
              return (
                <div 
                  key={dateKey}
                  ref={(el) => {
                    if (el) {
                      dayRefs.current.set(dateKey, el);
                    } else {
                      dayRefs.current.delete(dateKey);
                    }
                  }}
                  className="flex-shrink-0 w-80"
                >
                  {!shouldShow ? (
                    <Card className="h-full p-3 bg-muted/50 border-border/40 opacity-30">
                      <div className="text-center text-muted-foreground">
                        <div className="text-xs font-medium">{day.dayName}</div>
                        <div className="text-sm font-semibold mt-1">
                          {day.date.toLocaleDateString('en-US', { month: 'short' })} {day.dayNumber}
                        </div>
                      </div>
                    </Card>
                  ) : (
                    <DroppableArea 
                      id={dayId}
                      className="h-full relative"
                      activeClassName="border-blue-500/50 bg-blue-50/5 dark:bg-blue-950/5"
                    >
                      <Card 
                        className={cn(
                          "h-full p-3 transition-all duration-200 ease-out cursor-pointer border-border bg-card",
                          "hover:shadow-md hover:border-border/80",
                          day.isToday && "ring-2 ring-blue-500/30 border-blue-500/20 bg-blue-50/5 dark:bg-blue-950/5",
                          selectedDate?.getTime() === day.date.getTime() && "ring-2 ring-blue-500/50 border-blue-500/30 shadow-lg",
                          day.isPast && !day.isToday && "bg-muted/30 hover:bg-muted/50"
                        )}
                        onClick={() => handleDateClick(day.date)}
                      >
                        {/* Day Header */}
                        <div className="text-center mb-3">
                          <div className={cn(
                            "text-xs font-medium",
                            day.isToday ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground"
                          )}>
                            {day.dayName}
                          </div>
                          <div className={cn(
                            "text-sm font-semibold mt-1",
                            day.isToday ? "text-blue-600 dark:text-blue-400" : "text-foreground"
                          )}>
                            {day.date.toLocaleDateString('en-US', { month: 'short' })} {day.dayNumber}
                          </div>
                        </div>

                        {/* Add Task Button */}
                        <div className="mb-3">
                          {onOpenCreateModal && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenCreateModal(day.date, `Add task for ${day.dayName}`);
                              }}
                              className="w-full text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 h-8 px-2 border border-dashed border-muted-foreground/30 hover:border-muted-foreground/50 rounded-lg"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add task
                            </Button>
                          )}
                        </div>

                        {/* Tasks */}
                        <div className="flex-1 min-h-[160px]">
                          <UnifiedTaskContainer
                            containerId={dayId}
                            tasks={day.tasks}
                            onTaskClick={handleTaskClick}
                            onToggleComplete={onToggleComplete}
                            enableSorting={false}
                            emptyMessage={`No tasks for ${day.dayName}`}
                          />
                        </div>

                        {/* Scheduled Hours */}
                        <div className="mt-3 pt-2 border-t border-border/50">
                          <div className="text-center">
                            <span className={cn(
                              "text-xs font-medium",
                              day.scheduledHours > 8 ? "text-red-600 dark:text-red-400" : 
                              day.scheduledHours > 6 ? "text-amber-600 dark:text-amber-400" : 
                              "text-muted-foreground"
                            )}>
                              {day.scheduledHours.toFixed(1)}h
                            </span>
                          </div>
                        </div>
                      </Card>
                    </DroppableArea>
                  )}
                </div>
              );
            })}

          </div>
        </div>
      </div>
    </div>
  );
}));

export { WeeklyTimelineComponent as WeeklyTimeline };