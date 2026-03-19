import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'success' | 'warning' | 'destructive';
  className?: string;
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ 
    title, 
    value, 
    icon: Icon, 
    description, 
    trend, 
    variant = 'default',
    className,
    ...props 
  }, ref) => {
    const variantStyles = {
      default: 'text-foreground',
      success: 'text-success',
      warning: 'text-warning',
      destructive: 'text-destructive',
    };

    const iconBgStyles = {
      default: 'bg-primary/10',
      success: 'bg-success/10',
      warning: 'bg-warning/10',
      destructive: 'bg-destructive/10',
    };

    return (
      <Card
        ref={ref}
        className={cn(
          'glass-card border-border/50 hover:shadow-lg transition-all duration-300',
          className
        )}
        {...props}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={cn('w-12 h-12 rounded-full flex items-center justify-center', iconBgStyles[variant])}>
                <Icon className={cn('w-6 h-6', variantStyles[variant])} />
              </div>
              <div>
                <div className="text-3xl font-bold text-foreground">{value}</div>
                <div className="text-sm text-muted-foreground">{title}</div>
              </div>
            </div>
          </div>
          
          {trend && (
            <div className="flex items-center gap-2 text-sm">
              <span className={cn(
                trend.isPositive ? 'text-success' : 'text-destructive'
              )}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-muted-foreground">vs último mês</span>
            </div>
          )}
          
          {description && (
            <div className="text-xs text-muted-foreground mt-2">
              {description}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
);

StatCard.displayName = 'StatCard';

export { StatCard };
export default StatCard;
