"use client"

import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"
import type { TemperatureRecordClient } from "@/types"
import { format } from 'date-fns';

interface ChartProps {
  data: TemperatureRecordClient[]
}

export function TempVariationChart({ data }: ChartProps) {
    const sortedData = [...data].sort((a,b) => a.data.getTime() - b.data.getTime());
    
    const chartData = sortedData.map(reg => ({
        name: format(reg.data, 'dd/MM HH:mm'),
        inicio: reg.temperaturas.inicio,
        meio: reg.temperaturas.meio,
        fim: reg.temperaturas.fim,
    }));

  return (
    <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
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
            <Line type="monotone" dataKey="inicio" name="Início" stroke="hsl(var(--primary))" dot={false} />
            <Line type="monotone" dataKey="meio" name="Meio" stroke="hsl(var(--accent))" dot={false} />
            <Line type="monotone" dataKey="fim" name="Fim" stroke="hsl(var(--secondary-foreground))" dot={false} />
        </LineChart>
        </ResponsiveContainer>
    </div>
  )
}
