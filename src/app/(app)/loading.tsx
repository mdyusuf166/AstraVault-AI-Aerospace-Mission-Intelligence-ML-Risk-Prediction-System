import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="command-card flex items-center gap-3 px-5 py-4 text-sm text-slate-300">
        <Loader2 className="h-4 w-4 animate-spin text-telemetry" />
        Syncing mission telemetry
      </div>
    </div>
  );
}
