"use client";
import { Filter, Upload, RefreshCw, Calendar } from "lucide-react";
import type { NavSection, Filters } from "@/types/athlete";

const SECTION_TITLES: Record<NavSection, { title: string; subtitle: string }> = {
  overview: { title: "Team Overview",         subtitle: "Snapshot of squad performance" },
  athlete:  { title: "Athlete Report",        subtitle: "Individual evaluation profile" },
  group:    { title: "Group Comparison",      subtitle: "Leaderboards and distributions" },
  metrics:  { title: "Metrics Explorer",      subtitle: "Visualise any kinematic variable" },
  summary:  { title: "Summary Findings",      subtitle: "Auto-generated practitioner insights" },
};

interface HeaderProps {
  activeSection: NavSection;
  positions:     string[];
  sessions:      string[];
  sexes:         string[];
  athleteNames:  string[];
  filters:       Filters;
  updateFilter:  <K extends keyof Filters>(key: K, val: Filters[K]) => void;
  isDemo:        boolean;
  onUploadClick: () => void;
  onResetDemo:   () => void;
}

export function Header({
  activeSection, positions, sessions, sexes, athleteNames, filters,
  updateFilter, isDemo, onUploadClick, onResetDemo,
}: HeaderProps) {
  const { title, subtitle } = SECTION_TITLES[activeSection];

  const selClass = "text-xs bg-navy-800 border border-white/10 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-indigo-500";

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 px-6 py-3.5 bg-navy-950/90 backdrop-blur border-b border-white/8">
      <div className="min-w-0">
        <h1 className="text-base font-bold text-white leading-tight truncate">{title}</h1>
        <p className="text-xs text-slate-500 leading-tight">{subtitle}</p>
      </div>

      <div className="flex items-center gap-2 flex-wrap justify-end">
        <Filter className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />

        {/* Sport filter */}
        <select value={filters.selectedPosition ?? ""} onChange={e => updateFilter("selectedPosition", e.target.value || null)} className={selClass}>
          <option value="">All Sports</option>
          {positions.map(p => <option key={p} value={p}>{p}</option>)}
        </select>

        {/* Sex filter */}
        {sexes.length > 1 && (
          <select value={filters.selectedSex ?? ""} onChange={e => updateFilter("selectedSex", e.target.value || null)} className={selClass}>
            <option value="">All Sexes</option>
            {sexes.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        )}

        {/* Cohort/year filter */}
        {sessions.filter(Boolean).length > 1 && (
          <select value={filters.selectedSession ?? ""} onChange={e => updateFilter("selectedSession", e.target.value || null)} className={selClass}>
            <option value="">All Cohorts</option>
            {sessions.filter(Boolean).map(s => <option key={s} value={s}>Year {s}</option>)}
          </select>
        )}

        {/* Athlete picker (individual report only) */}
        {activeSection === "athlete" && (
          <select value={filters.selectedAthlete ?? ""} onChange={e => updateFilter("selectedAthlete", e.target.value || null)} className={selClass}>
            {athleteNames.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        )}

        <div className="w-px h-5 bg-white/10 mx-1" />

        <button onClick={onUploadClick} className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors">
          <Upload className="w-3.5 h-3.5" /> Upload Data
        </button>

        {!isDemo && (
          <button onClick={onResetDemo} className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Demo
          </button>
        )}

        {isDemo && (
          <span className="pill bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <Calendar className="w-3 h-3" /> Demo Data
          </span>
        )}
      </div>
    </header>
  );
}
