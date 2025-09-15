'use client';

import { useState, useMemo } from 'react';
import { Task, TaskFilters } from '@/lib/types';
import { debounce } from '@/lib/performance';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X } from 'lucide-react';

interface TaskSearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
  availableTags: string[];
  className?: string;
}

export function TaskSearchFilter({
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
  availableTags,
  className,
}: TaskSearchFilterProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Debounce search input to improve performance
  const debouncedSearchChange = useMemo(
    () => debounce(onSearchChange, 300),
    [onSearchChange]
  );

  const handleStatusFilter = (status: Task['status'], checked: boolean) => {
    const currentStatuses = filters.status || [];
    const newStatuses = checked
      ? [...currentStatuses, status]
      : currentStatuses.filter(s => s !== status);
    
    onFiltersChange({
      ...filters,
      status: newStatuses.length > 0 ? newStatuses : undefined,
    });
  };

  const handlePriorityFilter = (priority: Task['priority'], checked: boolean) => {
    const currentPriorities = filters.priority || [];
    const newPriorities = checked
      ? [...currentPriorities, priority]
      : currentPriorities.filter(p => p !== priority);
    
    onFiltersChange({
      ...filters,
      priority: newPriorities.length > 0 ? newPriorities : undefined,
    });
  };

  const handleTagFilter = (tag: string, checked: boolean) => {
    const currentTags = filters.tags || [];
    const newTags = checked
      ? [...currentTags, tag]
      : currentTags.filter(t => t !== tag);
    
    onFiltersChange({
      ...filters,
      tags: newTags.length > 0 ? newTags : undefined,
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({});
    onSearchChange('');
  };

  const hasActiveFilters = searchQuery || 
    (filters.status && filters.status.length > 0) ||
    (filters.priority && filters.priority.length > 0) ||
    (filters.tags && filters.tags.length > 0);

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.status?.length) count += filters.status.length;
    if (filters.priority?.length) count += filters.priority.length;
    if (filters.tags?.length) count += filters.tags.length;
    return count;
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Search Input */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tasks... (Ctrl/Cmd + /)"
          value={searchQuery}
          onChange={(e) => {
            // Update local state immediately for responsive UI
            onSearchChange(e.target.value);
            // Debounce the actual search operation
            debouncedSearchChange(e.target.value);
          }}
          className="pl-10"
          data-testid="task-search-input"
        />
      </div>

      {/* Filter Dropdown */}
      <DropdownMenu open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="relative">
            <Filter className="h-4 w-4 mr-2" />
            Filter
            {getActiveFilterCount() > 0 && (
              <Badge 
                variant="secondary" 
                className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {getActiveFilterCount()}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
          <DropdownMenuCheckboxItem
            checked={filters.status?.includes('someday') || false}
            onCheckedChange={(checked) => handleStatusFilter('someday', checked)}
          >
            Someday
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={filters.status?.includes('scheduled') || false}
            onCheckedChange={(checked) => handleStatusFilter('scheduled', checked)}
          >
            Scheduled
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={filters.status?.includes('completed') || false}
            onCheckedChange={(checked) => handleStatusFilter('completed', checked)}
          >
            Completed
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={filters.status?.includes('overdue') || false}
            onCheckedChange={(checked) => handleStatusFilter('overdue', checked)}
          >
            Overdue
          </DropdownMenuCheckboxItem>

          <DropdownMenuSeparator />
          
          <DropdownMenuLabel>Filter by Priority</DropdownMenuLabel>
          <DropdownMenuCheckboxItem
            checked={filters.priority?.includes('high') || false}
            onCheckedChange={(checked) => handlePriorityFilter('high', checked)}
          >
            High
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={filters.priority?.includes('medium') || false}
            onCheckedChange={(checked) => handlePriorityFilter('medium', checked)}
          >
            Medium
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={filters.priority?.includes('low') || false}
            onCheckedChange={(checked) => handlePriorityFilter('low', checked)}
          >
            Low
          </DropdownMenuCheckboxItem>

          {availableTags.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Filter by Tags</DropdownMenuLabel>
              {availableTags.slice(0, 8).map((tag) => (
                <DropdownMenuCheckboxItem
                  key={tag}
                  checked={filters.tags?.includes(tag) || false}
                  onCheckedChange={(checked) => handleTagFilter(tag, checked)}
                >
                  {tag}
                </DropdownMenuCheckboxItem>
              ))}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAllFilters}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}