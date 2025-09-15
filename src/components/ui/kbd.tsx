import { cn } from "@/lib/utils";

interface KbdProps {
  children: React.ReactNode;
  className?: string;
}

export function Kbd({ children, className }: KbdProps) {
  return (
    <kbd className={cn(
      "inline-flex items-center gap-1 rounded-sm border bg-muted px-1.5 py-0.5 text-xs font-mono text-muted-foreground transition-colors group-hover:border-gray-400",
      className
    )}>
      {children}
    </kbd>
  );
}

interface KeyboardShortcutProps {
  keys: string[];
  className?: string;
}

export function KeyboardShortcut({ keys, className }: KeyboardShortcutProps) {
  // Filter out 'mod' keys since navigation shortcuts work without modifiers
  const filteredKeys = keys.filter(key => key !== 'mod');
  
  return (
    <Kbd className={className}>
      {filteredKeys.map((key, index) => (
        <span key={index}>
          {key}
          {index < filteredKeys.length - 1 && <span className="mx-0.5">+</span>}
        </span>
      ))}
    </Kbd>
  );
}