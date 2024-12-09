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
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-indigo-50/50 to-purple-50/50 backdrop-blur-sm" />
      
      {/* Bouton de déconnexion fixé en haut à droite */}
      {user && (
        <div className="absolute top-2 right-4 z-10">
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-green-500/50 animate-pulse" />
              <span className="font-medium">{user.email}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="group glass hover:bg-destructive/10 hover:text-destructive border-none shadow-sm"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2 transition-transform duration-200 group-hover:-translate-x-0.5" />
              <span className="hidden sm:inline">Déconnexion</span>
              <span className="sm:hidden">Sortir</span>
            </Button>
          </div>
        </div>
      )}

      <div className="relative border-b border-gray-200/50">
        <div className="flex justify-center">
          <div className="w-full max-w-7xl px-4 py-6">
            <div className="flex items-center justify-center">              
              <div className="flex flex-col items-center justify-center">
                <div className="flex items-center justify-center mb-3 transition-transform hover:scale-105 duration-200">
                  <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-3 rounded-xl shadow-sm">
                    <BedDouble className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <div className="text-center space-y-1">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                    Inventaire Airbnb
                  </h1>
                  <p className="text-muted-foreground font-medium">
                    Appartement Tarbes
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}