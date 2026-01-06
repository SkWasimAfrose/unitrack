import { useEffect, useState } from 'react';
import { Plus, Trash2, Clock, Palette } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Subject {
  id: string;
  name: string;
  color: string;
}

interface Schedule {
  id: string;
  subject_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  subjects: Subject | null;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6'];

export default function DayPlanner() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  // New subject form
  const [newSubject, setNewSubject] = useState('');
  const [newSubjectColor, setNewSubjectColor] = useState(COLORS[0]);
  const [subjectDialogOpen, setSubjectDialogOpen] = useState(false);

  // New schedule form
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDay, setSelectedDay] = useState('1');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [subjectsRes, schedulesRes] = await Promise.all([
        supabase.from('subjects').select('*').eq('user_id', user!.id).order('name'),
        supabase.from('study_schedules').select('*, subjects(*)').eq('user_id', user!.id).order('start_time')
      ]);

      setSubjects(subjectsRes.data || []);
      setSchedules(schedulesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSubject = async () => {
    if (!newSubject.trim()) return;

    try {
      const { data, error } = await supabase
        .from('subjects')
        .insert({ user_id: user!.id, name: newSubject, color: newSubjectColor })
        .select()
        .single();

      if (error) throw error;

      setSubjects(prev => [...prev, data]);
      setNewSubject('');
      setNewSubjectColor(COLORS[0]);
      setSubjectDialogOpen(false);
      toast({ title: "Subject added! 📚" });
    } catch (error) {
      toast({ title: "Failed to add subject", variant: "destructive" });
    }
  };

  const deleteSubject = async (id: string) => {
    try {
      await supabase.from('subjects').delete().eq('id', id);
      setSubjects(prev => prev.filter(s => s.id !== id));
      setSchedules(prev => prev.filter(s => s.subject_id !== id));
      toast({ title: "Subject deleted" });
    } catch (error) {
      toast({ title: "Failed to delete subject", variant: "destructive" });
    }
  };

  const addSchedule = async () => {
    if (!selectedSubject) return;

    try {
      const { data, error } = await supabase
        .from('study_schedules')
        .insert({
          user_id: user!.id,
          subject_id: selectedSubject,
          day_of_week: parseInt(selectedDay),
          start_time: startTime,
          end_time: endTime
        })
        .select('*, subjects(*)')
        .single();

      if (error) throw error;

      setSchedules(prev => [...prev, data]);
      setScheduleDialogOpen(false);
      setSelectedSubject('');
      toast({ title: "Schedule added! 📅" });
    } catch (error) {
      toast({ title: "Failed to add schedule", variant: "destructive" });
    }
  };

  const deleteSchedule = async (id: string) => {
    try {
      await supabase.from('study_schedules').delete().eq('id', id);
      setSchedules(prev => prev.filter(s => s.id !== id));
      toast({ title: "Schedule deleted" });
    } catch (error) {
      toast({ title: "Failed to delete schedule", variant: "destructive" });
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getSchedulesForDay = (dayIndex: number) => {
    return schedules.filter(s => s.day_of_week === dayIndex).sort((a, b) => a.start_time.localeCompare(b.start_time));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold">Day Planner</h1>
          <p className="text-muted-foreground mt-1">Organize your daily schedule</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={subjectDialogOpen} onOpenChange={setSubjectDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Palette className="h-4 w-4" />
                Add Subject
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95%] sm:max-w-md rounded-xl">
              <DialogHeader>
                <DialogTitle>Add New Subject</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Subject Name</Label>
                  <Input
                    placeholder="e.g., Mathematics"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="flex flex-wrap gap-2">
                    {COLORS.map(color => (
                      <button
                        key={color}
                        onClick={() => setNewSubjectColor(color)}
                        className={cn(
                          "w-8 h-8 rounded-full transition-all",
                          newSubjectColor === color && "ring-2 ring-offset-2 ring-foreground"
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <Button onClick={addSubject} className="w-full">Add Subject</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Schedule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95%] sm:max-w-md rounded-xl">
              <DialogHeader>
                <DialogTitle>Add Study Session</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map(subject => (
                        <SelectItem key={subject.id} value={subject.id}>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: subject.color }} />
                            {subject.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {subjects.length === 0 && (
                    <p className="text-xs text-muted-foreground">Add a subject first</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Day</Label>
                  <Select value={selectedDay} onValueChange={setSelectedDay}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS.map((day, index) => (
                        <SelectItem key={index} value={index.toString()}>{day}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                  </div>
                </div>
                <Button onClick={addSchedule} className="w-full" disabled={!selectedSubject}>
                  Add to Schedule
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Subjects */}
      {subjects.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Your Subjects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {subjects.map(subject => (
                <div
                  key={subject.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary group"
                >
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: subject.color }} />
                  <span className="text-sm font-medium">{subject.name}</span>
                  <button
                    onClick={() => deleteSubject(subject.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly Schedule */}
      <div className="grid gap-4">
        {DAYS.map((day, index) => {
          const daySchedules = getSchedulesForDay(index);
          const isToday = new Date().getDay() === index;

          return (
            <Card key={day} className={cn(isToday && "ring-2 ring-primary/50")}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  {day}
                  {isToday && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                      Today
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {daySchedules.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No study sessions scheduled</p>
                ) : (
                  <div className="space-y-2">
                    {daySchedules.map(schedule => (
                      <div
                        key={schedule.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 group"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-1 h-10 rounded-full"
                            style={{ backgroundColor: schedule.subjects?.color || '#6366f1' }}
                          />
                          <div>
                            <p className="font-medium text-sm">{schedule.subjects?.name}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => deleteSchedule(schedule.id)}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
