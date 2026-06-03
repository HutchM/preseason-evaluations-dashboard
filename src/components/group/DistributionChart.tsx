"use client";
import { useState } from "react";
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Cell,
} from "recharts";
import type { AthleteProcessed } from "@/types/athlete";
import { METRIC_REGISTRY, fmt } from "@/lib/utils";

interface DistributionChartProps {
  athletes: AthleteProcessed[];
  teamMean: Record<string, number>;
}

const POS_COLORS: Record<string, string> = {
  Basketball: "#f97316", Volleyball: "#38bdf8", Hockey: "#34d399",
};

interface CustomDotProps {
  cx?: number;
  cy?: number;
  payload?: AthleteProcessed;
  color?: string;
}

const CustomDot = ({ cx = 0, cy = 0, payload, color = "#6366f1" }: CustomDotProps) => (
  <g>
    <circle cx={cx} cy={cy} r={5} fill={color} fillOpacity={0.85} stroke="white" strokeWidth={0.5} />
    <text x={cx} y={cy - 10} textAnchor="middle" fill="white" fontSize={9} opacity={0.7}>
      {payload?.athlete_name?.split(" ")[1] ?? ""}
    </text>
  </g>
);

export function DistributionChart({ athletes, teamMean }: DistributionChartProps) {
  const [xMetric, setXMetric] = useState("cmj_jump_height_m");
  const [yMetric, setYMetric] = useState("ddj_rsi_final");

  const xMeta = METRIC_REGISTRY.find(m => m.key === xMetric)!;
  const yMeta = METRIC_REGISTRY.find(m => m.key === yMetric)!;

  const data = athletes.map(a => ({
    ...a,
    x: Number(a[xMetric]),
    y: Number(a[yMetric]),
  }));

  const avgX = teamMean[xMetric] ?? 0;
  const avgY = teamMean[yMetric] ?? 0;

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <h3 className="section-title flex-1">Scatter Distribution</h3>
        <div className="flex items-center gap-2 text-xs">
          <label className="text-slate-500">X:</label>
          <select
            value={xMetric}
            onChange={e => setXMetric(e.target.value)}
            className="bg-navy-800 border border-white/10 rounded-lg px-2 py-1 text-slate-300 focus:outline-none"
          >
            {METRIC_REGISTRY.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
          </select>
          <label className="text-slate-500">Y:</label>
          <select
            value={yMetric}
            onChange={e => setYMetric(e.target.value)}
            className="bg-navy-800 border border-white/10 rounded-lg px-2 py-1 text-slate-300 focus:outline-none"
          >
            {METRIC_REGISTRY.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
          </select>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-3">
        {Object.entries(POS_COLORS).map(([pos, col]) => (
          <div key={pos} className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: col }} />
            {pos}
          </div>
        ))}
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="w-4 border-t border-dashed border-white/40" />
          Team avg
        </div>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="x" type="number" domain={["auto", "auto"]} name={xMeta.label}
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            label={{ value: `${xMeta.label} (${xMeta.unit})`, position: "insideBottom", offset: -10, fill: "#64748b", fontSize: 11 }}
          />
          <YAxis
            dataKey="y" type="number" domain={["auto", "auto"]} name={yMeta.label}
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            label={{ value: `${yMeta.label} (${yMeta.unit})`, angle: -90, position: "insideLeft", offset: 15, fill: "#64748b", fontSize: 11 }}
          />
          <ReferenceLine x={avgX} stroke="rgba(255,255,255,0.3)" strokeDasharray="4 4" />
          <ReferenceLine y={avgY} stroke="rgba(255,255,255,0.3)" strokeDasharray="4 4" />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            contentStyle={{ background: "#1e1b4b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px" }}
            content={({ payload }) => {
              if (!payload?.length) return null;
              const d = payload[0].payload as AthleteProcessed & { x: number; y: number };
              return (
                <div className="p-2 space-y-1">
                  <p className="font-bold text-white text-sm">{d.athlete_name}</p>
                  <p className="text-slate-400 text-xs">{d.position}</p>
                  <p className="text-slate-300 text-xs">{xMeta.label}: <strong>{fmt(d.x, xMeta.unit)}</strong></p>
                  <p className="text-slate-300 text-xs">{yMeta.label}: <strong>{fmt(d.y, yMeta.unit)}</strong></p>
                </div>
              );
            }}
          />
          <Scatter data={data} shape={(props: CustomDotProps) => (
            <CustomDot {...props} color={POS_COLORS[(props.payload as AthleteProcessed)?.position] ?? "#6366f1"} />
          )} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
