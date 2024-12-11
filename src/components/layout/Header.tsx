import { BedDouble, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/lib/firebase/auth';
import { useToast } from '@/hooks/use-toast';

export function Header() {
  const { user } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: 'Déconnexion réussie',
        description: 'À bientôt !',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la déconnexion',
        variant: 'destructive',
      });
    }
  };

  return (
    <header className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-violet-100/50 via-purple-100/50 to-fuchsia-100/50 backdrop-blur-sm border-b border-purple-100/20" />
      
      <div className="relative max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BedDouble className="h-6 w-6 text-purple-600" />
          <h1 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-fuchsia-600">
            ListApp
          </h1>
        </div>

        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm text-purple-700">
              <span className="w-2 h-2 rounded-full bg-purple-500/50 animate-pulse" />
              <span className="font-medium">{user.email}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="group glass hover:bg-red-50 hover:text-red-600 border-purple-100/20 shadow-sm"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2 transition-transform duration-200 group-hover:-translate-x-0.5" />
              <span className="hidden sm:inline">Déconnexion</span>
              <span className="sm:hidden">Sortir</span>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}