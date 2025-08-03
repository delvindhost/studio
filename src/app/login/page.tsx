
'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let emailToLogin = '';

      // Verifica se o loginId é um e-mail ou uma matrícula
      if (loginId.includes('@')) {
        emailToLogin = loginId;
      } else {
        // Se for matrícula, busca o usuário no Firestore
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('matricula', '==', loginId.trim()));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setError('Nenhum usuário encontrado com esta matrícula.');
          setLoading(false);
          return;
        }
        
        // Assumindo que a matrícula é única, pega o primeiro resultado
        const userData = querySnapshot.docs[0].data();
        emailToLogin = `${userData.matricula}@local.user`;
      }
      
      // Tenta fazer o login com o e-mail (seja o digitado ou o construído)
      await signInWithEmailAndPassword(auth, emailToLogin, password);
      router.push('/');

    } catch (err: any) {
        // Trata erros de autenticação
        if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
             setError('Falha no login. Verifique suas credenciais.');
        } else {
             setError('Ocorreu um erro inesperado. Tente novamente.');
        }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm mx-4">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-primary">Controle de Qualidade</CardTitle>
          <CardDescription className="text-center">
            Entre com seu e-mail ou matrícula para acessar.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="loginId">E-mail ou Matrícula</Label>
              <Input
                id="loginId"
                type="text"
                placeholder="seu@email.com ou 123456"
                required
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                placeholder="******"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Entrar'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
