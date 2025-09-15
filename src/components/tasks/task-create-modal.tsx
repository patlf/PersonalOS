"use client";

import { useState, useEffect } from 'react';
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Plus } from 'lucide-react';
import { CreateTaskInput } from '@/lib/types';
import { cn } from '@/lib/utils';

interface TaskCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: CreateTaskInput) => void;
  prefilledDate?: Date | null;
  title?: string;
}

export function TaskCreateModal({
  isOpen,
  onClose,
  onSubmit,
  prefilledDate,
  title = "Add Task"
}: TaskCreateModalProps) {
  const [taskTitle, setTaskTitle] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [duration, setDuration] = useState<string>('30');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setTaskTitle('');
      setDuration('30');
      
      // Set prefilled date if provided, otherwise default to someday if title suggests it
      if (prefilledDate) {
        // Use local date string to avoid timezone issues
        const year = prefilledDate.getFullYear();
        const month = String(prefilledDate.getMonth() + 1).padStart(2, '0');
        const day = String(prefilledDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        setSelectedDate(dateStr);
      } else if (title?.toLowerCase().includes('someday')) {
        setSelectedDate('someday');
      } else {
        setSelectedDate('');
      }
    }
  }, [isOpen, prefilledDate, title]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!taskTitle.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      const taskData: CreateTaskInput = {
        title: taskTitle.trim(),
        estimatedDuration: parseInt(duration),
        scheduledDate: selectedDate === 'someday' ? undefined : (selectedDate ? new Date(selectedDate) : undefined),
        status: selectedDate === 'someday' ? 'someday' : 'scheduled',
        priority: 'medium',
        tags: [],
      };

      await onSubmit(taskData);
      onClose();
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateForDisplay = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getDateOptions = () => {
    const options = [];
    const today = new Date();
    
    // Add next 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      // Use local date string to avoid timezone issues
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      options.push({
        value: dateStr,
        label: formatDateForDisplay(date)
      });
    }
    
    // If prefilledDate is provided and not already in the options, add it
    if (prefilledDate) {
      const year = prefilledDate.getFullYear();
      const month = String(prefilledDate.getMonth() + 1).padStart(2, '0');
      const day = String(prefilledDate.getDate()).padStart(2, '0');
      const prefilledDateStr = `${year}-${month}-${day}`;
      
      const alreadyExists = options.some(option => option.value === prefilledDateStr);
      if (!alreadyExists) {
        // Insert the prefilled date in chronological order
        const prefilledOption = {
          value: prefilledDateStr,
          label: formatDateForDisplay(prefilledDate)
        };
        
        // Find the correct position to insert
        let insertIndex = options.length;
        for (let i = 0; i < options.length; i++) {
          if (prefilledDate < new Date(options[i].value + 'T00:00:00')) {
            insertIndex = i;
            break;
          }
        }
        options.splice(insertIndex, 0, prefilledOption);
      }
    }
    
    // Add "Someday" option
    options.push({
      value: 'someday',
      label: 'Someday'
    });
    
    return options;
  };

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={onClose}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Content
          className="fixed left-[50%] top-[20%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-20%] border-0 shadow-2xl bg-white dark:bg-gray-900 rounded-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          <div className="p-6">
            <div className="pb-4 flex items-center justify-between">
              <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {title}
              </h2>
              <DialogPrimitive.Close className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                <Plus className="h-4 w-4 rotate-45 text-gray-400 hover:text-gray-600" />
                <span className="sr-only">Close</span>
              </DialogPrimitive.Close>
            </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Task Title */}
            <div>
              <Input
                id="task-title"
                placeholder="Task description..."
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                autoFocus
                className="text-base border-0 border-b border-gray-200 dark:border-gray-700 rounded-none px-0 py-3 focus-visible:ring-0 focus-visible:border-blue-500 bg-transparent placeholder:text-gray-400"
              />
            </div>

            {/* TIP and Options Row */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded font-medium">TIP</span>
                <span className="text-sm text-gray-500">Paste a URL</span>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Date Selection */}
                <Select value={selectedDate} onValueChange={setSelectedDate}>
                  <SelectTrigger className="w-auto border-0 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 h-8 px-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <SelectValue placeholder="Select date" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {getDateOptions().map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Duration */}
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger className="w-auto border-0 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 h-8 px-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 min</SelectItem>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="45">45 min</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                    <SelectItem value="180">3 hours</SelectItem>
                    <SelectItem value="240">4 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={isSubmitting}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!taskTitle.trim() || isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white min-w-[80px]"
              >
                {isSubmitting ? 'Adding...' : 'Add Task'}
              </Button>
            </div>
          </form>
        </div>
      </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}