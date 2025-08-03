
"use client";

import { useAuth } from '@/context/AuthContext';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AdminSidebar } from './AdminSidebar';
import { usePathname } from 'next/navigation';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();

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
