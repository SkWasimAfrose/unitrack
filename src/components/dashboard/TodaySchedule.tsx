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
      <div className="text-center py-8 text-muted-foreground">
        <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-30" />
        <p className="text-sm">No study sessions today</p>
        <p className="text-xs mt-1">Enjoy your free day!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {schedules.map((schedule) => (
        <div
          key={schedule.id}
          className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50"
        >
          <div
            className="w-1 h-12 rounded-full"
            style={{ backgroundColor: schedule.subject?.color || '#6366f1' }}
          />
          <div className="flex-1">
            <p className="font-medium text-sm">
              {schedule.subject?.name || 'Unknown Subject'}
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <Clock className="h-3 w-3" />
              {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
