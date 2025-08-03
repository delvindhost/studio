import { SettingsView } from "@/components/settings/SettingsView";
import { performDataCleanup, performFullReset } from "@/app/actions";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-primary flex items-center gap-3">
          <Settings className="size-8 text-accent" />
          Configurações do Sistema
        </h1>
      </div>
      <SettingsView
        cleanupAction={performDataCleanup}
        resetAction={performFullReset}
      />
    </div>
  );
}
