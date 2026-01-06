import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckSquare, Wallet, BookOpen, StickyNote, Plus, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { StatCard } from '@/components/dashboard/StatCard';
import { UpcomingTasks } from '@/components/dashboard/UpcomingTasks';
import { BudgetProgress } from '@/components/dashboard/BudgetProgress';
import { TodaySchedule } from '@/components/dashboard/TodaySchedule';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface Task {
  id: string;
  title: string;
  deadline: string | null;
  is_completed: boolean;
}

interface ScheduleItem {
  id: string;
  start_time: string;
  end_time: string;
  subject: {
    name: string;
    color: string;
  } | null;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [budget, setBudget] = useState(0);
  const [spent, setSpent] = useState(0);
  const [notesCount, setNotesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const dayOfWeek = today.getDay();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch tasks
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('id, title, deadline, is_completed')
        .eq('user_id', user!.id)
        .eq('is_completed', false)
        .order('deadline', { ascending: true, nullsFirst: false });

      setTasks(tasksData || []);

      // Fetch today's schedules
      const { data: schedulesData } = await supabase
        .from('study_schedules')
        .select(`
          id,
          start_time,
          end_time,
          subjects (
            name,
            color
          )
        `)
        .eq('user_id', user!.id)
        .eq('day_of_week', dayOfWeek)
        .order('start_time');

      const formattedSchedules = (schedulesData || []).map((s) => ({
        id: s.id,
        start_time: s.start_time,
        end_time: s.end_time,
        subject: s.subjects as { name: string; color: string } | null
      }));
      setSchedules(formattedSchedules);

      // Fetch budget
      const { data: budgetData } = await supabase
        .from('budgets')
        .select('amount')
        .eq('user_id', user!.id)
        .eq('month', currentMonth)
        .eq('year', currentYear)
        .single();

      setBudget(budgetData?.amount || 0);

      // Fetch expenses for current month
      const startOfMonth = new Date(currentYear, currentMonth - 1, 1).toISOString().split('T')[0];
      const endOfMonth = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0];

      const { data: expensesData } = await supabase
        .from('expenses')
        .select('amount')
        .eq('user_id', user!.id)
        .gte('date', startOfMonth)
        .lte('date', endOfMonth);

      const totalSpent = (expensesData || []).reduce((sum, e) => sum + Number(e.amount), 0);
      setSpent(totalSpent);

      // Fetch notes count
      const { count } = await supabase
        .from('notes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id);

      setNotesCount(count || 0);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (id: string, completed: boolean) => {
    try {
      await supabase
        .from('tasks')
        .update({ 
          is_completed: completed,
          completed_at: completed ? new Date().toISOString() : null
        })
        .eq('id', id);

      setTasks(prev => prev.filter(t => t.id !== id));
      
      toast({
        title: completed ? "Task completed! 🎉" : "Task uncompleted",
        description: "Keep up the great work!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    }
  };

  const pendingTasks = tasks.filter(t => !t.is_completed).length;
  const todaySchedulesCount = schedules.length;

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
          <h1 className="text-2xl lg:text-3xl font-display font-bold">
            Good {today.getHours() < 12 ? 'morning' : today.getHours() < 17 ? 'afternoon' : 'evening'}, {user?.user_metadata?.full_name?.split(' ')[0] || 'Scholar'}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Everything you need, in one place
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link to="/tasks">
            <Plus className="h-4 w-4" />
            Add Task
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Pending Tasks"
          value={pendingTasks}
          subtitle="assignments due"
          icon={<CheckSquare className="h-5 w-5" />}
          variant="pink"
        />
        <StatCard
          title="Today's Sessions"
          value={todaySchedulesCount}
          subtitle="sessions scheduled"
          icon={<BookOpen className="h-5 w-5" />}
          variant="purple"
        />
        <StatCard
          title="Monthly Spent"
          value={`₹${spent.toLocaleString()}`}
          subtitle={`of ₹${budget.toLocaleString()}`}
          icon={<Wallet className="h-5 w-5" />}
          variant="yellow"
        />
        <StatCard
          title="Quick Notes"
          value={notesCount}
          subtitle="saved notes"
          icon={<StickyNote className="h-5 w-5" />}
          variant="blue"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Tasks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg font-display">Upcoming Tasks</CardTitle>
            <Button variant="ghost" size="sm" asChild className="gap-1">
              <Link to="/tasks">
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <UpcomingTasks tasks={tasks} onToggle={handleToggleTask} />
          </CardContent>
        </Card>

        {/* Today's Schedule */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg font-display">Today's Schedule</CardTitle>
            <Button variant="ghost" size="sm" asChild className="gap-1">
              <Link to="/planner">
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <TodaySchedule schedules={schedules} />
          </CardContent>
        </Card>

        {/* Budget Progress */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg font-display">Monthly Budget</CardTitle>
            <Button variant="ghost" size="sm" asChild className="gap-1">
              <Link to="/expenses">
                Manage
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <BudgetProgress budget={budget} spent={spent} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
