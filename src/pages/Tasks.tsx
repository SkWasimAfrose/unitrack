import { useEffect, useState } from 'react';
import { Plus, Trash2, CheckCircle2, Circle, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { format, isToday, isTomorrow, isPast, set } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  title: string;
  description: string | null;
  deadline: string | null;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
}

export default function Tasks() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState('12:00');

  useEffect(() => {
    if (user) fetchTasks();
  }, [user]);

  const fetchTasks = async () => {
    try {
      const { data } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async () => {
    if (!title.trim()) return;

    try {
      let deadlineTimestamp: string | null = null;
      
      if (date) {
        const [hours, minutes] = time.split(':').map(Number);
        const combinedDate = set(date, { hours, minutes, seconds: 0, milliseconds: 0 });
        deadlineTimestamp = combinedDate.toISOString();
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          user_id: user!.id,
          title,
          description: description || null,
          deadline: deadlineTimestamp
        })
        .select()
        .single();

      if (error) throw error;

      setTasks(prev => [data, ...prev]);
      setTitle('');
      setDescription('');
      setDate(undefined);
      setTime('12:00');
      setDialogOpen(false);
      toast({ title: "Task added! ✅" });
    } catch (error) {
      toast({ title: "Failed to add task", variant: "destructive" });
    }
  };

  const toggleTask = async (id: string, completed: boolean) => {
    try {
      await supabase
        .from('tasks')
        .update({
          is_completed: completed,
          completed_at: completed ? new Date().toISOString() : null
        })
        .eq('id', id);

      setTasks(prev => prev.map(t => 
        t.id === id ? { ...t, is_completed: completed, completed_at: completed ? new Date().toISOString() : null } : t
      ));

      if (completed) {
        toast({ title: "Task completed! 🎉" });
      }
    } catch (error) {
      toast({ title: "Failed to update task", variant: "destructive" });
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await supabase.from('tasks').delete().eq('id', id);
      setTasks(prev => prev.filter(t => t.id !== id));
      toast({ title: "Task deleted" });
    } catch (error) {
      toast({ title: "Failed to delete task", variant: "destructive" });
    }
  };

  const formatDeadline = (deadline: string | null) => {
    if (!deadline) return null;
    const date = new Date(deadline);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d, yyyy');
  };

  const isOverdue = (deadline: string | null) => {
    if (!deadline) return false;
    return isPast(new Date(deadline)) && !isToday(new Date(deadline));
  };

  const pendingTasks = tasks.filter(t => !t.is_completed);
  const completedTasks = tasks.filter(t => t.is_completed);

  const TaskItem = ({ task }: { task: Task }) => (
    <div
      className={cn(
        "flex items-start gap-4 p-5 rounded-2xl transition-all duration-300 group relative overflow-hidden",
        task.is_completed 
          ? "bg-secondary/30 opacity-60" 
          : "bg-card hover:bg-white dark:hover:bg-card hover:shadow-xl hover:shadow-brand-pink/5 border border-border/50 hover:border-brand-pink/20"
      )}
    >
      {!task.is_completed && (
        <div className="absolute top-0 left-0 w-1 h-full bg-brand-pink opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
      <button
        onClick={() => toggleTask(task.id, !task.is_completed)}
        className="flex-shrink-0 mt-1 transition-transform duration-300 hover:scale-110 active:scale-95"
      >
        {task.is_completed ? (
          <div className="p-1.5 bg-brand-green/20 text-brand-green rounded-lg">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        ) : (
          <div className="p-1.5 bg-secondary text-muted-foreground group-hover:text-brand-pink group-hover:bg-brand-pink/10 rounded-lg shadow-sm">
            <Circle className="h-5 w-5" />
          </div>
        )}
      </button>
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-base font-bold tracking-tight transition-all duration-300",
          task.is_completed ? "line-through text-muted-foreground" : "text-foreground group-hover:text-brand-pink"
        )}>
          {task.title}
        </p>
        {(task.description || task.deadline) && (
          <div className="mt-2 space-y-2">
            {task.description && (
              <p className="text-sm text-muted-foreground font-medium line-clamp-2">
                {task.description}
              </p>
            )}
            {task.deadline && (
              <span className={cn(
                "inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg shadow-sm transition-colors",
                isOverdue(task.deadline) && !task.is_completed
                  ? "bg-destructive/10 text-destructive"
                  : "bg-secondary text-muted-foreground group-hover:bg-brand-pink/10 group-hover:text-brand-pink"
              )}>
                <Clock className="h-3 w-3" />
                {formatDeadline(task.deadline)}
              </span>
            )}
          </div>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive shrink-0"
        onClick={() => deleteTask(task.id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

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
          <h1 className="text-3xl lg:text-4xl font-display font-bold tracking-tight">Tasks & Assignments</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground bg-secondary px-2 py-1 rounded-md">
              {pendingTasks.length} Pending
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-green/70 bg-brand-green/10 px-2 py-1 rounded-md">
              {completedTasks.length} Done
            </span>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="h-12 px-6 rounded-2xl bg-brand-pink hover:bg-brand-pink/90 text-white font-bold transition-all shadow-lg shadow-brand-pink/20 gap-2">
              <Plus className="h-5 w-5" />
              New Assignment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95%] sm:max-w-md rounded-3xl border-none shadow-2xl bg-background/95 backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold tracking-tight">Create Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 pt-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Title</Label>
                <Input
                  placeholder="e.g., Complete Math Assignment"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-secondary/50 border-none focus-visible:ring-brand-pink h-12 rounded-2xl font-medium"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Notes</Label>
                <Textarea
                  placeholder="Add context or instructions..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="bg-secondary/50 border-none focus-visible:ring-brand-pink rounded-2xl font-medium resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Deadline</Label>
                <div className="flex gap-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "flex-1 justify-start text-left font-bold h-12 rounded-2xl border-none bg-secondary/50",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-brand-pink" />
                        {date ? format(date, "PPP") : <span>Select Date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 rounded-3xl overflow-hidden border-none shadow-2xl" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        className="p-3"
                      />
                    </PopoverContent>
                  </Popover>
                  <Input
                    type="time"
                    className="w-[130px] h-12 rounded-2xl border-none bg-secondary/50 font-bold"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={addTask} className="w-full h-14 rounded-2xl bg-brand-pink hover:bg-brand-pink/90 text-white font-bold text-lg shadow-xl shadow-brand-pink/20 transition-all active:scale-95">
                Save Task
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="mb-6 p-1.5 bg-secondary/50 rounded-2xl h-auto">
          <TabsTrigger value="pending" className="gap-2 px-6 py-2.5 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-md font-bold text-sm">
            Active
            {pendingTasks.length > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-lg bg-brand-pink/10 text-brand-pink">
                {pendingTasks.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2 px-6 py-2.5 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-md font-bold text-sm">
            Done
            {completedTasks.length > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-lg bg-brand-green/10 text-brand-green">
                {completedTasks.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-0">
          {pendingTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-secondary/20 rounded-[32px] border-2 border-dashed border-border/50">
              <div className="p-6 bg-background rounded-3xl shadow-xl shadow-brand-green/10 mb-6">
                <CheckCircle2 className="h-12 w-12 text-brand-green" />
              </div>
              <h3 className="text-xl font-bold tracking-tight">Everything is done!</h3>
              <p className="text-muted-foreground font-medium mt-1">You're completely caught up with your tasks.</p>
              <Button variant="link" onClick={() => setDialogOpen(true)} className="mt-4 text-brand-pink font-bold hover:no-underline hover:opacity-80">
                Create a new one?
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {pendingTasks.map(task => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-0">
          {completedTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-secondary/20 rounded-[32px] border-2 border-dashed border-border/50">
              <div className="p-6 bg-background rounded-3xl shadow-xl mb-6">
                <Circle className="h-12 w-12 text-muted-foreground/30" />
              </div>
              <h3 className="text-xl font-bold tracking-tight">No finished tasks</h3>
              <p className="text-muted-foreground font-medium mt-1">Complete your assignments to see them here.</p>
            </div>
          ) : (
            <div className="grid gap-4 opacity-80">
              {completedTasks.map(task => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
