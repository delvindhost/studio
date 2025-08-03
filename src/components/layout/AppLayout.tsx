"use client";

import { useAuth } from '@/context/AuthContext';
import { LoginOverlay } from '@/components/auth/LoginOverlay';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, login } = useAuth();

  if (!isAuthenticated) {
    return <LoginOverlay onLogin={login} />;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <AppSidebar />
        <SidebarInset className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
