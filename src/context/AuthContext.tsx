
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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // Start loading when auth state changes
      setLoading(true); 
      
      if (firebaseUser) {
        setUser(firebaseUser);
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        try {
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUserProfile({ id: userDoc.id, ...userDoc.data() } as UserProfile);
          } else {
            // Special case for the first-time admin user
            if (firebaseUser.email === 'cq.uia@ind.com.br') {
              const adminProfile: UserProfile = {
                nome: 'Admin UIA',
                email: 'cq.uia@ind.com.br',
                matricula: 'admin',
                role: 'admin',
                permissions: ['/', '/registrar', '/visualizar', '/graficos', '/usuarios', '/configuracoes', 'delete_records']
              };
              await setDoc(userDocRef, adminProfile, { merge: true });
              setUserProfile({ id: firebaseUser.uid, ...adminProfile });
            } else {
              // A regular user that exists in Auth but not in Firestore DB
              setUserProfile(null); 
            }
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUserProfile(null);
        }
      } else {
        // User is signed out
        setUser(null);
        setUserProfile(null);
      }
      
      // IMPORTANT: Set loading to false only after all async operations are done
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, userProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
