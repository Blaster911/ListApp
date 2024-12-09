import { useState, useEffect } from "react";
import { subscribeToItems } from "@/lib/firebase/items";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import { updateItem } from "@/lib/firebase/items";
import { useToast } from "@/hooks/use-toast";
import type { Item } from "@/types/item";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function StockManagementPage() {
  const [items, setItems] = useState<Item[]>([]);
  const { toast } = useToast();
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editValues, setEditValues] = useState({
    minStock: 0,
    optimalStock: 0,
    quantity: 0,
    note: "",
    removeQuantity: 0,
  });

  // Souscrire aux changements des items
  useEffect(() => {
    const unsubscribe = subscribeToItems(setItems);
    return () => unsubscribe();
  }, []);

  const stockItems = items.filter((item) => item.stockManagementEnabled);

  const handleItemClick = (item: Item) => {
    setSelectedItem(item);
    setEditValues({
      minStock: item.minStock || 0,
      optimalStock: item.optimalStock || 0,
      quantity: item.quantity || 0,
      note: "",
      removeQuantity: 1,
    });
    setIsDialogOpen(true);
  };

  const handleSaveChanges = async () => {
    if (!selectedItem) return;

    try {
      await updateItem(selectedItem.id, {
        minStock: editValues.minStock,
        optimalStock: editValues.optimalStock,
        quantity: editValues.quantity,
      });
      toast({
        title: "Succès",
        description: "Paramètres de stock mis à jour",
      });
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour des paramètres",
        variant: "destructive",
      });
    }
  };

  const handleRemoveQuantity = async () => {
    if (!selectedItem) return;

    if (editValues.quantity - editValues.removeQuantity < 0) {
      toast({
        title: "Erreur",
        description: "La quantité ne peut pas être négative",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateItem(selectedItem.id, {
        quantity: editValues.quantity - editValues.removeQuantity,
        _decreaseQuantity: editValues.removeQuantity,
        _decreaseNote: editValues.note,
      });
      toast({
        title: "Succès",
        description: "Quantité mise à jour",
      });
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour de la quantité",
        variant: "destructive",
      });
    }
  };

  const getStockStatus = (item: Item) => {
    const quantity = item.quantity || 0;
    const minStock = item.minStock || 0;
    const optimalStock = item.optimalStock || 0;

    if (quantity <= minStock) {
      return {
        status: "critical",
        color: "bg-red-500",
        message: "Stock critique",
        progress: (quantity / optimalStock) * 100,
      };
    } else if (quantity < optimalStock) {
      return {
        status: "warning",
        color: "bg-yellow-500",
        message: "Stock bas",
        progress: (quantity / optimalStock) * 100,
      };
    } else {
      return {
        status: "normal",
        color: "bg-green-500",
        message: "Stock normal",
        progress: 100,
      };
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gestion des stocks</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stockItems.map((item) => {
          const stockStatus = getStockStatus(item);
          return (
            <Card
              key={item.id}
              className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleItemClick(item)}
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold">{item.name}</h2>
                <span
                  className={`px-2 py-1 rounded-full text-xs text-white ${stockStatus.color}`}
                >
                  {stockStatus.message}
                </span>
              </div>
              <div className="space-y-2">
                <Progress value={stockStatus.progress} className="h-2" />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Min: {item.minStock || 0}</span>
                  <span>Optimal: {item.optimalStock || 0}</span>
                  <span>Actuel: {item.quantity || 0}</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Modifier les paramètres de stock - {selectedItem?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Stock actuel</Label>
              <Input
                id="quantity"
                type="number"
                value={editValues.quantity}
                onChange={(e) =>
                  setEditValues({
                    ...editValues,
                    quantity: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minStock">Stock minimum</Label>
              <Input
                id="minStock"
                type="number"
                value={editValues.minStock}
                onChange={(e) =>
                  setEditValues({
                    ...editValues,
                    minStock: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="optimalStock">Stock optimal</Label>
              <Input
                id="optimalStock"
                type="number"
                value={editValues.optimalStock}
                onChange={(e) =>
                  setEditValues({
                    ...editValues,
                    optimalStock: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Retirer des éléments</h3>
              <div className="space-y-2">
                <Label htmlFor="removeQuantity">Quantité à retirer</Label>
                <Input
                  id="removeQuantity"
                  type="number"
                  value={editValues.removeQuantity}
                  onChange={(e) =>
                    setEditValues({
                      ...editValues,
                      removeQuantity: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2 mt-2">
                <Label htmlFor="note">Note (optionnelle)</Label>
                <Textarea
                  id="note"
                  value={editValues.note}
                  onChange={(e) =>
                    setEditValues({
                      ...editValues,
                      note: e.target.value,
                    })
                  }
                  placeholder="Raison du retrait..."
                />
              </div>
              <Button 
                onClick={handleRemoveQuantity} 
                variant="secondary"
                className="w-full mt-2"
              >
                Retirer {editValues.removeQuantity} élément(s)
              </Button>
            </div>
            <Button onClick={handleSaveChanges} className="w-full">
              Enregistrer les modifications
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
