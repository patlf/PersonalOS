import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { TaskSearchFilter } from '../task-search-filter';
import { TaskFilters } from '@/lib/types';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';

const mockProps = {
  searchQuery: '',
  onSearchChange: vi.fn(),
  filters: {} as TaskFilters,
  onFiltersChange: vi.fn(),
  availableTags: ['work', 'personal', 'urgent'],
};

describe('TaskSearchFilter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders search input', () => {
    render(<TaskSearchFilter {...mockProps} />);

    expect(screen.getByPlaceholderText('Search tasks...')).toBeInTheDocument();
  });

  it('renders filter button', () => {
    render(<TaskSearchFilter {...mockProps} />);

    expect(screen.getByText('Filter')).toBeInTheDocument();
  });

  it('calls onSearchChange when typing in search input', async () => {
    const user = userEvent.setup();
    render(<TaskSearchFilter {...mockProps} />);

    const searchInput = screen.getByPlaceholderText('Search tasks...');
    await user.type(searchInput, 'test');

    // Check that onChange was called (userEvent calls it for each character)
    expect(mockProps.onSearchChange).toHaveBeenCalled();
    expect(mockProps.onSearchChange).toHaveBeenCalledTimes(4);
  });

  it('opens filter dropdown when filter button is clicked', async () => {
    const user = userEvent.setup();
    render(<TaskSearchFilter {...mockProps} />);

    const filterButton = screen.getByText('Filter');
    await user.click(filterButton);

    expect(screen.getByText('Filter by Status')).toBeInTheDocument();
    expect(screen.getByText('Filter by Priority')).toBeInTheDocument();
    expect(screen.getByText('Filter by Tags')).toBeInTheDocument();
  });

  it('shows status filter options', async () => {
    const user = userEvent.setup();
    render(<TaskSearchFilter {...mockProps} />);

    const filterButton = screen.getByText('Filter');
    await user.click(filterButton);

    expect(screen.getByText('Someday')).toBeInTheDocument();
    expect(screen.getByText('Scheduled')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('Overdue')).toBeInTheDocument();
  });

  it('shows priority filter options', async () => {
    const user = userEvent.setup();
    render(<TaskSearchFilter {...mockProps} />);

    const filterButton = screen.getByText('Filter');
    await user.click(filterButton);

    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('Low')).toBeInTheDocument();
  });

  it('shows available tags as filter options', async () => {
    const user = userEvent.setup();
    render(<TaskSearchFilter {...mockProps} />);

    const filterButton = screen.getByText('Filter');
    await user.click(filterButton);

    expect(screen.getByText('work')).toBeInTheDocument();
    expect(screen.getByText('personal')).toBeInTheDocument();
    expect(screen.getByText('urgent')).toBeInTheDocument();
  });

  it('calls onFiltersChange when status filter is selected', async () => {
    const user = userEvent.setup();
    render(<TaskSearchFilter {...mockProps} />);

    const filterButton = screen.getByText('Filter');
    await user.click(filterButton);

    const somedayCheckbox = screen.getByRole('menuitemcheckbox', { name: 'Someday' });
    await user.click(somedayCheckbox);

    expect(mockProps.onFiltersChange).toHaveBeenCalledWith({
      status: ['someday'],
    });
  });

  it('calls onFiltersChange when priority filter is selected', async () => {
    const user = userEvent.setup();
    render(<TaskSearchFilter {...mockProps} />);

    const filterButton = screen.getByText('Filter');
    await user.click(filterButton);

    const highCheckbox = screen.getByRole('menuitemcheckbox', { name: 'High' });
    await user.click(highCheckbox);

    expect(mockProps.onFiltersChange).toHaveBeenCalledWith({
      priority: ['high'],
    });
  });

  it('calls onFiltersChange when tag filter is selected', async () => {
    const user = userEvent.setup();
    render(<TaskSearchFilter {...mockProps} />);

    const filterButton = screen.getByText('Filter');
    await user.click(filterButton);

    const workCheckbox = screen.getByRole('menuitemcheckbox', { name: 'work' });
    await user.click(workCheckbox);

    expect(mockProps.onFiltersChange).toHaveBeenCalledWith({
      tags: ['work'],
    });
  });

  it('shows filter count badge when filters are active', () => {
    const filtersWithActive: TaskFilters = {
      status: ['someday', 'scheduled'],
      priority: ['high'],
    };

    render(<TaskSearchFilter {...mockProps} filters={filtersWithActive} />);

    expect(screen.getByText('3')).toBeInTheDocument(); // 2 status + 1 priority
  });

  it('shows clear button when filters or search are active', () => {
    render(<TaskSearchFilter {...mockProps} searchQuery="test" />);

    expect(screen.getByText('Clear')).toBeInTheDocument();
  });

  it('calls clear functions when clear button is clicked', async () => {
    const user = userEvent.setup();
    render(<TaskSearchFilter {...mockProps} searchQuery="test" />);

    const clearButton = screen.getByText('Clear');
    await user.click(clearButton);

    expect(mockProps.onSearchChange).toHaveBeenCalledWith('');
    expect(mockProps.onFiltersChange).toHaveBeenCalledWith({});
  });

  it('does not show clear button when no filters or search are active', () => {
    render(<TaskSearchFilter {...mockProps} />);

    expect(screen.queryByText('Clear')).not.toBeInTheDocument();
  });

  it('handles multiple status selections', async () => {
    const user = userEvent.setup();
    const filtersWithStatus: TaskFilters = { status: ['someday'] };
    
    render(<TaskSearchFilter {...mockProps} filters={filtersWithStatus} />);

    const filterButton = screen.getByText('Filter');
    await user.click(filterButton);

    const scheduledCheckbox = screen.getByRole('menuitemcheckbox', { name: 'Scheduled' });
    await user.click(scheduledCheckbox);

    expect(mockProps.onFiltersChange).toHaveBeenCalledWith({
      status: ['someday', 'scheduled'],
    });
  });

  it('removes filter when unchecking', async () => {
    const user = userEvent.setup();
    const filtersWithStatus: TaskFilters = { status: ['someday', 'scheduled'] };
    
    render(<TaskSearchFilter {...mockProps} filters={filtersWithStatus} />);

    const filterButton = screen.getByText('Filter');
    await user.click(filterButton);

    const somedayCheckbox = screen.getByRole('menuitemcheckbox', { name: 'Someday' });
    await user.click(somedayCheckbox);

    expect(mockProps.onFiltersChange).toHaveBeenCalledWith({
      status: ['scheduled'],
    });
  });
});