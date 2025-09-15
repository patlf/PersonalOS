'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CreateTaskInput } from '@/lib/types';
import { Plus, Clock, Tag, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { cardStyles, badgeStyles, formStyles, animationStyles } from '@/lib/component-styles';

interface TaskInputProps {
  onSubmit: (task: CreateTaskInput) => void;
  placeholder?: string;
  autoFocus?: boolean;
  compact?: boolean;
  className?: string;
}

export function TaskInput({ 
  onSubmit, 
  placeholder = "Add a task...", 
  autoFocus = false,
  compact = false,
  className 
}: TaskInputProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState(60);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;

    const task: CreateTaskInput = {
      title: title.trim(),
      description: description.trim() || undefined,
      estimatedDuration,
      priority,
      tags,
    };

    onSubmit(task);
    
    // Reset form but keep it expanded and focused for additional entries
    setTitle('');
    setDescription('');
    setEstimatedDuration(60);
    setPriority('medium');
    setTags([]);
    setTagInput('');
    
    // Keep focus on the input for continuous task entry
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as React.FormEvent);
    } else if (e.key === 'Escape') {
      setIsExpanded(false);
      setTitle('');
      setDescription('');
      setTags([]);
      setTagInput('');
    }
  };

  const handleCancel = () => {
    setIsExpanded(false);
    setTitle('');
    setDescription('');
    setTags([]);
    setTagInput('');
    setEstimatedDuration(60);
    setPriority('medium');
  };

  return (
    <div className={cn(formStyles.form, className)}>
      <form onSubmit={handleSubmit} className={formStyles.form}>
        <div className="relative">
          <Input
            ref={inputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={cn("pr-10", compact && "h-8 text-xs")}
            data-testid="task-input"
            aria-label="Task title input"
            aria-describedby={isExpanded ? "task-input-help" : undefined}
          />
          <Button
            type="submit"
            size="sm"
            variant="ghost"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
            disabled={!title.trim()}
            aria-label="Add task"
            title="Add task (Enter)"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {isExpanded && (
          <div 
            className={cn(
              cardStyles({ variant: 'default', padding: 'default' }),
              formStyles.form,
              animationStyles.fadeIn
            )}
            id="task-input-help"
            role="region"
            aria-label="Task details form"
          >
            <div className={formStyles.formGroup}>
              <Label htmlFor="description" className="text-sm font-medium">
                Description (optional)
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more details..."
                className="min-h-[60px] resize-none"
              />
            </div>

            <div className={formStyles.formGrid}>
              <div className={formStyles.formGroup}>
                <Label htmlFor="duration" className="text-sm font-medium flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Duration (minutes)
                </Label>
                <Input
                  id="duration"
                  type="number"
                  value={estimatedDuration}
                  onChange={(e) => setEstimatedDuration(Number(e.target.value))}
                  min="5"
                  step="5"
                />
              </div>

              <div className={formStyles.formGroup}>
                <Label htmlFor="priority" className="text-sm font-medium">
                  Priority
                </Label>
                <select
                  id="priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div className={formStyles.formGroup}>
              <Label htmlFor="tags" className="text-sm font-medium flex items-center gap-1">
                <Tag className="h-3 w-3" />
                Tags
              </Label>
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Type and press Enter to add tags"
              />
              {tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className={cn(badgeStyles({ variant: 'secondary', size: 'sm' }), "gap-1.5")}
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:opacity-70 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className={formStyles.formActionsInline}>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                size="sm" 
                disabled={!title.trim()}
              >
                Add Task
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}