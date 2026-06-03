// ─── Core Data Types ─────────────────────────────────────────────────────────

export type Position = "Basketball" | "Volleyball" | "Hockey" | string;
export type Sex = "men" | "women" | string;

export interface AthleteRaw {
  athlete_name:  string;   // athlete_id from long format
  position:      Position; // demo_sport
  session_date:  string;   // year_of_study (used as cohort label)
  sex:           Sex;
  age?:          number;

  // ── CMJ metrics (mean across valid bilat trials) ───────────────────────
  cmj_jump_height_m:            number;  // CMJ Jump Height (m) — higher better
  cmj_takeoff_velocity_ms:      number;  // Take-off Velocity (m/s) — higher better
  cmj_cm_depth_m:               number;  // CM Depth (m) — higher better
  cmj_flight_time_s:            number;  // Flight Time (s) — higher better
  cmj_propulsive_duration_s:    number;  // Propulsive Duration (s) — lower better
  cmj_peak_descent_velocity_ms: number;  // Peak Descent Velocity |m/s| — higher better

  // ── DDJ metrics (mean of L+R, averaged across valid trials) ───────────
  ddj_rsi_final:         number;  // RSI (m/s) — higher better
  ddj_jump_height_m:     number;  // DDJ Jump Height (m) — higher better
  ddj_gct_s:             number;  // Ground Contact Time (s) — lower better
  ddj_peak_vgrf_bw:      number;  // Peak vGRF (BW) — higher better
  ddj_loading_rate_bw_s: number;  // Loading Rate (BW/s) — higher better
  ddj_rsi_asymmetry:     number;  // RSI Asymmetry % |L−R| — lower better

  [key: string]: string | number | undefined;
}

// ─── Processed Athlete with derived stats ────────────────────────────────────

export interface AthleteProcessed extends AthleteRaw {
  id: string;
  percentiles:   Record<string, number>;
  zScores:       Record<string, number>;
  strengths:     string[];
  weaknesses:    string[];
  overallScore:  number;
  flags:         string[];
}

// ─── Metric Metadata ──────────────────────────────────────────────────────────

export interface MetricMeta {
  key:             string;
  label:           string;
  unit:            string;
  higherIsBetter:  boolean;
  description:     string;
  category:        "CMJ" | "DDJ" | "Asymmetry";
  color:           string;
}

// ─── Group stats ─────────────────────────────────────────────────────────────

export interface GroupStats {
  mean:   Record<string, number>;
  median: Record<string, number>;
  std:    Record<string, number>;
  min:    Record<string, number>;
  max:    Record<string, number>;
  p25:    Record<string, number>;
  p75:    Record<string, number>;
}

// ─── Dashboard state ──────────────────────────────────────────────────────────

export type NavSection = "overview" | "athlete" | "group" | "metrics" | "summary";

export interface Filters {
  selectedAthlete:  string | null;
  selectedPosition: string | null;   // sport
  selectedSession:  string | null;   // year of study / cohort
  selectedSex:      string | null;
  selectedMetric:   string | null;
}
