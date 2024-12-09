import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { HistoryEntry } from '@/types/history';
import { subscribeToHistory } from '@/lib/firebase/history';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export function HistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  useEffect(() => {
    const unsubscribe = subscribeToHistory(setHistory);
    return () => unsubscribe();
  }, []);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'decrease':
        return { label: 'Stock retiré', color: 'bg-red-100 text-red-800' };
      case 'increase':
        return { label: 'Stock ajouté', color: 'bg-green-100 text-green-800' };
      case 'update':
        return { label: 'Mise à jour', color: 'bg-blue-100 text-blue-800' };
      default:
        return { label: type, color: 'bg-gray-100 text-gray-800' };
    }
  };

  // Calculer le nombre total de pages
  const totalPages = Math.ceil(history.length / itemsPerPage);

  // Obtenir les éléments de la page courante
  const currentItems = history.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Générer les numéros de page à afficher
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Afficher toutes les pages si moins que maxVisiblePages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Toujours afficher la première page
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('ellipsis');
      }
      
      // Pages autour de la page courante
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(currentPage + 1, totalPages - 1); i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('ellipsis');
      }
      
      // Toujours afficher la dernière page
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Historique des modifications</h1>
      
      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Objet</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Quantité</TableHead>
              <TableHead>Note</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.map((entry) => {
              const { label, color } = getTypeLabel(entry.type);
              return (
                <TableRow key={entry.id}>
                  <TableCell>
                    {entry.timestamp?.toDate
                      ? format(entry.timestamp.toDate(), 'PPp', { locale: fr })
                      : 'Date inconnue'}
                  </TableCell>
                  <TableCell>{entry.itemName}</TableCell>
                  <TableCell>
                    <Badge className={color}>
                      {label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {entry.type === 'decrease' ? '-' : '+'}{Math.abs(entry.quantityChanged)}
                    <span className="text-gray-500 text-sm">
                      {' '}({entry.previousQuantity} → {entry.newQuantity})
                    </span>
                  </TableCell>
                  <TableCell>{entry.note || '-'}</TableCell>
                </TableRow>
              );
            })}
            {history.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                  Aucun historique disponible
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="py-4 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>

                {getPageNumbers().map((pageNum, index) => (
                  <PaginationItem key={index}>
                    {pageNum === 'ellipsis' ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        onClick={() => setCurrentPage(pageNum as number)}
                        isActive={currentPage === pageNum}
                        className="cursor-pointer"
                      >
                        {pageNum}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
}
