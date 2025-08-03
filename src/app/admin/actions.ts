
'use server';

import { z } from 'zod';
import { collection, getDocs, addDoc, deleteDoc, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/firebase-admin'; // We will create this file for server-side auth actions

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['admin', 'user']),
});

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
    const { email, password, role } = validatedData.data;

    // IMPORTANT: This now requires Firebase Admin SDK setup.
    // Create user in Firebase Authentication
    const userRecord = await auth.createUser({
      email,
      password,
    });
    
    // Create user profile in Firestore with the SAME UID
    await setDoc(doc(db, 'users', userRecord.uid), {
      email,
      role,
    });

    revalidatePath('/admin/users');
    return { success: true, message: 'Usuário criado com sucesso!' };
  } catch (error: any) {
    console.error(error);
    // Provide more specific error messages if possible
    if (error.code === 'auth/email-already-exists') {
      return { success: false, message: 'Este email já está em uso.' };
    }
    return { success: false, message: 'Erro ao criar usuário.' };
  }
}

export async function deleteUser(userId: string) {
  try {
    // IMPORTANT: This now requires Firebase Admin SDK setup.
    // Delete user from Firebase Authentication
    await auth.deleteUser(userId);

    // Delete user from Firestore
    await deleteDoc(doc(db, 'users', userId));
    
    revalidatePath('/admin/users');
    return { success: true, message: 'Usuário excluído com sucesso.' };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Erro ao excluir usuário.' };
  }
}
