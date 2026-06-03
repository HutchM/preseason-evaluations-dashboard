"use client";
import { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from "recharts";
import type { AthleteProcessed, GroupStats } from "@/types/athlete";
import { METRIC_REGISTRY, fmt } from "@/lib/utils";
import { computeAllGroupStats } from "@/lib/data-processing";

type GroupBy = "sport" | "sex" | "year";

const GROUP_OPTIONS: { value: GroupBy; label: string }[] = [
  { value: "sport", label: "Sport" },
  { value: "sex",   label: "Sex" },
  { value: "year",  label: "Year of Study" },
];

// Colour palettes per grouping type
const SPORT_COLORS: Record<string, string> = {
  Basketball: "#f97316", Volleyball: "#38bdf8", Hockey: "#34d399",
};
const SEX_COLORS: Record<string, string> = {
  men: "#6366f1", women: "#ec4899",
};
const YEAR_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#a78bfa", "#ef4444", "#06b6d4"];

function getColor(groupBy: GroupBy, key: string, index: number): string {
  if (groupBy === "sport") return SPORT_COLORS[key] ?? "#6366f1";
  if (groupBy === "sex")   return SEX_COLORS[key]   ?? "#6366f1";
  return YEAR_COLORS[index % YEAR_COLORS.length];
}

function groupKey(a: AthleteProcessed, by: GroupBy): string {
  if (by === "sport") return a.position;
  if (by === "sex")   return a.sex || "Unknown";
  return a.session_date ? `Year ${a.session_date}` : "Unknown";
}

interface GroupComparisonProps {
  athletes:  AthleteProcessed[];
  teamStats: GroupStats;
}

export function GroupComparison({ athletes, teamStats }: GroupComparisonProps) {
  const [selectedMetric, setSelectedMetric] = useState("cmj_jump_height_m");
  const [groupBy, setGroupBy] = useState<GroupBy>("sport");

  const meta = METRIC_REGISTRY.find(m => m.key === selectedMetric)!;

  // Dynamically compute group stats based on selected grouping variable
  const { groupStats, groups } = useMemo(() => {
    const buckets: Record<string, AthleteProcessed[]> = {};
    for (const a of athletes) {
      const k = groupKey(a, groupBy);
      (buckets[k] ??= []).push(a);
    }
    const groups = Object.keys(buckets).sort();
    // Re-use the existing stats machinery via a quick manual compute
    const groupStats: Record<string, GroupStats> = {};
    for (const g of groups) {
      const { team } = computeAllGroupStats(buckets[g]);
      groupStats[g] = team;
    }
    return { groupStats, groups };
  }, [athletes, groupBy]);

  const data = groups.map(g => ({
    group: g,
    mean:  Number((groupStats[g].mean[selectedMetric] ?? 0).toFixed(3)),
    p25:   Number((groupStats[g].p25[selectedMetric]  ?? 0).toFixed(3)),
    p75:   Number((groupStats[g].p75[selectedMetric]  ?? 0).toFixed(3)),
    n:     athletes.filter(a => groupKey(a, groupBy) === g).length,
  }));

  const teamAvg = teamStats.mean[selectedMetric] ?? 0;

  return (
    <div className="card p-5">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <h3 className="section-title flex-1">Group Comparison</h3>

        {/* Group-by toggle */}
        <div className="flex rounded-lg overflow-hidden border border-white/10 text-xs">
          {GROUP_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setGroupBy(opt.value)}
              className={
                groupBy === opt.value
                  ? "px-3 py-1.5 bg-indigo-600 text-white font-medium"
                  : "px-3 py-1.5 text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              }
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Metric selector */}
        <select
          value={selectedMetric}
          onChange={e => setSelectedMetric(e.target.value)}
          className="text-xs bg-navy-800 border border-white/10 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-indigo-500"
        >
          {METRIC_REGISTRY.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
        </select>
      </div>

      <p className="text-xs text-slate-500 mb-4">
        Mean <strong className="text-slate-300">{meta.label}</strong> by {GROUP_OPTIONS.find(o => o.value === groupBy)?.label.toLowerCase()}.
        Dashed line = overall group average. n shown in table below.
      </p>

      {/* Bar chart */}
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 10, right: 30, bottom: 5, left: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="group" tick={{ fill: "#94a3b8", fontSize: 12 }} />
          <YAxis
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            domain={["auto", "auto"]}
            tickFormatter={(v: number) => fmt(v, "", 2)}
          />
          <ReferenceLine
            y={teamAvg}
            stroke="rgba(255,255,255,0.4)"
            strokeDasharray="6 3"
            label={{ value: `Avg: ${fmt(teamAvg, meta.unit, 2)}`, fill: "#94a3b8", fontSize: 10, position: "right" }}
          />
          <Tooltip
            contentStyle={{ background: "#1e1b4b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px" }}
            formatter={(v: number) => [`${fmt(v, meta.unit, 2)}`, "Mean"]}
          />
          <Bar dataKey="mean" radius={[6, 6, 0, 0]} maxBarSize={70}>
            {data.map((entry, i) => (
              <Cell key={entry.group} fill={getColor(groupBy, entry.group, i)} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Summary table */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/8">
              <th className="text-left py-2 label-sm">{GROUP_OPTIONS.find(o => o.value === groupBy)?.label}</th>
              <th className="text-right py-2 label-sm">n</th>
              <th className="text-right py-2 label-sm">Mean</th>
              <th className="text-right py-2 label-sm">Min</th>
              <th className="text-right py-2 label-sm">Max</th>
              <th className="text-right py-2 label-sm">IQR</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((g, i) => {
              const s = groupStats[g];
              return (
                <tr key={g} className="border-b border-white/5">
                  <td className="py-2 font-medium" style={{ color: getColor(groupBy, g, i) }}>{g}</td>
                  <td className="py-2 text-right text-slate-500">{data[i]?.n}</td>
                  <td className="py-2 text-right text-white font-semibold">{fmt(s.mean[selectedMetric], meta.unit, 2)}</td>
                  <td className="py-2 text-right text-slate-400">{fmt(s.min[selectedMetric], meta.unit, 2)}</td>
                  <td className="py-2 text-right text-slate-400">{fmt(s.max[selectedMetric], meta.unit, 2)}</td>
                  <td className="py-2 text-right text-slate-400">{fmt((s.p75[selectedMetric] ?? 0) - (s.p25[selectedMetric] ?? 0), meta.unit, 2)}</td>
                </tr>
              );
            })}
            <tr className="border-t border-white/15">
              <td className="py-2 font-semibold text-slate-300">All</td>
              <td className="py-2 text-right text-slate-500">{athletes.length}</td>
              <td className="py-2 text-right text-white font-bold">{fmt(teamStats.mean[selectedMetric], meta.unit, 2)}</td>
              <td className="py-2 text-right text-slate-400">{fmt(teamStats.min[selectedMetric], meta.unit, 2)}</td>
              <td className="py-2 text-right text-slate-400">{fmt(teamStats.max[selectedMetric], meta.unit, 2)}</td>
              <td className="py-2 text-right text-slate-400">{fmt((teamStats.p75[selectedMetric] ?? 0) - (teamStats.p25[selectedMetric] ?? 0), meta.unit, 2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
