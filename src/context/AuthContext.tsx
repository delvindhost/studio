
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
        
        // CORREÇÃO: Simplifica a lógica para evitar condições de corrida.
        // O perfil de admin deve ser criado na página de gerenciamento ou um script de setup.
        // Aqui, apenas lemos os dados existentes.
        const userDoc = await getDoc(userDocRef);

        if (user.email === 'cq.uia@ind.com.br') {
            const adminProfile: UserProfile = { 
                nome: 'Admin UIA',
                matricula: 'admin', 
                role: 'admin', 
                permissions: ['/', '/registrar', '/visualizar', '/graficos', '/usuarios', '/configuracoes'] 
            };
            // Apenas define o perfil de admin no estado, sem forçar escrita aqui.
            // A escrita pode ser feita em um local mais apropriado se necessário.
            if (!userDoc.exists()) {
                await setDoc(userDocRef, adminProfile, { merge: true });
            }
            setUserProfile(adminProfile);
        } else {
            if (userDoc.exists()) {
                setUserProfile(userDoc.data() as UserProfile);
            } else {
                // Usuário logado mas sem perfil (não deve acontecer no fluxo normal)
                setUserProfile(null);
            }
        }
      } else {
        setUser(null);
        setUserProfile(null);
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
