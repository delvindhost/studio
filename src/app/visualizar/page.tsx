'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { Loader2, Calendar, Filter, FileDown, FileText, MapPin, Barcode, Clock, Thermometer, Snowflake, Tag, Play, Pause, Stop, Trash2 } from 'lucide-react';

// Tipos
type Registro = {
  id: string;
  turno: string;
  local: string;
  codigo: string;
  produto: string;
  tipo: string;
  estado: string;
  dataManual: string;
  horarioManual: string;
  temperaturas: {
    inicio: number;
    meio: number;
    fim: number;
  };
  data: Timestamp;
};

// Componente principal da página
export default function VisualizarPage() {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hoje = new Date().toISOString().split('T')[0];
  const [dataInicio, setDataInicio] = useState(hoje);
  const [dataFim, setDataFim] = useState(hoje);
  const [local, setLocal] = useState('todos');
  const [turno, setTurno] = useState('todos');
  const [tipo, setTipo] = useState('todos');

  const carregarRegistros = async () => {
    setLoading(true);
    setError(null);
    try {
      const inicio = new Date(`${dataInicio}T00:00:00`);
      const fim = new Date(`${dataFim}T23:59:59`);

      let q = query(
        collection(db, 'registros'),
        where('data', '>=', Timestamp.fromDate(inicio)),
        where('data', '<=', Timestamp.fromDate(fim)),
        orderBy('data', 'desc')
      );

      if (local && local !== 'todos') {
        q = query(q, where('local', '==', local));
      }
      if (turno && turno !== 'todos') {
        q = query(q, where('turno', '==', turno));
      }
      if (tipo && tipo !== 'todos') {
        q = query(q, where('tipo', '==', tipo));
      }

      const querySnapshot = await getDocs(q);
      const dados: Registro[] = [];
      querySnapshot.forEach((doc) => {
        dados.push({ id: doc.id, ...doc.data() } as Registro);
      });
      
      setRegistros(dados);

      if (dados.length === 0) {
        setError('Nenhum registro encontrado para os filtros selecionados.');
      }

    } catch (err) {
      console.error(err);
      setError('Erro ao carregar registros. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarRegistros();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary">Visualizar Registros</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
             <div className="space-y-2">
              <Label htmlFor="data-inicio">Data Inicial</Label>
              <Input id="data-inicio" type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="data-fim">Data Final</Label>
              <Input id="data-fim" type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filtro-local">Local</Label>
              <Select value={local} onValueChange={setLocal}>
                <SelectTrigger id="filtro-local"><SelectValue placeholder="Todos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os locais</SelectItem>
                   <SelectGroup>
                        <SelectLabel>Giros Freezer</SelectLabel>
                        <SelectItem value="Giro Freezer 1">Giro Freezer 1</SelectItem>
                        <SelectItem value="Giro Freezer 2">Giro Freezer 2</SelectItem>
                        <SelectItem value="Giro Freezer 3">Giro Freezer 3</SelectItem>
                        <SelectItem value="Giro Freezer 4">Giro Freezer 4</SelectItem>
                        <SelectItem value="Giro Freezer 5">Giro Freezer 5</SelectItem>
                        <SelectItem value="Giro Freezer 6">Giro Freezer 6</SelectItem>
                    </SelectGroup>
                    <SelectGroup>
                        <SelectLabel>Túneis</SelectLabel>
                        <SelectItem value="Túnel 1">Túnel 1</SelectItem>
                        <SelectItem value="Túnel 2">Túnel 2</SelectItem>
                        <SelectItem value="Túnel 3">Túnel 3</SelectItem>
                        <SelectItem value="Túnel 4">Túnel 4</SelectItem>
                        <SelectItem value="Túnel 5">Túnel 5</SelectItem>
                        <SelectItem value="Túnel 6">Túnel 6</SelectItem>
                        <SelectItem value="Túnel 7">Túnel 7</SelectItem>
                    </SelectGroup>
                </SelectContent>
              </Select>
            </div>
             <div className="space-y-2">
              <Label htmlFor="filtro-turno">Turno</Label>
              <Select value={turno} onValueChange={setTurno}>
                <SelectTrigger id="filtro-turno"><SelectValue placeholder="Todos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="1">1º Turno</SelectItem>
                  <SelectItem value="2">2º Turno</SelectItem>
                </SelectContent>
              </Select>
            </div>
             <div className="space-y-2">
              <Label htmlFor="filtro-tipo">Mercado</Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger id="filtro-tipo"><SelectValue placeholder="Todos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="MI">MI</SelectItem>
                  <SelectItem value="ME">ME</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 mt-6">
            <Button onClick={carregarRegistros} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Filter className="mr-2 h-4 w-4" />}
              Filtrar
            </Button>
            <Button variant="outline">
                <FileDown className="mr-2 h-4 w-4" /> Exportar Excel
            </Button>
             <Button variant="outline">
                <FileText className="mr-2 h-4 w-4" /> Exportar PDF
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {loading && <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
      {error && !loading && <p className="text-center text-red-500">{error}</p>}
      
      {!loading && registros.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {registros.map((reg) => (
            <Card key={reg.id} className="shadow-lg flex flex-col">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-primary truncate">
                  {reg.produto}
                </CardTitle>
                <p className="text-sm text-muted-foreground pt-1">{reg.local}</p>
              </CardHeader>
              <CardContent className="flex-grow text-sm space-y-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Barcode className="h-4 w-4" />
                  <span><strong>Código:</strong> {reg.codigo || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                   <span><strong>Turno:</strong> {reg.turno}º</span>
                </div>
                 <div className="flex items-center gap-2 text-muted-foreground">
                   <Tag className="h-4 w-4" /> 
                   <span><strong>Tipo:</strong> {reg.tipo}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Snowflake className="h-4 w-4" />
                  <span><strong>Estado:</strong> {reg.estado}</span>
                </div>

                <div className="pt-3 space-y-2">
                  <h4 className="font-semibold text-primary">Temperaturas</h4>
                  <div className="flex items-center gap-2">
                    <Play className="h-4 w-4 text-green-600"/>
                    <span>Início: <strong>{reg.temperaturas.inicio.toFixed(1).replace('.', ',')}°C</strong></span>
                  </div>
                   <div className="flex items-center gap-2">
                    <Pause className="h-4 w-4 text-yellow-600"/>
                    <span>Meio: <strong>{reg.temperaturas.meio.toFixed(1).replace('.', ',')}°C</strong></span>
                  </div>
                   <div className="flex items-center gap-2">
                    <Stop className="h-4 w-4 text-red-600"/>
                    <span>Fim: <strong>{reg.temperaturas.fim.toFixed(1).replace('.', ',')}°C</strong></span>
                  </div>
                </div>
              </CardContent>
              <div className="p-6 pt-0 mt-auto text-xs text-muted-foreground flex justify-between items-center">
                  <div>
                    <p><strong>Data:</strong> {reg.dataManual}</p>
                    <p><strong>Horário:</strong> {reg.horarioManual}</p>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
