import { useEffect, useState } from 'react';
import { User, Moon, Sun, Monitor, Trash2, Save, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  full_name: string | null;
  role: string | null;
}

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile>({ full_name: '', role: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  
  // Dynamic placeholder for mobile
  const roles = ["Student", "Developer", "Freelancer", "Working Professional", "Creative", "Personal use"];
  const [currentRoleIdx, setCurrentRoleIdx] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!isMobile) return;
    
    const interval = setInterval(() => {
      setFade(true); // Start fade out
      setTimeout(() => {
        setCurrentRoleIdx((prev) => (prev + 1) % roles.length);
        setFade(false); // Start fade in
      }, 800);
    }, 3500);
    
    return () => clearInterval(interval);
  }, [isMobile, roles.length]);

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('full_name, course')
        .eq('user_id', user!.id)
        .single();
      
      if (data) {
        setProfile({
          full_name: data.full_name || '',
          role: data.course || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          course: profile.role
        })
        .eq('user_id', user!.id);

      if (error) throw error;

      toast({ title: "Profile saved! ✨" });
    } catch (error) {
      toast({ title: "Failed to save profile", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const resetAllData = async () => {
    setResetting(true);
    try {
      // Delete all user data
      await Promise.all([
        supabase.from('tasks').delete().eq('user_id', user!.id),
        supabase.from('expenses').delete().eq('user_id', user!.id),
        supabase.from('budgets').delete().eq('user_id', user!.id),
        supabase.from('notes').delete().eq('user_id', user!.id),
        supabase.from('study_schedules').delete().eq('user_id', user!.id),
        supabase.from('subjects').delete().eq('user_id', user!.id),
      ]);

      toast({ title: "All data has been reset", description: "Your account is now fresh!" });
    } catch (error) {
      toast({ title: "Failed to reset data", variant: "destructive" });
    } finally {
      setResetting(false);
    }
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
    <div className="space-y-8 animate-fade-in max-w-2xl pb-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl lg:text-4xl font-display font-bold tracking-tight">Settings & Identity</h1>
        <p className="text-muted-foreground font-medium mt-1 uppercase text-xs tracking-widest">
          Personalize your UniTrack experience
        </p>
      </div>

      {/* Profile Card */}
      <Card className="rounded-[32px] border-none shadow-xl shadow-secondary/20 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-brand-purple opacity-20" />
        <CardHeader className="pt-10 px-8">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-3xl bg-brand-purple/10 flex items-center justify-center text-brand-purple shadow-inner">
              <User className="h-8 w-8" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold tracking-tight">Your Profile</CardTitle>
              <CardDescription className="font-medium text-xs uppercase tracking-widest">Public identity details</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 px-8 pb-10">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</Label>
            <Input
              placeholder="Your name"
              value={profile.full_name || ''}
              onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
              className="bg-secondary/50 border-none focus-visible:ring-brand-purple h-14 rounded-2xl font-bold text-lg"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Daily Focus / Role</Label>
            <div className="relative group">
              {isMobile && !profile.role && (
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none font-bold text-base transition-opacity duration-300">
                  e.g.
                </span>
              )}
              <Input
                placeholder={isMobile ? `\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0 ${roles[currentRoleIdx]}` : "e.g., Student, Developer, Freelancer, Personal use"}
                value={profile.role || ''}
                onChange={(e) => setProfile(prev => ({ ...prev, role: e.target.value }))}
                className={cn(
                  "bg-secondary/50 border-none focus-visible:ring-brand-purple h-14 rounded-2xl font-bold smooth-placeholder",
                  isMobile && fade ? "placeholder:opacity-0" : "placeholder:opacity-100"
                )}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address (Authenticated)</Label>
            <Input 
              value={user?.email || ''} 
              readOnly 
              className="bg-secondary/30 border-none h-12 rounded-2xl font-semibold opacity-70 cursor-not-allowed" 
            />
          </div>
          <Button onClick={saveProfile} disabled={saving} className="h-14 px-8 rounded-2xl bg-brand-purple hover:bg-brand-purple/90 text-white font-bold text-lg shadow-xl shadow-brand-purple/20 transition-all active:scale-95 gap-3">
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            Save Profile
          </Button>
        </CardContent>
      </Card>

      {/* Preferences Card */}
      <Card className="rounded-[32px] border-none shadow-xl shadow-secondary/20 overflow-hidden">
        <CardHeader className="pt-8 px-8">
          <CardTitle className="text-xl font-bold tracking-tight">Interface Theme</CardTitle>
          <CardDescription className="font-medium text-xs uppercase tracking-widest">Choose your favorite look</CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-10">
          <div className="grid grid-cols-3 gap-4 bg-secondary/30 p-2 rounded-[28px]">
            {[
              { id: 'light', label: 'Light', icon: Sun, active: theme === 'light' },
              { id: 'dark', label: 'Dark', icon: Moon, active: theme === 'dark' },
              { id: 'system', label: 'System', icon: Monitor, active: theme === 'system' }
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => setTheme(option.id as 'light' | 'dark' | 'system')}
                className={cn(
                  "flex flex-col items-center justify-center gap-3 py-6 rounded-[24px] transition-all duration-300 group",
                  option.active 
                    ? "bg-background shadow-xl shadow-secondary/30 text-brand-purple" 
                    : "hover:bg-background/50 text-muted-foreground"
                )}
              >
                <div className={cn(
                  "p-3 rounded-2xl transition-all duration-500",
                  option.active ? "bg-brand-purple/10 scale-110" : "bg-transparent group-hover:scale-105"
                )}>
                  <option.icon className="h-6 w-6" />
                </div>
                <span className="text-xs font-black uppercase tracking-widest">{option.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="rounded-[32px] border-2 border-dashed border-destructive/30 bg-destructive/5 overflow-hidden">
        <CardHeader className="pt-8 px-8">
          <CardTitle className="text-xl font-bold tracking-tight text-destructive">Advanced Controls</CardTitle>
          <CardDescription className="font-medium text-xs uppercase tracking-widest text-destructive/60">Manage sensitive account actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-8 pb-10">
          <div className="flex items-center justify-between gap-4 p-6 rounded-3xl bg-background shadow-sm border border-destructive/5">
            <div>
              <p className="font-bold text-lg tracking-tight">Purge All Data</p>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">Clears all modules. Cannot be undone.</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="lg" className="h-12 border-2 text-destructive border-destructive/20 hover:bg-destructive hover:text-white rounded-[18px] font-bold px-6">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-[95%] sm:max-w-md rounded-[32px] border-none shadow-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-2xl font-bold tracking-tight">Confirm Data Purge</AlertDialogTitle>
                  <AlertDialogDescription className="text-base font-medium">
                    This will permanently delete all your academic data, financial records, and study plans. Are you ready for a fresh start?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="pt-4 gap-3">
                  <AlertDialogCancel className="h-12 rounded-2xl border-none bg-secondary font-bold">Nevermind</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={resetAllData}
                    disabled={resetting}
                    className="h-12 rounded-2xl bg-destructive text-white font-bold hover:bg-destructive/90 shadow-lg shadow-destructive/20"
                  >
                    {resetting ? 'Purging...' : 'Yes, Purge Everything'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div className="flex items-center justify-between gap-4 p-6 rounded-3xl bg-background shadow-sm border border-border">
            <div>
              <p className="font-bold text-lg tracking-tight">Active Session</p>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">Disconnect from this device</p>
            </div>
            <Button variant="outline" size="lg" onClick={signOut} className="h-12 border-2 rounded-[18px] font-bold px-6 hover:bg-secondary">
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
