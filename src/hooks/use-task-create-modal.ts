"use client";

import { useState, useEffect, useCallback } from 'react';

interface UseTaskCreateModalProps {
  onCreateTask?: (task: any) => void;
}

export function useTaskCreateModal({ onCreateTask }: UseTaskCreateModalProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [prefilledDate, setPrefilledDate] = useState<Date | null>(null);
  const [modalTitle, setModalTitle] = useState('Add Task');

  // Handle keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        // Don't trigger if user is typing in an input/textarea
        const activeElement = document.activeElement;
        const isTyping = activeElement?.tagName === 'INPUT' || 
                        activeElement?.tagName === 'TEXTAREA' || 
                        (activeElement as HTMLElement)?.contentEditable === 'true';
        
        if (!isTyping) {
          event.preventDefault();
          openModal();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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