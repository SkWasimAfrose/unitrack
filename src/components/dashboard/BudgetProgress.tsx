import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface BudgetProgressProps {
  budget: number;
  spent: number;
  currency?: string;
}

export function BudgetProgress({ budget, spent, currency = '₹' }: BudgetProgressProps) {
  const percentage = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const remaining = budget - spent;
  const isOverBudget = remaining < 0;

  const getProgressColor = () => {
    if (percentage >= 90) return 'bg-destructive';
    if (percentage >= 75) return 'bg-warning';
    return 'bg-success';
  };

  if (budget === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <p className="text-sm">No budget set for this month</p>
        <p className="text-xs mt-1">Set a budget to track spending</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-sm text-muted-foreground">Spent</p>
          <p className="text-2xl font-display font-bold">
            {currency}{spent.toLocaleString()}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Budget</p>
          <p className="text-lg font-semibold">
            {currency}{budget.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Progress 
          value={percentage} 
          className="h-3 bg-muted"
          indicatorClassName={getProgressColor()}
        />
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">{percentage.toFixed(0)}% used</span>
          <span className={cn(
            "font-medium",
            isOverBudget ? "text-destructive" : "text-success"
          )}>
            {isOverBudget ? 'Over by ' : ''}{currency}{Math.abs(remaining).toLocaleString()} {isOverBudget ? '' : 'left'}
          </span>
        </div>
      </div>
    </div>
  );
}
