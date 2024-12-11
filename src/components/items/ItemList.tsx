import { useEffect, useState } from 'react';
import { AlertCircle, BedDouble } from 'lucide-react';
import type { Item } from '@/types/item';
import { useToast } from '@/hooks/use-toast';
import { deleteItem, subscribeToItems, updateItem } from '@/lib/firebase/items';
import { ItemCard } from './ItemCard';
import { LocationFilter } from './LocationFilter';

export function ItemList() {
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState('toutes les pièces');
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = subscribeToItems((newItems) => {
      // Trier les items par emplacement puis par catégorie
      const sortedItems = [...newItems].sort((a, b) => {
        const locationCompare = (a.location || '').toLowerCase().localeCompare((b.location || '').toLowerCase());
        if (locationCompare !== 0) return locationCompare;
        return (a.category || '').toLowerCase().localeCompare((b.category || '').toLowerCase());
      });
      setItems(sortedItems);
      setError(null);
    });

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
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue lors de la suppression.';
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleUpdate = async (id: string, data: Partial<Item>) => {
    try {
      await updateItem(id, data);
      toast({
        title: 'Objet modifié',
        description: 'L\'objet a été modifié avec succès.',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue lors de la modification.';
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const filteredItems = selectedLocation === 'toutes les pièces'
    ? items
    : items.filter(item => item.location?.toLowerCase() === selectedLocation.toLowerCase());

  // Grouper les items par emplacement
  const groupedItems = selectedLocation === 'toutes les pièces'
    ? filteredItems.reduce((acc, item) => {
        const location = item.location || 'sans emplacement';
        if (!acc[location]) {
          acc[location] = [];
        }
        acc[location].push(item);
        return acc;
      }, {} as Record<string, Item[]>)
    : { [selectedLocation]: filteredItems };

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <p className="ml-3 text-sm text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Liste des objets</h2>
        <LocationFilter
          selectedLocation={selectedLocation}
          onLocationChange={setSelectedLocation}
        />
      </div>

      <div className="space-y-4">
        {Object.entries(groupedItems)
          .sort(([locA], [locB]) => locA.toLowerCase().localeCompare(locB.toLowerCase()))
          .map(([location, locationItems]) => (
          <div key={location} className="glass rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
            <h3 className="text-lg font-semibold pb-3 mb-4 flex items-center border-b border-purple-100/20">
              <div className="flex items-center bg-gradient-to-r from-purple-600/90 to-fuchsia-600/90 text-white px-3 py-1.5 rounded-lg shadow-sm">
                <BedDouble className="h-5 w-5 mr-2" />
                {location}
              </div>
              <div className="ml-3 text-sm text-purple-600/60 font-medium">
                {locationItems.length} {locationItems.length > 1 ? 'objets' : 'objet'}
              </div>
            </h3>
            <div className="grid gap-3">
              {locationItems
                .sort((a, b) => (a.category || '').toLowerCase().localeCompare((b.category || '').toLowerCase()))
                .map((item) => (
                <ItemCard 
                  key={item.id} 
                  item={item} 
                  onDelete={handleDelete}
                  onUpdate={handleUpdate}
                />
              ))}
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="glass rounded-xl p-8 text-center">
            <div className="flex flex-col items-center justify-center text-muted-foreground">
              <BedDouble className="h-8 w-8 mb-3 opacity-60" />
              <p className="text-base font-medium text-primary/80">
                {selectedLocation === 'toutes les pièces'
                  ? 'Aucun objet dans l\'inventaire'
                  : `Aucun objet dans ${selectedLocation}`}
              </p>
              <p className="text-sm text-muted-foreground/80 mt-1">
                {selectedLocation === 'toutes les pièces'
                  ? 'Commencez par ajouter des objets'
                  : 'Ajoutez des objets dans cette pièce'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}