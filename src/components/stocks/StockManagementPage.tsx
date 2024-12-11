import { useState, useEffect, useMemo } from "react";
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
import { ListFilter, AlertCircle, FileDown } from "lucide-react";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  const [filterStatus, setFilterStatus] = useState<'all' | 'warning'>('all');

  // Souscrire aux changements des items
  useEffect(() => {
    const unsubscribe = subscribeToItems(setItems);
    return () => unsubscribe();
  }, []);

  const stockItems = items.filter((item) => item.stockManagementEnabled);

  const getStockStatus = (item: Item) => {
    const quantity = item.quantity || 0;
    const minStock = item.minStock || 0;
    const optimalStock = item.optimalStock || 0;

    if (quantity <= minStock) {
      return {
        status: "critical",
        startColor: "#dc2626", // red-600
        endColor: "#e11d48", // rose-600
        message: "Stock critique",
        progress: (quantity / optimalStock) * 100,
      };
    } else if (quantity < optimalStock) {
      return {
        status: "warning",
        startColor: "#c026d3", // fuchsia-600
        endColor: "#f43f5e", // rose-500
        message: "Stock bas",
        progress: (quantity / optimalStock) * 100,
      };
    } else {
      return {
        status: "normal",
        startColor: "#9333ea", // purple-600
        endColor: "#c026d3", // fuchsia-600
        message: "Stock normal",
        progress: 100,
      };
    }
  };

  const filteredStockItems = useMemo(() => {
    if (filterStatus === 'all') return stockItems;
    return stockItems.filter(item => {
      const quantity = item.quantity || 0;
      const minStock = item.minStock || 0;
      const optimalStock = item.optimalStock || 0;
      return quantity <= minStock || quantity < optimalStock;
    });
  }, [stockItems, filterStatus]);

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

  const CircleProgress = ({ progress, startColor, endColor }: { progress: number, startColor: string, endColor: string }) => {
    const radius = 28;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;
    const gradientId = `gradient-${startColor.replace('#', '')}-${endColor.replace('#', '')}`;

    return (
      <div className="relative w-20 h-20 flex items-center justify-center">
        <svg className="w-16 h-16 -rotate-90 transform">
          <defs>
            <linearGradient id={gradientId}>
              <stop offset="0%" stopColor={startColor} />
              <stop offset="100%" stopColor={endColor} />
            </linearGradient>
          </defs>
          <circle
            className="text-purple-100/50"
            strokeWidth="8"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="32"
            cy="32"
          />
          <circle
            strokeWidth="8"
            stroke={`url(#${gradientId})`}
            fill="transparent"
            r={radius}
            cx="32"
            cy="32"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: strokeDashoffset,
              transition: 'stroke-dashoffset 0.5s ease'
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-medium">{Math.round(progress)}%</span>
        </div>
      </div>
    );
  };

  const generateStockReport = () => {
    const lowStockItems = stockItems.filter(item => {
      const quantity = item.quantity || 0;
      const minStock = item.minStock || 0;
      const optimalStock = item.optimalStock || 0;
      return quantity <= minStock || quantity < optimalStock;
    });

    if (lowStockItems.length === 0) {
      toast({
        title: "Aucun stock bas ou critique",
        description: "Tous les stocks sont à un niveau normal.",
        variant: "default",
      });
      return;
    }

    const doc = new jsPDF();
    const today = new Date().toLocaleDateString('fr-FR');

    // En-tête
    doc.setFontSize(20);
    doc.text('Rapport des Stocks à Commander', 20, 20);
    doc.setFontSize(12);
    doc.text(`Date: ${today}`, 20, 30);

    // Préparation des données pour le tableau
    const tableData = lowStockItems.map(item => {
      const quantity = item.quantity || 0;
      const optimalStock = item.optimalStock || 0;
      const toOrder = optimalStock - quantity;
      const status = quantity <= (item.minStock || 0) ? 'CRITIQUE' : 'BAS';
      
      return [
        item.name,
        status,
        quantity.toString(),
        optimalStock.toString(),
        toOrder.toString(),
      ];
    });

    // Création du tableau
    autoTable(doc, {
      head: [['Produit', 'État', 'Stock Actuel', 'Stock Optimal', 'Quantité à Commander']],
      body: tableData,
      startY: 40,
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [147, 51, 234], // purple-600
      },
      alternateRowStyles: {
        fillColor: [243, 244, 246], // gray-100
      },
    });

    // Pied de page
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(
        `Page ${i} sur ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    // Sauvegarde du PDF
    doc.save(`stocks-a-commander-${today}.pdf`);
    
    toast({
      title: "PDF généré avec succès",
      description: "Le rapport des stocks à commander a été téléchargé.",
      variant: "default",
    });
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-4">
        <h1 className="text-2xl font-bold">Gestion des stocks</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant={filterStatus === 'all' ? "default" : "outline"}
            onClick={() => setFilterStatus('all')}
            className="flex-1 sm:flex-none text-sm h-8 px-3"
          >
            <ListFilter className="h-4 w-4 sm:mr-2 md:mr-2" />
            <span className="hidden sm:inline">Tous les stocks</span>
            <span className="sm:hidden">Tous</span>
          </Button>
          <Button
            variant={filterStatus === 'warning' ? "default" : "outline"}
            onClick={() => setFilterStatus('warning')}
            className="flex-1 sm:flex-none text-sm h-8 px-3"
          >
            <AlertCircle className="h-4 w-4 sm:mr-2 md:mr-2" />
            <span className="hidden sm:inline">Stocks bas/critiques</span>
            <span className="sm:hidden">Bas/Critiques</span>
          </Button>
          <Button
            variant="outline"
            onClick={generateStockReport}
            className="flex-1 sm:flex-none text-sm h-8 px-3"
          >
            <FileDown className="h-4 w-4 sm:mr-2 md:mr-2" />
            <span className="hidden sm:inline">Générer PDF</span>
            <span className="sm:hidden">PDF</span>
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStockItems.map((item) => {
          const stockStatus = getStockStatus(item);
          return (
            <Card
              key={item.id}
              className="glass p-4 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleItemClick(item)}
            >
              <div className="flex items-center space-x-4">
                <CircleProgress 
                  progress={stockStatus.progress} 
                  startColor={stockStatus.startColor} 
                  endColor={stockStatus.endColor}
                />
                <div className="flex-grow">
                  <h2 className="text-lg font-semibold">{item.name}</h2>
                  <div className="flex items-center space-x-2">
                    <span 
                      className="px-2 py-0.5 rounded text-xs text-white" 
                      style={{
                        background: `linear-gradient(to right, ${stockStatus.startColor}, ${stockStatus.endColor})`
                      }}
                    >
                      {stockStatus.message}
                    </span>
                  </div>
                  <div className="text-sm text-purple-900/60 mt-1">
                    <span className="font-medium">{item.quantity || 0}</span>
                    <span className="mx-1">/</span>
                    <span>{item.optimalStock || 0}</span>
                    <span className="text-xs ml-2">(Min: {item.minStock || 0})</span>
                  </div>
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
