import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useTaskCreateModal } from '../use-task-create-modal';

describe('useTaskCreateModal', () => {
  const mockOnCreateTask = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with correct default values', () => {
    const { result } = renderHook(() => useTaskCreateModal());
    
    expect(result.current.isOpen).toBe(false);
    expect(result.current.prefilledDate).toBe(null);
    expect(result.current.modalTitle).toBe('Add Task');
  });

  it('opens modal with default values', () => {
    const { result } = renderHook(() => useTaskCreateModal());
    
    act(() => {
      result.current.openModal();
    });
    
    expect(result.current.isOpen).toBe(true);
    expect(result.current.prefilledDate).toBe(null);
    expect(result.current.modalTitle).toBe('Add Task');
  });

  it('opens modal with custom date and title', () => {
    const { result } = renderHook(() => useTaskCreateModal());
    const testDate = new Date('2024-01-15');
    
    act(() => {
      result.current.openModal(testDate, 'Custom Title');
    });
    
    expect(result.current.isOpen).toBe(true);
    expect(result.current.prefilledDate).toBe(testDate);
    expect(result.current.modalTitle).toBe('Custom Title');
  });

  it('closes modal and resets values', () => {
    const { result } = renderHook(() => useTaskCreateModal());
    const testDate = new Date('2024-01-15');
    
    // Open modal first
    act(() => {
      result.current.openModal(testDate, 'Custom Title');
    });
    
    // Then close it
    act(() => {
      result.current.closeModal();
    });
    
    expect(result.current.isOpen).toBe(false);
    expect(result.current.prefilledDate).toBe(null);
    expect(result.current.modalTitle).toBe('Add Task');
  });

  it('calls onCreateTask when handleSubmit is called', async () => {
    const { result } = renderHook(() => useTaskCreateModal({ onCreateTask: mockOnCreateTask }));
    
    const taskData = {
      title: 'Test Task',
      estimatedDuration: 30,
      scheduledDate: null,
      status: 'someday' as const,
      priority: 'medium' as const,
      tags: [],
    };
    
    await act(async () => {
      await result.current.handleSubmit(taskData);
    });
    
    expect(mockOnCreateTask).toHaveBeenCalledWith(taskData);
  });

  it('handles keyboard shortcut Cmd+K', () => {
    const { result } = renderHook(() => useTaskCreateModal());
    
    // Simulate Cmd+K keydown
    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'k',
        metaKey: true,
      });
      window.dispatchEvent(event);
    });
    
    expect(result.current.isOpen).toBe(true);
  });

  it('handles keyboard shortcut Ctrl+K', () => {
    const { result } = renderHook(() => useTaskCreateModal());
    
    // Simulate Ctrl+K keydown
    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'k',
        ctrlKey: true,
      });
      window.dispatchEvent(event);
    });
    
    expect(result.current.isOpen).toBe(true);
  });

  it('ignores keyboard shortcut when typing in input', () => {
    const { result } = renderHook(() => useTaskCreateModal());
    
    // Create a mock input element and focus it
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();
    
    // Simulate Cmd+K keydown while input is focused
    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'k',
        metaKey: true,
      });
      window.dispatchEvent(event);
    });
    
    expect(result.current.isOpen).toBe(false);
    
    // Cleanup
    document.body.removeChild(input);
  });
});