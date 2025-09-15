'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface SmoothTransitionGroupProps {
  children: React.ReactNode;
  className?: string;
  itemClassName?: string;
  duration?: number;
}

export function SmoothTransitionGroup({
  children,
  className,
  itemClassName,
  duration = 300,
}: SmoothTransitionGroupProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const previousChildrenRef = useRef<React.ReactNode>(children);

  useEffect(() => {
    if (previousChildrenRef.current !== children) {
      setIsTransitioning(true);
      previousChildrenRef.current = children;
      
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [children, duration]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'transition-all ease-out',
        isTransitioning && 'transform-gpu will-change-transform',
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
      }}
    >
      {React.Children.map(children, (child, index) => (
        <div
          key={React.isValidElement(child) ? child.key || index : index}
          className={cn(
            'task-item transition-all ease-out',
            itemClassName
          )}
          style={{
            transitionDuration: `${duration}ms`,
            transitionDelay: `${index * 50}ms`,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}