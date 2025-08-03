"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { locationOptions } from "@/constants/locations";
import { Barcode, Box, Calendar, Clock, Loader2, Save, Snowflake, Tag, Trash2, Users } from "lucide-react";
import { useEffect, useTransition, useCallback } from "react";
import { format } from "date-fns";

const formSchema = z.object({
  turno: z.string({ required_error: "Turno é obrigatório." }).min(1, "Turno é obrigatório."),
  local: z.string({ required_error: "Local é obrigatório." }).min(1, "Local é obrigatório."),
  codigo: z.string().optional(),
  produto: z.string({ required_error: "Produto é obrigatório." }).min(1, "Produto é obrigatório."),
  tipo: z.string({ required_error: "Tipo é obrigatório." }).min(1, "Tipo é obrigatório."),
  estado: z.string({ required_error: "Estado é obrigatório." }).min(1, "Estado é obrigatório."),
  dataManual: z.string({ required_error: "Data é obrigatória." }).min(1, "Data é obrigatória."),
  horarioManual: z.string({ required_error: "Horário é obrigatório." }).min(1, "Horário é obrigatório."),
  tempInicio: z.coerce.number({ required_error: "Temperatura de início é obrigatória.", invalid_type_error: "Deve ser um número." }),
  tempMeio: z.coerce.number({ required_error: "Temperatura de meio é obrigatória.", invalid_type_error: "Deve ser um número." }),
  tempFim: z.coerce.number({ required_error: "Temperatura de fim é obrigatória.", invalid_type_error: "Deve ser um número." }),
});

type FormValues = z.infer<typeof formSchema>;

interface TemperatureFormProps {
  addRecordAction: (data: FormValues) => Promise<{ success: boolean; message: string }>;
  lookupProductAction: (productCode: string) => Promise<{ productName?: string; productType?: string; matchProbability: number; } | null>;
}

// Debounce function
function debounce<T extends (...args: any[]) => void>(func: T, delay: number) {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
}

export function TemperatureForm({ addRecordAction, lookupProductAction }: TemperatureFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isLookingUp, startLookupTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      turno: "",
      local: "",
      codigo: "",
      produto: "",
      tipo: "",
      estado: "",
      dataManual: format(new Date(), "yyyy-MM-dd"),
      horarioManual: format(new Date(), "HH:mm"),
      tempInicio: undefined,
      tempMeio: undefined,
      tempFim: undefined,
    },
  });

  const productCode = form.watch("codigo");

  const debouncedLookup = useCallback(
    debounce((code: string) => {
      if (code && code.length > 2) {
        startLookupTransition(async () => {
          const result = await lookupProductAction(code);
          if (result && result.matchProbability > 0.95) {
            if(result.productName) form.setValue("produto", result.productName, { shouldValidate: true });
            if(result.productType) form.setValue("tipo", result.productType, { shouldValidate: true });
          }
        });
      }
    }, 500),
    [lookupProductAction, form.setValue]
  );
  
  useEffect(() => {
    if (productCode) {
      debouncedLookup(productCode);
    }
  }, [productCode, debouncedLookup]);


  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const result = await addRecordAction(values);
      if (result.success) {
        toast({
          title: "Sucesso!",
          description: result.message,
          variant: "default",
        });
        form.reset({
          ...form.getValues(),
          codigo: "",
          produto: "",
          tempInicio: undefined,
          tempMeio: undefined,
          tempFim: undefined,
        });
      } else {
        toast({
          title: "Erro",
          description: result.message,
          variant: "destructive",
        });
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="turno"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Users/>Turno *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Selecione o turno" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">1º Turno</SelectItem>
                    <SelectItem value="2">2º Turno</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="local"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Clock/>Local *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Selecione o local" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
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
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="codigo"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Barcode/>Código do Produto</FormLabel>
                <FormControl>
                    <div className="relative">
                        <Input placeholder="Digite o código para busca" {...field} />
                        {isLookingUp && <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 size-5 animate-spin text-muted-foreground" />}
                    </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="produto"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Box/>Produto *</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do produto" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tipo"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Tag/>Tipo *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="MI">MI</SelectItem>
                    <SelectItem value="ME">ME</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="estado"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Snowflake/>Estado *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Selecione o estado" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Congelado">Congelado</SelectItem>
                    <SelectItem value="Resfriado">Resfriado</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dataManual"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Calendar/>Data *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="horarioManual"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Clock/>Horário *</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
            <h3 className="text-lg font-medium text-primary mb-4">Temperaturas (°C) *</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <FormField
                    control={form.control}
                    name="tempInicio"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Início</FormLabel>
                        <FormControl>
                        <Input type="number" step="0.1" placeholder="Ex: -18.5" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="tempMeio"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Meio</FormLabel>
                        <FormControl>
                        <Input type="number" step="0.1" placeholder="Ex: -18.0" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="tempFim"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Fim</FormLabel>
                        <FormControl>
                        <Input type="number" step="0.1" placeholder="Ex: -17.9" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
        </div>


        <div className="flex flex-wrap gap-4">
          <Button type="submit" disabled={isPending}>
            {isPending ? <Loader2 className="animate-spin" /> : <Save />}
            Registrar
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset({
                ...form.getValues(),
                codigo: "",
                produto: "",
                tempInicio: undefined,
                tempMeio: undefined,
                tempFim: undefined,
              })}
            disabled={isPending}
          >
            <Trash2 />
            Limpar
          </Button>
        </div>
      </form>
    </Form>
  );
}
