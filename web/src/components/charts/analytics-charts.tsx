"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const colors = ["#38bdf8", "#34d399", "#f59e0b", "#fb7185", "#a78bfa", "#f472b6", "#22d3ee"];

function tooltipStyle() {
  return {
    background: "#07111f",
    border: "1px solid rgba(148, 163, 184, 0.24)",
    borderRadius: 8,
    color: "#e5edf7"
  };
}

export function LaunchFrequencyChart({ data }: { data: Array<{ year: string; launches: number; failures: number }> }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid stroke="rgba(148, 163, 184, 0.15)" />
        <XAxis dataKey="year" stroke="#94a3b8" tickLine={false} axisLine={false} />
        <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipStyle()} />
        <Line type="monotone" dataKey="launches" stroke="#38bdf8" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="failures" stroke="#fb7185" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function StatusPieChart({ data }: { data: Array<{ status: string; count: number }> }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} dataKey="count" nameKey="status" outerRadius={100} innerRadius={56} paddingAngle={3}>
          {data.map((_, index) => (
            <Cell key={index} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle()} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function AgencyComparisonChart({
  data
}: {
  data: Array<{ name: string; missions: number; successes: number; successRate: number }>;
}) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data}>
        <CartesianGrid stroke="rgba(148, 163, 184, 0.15)" />
        <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} />
        <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipStyle()} />
        <Bar dataKey="missions" fill="#38bdf8" radius={[4, 4, 0, 0]} />
        <Bar dataKey="successes" fill="#34d399" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function RocketReliabilityChart({
  data
}: {
  data: Array<{ name: string; launches: number; successes: number; reliability: number }>;
}) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} layout="vertical" margin={{ left: 36 }}>
        <CartesianGrid stroke="rgba(148, 163, 184, 0.15)" />
        <XAxis type="number" stroke="#94a3b8" tickLine={false} axisLine={false} domain={[0, 100]} />
        <YAxis type="category" dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} width={120} />
        <Tooltip contentStyle={tooltipStyle()} />
        <Bar dataKey="reliability" fill="#34d399" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
