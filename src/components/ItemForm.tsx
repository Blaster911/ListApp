import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { addItem } from '@/lib/firebase/items';
import { Combobox } from '@/components/ui/combobox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  quantity: z.number().min(1, 'La quantité doit être supérieure à 0'),
  category: z.string().min(2, 'La catégorie doit contenir au moins 2 caractères'),
  location: z.string().min(2, 'L\'emplacement doit contenir au moins 2 caractères'),
  condition: z.string().optional(),
  notes: z.string().optional(),
  purchaseLink: z.union([
    z.string().url('Le lien doit être une URL valide'),
    z.string().length(0)
  ]).optional(),
  stockManagementEnabled: z.boolean().optional(),
  minStock: z.number().min(0).optional(),
  optimalStock: z.number().min(0).optional(),
});

const categories = [
  'Linge de maison',
  'Cuisine',
  'Salle de bain',
  'Chambre',
  'Salon',
  'Électroménager',
  'Décoration',
  'Nettoyage',
  'Divers'
];

const locations = [
  'Entrée',
  'Salon',
  'Cuisine',
  'Grande chambre',
  'Dressing',
  'Petite chambre',
  'Salle de bain',
  'Toilettes',
  'Cave',
  'Buanderie',
  'Autres'
];

const conditions = [
  'Neuf',
  'Bon état',
  'Usage normal',
  'À remplacer'
] as const;

export function ItemForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, reset, setValue, formState: { errors }, watch } = useForm({
    resolver: zodResolver(formSchema),
  });

  const stockManagementEnabled = watch("stockManagementEnabled");

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const itemData = {
        ...data,
        minStock: data.stockManagementEnabled ? data.minStock : undefined,
        optimalStock: data.stockManagementEnabled ? data.optimalStock : undefined,
      };
      await addItem(itemData);
      
      // Sauvegarder les valeurs actuelles
      const currentCategory = data.category;
      const currentLocation = data.location;
      const currentCondition = data.condition;
      const currentStockManagement = data.stockManagementEnabled;
      const currentMinStock = data.minStock;
      const currentOptimalStock = data.optimalStock;

      // Réinitialiser le formulaire
      reset();

      // Restaurer les valeurs sauvegardées
      setValue('category', currentCategory);
      setValue('location', currentLocation);
      if (currentCondition) {
        setValue('condition', currentCondition);
      }
      if (currentStockManagement) {
        setValue('stockManagementEnabled', currentStockManagement);
        if (currentMinStock) setValue('minStock', currentMinStock);
        if (currentOptimalStock) setValue('optimalStock', currentOptimalStock);
      }

      toast({
        title: 'Objet ajouté avec succès',
        description: `${data.name} a été ajouté à l'inventaire.`,
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de l\'ajout de l\'objet.',
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Nom de l'objet</Label>
        <Input
          id="name"
          {...register('name')}
          placeholder="Ex: Serviettes de bain"
          className="mt-1"
        />
        {errors.name && (
          <p className="text-sm text-red-500 mt-1">{errors.name.message as string}</p>
        )}
      </div>

      <div>
        <Label htmlFor="quantity">Quantité</Label>
        <Input
          id="quantity"
          type="number"
          {...register('quantity', { valueAsNumber: true })}
          placeholder="Ex: 4"
          className="mt-1"
        />
        {errors.quantity && (
          <p className="text-sm text-red-500 mt-1">{errors.quantity.message as string}</p>
        )}
      </div>

      <div>
        <Label>Catégorie</Label>
        <Combobox
          items={categories}
          placeholder="Sélectionnez une catégorie"
          onSelect={(value) => setValue('category', value)}
        />
        {errors.category && (
          <p className="text-sm text-red-500 mt-1">{errors.category.message as string}</p>
        )}
      </div>

      <div>
        <Label>Emplacement</Label>
        <Combobox
          items={locations}
          placeholder="Sélectionnez un emplacement"
          onSelect={(value) => setValue('location', value)}
        />
        {errors.location && (
          <p className="text-sm text-red-500 mt-1">{errors.location.message as string}</p>
        )}
      </div>

      <div>
        <Label>État (optionnel)</Label>
        <Select onValueChange={(value) => setValue('condition', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionnez l'état" />
          </SelectTrigger>
          <SelectContent>
            {conditions.map((condition) => (
              <SelectItem key={condition} value={condition}>
                {condition}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="notes">Notes (optionnel)</Label>
        <Input
          id="notes"
          {...register('notes')}
          placeholder="Ex: Couleur blanche, 100% coton"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="purchaseLink">Lien d'achat (optionnel)</Label>
        <Input
          id="purchaseLink"
          type="url"
          {...register('purchaseLink')}
          placeholder="Ex: https://www.amazon.fr/..."
          className="mt-1"
        />
        {errors.purchaseLink && (
          <p className="text-sm text-red-500 mt-1">{errors.purchaseLink.message as string}</p>
        )}
      </div>

      <div>
        <Label>Activer la gestion des stocks</Label>
        <Checkbox
          checked={stockManagementEnabled}
          onCheckedChange={(value) => setValue('stockManagementEnabled', value)}
        />
      </div>

      {stockManagementEnabled && (
        <>
          <div>
            <Label htmlFor="minStock">Stock minimum</Label>
            <Input
              id="minStock"
              type="number"
              {...register('minStock', { valueAsNumber: true })}
              placeholder="Ex: 2"
              className="mt-1"
            />
            {errors.minStock && (
              <p className="text-sm text-red-500 mt-1">{errors.minStock.message as string}</p>
            )}
          </div>

          <div>
            <Label htmlFor="optimalStock">Stock optimal</Label>
            <Input
              id="optimalStock"
              type="number"
              {...register('optimalStock', { valueAsNumber: true })}
              placeholder="Ex: 5"
              className="mt-1"
            />
            {errors.optimalStock && (
              <p className="text-sm text-red-500 mt-1">{errors.optimalStock.message as string}</p>
            )}
          </div>
        </>
      )}

      <Button type="submit" disabled={isLoading} className="w-full">
        <PlusCircle className="mr-2 h-4 w-4" />
        Ajouter l'objet
      </Button>
    </form>
  );
}