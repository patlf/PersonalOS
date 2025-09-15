'use client';

import { useState, useMemo } from 'react';

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { UnifiedTaskContainer } from './unified-task-container';
import { DroppableArea } from './droppable-area';
import { Task } from '@/lib/types';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SomedayColumnProps {
  tasks: Task[];
  onOpenCreateModal?: (date?: Date, title?: string) => void;
  onTaskClick: (task: Task) => void;
  onToggleComplete?: (taskId: string, completed: boolean) => void;
  isLoading?: boolean;
  className?: string;
}

export function SomedayColumn({
  tasks,
  onOpenCreateModal,
  onTaskClick,
  onToggleComplete,
  isLoading = false,
  className
}: SomedayColumnProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Separate overdue and someday tasks
  const { overdueTasks, somedayTasks } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdue: Task[] = [];
    const someday: Task[] = [];

    tasks.forEach(task => {
      if (task.status === 'completed') return; // Skip completed tasks

      if (task.scheduledDate && task.status !== 'someday') {
        const taskDate = new Date(task.scheduledDate);
        taskDate.setHours(0, 0, 0, 0);
        if (taskDate < today) {
          overdue.push(task);
        } else {
          someday.push(task);
        }
      } else {
        someday.push(task);
      }
    });

    return { overdueTasks: overdue, somedayTasks: someday };
  }, [tasks]);



  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  if (isCollapsed) {
    return (
      <div className={cn('w-12 border-r border-border bg-card/50 flex flex-col', className)}>
        <div className="p-3 border-b border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCollapse}
            className="w-full h-8 p-0"
          >
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="writing-mode-vertical text-sm font-medium text-muted-foreground transform rotate-180">
            Someday ({somedayTasks.length + overdueTasks.length})
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('w-80 border-r border-border bg-card/50 flex flex-col', className)}>
      {/* Header */}
      <div className="p-4 border-b border-border bg-card/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">Someday</h2>
            <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              {somedayTasks.length + overdueTasks.length}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {onOpenCreateModal && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenCreateModal(undefined, 'Add task to Someday')}
                className="h-8 w-8 p-0"
                title="Add task"
              >
                <Plus className="h-4 w-4 text-muted-foreground" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleCollapse}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-hidden relative">
        <div className="h-full flex flex-col space-y-4">


          {/* Task Lists */}
          <div className="flex-1 overflow-hidden flex flex-col space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-sm text-muted-foreground">Loading tasks...</div>
              </div>
            ) : (
              <>
                {/* Overdue Tasks Section */}
                {overdueTasks.length > 0 && (
                  <div className="flex-shrink-0">
                    <DroppableArea
                      id="overdue"
                      className="relative"
                      activeClassName="border-destructive/50 bg-destructive/5"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-destructive">Overdue</h3>
                        <span className="inline-flex items-center rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive border border-destructive/20">
                          {overdueTasks.length}
                        </span>
                      </div>
                      <UnifiedTaskContainer
                        containerId="overdue"
                        tasks={overdueTasks.sort((a, b) => {
                          // Sort by scheduled date (oldest first)
                          if (!a.scheduledDate || !b.scheduledDate) return 0;
                          return new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
                        })}
                        onTaskClick={onTaskClick}
                        onToggleComplete={onToggleComplete}
                        className="space-y-2"
                        emptyMessage="No overdue tasks"
                        enableSorting={false}
                        isOverdueContainer={true}
                      />
                    </DroppableArea>
                  </div>
                )}

                {/* Separator between Overdue and Someday */}
                {overdueTasks.length > 0 && somedayTasks.length > 0 && (
                  <div className="flex-shrink-0">
                    <Separator className="my-2" />
                  </div>
                )}

                {/* Someday Tasks Section */}
                <div className="flex-1 overflow-hidden">
                  <DroppableArea
                    id="someday"
                    className="h-full"
                  >
                    <div className="h-full flex flex-col">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-foreground">Someday</h3>
                        <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                          {somedayTasks.length}
                        </span>
                      </div>
                      
                      {/* Add Task Button for Someday */}
                      {onOpenCreateModal && (
                        <div className="mb-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onOpenCreateModal(undefined, 'Add task to Someday')}
                            className="w-full text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 h-8 px-2 border border-dashed border-muted-foreground/30 hover:border-muted-foreground/50 rounded-lg"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add task
                          </Button>
                        </div>
                      )}
                      <UnifiedTaskContainer
                        containerId="someday"
                        tasks={somedayTasks}
                        onTaskClick={onTaskClick}
                        onToggleComplete={onToggleComplete}
                        className="flex-1 overflow-y-auto pr-2 -mr-2"
                        emptyMessage="No tasks in Someday. Click the + button to add your first task!"
                        enableSorting={true}
                      />
                    </div>
                  </DroppableArea>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}