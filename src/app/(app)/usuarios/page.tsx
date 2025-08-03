
'use client';

import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, doc, setDoc, getDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth as mainAuth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, UserPlus, Users, ShieldCheck, KeyRound, User, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

// Tipos
type UserProfile = {
  id: string;
  nome: string;
  matricula: string;
  role: 'admin' | 'user';
  permissions: string[];
};

const navItems = [
  { href: "/", label: "Registrar" },
  { href: "/visualizar", label: "Visualizar" },
  { href: "/graficos", label: "Gráficos" },
];


export default function UsuariosPage() {
  const { userProfile, loading: authLoading } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // State for the dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nome, setNome] = useState('');
  const [matricula, setMatricula] = useState('');
  const [senha, setSenha] = useState('');
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    if (!authLoading) {
      if (userProfile?.role !== 'admin') {
        router.replace('/');
      } else {
        fetchUsers();
      }
    }
  }, [userProfile, authLoading, router]);


  const fetchUsers = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const userList: UserProfile[] = [];
      querySnapshot.forEach((doc) => {
        // Exclude the admin user from the list
        if (doc.data().role !== 'admin') {
            userList.push({ id: doc.id, ...doc.data() } as UserProfile);
        }
      });
      setUsers(userList);
    } catch (err) {
      console.error(err);
      setError('Falha ao carregar usuários.');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message: string, type: 'success' | 'error') => {
    if (type === 'success') {
      setSuccess(message);
      setError(null);
    } else {
      setError(message);
      setSuccess(null);
    }
    setTimeout(() => {
      setSuccess(null);
      setError(null);
    }, 4000);
  };

  const handlePermissionChange = (permission: string) => {
    setPermissions(prev =>
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };
  
  const resetForm = () => {
    setNome('');
    setMatricula('');
    setSenha('');
    setPermissions([]);
    setIsSubmitting(false);
    setIsDialogOpen(false);
  };

  const handleAddUser = async () => {
    if (!nome || !matricula || !senha || permissions.length === 0) {
      showAlert('Por favor, preencha todos os campos e selecione ao menos uma permissão.', 'error');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(mainAuth, `${matricula}@local.user`, senha);
      const user = userCredential.user;

      // Store user profile in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        nome,
        matricula,
        role: 'user',
        permissions,
      });

      showAlert('Usuário adicionado com sucesso!', 'success');
      resetForm();
      fetchUsers(); // Refresh user list
    } catch (err: any) {
        if (err.code === 'auth/email-already-in-use') {
            showAlert('Erro: A matrícula informada já está em uso.', 'error');
        } else if (err.code === 'auth/weak-password') {
            showAlert('Erro: A senha deve ter no mínimo 6 caracteres.', 'error');
        } else {
            showAlert('Erro ao criar usuário. Verifique os dados e tente novamente.', 'error');
        }
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (authLoading || loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
   if (userProfile?.role !== 'admin') {
    return (
        <div className="flex h-full w-full items-center justify-center">
            <p className="text-red-500">Acesso negado.</p>
        </div>
    );
  }


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">Gerenciamento de Usuários</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" /> Adicionar Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Novo Usuário</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome do colaborador" disabled={isSubmitting} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="matricula">Matrícula</Label>
                <Input id="matricula" value={matricula} onChange={(e) => setMatricula(e.target.value)} placeholder="Matrícula de login" disabled={isSubmitting}/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="senha">Senha</Label>
                <Input id="senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Mínimo de 6 caracteres" disabled={isSubmitting}/>
              </div>
              <div className="space-y-3">
                 <Label>Permissões de Acesso</Label>
                 <div className='space-y-2'>
                    {navItems.map((item) => (
                        <div key={item.href} className="flex items-center space-x-2">
                            <Checkbox 
                                id={`perm-${item.href}`} 
                                checked={permissions.includes(item.href)}
                                onCheckedChange={() => handlePermissionChange(item.href)}
                                disabled={isSubmitting}
                            />
                            <label
                                htmlFor={`perm-${item.href}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                {item.label}
                            </label>
                        </div>
                    ))}
                 </div>
              </div>
            </div>
            <DialogFooter>
               <DialogClose asChild>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </DialogClose>
              <Button onClick={handleAddUser} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Usuário
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

       {success && <div className="p-4 bg-green-100 text-green-800 border border-green-300 rounded-md">{success}</div>}
       {error && <div className="p-4 bg-red-100 text-red-800 border border-red-300 rounded-md">{error}</div>}

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'><Users className='h-5 w-5'/> Usuários Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
           {users.length > 0 ? (
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div className='space-y-1'>
                        <p className="font-semibold flex items-center gap-2"><User className='h-4 w-4 text-primary'/> {user.nome}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-2"><KeyRound className='h-4 w-4'/> Matrícula: {user.matricula}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-2"><ShieldCheck className='h-4 w-4'/> Permissões: {user.permissions.map(p => navItems.find(n => n.href === p)?.label || p).join(', ')}</p>
                    </div>
                    <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">Nenhum usuário cadastrado ainda.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
