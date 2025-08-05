"use client";
import React, { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // A condição !loading garante que só vamos verificar o usuário
    // depois que o onAuthStateChanged do Firebase terminar a verificação inicial.
    // A condição !user garante que estamos lidando com um usuário não logado.
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  // Enquanto o estado de autenticação estiver carregando,
  // ou se não houver usuário (e o redirecionamento ainda não aconteceu),
  // exibe uma tela de carregamento.
  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Se o usuário estiver logado, mas o perfil ainda não carregou, 
  // pode-se manter o loading para evitar renderização parcial.
  if (!userProfile) {
     return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-4">Carregando perfil...</p>
      </div>
    );
  }

  // Se passou por todas as verificações, o usuário está logado e tem perfil.
  // Renderiza o layout principal do aplicativo.
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
