import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { MetricMeta } from "@/types/athlete";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Metric registry ─────────────────────────────────────────────────────────
// Defines all known kinematic metrics with display metadata.
export const METRIC_REGISTRY: MetricMeta[] = [
  { key: "jump_height_cm",    label: "CMJ Height",       unit: "cm",    higherIsBetter: true,  description: "Countermovement jump height — indicator of lower-body explosive power.",       category: "Power",     color: "#6366f1" },
  { key: "peak_power_w_kg",   label: "Peak Power",       unit: "W/kg",  higherIsBetter: true,  description: "Relative peak power output — combined measure of force and velocity.",         category: "Power",     color: "#8b5cf6" },
  { key: "peak_velocity_ms",  label: "Peak Velocity",    unit: "m/s",   higherIsBetter: true,  description: "Maximum sprint velocity — top-end speed capability.",                         category: "Speed",     color: "#3b82f6" },
  { key: "acceleration_ms2",  label: "Acceleration",     unit: "m/s²",  higherIsBetter: true,  description: "0–10m acceleration — ability to generate speed from a standing start.",       category: "Speed",     color: "#06b6d4" },
  { key: "deceleration_ms2",  label: "Deceleration",     unit: "m/s²",  higherIsBetter: true,  description: "Braking deceleration — ability to absorb force and stop quickly.",            category: "Strength",  color: "#10b981" },
  { key: "asymmetry_index",   label: "Asymmetry Index",  unit: "%",     higherIsBetter: false, description: "Left-right limb asymmetry — values >10% may indicate injury risk.",           category: "Asymmetry", color: "#f59e0b" },
  { key: "rsi",               label: "RSI",              unit: "",      higherIsBetter: true,  description: "Reactive Strength Index — jump height divided by contact time.",              category: "Power",     color: "#ec4899" },
  { key: "peak_force_n_kg",   label: "Peak Force",       unit: "N/kg",  higherIsBetter: true,  description: "Relative peak ground reaction force — strength indicator.",                   category: "Strength",  color: "#f97316" },
  { key: "contact_time_ms",   label: "Contact Time",     unit: "ms",    higherIsBetter: false, description: "Ground contact time — shorter values indicate better neuromuscular stiffness.", category: "Power",     color: "#14b8a6" },
  { key: "hip_rom_deg",       label: "Hip ROM",          unit: "°",     higherIsBetter: true,  description: "Hip flexion range of motion — mobility and injury prevention marker.",        category: "Mobility",  color: "#a78bfa" },
];

export const METRIC_MAP: Record<string, MetricMeta> = Object.fromEntries(
  METRIC_REGISTRY.map(m => [m.key, m])
);

// ─── Number helpers ───────────────────────────────────────────────────────────

export function round(n: number, dp = 1): number {
  return Math.round(n * 10 ** dp) / 10 ** dp;
}

export function pct(value: number, total: number): string {
  return `${Math.round((value / total) * 100)}%`;
}

// Return a traffic-light colour class based on percentile
export function trafficLight(percentile: number, higherIsBetter: boolean): string {
  const effective = higherIsBetter ? percentile : 100 - percentile;
  if (effective >= 66) return "text-emerald-400";
  if (effective >= 33) return "text-amber-400";
  return "text-red-400";
}

export function trafficBg(percentile: number, higherIsBetter: boolean): string {
  const effective = higherIsBetter ? percentile : 100 - percentile;
  if (effective >= 66) return "bg-emerald-500/20 border-emerald-500/40";
  if (effective >= 33) return "bg-amber-500/20 border-amber-500/40";
  return "bg-red-500/20 border-red-500/40";
}

export function trafficBar(percentile: number, higherIsBetter: boolean): string {
  const effective = higherIsBetter ? percentile : 100 - percentile;
  if (effective >= 66) return "bg-emerald-500";
  if (effective >= 33) return "bg-amber-500";
  return "bg-red-500";
}

// Format number for display
export function fmt(value: number | undefined | null, unit = "", dp = 1): string {
  if (value == null || isNaN(value)) return "—";
  return `${round(value, dp)}${unit ? " " + unit : ""}`;
}

// Ordinal suffix
export function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}
