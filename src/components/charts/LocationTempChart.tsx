"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"
import type { TemperatureRecordClient } from "@/types"

interface ChartProps {
  data: TemperatureRecordClient[]
}

export function LocationTempChart({ data }: ChartProps) {
    const locations = data.reduce((acc, reg) => {
        const key = reg.local || 'Desconhecido';
        if (!acc[key]) {
            acc[key] = { inicio: [], meio: [], fim: [] };
        }
        acc[key].inicio.push(reg.temperaturas.inicio);
        acc[key].meio.push(reg.temperaturas.meio);
        acc[key].fim.push(reg.temperaturas.fim);
        return acc;
    }, {} as Record<string, { inicio: number[], meio: number[], fim: number[] }>);

    const chartData = Object.keys(locations).map(key => {
        const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
        return {
            name: key,
            inicio: avg(locations[key].inicio),
            meio: avg(locations[key].meio),
            fim: avg(locations[key].fim),
        }
    });

  return (
    <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(value) => `${value.toFixed(0)}°C`}/>
            <Tooltip
              contentStyle={{
                background: "hsl(var(--background))",
                borderColor: "hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
              formatter={(value: number) => `${value.toFixed(1)}°C`}
            />
            <Legend />
            <Bar dataKey="inicio" name="Início" fill="hsl(var(--primary))" />
            <Bar dataKey="meio" name="Meio" fill="hsl(var(--accent))" />
            <Bar dataKey="fim" name="Fim" fill="hsl(var(--secondary-foreground))" />
        </BarChart>
        </ResponsiveContainer>
    </div>
  )
}
