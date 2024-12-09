export interface Item {
  id?: string;
  name: string;
  quantity: number;
  category: string;
  location: string;
  condition?: 'Neuf' | 'Bon état' | 'Usage normal' | 'À remplacer';
  notes?: string;
  purchaseLink?: string;
  minStock?: number;
  optimalStock?: number;
  stockManagementEnabled?: boolean;
  createdAt?: string;
}