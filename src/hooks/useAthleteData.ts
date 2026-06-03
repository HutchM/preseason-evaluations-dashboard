"use client";
import { useState, useMemo, useCallback } from "react";
import type { AthleteRaw, AthleteProcessed, Filters } from "@/types/athlete";
import { DEMO_ATHLETES } from "@/data/demo-data";
import {
  processAthletes, computeAllGroupStats,
  isLongFormat, parseLongFormat,
} from "@/lib/data-processing";
import { generateTeamInsights } from "@/lib/insights";

export function useAthleteData() {
  const [rawAthletes, setRawAthletes] = useState<AthleteRaw[]>(DEMO_ATHLETES);
  const [isDemo,      setIsDemo]      = useState(true);
  const [error,       setError]       = useState<string | null>(null);

  const [filters, setFilters] = useState<Filters>({
    selectedAthlete:  null,
    selectedPosition: null,
    selectedSession:  null,
    selectedSex:      null,
    selectedMetric:   null,
  });

  const allProcessed = useMemo(() => processAthletes(rawAthletes), [rawAthletes]);

  const filteredAthletes = useMemo<AthleteProcessed[]>(() => {
    return allProcessed.filter(a => {
      if (filters.selectedPosition && a.position !== filters.selectedPosition) return false;
      if (filters.selectedSession  && a.session_date !== filters.selectedSession)  return false;
      if (filters.selectedSex      && a.sex !== filters.selectedSex)               return false;
      return true;
    });
  }, [allProcessed, filters.selectedPosition, filters.selectedSession, filters.selectedSex]);

  const selectedAthlete = useMemo<AthleteProcessed | null>(() => {
    if (!filters.selectedAthlete) return filteredAthletes[0] ?? null;
    return filteredAthletes.find(a => a.athlete_name === filters.selectedAthlete)
      ?? filteredAthletes[0]
      ?? null;
  }, [filteredAthletes, filters.selectedAthlete]);

  const { team: teamStats, byPosition: positionStats } = useMemo(
    () => computeAllGroupStats(filteredAthletes),
    [filteredAthletes]
  );

  const teamInsights = useMemo(
    () => generateTeamInsights(filteredAthletes, teamStats),
    [filteredAthletes, teamStats]
  );

  const positions     = useMemo(() => [...new Set(allProcessed.map(a => a.position))].sort(), [allProcessed]);
  const sessions      = useMemo(() => [...new Set(allProcessed.map(a => a.session_date))].sort(), [allProcessed]);
  const sexes         = useMemo(() => [...new Set(allProcessed.map(a => a.sex).filter(Boolean))].sort(), [allProcessed]);
  const athleteNames  = useMemo(() => filteredAthletes.map(a => a.athlete_name), [filteredAthletes]);
  const flaggedAthletes = useMemo(() => filteredAthletes.filter(a => a.flags.length > 0), [filteredAthletes]);
  const topPerformers   = useMemo(
    () => [...filteredAthletes].sort((a, b) => b.overallScore - a.overallScore).slice(0, 5),
    [filteredAthletes]
  );

  const loadData = useCallback((rows: Record<string, string>[]) => {
    try {
      if (!rows.length) { setError("File appears to be empty."); return; }
      let athletes: AthleteRaw[];
      if (isLongFormat(rows)) {
        athletes = parseLongFormat(rows);
        if (!athletes.length) {
          setError("No valid rows found. Check that include_for_modeling_strict is TRUE for at least some rows.");
          return;
        }
      } else {
        // Assume wide format — coerce numeric columns
        athletes = rows.map(row => {
          const out: Record<string, string | number> = {};
          for (const [k, v] of Object.entries(row)) {
            const key = k.trim();
            const n = parseFloat(String(v).replace(/[^0-9.\-]/g, ""));
            out[key] = isNaN(n) ? String(v).trim() : n;
          }
          if (!out.athlete_name) out.athlete_name = "Unknown";
          if (!out.position)     out.position     = "Unknown";
          if (!out.session_date) out.session_date  = "";
          if (!out.sex)          out.sex           = "";
          return out as unknown as AthleteRaw;
        });
      }
      setRawAthletes(athletes);
      setIsDemo(false);
      setError(null);
      setFilters({ selectedAthlete: null, selectedPosition: null, selectedSession: null, selectedSex: null, selectedMetric: null });
    } catch (e) {
      setError(`Could not parse file: ${e instanceof Error ? e.message : "Unknown error"}`);
    }
  }, []);

  const resetToDemo = useCallback(() => {
    setRawAthletes(DEMO_ATHLETES);
    setIsDemo(true);
    setError(null);
    setFilters({ selectedAthlete: null, selectedPosition: null, selectedSession: null, selectedSex: null, selectedMetric: null });
  }, []);

  const updateFilter = useCallback(<K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  return {
    allProcessed, filteredAthletes, selectedAthlete,
    teamStats, positionStats, teamInsights,
    positions, sessions, sexes, athleteNames, flaggedAthletes, topPerformers,
    filters, updateFilter, loadData, resetToDemo, isDemo, error,
  };
}
