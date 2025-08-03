
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard } from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-primary flex items-center gap-3">
          <LayoutDashboard className="size-8 text-accent" />
          Admin Dashboard
        </h1>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Bem-vindo ao Painel Administrativo</CardTitle>
        </CardHeader>
        <CardContent>
            <p>Use o menu à esquerda para gerenciar usuários e outras configurações do sistema.</p>
        </CardContent>
      </Card>
    </div>
  );
}
