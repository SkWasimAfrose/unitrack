import { ReactNode, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  CheckSquare, 
  Wallet, 
  StickyNote, 
  User, 
  Menu, 
  X,
  LogOut,
  GraduationCap,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { InstallPrompt } from '../pwa/InstallPrompt';

interface AppLayoutProps {
  children: ReactNode;
}

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/planner', icon: Calendar, label: 'Day Planner' },
  { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { to: '/expenses', icon: Wallet, label: 'Expenses' },
  { to: '/notes', icon: StickyNote, label: 'Notes' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background font-sans">
      <InstallPrompt />
      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card/80 backdrop-blur-md border-b border-border z-50 flex items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="p-1.5 bg-brand-purple rounded-lg shadow-sm">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight">UniTrack</span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-xl"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </header>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-72 bg-sidebar border-r border-sidebar-border z-40 transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1)",
          "lg:translate-x-0 shadow-2xl lg:shadow-none",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full bg-sidebar-background">
          {/* Logo */}
          <Link to="/" className="h-20 flex items-center gap-3 px-8 border-b border-sidebar-border/50 mb-4 hover:bg-sidebar-accent/50 transition-colors">
            <div className="p-2 bg-brand-purple rounded-xl shadow-lg shadow-brand-purple/20">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="font-display font-bold text-2xl tracking-tight text-sidebar-foreground">UniTrack</span>
          </Link>

          {/* Navigation */}
          <nav className="flex-1 py-4 px-4 space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-4 mb-2 opacity-50">Menu</p>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300 group relative",
                    isActive
                      ? "bg-brand-purple text-white shadow-lg shadow-brand-purple/20"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )
                }
              >
                <item.icon className={cn("h-5 w-5 transition-transform duration-300 group-hover:scale-110")} />
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Bottom Section */}
          <div className="p-4 space-y-4">
            {/* Theme Switcher */}
            <div className="bg-sidebar-accent/50 p-1.5 rounded-2xl flex items-center justify-between gap-1 shadow-inner">
              {[
                { id: 'light', icon: Sun, label: 'Light' },
                { id: 'dark', icon: Moon, label: 'Dark' },
                { id: 'system', icon: Monitor, label: 'System' }
              ].map((t) => (
                <Button
                  key={t.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => setTheme(t.id as 'light' | 'dark' | 'system')}
                  className={cn(
                    "flex-1 h-9 rounded-xl transition-all duration-300",
                    theme === t.id 
                      ? "bg-white dark:bg-sidebar-background shadow-md text-brand-purple" 
                      : "text-muted-foreground hover:bg-transparent"
                  )}
                >
                  <t.icon className="h-4 w-4" />
                </Button>
              ))}
            </div>

            {/* Logout */}
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-12 rounded-2xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all font-semibold"
              onClick={signOut}
            >
              <div className="p-1.5 rounded-lg bg-muted group-hover:bg-destructive/20">
                <LogOut className="h-4 w-4" />
              </div>
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="lg:ml-72 min-h-screen pt-16 lg:pt-0 transition-all duration-500">
        <div className="p-6 lg:p-10 max-w-7xl mx-auto min-h-screen">
          <div className="absolute top-0 right-0 w-[30%] h-[30%] bg-brand-purple/5 blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-brand-pink/5 blur-[100px] pointer-events-none" />
          {children}
        </div>
      </main>
    </div>
  );
}
