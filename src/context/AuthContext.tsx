"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
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
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
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
           // If user exists in Auth but not Firestore, create their profile.
           // This handles the initial login for the admin user.
           const isAdmin = firebaseUser.email === 'cq.uia@ind.com.br';
           const newUserProfile: UserProfile = {
             uid: firebaseUser.uid,
             email: firebaseUser.email,
             role: isAdmin ? 'admin' : 'user',
           };
           await setDoc(userDocRef, { email: newUserProfile.email, role: newUserProfile.role });
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
    if (loading) return; // Don't do anything until the auth state is resolved.

    const isAuthPage = pathname === '/login';

    // If user is not logged in, and not on the login page, redirect to login
    if (!user && !isAuthPage) {
      router.push('/login');
    }

    // If user is logged in and on the login page, redirect to the app's main page
    if (user && isAuthPage) {
       router.push('/');
    }
  }, [user, loading, pathname, router]);


  const logout = async () => {
    await auth.signOut();
    router.push('/login'); // Force redirect to login on logout.
  };
  
  // While loading authentication state, or if a redirect is imminent, show a full-screen loader.
  // This prevents the "flash" of content or a white screen.
  const isAuthPage = pathname === '/login';
  if (loading || (!user && !isAuthPage) || (user && isAuthPage)) {
     return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <Loader2 className="size-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
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
