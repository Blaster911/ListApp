import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import type { Item } from '@/types/item';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { deleteItem, subscribeToItems } from '@/lib/firebase/items';

export function ItemList() {
  const [items, setItems] = useState<Item[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = subscribeToItems(setItems);
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteItem(id);
      toast({
        title: 'Objet supprimé',
        description: 'L\'objet a été supprimé avec succès.',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la suppression.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">{item.name}</h3>
              <p className="text-sm text-gray-600">
                Quantité: {item.quantity} | Catégorie: {item.category}
              </p>
              <p className="text-sm text-gray-600">Emplacement: {item.location}</p>
              {item.notes && (
                <p className="text-sm text-gray-500 mt-2">{item.notes}</p>
              )}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(item.id!)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
      {items.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Aucun objet dans l'inventaire
        </div>
      )}
    </div>
  );
}