import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  tone = "telemetry"
}: {
  label: string;
  value: string | number;
  detail?: string;
  icon: LucideIcon;
  tone?: "telemetry" | "aurora" | "warning" | "danger";
}) {
  const tones = {
    telemetry: "text-telemetry bg-telemetry/12 border-telemetry/25",
    aurora: "text-aurora bg-aurora/12 border-aurora/25",
    warning: "text-warning bg-warning/12 border-warning/25",
    danger: "text-danger bg-danger/12 border-danger/25"
  };

  return (
    <div className="command-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="label">{label}</p>
          <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
        </div>
        <div className={cn("rounded-md border p-2", tones[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {detail ? <p className="mt-4 text-sm text-slate-400">{detail}</p> : null}
    </div>
  );
}
