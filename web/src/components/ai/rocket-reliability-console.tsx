"use client";

import { useState, useTransition } from "react";
import { Loader2, Radar } from "lucide-react";
import type { RocketReliabilityResult } from "@/lib/ml-api";
import { asPercent } from "@/lib/utils";

type RocketOption = {
  id: string;
  name: string;
};

type ApiResponse = {
  data?: RocketReliabilityResult;
  error?: string;
};

export function RocketReliabilityConsole({ rockets }: { rockets: RocketOption[] }) {
  const [result, setResult] = useState<RocketReliabilityResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(formData: FormData) {
    const rocketId = String(formData.get("rocketId") ?? "");
    if (!rocketId) return;
    setError(null);
    startTransition(async () => {
      const rocket = rockets.find((item) => item.id === rocketId);
      const response = await fetch("/api/ai/rocket-reliability", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ rocketId, rocketName: rocket?.name ?? rocketId })
      });
      const body = (await response.json()) as ApiResponse;
      if (!response.ok || body.error || !body.data) {
        setError(body.error ?? "Reliability request failed.");
        return;
      }
      setResult(body.data);
    });
  }

  return (
    <form action={submit} className="grid gap-4 lg:grid-cols-[360px_1fr]">
      <div className="rounded-lg border border-line bg-white/[0.03] p-4">
        <label className="label" htmlFor="rocketId">
          Rocket Family
        </label>
        <select id="rocketId" name="rocketId" className="field mt-2 w-full" defaultValue={rockets[0]?.id}>
          {rockets.map((rocket) => (
            <option key={rocket.id} value={rocket.id}>
              {rocket.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={pending || !rockets.length}
          className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-md bg-aurora px-4 text-sm font-semibold text-slate-950 disabled:opacity-70"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Radar className="h-4 w-4" />}
          Score Reliability
        </button>
      </div>

      <div className="rounded-lg border border-line bg-white/[0.03] p-5">
        {pending ? <p className="text-sm text-slate-400">Computing launch history signal...</p> : null}
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        {!pending && !error && !result ? <p className="text-sm text-slate-400">Select a rocket family for scoring.</p> : null}
        {result ? (
          <>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="label">{result.rocketName}</p>
                <p className="mt-3 text-3xl font-semibold text-white">{asPercent(result.reliabilityScore)}</p>
                <p className="mt-1 text-sm text-slate-400">Reliability score</p>
              </div>
              <div className="rounded-md border border-line bg-panel/60 px-3 py-2 text-sm text-slate-300">
                Maturity {asPercent(result.rocketMaturityScore)}
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-4">
              <Metric label="Launches" value={result.totalLaunches} />
              <Metric label="Success" value={result.successfulLaunches} />
              <Metric label="Failure" value={result.failedLaunches} />
              <Metric label="Partial" value={result.partialFailures} />
            </div>
            <div className="mt-5 grid gap-2">
              <div className="rounded-md border border-line bg-panel/60 px-3 py-2 text-sm text-slate-300">
                Reliability {result.reliabilityPercentage}% with {result.experimentalRiskLevel} experimental risk.
              </div>
            </div>
          </>
        ) : null}
      </div>
    </form>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-line bg-panel/60 p-3">
      <p className="label">{label}</p>
      <p className="mt-2 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}
