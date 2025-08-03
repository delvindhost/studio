
import { getTemperatureRecords } from "@/app/actions";
import { ChartsView } from "@/components/charts/ChartsView";
import { LineChart } from "lucide-react";

export default function ChartsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <h1 className="text-2xl md:text-3xl font-bold text-primary flex items-center gap-3">
          <LineChart className="size-8 text-accent" />
          Análise de Temperaturas
        </h1>
      </div>
      <ChartsView getRecordsAction={getTemperatureRecords} />
    </div>
  );
}
