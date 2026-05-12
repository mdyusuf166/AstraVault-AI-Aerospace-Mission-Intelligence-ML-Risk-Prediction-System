"use client";

import { AlertTriangle } from "lucide-react";

export default function ErrorPage({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="command-card max-w-lg p-6">
        <div className="mb-4 flex items-center gap-3 text-danger">
          <AlertTriangle className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Data link interrupted</h2>
        </div>
        <p className="text-sm text-slate-300">{error.message || "The requested data could not be loaded."}</p>
        <button
          type="button"
          onClick={reset}
          className="mt-5 rounded-md bg-telemetry px-4 py-2 text-sm font-semibold text-slate-950"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
