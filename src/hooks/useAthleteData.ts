"use client";
import { useState, useMemo, useCallback } from "react";
import type { AthleteRaw, AthleteProcessed, Filters } from "@/types/athlete";
import { DEMO_ATHLETES } from "@/data/demo-data";
import { processAthletes, computeAllGroupStats, coerceRow } from "@/lib/data-processing";
import { generateTeamInsights } from "@/lib/insights";

export function useAthleteData() {
  const [rawAthletes, setRawAthletes] = useState<AthleteRaw[]>(DEMO_ATHLETES);
  const [isDemo, setIsDemo] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<Filters>({
    selectedAthlete:  null,
    selectedPosition: null,
    selectedSession:  null,
    selectedMetric:   null,
  });

  // Process all athletes
  const allProcessed = useMemo(() => processAthletes(rawAthletes), [rawAthletes]);

  // Apply filters (position & session only for group views; athlete for individual)
  const filteredAthletes = useMemo<AthleteProcessed[]>(() => {
    return allProcessed.filter(a => {
      if (filters.selectedPosition && a.position !== filters.selectedPosition) return false;
      if (filters.selectedSession  && a.session_date !== filters.selectedSession)  return false;
      return true;
    });
  }, [allProcessed, filters.selectedPosition, filters.selectedSession]);

  // Selected athlete for individual report
  const selectedAthlete = useMemo<AthleteProcessed | null>(() => {
    if (!filters.selectedAthlete) return filteredAthletes[0] ?? null;
    return filteredAthletes.find(a => a.athlete_name === filters.selectedAthlete) ?? filteredAthletes[0] ?? null;
  }, [filteredAthletes, filters.selectedAthlete]);

  // Group statistics
  const { team: teamStats, byPosition: positionStats } = useMemo(
    () => computeAllGroupStats(filteredAthletes),
    [filteredAthletes]
  );

  // Team-level insights
  const teamInsights = useMemo(
    () => generateTeamInsights(filteredAthletes, teamStats),
    [filteredAthletes, teamStats]
  );

  // Derived lists
  const positions   = useMemo(() => [...new Set(allProcessed.map(a => a.position))].sort(), [allProcessed]);
  const sessions    = useMemo(() => [...new Set(allProcessed.map(a => a.session_date))].sort(), [allProcessed]);
  const athleteNames = useMemo(() => filteredAthletes.map(a => a.athlete_name), [filteredAthletes]);
  const flaggedAthletes = useMemo(() => filteredAthletes.filter(a => a.flags.length > 0), [filteredAthletes]);
  const topPerformers   = useMemo(
    () => [...filteredAthletes].sort((a, b) => b.overallScore - a.overallScore).slice(0, 5),
    [filteredAthletes]
  );

  // Upload handler
  const loadData = useCallback((rows: Record<string, string>[]) => {
    try {
      if (!rows.length) { setError("File appears to be empty."); return; }
      const coerced = rows.map(coerceRow);
      setRawAthletes(coerced);
      setIsDemo(false);
      setError(null);
      // Reset filters on new data
      setFilters({ selectedAthlete: null, selectedPosition: null, selectedSession: null, selectedMetric: null });
    } catch (e) {
      setError(`Could not parse file: ${e instanceof Error ? e.message : "Unknown error"}`);
    }
  }, []);

  const resetToDemo = useCallback(() => {
    setRawAthletes(DEMO_ATHLETES);
    setIsDemo(true);
    setError(null);
    setFilters({ selectedAthlete: null, selectedPosition: null, selectedSession: null, selectedMetric: null });
  }, []);

  const updateFilter = useCallback(<K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  return {
    allProcessed,
    filteredAthletes,
    selectedAthlete,
    teamStats,
    positionStats,
    teamInsights,
    positions,
    sessions,
    athleteNames,
    flaggedAthletes,
    topPerformers,
    filters,
    updateFilter,
    loadData,
    resetToDemo,
    isDemo,
    error,
  };
}
