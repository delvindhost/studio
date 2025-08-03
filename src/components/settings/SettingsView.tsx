"use client";

import { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Bomb, Database, Loader2, Trash2 } from 'lucide-react';

interface SettingsViewProps {
  cleanupAction: (daysToKeep: number) => Promise<{ success: boolean; message: string; count: number }>;
  resetAction: () => Promise<{ success: boolean; message: string; count: number }>;
}

export function SettingsView({ cleanupAction, resetAction }: SettingsViewProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [cleanupPeriod, setCleanupPeriod] = useState("90");
  
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [actionToConfirm, setActionToConfirm] = useState<(() => void) | null>(null);

  const handleConfirmableAction = (action: 'cleanup' | 'reset') => {
    const callback = action === 'cleanup' ? handleCleanup : handleReset;
    setActionToConfirm(() => callback);
  };
  
  const executeConfirmedAction = () => {
    if (password !== 'LaR2025') {
        setError("Senha incorreta. Ação cancelada.");
        setTimeout(() => setError(""), 3000);
        return;
    }
    if (actionToConfirm) {
        actionToConfirm();
    }
    // Close the dialog by finding its cancel button
    document.getElementById('close-alert-dialog')?.click();
  }

  const handleCleanup = () => {
    startTransition(async () => {
      const result = await cleanupAction(Number(cleanupPeriod));
      toast({
        title: result.success ? "Sucesso" : "Erro",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
    });
  };

  const handleReset = () => {
    startTransition(async () => {
      const result = await resetAction();
      toast({
        title: result.success ? "Sucesso" : "Erro",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Database/> Manutenção de Dados</CardTitle>
          <CardDescription>
            Gerencie os dados armazenados no sistema. Ações nesta seção podem ser irreversíveis.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold flex items-center gap-2"><Trash2/> Limpeza de Dados Antigos</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Esta ação removerá registros mais antigos que o período selecionado para otimizar o sistema.
            </p>
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                <div className="space-y-2 flex-grow">
                    <label className="text-sm font-medium">Manter registros dos últimos:</label>
                    <Select value={cleanupPeriod} onValueChange={setCleanupPeriod}>
                        <SelectTrigger className="w-full sm:w-[280px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="15">15 dias</SelectItem>
                            <SelectItem value="30">30 dias</SelectItem>
                            <SelectItem value="60">60 dias</SelectItem>
                            <SelectItem value="90">90 dias</SelectItem>
                            <SelectItem value="180">180 dias</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" onClick={() => handleConfirmableAction('cleanup')} disabled={isPending}>
                            {isPending ? <Loader2 className="animate-spin" /> : <Trash2/>} Executar Limpeza
                        </Button>
                    </AlertDialogTrigger>
                </AlertDialog>
            </div>
          </div>
          
          <div className="p-4 border border-destructive/50 bg-destructive/5 rounded-lg">
            <h3 className="font-semibold flex items-center gap-2 text-destructive"><Bomb/> Reset Completo do Sistema</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
                Esta ação apagará TODOS os registros de temperatura do sistema. Use com extrema cautela.
            </p>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                     <Button className="bg-destructive hover:bg-destructive/90" onClick={() => handleConfirmableAction('reset')} disabled={isPending}>
                        {isPending ? <Loader2 className="animate-spin" /> : <Bomb/>} Resetar Todos os Dados
                    </Button>
                </AlertDialogTrigger>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
      
       <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Confirmação de Segurança</AlertDialogTitle>
                <AlertDialogDescription>
                    Esta é uma ação perigosa e irreversível. Para continuar, por favor, digite a senha de administrador.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <Input
                type="password"
                placeholder="Senha de administrador"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && executeConfirmedAction()}
            />
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            <AlertDialogFooter>
                <AlertDialogCancel id="close-alert-dialog" onClick={() => {setPassword(''); setError(''); setActionToConfirm(null)}}>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={executeConfirmedAction} className="bg-destructive hover:bg-destructive/90">Confirmar</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </div>
  );
}
