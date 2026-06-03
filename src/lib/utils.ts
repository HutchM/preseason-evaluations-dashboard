import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { MetricMeta } from "@/types/athlete";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Metric registry — real CMJ + DDJ metrics ────────────────────────────────
export const METRIC_REGISTRY: MetricMeta[] = [
  // CMJ
  { key: "cmj_jump_height_m",            label: "CMJ Jump Height",        unit: "m",    higherIsBetter: true,  description: "Countermovement jump height derived from force plate impulse-momentum. Primary indicator of bilateral lower-body explosive power.",                  category: "CMJ",       color: "#6366f1" },
  { key: "cmj_takeoff_velocity_ms",       label: "Take-off Velocity",      unit: "m/s",  higherIsBetter: true,  description: "Centre-of-mass velocity at take-off. Reflects the rate of force development across the propulsive phase.",                                         category: "CMJ",       color: "#8b5cf6" },
  { key: "cmj_cm_depth_m",               label: "CM Depth",               unit: "m",    higherIsBetter: true,  description: "Depth of the countermovement phase. Reflects the athlete's ability to pre-load the SSC effectively.",                                              category: "CMJ",       color: "#a78bfa" },
  { key: "cmj_flight_time_s",            label: "Flight Time",            unit: "s",    higherIsBetter: true,  description: "Airborne duration. Correlates strongly with jump height; longer flight time indicates greater power output.",                                       category: "CMJ",       color: "#7c3aed" },
  { key: "cmj_propulsive_duration_s",    label: "Propulsive Duration",    unit: "s",    higherIsBetter: false, description: "Time from minimum velocity to take-off. Shorter durations suggest faster, more explosive propulsion.",                                              category: "CMJ",       color: "#4f46e5" },
  { key: "cmj_peak_descent_velocity_ms", label: "Peak Descent Velocity",  unit: "m/s",  higherIsBetter: true,  description: "Absolute peak downward velocity during the countermovement. Higher values indicate a faster, more elastic loading strategy.",                      category: "CMJ",       color: "#4338ca" },
  // DDJ
  { key: "ddj_rsi_final",               label: "DDJ RSI",                unit: "m/s",  higherIsBetter: true,  description: "Reactive Strength Index: jump height ÷ ground contact time. The primary measure of reactive/plyometric ability in the drop-jump.",               category: "DDJ",       color: "#10b981" },
  { key: "ddj_jump_height_m",           label: "DDJ Jump Height",        unit: "m",    higherIsBetter: true,  description: "Drop-jump rebound height. Reflects the athlete's ability to store and return elastic energy during a rapid SSC.",                                  category: "DDJ",       color: "#34d399" },
  { key: "ddj_gct_s",                   label: "Ground Contact Time",    unit: "s",    higherIsBetter: false, description: "Time on ground during the drop-jump rebound. Shorter GCT with maintained height indicates superior neuromuscular stiffness.",                      category: "DDJ",       color: "#059669" },
  { key: "ddj_peak_vgrf_bw",            label: "Peak vGRF",              unit: "BW",   higherIsBetter: true,  description: "Peak vertical ground reaction force normalised to bodyweight. Reflects the magnitude of force production during landing and rebound.",             category: "DDJ",       color: "#047857" },
  { key: "ddj_loading_rate_bw_s",       label: "Loading Rate",           unit: "BW/s", higherIsBetter: true,  description: "Rate of force development during initial landing contact. Higher loading rates are associated with reactive strength and stiffness.",              category: "DDJ",       color: "#065f46" },
  { key: "ddj_rsi_asymmetry",           label: "RSI Asymmetry",          unit: "%",    higherIsBetter: false, description: "Between-limb asymmetry in RSI: |Left − Right| / mean × 100. Values >10–15% may indicate injury risk or limb dominance concerns.",               category: "Asymmetry", color: "#f59e0b" },
];

export const METRIC_MAP: Record<string, MetricMeta> = Object.fromEntries(
  METRIC_REGISTRY.map(m => [m.key, m])
);

// Group metrics by task category
export const CMJ_METRICS  = METRIC_REGISTRY.filter(m => m.category === "CMJ");
export const DDJ_METRICS  = METRIC_REGISTRY.filter(m => m.category === "DDJ");
export const ASYM_METRICS = METRIC_REGISTRY.filter(m => m.category === "Asymmetry");

// ─── Number helpers ───────────────────────────────────────────────────────────

export function round(n: number, dp = 2): number {
  return Math.round(n * 10 ** dp) / 10 ** dp;
}

export function trafficLight(percentile: number, higherIsBetter: boolean): string {
  const eff = higherIsBetter ? percentile : 100 - percentile;
  if (eff >= 66) return "text-emerald-400";
  if (eff >= 33) return "text-amber-400";
  return "text-red-400";
}

export function trafficBg(percentile: number, higherIsBetter: boolean): string {
  const eff = higherIsBetter ? percentile : 100 - percentile;
  if (eff >= 66) return "bg-emerald-500/20 border-emerald-500/40";
  if (eff >= 33) return "bg-amber-500/20 border-amber-500/40";
  return "bg-red-500/20 border-red-500/40";
}

export function trafficBar(percentile: number, higherIsBetter: boolean): string {
  const eff = higherIsBetter ? percentile : 100 - percentile;
  if (eff >= 66) return "bg-emerald-500";
  if (eff >= 33) return "bg-amber-500";
  return "bg-red-500";
}

export function fmt(value: number | undefined | null, unit = "", dp = 2): string {
  if (value == null || isNaN(value as number)) return "—";
  return `${round(value as number, dp)}${unit ? " " + unit : ""}`;
}

export function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}
