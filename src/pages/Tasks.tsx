import { useEffect, useState } from 'react';
import { Plus, Trash2, CheckCircle2, Circle, Clock, Calendar } from 'lucide-react';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  const [deadline, setDeadline] = useState('');

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
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          user_id: user!.id,
          title,
          description: description || null,
          deadline: deadline ? new Date(deadline).toISOString() : null
        })
        .select()
        .single();

      if (error) throw error;

      setTasks(prev => [data, ...prev]);
      setTitle('');
      setDescription('');
      setDeadline('');
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
        "flex items-start gap-3 p-4 rounded-lg transition-all duration-200 group",
        task.is_completed ? "bg-muted/50" : "bg-card hover:bg-secondary/50 border border-border"
      )}
    >
      <button
        onClick={() => toggleTask(task.id, !task.is_completed)}
        className="flex-shrink-0 mt-0.5"
      >
        {task.is_completed ? (
          <CheckCircle2 className="h-5 w-5 text-success" />
        ) : (
          <Circle className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        )}
      </button>
      <div className="flex-1 min-w-0">
        <p className={cn(
          "font-medium",
          task.is_completed && "line-through text-muted-foreground"
        )}>
          {task.title}
        </p>
        {task.description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {task.description}
          </p>
        )}
        {task.deadline && (
          <span className={cn(
            "inline-flex items-center gap-1 text-xs mt-2 px-2 py-1 rounded-full",
            isOverdue(task.deadline) && !task.is_completed
              ? "bg-destructive/10 text-destructive"
              : "bg-muted text-muted-foreground"
          )}>
            <Clock className="h-3 w-3" />
            {formatDeadline(task.deadline)}
          </span>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => deleteTask(task.id)}
      >
        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
      </Button>
    </div>
  );

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
          <h1 className="text-2xl lg:text-3xl font-display font-bold">Tasks & Assignments</h1>
          <p className="text-muted-foreground mt-1">
            {pendingTasks.length} pending, {completedTasks.length} completed
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  placeholder="e.g., Complete Math Assignment"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Textarea
                  placeholder="Add details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Deadline (optional)</Label>
                <Input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>
              <Button onClick={addTask} className="w-full">Add Task</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="pending" className="gap-2">
            Pending
            {pendingTasks.length > 0 && (
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-primary/20">
                {pendingTasks.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2">
            Completed
            {completedTasks.length > 0 && (
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-success/20 text-success">
                {completedTasks.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {pendingTasks.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle2 className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">All caught up! No pending tasks.</p>
                <Button variant="link" onClick={() => setDialogOpen(true)} className="mt-2">
                  Add a new task
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {pendingTasks.map(task => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed">
          {completedTasks.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Circle className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">No completed tasks yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
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
