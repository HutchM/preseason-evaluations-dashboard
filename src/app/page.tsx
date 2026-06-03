"use client";
import { useState, useCallback } from "react";
import type { NavSection } from "@/types/athlete";
import { useAthleteData } from "@/hooks/useAthleteData";
import { Sidebar }         from "@/components/layout/Sidebar";
import { Header }          from "@/components/layout/Header";
import { FileUpload }      from "@/components/upload/FileUpload";
import { OverviewCards }   from "@/components/overview/OverviewCards";
import { TopPerformers }   from "@/components/overview/TopPerformers";
import { FlaggedAthletes } from "@/components/overview/FlaggedAthletes";
import { AthleteReport }   from "@/components/athlete/AthleteReport";
import { Leaderboard }     from "@/components/group/Leaderboard";
import { DistributionChart } from "@/components/group/DistributionChart";
import { GroupComparison } from "@/components/group/GroupComparison";
import { MetricVisualizer } from "@/components/metrics/MetricVisualizer";
import { SummaryFindings } from "@/components/summary/SummaryFindings";

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState<NavSection>("overview");
  const [showUpload, setShowUpload] = useState(false);

  const {
    allProcessed, filteredAthletes, selectedAthlete,
    teamStats, positionStats, teamInsights,
    positions, sessions, sexes, athleteNames, flaggedAthletes, topPerformers,
    filters, updateFilter, loadData, resetToDemo, isDemo, error,
  } = useAthleteData();

  // Navigate to athlete report and pre-select an athlete
  const goToAthlete = useCallback((name: string) => {
    updateFilter("selectedAthlete", name);
    setActiveSection("athlete");
  }, [updateFilter]);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar
        activeSection={activeSection}
        onChange={setActiveSection}
        flagCount={flaggedAthletes.length}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col ml-64 min-h-screen">
        <Header
          activeSection={activeSection}
          positions={positions}
          sessions={sessions}
          sexes={sexes}
          athleteNames={athleteNames}
          filters={filters}
          updateFilter={updateFilter}
          isDemo={isDemo}
          onUploadClick={() => setShowUpload(true)}
          onResetDemo={resetToDemo}
        />

        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* ── Overview ─────────────────────────────────────────────────── */}
          {activeSection === "overview" && (
            <>
              <OverviewCards
                athletes={filteredAthletes}
                teamStats={teamStats}
                flaggedCount={flaggedAthletes.length}
                topPerformer={topPerformers[0]}
              />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <TopPerformers athletes={filteredAthletes} onSelect={goToAthlete} />
                <FlaggedAthletes athletes={flaggedAthletes} onSelect={goToAthlete} />
              </div>
            </>
          )}

          {/* ── Individual Athlete Report ─────────────────────────────────── */}
          {activeSection === "athlete" && (
            selectedAthlete
              ? <AthleteReport athlete={selectedAthlete} teamStats={teamStats} />
              : <EmptyState message="No athletes match the current filters." />
          )}

          {/* ── Group Comparison ─────────────────────────────────────────── */}
          {activeSection === "group" && filteredAthletes.length > 0 && (
            <>
              <Leaderboard athletes={filteredAthletes} onSelectAthlete={goToAthlete} />
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                <DistributionChart athletes={filteredAthletes} teamMean={teamStats.mean} />
                <GroupComparison   athletes={filteredAthletes} teamStats={teamStats} />
              </div>
            </>
          )}

          {/* ── Metrics Explorer ──────────────────────────────────────────── */}
          {activeSection === "metrics" && filteredAthletes.length > 0 && (
            <MetricVisualizer athletes={filteredAthletes} teamStats={teamStats} />
          )}

          {/* ── Summary Findings ──────────────────────────────────────────── */}
          {activeSection === "summary" && (
            <SummaryFindings
              insights={teamInsights}
              athletes={filteredAthletes}
              teamStats={teamStats}
              onSelectAthlete={goToAthlete}
            />
          )}

          {/* Empty state for group/metrics when no athletes */}
          {(activeSection === "group" || activeSection === "metrics") && filteredAthletes.length === 0 && (
            <EmptyState message="No athletes match the current filters." />
          )}
        </main>
      </div>

      {/* Upload modal */}
      {showUpload && (
        <FileUpload
          onData={loadData}
          onClose={() => setShowUpload(false)}
          error={error}
        />
      )}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-64 text-slate-500">
      <div className="text-center">
        <div className="text-4xl mb-3">📊</div>
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );
}
