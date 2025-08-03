
"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { format, subDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { RecordCard } from "./RecordCard";
import type { TemperatureRecordClient } from "@/types";
import { locationOptions } from "@/constants/locations";
import { CalendarDays, FileSpreadsheet, FileText, Filter, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface RecordsViewProps {
  getRecordsAction: (filters: any) => Promise<any[]>;
  deleteRecordAction: (id: string) => Promise<{ success: boolean, message: string }>;
}

export function RecordsView({ getRecordsAction, deleteRecordAction }: RecordsViewProps) {
  const [records, setRecords] = useState<TemperatureRecordClient[]>([]);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      startDate: format(new Date(), "yyyy-MM-dd"),
      endDate: format(new Date(), "yyyy-MM-dd"),
      local: "all",
      turno: "all",
      tipo: "all",
    },
  });

  const fetchRecords = useCallback((filters: any) => {
    startTransition(async () => {
      const dbFilters = {
        ...filters,
        local: filters.local === 'all' ? '' : filters.local,
        turno: filters.turno === 'all' ? '' : filters.turno,
        tipo: filters.tipo === 'all' ? '' : filters.tipo,
      }
      const result = await getRecordsAction(dbFilters);
      const clientRecords = result.map(r => ({ ...r, data: new Date(r.data.seconds * 1000) }));
      setRecords(clientRecords);
    });
  }, [getRecordsAction]);

  useEffect(() => {
    fetchRecords(watch());
  }, []);

  const onFilterSubmit = (data: any) => {
    fetchRecords(data);
  };

  const handleDelete = async (id: string) => {
    const originalRecords = [...records];
    setRecords(records.filter(r => r.id !== id));
    
    const result = await deleteRecordAction(id);
    if(result.success) {
        toast({ title: "Sucesso", description: result.message });
        fetchRecords(watch());
    } else {
        toast({ title: "Erro", description: result.message, variant: "destructive" });
        setRecords(originalRecords);
    }
  };

  const exportToExcel = () => {
    if (records.length === 0) {
      toast({ title: "Aviso", description: "Nenhum registro para exportar!", variant: "default" });
      return;
    }

    const data = records.map(reg => ({
        'Data': format(reg.data, 'dd/MM/yyyy'),
        'Hora': format(reg.data, 'HH:mm:ss'),
        'Turno': reg.turno,
        'Local': reg.local,
        'Código': reg.codigo || 'N/A',
        'Produto': reg.produto,
        'Tipo': reg.tipo,
        'Estado': reg.estado,
        'Temp. Início (°C)': reg.temperaturas.inicio,
        'Temp. Meio (°C)': reg.temperaturas.meio,
        'Temp. Fim (°C)': reg.temperaturas.fim
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Registros");
    XLSX.writeFile(wb, `registros_temperatura_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    toast({ title: "Sucesso", description: "Exportação para Excel concluída!" });
  };

  const exportToPDF = () => {
    if (records.length === 0) {
        toast({ title: "Aviso", description: "Nenhum registro para exportar!", variant: "default" });
        return;
    }

    const doc = new jsPDF({ orientation: 'landscape' });

    doc.setFontSize(18);
    doc.text('Relatório de Temperaturas', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Emitido em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, doc.internal.pageSize.getWidth() / 2, 22, { align: 'center' });

    (doc as any).autoTable({
        head: [['Data', 'Hora', 'Turno', 'Local', 'Código', 'Produto', 'Tipo', 'Estado', 'Início', 'Meio', 'Fim']],
        body: records.map(reg => [
            format(reg.data, 'dd/MM/yyyy'),
            format(reg.data, 'HH:mm'),
            reg.turno,
            reg.local,
            reg.codigo || 'N/A',
            reg.produto,
            reg.tipo,
            reg.estado,
            `${reg.temperaturas.inicio.toFixed(1)}°C`,
            `${reg.temperaturas.meio.toFixed(1)}°C`,
            `${reg.temperaturas.fim.toFixed(1)}°C`,
        ]),
        startY: 30,
        styles: { fontSize: 7, cellPadding: 2 },
        headStyles: { fillColor: [75, 0, 130] },
    });

    doc.save(`registros_temperatura_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    toast({ title: "Sucesso", description: "Exportação para PDF concluída!" });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onFilterSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="startDate"><CalendarDays className="inline-block mr-2 h-4 w-4"/>Data Inicial</Label>
                <Input id="startDate" type="date" {...register("startDate")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate"><CalendarDays className="inline-block mr-2 h-4 w-4"/>Data Final</Label>
                <Input id="endDate" type="date" {...register("endDate")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="local">Local</Label>
                <Select
                  {...register("local")}
                  onValueChange={(value) => setValue('local', value)}
                  defaultValue="all"
                >
                  <SelectTrigger><SelectValue placeholder="Todos os locais" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os locais</SelectItem>
                    {locationOptions.map((group) => (
                      <SelectGroup key={group.label}>
                        <SelectLabel>{group.label}</SelectLabel>
                        {group.options.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="turno">Turno</Label>
                 <Select {...register("turno")} onValueChange={(value) => setValue('turno', value)} defaultValue="all">
                  <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="1">1º Turno</SelectItem>
                    <SelectItem value="2">2º Turno</SelectItem>
                  </SelectContent>
                </Select>
              </div>
               <div className="space-y-2">
                <Label htmlFor="tipo">Mercado</Label>
                 <Select {...register("tipo")} onValueChange={(value) => setValue('tipo', value)} defaultValue="all">
                  <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="MI">MI</SelectItem>
                    <SelectItem value="ME">ME</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="animate-spin" /> : <Filter />} Filtrar
              </Button>
               <Button type="button" variant="outline" onClick={exportToExcel}><FileSpreadsheet/>Exportar Excel</Button>
               <Button type="button" variant="outline" onClick={exportToPDF}><FileText/>Exportar PDF</Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      {isPending ? (
        <div className="text-center p-8">
            <Loader2 className="mx-auto size-8 animate-spin text-primary"/>
            <p className="mt-2 text-muted-foreground">Carregando registros...</p>
        </div>
      ) : records.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {records.map((record) => (
            <RecordCard key={record.id} record={record} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
         <div className="text-center p-8 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">Nenhum registro encontrado para os filtros selecionados.</p>
        </div>
      )}
    </div>
  );
}

    