import { 
  collection, 
  addDoc, 
  query,
  orderBy,
  onSnapshot,
  where,
  serverTimestamp,
  type QuerySnapshot,
  type DocumentData
} from 'firebase/firestore';
import { db } from './config';
import type { HistoryEntry } from '@/types/history';

export const HISTORY_COLLECTION = 'history';

export const addHistoryEntry = async (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => {
  try {
    const entryWithTimestamp = {
      ...entry,
      timestamp: serverTimestamp()
    };
    const docRef = await addDoc(collection(db, HISTORY_COLLECTION), entryWithTimestamp);
    return docRef;
  } catch (error) {
    console.error('Error adding history entry:', error);
    throw error;
  }
};

export const subscribeToHistory = (
  onHistoryUpdate: (history: HistoryEntry[]) => void,
  itemId?: string
) => {
  let q = query(
    collection(db, HISTORY_COLLECTION),
    orderBy('timestamp', 'desc')
  );

  if (itemId) {
    q = query(
      collection(db, HISTORY_COLLECTION),
      where('itemId', '==', itemId),
      orderBy('timestamp', 'desc')
    );
  }

  return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
    const history = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as HistoryEntry[];
    
    onHistoryUpdate(history);
  });
};
