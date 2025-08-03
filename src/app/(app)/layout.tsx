
"use client";
import React, { useState, useEffect } from "react";
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

  const handleLogout = async () => {
      await signOut(auth);
      localStorage.removeItem('loginTimestamp');
      localStorage.removeItem('userRole');
      router.replace("/login");
  };

  const checkSession = () => {
    const loginTimestamp = localStorage.getItem('loginTimestamp');
    const userRole = localStorage.getItem('userRole');

    if (loginTimestamp && userRole) {
      const maxSessionTime = userRole === 'admin' 
        ? 24 * 60 * 60 * 1000 // 24 hours
        : 1 * 60 * 60 * 1000;  // 1 hour
      
      const elapsedTime = Date.now() - parseInt(loginTimestamp, 10);

      if (elapsedTime > maxSessionTime) {
        handleLogout();
      }
    } else if (!user && !loading) {
        // Se não há dados de sessão mas o auth state ainda está carregando, espere.
        // Se já carregou e não há usuário, e não há dados na sessão, pode ser um estado inválido.
        router.replace("/login");
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    } else if (user) {
       checkSession();
    }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading, router]);

   useEffect(() => {
    // Adiciona listeners para verificar a sessão quando o usuário interage com a página
    window.addEventListener('focus', checkSession);
    return () => {
      window.removeEventListener('focus', checkSession);
    };
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


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
