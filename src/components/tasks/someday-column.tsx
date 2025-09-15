'use client';

import { useState } from 'react';

import { Button } from "@/components/ui/button";
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
            Someday ({tasks.length})
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
              {tasks.length}
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
          {/* Add Task Button */}
          <div className="flex-shrink-0">
            {onOpenCreateModal && (
              <Button
                variant="outline"
                onClick={() => onOpenCreateModal(undefined, 'Add task to Someday')}
                className="w-full justify-start text-muted-foreground border-border hover:bg-muted rounded-xl h-12"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add a task to Someday...
              </Button>
            )}
          </div>
          
          {/* Task List */}
          <div className="flex-1 overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-sm text-muted-foreground">Loading tasks...</div>
              </div>
            ) : (
              <DroppableArea 
                id="someday"
                className="h-full"
              >
                <UnifiedTaskContainer
                  containerId="someday"
                  tasks={tasks}
                  onTaskClick={onTaskClick}
                  onToggleComplete={onToggleComplete}
                  className="h-full overflow-y-auto pr-2 -mr-2"
                  emptyMessage="No tasks in Someday. Click the + button to add your first task!"
                  enableSorting={true}
                />
              </DroppableArea>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}