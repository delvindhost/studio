
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

type HeaderProps = {
  setSidebarOpen: (open: boolean) => void;
};

export default function Header({ setSidebarOpen }: HeaderProps) {
  return (
    <header className="flex h-16 items-center border-b bg-card px-4 md:hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setSidebarOpen(true)}
        className="md:hidden"
      >
        <Menu className="h-6 w-6" />
        <span className="sr-only">Abrir menu</span>
      </Button>
      <div className="flex-1 text-center">
        <h1 className="text-xl font-bold text-primary">Controle de Qualidade</h1>
      </div>
    </header>
  );
}
