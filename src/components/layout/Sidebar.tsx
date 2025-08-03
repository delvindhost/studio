
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import {
  Thermometer,
  ClipboardList,
  BarChart3,
  Settings,
  Users,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/registrar", icon: Thermometer, label: "Registrar" },
  { href: "/visualizar", icon: ClipboardList, label: "Visualizar" },
  { href: "/graficos", icon: BarChart3, label: "Gráficos" },
  { href: "/usuarios", icon: Users, label: "Usuários", admin: true },
  { href: "/configuracoes", icon: Settings, label: "Configurações" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <div className="hidden md:flex flex-col w-64 bg-primary text-primary-foreground">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-center">Controle de Qualidade</h2>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <Link key={item.label} href={item.href} passHref>
            <Button
              variant={pathname === item.href ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.label}
            </Button>
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-primary-foreground/20">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Sair
        </Button>
      </div>
    </div>
  );
}
