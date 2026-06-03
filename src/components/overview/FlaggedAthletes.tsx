"use client";
import { AlertTriangle } from "lucide-react";
import type { AthleteProcessed } from "@/types/athlete";

interface FlaggedAthletesProps {
  athletes: AthleteProcessed[];
  onSelect: (name: string) => void;
}

export function FlaggedAthletes({ athletes, onSelect }: FlaggedAthletesProps) {
  if (!athletes.length) {
    return (
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-slate-500" />
          <h3 className="section-title">Flagged Athletes</h3>
        </div>
        <p className="text-sm text-slate-500 text-center py-6">No athletes flagged for follow-up.</p>
      </div>
    );
  }

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-4 h-4 text-red-400" />
        <h3 className="section-title">Flagged for Follow-up</h3>
        <span className="pill bg-red-500/20 border border-red-500/30 text-red-400 ml-auto">
          {athletes.length}
        </span>
      </div>
      <div className="space-y-3">
        {athletes.map(athlete => (
          <button
            key={athlete.id}
            onClick={() => onSelect(athlete.athlete_name)}
            className="w-full text-left p-3 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/15 transition-colors group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-sm font-semibold text-white group-hover:text-red-300 transition-colors">{athlete.athlete_name}</p>
              <span className="text-xs text-slate-500">{athlete.position}</span>
            </div>
            <ul className="space-y-0.5">
              {athlete.flags.map((flag, i) => (
                <li key={i} className="text-xs text-red-400/90 leading-relaxed">• {flag}</li>
              ))}
            </ul>
          </button>
        ))}
      </div>
    </div>
  );
}
