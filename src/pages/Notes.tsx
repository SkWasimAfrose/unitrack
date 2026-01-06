import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Note {
  id: string;
  content: string;
  color: string;
  created_at: string;
  updated_at: string;
}

const NOTE_COLORS = [
  { value: 'hsl(48 96% 89%)', name: 'Yellow', class: 'bg-note-yellow' },
  { value: 'hsl(140 50% 88%)', name: 'Green', class: 'bg-note-green' },
  { value: 'hsl(210 80% 90%)', name: 'Blue', class: 'bg-note-blue' },
  { value: 'hsl(330 70% 92%)', name: 'Pink', class: 'bg-note-pink' },
  { value: 'hsl(270 60% 92%)', name: 'Purple', class: 'bg-note-purple' },
];

export default function Notes() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  // Form state
  const [newContent, setNewContent] = useState('');
  const [newColor, setNewColor] = useState(NOTE_COLORS[0].value);

  useEffect(() => {
    if (user) fetchNotes();
  }, [user]);

  const fetchNotes = async () => {
    try {
      const { data } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      
      setNotes(data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const addNote = async () => {
    if (!newContent.trim()) return;

    try {
      const { data, error } = await supabase
        .from('notes')
        .insert({
          user_id: user!.id,
          content: newContent,
          color: newColor
        })
        .select()
        .single();

      if (error) throw error;

      setNotes(prev => [data, ...prev]);
      setNewContent('');
      setNewColor(NOTE_COLORS[0].value);
      setDialogOpen(false);
      toast({ title: "Note added! 📝" });
    } catch (error) {
      toast({ title: "Failed to add note", variant: "destructive" });
    }
  };

  const updateNote = async (id: string) => {
    if (!editContent.trim()) return;

    try {
      await supabase
        .from('notes')
        .update({ content: editContent })
        .eq('id', id);

      setNotes(prev => prev.map(n => 
        n.id === id ? { ...n, content: editContent } : n
      ));
      setEditingId(null);
      setEditContent('');
      toast({ title: "Note updated!" });
    } catch (error) {
      toast({ title: "Failed to update note", variant: "destructive" });
    }
  };

  const deleteNote = async (id: string) => {
    try {
      await supabase.from('notes').delete().eq('id', id);
      setNotes(prev => prev.filter(n => n.id !== id));
      toast({ title: "Note deleted" });
    } catch (error) {
      toast({ title: "Failed to delete note", variant: "destructive" });
    }
  };

  const startEditing = (note: Note) => {
    setEditingId(note.id);
    setEditContent(note.content);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditContent('');
  };

  const getColorClass = (color: string) => {
    const found = NOTE_COLORS.find(c => c.value === color);
    return found?.class || 'bg-note-yellow';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-brand-blue/20 border-t-brand-blue animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-display font-bold tracking-tight text-foreground">Quick Thoughts</h1>
          <p className="text-muted-foreground font-medium mt-1 uppercase text-xs tracking-widest">
            {notes.length} saved insights
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="h-12 px-6 rounded-2xl bg-brand-blue hover:bg-brand-blue/90 text-white font-bold transition-all shadow-lg shadow-brand-blue/20 gap-2">
              <Plus className="h-5 w-5" />
              New Note
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95%] sm:max-w-md rounded-3xl border-none shadow-2xl bg-background/95 backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold tracking-tight">Capture Note</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 pt-4">
              <Textarea
                placeholder="What's on your mind?..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                rows={5}
                className="bg-secondary/50 border-none focus-visible:ring-brand-blue rounded-2xl font-medium resize-none text-base p-4"
              />
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Theme Color</p>
                <div className="flex gap-3 bg-secondary/30 p-2 rounded-2xl w-fit">
                  {NOTE_COLORS.map(color => (
                    <button
                      key={color.value}
                      onClick={() => setNewColor(color.value)}
                      className={cn(
                        "w-10 h-10 rounded-xl transition-all duration-300 shadow-sm",
                        color.class,
                        newColor === color.value 
                          ? "ring-4 ring-brand-blue/30 scale-110 shadow-lg" 
                          : "hover:scale-105 active:scale-95"
                      )}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
              <Button onClick={addNote} className="w-full h-14 rounded-2xl bg-brand-blue hover:bg-brand-blue/90 text-white font-bold text-lg shadow-xl shadow-brand-blue/20 transition-all active:scale-95">
                Save Insight
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Notes Grid */}
      {notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-secondary/20 rounded-[32px] border-2 border-dashed border-border/50">
          <div className="p-8 bg-background rounded-[40px] shadow-2xl mb-8 group overflow-hidden relative">
            <div className="absolute inset-0 bg-brand-blue opacity-5 scale-0 group-hover:scale-100 transition-transform duration-700 rounded-full" />
            <span className="text-5xl block relative transition-transform duration-500 group-hover:scale-110">📝</span>
          </div>
          <h3 className="text-2xl font-bold tracking-tight">Your digital brain is empty</h3>
          <p className="text-muted-foreground font-medium mt-2 max-w-xs text-center">Start capturing your brilliance, ideas, and quick reminders here.</p>
          <Button variant="link" onClick={() => setDialogOpen(true)} className="mt-6 text-brand-blue font-bold text-lg hover:no-underline hover:opacity-80">
            Create first note
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {notes.map(note => (
            <div
              key={note.id}
              className={cn(
                "group relative p-6 rounded-[28px] min-h-[200px] flex flex-col transition-all duration-500 hover-lift shadow-sm hover:shadow-xl",
                getColorClass(note.color)
              )}
            >
              <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-black/10 group-hover:animate-ping" />
              
              {editingId === note.id ? (
                <div className="flex-1 flex flex-col">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="flex-1 bg-white/40 dark:bg-black/20 border-none resize-none focus-visible:ring-0 p-3 rounded-xl text-foreground font-medium"
                    autoFocus
                  />
                  <div className="flex justify-end gap-2 mt-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 bg-white/50 dark:bg-black/20 hover:bg-destructive/10 hover:text-destructive rounded-xl"
                      onClick={cancelEditing}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 bg-white/50 dark:bg-black/20 hover:bg-brand-green/20 hover:text-brand-green rounded-xl"
                      onClick={() => updateNote(note.id)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="flex-1 text-base font-medium leading-relaxed tracking-tight text-foreground/80 whitespace-pre-wrap break-words">
                    {note.content}
                  </p>
                  <div className="flex items-center justify-between mt-6 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                    <p className="text-[10px] uppercase font-black tracking-widest text-black/20 dark:text-white/20">
                      {format(new Date(note.created_at), 'MMM d, yyyy')}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-xl bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10"
                        onClick={() => startEditing(note)}
                      >
                        <Edit2 className="h-4 w-4 text-foreground/60" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-xl bg-black/5 hover:bg-destructive/10 dark:bg-white/5 hover:text-destructive transition-colors"
                        onClick={() => deleteNote(note.id)}
                      >
                        <Trash2 className="h-4 w-4 text-foreground/60 group-hover:text-destructive" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
