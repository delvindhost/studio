
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { BarChart, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Bar, Line, ResponsiveContainer, Legend } from 'recharts';
import { Loader2, Filter, ChevronsUpDown, Check } from 'lucide-react';
import { produtosPorCodigo } from '@/lib/produtos';
import { cn } from '@/lib/utils';

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
export default function GraficosPage() {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hoje = new Date().toISOString().split('T')[0];
  const [dataInicio, setDataInicio] = useState(hoje);
  const [dataFim, setDataFim] = useState(hoje);
  const [local, setLocal] = useState('todos');
  const [tipo, setTipo] = useState('todos');
  const [produtoCodigo, setProdutoCodigo] = useState('todos');

  // --- Combobox state ---
  const [open, setOpen] = useState(false)

  const produtosOptions = useMemo(() => {
    const options = Object.entries(produtosPorCodigo).map(([codigo, { produto }]) => ({
      value: codigo,
      label: `${codigo} - ${produto}`,
    }));
    return [{ value: 'todos', label: 'Todos os Produtos' }, ...options];
  }, []);


  const carregarDados = async () => {
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

      if (local !== 'todos') q = query(q, where('local', '==', local));
      if (tipo !== 'todos') q = query(q, where('tipo', '==', tipo));
      if (produtoCodigo !== 'todos') q = query(q, where('codigo', '==', produtoCodigo));
      

      const querySnapshot = await getDocs(q);
      const dados: Registro[] = [];
      querySnapshot.forEach((doc) => {
        const docData = doc.data();
        dados.push({ 
            id: doc.id, 
            ...docData,
            data: docData.data, // Mantém o timestamp
        } as Registro);
      });
      
      setRegistros(dados);

      if (dados.length === 0) {
        setError('Nenhum dado encontrado para os filtros selecionados.');
      }

    } catch (err) {
      console.error(err);
      setError('Erro ao carregar dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dadosGraficoProduto = useMemo(() => {
    const data = registros.reduce((acc, reg) => {
        const key = reg.produto || 'N/A';
        if(!acc[key]) {
            acc[key] = { name: key, total: 0, count: 0 };
        }
        const tempSum = reg.temperaturas.inicio + reg.temperaturas.meio + reg.temperaturas.fim;
        acc[key].total += tempSum;
        acc[key].count += 3;
        return acc;
    }, {} as Record<string, {name: string, total: number, count: number}>);

    return Object.values(data).map(item => ({
        name: item.name,
        'Temperatura Média': parseFloat((item.total / item.count).toFixed(2))
    })).sort((a,b) => a['Temperatura Média'] - b['Temperatura Média']);
  }, [registros]);

  const dadosGraficoLocal = useMemo(() => {
      const data = registros.reduce((acc, reg) => {
          const key = reg.local || 'N/A';
          if(!acc[key]) {
              acc[key] = { name: key, inicio: 0, meio: 0, fim: 0, count: 0};
          }
          acc[key].inicio += reg.temperaturas.inicio;
          acc[key].meio += reg.temperaturas.meio;
          acc[key].fim += reg.temperaturas.fim;
          acc[key].count += 1;
          return acc;
      }, {} as Record<string, {name: string, inicio: number, meio: number, fim: number, count: number}>);

      return Object.values(data).map(item => ({
          name: item.name,
          'Início': parseFloat((item.inicio / item.count).toFixed(2)),
          'Meio': parseFloat((item.meio / item.count).toFixed(2)),
          'Fim': parseFloat((item.fim / item.count).toFixed(2)),
      }));
  }, [registros]);

  const dadosGraficoVariacao = useMemo(() => {
      // Ordena por data para o gráfico de linhas
      const sortedRegistros = [...registros].sort((a, b) => a.data.toMillis() - b.data.toMillis());
      return sortedRegistros.map(reg => ({
          name: `${reg.data.toDate().toLocaleDateString('pt-BR')} ${reg.data.toDate().toLocaleTimeString('pt-BR')}`,
          'Início': reg.temperaturas.inicio,
          'Meio': reg.temperaturas.meio,
          'Fim': reg.temperaturas.fim,
      }));
  }, [registros]);


  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary">Análise de Temperaturas</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 items-end">
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
             <div className="space-y-2">
                <Label htmlFor="filtro-produto">Produto</Label>
                 <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between"
                        >
                        {produtoCodigo === "todos"
                            ? "Todos os Produtos"
                            : produtosOptions.find((p) => p.value === produtoCodigo)?.label}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0">
                        <Command>
                        <CommandInput placeholder="Buscar produto..." />
                         <CommandList>
                            <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
                            <CommandGroup>
                                {produtosOptions.map((p) => (
                                <CommandItem
                                    key={p.value}
                                    value={p.value}
                                    onSelect={(currentValue) => {
                                      setProdutoCodigo(currentValue === produtoCodigo ? "todos" : currentValue)
                                      setOpen(false)
                                    }}
                                >
                                    <Check
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        produtoCodigo === p.value ? "opacity-100" : "opacity-0"
                                    )}
                                    />
                                    {p.label}
                                </CommandItem>
                                ))}
                            </CommandGroup>
                         </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>

          </div>
          <div className="flex flex-wrap gap-4 mt-6">
            <Button onClick={carregarDados} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Filter className="mr-2 h-4 w-4" />}
              Atualizar Gráficos
            </Button>
          </div>
        </CardContent>
      </Card>
      
        {loading ? (
            <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : error ? (
            <p className="text-center text-red-500 py-8">{error}</p>
        ) : (
        <div className='space-y-6'>
            <Card>
                <CardHeader>
                    <CardTitle>Temperatura Média por Produto</CardTitle>
                </CardHeader>
                <CardContent className='h-[500px]'>
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dadosGraficoProduto} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" width={150} interval={0} />
                            <Tooltip />
                            <Bar dataKey="Temperatura Média" fill="hsl(var(--primary))" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Média de Temperaturas por Local</CardTitle>
                </CardHeader>
                <CardContent className='h-[400px]'>
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dadosGraficoLocal}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="Início" fill="#4B0082" />
                            <Bar dataKey="Meio" fill="#8A2BE2" />
                            <Bar dataKey="Fim" fill="#9370DB" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Variação de Temperaturas no Período</CardTitle>
                </CardHeader>
                <CardContent className='h-[400px]'>
                     <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={dadosGraficoVariacao}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" angle={-20} textAnchor="end" height={60} interval={'preserveStartEnd'}/>
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="Início" stroke="#4B0082" activeDot={{ r: 8 }} />
                            <Line type="monotone" dataKey="Meio" stroke="#8A2BE2" />
                            <Line type="monotone" dataKey="Fim" stroke="#9370DB" />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
      )}
    </div>
  );
}
