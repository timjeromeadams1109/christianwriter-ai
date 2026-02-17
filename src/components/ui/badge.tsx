import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'destructive';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-background-card text-foreground-muted border border-border',
    accent: 'bg-accent/10 text-accent border border-accent/20',
    success: 'bg-success/10 text-success border border-success/20',
    warning: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20',
    destructive: 'bg-destructive/10 text-destructive border border-destructive/20',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
