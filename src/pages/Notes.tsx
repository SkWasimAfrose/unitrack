import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold">Quick Notes</h1>
          <p className="text-muted-foreground mt-1">{notes.length} notes saved</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Note
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Quick Note</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="Write your note here..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                rows={4}
              />
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Choose a color</p>
                <div className="flex gap-2">
                  {NOTE_COLORS.map(color => (
                    <button
                      key={color.value}
                      onClick={() => setNewColor(color.value)}
                      className={cn(
                        "w-8 h-8 rounded-full transition-all",
                        color.class,
                        newColor === color.value && "ring-2 ring-offset-2 ring-foreground"
                      )}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
              <Button onClick={addNote} className="w-full">Save Note</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Notes Grid */}
      {notes.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-note-yellow flex items-center justify-center">
            <span className="text-3xl">📝</span>
          </div>
          <p className="text-muted-foreground">No notes yet</p>
          <Button variant="link" onClick={() => setDialogOpen(true)} className="mt-2">
            Create your first note
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {notes.map(note => (
            <div
              key={note.id}
              className={cn(
                "sticky-note p-4 min-h-[150px] flex flex-col",
                getColorClass(note.color)
              )}
            >
              {editingId === note.id ? (
                <>
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="flex-1 bg-transparent border-none resize-none focus-visible:ring-0 p-0 text-foreground"
                    autoFocus
                  />
                  <div className="flex justify-end gap-1 mt-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={cancelEditing}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => updateNote(note.id)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="flex-1 text-sm whitespace-pre-wrap break-words text-foreground">
                    {note.content}
                  </p>
                  <div className="flex justify-end gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 hover:bg-black/10"
                      onClick={() => startEditing(note)}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 hover:bg-black/10"
                      onClick={() => deleteNote(note.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
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
