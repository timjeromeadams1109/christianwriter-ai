'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-foreground mb-2"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'w-full min-h-[120px] px-3 py-2 rounded-lg bg-background-elevated border border-border',
            'text-foreground placeholder:text-foreground-muted',
            'transition-all duration-200 resize-y',
            'focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent',
            'hover:border-accent/50',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-destructive focus:ring-destructive/30 focus:border-destructive',
            className
          )}
          {...props}
        />
        {hint && !error && (
          <p className="mt-1.5 text-xs text-foreground-muted">{hint}</p>
        )}
        {error && (
          <p className="mt-1.5 text-xs text-destructive">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
