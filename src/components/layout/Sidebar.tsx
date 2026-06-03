"use client";
import { Activity, Users, BarChart2, Zap, FileText, ChevronRight } from "lucide-react";
import type { NavSection } from "@/types/athlete";
import { cn } from "@/lib/utils";

const NAV_ITEMS: { id: NavSection; label: string; icon: React.ElementType; description: string }[] = [
  { id: "overview",  label: "Overview",         icon: Activity,  description: "Team snapshot" },
  { id: "athlete",   label: "Athlete Report",   icon: Users,     description: "Individual profile" },
  { id: "group",     label: "Group Comparison", icon: BarChart2, description: "Leaderboards & distributions" },
  { id: "metrics",   label: "Metrics Explorer", icon: Zap,       description: "Visualise any metric" },
  { id: "summary",   label: "Summary Findings", icon: FileText,  description: "AI-generated insights" },
];

interface SidebarProps {
  activeSection: NavSection;
  onChange: (section: NavSection) => void;
  flagCount: number;
}

export function Sidebar({ activeSection, onChange, flagCount }: SidebarProps) {
  return (
    <aside className="fixed inset-y-0 left-0 w-64 flex flex-col bg-sidebar-gradient border-r border-white/8 z-30">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/8">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0">
          <Activity className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-white leading-tight">Preseason</p>
          <p className="text-xs text-slate-400 leading-tight">Evaluations</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ id, label, icon: Icon, description }) => {
          const active = activeSection === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 group",
                active
                  ? "bg-indigo-600/30 border border-indigo-500/40 text-white"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent"
              )}
            >
              <Icon className={cn("w-4 h-4 flex-shrink-0", active ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300")} />
              <div className="flex-1 min-w-0">
                <div className={cn("text-sm font-medium leading-tight", active ? "text-white" : "")}>{label}</div>
                <div className="text-xs text-slate-500 leading-tight truncate">{description}</div>
              </div>
              {id === "overview" && flagCount > 0 && (
                <span className="flex-shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-xs flex items-center justify-center font-semibold">
                  {flagCount}
                </span>
              )}
              {active && <ChevronRight className="w-3 h-3 text-indigo-400 flex-shrink-0" />}
            </button>
          );
        })}
      </nav>

      {/* Footer badge */}
      <div className="px-4 py-4 border-t border-white/8">
        <div className="rounded-xl bg-white/5 border border-white/8 p-3">
          <p className="text-xs text-slate-400 leading-relaxed">
            Upload a CSV or Excel file to analyse your squad data. Demo data is shown by default.
          </p>
        </div>
      </div>
    </aside>
  );
}
