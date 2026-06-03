"use client";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  Tooltip as RechartTooltip,
} from "recharts";
import { User, Star, AlertTriangle, MessageSquare, TrendingUp } from "lucide-react";
import type { AthleteProcessed, GroupStats } from "@/types/athlete";
import { METRIC_REGISTRY, fmt, trafficLight, ordinal, cn } from "@/lib/utils";
import { MetricCard } from "./MetricCard";
import { generateAthleteNarrative } from "@/lib/insights";

interface AthleteReportProps {
  athlete: AthleteProcessed;
  teamStats: GroupStats;
}

// Position badge color map
const POS_COLORS: Record<string, string> = {
  Forward: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  Midfielder: "bg-sky-500/20 text-sky-400 border-sky-500/30",
  Defender: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  Goalkeeper: "bg-violet-500/20 text-violet-400 border-violet-500/30",
};

export function AthleteReport({ athlete, teamStats }: AthleteReportProps) {
  const narrative = generateAthleteNarrative(athlete);

  // Radar data — use effective percentile (flipped for lower-is-better)
  const radarData = METRIC_REGISTRY.map(m => ({
    metric: m.label.replace(" ", "\n"),
    value:  m.higherIsBetter
      ? (athlete.percentiles[m.key] ?? 50)
      : (100 - (athlete.percentiles[m.key] ?? 50)),
    fullMark: 100,
  }));

  const posColor = POS_COLORS[athlete.position] ?? "bg-slate-500/20 text-slate-400 border-slate-500/30";

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="card p-5">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 text-2xl font-black text-white">
            {athlete.athlete_name.charAt(0)}
          </div>
          {/* Info */}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-white leading-tight">{athlete.athlete_name}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <span className={cn("pill border", posColor)}>{athlete.position}</span>
              <span className="pill bg-white/5 border border-white/10 text-slate-400">
                {athlete.session_date}
              </span>
            </div>
          </div>
          {/* Overall score ring */}
          <div className="flex-shrink-0 text-center">
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="5" />
                <circle
                  cx="32" cy="32" r="26" fill="none"
                  stroke={athlete.overallScore >= 66 ? "#10b981" : athlete.overallScore >= 33 ? "#f59e0b" : "#ef4444"}
                  strokeWidth="5"
                  strokeDasharray={`${(athlete.overallScore / 100) * 163.4} 163.4`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-black text-white">{athlete.overallScore}</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-1">Overall</p>
          </div>
        </div>

        {/* Strengths / weaknesses pills */}
        {(athlete.strengths.length > 0 || athlete.weaknesses.length > 0) && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {athlete.strengths.map(key => {
              const m = METRIC_REGISTRY.find(r => r.key === key);
              return m ? (
                <span key={key} className="pill bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  <Star className="w-3 h-3" /> {m.label}
                </span>
              ) : null;
            })}
            {athlete.weaknesses.map(key => {
              const m = METRIC_REGISTRY.find(r => r.key === key);
              return m ? (
                <span key={key} className="pill bg-red-500/15 border border-red-500/30 text-red-400">
                  <TrendingUp className="w-3 h-3 rotate-180" /> {m.label}
                </span>
              ) : null;
            })}
          </div>
        )}

        {/* Flags */}
        {athlete.flags.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {athlete.flags.map((flag, i) => (
              <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                {flag}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Metrics grid */}
      <div>
        <h3 className="section-title mb-3">Kinematic Metrics</h3>
        <div className="metric-grid">
          {METRIC_REGISTRY.map(meta => {
            const val  = Number(athlete[meta.key]);
            const pct  = athlete.percentiles[meta.key] ?? 50;
            const avg  = teamStats.mean[meta.key] ?? 0;
            if (isNaN(val)) return null;
            return (
              <MetricCard
                key={meta.key}
                meta={meta}
                value={val}
                percentile={pct}
                teamAvg={avg}
              />
            );
          })}
        </div>
      </div>

      {/* Radar + Narrative */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Radar chart */}
        <div className="card p-5">
          <h3 className="section-title mb-4">Performance Profile</h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis
                dataKey="metric"
                tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 500 }}
              />
              <Radar
                name={athlete.athlete_name}
                dataKey="value"
                stroke="#6366f1"
                fill="#6366f1"
                fillOpacity={0.25}
                strokeWidth={2}
              />
              <RechartTooltip
                contentStyle={{ background: "#1e1b4b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "12px" }}
                formatter={(v: number) => [`${v}th percentile`, ""]}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Narrative */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            <h3 className="section-title">Practitioner Summary</h3>
          </div>
          <div className="space-y-3">
            {narrative.map((line, i) => (
              <p key={i} className="text-sm text-slate-300 leading-relaxed">
                {line}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
