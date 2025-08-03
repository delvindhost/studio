"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import type { TemperatureRecordClient } from "@/types";
import { format } from 'date-fns';
import { Barcode, Box, Calendar, Clock, Snowflake, Tag, Thermometer, Trash2, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { Input } from "../ui/input";

interface RecordCardProps {
  record: TemperatureRecordClient;
  onDelete: (id: string) => void;
}

export function RecordCard({ record, onDelete }: RecordCardProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleDelete = () => {
    if (password === 'LaR2025') {
        onDelete(record.id);
    } else {
        setError("Senha incorreta. A exclusão foi cancelada.");
        setTimeout(() => setError(''), 3000);
    }
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold leading-none tracking-tight flex items-center gap-2">
            <Box className="size-5 text-primary"/>
            {record.produto}
        </CardTitle>
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8 shrink-0">
                    <Trash2 className="size-4 text-destructive" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Tem certeza que deseja excluir?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta ação não pode ser desfeita. Para confirmar a exclusão, por favor, digite a senha de administrador.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <Input 
                    type="password"
                    placeholder="Senha de administrador"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                {error && <p className="text-sm font-medium text-destructive">{error}</p>}
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => {setPassword(''); setError('')}}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Excluir</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      </CardHeader>
      <CardContent className="flex-grow space-y-2 text-sm">
        <p className="text-muted-foreground">{record.local}</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <p className="flex items-center gap-2"><Barcode className="size-4 text-muted-foreground"/> <strong>Código:</strong></p>
            <p>{record.codigo || 'N/A'}</p>
            
            <p className="flex items-center gap-2"><Users className="size-4 text-muted-foreground"/> <strong>Turno:</strong></p>
            <p>{record.turno}º</p>
            
            <p className="flex items-center gap-2"><Tag className="size-4 text-muted-foreground"/> <strong>Tipo:</strong></p>
            <p>{record.tipo}</p>

            <p className="flex items-center gap-2"><Snowflake className="size-4 text-muted-foreground"/> <strong>Estado:</strong></p>
            <p>{record.estado}</p>
        </div>

        <div className="pt-2">
            <p className="flex items-center gap-2 font-medium mb-1"><Thermometer className="size-4 text-muted-foreground"/> Temperaturas:</p>
            <div className="pl-6 text-muted-foreground grid grid-cols-2">
                <span>Início:</span><span className="font-mono text-foreground">{record.temperaturas.inicio.toFixed(1)}°C</span>
                <span>Meio:</span><span className="font-mono text-foreground">{record.temperaturas.meio.toFixed(1)}°C</span>
                <span>Fim:</span><span className="font-mono text-foreground">{record.temperaturas.fim.toFixed(1)}°C</span>
            </div>
        </div>
      </CardContent>
       <CardFooter className="text-xs text-muted-foreground justify-between">
         <div className="flex items-center gap-1.5">
            <Calendar className="size-3.5"/>
            <span>{record.dataManual || format(record.data, 'dd/MM/yyyy')}</span>
         </div>
         <div className="flex items-center gap-1.5">
            <Clock className="size-3.5"/>
            <span>{record.horarioManual || format(record.data, 'HH:mm')}</span>
         </div>
      </CardFooter>
    </Card>
  );
}
