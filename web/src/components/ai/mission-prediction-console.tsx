"use client";

import { useState, useTransition } from "react";
import { BrainCircuit, Loader2 } from "lucide-react";
import type { MissionSuccessPrediction } from "@/lib/ml-api";
import { asPercent } from "@/lib/utils";

type MissionOption = {
  id: string;
  name: string;
  destination: string;
};

type ApiResponse = {
  data?: MissionSuccessPrediction;
  error?: string;
};

export function MissionPredictionConsole({ missions }: { missions: MissionOption[] }) {
  const [result, setResult] = useState<MissionSuccessPrediction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const payload = {
        missionId: stringOrUndefined(formData.get("missionId")),
        destination: stringOrUndefined(formData.get("destination")) ?? "Low Earth Orbit",
        orbitType: stringOrUndefined(formData.get("orbitType")) ?? "LEO",
        missionType: stringOrUndefined(formData.get("missionType")) ?? "SATELLITE_DEPLOYMENT",
        payloadMassKg: numberOrUndefined(formData.get("payloadMassKg")) ?? 1000,
        rocketReliability: numberOrUndefined(formData.get("rocketReliability")) ?? 0.82,
        organizationExperience: numberOrUndefined(formData.get("organizationExperience")) ?? 0.75,
        launchVehicleHistory: numberOrUndefined(formData.get("launchVehicleHistory")) ?? 0.8,
        previousFailures: numberOrUndefined(formData.get("previousFailures")) ?? 0,
        launchSiteHistory: numberOrUndefined(formData.get("launchSiteHistory")) ?? 0.82,
        crewed: formData.get("crewed") === "on",
        totalLaunches: numberOrUndefined(formData.get("totalLaunches")) ?? 20,
        successfulLaunches: numberOrUndefined(formData.get("successfulLaunches")) ?? 18,
        failedLaunches: numberOrUndefined(formData.get("failedLaunches")) ?? 1,
        partialFailures: numberOrUndefined(formData.get("partialFailures")) ?? 1,
        budgetLevel: stringOrUndefined(formData.get("budgetLevel")) ?? "MEDIUM",
        reliabilityPriority: stringOrUndefined(formData.get("reliabilityPriority")) ?? "HIGH"
      };
      const response = await fetch("/api/ai/predict-mission-success", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
      });
      const body = (await response.json()) as ApiResponse;
      if (!response.ok || body.error || !body.data) {
        setError(body.error ?? "Prediction request failed.");
        return;
      }
      setResult(body.data);
    });
  }

  return (
    <form action={submit} className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="grid gap-4 rounded-lg border border-line bg-white/[0.03] p-4 sm:grid-cols-2">
        <FieldSelect label="Existing Mission" name="missionId" optional options={missions.map((mission) => ({ value: mission.id, label: mission.name }))} />
        <Field label="Destination" name="destination" placeholder="Moon" />
        <FieldSelect
          label="Orbit"
          name="orbitType"
          options={["LEO", "GEO", "LUNAR", "SOLAR", "SUBORBITAL", "INTERPLANETARY", "UNKNOWN"].map((value) => ({ value, label: value }))}
        />
        <Field label="Mission Type" name="missionType" placeholder="SCIENCE" />
        <Field label="Payload Mass KG" name="payloadMassKg" type="number" placeholder="1000" />
        <Field label="Rocket Reliability" name="rocketReliability" type="number" placeholder="0.82" step="0.01" />
        <Field label="Organization Experience" name="organizationExperience" type="number" placeholder="0.75" step="0.01" />
        <Field label="Vehicle History" name="launchVehicleHistory" type="number" placeholder="0.8" step="0.01" />
        <Field label="Launch Site History" name="launchSiteHistory" type="number" placeholder="0.82" step="0.01" />
        <Field label="Previous Failures" name="previousFailures" type="number" placeholder="0" />
        <Field label="Total Launches" name="totalLaunches" type="number" placeholder="20" />
        <Field label="Successful Launches" name="successfulLaunches" type="number" placeholder="18" />
        <Field label="Failed Launches" name="failedLaunches" type="number" placeholder="1" />
        <Field label="Partial Failures" name="partialFailures" type="number" placeholder="1" />
        <div className="grid content-end gap-2">
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input name="crewed" type="checkbox" className="h-4 w-4 rounded border-line bg-panel" />
            Crewed mission
          </label>
        </div>
        <button
          type="submit"
          disabled={pending}
          className="flex h-10 items-center justify-center gap-2 rounded-md bg-telemetry px-4 text-sm font-semibold text-slate-950 disabled:opacity-70 sm:col-span-2"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4" />}
          Run Prediction
        </button>
      </div>

      <PredictionResult result={result} error={error} pending={pending} />
    </form>
  );
}

function PredictionResult({
  result,
  error,
  pending
}: {
  result: MissionSuccessPrediction | null;
  error: string | null;
  pending: boolean;
}) {
  if (pending) {
    return <div className="rounded-lg border border-line bg-white/[0.03] p-5 text-sm text-slate-400">Running mission inference...</div>;
  }
  if (error) {
    return <div className="rounded-lg border border-danger/40 bg-danger/10 p-5 text-sm text-danger">{error}</div>;
  }
  if (!result) {
    return <div className="rounded-lg border border-line bg-white/[0.03] p-5 text-sm text-slate-400">Awaiting telemetry input.</div>;
  }
  return (
    <div className="rounded-lg border border-line bg-white/[0.03] p-5">
      <p className="label">AI Prediction</p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-3xl font-semibold text-white">{asPercent(result.successProbability)}</p>
          <p className="mt-1 text-sm text-slate-400">Success probability</p>
        </div>
        <span className="rounded-full border border-telemetry/40 bg-telemetry/10 px-3 py-1 text-sm font-medium text-telemetry">
          {result.riskLevel} risk
        </span>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-300">{result.explanation}</p>
      <div className="mt-4 grid gap-2">
        {result.topRiskFactors.map((factor) => (
          <div key={factor} className="rounded-md border border-line bg-panel/60 px-3 py-2 text-sm text-slate-300">
            {factor}
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs uppercase tracking-[0.16em] text-slate-500">Confidence {asPercent(result.confidenceScore)}</p>
    </div>
  );
}

function Field({ label, name, type = "text", placeholder, step }: { label: string; name: string; type?: string; placeholder?: string; step?: string }) {
  return (
    <div>
      <label className="label" htmlFor={name}>
        {label}
      </label>
      <input id={name} name={name} type={type} step={step} placeholder={placeholder} className="field mt-2 w-full" />
    </div>
  );
}

function FieldSelect({
  label,
  name,
  options,
  optional
}: {
  label: string;
  name: string;
  options: Array<{ value: string; label: string }>;
  optional?: boolean;
}) {
  return (
    <div>
      <label className="label" htmlFor={name}>
        {label}
      </label>
      <select id={name} name={name} className="field mt-2 w-full">
        {optional ? <option value="">Custom Scenario</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function stringOrUndefined(value: FormDataEntryValue | null) {
  const stringValue = typeof value === "string" ? value.trim() : "";
  return stringValue.length ? stringValue : undefined;
}

function numberOrUndefined(value: FormDataEntryValue | null) {
  const stringValue = stringOrUndefined(value);
  return stringValue ? Number(stringValue) : undefined;
}
