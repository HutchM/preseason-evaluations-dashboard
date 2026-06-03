"use client";
import { TrendingUp, AlertTriangle, Users, Zap, Info, ChevronRight } from "lucide-react";
import type { TeamInsight, AthleteProcessed, GroupStats } from "@/types/athlete";
import { METRIC_REGISTRY, fmt, cn } from "@/lib/utils";
import { mean } from "@/lib/data-processing";

const ICON_MAP = {
  top:    { icon: TrendingUp,    color: "text-indigo-400",  bg: "bg-indigo-500/15 border-indigo-500/20" },
  flag:   { icon: AlertTriangle, color: "text-red-400",     bg: "bg-red-500/15 border-red-500/20" },
  group:  { icon: Users,         color: "text-sky-400",     bg: "bg-sky-500/15 border-sky-500/20" },
  metric: { icon: Zap,           color: "text-amber-400",   bg: "bg-amber-500/15 border-amber-500/20" },
  info:   { icon: Info,          color: "text-slate-400",   bg: "bg-white/5 border-white/10" },
};

interface SummaryFindingsProps {
  insights: TeamInsight[];
  athletes: AthleteProcessed[];
  teamStats: GroupStats;
  onSelectAthlete: (name: string) => void;
}

export function SummaryFindings({ insights, athletes, teamStats, onSelectAthlete }: SummaryFindingsProps) {
  const positions = [...new Set(athletes.map(a => a.position))];

  return (
    <div className="space-y-6">
      {/* Insight cards */}
      <div>
        <h3 className="section-title mb-3">Auto-Generated Insights</h3>
        <p className="text-sm text-slate-500 mb-4">
          These findings are generated automatically from the data. They are intended to support — not replace — practitioner judgement.
        </p>
        <div className="space-y-3">
          {insights.map((insight, i) => {
            const { icon: Icon, color, bg } = ICON_MAP[insight.type];
            return (
              <div key={i} className={cn("flex items-start gap-3 p-4 rounded-xl border", bg)}>
                <Icon className={cn("w-4.5 h-4.5 flex-shrink-0 mt-0.5", color)} style={{ width: "1.125rem", height: "1.125rem" }} />
                <p className="text-sm text-slate-300 leading-relaxed">{insight.text}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Per-athlete findings summary table */}
      <div>
        <h3 className="section-title mb-3">Athlete Snapshot Table</h3>
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="text-left px-5 py-3 label-sm">Athlete</th>
                  <th className="text-left px-3 py-3 label-sm">Position</th>
                  <th className="text-right px-3 py-3 label-sm">Score</th>
                  <th className="text-left px-3 py-3 label-sm">Strengths</th>
                  <th className="text-left px-3 py-3 label-sm">Development Areas</th>
                  <th className="text-left px-3 py-3 label-sm">Flags</th>
                </tr>
              </thead>
              <tbody>
                {[...athletes].sort((a, b) => b.overallScore - a.overallScore).map(athlete => (
                  <tr
                    key={athlete.id}
                    className="border-b border-white/5 hover:bg-white/5 cursor-pointer group"
                    onClick={() => onSelectAthlete(athlete.athlete_name)}
                  >
                    <td className="px-5 py-3">
                      <span className="font-semibold text-white group-hover:text-indigo-300 transition-colors flex items-center gap-1">
                        {athlete.athlete_name}
                        <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-400">{athlete.position}</td>
                    <td className="px-3 py-3 text-right">
                      <span className={cn(
                        "font-bold",
                        athlete.overallScore >= 66 ? "text-emerald-400" :
                        athlete.overallScore >= 33 ? "text-amber-400" : "text-red-400"
                      )}>
                        {athlete.overallScore}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs text-emerald-400">
                      {athlete.strengths.map(k => METRIC_REGISTRY.find(m => m.key === k)?.label).filter(Boolean).join(", ") || "—"}
                    </td>
                    <td className="px-3 py-3 text-xs text-amber-400">
                      {athlete.weaknesses.map(k => METRIC_REGISTRY.find(m => m.key === k)?.label).filter(Boolean).join(", ") || "—"}
                    </td>
                    <td className="px-3 py-3 text-xs text-red-400">
                      {athlete.flags.length > 0 ? `${athlete.flags.length} flag${athlete.flags.length > 1 ? "s" : ""}` : <span className="text-slate-600">None</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Methodology note */}
      <div className="card p-5 bg-white/3">
        <h3 className="text-sm font-semibold text-slate-300 mb-2">Methodology Notes</h3>
        <ul className="space-y-1.5 text-xs text-slate-500 leading-relaxed">
          <li>• Overall score is a composite of effective percentile ranks across all 10 metrics (adjusted for direction).</li>
          <li>• Strengths = metrics in the 75th percentile or above relative to the current filtered group.</li>
          <li>• Development areas = metrics in the 25th percentile or below.</li>
          <li>• Athletes with asymmetry &gt;10% or overall score &lt;30 are automatically flagged for follow-up.</li>
          <li>• Percentile ranks update dynamically when position or session filters are applied.</li>
          <li>• All statistics use the filtered athlete group as the reference population.</li>
        </ul>
      </div>
    </div>
  );
}
