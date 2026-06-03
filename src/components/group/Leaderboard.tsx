"use client";
import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import type { AthleteProcessed } from "@/types/athlete";
import { METRIC_REGISTRY, fmt, trafficLight, cn } from "@/lib/utils";

interface LeaderboardProps {
  athletes: AthleteProcessed[];
  onSelectAthlete: (name: string) => void;
}

export function Leaderboard({ athletes, onSelectAthlete }: LeaderboardProps) {
  const [sortKey, setSortKey] = useState("overallScore");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const columns = [
    { key: "overallScore",            label: "Score" },
    { key: "cmj_jump_height_m",       label: "CMJ Ht" },
    { key: "cmj_takeoff_velocity_ms", label: "TOV" },
    { key: "ddj_rsi_final",           label: "RSI" },
    { key: "ddj_jump_height_m",       label: "DDJ Ht" },
    { key: "ddj_gct_s",               label: "GCT" },
    { key: "ddj_rsi_asymmetry",       label: "Asym%" },
  ];

  const sorted = [...athletes].sort((a, b) => {
    const av = Number(a[sortKey as keyof AthleteProcessed] ?? 0);
    const bv = Number(b[sortKey as keyof AthleteProcessed] ?? 0);
    return sortDir === "desc" ? bv - av : av - bv;
  });

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === "desc" ? "asc" : "desc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const posColors: Record<string, string> = {
    Basketball: "text-orange-400", Volleyball: "text-sky-400", Hockey: "text-emerald-400",
  };

  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-4 border-b border-white/8">
        <h3 className="section-title">Squad Leaderboard</h3>
        <p className="text-xs text-slate-500 mt-0.5">Click any column header to sort. Click an athlete row to view their report.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="border-b border-white/8">
              <th className="text-left px-5 py-3 label-sm w-8">#</th>
              <th className="text-left px-3 py-3 label-sm">Athlete</th>
              <th className="text-left px-3 py-3 label-sm">Position</th>
              {columns.map(col => (
                <th
                  key={col.key}
                  className="px-3 py-3 label-sm text-right cursor-pointer hover:text-white transition-colors select-none"
                  onClick={() => toggleSort(col.key)}
                >
                  <span className="flex items-center justify-end gap-1">
                    {col.label}
                    {sortKey === col.key
                      ? sortDir === "desc" ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />
                      : <span className="w-3 h-3" />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((athlete, i) => (
              <tr
                key={athlete.id}
                className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors group"
                onClick={() => onSelectAthlete(athlete.athlete_name)}
              >
                <td className="px-5 py-3 text-slate-500 font-mono text-xs">{i + 1}</td>
                <td className="px-3 py-3 font-semibold text-white group-hover:text-indigo-300 transition-colors">
                  {athlete.athlete_name}
                </td>
                <td className={cn("px-3 py-3 text-xs font-medium", posColors[athlete.position] ?? "text-slate-400")}>
                  {athlete.position}
                </td>
                {columns.map(col => {
                  const val = Number(athlete[col.key as keyof AthleteProcessed] ?? 0);
                  const pct = col.key === "overallScore" ? val : (athlete.percentiles[col.key] ?? 50);
                  const meta = METRIC_REGISTRY.find(m => m.key === col.key);
                  const hib  = meta ? meta.higherIsBetter : true;
                  return (
                    <td key={col.key} className={cn("px-3 py-3 text-right font-semibold", trafficLight(pct, hib))}>
                      {col.key === "overallScore" ? val : fmt(val, meta?.unit ?? "", 1)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
