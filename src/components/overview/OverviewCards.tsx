"use client";
import { Users, ClipboardCheck, TrendingUp, AlertTriangle, Award } from "lucide-react";
import type { AthleteProcessed, GroupStats } from "@/types/athlete";
import { fmt } from "@/lib/utils";

interface OverviewCardsProps {
  athletes: AthleteProcessed[];
  teamStats: GroupStats;
  flaggedCount: number;
  topPerformer: AthleteProcessed | undefined;
}

export function OverviewCards({ athletes, teamStats, flaggedCount, topPerformer }: OverviewCardsProps) {
  const sessions = [...new Set(athletes.map(a => a.session_date))];

  const cards = [
    {
      icon: Users,
      color: "text-indigo-400",
      bg:    "bg-indigo-500/15",
      label: "Athletes Tested",
      value: athletes.length.toString(),
      sub:   `${sessions.length} session${sessions.length !== 1 ? "s" : ""}`,
    },
    {
      icon: ClipboardCheck,
      color: "text-sky-400",
      bg:    "bg-sky-500/15",
      label: "Tests Completed",
      value: (athletes.length * 10).toString(),
      sub:   "10 metrics per athlete",
    },
    {
      icon: TrendingUp,
      color: "text-emerald-400",
      bg:    "bg-emerald-500/15",
      label: "Avg CMJ Height",
      value: fmt(teamStats.mean["cmj_jump_height_m"], "m"),
      sub:   `Range: ${fmt(teamStats.min["cmj_jump_height_m"], "m")}–${fmt(teamStats.max["cmj_jump_height_m"], "m")}`,
    },
    {
      icon: Award,
      color: "text-violet-400",
      bg:    "bg-violet-500/15",
      label: "Top Performer",
      value: topPerformer?.athlete_name ?? "—",
      sub:   topPerformer ? `Score ${topPerformer.overallScore}/100` : "",
    },
    {
      icon: AlertTriangle,
      color: flaggedCount > 0 ? "text-red-400" : "text-slate-500",
      bg:    flaggedCount > 0 ? "bg-red-500/15" : "bg-white/5",
      label: "Flagged Athletes",
      value: flaggedCount.toString(),
      sub:   flaggedCount > 0 ? "Review recommended" : "None flagged",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map(({ icon: Icon, color, bg, label, value, sub }) => (
        <div key={label} className="card p-4 flex flex-col gap-3">
          <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
            <Icon className={`w-4.5 h-4.5 ${color}`} style={{ width: "1.125rem", height: "1.125rem" }} />
          </div>
          <div>
            <p className="label-sm">{label}</p>
            <p className="text-xl font-bold text-white leading-tight mt-0.5 truncate">{value}</p>
            <p className="text-xs text-slate-500 mt-0.5 leading-tight">{sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
