import { useState, useEffect } from 'react';
import { subscribeToItems } from '@/lib/firebase/items';
import type { Item } from '@/types/item';

export function useItems() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToItems(setItems);
    return () => unsubscribe();
  }, []);

  return { items };
}
