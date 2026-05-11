import { Command } from "lucide-react";
import { requireUser } from "@/lib/rbac";
import { Sidebar } from "@/components/layout/sidebar";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[280px_1fr]">
      <Sidebar user={user} />
      <main className="min-w-0 px-4 pb-10 pt-4 sm:px-6 lg:px-8 lg:pt-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-panel/70 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md border border-telemetry/40 bg-telemetry/10">
              <Command className="h-5 w-5 text-telemetry" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">AstraVault Command</p>
              <h1 className="text-lg font-semibold text-white">Aerospace Mission Intelligence</h1>
            </div>
          </div>
          <div className="rounded-md border border-line bg-white/[0.03] px-3 py-2 text-xs text-slate-300">
            <span className="text-slate-500">Access:</span> {user.role}
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
