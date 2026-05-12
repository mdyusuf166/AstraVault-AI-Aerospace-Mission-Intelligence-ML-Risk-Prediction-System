"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import type { FailurePatternResult } from "@/lib/ml-api";

type ApiResponse = {
  data?: {
    patterns: FailurePatternResult[];
  };
  error?: string;
};

export function FailurePatternsConsole() {
  const [patterns, setPatterns] = useState<FailurePatternResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const load = useCallback(() => {
    setError(null);
    startTransition(async () => {
      const response = await fetch("/api/ai/failure-patterns");
      const body = (await response.json()) as ApiResponse;
      if (!response.ok || body.error || !body.data) {
        setError(body.error ?? "Failure pattern request failed.");
        return;
      }
      setPatterns(body.data.patterns);
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={load}
          disabled={pending}
          className="flex h-10 items-center gap-2 rounded-md border border-warning/40 px-4 text-sm font-semibold text-warning disabled:opacity-70"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <AlertTriangle className="h-4 w-4" />}
          Refresh Patterns
        </button>
        {pending ? <p className="text-sm text-slate-400">Analyzing anomaly clusters...</p> : null}
      </div>

      {error ? <div className="rounded-lg border border-danger/40 bg-danger/10 p-4 text-sm text-danger">{error}</div> : null}

      {!pending && !error && !patterns.length ? (
        <div className="rounded-lg border border-line bg-white/[0.03] p-5 text-sm text-slate-400">No failure patterns available.</div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        {patterns.map((pattern) => (
          <div key={pattern.category} className="rounded-lg border border-line bg-white/[0.03] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="label">Failure Pattern</p>
                <h3 className="mt-2 text-lg font-semibold text-white">{pattern.category}</h3>
              </div>
              <span className="rounded-full border border-warning/40 bg-warning/10 px-3 py-1 text-sm text-warning">
                {pattern.percentage}%
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-300">{pattern.description}</p>
            <div className="mt-4 rounded-md border border-line bg-panel/60 px-3 py-2 text-sm text-slate-300">
              Frequency: {pattern.frequency}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
