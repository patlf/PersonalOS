'use client';

import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DropSuccessIndicatorProps {
  show: boolean;
  position: { x: number; y: number };
  onComplete?: () => void;
}

export function DropSuccessIndicator({ show, position, onComplete }: DropSuccessIndicatorProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed z-50 pointer-events-none"
      style={{
        left: position.x - 20,
        top: position.y - 20,
      }}
    >
      <div className={cn(
        "flex items-center justify-center w-10 h-10 rounded-full",
        "bg-green-500 text-white shadow-lg",
        "animate-in zoom-in-0 fade-in-0 duration-300",
        "animate-out zoom-out-95 fade-out-0 delay-1000 duration-500"
      )}>
        <Check className="w-5 h-5" />
      </div>
    </div>
  );
}