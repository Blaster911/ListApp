import { Item } from '@/types/item';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from '@/components/ui/dialog';
import { Edit2, Package, Tag, MapPin, Link as LinkIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ItemDetailsProps {
  item: Item;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
}

export function ItemDetails({ item, isOpen, onClose, onEdit }: ItemDetailsProps) {
  const getConditionColor = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'neuf':
        return 'bg-green-500/10 text-green-500';
      case 'bon':
        return 'bg-blue-500/10 text-blue-500';
      case 'moyen':
        return 'bg-orange-500/10 text-orange-500';
      case 'mauvais':
        return 'bg-red-500/10 text-red-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background -z-10" />
        
        <DialogHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl bg-gradient-to-br from-primary to-primary/50 bg-clip-text text-transparent">
              {item.name}
            </DialogTitle>
            {item.condition && (
              <Badge variant="secondary" className={cn("text-sm font-medium", getConditionColor(item.condition))}>
                {item.condition}
              </Badge>
            )}
          </div>
          <DialogDescription className="text-muted-foreground">
            Détails de l'élément et ses caractéristiques
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations principales */}
          <div className="grid gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Package className="h-4 w-4 text-blue-500" />
              <span className="font-medium">{item.quantity} unités</span>
            </div>

            {item.category && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Tag className="h-4 w-4 text-purple-500" />
                <span>Catégorie: <span className="font-medium">{item.category}</span></span>
              </div>
            )}

            {item.location && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 text-green-500" />
                <span>Emplacement: <span className="font-medium">{item.location}</span></span>
              </div>
            )}

            {item.purchaseLink && (
              <a
                href={item.purchaseLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground group"
              >
                <LinkIcon className="h-4 w-4 text-orange-500 group-hover:text-orange-600 transition-colors" />
                <span className="group-hover:text-orange-600 transition-colors">Voir le site d'achat</span>
              </a>
            )}
          </div>

          {/* Notes */}
          {item.notes && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
              <div className="text-sm text-muted-foreground/90 bg-muted/30 p-3 rounded-lg border border-muted">
                {item.notes}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="mt-6">
          <Button
            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            onClick={onEdit}
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Modifier
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
