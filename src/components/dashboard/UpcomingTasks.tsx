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
      <div className="text-center py-8 text-muted-foreground">
        <Circle className="h-12 w-12 mx-auto mb-2 opacity-30" />
        <p className="text-sm">No upcoming tasks</p>
        <p className="text-xs mt-1">Add a task to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.slice(0, 5).map((task) => (
        <div
          key={task.id}
          className={cn(
            "flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group",
            task.is_completed ? "bg-muted/50" : "hover:bg-secondary"
          )}
        >
          <button
            onClick={() => onToggle(task.id, !task.is_completed)}
            className="flex-shrink-0"
          >
            {task.is_completed ? (
              <CheckCircle2 className="h-5 w-5 text-success" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            )}
          </button>
          <div className="flex-1 min-w-0">
            <p className={cn(
              "text-sm font-medium truncate",
              task.is_completed && "line-through text-muted-foreground"
            )}>
              {task.title}
            </p>
          </div>
          {task.deadline && (
            <span className={cn(
              "text-xs px-2 py-1 rounded-full flex items-center gap-1",
              isOverdue(task.deadline) && !task.is_completed
                ? "bg-destructive/10 text-destructive"
                : "bg-muted text-muted-foreground"
            )}>
              <Clock className="h-3 w-3" />
              {formatDeadline(task.deadline)}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
