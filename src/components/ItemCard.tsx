import { useState } from 'react';
import { Trash2, MapPin, Package, Tag, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DeleteItemDialog } from './items/DeleteItemDialog';
import { EditItemDialog } from './items/EditItemDialog';
import type { Item } from '@/types/item';
import { Badge } from '@/components/ui/badge';

interface ItemCardProps {
  item: Item;
  onDelete: (id: string) => Promise<void>;
  onUpdate: (id: string, data: Partial<Item>) => Promise<void>;
}

export function ItemCard({ item, onDelete, onUpdate }: ItemCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleDelete = async () => {
    if (item.id) {
      await onDelete(item.id);
    }
    setIsDeleteDialogOpen(false);
  };

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
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
        <div className="p-4">
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                {item.condition && (
                  <Badge variant="secondary" className={`mt-1 ${getConditionColor(item.condition)}`}>
                    {item.condition}
                  </Badge>
                )}
              </div>
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditDialogOpen(true)}
                  className="text-gray-400 hover:text-blue-500"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <Package className="h-4 w-4 mr-2" />
                <span>Quantité: {item.quantity}</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <Tag className="h-4 w-4 mr-2" />
                <span>Catégorie: {item.category}</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                <span>Emplacement: {item.location}</span>
              </div>
            </div>

            {item.notes && (
              <p className="text-sm text-gray-500 pt-2 border-t">
                {item.notes}
              </p>
            )}
          </div>
        </div>
      </div>

      <DeleteItemDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        itemName={item.name}
      />

      <EditItemDialog
        item={item}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSave={onUpdate}
      />
    </>
  );
}