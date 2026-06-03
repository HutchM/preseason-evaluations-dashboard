"use client";
import { Medal } from "lucide-react";
import type { AthleteProcessed } from "@/types/athlete";

interface TopPerformersProps {
  athletes: AthleteProcessed[];
  onSelect: (name: string) => void;
}

const MEDALS = ["🥇", "🥈", "🥉"];

export function TopPerformers({ athletes, onSelect }: TopPerformersProps) {
  const top = [...athletes].sort((a, b) => b.overallScore - a.overallScore).slice(0, 5);

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Medal className="w-4 h-4 text-amber-400" />
        <h3 className="section-title">Top Performers</h3>
      </div>
      <div className="space-y-2">
        {top.map((athlete, i) => (
          <button
            key={athlete.id}
            onClick={() => onSelect(athlete.athlete_name)}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-left group"
          >
            <span className="text-lg w-7 text-center flex-shrink-0">{MEDALS[i] ?? `#${i + 1}`}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">
                {athlete.athlete_name}
              </p>
              <p className="text-xs text-slate-500">{athlete.position}</p>
            </div>
            {/* Score bar */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-20 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                  style={{ width: `${athlete.overallScore}%` }}
                />
              </div>
              <span className="text-xs font-bold text-white w-8 text-right">{athlete.overallScore}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
