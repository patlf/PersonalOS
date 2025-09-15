"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Plus, X, Trash2, Copy, Archive, Check } from 'lucide-react';
import { Task, CreateTaskInput, UpdateTaskInput } from '@/lib/types';
import { cn } from '@/lib/utils';
import { badgeStyles } from '@/lib/component-styles';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null; // If provided, we're editing; if null/undefined, we're creating
  onSubmit?: (task: CreateTaskInput) => void; // For creating
  onSave?: (taskId: string, updates: Partial<UpdateTaskInput>) => Promise<void>; // For editing
  onToggleComplete?: (taskId: string, completed: boolean) => void;
  onDuplicate?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  onSendToSomeday?: (task: Task) => void;
  prefilledDate?: Date | null;
  title?: string;
  isLoading?: boolean;
}

export function TaskModal({
  isOpen,
  onClose,
  task,
  onSubmit,
  onSave,
  onToggleComplete,
  onDuplicate,
  onDelete,
  onSendToSomeday,
  prefilledDate,
  title,
  isLoading = false,
}: TaskModalProps) {
  const isEditing = !!task;
  const modalTitle = title || (isEditing ? "Edit Task" : "Add Task");
  const isCompleted = task?.status === 'completed';
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    estimatedDuration: 30,
    priority: 'medium' as Task['priority'],
    status: 'scheduled' as Task['status'],
    tags: [] as string[],
    scheduledDate: null as Date | null,
    scheduledTime: '',
  });
  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes or task changes
  useEffect(() => {
    if (isOpen) {
      if (isEditing && task) {
        // Editing mode - populate with task data
        setFormData({
          title: task.title,
          description: task.description || '',
          estimatedDuration: task.estimatedDuration,
          priority: task.priority,
          status: task.status,
          tags: [...task.tags],
          scheduledDate: task.scheduledDate || null,
          scheduledTime: task.scheduledTime || '',
        });
      } else {
        // Creating mode - reset to defaults
        setFormData({
          title: '',
          description: '',
          estimatedDuration: 30,
          priority: 'medium',
          status: 'scheduled',
          tags: [],
          scheduledDate: prefilledDate || null,
          scheduledTime: '',
        });
        
        // Set default status based on title or prefilled date
        if (title?.toLowerCase().includes('someday')) {
          setFormData(prev => ({ ...prev, status: 'someday', scheduledDate: null }));
        }
      }
      setNewTag('');
    }
  }, [isOpen, task, isEditing, prefilledDate, title]);

  // Update form data when task changes (including completion status changes)
  useEffect(() => {
    if (isEditing && task && isOpen) {
      setFormData(prev => ({
        ...prev,
        status: task.status,
        scheduledDate: task.scheduledDate || null,
        scheduledTime: task.scheduledTime || '',
      }));
    }
  }, [task?.status, task?.scheduledDate, task?.scheduledTime, isEditing, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      if (isEditing && task && onSave) {
        // Editing existing task - only update fields that should be editable in the form
        // Don't override completion status or scheduled date if they were changed via completion toggle
        const updates: Partial<UpdateTaskInput> = {
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          estimatedDuration: formData.estimatedDuration,
          priority: formData.priority,
          tags: formData.tags,
        };

        // Only update status and scheduling if the task isn't completed or if we're changing from someday
        if (task.status !== 'completed') {
          updates.status = formData.status;
          updates.scheduledDate = formData.scheduledDate || undefined;
          updates.scheduledTime = formData.scheduledTime || undefined;
        } else {
          // For completed tasks, preserve their completion status and current scheduling
          // but allow updating the scheduled time if it's set in the form
          if (formData.scheduledTime) {
            updates.scheduledTime = formData.scheduledTime;
          }
        }

        await onSave(task.id, updates);
      } else if (!isEditing && onSubmit) {
        // Creating new task
        const taskData: CreateTaskInput = {
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          estimatedDuration: formData.estimatedDuration,
          scheduledDate: formData.status === 'someday' ? undefined : formData.scheduledDate || undefined,
          status: formData.status,
          priority: formData.priority,
          tags: formData.tags,
        };
        onSubmit(taskData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTag = () => {
    const tag = newTag.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.target === e.currentTarget) {
      e.preventDefault();
      handleAddTag();
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
      options.push({
        value: date.toISOString().split('T')[0],
        label: formatDateForDisplay(date),
        date: date
      });
    }
    
    // If we have a scheduled date that's not in the options, add it
    if (formData.scheduledDate) {
      const scheduledDateStr = formData.scheduledDate.toISOString().split('T')[0];
      const alreadyExists = options.some(option => option.value === scheduledDateStr);
      if (!alreadyExists) {
        const scheduledOption = {
          value: scheduledDateStr,
          label: formatDateForDisplay(formData.scheduledDate),
          date: formData.scheduledDate
        };
        
        // Insert in chronological order
        let insertIndex = options.length;
        for (let i = 0; i < options.length; i++) {
          if (formData.scheduledDate < options[i].date) {
            insertIndex = i;
            break;
          }
        }
        options.splice(insertIndex, 0, scheduledOption);
      }
    }
    
    return options;
  };

  const handleDateChange = (value: string) => {
    if (value === 'someday') {
      setFormData(prev => ({ 
        ...prev, 
        status: 'someday', 
        scheduledDate: null 
      }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        status: 'scheduled', 
        scheduledDate: new Date(value) 
      }));
    }
  };

  const getSelectedDateValue = () => {
    if (formData.status === 'someday') return 'someday';
    if (formData.scheduledDate) return formData.scheduledDate.toISOString().split('T')[0];
    return '';
  };

  const handleToggleCompleteClick = () => {
    if (task && onToggleComplete) {
      onToggleComplete(task.id, !isCompleted);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          "border-0 shadow-2xl bg-white dark:bg-gray-900 rounded-lg top-[20%] translate-y-[-20%] p-6",
          isEditing ? "max-w-2xl" : "max-w-lg"
        )}
      >
        <DialogHeader className="pb-4 flex-row items-center justify-between space-y-0">
          <DialogTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {modalTitle}
          </DialogTitle>
        </DialogHeader>
          
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Task Title with Completion Toggle */}
              <div className="flex items-start gap-3">
                {/* Completion Toggle - only show in edit mode */}
                {isEditing && task && onToggleComplete && (
                  <button
                    type="button"
                    onClick={handleToggleCompleteClick}
                    className={cn(
                      "flex-shrink-0 mt-3 w-5 h-5 rounded-full border-2 transition-all duration-200 hover:scale-110",
                      "flex items-center justify-center",
                      isCompleted 
                        ? "bg-green-500 border-green-500 text-white hover:bg-green-600" 
                        : "border-gray-300 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-950 dark:border-gray-600"
                    )}
                    title={isCompleted ? "Mark as incomplete" : "Mark as complete"}
                  >
                    {isCompleted && <Check className="w-3 h-3" />}
                  </button>
                )}
                
                <div className="flex-1">
                  <Input
                    id="task-title"
                    placeholder={isEditing ? "Task title" : "Task description..."}
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    autoFocus
                    className={cn(
                      "text-base border-0 border-b border-gray-200 dark:border-gray-700 rounded-none px-0 py-3 focus-visible:ring-0 focus-visible:border-blue-500 bg-transparent placeholder:text-gray-400",
                      isCompleted && "text-gray-500 dark:text-gray-400"
                    )}
                  />
                </div>
              </div>

              {/* Description - only show in edit mode */}
              {isEditing && (
                <div>
                  <Label htmlFor="description" className="text-sm text-gray-600 dark:text-gray-400">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Task description (optional)"
                    rows={3}
                    className="mt-2 border border-gray-200 dark:border-gray-700 rounded-md"
                  />
                </div>
              )}

              {/* Options Row */}
              <div className={cn(
                "flex items-center pt-2",
                isEditing ? "justify-start gap-4 flex-wrap" : "justify-between"
              )}>
                {!isEditing && (
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded font-medium">TIP</span>
                    <span className="text-sm text-gray-500">Paste a URL</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Date Selection */}
                  <div className="flex flex-col gap-1">
                    {isEditing && <Label className="text-xs text-gray-600 dark:text-gray-400">When</Label>}
                    <Select value={getSelectedDateValue()} onValueChange={handleDateChange}>
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
                        <SelectItem value="someday">Someday</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Duration */}
                  <div className="flex flex-col gap-1">
                    {isEditing && <Label className="text-xs text-gray-600 dark:text-gray-400">Duration</Label>}
                    <Select 
                      value={formData.estimatedDuration.toString()} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, estimatedDuration: parseInt(value) }))}
                    >
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

                  {/* Priority - only show in edit mode */}
                  {isEditing && (
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs text-gray-600 dark:text-gray-400">Priority</Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(value: Task['priority']) => 
                          setFormData(prev => ({ ...prev, priority: value }))
                        }
                      >
                        <SelectTrigger className="w-auto border-0 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 h-8 px-3 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>

              {/* Tags - only show in edit mode */}
              {isEditing && (
                <div>
                  <Label className="text-sm text-gray-600 dark:text-gray-400">Tags</Label>
                  <div className="flex flex-wrap gap-2 mb-2 mt-2">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className={cn(badgeStyles({ variant: 'secondary', size: 'sm' }), "gap-1")}
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:opacity-70 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Add a tag"
                      className="flex-1 h-8 text-sm"
                    />
                    <Button type="button" onClick={handleAddTag} variant="outline" size="sm">
                      Add
                    </Button>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-between items-center pt-4">
                {/* Task Actions - only show in edit mode */}
                {isEditing && task && (
                  <div className="flex items-center gap-2">
                    {onDuplicate && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onDuplicate(task)}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Duplicate
                      </Button>
                    )}
                    {onSendToSomeday && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onSendToSomeday(task)}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        <Archive className="h-4 w-4 mr-1" />
                        Someday
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(task)}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    )}
                  </div>
                )}

                {/* Submit Actions */}
                <div className="flex gap-2 ml-auto">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onClose}
                    disabled={isSubmitting || isLoading}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!formData.title.trim() || isSubmitting || isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white min-w-[80px]"
                  >
                    {isSubmitting || isLoading 
                      ? (isEditing ? 'Saving...' : 'Adding...') 
                      : (isEditing ? 'Save Changes' : 'Add Task')
                    }
                  </Button>
                </div>
              </div>
            </form>
      </DialogContent>
    </Dialog>
  );
}