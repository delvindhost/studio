"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

interface UserProfile {
    uid: string;
    email: string | null;
    role: 'admin' | 'user';
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
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
          // Se o documento não existe no Firestore, o usuário não está totalmente configurado.
          // A página de login cuidará da criação do documento.
          // Por segurança, não definimos um usuário aqui para evitar estados inconsistentes.
           setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    const isAuthPage = pathname === '/login';

    if (!user && !isAuthPage) {
      router.push('/login');
    }

    if (user && isAuthPage) {
       router.push('/');
    }
  }, [user, loading, pathname, router]);


  const logout = async () => {
    await auth.signOut();
    // onAuthStateChanged irá detectar a ausência de usuário e o useEffect irá redirecionar.
  };
  
  // Enquanto estiver carregando, mostra um spinner global.
  if (loading) {
     return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <Loader2 className="size-8 animate-spin text-primary" />
        </div>
    );
  }
  
  // Para evitar um piscar de conteúdo, não renderiza as páginas de destino
  // se um redirecionamento estiver prestes a acontecer.
  const isAuthPage = pathname === '/login';
  if ((!user && !isAuthPage) || (user && isAuthPage)) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      );
  }


  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
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
