import type { MissionStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

const statusStyles: Record<MissionStatus, string> = {
  SUCCESS: "border-aurora/35 bg-aurora/10 text-aurora",
  FAILURE: "border-danger/35 bg-danger/10 text-danger",
  PARTIAL: "border-warning/35 bg-warning/10 text-warning",
  ACTIVE: "border-telemetry/35 bg-telemetry/10 text-telemetry",
  PLANNED: "border-slate-400/25 bg-slate-400/10 text-slate-300"
};

export function StatusBadge({ status, className }: { status: MissionStatus; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold", statusStyles[status], className)}>
      {status}
    </span>
  );
}
