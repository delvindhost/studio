
"use client";
import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = useCallback(async () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('loginTimestamp');
        localStorage.removeItem('userRole');
      }
      await signOut(auth);
      router.replace("/login");
  },[router]);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }
    
    // This function runs only on the client
    const checkSession = () => {
      const loginTimestamp = localStorage.getItem('loginTimestamp');
      const userRole = localStorage.getItem('userRole');

      if (loginTimestamp && userRole) {
        const maxSessionTime = userRole === 'admin' 
          ? 24 * 60 * 60 * 1000 // 24 hours
          : 12 * 60 * 60 * 1000;  // 12 hours
        
        const elapsedTime = Date.now() - parseInt(loginTimestamp, 10);

        if (elapsedTime > maxSessionTime) {
          handleLogout();
        }
      } else {
        // If session info is missing, force logout to be safe
        handleLogout();
      }
    };
    
    checkSession();
    // Add an event listener to re-check when the user focuses the window
    window.addEventListener('focus', checkSession);
    
    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('focus', checkSession);
    };
  }, [user, loading, router, handleLogout]);


  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex flex-1 flex-col md:ml-64">
        <Header setSidebarOpen={setSidebarOpen} userProfile={userProfile} />
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
            {children}
        </main>
      </div>
    </div>
  );
}
