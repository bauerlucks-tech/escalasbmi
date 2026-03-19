import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'subtle' | 'strong';
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, children, variant = 'default', ...props }, ref) => {
    const variantStyles = {
      default: 'bg-background/80 backdrop-blur-sm border-border/50',
      subtle: 'bg-background/60 backdrop-blur-xs border-border/30',
      strong: 'bg-background/90 backdrop-blur-md border-border/70',
    };

    return (
      <Card
        ref={ref}
        className={cn(
          'glass-card',
          variantStyles[variant],
          'shadow-sm hover:shadow-md transition-all duration-300',
          className
        )}
        {...props}
      >
        {children}
      </Card>
    );
  }
);

GlassCard.displayName = 'GlassCard';

export { GlassCard };
export default GlassCard;
