import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null); // Still using any here because the BeforeInstallPromptEvent isn't in standard types, but I'll fix the handler.
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Show the customized install prompt
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[100] animate-in slide-in-from-bottom-5 duration-500 sm:left-auto sm:right-6 sm:w-80">
      <Card className="p-4 bg-primary text-primary-foreground shadow-2xl border-none overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/10"
            onClick={() => setIsVisible(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-start gap-4">
          <div className="bg-white/20 p-2 rounded-xl">
            <Download className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-sm">Install UniTrack App</h3>
            <p className="text-xs text-primary-foreground/90 mt-1 line-clamp-2">
              Add UniTrack to your home screen for a faster, offline-ready experience.
            </p>
            <Button 
              onClick={handleInstall}
              variant="secondary"
              size="sm"
              className="mt-3 w-full font-semibold shadow-sm hover:shadow-md transition-all active:scale-95"
            >
              Install Now
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
