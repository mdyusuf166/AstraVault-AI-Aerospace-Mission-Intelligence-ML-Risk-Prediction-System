"use client";

import { useState, useTransition } from "react";
import { Loader2, WandSparkles } from "lucide-react";
import type { LaunchRecommendationResult } from "@/lib/ml-api";
import { asPercent } from "@/lib/utils";

type ApiResponse = {
  data?: LaunchRecommendationResult;
  error?: string;
};

export function LaunchRecommendationConsole() {
  const [recommendation, setRecommendation] = useState<LaunchRecommendationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const payload = {
        destination: String(formData.get("destination") || "Low Earth Orbit"),
        orbitType: String(formData.get("orbitType") || "LEO"),
        missionType: String(formData.get("missionType") || "SATELLITE_DEPLOYMENT"),
        payloadMassKg: Number(formData.get("payloadMassKg") || 1000),
        crewedStatus: formData.get("crewedStatus") === "on",
        budgetLevel: String(formData.get("budgetLevel") || "MEDIUM"),
        reliabilityPriority: String(formData.get("reliabilityPriority") || "HIGH")
      };
      const response = await fetch("/api/ai/recommend-launch-vehicle", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
      });
      const body = (await response.json()) as ApiResponse;
      if (!response.ok || body.error || !body.data) {
        setError(body.error ?? "Recommendation request failed.");
        return;
      }
      setRecommendation(body.data);
    });
  }

  return (
    <form action={submit} className="grid gap-4 lg:grid-cols-[360px_1fr]">
      <div className="grid gap-4 rounded-lg border border-line bg-white/[0.03] p-4">
        <Field label="Destination" name="destination" placeholder="Moon" />
        <label>
          <span className="label">Orbit</span>
          <select name="orbitType" className="field mt-2 w-full" defaultValue="LEO">
            {["LEO", "GEO", "LUNAR", "SOLAR", "SUBORBITAL", "INTERPLANETARY"].map((orbit) => (
              <option key={orbit} value={orbit}>
                {orbit}
              </option>
            ))}
          </select>
        </label>
        <Field label="Payload Mass KG" name="payloadMassKg" type="number" placeholder="1000" />
        <Field label="Mission Type" name="missionType" placeholder="SCIENCE" />
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input name="crewedStatus" type="checkbox" className="h-4 w-4 rounded border-line bg-panel" />
          Crewed mission
        </label>
        <button
          type="submit"
          disabled={pending}
          className="flex h-10 items-center justify-center gap-2 rounded-md bg-telemetry px-4 text-sm font-semibold text-slate-950 disabled:opacity-70"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <WandSparkles className="h-4 w-4" />}
          Recommend Vehicle
        </button>
      </div>

      <div className="rounded-lg border border-line bg-white/[0.03] p-5">
        {pending ? <p className="text-sm text-slate-400">Ranking launch vehicle candidates...</p> : null}
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        {!pending && !error && !recommendation ? <p className="text-sm text-slate-400">No recommendation run yet.</p> : null}
        <div className="space-y-3">
          {recommendation ? (
            <div className="rounded-lg border border-line bg-panel/60 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-white">{recommendation.recommendedRocket}</p>
                  <p className="mt-1 text-sm text-slate-400">Recommendation score {asPercent(recommendation.score)}</p>
                </div>
                <span className="rounded-full border border-aurora/40 bg-aurora/10 px-3 py-1 text-sm text-aurora">
                  {recommendation.estimatedRisk} risk
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-300">{recommendation.reason}</p>
              <div className="mt-3 grid gap-2">
                {recommendation.alternativeRockets.map((item) => (
                  <div key={item.rocket} className="rounded-md border border-line bg-white/[0.03] px-3 py-2 text-sm text-slate-300">
                    {item.rocket}: {item.reason}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </form>
  );
}

function Field({ label, name, type = "text", placeholder }: { label: string; name: string; type?: string; placeholder?: string }) {
  return (
    <label>
      <span className="label">{label}</span>
      <input name={name} type={type} placeholder={placeholder} className="field mt-2 w-full" />
    </label>
  );
}
