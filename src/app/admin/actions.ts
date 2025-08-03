
'use server';

import { z } from 'zod';
import { collection, getDocs, addDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['admin', 'user']),
});

// This is a server-side representation of the user, NOT a client-side one.
// It interacts with a separate, admin-initialized Firebase app.
// We are simulating the admin action here. For a real app, you'd use the Firebase Admin SDK.

// Mock Admin SDK setup. In a real project, this would be initialized securely on the server.
const createFirebaseUser = async (email: string, uid: string) => {
    // This is a placeholder for `admin.auth().createUser()`
    console.log(`Simulating user creation for email: ${email} with UID: ${uid}`);
    return { uid, email };
};

const deleteFirebaseUser = async (uid: string) => {
    // This is a placeholder for `admin.auth().deleteUser()`
    console.log(`Simulating user deletion for UID: ${uid}`);
    return;
}

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
    // In a real app, you would use the Firebase Admin SDK to create the user in Auth
    // For now, we'll just add them to the Firestore collection.
    // The password would not be stored here.
    const { email, role } = validatedData.data;
    
    // We'll use a simplified approach: add to Firestore and assume Auth user is created elsewhere
    // In a real app, you would get the UID from the Admin SDK user creation response
    const newUserRef = doc(collection(db, 'users'));
    await setDoc(newUserRef, { email, role });

    revalidatePath('/admin/users');
    return { success: true, message: 'Usuário criado com sucesso!' };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Erro ao criar usuário.' };
  }
}

export async function deleteUser(userId: string) {
  try {
    await deleteDoc(doc(db, 'users', userId));
    // In a real app, you'd also delete the user from Firebase Auth using the Admin SDK
    // await deleteFirebaseUser(userId);
    revalidatePath('/admin/users');
    return { success: true, message: 'Usuário excluído com sucesso.' };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Erro ao excluir usuário.' };
  }
}
