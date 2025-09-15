'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Clock,
  Users,
  MapPin,
  Bell,
  Repeat,
  Video
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { cardStyles, badgeStyles, interactiveStyles } from '@/lib/component-styles';

// Mock data for the placeholder
const mockEvents = [
  {
    id: '1',
    title: 'Team Standup',
    time: '9:00 AM',
    duration: '30 min',
    type: 'meeting',
    attendees: 5,
    location: 'Conference Room A',
    isRecurring: true,
  },
  {
    id: '2',
    title: 'Product Review',
    time: '2:00 PM',
    duration: '1 hour',
    type: 'review',
    attendees: 8,
    location: 'Virtual',
    isRecurring: false,
  },
  {
    id: '3',
    title: 'Client Presentation',
    time: '4:00 PM',
    duration: '45 min',
    type: 'presentation',
    attendees: 3,
    location: 'Main Office',
    isRecurring: false,
  },
];

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const timeSlots = Array.from({ length: 12 }, (_, i) => `${i + 8}:00`);

export function CalendarView() {
  return (
    <div className="flex flex-col h-full bg-background relative">
      {/* Calendar Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-foreground">Calendar</h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium text-foreground px-3">
                December 2024
              </span>
              <Button variant="outline" size="sm">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Day
            </Button>
            <Button variant="outline" size="sm">
              Week
            </Button>
            <Button variant="default" size="sm">
              Month
            </Button>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Event
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 flex">
        {/* Time Column */}
        <div className="w-20 border-r border-border bg-muted/20">
          <div className="h-12 border-b border-border"></div>
          {timeSlots.map((time) => (
            <div key={time} className="h-16 border-b border-border flex items-start justify-end pr-2 pt-1">
              <span className="text-xs text-muted-foreground">{time}</span>
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="flex-1">
          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-border">
            {weekDays.map((day, index) => (
              <div key={day} className="h-12 border-r border-border flex flex-col items-center justify-center">
                <span className="text-xs text-muted-foreground">{day}</span>
                <span className="text-sm font-medium text-foreground">{15 + index}</span>
              </div>
            ))}
          </div>

          {/* Time Grid */}
          <div className="grid grid-cols-7">
            {Array.from({ length: 7 * 12 }).map((_, index) => {
              const dayIndex = index % 7;
              const timeIndex = Math.floor(index / 7);
              const hasEvent = dayIndex === 1 && timeIndex === 1; // Mock event on Tuesday 9 AM
              
              return (
                <div
                  key={index}
                  className="h-16 border-r border-b border-border relative hover:bg-muted/30 cursor-pointer"
                >
                  {hasEvent && (
                    <div className="absolute inset-1 bg-primary/10 border border-primary/20 rounded p-1">
                      <div className="text-xs font-medium text-primary truncate">
                        Team Standup
                      </div>
                      <div className="text-xs text-muted-foreground">
                        9:00 AM
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Sidebar - Today's Events */}
        <div className="w-80 border-l border-border bg-muted/20">
          <div className="p-4 border-b border-border">
            <h3 className="text-base font-semibold text-foreground mb-2">
              Today's Events
            </h3>
            <span className={badgeStyles({ variant: 'outline', size: 'sm' })}>
              {mockEvents.length} events
            </span>
          </div>
          
          <div className="p-4 space-y-3">
            {mockEvents.map((event) => (
              <Card key={event.id} className="p-3">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-sm font-medium text-foreground">
                      {event.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <Clock className="h-3 w-3" />
                      <span>{event.time} • {event.duration}</span>
                    </div>
                  </div>
                  {event.isRecurring && (
                    <Repeat className="h-3 w-3 text-muted-foreground" />
                  )}
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>{event.attendees} attendees</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {event.location === 'Virtual' ? (
                      <Video className="h-3 w-3" />
                    ) : (
                      <MapPin className="h-3 w-3" />
                    )}
                    <span>{event.location}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-3">
                  <span className={badgeStyles({ variant: 'secondary', size: 'sm' })}>
                    {event.type}
                  </span>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Bell className="h-3 w-3" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Coming Soon Overlay */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
        <Card className={cn(cardStyles({ variant: 'elevated', padding: 'xl' }), "text-center max-w-md")}>
          <div className="mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Calendar Integration
            </h3>
            <p className="text-muted-foreground mb-6">
              Unified calendar with time blocking and task integration coming soon.
            </p>
          </div>
          
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>Calendar layout design</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>Multiple view types</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <span>Google Calendar sync</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <span>Time blocking for tasks</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <span>Meeting scheduling</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <span>Recurring events</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}