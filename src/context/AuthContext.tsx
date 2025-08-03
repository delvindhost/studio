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
  login: (email: string, password: string) => Promise<{ success: boolean; role?: string }>;
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
           // If user exists in Auth but not in Firestore, create a default user profile.
           // This can happen if user was created manually in Firebase console.
           // For this app, we'll give admin role to the main user.
           const isAdmin = firebaseUser.email === 'cq.uia@ind.com.br';
           const userRole = isAdmin ? 'admin' : 'user';

           const defaultUserData = {
               uid: firebaseUser.uid,
               email: firebaseUser.email,
               role: userRole
           };
           await setDoc(userDocRef, { email: firebaseUser.email, role: userRole });
           setUser(defaultUserData);
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

    const isAuthRoute = pathname === '/login';

    // If no user and not on a public route, redirect to login
    if (!user && !isAuthRoute) {
      router.push('/login');
    }

    // If user is logged in and tries to access login page, redirect them away
    if (user && isAuthRoute) {
       router.push(user.role === 'admin' ? '/admin' : '/');
    }
  }, [user, loading, pathname, router]);

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      let role = 'user';
      if (userDoc.exists()) {
        role = userDoc.data().role || 'user';
      } else {
        // This case should be handled by the onAuthStateChanged listener,
        // but we can have it as a fallback.
        const isAdmin = firebaseUser.email === 'cq.uia@ind.com.br';
        role = isAdmin ? 'admin' : 'user';
        await setDoc(userDocRef, { email: firebaseUser.email, role: role });
      }

      return { success: true, role };

    } catch (error) {
      console.error("Login error:", error);
      return { success: false };
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null); // Ensure user state is cleared immediately
    router.push('/login');
  };

  const value = { user, loading, login, logout };

  // While loading, or if we're unauthenticated on a protected route, show a loader.
  if (loading || (!user && pathname !== '/login')) {
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
