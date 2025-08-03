// Esta página servirá como o painel principal (a tela de "Registrar" inicialmente)
// Por enquanto, vamos apenas criar um placeholder.

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-6">Painel Principal</h1>
      <Card>
        <CardHeader>
          <CardTitle>Bem-vindo ao TempGuard</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Selecione uma opção na barra lateral para começar.</p>
        </CardContent>
      </Card>
    </div>
  );
}
