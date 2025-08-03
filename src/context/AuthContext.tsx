
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface UserProfile {
  nome: string;
  email: string;
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
        const userDoc = await getDoc(userDocRef);

        const isKnownAdminEmail = user.email === 'cq.uia@ind.com.br';

        if (isKnownAdminEmail && !userDoc.exists()) {
            const adminProfile: UserProfile = { 
                nome: 'Admin UIA',
                email: 'cq.uia@ind.com.br',
                matricula: 'admin', 
                role: 'admin', 
                permissions: ['/', '/registrar', '/visualizar', '/graficos', '/usuarios', '/configuracoes', 'delete_records'] 
            };
            await setDoc(userDocRef, adminProfile, { merge: true });
            setUserProfile(adminProfile);
        } else if (userDoc.exists()) {
            setUserProfile(userDoc.data() as UserProfile);
        } else {
            // User is authenticated but has no profile in Firestore.
            // This can happen briefly during the first login signup process.
            setUserProfile(null);
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
