import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Item } from "@/types/item";

const formSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  quantity: z.number().min(0, "La quantité doit être positive"),
  category: z.string().min(1, "La catégorie est requise"),
  location: z.string().min(1, "L'emplacement est requis"),
  purchaseLink: z.union([
    z.string().url('Le lien doit être une URL valide'),
    z.string().length(0)
  ]).optional(),
  stockManagementEnabled: z.boolean().optional(),
  minStock: z.number().min(0).optional(),
  optimalStock: z.number().min(0).optional(),
  condition: z.string().optional(),
  notes: z.string().optional(),
});

const categories = [
  "Linge de maison",
  "Cuisine",
  "Salle de bain",
  "Chambre",
  "Salon",
  "Électroménager",
  "Décoration",
  "Nettoyage",
  "Divers",
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
  "Neuf",
  "Bon état",
  "Usage normal",
  "À remplacer",
] as const;

interface EditItemDialogProps {
  item: Item;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, data: Partial<Item>) => Promise<void>;
}

export function EditItemDialog({ item, isOpen, onClose, onSave }: EditItemDialogProps) {
  const { register, handleSubmit, setValue, reset, formState: { errors }, watch, control } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: item.name,
      quantity: item.quantity,
      category: item.category,
      location: item.location,
      purchaseLink: item.purchaseLink || '',
      stockManagementEnabled: item.stockManagementEnabled || false,
      minStock: item.minStock,
      optimalStock: item.optimalStock,
      condition: item.condition,
      notes: item.notes,
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        name: item.name,
        quantity: item.quantity,
        category: item.category,
        location: item.location,
        purchaseLink: item.purchaseLink || '',
        stockManagementEnabled: item.stockManagementEnabled || false,
        minStock: item.minStock,
        optimalStock: item.optimalStock,
        condition: item.condition,
        notes: item.notes,
      });
    }
  }, [isOpen, item, reset]);

  const onSubmit = async (data: any) => {
    if (item.id) {
      await onSave(item.id, data);
      onClose();
    }
  };

  const stockManagementEnabled = watch("stockManagementEnabled");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modifier l'objet</DialogTitle>
          <DialogDescription>
            Modifiez les informations de l'objet dans le formulaire ci-dessous.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Nom de l'objet</Label>
            <Input
              id="name"
              {...register("name")}
              className="mt-1"
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="quantity">Quantité</Label>
            <Input
              id="quantity"
              type="number"
              {...register("quantity", { valueAsNumber: true })}
              className="mt-1"
            />
            {errors.quantity && (
              <p className="text-sm text-red-500 mt-1">{errors.quantity.message}</p>
            )}
          </div>

          <div>
            <Label>Catégorie</Label>
            <Combobox
              items={categories}
              placeholder="Sélectionnez une catégorie"
              onSelect={(value) => setValue("category", value)}
              defaultValue={item.category}
            />
            {errors.category && (
              <p className="text-sm text-red-500 mt-1">{errors.category.message}</p>
            )}
          </div>

          <div>
            <Label>Emplacement</Label>
            <Combobox
              items={locations}
              placeholder="Sélectionnez un emplacement"
              onSelect={(value) => setValue("location", value)}
              defaultValue={item.location}
            />
            {errors.location && (
              <p className="text-sm text-red-500 mt-1">{errors.location.message}</p>
            )}
          </div>

          <div>
            <Label>État (optionnel)</Label>
            <Select 
              onValueChange={(value) => setValue("condition", value)}
              defaultValue={item.condition}
            >
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
              {...register("notes")}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="purchaseLink">Lien d'achat (optionnel)</Label>
            <Input
              id="purchaseLink"
              type="url"
              {...register("purchaseLink")}
              placeholder="Ex: https://www.amazon.fr/..."
              className="mt-1"
            />
            {errors.purchaseLink && (
              <p className="text-sm text-red-500 mt-1">{errors.purchaseLink.message}</p>
            )}
          </div>

          <div className="flex flex-row items-start space-x-3 space-y-0 py-4">
            <div className="space-y-1 leading-none">
              <Label>
                Activer la gestion des stocks
              </Label>
            </div>
            <Input
              type="checkbox"
              {...register("stockManagementEnabled")}
              className="mt-1"
            />
          </div>

          {stockManagementEnabled && (
            <>
              <div>
                <Label>Stock minimum</Label>
                <Input
                  type="number"
                  {...register("minStock", { valueAsNumber: true })}
                  className="mt-1"
                />
                {errors.minStock && (
                  <p className="text-sm text-red-500 mt-1">{errors.minStock.message}</p>
                )}
              </div>

              <div>
                <Label>Stock optimal</Label>
                <Input
                  type="number"
                  {...register("optimalStock", { valueAsNumber: true })}
                  className="mt-1"
                />
                {errors.optimalStock && (
                  <p className="text-sm text-red-500 mt-1">{errors.optimalStock.message}</p>
                )}
              </div>
            </>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" type="button" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              Enregistrer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}