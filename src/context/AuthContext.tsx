
"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

interface UserProfile {
    uid: string;
    email: string | null;
    role: 'admin' | 'user';
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; }>;
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
           // Se o usuário existe na Auth mas não no Firestore, cria o perfil.
           // Caso especial para o admin geral.
           const isAdmin = firebaseUser.email === 'cq.uia@ind.com.br';
           const userRole = isAdmin ? 'admin' : 'user';

           const newUserProfile: UserProfile = {
               uid: firebaseUser.uid,
               email: firebaseUser.email,
               role: userRole
           };
           await setDoc(userDocRef, { email: firebaseUser.email, role: userRole });
           setUser(newUserProfile);
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

    const isLoginPage = pathname === '/login';
    const isAppRoute = !isLoginPage;

    // Se não há usuário, mas está tentando acessar uma rota do app, redireciona para o login.
    if (!user && isAppRoute) {
      router.push('/login');
    }

    // Se há usuário, mas está na página de login, redireciona para a página principal.
    if (user && isLoginPage) {
       router.push('/');
    }
  }, [user, loading, pathname, router]);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // O onAuthStateChanged listener vai cuidar da atualização do estado e redirecionamento.
      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false };
    }
  };

  const logout = async () => {
    await signOut(auth);
    // O onAuthStateChanged vai detectar a ausência de usuário e o useEffect vai redirecionar para /login.
  };

  const value = { user, loading, login, logout };
  
  // Mostra um loader global em todas as páginas, exceto no login, enquanto a autenticação carrega.
  if (loading && pathname !== '/login') {
     return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <Loader2 className="size-8 animate-spin text-primary" />
        </div>
    );
  }

  // Renderiza a página de login imediatamente, mesmo durante o carregamento,
  // ou renderiza as outras páginas se o carregamento já terminou.
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
