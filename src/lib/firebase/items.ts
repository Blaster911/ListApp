import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  updateDoc,
  getDoc,
  deleteField,
  type QuerySnapshot,
  type DocumentData
} from 'firebase/firestore';
import { db } from './config';
import type { Item } from '@/types/item';
import { addHistoryEntry } from './history';
import { auth } from './config';

export const ITEMS_COLLECTION = 'items';

const handleFirebaseError = (error: any, operation: string) => {
  console.error(`Error during ${operation}:`, error);
  if (error.code === 'permission-denied') {
    throw new Error('Erreur d\'accès à la base de données. Veuillez vérifier vos permissions.');
  }
  throw error;
};

export const addItem = async (item: Omit<Item, 'id' | 'createdAt'>) => {
  try {
    // Nettoyer les données avant l'ajout
    const itemData = Object.entries(item).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);

    // Ajouter le timestamp
    itemData.createdAt = serverTimestamp();

    // Ajouter l'item
    const docRef = await addDoc(collection(db, ITEMS_COLLECTION), itemData);

    // Ajouter à l'historique
    await addHistoryEntry({
      itemId: docRef.id,
      itemName: itemData.name,
      type: 'create',
      quantityChanged: itemData.quantity,
      previousQuantity: 0,
      newQuantity: itemData.quantity,
      userId: auth.currentUser?.uid || '',
      details: 'Création de l\'objet'
    });

    return docRef;
  } catch (error) {
    handleFirebaseError(error, 'adding item');
  }
};

export const updateItem = async (itemId: string, updates: Partial<Item>) => {
  try {
    const itemRef = doc(db, ITEMS_COLLECTION, itemId);
    
    // Récupérer l'état actuel de l'item
    const itemSnap = await getDoc(itemRef);
    const currentItem = itemSnap.data() as Item;

    // Nettoyer les mises à jour
    const cleanUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
      if (value === undefined) {
        acc[key] = deleteField();
      } else {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);

    // Mettre à jour l'item
    await updateDoc(itemRef, cleanUpdates);

    // Ajouter à l'historique si la quantité a changé
    if ('quantity' in updates && updates.quantity !== currentItem.quantity) {
      const quantityDiff = Number(updates.quantity) - Number(currentItem.quantity);
      const type = quantityDiff < 0 ? 'decrease' : 'increase';
      const historyData: any = {
        itemId,
        itemName: currentItem.name,
        type,
        quantityChanged: quantityDiff,
        previousQuantity: currentItem.quantity,
        newQuantity: updates.quantity || 0,
        userId: auth.currentUser?.uid || ''
      };

      if ('_decreaseNote' in updates && updates._decreaseNote) {
        historyData.note = updates._decreaseNote;
      }

      await addHistoryEntry(historyData);
    }

    // Ajouter à l'historique pour les autres modifications
    const otherChanges = Object.keys(cleanUpdates).filter(key => key !== 'quantity');
    if (otherChanges.length > 0) {
      await addHistoryEntry({
        itemId,
        itemName: currentItem.name,
        type: 'update',
        quantityChanged: 0,
        previousQuantity: currentItem.quantity,
        newQuantity: currentItem.quantity,
        userId: auth.currentUser?.uid || '',
        details: `Modification des champs: ${otherChanges.join(', ')}`
      });
    }
  } catch (error) {
    handleFirebaseError(error, 'updating item');
  }
};

export const deleteItem = async (id: string) => {
  try {
    await deleteDoc(doc(db, ITEMS_COLLECTION, id));
  } catch (error) {
    handleFirebaseError(error, 'deleting item');
  }
};

export const subscribeToItems = (onItemsUpdate: (items: Item[]) => void) => {
  const itemsQuery = query(
    collection(db, ITEMS_COLLECTION),
    orderBy('createdAt', 'desc')
  );

  const handleSnapshot = (snapshot: QuerySnapshot<DocumentData>) => {
    const items = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString()
    })) as Item[];
    onItemsUpdate(items);
  };

  const handleError = (error: any) => {
    console.error('Error in items subscription:', error);
    if (error.code === 'permission-denied') {
      console.error('Please update Firestore rules in Firebase Console');
    }
    onItemsUpdate([]);
  };

  return onSnapshot(itemsQuery, handleSnapshot, handleError);
};