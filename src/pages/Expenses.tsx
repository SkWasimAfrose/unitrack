import { useEffect, useState } from 'react';
import { Plus, Trash2, Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string | null;
  date: string;
}

const CATEGORIES = [
  { value: 'Food', icon: '🍕', color: 'bg-category-food' },
  { value: 'Travel', icon: '🚌', color: 'bg-category-travel' },
  { value: 'Rent', icon: '🏠', color: 'bg-category-rent' },
  { value: 'Personal', icon: '🛍️', color: 'bg-category-personal' },
  { value: 'Entertainment', icon: '🎮', color: 'bg-info' },
  { value: 'Education', icon: '📚', color: 'bg-primary' },
  { value: 'Other', icon: '💰', color: 'bg-category-other' },
];

export default function Expenses() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budget, setBudget] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false);

  // Form state
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [newBudget, setNewBudget] = useState('');

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const startOfMonth = new Date(currentYear, currentMonth - 1, 1).toISOString().split('T')[0];
      const endOfMonth = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0];

      const [budgetRes, expensesRes] = await Promise.all([
        supabase
          .from('budgets')
          .select('amount')
          .eq('user_id', user!.id)
          .eq('month', currentMonth)
          .eq('year', currentYear)
          .single(),
        supabase
          .from('expenses')
          .select('*')
          .eq('user_id', user!.id)
          .gte('date', startOfMonth)
          .lte('date', endOfMonth)
          .order('date', { ascending: false })
      ]);

      setBudget(budgetRes.data?.amount || 0);
      setExpenses(expensesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async () => {
    if (!amount || parseFloat(amount) <= 0) return;

    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          user_id: user!.id,
          amount: parseFloat(amount),
          category,
          description: description || null,
          date
        })
        .select()
        .single();

      if (error) throw error;

      setExpenses(prev => [data, ...prev]);
      setAmount('');
      setDescription('');
      setCategory('Food');
      setDate(format(new Date(), 'yyyy-MM-dd'));
      setExpenseDialogOpen(false);
      toast({ title: "Expense added! 💰" });
    } catch (error) {
      toast({ title: "Failed to add expense", variant: "destructive" });
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      await supabase.from('expenses').delete().eq('id', id);
      setExpenses(prev => prev.filter(e => e.id !== id));
      toast({ title: "Expense deleted" });
    } catch (error) {
      toast({ title: "Failed to delete expense", variant: "destructive" });
    }
  };

  const updateBudget = async () => {
    if (!newBudget || parseFloat(newBudget) <= 0) return;

    try {
      const { error } = await supabase
        .from('budgets')
        .upsert({
          user_id: user!.id,
          month: currentMonth,
          year: currentYear,
          amount: parseFloat(newBudget)
        }, {
          onConflict: 'user_id,month,year'
        });

      if (error) throw error;

      setBudget(parseFloat(newBudget));
      setNewBudget('');
      setBudgetDialogOpen(false);
      toast({ title: "Budget updated! 📊" });
    } catch (error) {
      toast({ title: "Failed to update budget", variant: "destructive" });
    }
  };

  const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const remaining = budget - totalSpent;
  const percentage = budget > 0 ? Math.min((totalSpent / budget) * 100, 100) : 0;

  const getCategoryData = () => {
    const data: Record<string, number> = {};
    expenses.forEach(e => {
      data[e.category] = (data[e.category] || 0) + Number(e.amount);
    });
    return Object.entries(data).sort((a, b) => b[1] - a[1]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-brand-yellow/20 border-t-brand-yellow animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-display font-bold tracking-tight">Financial Dashboard</h1>
          <p className="text-muted-foreground font-medium mt-1 uppercase text-xs tracking-widest">
            Overview for {format(new Date(), 'MMMM yyyy')}
          </p>
        </div>
        <div className="flex gap-3">
          <Dialog open={budgetDialogOpen} onOpenChange={setBudgetDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-12 px-6 rounded-2xl border-2 hover:bg-secondary font-bold gap-2">
                <Wallet className="h-5 w-5 text-brand-yellow" />
                Set Budget
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95%] sm:max-w-md rounded-3xl border-none shadow-2xl bg-background/95 backdrop-blur-xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold tracking-tight text-center">Monthly Budget</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 pt-4">
                <div className="space-y-2 text-center">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Budget Amount (₹)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 10000"
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    className="text-center text-3xl h-20 bg-secondary/30 border-none rounded-3xl font-display font-bold focus-visible:ring-brand-yellow"
                  />
                </div>
                <Button onClick={updateBudget} className="w-full h-14 rounded-2xl bg-brand-yellow hover:bg-brand-yellow/90 text-white font-bold text-lg shadow-xl shadow-brand-yellow/20 transition-all active:scale-95">
                  Save Budget
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen}>
            <DialogTrigger asChild>
              <Button className="h-12 px-6 rounded-2xl bg-brand-yellow hover:bg-brand-yellow/90 text-white font-bold transition-all shadow-lg shadow-brand-yellow/20 gap-2">
                <Plus className="h-5 w-5" />
                Log Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95%] sm:max-w-md rounded-3xl border-none shadow-2xl bg-background/95 backdrop-blur-xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold tracking-tight">New Expense</DialogTitle>
              </DialogHeader>
              <div className="space-y-5 pt-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Amount (₹)</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-secondary/50 border-none focus-visible:ring-brand-yellow h-12 rounded-2xl font-bold text-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="bg-secondary/50 border-none focus:ring-brand-yellow h-12 rounded-2xl font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-2xl">
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat.value} value={cat.value} className="rounded-xl my-1 font-medium">
                          {cat.icon} {cat.value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Notes</Label>
                  <Input
                    placeholder="What did you spend on?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-secondary/50 border-none focus-visible:ring-brand-yellow h-12 rounded-2xl font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Date</Label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-secondary/50 border-none focus-visible:ring-brand-yellow h-12 rounded-2xl font-bold"
                  />
                </div>
                <Button onClick={addExpense} className="w-full h-14 rounded-2xl bg-brand-yellow hover:bg-brand-yellow/90 text-white font-bold text-lg shadow-xl shadow-brand-yellow/20 transition-all active:scale-95">
                  Add Expense
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Budget Overview Cards */}
      <div className="grid sm:grid-cols-3 gap-6">
        {[
          { label: 'Budget', value: budget, icon: Wallet, color: 'text-brand-purple', bg: 'bg-brand-purple/10' },
          { label: 'Spent', value: totalSpent, icon: TrendingUp, color: 'text-destructive', bg: 'bg-destructive/10' },
          { label: 'Remaining', value: Math.abs(remaining), icon: TrendingDown, color: remaining < 0 ? 'text-destructive' : 'text-brand-green', bg: remaining < 0 ? 'bg-destructive/10' : 'bg-brand-green/10', sub: remaining < 0 ? 'Over budget' : 'Left' }
        ].map((stat, i) => (
          <Card key={i} className="rounded-[28px] border-none shadow-xl shadow-secondary/20 hover-lift relative overflow-hidden group">
            <div className={cn("absolute top-0 left-0 w-full h-1.5 opacity-60", stat.color.replace('text-', 'bg-'))} />
            <CardContent className="pt-8 pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">{stat.label}</p>
                  <p className={cn("text-3xl font-display font-bold tracking-tight", stat.color)}>
                    ₹{stat.value.toLocaleString()}
                  </p>
                  {stat.sub && (
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1 opacity-60">
                      {stat.sub}
                    </p>
                  )}
                </div>
                <div className={cn("p-4 rounded-2xl shadow-inner transition-transform duration-500 group-hover:rotate-12", stat.bg)}>
                  <stat.icon className={cn("h-6 w-6", stat.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress & Breakdown */}
      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="rounded-[28px] border-none shadow-xl shadow-secondary/20 flex flex-col">
          <CardHeader>
            <CardTitle className="text-xl font-bold tracking-tight">Monthly Utilization</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center pb-10">
            {budget > 0 ? (
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <div className="text-center flex-1">
                    <p className="text-5xl font-display font-black tracking-tighter text-foreground">{percentage.toFixed(0)}<span className="text-2xl text-muted-foreground">%</span></p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-2">Budget Consumed</p>
                  </div>
                </div>
                <div className="relative pt-2">
                  <Progress 
                    value={percentage} 
                    className="h-6 bg-secondary rounded-full overflow-hidden p-1 shadow-inner"
                    indicatorClassName={cn(
                      "transition-all duration-1000 ease-out rounded-full shadow-lg",
                      percentage >= 90 ? "bg-destructive" : percentage >= 75 ? "bg-brand-yellow" : "bg-brand-green"
                    )}
                  />
                </div>
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest px-2">
                  <span className="text-muted-foreground animate-pulse">Tracking Active</span>
                  <span className={cn(
                    "px-3 py-1 rounded-full",
                    percentage >= 90 ? "bg-destructive/10 text-destructive" : "bg-brand-green/10 text-brand-green"
                  )}>
                    ₹{Math.abs(remaining).toLocaleString()} {remaining < 0 ? 'Exceeded' : 'Safe'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 opacity-40">
                <Wallet className="h-12 w-12 mx-auto mb-3" />
                <p className="font-bold">No tracking data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-none shadow-xl shadow-secondary/20">
          <CardHeader>
            <CardTitle className="text-xl font-bold tracking-tight">Spending Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {getCategoryData().length > 0 ? (
              <div className="space-y-5 py-2">
                {getCategoryData().map(([cat, amount]) => {
                  const catInfo = CATEGORIES.find(c => c.value === cat);
                  const catPercentage = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;
                  
                  return (
                    <div key={cat} className="group flex items-center gap-4 p-2 rounded-2xl hover:bg-secondary/30 transition-colors">
                      <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-background shadow-md shadow-secondary/20 text-xl group-hover:scale-110 transition-transform">
                        {catInfo?.icon || '💰'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-end mb-1.5">
                          <span className="font-bold tracking-tight text-sm">{cat}</span>
                          <span className="font-display font-bold text-sm">₹{amount.toLocaleString()}</span>
                        </div>
                        <div className="relative h-2 w-full bg-secondary rounded-full overflow-hidden">
                          <div 
                            className={cn("absolute h-full rounded-full transition-all duration-1000", catInfo?.color || 'bg-brand-yellow')}
                            style={{ width: `${catPercentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 opacity-30">
                <p className="font-bold uppercase tracking-widest">No Category Data</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Expenses List */}
      <Card className="rounded-[32px] border-none shadow-xl shadow-secondary/20 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-6 px-8 pt-8">
          <CardTitle className="text-xl font-bold tracking-tight">Transaction History</CardTitle>
          <div className="h-8 shadow-inner bg-secondary/50 rounded-full px-4 flex items-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Latest 10 entries
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-8">
          {expenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="p-6 bg-secondary/50 rounded-3xl mb-4">
                <Wallet className="h-12 w-12 text-muted-foreground/30" />
              </div>
              <h3 className="text-lg font-bold">No transactions found</h3>
              <p className="text-sm text-muted-foreground mt-1">Start tracking your spending to see them here.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {expenses.slice(0, 10).map(expense => {
                const catInfo = CATEGORIES.find(c => c.value === expense.category);
                
                return (
                  <div
                    key={expense.id}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/20 hover:bg-white dark:hover:bg-card hover:shadow-xl hover:shadow-secondary/30 transition-all duration-300 group ring-1 ring-transparent hover:ring-brand-yellow/30"
                  >
                    <div className="h-12 w-12 flex-shrink-0 flex items-center justify-center rounded-xl bg-background shadow-md shadow-secondary/20 text-xl">
                      {catInfo?.icon || '💰'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold tracking-tight text-base group-hover:text-brand-yellow transition-colors truncate">
                            {expense.description || expense.category}
                          </p>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground italic mt-0.5">
                            {expense.category} • {format(new Date(expense.date), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <p className="text-lg font-display font-bold tabular-nums">
                          ₹{Number(expense.amount).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive shrink-0 rounded-xl"
                      onClick={() => deleteExpense(expense.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
