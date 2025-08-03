
import { getTemperatureRecords, deleteTemperatureRecord } from "@/app/actions";
import { RecordsView } from "@/components/visualize/RecordsView";
import { List } from "lucide-react";

export default function VisualizePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-primary flex items-center gap-3">
          <List className="size-8 text-accent" />
          Visualizar Registros
        </h1>
      </div>
      <RecordsView
        getRecordsAction={getTemperatureRecords}
        deleteRecordAction={deleteTemperatureRecord}
      />
    </div>
  );
}
