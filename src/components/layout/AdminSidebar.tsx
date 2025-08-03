
"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Users, LogOut, ShieldCheck, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Usuários', icon: Users },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
         <div className="flex items-center gap-2">
            <div className="bg-sidebar-primary text-sidebar-primary-foreground p-2 rounded-lg">
              <ShieldCheck className="size-6" />
            </div>
            <h2 className="text-lg font-semibold text-sidebar-primary tracking-tight group-data-[collapsible=icon]:hidden">
                Admin
            </h2>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.label}
                className="justify-start"
              >
                <Link href={item.href}>
                  <item.icon className="size-5" />
                  <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2">
         <SidebarMenu>
           <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Voltar ao App" className="justify-start">
                <Link href="/">
                    <LayoutDashboard className="size-5"/>
                    <span className="group-data-[collapsible=icon]:hidden">App</span>
                </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={logout} className="justify-start" tooltip="Sair">
              <LogOut className="size-5" />
              <span className="group-data-[collapsible=icon]:hidden">Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
