
"use client";

import { useAuth } from '@/context/AuthContext';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AdminSidebar } from './AdminSidebar';
import { usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  // Se estiver carregando a autenticação, mostre um spinner global
  if (loading) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <Loader2 className="size-8 animate-spin text-primary" />
        </div>
    );
  }

  // Se não houver usuário e não estiver na página de login, o AuthProvider já redireciona.
  // Aqui, apenas retornamos o conteúdo (que será a página de login).
  if (!user) {
    return <>{children}</>;
  }

  const isAdminSection = pathname.startsWith('/admin');

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        {isAdminSection ? <AdminSidebar /> : <AppSidebar />}
        <SidebarInset className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
