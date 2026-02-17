'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2, ArrowRight } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  withArrow?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      withArrow = false,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed btn-press';

    const variants = {
      primary:
        'bg-accent text-white hover:bg-accent-hover shadow-sm hover:shadow-md active:scale-[0.98]',
      secondary:
        'bg-background-card text-foreground border border-border hover:bg-background-elevated hover:border-accent/30 active:scale-[0.98]',
      ghost:
        'text-foreground-muted hover:text-foreground hover:bg-background-card',
      destructive:
        'bg-destructive text-white hover:bg-destructive/90 shadow-sm active:scale-[0.98]',
      outline:
        'border border-border text-foreground hover:bg-background-card hover:border-accent/30 active:scale-[0.98]',
    };

    const sizes = {
      sm: 'h-8 px-3 text-sm gap-1.5',
      md: 'h-10 px-4 text-sm gap-2',
      lg: 'h-12 px-6 text-base gap-2',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
        {withArrow && !isLoading && (
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
