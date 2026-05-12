"use client";

import { useState, useTransition } from "react";
import { Loader2, ShieldAlert } from "lucide-react";
import type { MissionRiskAnalysisResult } from "@/lib/ml-api";
import { asPercent } from "@/lib/utils";

type ApiResponse = {
  data?: MissionRiskAnalysisResult;
  error?: string;
};

export function RiskAnalysisConsole() {
  const [result, setResult] = useState<MissionRiskAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const payload = {
        destination: String(formData.get("destination") || "Moon"),
        orbitType: String(formData.get("orbitType") || "LUNAR"),
        missionType: String(formData.get("missionType") || "SCIENCE"),
        payloadMassKg: Number(formData.get("payloadMassKg") || 1200),
        rocketReliability: Number(formData.get("rocketReliability") || 0.82),
        organizationExperience: Number(formData.get("organizationExperience") || 0.75),
        launchVehicleHistory: Number(formData.get("launchVehicleHistory") || 0.8),
        launchSiteHistory: Number(formData.get("launchSiteHistory") || 0.82),
        previousFailures: Number(formData.get("previousFailures") || 0),
        crewed: formData.get("crewed") === "on"
      };
      const response = await fetch("/api/ai/mission-risk-analysis", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
      });
      const body = (await response.json()) as ApiResponse;
      if (!response.ok || body.error || !body.data) {
        setError(body.error ?? "Risk analysis failed.");
        return;
      }
      setResult(body.data);
    });
  }

  return (
    <form action={submit} className="grid gap-4 lg:grid-cols-[360px_1fr]">
      <div className="grid gap-4 rounded-lg border border-line bg-white/[0.03] p-4">
        <Field label="Destination" name="destination" placeholder="Moon" />
        <Field label="Orbit Type" name="orbitType" placeholder="LUNAR" />
        <Field label="Mission Type" name="missionType" placeholder="SCIENCE" />
        <Field label="Payload Mass KG" name="payloadMassKg" type="number" placeholder="1200" />
        <Field label="Rocket Reliability" name="rocketReliability" type="number" step="0.01" placeholder="0.82" />
        <Field label="Org Experience" name="organizationExperience" type="number" step="0.01" placeholder="0.75" />
        <Field label="Vehicle History" name="launchVehicleHistory" type="number" step="0.01" placeholder="0.8" />
        <Field label="Launch Site History" name="launchSiteHistory" type="number" step="0.01" placeholder="0.82" />
        <Field label="Previous Failures" name="previousFailures" type="number" placeholder="0" />
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input name="crewed" type="checkbox" className="h-4 w-4 rounded border-line bg-panel" />
          Crewed mission
        </label>
        <button type="submit" disabled={pending} className="flex h-10 items-center justify-center gap-2 rounded-md bg-warning px-4 text-sm font-semibold text-slate-950 disabled:opacity-70">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldAlert className="h-4 w-4" />}
          Analyze Risk
        </button>
      </div>

      <div className="rounded-lg border border-line bg-white/[0.03] p-5">
        {pending ? <p className="text-sm text-slate-400">Building mission risk report...</p> : null}
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        {!pending && !error && !result ? <p className="text-sm text-slate-400">No risk analysis run yet.</p> : null}
        {result ? (
          <div>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="label">Mission Readiness</p>
                <p className="mt-3 text-4xl font-semibold text-white">{asPercent(result.finalMissionReadinessScore)}</p>
              </div>
              <span className="rounded-full border border-warning/40 bg-warning/10 px-3 py-1 text-sm text-warning">{result.riskLevel} risk</span>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <RiskMetric label="Technical" value={result.technicalRisk} />
              <RiskMetric label="Operational" value={result.operationalRisk} />
              <RiskMetric label="Payload" value={result.payloadRisk} />
              <RiskMetric label="Launch Vehicle" value={result.launchVehicleRisk} />
              <RiskMetric label="Orbital" value={result.orbitalRisk} />
              <RiskMetric label="Organization" value={result.organizationExperienceRisk} />
            </div>
            <p className="mt-5 text-sm leading-6 text-slate-300">{result.explanation}</p>
            <div className="mt-4 grid gap-2">
              {result.riskFactors.map((factor) => (
                <div key={factor} className="rounded-md border border-line bg-panel/60 px-3 py-2 text-sm text-slate-300">
                  {factor}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </form>
  );
}

function RiskMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-line bg-panel/60 p-3">
      <p className="label">{label}</p>
      <p className="mt-2 text-xl font-semibold text-white">{asPercent(value)}</p>
    </div>
  );
}

function Field({ label, name, type = "text", step, placeholder }: { label: string; name: string; type?: string; step?: string; placeholder?: string }) {
  return (
    <label>
      <span className="label">{label}</span>
      <input name={name} type={type} step={step} placeholder={placeholder} className="field mt-2 w-full" />
    </label>
  );
}
