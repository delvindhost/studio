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
    // Se, após o carregamento, não houver usuário ou perfil, redireciona.
    if (!loading && (!user || !userProfile)) {
      router.replace("/login");
    }
  }, [user, userProfile, loading, router]);

  // Exibe a tela de carregamento enquanto a verificação de autenticação
  // e o carregamento do perfil estiverem em andamento.
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Se o usuário está logado e o perfil foi carregado, renderiza o layout.
  // A verificação no useEffect cuida do redirecionamento se algo estiver faltando.
  if (user && userProfile) {
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

  // Fallback para o caso de o redirecionamento ainda não ter acontecido.
  // Isso também mostra a tela de carregamento.
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
