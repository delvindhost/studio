"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck, LogIn, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';


export default function LoginPage() {
  const [email, setEmail] = useState('cq.uia@ind.com.br');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await login(email, password);
      // The redirection is now fully handled by the AuthContext
      if (!result.success) {
        throw new Error("Credenciais inválidas");
      }
    } catch (error) {
       toast({
          title: "Erro de Login",
          description: "Email ou senha incorretos. Por favor, tente novamente.",
          variant: "destructive",
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-4">
                <ShieldCheck className="size-8" />
            </div>
            <CardTitle>Controle da Qualidade</CardTitle>
            <CardDescription>Acesse sua conta para continuar</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
                <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
            <div className="space-y-2">
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : <LogIn />}
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
