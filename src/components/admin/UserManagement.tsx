
"use client";

import { useState, useTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
} from "@/components/ui/alert-dialog"

import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, Trash2, UserPlus } from 'lucide-react';

const createUserSchema = z.object({
  email: z.string().email({ message: "Por favor, insira um email válido." }),
  password: z.string().min(6, { message: "A senha deve ter no mínimo 6 caracteres." }),
  role: z.enum(['admin', 'user']),
});

type CreateUserForm = z.infer<typeof createUserSchema>;

interface UserManagementProps {
    getUsersAction: () => Promise<any[]>;
    createUserAction: (data: CreateUserForm) => Promise<{ success: boolean, message: string }>;
    deleteUserAction: (id: string) => Promise<{ success: boolean, message: string }>;
}

export function UserManagement({ getUsersAction, createUserAction, deleteUserAction }: UserManagementProps) {
    const [users, setUsers] = useState<any[]>([]);
    const [isPending, startTransition] = useTransition();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { toast } = useToast();

    const form = useForm<CreateUserForm>({
        resolver: zodResolver(createUserSchema),
        defaultValues: { email: '', password: '', role: 'user' },
    });

    const fetchUsers = () => {
        startTransition(async () => {
            const userList = await getUsersAction();
            setUsers(userList);
        });
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const onSubmit = async (data: CreateUserForm) => {
        startTransition(async () => {
            const result = await createUserAction(data);
            if (result.success) {
                toast({ title: 'Sucesso!', description: result.message });
                fetchUsers();
                form.reset();
                setIsDialogOpen(false);
            } else {
                toast({ title: 'Erro', description: result.message, variant: 'destructive' });
            }
        });
    };

    const handleDelete = (userId: string) => {
        startTransition(async () => {
            const result = await deleteUserAction(userId);
             if (result.success) {
                toast({ title: 'Sucesso!', description: result.message });
                fetchUsers();
            } else {
                toast({ title: 'Erro', description: result.message, variant: 'destructive' });
            }
        });
    };

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Usuários Registrados</CardTitle>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button><UserPlus/> Adicionar Usuário</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Novo Usuário</DialogTitle>
                            <DialogDescription>
                                Crie uma nova conta de acesso para o sistema.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                             <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" {...form.register('email')} />
                                {form.formState.errors.email && <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>}
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="password">Senha</Label>
                                <Input id="password" type="password" {...form.register('password')} />
                                 {form.formState.errors.password && <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>}
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="role">Função</Label>
                                 <Select onValueChange={(value) => form.setValue('role', value as 'admin' | 'user')} defaultValue="user">
                                    <SelectTrigger>
                                        <SelectValue/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="user">Usuário Padrão</SelectItem>
                                        <SelectItem value="admin">Administrador</SelectItem>
                                    </SelectContent>
                                 </Select>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isPending}>
                                    {isPending ? <Loader2 className="animate-spin" /> : <PlusCircle/>}
                                    Criar
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Email</TableHead>
                            <TableHead>Função</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isPending && users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center">
                                    <Loader2 className="mx-auto animate-spin" />
                                </TableCell>
                            </TableRow>
                        ) : users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.email}</TableCell>
                                <TableCell><span className={`px-2 py-1 text-xs rounded-full ${user.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>{user.role}</span></TableCell>
                                <TableCell className="text-right">
                                     <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                             <Button variant="ghost" size="icon" disabled={isPending}>
                                                <Trash2 className="size-4 text-destructive" />
                                             </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Esta ação não pode ser desfeita e irá remover permanentemente o usuário.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(user.id)} className="bg-destructive hover:bg-destructive/90">
                                                    Excluir
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  )
}
