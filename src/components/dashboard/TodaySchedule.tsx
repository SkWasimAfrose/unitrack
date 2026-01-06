import { Clock, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScheduleItem {
  id: string;
  start_time: string;
  end_time: string;
  subject: {
    name: string;
    color: string;
  } | null;
}

interface TodayScheduleProps {
  schedules: ScheduleItem[];
}

export function TodaySchedule({ schedules }: TodayScheduleProps) {
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (schedules.length === 0) {
    return (
      <div className="text-center py-10 bg-secondary/20 rounded-2xl border border-dashed border-border">
        <div className="p-3 bg-white dark:bg-card rounded-xl shadow-sm w-fit mx-auto mb-3">
          <BookOpen className="h-6 w-6 text-brand-purple" />
        </div>
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">No sessions planned</p>
        <p className="text-xs text-muted-foreground mt-1 font-medium">Enjoy your free time!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {schedules.map((schedule) => (
        <div
          key={schedule.id}
          className="group flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/50 hover:border-brand-purple/30 hover:shadow-lg hover:shadow-brand-purple/5 transition-all duration-300"
        >
          <div
            className="w-1.5 h-12 rounded-full shadow-sm"
            style={{ backgroundColor: schedule.subject?.color || 'hsl(var(--brand-purple))' }}
          />
          <div className="flex-1">
            <p className="font-bold text-base tracking-tight group-hover:text-brand-purple transition-colors">
              {schedule.subject?.name || 'Unknown Subject'}
            </p>
            <div className="flex items-center gap-3 mt-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground bg-secondary/50 px-2 py-1 rounded-md">
                <Clock className="h-3.5 w-3.5" />
                {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
              </div>
            </div>
          </div>
          <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-secondary/30 text-muted-foreground group-hover:bg-brand-purple/10 group-hover:text-brand-purple transition-all duration-300">
            <BookOpen className="h-5 w-5" />
          </div>
        </div>
      ))}
    </div>
  );
}
