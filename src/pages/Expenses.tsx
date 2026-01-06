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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold">Expense Tracker</h1>
          <p className="text-muted-foreground mt-1">
            {format(new Date(), 'MMMM yyyy')}
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={budgetDialogOpen} onOpenChange={setBudgetDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Wallet className="h-4 w-4" />
                Set Budget
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Set Monthly Budget</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Budget Amount (₹)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 10000"
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                  />
                </div>
                <Button onClick={updateBudget} className="w-full">Save Budget</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Expense</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Amount (₹)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.icon} {cat.value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Description (optional)</Label>
                  <Input
                    placeholder="e.g., Lunch at canteen"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <Button onClick={addExpense} className="w-full">Add Expense</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Budget Overview */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Budget</p>
                <p className="text-2xl font-display font-bold">₹{budget.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Spent</p>
                <p className="text-2xl font-display font-bold">₹{totalSpent.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-lg bg-destructive/10">
                <TrendingUp className="h-5 w-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Remaining</p>
                <p className={cn(
                  "text-2xl font-display font-bold",
                  remaining < 0 ? "text-destructive" : "text-success"
                )}>
                  ₹{Math.abs(remaining).toLocaleString()}
                </p>
              </div>
              <div className={cn(
                "p-3 rounded-lg",
                remaining < 0 ? "bg-destructive/10" : "bg-success/10"
              )}>
                <TrendingDown className={cn(
                  "h-5 w-5",
                  remaining < 0 ? "text-destructive" : "text-success"
                )} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      {budget > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{percentage.toFixed(0)}% used</span>
                <span className={cn(
                  "font-medium",
                  percentage >= 90 ? "text-destructive" : percentage >= 75 ? "text-warning" : "text-success"
                )}>
                  ₹{remaining.toLocaleString()} left
                </span>
              </div>
              <Progress 
                value={percentage} 
                className="h-3"
                indicatorClassName={cn(
                  percentage >= 90 ? "bg-destructive" : percentage >= 75 ? "bg-warning" : "bg-success"
                )}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Breakdown */}
      {getCategoryData().length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getCategoryData().map(([cat, amount]) => {
                const catInfo = CATEGORIES.find(c => c.value === cat);
                const catPercentage = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;
                
                return (
                  <div key={cat} className="flex items-center gap-3">
                    <span className="text-lg">{catInfo?.icon || '💰'}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span>{cat}</span>
                        <span className="font-medium">₹{amount.toLocaleString()}</span>
                      </div>
                      <Progress value={catPercentage} className="h-2" />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Expenses */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Wallet className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No expenses this month</p>
            </div>
          ) : (
            <div className="space-y-2">
              {expenses.slice(0, 10).map(expense => {
                const catInfo = CATEGORIES.find(c => c.value === expense.category);
                
                return (
                  <div
                    key={expense.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 group"
                  >
                    <span className="text-lg">{catInfo?.icon || '💰'}</span>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="font-medium text-sm">
                          {expense.description || expense.category}
                        </p>
                        <p className="font-semibold">₹{Number(expense.amount).toLocaleString()}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(expense.date), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => deleteExpense(expense.id)}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
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
