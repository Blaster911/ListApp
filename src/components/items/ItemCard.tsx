import { useState } from 'react';
import { Trash2, MapPin, Package, Tag, AlertCircle, Edit2, Link, MinusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DeleteItemDialog } from './DeleteItemDialog';
import { EditItemDialog } from './EditItemDialog';
import { DecreaseQuantityDialog } from './DecreaseQuantityDialog';
import type { Item } from '@/types/item';
import { Badge } from '@/components/ui/badge';
import { ItemDetails } from './ItemDetails';

interface ItemCardProps {
  item: Item;
  onDelete: (id: string) => Promise<void>;
  onUpdate: (id: string, data: Partial<Item>) => Promise<void>;
}

export function ItemCard({ item, onDelete, onUpdate }: ItemCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDecreaseDialogOpen, setIsDecreaseDialogOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const getConditionColor = (condition?: string) => {
    switch (condition) {
      case 'Neuf':
        return 'bg-green-100 text-green-800';
      case 'Bon état':
        return 'bg-blue-100 text-blue-800';
      case 'Usage normal':
        return 'bg-yellow-100 text-yellow-800';
      case 'À remplacer':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <div 
        className="group glass rounded-lg p-3 hover:shadow-sm transition-all cursor-pointer"
        onClick={() => setIsDetailsOpen(true)}
      >
        <div className="space-y-2">
          <div className="flex justify-between items-start gap-2">
            <div>
              <h3 className="text-base font-medium text-primary/90 group-hover:text-primary transition-colors line-clamp-1">
                {item.name}
              </h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <Package className="h-3.5 w-3.5" />
                  {item.quantity}
                </span>
                {item.category && (
                  <span className="flex items-center gap-1">
                    <Tag className="h-3.5 w-3.5" />
                    {item.category}
                  </span>
                )}
              </div>
            </div>
            <div className="flex sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDecreaseDialogOpen(true);
                }}
                className="h-8 w-8 text-muted-foreground hover:text-orange-500 hover:bg-orange-500/10"
              >
                <MinusCircle className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDeleteDialogOpen(true);
                }}
                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditDialogOpen(true);
                }}
                className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 flex-wrap">
            {item.condition && (
              <Badge variant="secondary" className={`${getConditionColor(item.condition)} text-xs`}>
                {item.condition}
              </Badge>
            )}
            {item.notes && (
              <Badge variant="outline" className="text-xs text-muted-foreground bg-muted/50">
                Note
              </Badge>
            )}
            {item.purchaseLink && (
              <Badge variant="outline" className="text-xs text-primary bg-primary/10">
                Lien d'achat
              </Badge>
            )}
          </div>
        </div>
      </div>

      <DeleteItemDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={async () => {
          if (item.id) {
            await onDelete(item.id);
          }
          setIsDeleteDialogOpen(false);
        }}
        itemName={item.name}
      />

      <EditItemDialog
        item={item}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSave={onUpdate}
      />

      <DecreaseQuantityDialog
        item={item}
        isOpen={isDecreaseDialogOpen}
        onClose={() => setIsDecreaseDialogOpen(false)}
        onConfirm={async (quantity: number, note: string) => {
          if (item.id) {
            const newQuantity = item.quantity - quantity;
            await onUpdate(item.id, { 
              quantity: newQuantity,
              _decreaseNote: note,
              _decreaseQuantity: quantity,
            });
          }
        }}
      />

      <ItemDetails
        item={item}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onEdit={() => {
          setIsDetailsOpen(false);
          setIsEditDialogOpen(true);
        }}
      />
    </>
  );
}