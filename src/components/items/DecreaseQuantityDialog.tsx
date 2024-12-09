import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Textarea } from "@/components/ui/textarea";
import type { Item } from '@/types/item';

interface DecreaseQuantityDialogProps {
  item: Item;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (quantity: number, note: string) => Promise<void>;
}

const formSchema = z.object({
  quantity: z.number()
    .min(1, 'La quantité doit être supérieure à 0')
    .refine((n) => Number.isInteger(n), 'La quantité doit être un nombre entier'),
  note: z.string().optional(),
});

export function DecreaseQuantityDialog({ 
  item, 
  isOpen, 
  onClose, 
  onConfirm 
}: DecreaseQuantityDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantity: 1,
      note: '',
    },
  });

  const onSubmit = async (data: { quantity: number; note?: string }) => {
    if (data.quantity > item.quantity) {
      alert('La quantité ne peut pas être supérieure au stock actuel');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onConfirm(data.quantity, data.note || '');
      reset();
      onClose();
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Déclarer des unités manquantes</DialogTitle>
          <DialogDescription>
            Indiquez le nombre d'unités manquantes pour {item.name}. 
            Stock actuel : {item.quantity}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="quantity">Nombre d'unités manquantes</Label>
            <Input
              id="quantity"
              type="number"
              {...register('quantity', { valueAsNumber: true })}
              className="mt-1"
            />
            {errors.quantity && (
              <p className="text-sm text-red-500 mt-1">{errors.quantity.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="note">Note (optionnelle)</Label>
            <Textarea
              id="note"
              {...register('note')}
              placeholder="Ex: Cassé pendant le déménagement"
              className="mt-1"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" type="button" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              Confirmer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
