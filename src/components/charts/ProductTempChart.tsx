"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import type { TemperatureRecordClient } from "@/types"

interface ChartProps {
  data: TemperatureRecordClient[]
}

export function ProductTempChart({ data }: ChartProps) {
    const products = data.reduce((acc, reg) => {
        const key = reg.produto || 'Desconhecido';
        if (!acc[key]) {
            acc[key] = { temps: [], count: 0 };
        }
        acc[key].temps.push(reg.temperaturas.inicio, reg.temperaturas.meio, reg.temperaturas.fim);
        acc[key].count += 3;
        return acc;
    }, {} as Record<string, { temps: number[], count: number }>);

    const chartData = Object.keys(products).map(key => ({
        name: key,
        avgTemp: products[key].temps.reduce((a, b) => a + b, 0) / products[key].count,
    })).sort((a,b) => b.avgTemp - a.avgTemp);

  return (
    <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 90 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} tick={{ fontSize: 10 }} />
            <YAxis domain={['dataMin - 5', 'dataMax + 5']} tickFormatter={(value) => `${value}°C`} />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--background))",
                borderColor: "hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
              formatter={(value: number) => [`${value.toFixed(1)}°C`, 'Temp. Média']}
            />
            <Bar dataKey="avgTemp" name="Temperatura Média" fill="hsl(var(--primary))" />
        </BarChart>
        </ResponsiveContainer>
    </div>
  )
}
