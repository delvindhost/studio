
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface UserProfile {
  id?: string;
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
      if (user) {
        setUser(user);
        const userDocRef = doc(db, 'users', user.uid);
        try {
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUserProfile({ id: userDoc.id, ...userDoc.data() } as UserProfile);
          } else {
            // This handles the special admin user on first login.
            if (user.email === 'cq.uia@ind.com.br') {
              const adminProfile: UserProfile = {
                nome: 'Admin UIA',
                email: 'cq.uia@ind.com.br',
                matricula: 'admin',
                role: 'admin',
                permissions: ['/', '/registrar', '/visualizar', '/graficos', '/usuarios', '/configuracoes', 'delete_records']
              };
              await setDoc(userDocRef, adminProfile, { merge: true });
              setUserProfile({ id: user.uid, ...adminProfile });
            } else {
              // A regular user is authenticated but has no profile document.
              // This is an invalid state, so we treat them as not logged in.
              setUserProfile(null);
            }
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUserProfile(null); // Ensure we don't get stuck in a bad state
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      // CRITICAL: Set loading to false only after all async operations are complete.
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
