"use client";
import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from "recharts";
import type { AthleteProcessed, GroupStats } from "@/types/athlete";
import { METRIC_REGISTRY, fmt, trafficLight, cn } from "@/lib/utils";

interface MetricVisualizerProps {
  athletes: AthleteProcessed[];
  teamStats: GroupStats;
}

const POS_COLORS: Record<string, string> = {
  Basketball: "#f97316", Volleyball: "#38bdf8", Hockey: "#34d399",
};

export function MetricVisualizer({ athletes, teamStats }: MetricVisualizerProps) {
  const [selectedMetric, setSelectedMetric] = useState("cmj_jump_height_m");
  const [colorBy, setColorBy]   = useState<"position" | "percentile">("position");

  const meta = METRIC_REGISTRY.find(m => m.key === selectedMetric)!;
  const avg  = teamStats.mean[selectedMetric] ?? 0;

  const data = [...athletes]
    .sort((a, b) => Number(b[selectedMetric]) - Number(a[selectedMetric]))
    .map(a => ({
      name:      a.athlete_name.split(" ").slice(-1)[0], // last name only
      fullName:  a.athlete_name,
      position:  a.position,
      value:     Number(a[selectedMetric]),
      percentile: a.percentiles[selectedMetric] ?? 50,
    }));

  const getColor = (d: typeof data[0]) => {
    if (colorBy === "position") return POS_COLORS[d.position] ?? "#6366f1";
    const eff = meta.higherIsBetter ? d.percentile : 100 - d.percentile;
    return eff >= 66 ? "#10b981" : eff >= 33 ? "#f59e0b" : "#ef4444";
  };

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="card p-4 flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px]">
          <p className="label-sm mb-1.5">Metric</p>
          <select
            value={selectedMetric}
            onChange={e => setSelectedMetric(e.target.value)}
            className="w-full bg-navy-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            {METRIC_REGISTRY.map(m => (
              <option key={m.key} value={m.key}>{m.label} ({m.unit})</option>
            ))}
          </select>
        </div>
        <div>
          <p className="label-sm mb-1.5">Color by</p>
          <div className="flex rounded-lg overflow-hidden border border-white/10">
            {(["position", "percentile"] as const).map(opt => (
              <button
                key={opt}
                onClick={() => setColorBy(opt)}
                className={cn(
                  "px-3 py-2 text-xs capitalize transition-colors",
                  colorBy === opt ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >{opt}</button>
            ))}
          </div>
        </div>
        <div className="text-right">
          <p className="label-sm">Team Average</p>
          <p className="text-xl font-bold text-white mt-0.5">{fmt(avg, meta.unit)}</p>
        </div>
      </div>

      {/* Metric description */}
      <div className="px-1">
        <p className="text-sm text-slate-400">{meta.description}</p>
        <p className="text-xs text-slate-500 mt-1">
          {meta.higherIsBetter ? "Higher values are better." : "Lower values are better."}
          {" "} Category: <span className="text-slate-300">{meta.category}</span>
        </p>
      </div>

      {/* Bar chart */}
      <div className="card p-5">
        <h3 className="section-title mb-4">{meta.label} — All Athletes</h3>
        <ResponsiveContainer width="100%" height={Math.max(300, data.length * 28)}>
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 60, bottom: 5, left: 10 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" horizontal={false} />
            <XAxis
              type="number" domain={["auto", "auto"]}
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              tickFormatter={(v: number) => fmt(v, "", 1)}
            />
            <YAxis
              dataKey="name" type="category" width={80}
              tick={{ fill: "#cbd5e1", fontSize: 12 }}
            />
            <ReferenceLine
              x={avg}
              stroke="rgba(255,255,255,0.35)"
              strokeDasharray="5 3"
            />
            <Tooltip
              contentStyle={{ background: "#1e1b4b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px" }}
              content={({ payload }) => {
                if (!payload?.length) return null;
                const d = payload[0].payload as typeof data[0];
                return (
                  <div className="p-2.5 space-y-1">
                    <p className="font-bold text-white">{d.fullName}</p>
                    <p className="text-slate-400 text-xs">{d.position}</p>
                    <p className="text-slate-200 text-xs">{meta.label}: <strong className="text-white">{fmt(d.value, meta.unit)}</strong></p>
                    <p className={cn("text-xs font-semibold", trafficLight(d.percentile, meta.higherIsBetter))}>
                      {d.percentile}th percentile in squad
                    </p>
                  </div>
                );
              }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={20}
              label={{ position: "right", fill: "#94a3b8", fontSize: 11, formatter: (v: number) => fmt(v, meta.unit) }}
            >
              {data.map((d, i) => (
                <Cell key={i} fill={getColor(d)} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Mean",   value: fmt(teamStats.mean[selectedMetric], meta.unit) },
          { label: "Median", value: fmt(teamStats.median[selectedMetric], meta.unit) },
          { label: "SD",     value: fmt(teamStats.std[selectedMetric], meta.unit) },
          { label: "Range",  value: `${fmt(teamStats.min[selectedMetric])}–${fmt(teamStats.max[selectedMetric])} ${meta.unit}` },
        ].map(({ label, value }) => (
          <div key={label} className="card p-4 text-center">
            <p className="label-sm">{label}</p>
            <p className="text-lg font-bold text-white mt-1">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
