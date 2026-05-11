import { SearchX } from "lucide-react";

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-line bg-white/[0.02] p-8 text-center">
      <SearchX className="mx-auto h-8 w-8 text-slate-500" />
      <h3 className="mt-3 text-base font-semibold text-white">{title}</h3>
      <p className="mt-1 text-sm text-slate-400">{message}</p>
    </div>
  );
}
