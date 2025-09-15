'use client';

import React from 'react';
import { Task } from '@/lib/types';
import { TaskCard } from './task-card';
import { cn } from '@/lib/utils';

interface DragOverlayProps {
  task: Task;
  className?: string;
}

export function DragOverlay({ task, className }: DragOverlayProps) {
  return (
    <div 
      className={cn(
        "transform-gpu will-change-transform",
        "opacity-95 transition-all duration-300 ease-out",
        className
      )}
      style={{
        filter: 'drop-shadow(0 25px 25px rgb(0 0 0 / 0.15))',
      }}
    >
      <TaskCard
        task={task}
        className={cn(
          // Enhanced shadow and glow effect
          "shadow-2xl shadow-blue-500/20",
          "ring-2 ring-blue-400/60 border-blue-400/40",
          
          // Glass morphism effect
          "bg-background/98 backdrop-blur-xl",
          "border-2 border-white/20 dark:border-white/10",
          
          // Smooth scaling and rotation
          "scale-[1.08] rotate-[3deg]",
          "transition-all duration-300 ease-out",
          
          // Subtle glow animation
          "animate-pulse-glow",
          
          // Prevent text selection during drag
          "select-none pointer-events-none"
        )}
        draggable={false}
      />
      
      {/* Animated trailing effect */}
      <div 
        className={cn(
          "absolute inset-0 -z-10",
          "bg-gradient-to-br from-blue-400/20 to-purple-400/20",
          "rounded-lg blur-xl scale-110",
          "animate-pulse opacity-60"
        )}
      />
    </div>
  );
}