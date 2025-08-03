import { TemperatureForm } from "@/components/forms/TemperatureForm";
import { addTemperatureRecord, lookupProduct } from "@/app/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Thermometer } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-primary flex items-center gap-3">
          <Thermometer className="size-8 text-accent" />
          Registro de Temperaturas
        </h1>
      </div>
      <Card>
        <CardContent className="pt-6">
          <TemperatureForm
            addRecordAction={addTemperatureRecord}
            lookupProductAction={lookupProduct}
          />
        </CardContent>
      </Card>
    </div>
  );
}
