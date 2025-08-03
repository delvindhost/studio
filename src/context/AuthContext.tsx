
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

        const setupSession = (profile: UserProfile) => {
            setUserProfile(profile);
            localStorage.setItem('loginTimestamp', Date.now().toString());
            localStorage.setItem('userRole', profile.role);
        }

        if (isKnownAdminEmail && !userDoc.exists()) {
            const adminProfile: UserProfile = { 
                nome: 'Admin UIA',
                email: 'cq.uia@ind.com.br',
                matricula: 'admin', 
                role: 'admin', 
                permissions: ['/', '/registrar', '/visualizar', '/graficos', '/usuarios', '/configuracoes', 'delete_records'] 
            };
            await setDoc(userDocRef, adminProfile, { merge: true });
            setupSession(adminProfile);
        } else if (userDoc.exists()) {
            const profile = userDoc.data() as UserProfile;
            setupSession(profile);
        } else {
            setUserProfile(null);
        }
      } else {
        setUser(null);
        setUserProfile(null);
        localStorage.removeItem('loginTimestamp');
        localStorage.removeItem('userRole');
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
