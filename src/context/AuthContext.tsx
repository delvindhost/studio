
"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface UserProfile {
    uid: string;
    email: string | null;
    role: 'admin' | 'user';
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; role?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role: userData.role || 'user',
          });
        } else {
           // This case handles a user that exists in Auth but not Firestore.
           // We will create a default user doc for them.
           const defaultUserData = {
               uid: firebaseUser.uid,
               email: firebaseUser.email,
               role: 'user' as 'admin' | 'user'
           };
           await setDoc(userDocRef, { email: firebaseUser.email, role: 'user' });
           setUser(defaultUserData);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Se não estiver carregando, não houver usuário E não estiver na página de login, redirecione para o login.
    if (!loading && !user && pathname !== '/login') {
      router.push('/login');
    }
     // Se não estiver carregando, houver um usuário E estiver na página de login, redirecione para a home.
    if (!loading && user && pathname === '/login') {
        if(user.role === 'admin') {
            router.push('/admin');
        } else {
            router.push('/');
        }
    }

  }, [user, loading, pathname, router]);

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      let role = 'user';
      if (userDoc.exists()) {
        const userData = userDoc.data();
        role = userData.role || 'user';
      } else {
        // If user doc doesn't exist, create one with default 'user' role
        await setDoc(userDocRef, { email: firebaseUser.email, role: 'user' });
      }

      // O setUser aqui vai disparar o useEffect acima, que cuidará do redirecionamento
      // não é mais necessário setar o usuário aqui pois o onAuthStateChanged fará isso.
      
      return { success: true, role };

    } catch (error) {
      console.error("Login error:", error);
      return { success: false };
    }
  };

  const logout = async () => {
    await signOut(auth);
    // O setUser(null) será chamado pelo onAuthStateChanged, que vai disparar o useEffect de redirecionamento.
    router.push('/login');
  };

  const value = { user, loading, login, logout };

  return (
    <AuthContext.Provider value={value}>
        {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
