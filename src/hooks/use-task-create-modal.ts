"use client";

import { useState, useEffect, useCallback } from 'react';

interface UseTaskCreateModalProps {
  onCreateTask?: (task: any) => void;
}

export function useTaskCreateModal({ onCreateTask }: UseTaskCreateModalProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [prefilledDate, setPrefilledDate] = useState<Date | null>(null);
  const [modalTitle, setModalTitle] = useState('Add Task');

  // Note: Keyboard shortcut handling is now managed by useKeyboardShortcuts hook
  // to avoid conflicts and ensure consistent behavior across the app

  const openModal = useCallback((date?: Date, title?: string) => {
    setPrefilledDate(date || null);
    setModalTitle(title || 'Add Task');
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setPrefilledDate(null);
    setModalTitle('Add Task');
  }, []);

  const handleSubmit = useCallback(async (taskData: any) => {
    if (onCreateTask) {
      await onCreateTask(taskData);
    }
  }, [onCreateTask]);

  return {
    isOpen,
    prefilledDate,
    modalTitle,
    openModal,
    closeModal,
    handleSubmit,
  };
}