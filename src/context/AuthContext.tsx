
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

interface UserProfile {
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
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        setUser(user);
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          setUserProfile(userDoc.data() as UserProfile);
        } else {
           // This case is for the initial admin user creation
           if (user.email === 'cq.uia@ind.com.br') {
            const adminProfile: UserProfile = { 
                nome: 'Admin UIA',
                matricula: 'admin', // Adicionado para consistência
                role: 'admin', 
                permissions: ['/','/visualizar','/graficos','/usuarios','/configuracoes'] 
            };
            await setDoc(userDocRef, adminProfile);
            setUserProfile(adminProfile);
          } else {
             // Fallback for users authenticated but without a profile
             setUserProfile({ role: 'user', permissions: [], nome: 'Usuário', matricula: '' });
          }
        }
      } else {
        setUser(null);
        setUserProfile(null);
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            router.push('/login');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, userProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
