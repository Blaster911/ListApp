import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth';
import { app } from './config';

export const auth = getAuth(app);

export const signIn = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error: any) {
    switch (error.code) {
      case 'auth/user-not-found':
        throw new Error('Utilisateur non trouvé');
      case 'auth/wrong-password':
        throw new Error('Mot de passe incorrect');
      default:
        throw new Error('Erreur lors de la connexion');
    }
  }
};

export const signUp = async (email: string, password: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('Cette adresse email est déjà utilisée');
    }
    throw new Error('Erreur lors de la création du compte');
  }
};

export const signOut = () => firebaseSignOut(auth);

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};