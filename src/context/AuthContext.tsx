
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
           // If user exists in Auth but not in Firestore, create their profile.
           // This handles the initial admin user case.
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

    // If no user, but trying to access app -> redirect to login
    if (!user && isAppRoute) {
      router.push('/login');
    }

    // If user exists, but is on login page -> redirect to their home
    if (user && isLoginPage) {
       router.push(user.role === 'admin' ? '/admin' : '/');
    }
  }, [user, loading, pathname, router]);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // The onAuthStateChanged listener will handle the user state update and redirection.
      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false };
    }
  };

  const logout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const value = { user, loading, login, logout };
  
  const isLoginPage = pathname === '/login';
  
  if (loading && !isLoginPage) {
     return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <Loader2 className="size-8 animate-spin text-primary" />
        </div>
    );
  }

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
