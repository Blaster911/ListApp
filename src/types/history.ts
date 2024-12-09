export type HistoryEntry = {
  id?: string;
  itemId: string;
  itemName: string;
  quantityChanged: number;
  previousQuantity: number;
  newQuantity: number;
  note?: string;
  timestamp: any;
  type: 'decrease' | 'increase' | 'update';
  userId: string;
};
