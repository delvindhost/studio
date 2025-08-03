
"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import type { TemperatureRecordClient } from "@/types";
import { locationOptions } from "@/constants/locations";
import { CalendarDays, Filter, Loader2, BarChart, LineChartIcon, Box } from "lucide-react";

import { ProductTempChart } from "./ProductTempChart";
import { LocationTempChart } from "./LocationTempChart";
import { TempVariationChart } from "./TempVariationChart";

interface ChartsViewProps {
  getRecordsAction: (filters: any) => Promise<any[]>;
}

export function ChartsView({ getRecordsAction }: ChartsViewProps) {
  const [records, setRecords] = useState<TemperatureRecordClient[]>([]);
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      startDate: format(new Date(), "yyyy-MM-dd"),
      endDate: format(new Date(), "yyyy-MM-dd"),
      local: "all",
      mercado: "all",
    },
  });

  const fetchRecords = useCallback((filters: any) => {
    startTransition(async () => {
      const dbFilters = {
        ...filters,
        local: filters.local === 'all' ? '' : filters.local,
        tipo: filters.mercado === 'all' ? '' : filters.mercado,
      };
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
  
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onFilterSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 items-end">
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
                <Select onValueChange={(v) => setValue('local', v)} defaultValue="all">
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
                <Label htmlFor="mercado">Mercado</Label>
                 <Select onValueChange={(v) => setValue('mercado', v)} defaultValue="all">
                  <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="MI">Mercado Interno (MI)</SelectItem>
                    <SelectItem value="ME">Mercado Externo (ME)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
             <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="animate-spin" /> : <Filter />} Atualizar Gráficos
              </Button>
          </form>
        </CardContent>
      </Card>

      {isPending ? (
         <div className="text-center p-8">
            <Loader2 className="mx-auto size-8 animate-spin text-primary"/>
            <p className="mt-2 text-muted-foreground">Carregando gráficos...</p>
        </div>
      ) : records.length > 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card className="col-span-1 xl:col-span-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Box className="text-accent"/>Temperatura Média por Produto</CardTitle>
                </CardHeader>
                <CardContent>
                    <ProductTempChart data={records} />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BarChart className="text-accent"/>Média de Temperaturas por Local</CardTitle>
                </CardHeader>
                <CardContent>
                    <LocationTempChart data={records} />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><LineChartIcon className="text-accent"/>Variação de Temperaturas</CardTitle>
                </CardHeader>
                <CardContent>
                    <TempVariationChart data={records} />
                </CardContent>
            </Card>
        </div>
      ) : (
         <div className="text-center p-8 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">Nenhum dado disponível para gerar gráficos com os filtros selecionados.</p>
        </div>
      )}
    </div>
  );
}

    