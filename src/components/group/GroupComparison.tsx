"use client";
import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine, Legend,
} from "recharts";
import type { GroupStats } from "@/types/athlete";
import { METRIC_REGISTRY, fmt } from "@/lib/utils";

interface GroupComparisonProps {
  positionStats: Record<string, GroupStats>;
  teamStats: GroupStats;
}

const POS_COLORS: Record<string, string> = {
  Forward: "#f97316", Midfielder: "#38bdf8",
  Defender: "#34d399", Goalkeeper: "#a78bfa",
};

export function GroupComparison({ positionStats, teamStats }: GroupComparisonProps) {
  const [selectedMetric, setSelectedMetric] = useState("jump_height_cm");
  const meta = METRIC_REGISTRY.find(m => m.key === selectedMetric)!;
  const positions = Object.keys(positionStats);

  const data = positions.map(pos => ({
    position: pos,
    mean:     Number((positionStats[pos].mean[selectedMetric] ?? 0).toFixed(2)),
    p25:      Number((positionStats[pos].p25[selectedMetric]  ?? 0).toFixed(2)),
    p75:      Number((positionStats[pos].p75[selectedMetric]  ?? 0).toFixed(2)),
  }));

  const teamAvg = teamStats.mean[selectedMetric] ?? 0;

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <h3 className="section-title flex-1">Position Group Comparison</h3>
        <select
          value={selectedMetric}
          onChange={e => setSelectedMetric(e.target.value)}
          className="text-xs bg-navy-800 border border-white/10 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none"
        >
          {METRIC_REGISTRY.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
        </select>
      </div>

      <p className="text-xs text-slate-500 mb-4">
        Mean {meta.label} per position group vs. team average (dashed line). Bars represent group mean; error whiskers show IQR.
      </p>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="position" tick={{ fill: "#94a3b8", fontSize: 12 }} />
          <YAxis
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            domain={["auto", "auto"]}
            tickFormatter={(v: number) => fmt(v, "", 1)}
          />
          <ReferenceLine
            y={teamAvg}
            stroke="rgba(255,255,255,0.4)"
            strokeDasharray="6 3"
            label={{ value: `Team avg: ${fmt(teamAvg, meta.unit)}`, fill: "#94a3b8", fontSize: 10, position: "right" }}
          />
          <Tooltip
            contentStyle={{ background: "#1e1b4b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px" }}
            formatter={(v: number, name: string) => [
              `${fmt(v, meta.unit)}`,
              name === "mean" ? "Group Mean" : name === "p25" ? "25th percentile" : "75th percentile",
            ]}
          />
          <Bar dataKey="mean" radius={[6, 6, 0, 0]} maxBarSize={60}>
            {data.map(entry => (
              <Cell key={entry.position} fill={POS_COLORS[entry.position] ?? "#6366f1"} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Summary table */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/8">
              <th className="text-left py-2 label-sm">Position</th>
              <th className="text-right py-2 label-sm">Mean</th>
              <th className="text-right py-2 label-sm">Min</th>
              <th className="text-right py-2 label-sm">Max</th>
              <th className="text-right py-2 label-sm">IQR</th>
            </tr>
          </thead>
          <tbody>
            {positions.map(pos => {
              const s = positionStats[pos];
              return (
                <tr key={pos} className="border-b border-white/5">
                  <td className="py-2 font-medium" style={{ color: POS_COLORS[pos] ?? "#94a3b8" }}>{pos}</td>
                  <td className="py-2 text-right text-white font-semibold">{fmt(s.mean[selectedMetric], meta.unit)}</td>
                  <td className="py-2 text-right text-slate-400">{fmt(s.min[selectedMetric], meta.unit)}</td>
                  <td className="py-2 text-right text-slate-400">{fmt(s.max[selectedMetric], meta.unit)}</td>
                  <td className="py-2 text-right text-slate-400">{fmt((s.p75[selectedMetric] ?? 0) - (s.p25[selectedMetric] ?? 0), meta.unit)}</td>
                </tr>
              );
            })}
            <tr className="border-t border-white/15">
              <td className="py-2 font-semibold text-slate-300">Team</td>
              <td className="py-2 text-right text-white font-bold">{fmt(teamStats.mean[selectedMetric], meta.unit)}</td>
              <td className="py-2 text-right text-slate-400">{fmt(teamStats.min[selectedMetric], meta.unit)}</td>
              <td className="py-2 text-right text-slate-400">{fmt(teamStats.max[selectedMetric], meta.unit)}</td>
              <td className="py-2 text-right text-slate-400">{fmt((teamStats.p75[selectedMetric] ?? 0) - (teamStats.p25[selectedMetric] ?? 0), meta.unit)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
