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
      toast({ title: "Category added! 📚" });
    } catch (error) {
      toast({ title: "Failed to add category", variant: "destructive" });
    }
  };

  const deleteSubject = async (id: string) => {
    try {
      await supabase.from('subjects').delete().eq('id', id);
      setSubjects(prev => prev.filter(s => s.id !== id));
      setSchedules(prev => prev.filter(s => s.subject_id !== id));
      toast({ title: "Category deleted" });
    } catch (error) {
      toast({ title: "Failed to delete category", variant: "destructive" });
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
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-brand-purple/20 border-t-brand-purple animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-display font-bold tracking-tight text-foreground">Day Planner</h1>
          <p className="text-muted-foreground font-medium mt-1 uppercase text-xs tracking-widest max-w-xl normal-case">
            The Day Planner helps you plan your day — whether it’s classes, work, study sessions, or personal tasks.
          </p>
        </div>
        <div className="flex gap-3">
          <Dialog open={subjectDialogOpen} onOpenChange={setSubjectDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-12 px-6 rounded-2xl border-2 hover:bg-secondary font-bold gap-2">
                <Palette className="h-5 w-5 text-brand-purple" />
                Add Categories
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95%] sm:max-w-md rounded-3xl border-none shadow-2xl bg-background/95 backdrop-blur-xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold tracking-tight">Planner Categories</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 pt-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Category Name</Label>
                  <Input
                    placeholder="e.g., Work, Gym, Study"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="bg-secondary/50 border-none focus-visible:ring-brand-purple h-12 rounded-2xl font-medium"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Assign Color</Label>
                  <div className="flex flex-wrap gap-3 bg-secondary/30 p-3 rounded-2xl">
                    {COLORS.map(color => (
                      <button
                        key={color}
                        onClick={() => setNewSubjectColor(color)}
                        className={cn(
                          "w-9 h-9 rounded-xl transition-all duration-300 shadow-sm",
                          newSubjectColor === color 
                            ? "ring-4 ring-brand-purple/30 scale-110 shadow-lg" 
                            : "hover:scale-105 active:scale-95"
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <Button onClick={addSubject} className="w-full h-14 rounded-2xl bg-brand-purple hover:bg-brand-purple/90 text-white font-bold text-lg shadow-xl shadow-brand-purple/20 transition-all active:scale-95">
                  Save Category
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
            <DialogTrigger asChild>
              <Button className="h-12 px-6 rounded-2xl bg-brand-purple hover:bg-brand-purple/90 text-white font-bold transition-all shadow-lg shadow-brand-purple/20 gap-2">
                <Plus className="h-5 w-5" />
                Plan Session
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95%] sm:max-w-md rounded-3xl border-none shadow-2xl bg-background/95 backdrop-blur-xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold tracking-tight">Add to Schedule</DialogTitle>
              </DialogHeader>
              <div className="space-y-5 pt-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Choose Category</Label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger className="bg-secondary/50 border-none focus:ring-brand-purple h-12 rounded-2xl font-bold">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-2xl">
                      {subjects.map(subject => (
                        <SelectItem key={subject.id} value={subject.id} className="rounded-xl my-1 font-medium">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: subject.color }} />
                            {subject.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {subjects.length === 0 && (
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter px-1">Please add a category first</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Day of Week</Label>
                  <Select value={selectedDay} onValueChange={setSelectedDay}>
                    <SelectTrigger className="bg-secondary/50 border-none focus:ring-brand-purple h-12 rounded-2xl font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-2xl">
                      {DAYS.map((day, index) => (
                        <SelectItem key={index} value={index.toString()} className="rounded-xl my-1 font-medium">{day}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Start</Label>
                    <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="bg-secondary/50 border-none focus-visible:ring-brand-purple h-12 rounded-2xl font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">End</Label>
                    <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="bg-secondary/50 border-none focus-visible:ring-brand-purple h-12 rounded-2xl font-bold" />
                  </div>
                </div>
                <Button onClick={addSchedule} className="w-full h-14 rounded-2xl bg-brand-purple hover:bg-brand-purple/90 text-white font-bold text-lg shadow-xl shadow-brand-purple/20 transition-all active:scale-95" disabled={!selectedSubject}>
                  Add to Timeline
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Subjects Horizontal Scroll */}
      {subjects.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-2 opacity-60">My Categories</p>
          <div className="flex flex-wrap gap-3">
            {subjects.map(subject => (
              <div
                key={subject.id}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: subject.color }} />
                <span className="text-sm font-bold tracking-tight">{subject.name}</span>
                <button
                  onClick={() => deleteSubject(subject.id)}
                  className="w-6 h-6 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Schedule Timeline */}
      <div className="grid gap-8 pb-10">
        {DAYS.map((day, index) => {
          const daySchedules = getSchedulesForDay(index);
          const isToday = new Date().getDay() === index;

          return (
            <div key={day} className="relative group">
              <div className="flex items-center gap-4 mb-4">
                <h3 className={cn(
                  "text-xl font-bold tracking-tight uppercase tracking-widest text-xs",
                  isToday ? "text-brand-purple" : "text-muted-foreground"
                )}>
                  {day}
                </h3>
                {isToday && (
                  <div className="flex-1 h-px bg-brand-purple/20" />
                )}
                {isToday && (
                  <span className="text-[10px] px-3 py-1 rounded-full bg-brand-purple text-white font-black uppercase tracking-widest animate-pulse">
                    Live Today
                  </span>
                )}
              </div>
              
              <div className="space-y-4 ml-2 border-l-2 border-dashed border-border/50 pl-6 pb-2">
                {daySchedules.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-secondary/20 border border-transparent">
                    <p className="text-sm font-medium text-muted-foreground italic">No sessions planned</p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {daySchedules.map(schedule => (
                      <div
                        key={schedule.id}
                        className="group flex flex-col p-6 rounded-[28px] bg-card border border-border/50 shadow-sm hover:shadow-xl hover:shadow-brand-purple/5 transition-all duration-300 relative overflow-hidden"
                      >
                        <div 
                          className="absolute bottom-0 right-0 w-24 h-24 translate-x-12 translate-y-12 rounded-full opacity-5 pointer-events-none"
                          style={{ backgroundColor: schedule.subjects?.color || 'hsl(var(--brand-purple))' }}
                        />
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-1.5 h-10 rounded-full shadow-sm"
                              style={{ backgroundColor: schedule.subjects?.color || 'hsl(var(--brand-purple))' }}
                            />
                            <div>
                              <p className="font-bold text-lg tracking-tight group-hover:text-brand-purple transition-colors">
                                {schedule.subjects?.name}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground bg-secondary/80 px-2 py-0.5 rounded-md uppercase tracking-widest">
                                  <Clock className="h-3 w-3" />
                                  {formatTime(schedule.start_time)}
                                </div>
                                <span className="text-[10px] text-muted-foreground">→</span>
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground bg-secondary/80 px-2 py-0.5 rounded-md uppercase tracking-widest">
                                  {formatTime(schedule.end_time)}
                                </div>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive shrink-0 rounded-xl"
                            onClick={() => deleteSchedule(schedule.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
