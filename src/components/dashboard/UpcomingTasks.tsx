import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  title: string;
  deadline: string | null;
  is_completed: boolean;
}

interface UpcomingTasksProps {
  tasks: Task[];
  onToggle: (id: string, completed: boolean) => void;
}

export function UpcomingTasks({ tasks, onToggle }: UpcomingTasksProps) {
  const formatDeadline = (deadline: string | null) => {
    if (!deadline) return null;
    const date = new Date(deadline);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d');
  };

  const isOverdue = (deadline: string | null) => {
    if (!deadline) return false;
    return isPast(new Date(deadline)) && !isToday(new Date(deadline));
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-10 bg-secondary/20 rounded-2xl border border-dashed border-border">
        <div className="p-3 bg-white dark:bg-card rounded-xl shadow-sm w-fit mx-auto mb-3">
          <Circle className="h-6 w-6 text-brand-pink" />
        </div>
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Tasks all clear</p>
        <p className="text-xs text-muted-foreground mt-1 font-medium">Add a task to stay on top!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.slice(0, 5).map((task) => (
        <div
          key={task.id}
          className={cn(
            "flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group border border-transparent hover:border-brand-pink/20 hover:bg-card hover:shadow-lg hover:shadow-brand-pink/5",
            task.is_completed ? "bg-secondary/30 opacity-60" : "bg-secondary/50"
          )}
        >
          <button
            onClick={() => onToggle(task.id, !task.is_completed)}
            className="flex-shrink-0 transition-transform duration-300 hover:scale-110 active:scale-95"
          >
            {task.is_completed ? (
              <div className="p-1.5 bg-brand-green/20 text-brand-green rounded-lg">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            ) : (
              <div className="p-1.5 bg-white dark:bg-card text-muted-foreground group-hover:text-brand-pink group-hover:bg-brand-pink/10 rounded-lg shadow-sm">
                <Circle className="h-5 w-5" />
              </div>
            )}
          </button>
          <div className="flex-1 min-w-0">
            <p className={cn(
              "text-base font-bold tracking-tight truncate transition-all duration-300",
              task.is_completed ? "line-through text-muted-foreground" : "text-foreground group-hover:text-brand-pink"
            )}>
              {task.title}
            </p>
          </div>
          {task.deadline && (
            <span className={cn(
              "text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-colors",
              isOverdue(task.deadline) && !task.is_completed
                ? "bg-destructive/10 text-destructive"
                : "bg-white dark:bg-card text-muted-foreground group-hover:bg-brand-pink/10 group-hover:text-brand-pink"
            )}>
              <Clock className="h-3.5 w-3.5" />
              {formatDeadline(task.deadline)}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
