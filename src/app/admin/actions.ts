
'use server';

import { z } from 'zod';
import { collection, getDocs, addDoc, deleteDoc, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6), // Note: Password is for a simulated auth creation, not stored in Firestore.
  role: z.enum(['admin', 'user']),
});

// IMPORTANT: In a real application, you would use the Firebase Admin SDK
// securely on a backend server to create and manage users in Firebase Authentication.
// Since we can't run the Admin SDK here, we are only managing user *data* in Firestore.
// The user would need to be created in Firebase Auth separately (e.g., via the console).

export async function getUsers() {
  const usersCol = collection(db, 'users');
  const userSnapshot = await getDocs(usersCol);
  const userList = userSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
  return userList;
}

export async function createUser(data: z.infer<typeof createUserSchema>) {
  const validatedData = createUserSchema.safeParse(data);

  if (!validatedData.success) {
    return { success: false, message: 'Dados inválidos.' };
  }

  try {
    // This is a simplified user creation flow for this environment.
    // It does NOT create an authentication entry. It only creates the user data document in Firestore.
    // You must create the corresponding user in the Firebase Console Authentication tab.
    const { email, role } = validatedData.data;

    // We'll create a document in the 'users' collection.
    // In a real app, you would get the UID from `admin.auth().createUser()` and use it as the document ID.
    // For this simulation, we'll let Firestore auto-generate an ID. This means the connection
    // between Auth and Firestore data will need to be established manually or via another process.
    await addDoc(collection(db, 'users'), { email, role });

    revalidatePath('/admin/users');
    return { success: true, message: 'Usuário criado no Firestore. Lembre-se de criá-lo na Autenticação do Firebase.' };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Erro ao criar usuário no Firestore.' };
  }
}

export async function deleteUser(userId: string) {
  try {
    // This only deletes the Firestore document.
    // In a real app, you would also delete the user from Firebase Auth using the Admin SDK.
    await deleteDoc(doc(db, 'users', userId));
    revalidatePath('/admin/users');
    return { success: true, message: 'Usuário excluído do Firestore.' };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Erro ao excluir usuário do Firestore.' };
  }
}
