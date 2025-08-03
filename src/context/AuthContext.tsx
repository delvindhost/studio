
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface UserProfile {
  nome: string;
  matricula: string;
  role: 'admin' | 'user';
  permissions: string[];
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        setUser(user);
        const userDocRef = doc(db, 'users', user.uid);
        
        // **CORREÇÃO DEFINITIVA:** Força o perfil de admin para o e-mail específico, 
        // garantindo acesso total e corrigindo o registro no Firestore.
        if (user.email === 'cq.uia@ind.com.br') {
            const adminProfile: UserProfile = { 
                nome: 'Admin UIA',
                matricula: 'admin', 
                role: 'admin', 
                permissions: ['/', '/registrar', '/visualizar', '/graficos', '/usuarios', '/configuracoes'] 
            };
            // Garante que o perfil no banco de dados esteja sempre correto, sobrescrevendo se necessário.
            await setDoc(userDocRef, adminProfile, { merge: true }); 
            setUserProfile(adminProfile);
        } else {
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                setUserProfile(userDoc.data() as UserProfile);
            } else {
                // Usuário logado mas sem perfil (não deve acontecer no fluxo normal)
                setUserProfile({ role: 'user', permissions: [], nome: 'Usuário', matricula: '' });
            }
        }
      } else {
        setUser(null);
        setUserProfile(null);
        // O redirecionamento foi movido para o AppLayout para evitar erros de renderização
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, userProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
