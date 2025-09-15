"use client";

import * as React from "react";
import { Moon, Sun, Monitor, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";
import { animationStyles, interactiveStyles } from "@/lib/component-styles";

interface ThemeToggleProps {
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ 
  variant = "ghost", 
  size = "icon",
  className,
  showLabel = false
}: ThemeToggleProps) {
  const themeContext = useTheme();
  
  // Use context values with proper fallbacks
  const theme = themeContext?.theme || 'system';
  const setTheme = themeContext?.setTheme || (() => {});
  const resolvedTheme = themeContext?.resolvedTheme || 'light';
  const isChanging = themeContext?.isChanging || false;
  const isLoading = themeContext?.isLoading || false;

  const handleThemeChange = React.useCallback((newTheme: "light" | "dark" | "system") => {
    if (newTheme === theme || isChanging) return;
    setTheme(newTheme);
  }, [theme, setTheme, isChanging]);

  const getThemeIcon = React.useMemo(() => {
    if (isChanging || isLoading) {
      return (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent opacity-70" />
      );
    }
    
    return resolvedTheme === 'dark' ? (
      <Moon className="h-4 w-4 theme-toggle-icon transition-all duration-300 ease-in-out" />
    ) : (
      <Sun className="h-4 w-4 theme-toggle-icon transition-all duration-300 ease-in-out" />
    );
  }, [isChanging, isLoading, resolvedTheme]);

  const getThemeLabel = () => {
    switch (theme) {
      case 'light': return 'Light';
      case 'dark': return 'Dark';
      case 'system': return 'System';
      default: return 'Theme';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size}
          className={cn(
            animationStyles.scale,
            showLabel && "gap-2",
            (isChanging || isLoading) && "opacity-75 cursor-not-allowed pointer-events-none",
            className
          )}
          disabled={isChanging || isLoading}
          aria-label={`Current theme: ${getThemeLabel()}. Click to change theme.`}
        >
          {getThemeIcon}
          {showLabel && <span className="text-sm">{getThemeLabel()}</span>}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className={cn("min-w-[140px]", animationStyles.slideInDown)}
        sideOffset={4}
      >
        <DropdownMenuItem 
          onClick={() => handleThemeChange("light")}
          className={cn(
            interactiveStyles({ variant: 'ghost' }),
            "cursor-pointer flex items-center justify-between",
            theme === "light" && "bg-accent text-accent-foreground"
          )}
        >
          <div className="flex items-center">
            <Sun className="mr-2 h-4 w-4 transition-colors" />
            <span>Light</span>
          </div>
          {theme === "light" && <Check className={cn("h-4 w-4 text-primary", animationStyles.fadeIn)} />}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleThemeChange("dark")}
          className={cn(
            interactiveStyles({ variant: 'ghost' }),
            "cursor-pointer flex items-center justify-between",
            theme === "dark" && "bg-accent text-accent-foreground"
          )}
        >
          <div className="flex items-center">
            <Moon className="mr-2 h-4 w-4 transition-colors" />
            <span>Dark</span>
          </div>
          {theme === "dark" && <Check className={cn("h-4 w-4 text-primary", animationStyles.fadeIn)} />}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleThemeChange("system")}
          className={cn(
            interactiveStyles({ variant: 'ghost' }),
            "cursor-pointer flex items-center justify-between",
            theme === "system" && "bg-accent text-accent-foreground"
          )}
        >
          <div className="flex items-center">
            <Monitor className="mr-2 h-4 w-4 transition-colors" />
            <span>System</span>
          </div>
          {theme === "system" && <Check className={cn("h-4 w-4 text-primary", animationStyles.fadeIn)} />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}