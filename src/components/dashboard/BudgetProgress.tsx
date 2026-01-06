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
    if (percentage >= 90) return 'bg-destructive shadow-lg shadow-destructive/20';
    if (percentage >= 75) return 'bg-brand-yellow shadow-lg shadow-brand-yellow/20';
    return 'bg-brand-green shadow-lg shadow-brand-green/20';
  };

  if (budget === 0) {
    return (
      <div className="text-center py-10 bg-secondary/20 rounded-2xl border border-dashed border-border">
        <div className="p-3 bg-white dark:bg-card rounded-xl shadow-sm w-fit mx-auto mb-3">
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">No Budget</p>
        </div>
        <p className="text-xs text-muted-foreground font-medium">Set a budget in the expenses tab</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Spent</p>
          <p className="text-3xl font-display font-bold tracking-tight text-foreground">
            {currency}{spent.toLocaleString()}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Monthly Budget</p>
          <p className="text-xl font-bold bg-secondary/50 px-3 py-1 rounded-lg">
            {currency}{budget.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="relative pt-1">
          <Progress 
            value={percentage} 
            className="h-4 bg-secondary/50 rounded-full overflow-hidden"
            indicatorClassName={cn("transition-all duration-1000 ease-out rounded-full", getProgressColor())}
          />
        </div>
        <div className="flex justify-between items-center px-1">
          <div className="flex items-center gap-2">
            <div className={cn("h-2 w-2 rounded-full animate-pulse", getProgressColor())} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{percentage.toFixed(0)}% Utilized</span>
          </div>
          <span className={cn(
            "text-xs font-bold px-2.5 py-1 rounded-lg transition-colors capitalize",
            isOverBudget 
              ? "bg-destructive/10 text-destructive" 
              : "bg-brand-green/10 text-brand-green"
          )}>
            {isOverBudget ? 'Over budget by ' : 'Savings: '}{currency}{Math.abs(remaining).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
