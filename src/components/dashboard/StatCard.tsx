import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: {
    value: number;
    positive: boolean;
  };
  variant?: 'purple' | 'pink' | 'yellow' | 'green' | 'blue';
  className?: string;
}

export function StatCard({ title, value, subtitle, icon, trend, variant = 'purple', className }: StatCardProps) {
  const variants = {
    purple: "border-brand-purple/20 bg-brand-purple/5 text-brand-purple",
    pink: "border-brand-pink/20 bg-brand-pink/5 text-brand-pink",
    yellow: "border-brand-yellow/20 bg-brand-yellow/5 text-brand-yellow",
    green: "border-brand-green/20 bg-brand-green/5 text-brand-green",
    blue: "border-brand-blue/20 bg-brand-blue/5 text-brand-blue",
  };

  const iconVariants = {
    purple: "bg-brand-purple/20 text-brand-purple",
    pink: "bg-brand-pink/20 text-brand-pink",
    yellow: "bg-brand-yellow/20 text-brand-yellow",
    green: "bg-brand-green/20 text-brand-green",
    blue: "bg-brand-blue/20 text-brand-blue",
  };

  const borderTopVariants = {
    purple: "bg-brand-purple",
    pink: "bg-brand-pink",
    yellow: "bg-brand-yellow",
    green: "bg-brand-green",
    blue: "bg-brand-blue",
  };

  return (
    <div className={cn(
      "relative bg-card rounded-2xl p-5 border border-border shadow-sm hover-lift animate-fade-in overflow-hidden group",
      className
    )}>
      <div className={cn("absolute top-0 left-0 right-0 h-1.5", borderTopVariants[variant])} />
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
          <p className="text-2xl font-display font-bold mt-1 group-hover:scale-105 transition-transform origin-left duration-300">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1 font-medium">{subtitle}</p>
          )}
          {trend && (
            <p className={cn(
              "text-xs font-semibold mt-2 px-2 py-1 rounded-full w-fit",
              trend.positive ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400"
            )}>
              {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        <div className={cn("p-3 rounded-xl transition-colors duration-300", iconVariants[variant])}>
          {icon}
        </div>
      </div>
    </div>
  );
}
