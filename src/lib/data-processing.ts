import type { AthleteRaw, AthleteProcessed, GroupStats } from "@/types/athlete";
import { METRIC_REGISTRY } from "@/lib/utils";

// ─── Statistical helpers ──────────────────────────────────────────────────────

function mean(arr: number[]): number {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function std(arr: number[], m?: number): number {
  if (arr.length < 2) return 0;
  const mu = m ?? mean(arr);
  return Math.sqrt(arr.reduce((s, v) => s + (v - mu) ** 2, 0) / (arr.length - 1));
}

function percentileRank(value: number, arr: number[]): number {
  if (!arr.length) return 50;
  const below = arr.filter(v => v < value).length;
  const equal = arr.filter(v => v === value).length;
  return Math.round(((below + equal * 0.5) / arr.length) * 100);
}

function quantile(sorted: number[], q: number): number {
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  }
  return sorted[base];
}

function computeGroupStats(athletes: AthleteRaw[]): GroupStats {
  const stats: GroupStats = { mean: {}, median: {}, std: {}, min: {}, max: {}, p25: {}, p75: {} };

  const numericKeys = getNumericKeys(athletes);

  for (const key of numericKeys) {
    const vals = athletes.map(a => Number(a[key])).filter(v => !isNaN(v));
    const sorted = [...vals].sort((a, b) => a - b);
    const mu = mean(vals);
    stats.mean[key]   = mu;
    stats.median[key] = quantile(sorted, 0.5);
    stats.std[key]    = std(vals, mu);
    stats.min[key]    = sorted[0] ?? 0;
    stats.max[key]    = sorted[sorted.length - 1] ?? 0;
    stats.p25[key]    = quantile(sorted, 0.25);
    stats.p75[key]    = quantile(sorted, 0.75);
  }
  return stats;
}

// ─── Detect numeric columns (auto-discovery from uploads) ─────────────────────

export function getNumericKeys(athletes: AthleteRaw[]): string[] {
  if (!athletes.length) return [];
  const skipKeys = new Set(["athlete_name", "position", "session_date", "id"]);
  return Object.keys(athletes[0]).filter(k => {
    if (skipKeys.has(k)) return false;
    const val = athletes[0][k];
    return typeof val === "number" || !isNaN(Number(val));
  });
}

// ─── Main processing function ─────────────────────────────────────────────────

export function processAthletes(raw: AthleteRaw[]): AthleteProcessed[] {
  if (!raw.length) return [];

  const numericKeys = getNumericKeys(raw);

  // Build team-wide value arrays for each metric
  const teamValues: Record<string, number[]> = {};
  for (const key of numericKeys) {
    teamValues[key] = raw.map(a => Number(a[key])).filter(v => !isNaN(v));
  }

  const teamMeans: Record<string, number> = {};
  const teamStds: Record<string, number> = {};
  for (const key of numericKeys) {
    teamMeans[key] = mean(teamValues[key]);
    teamStds[key]  = std(teamValues[key], teamMeans[key]);
  }

  return raw.map((athlete, i) => {
    const percentiles: Record<string, number> = {};
    const zScores: Record<string, number>     = {};

    for (const key of numericKeys) {
      const val = Number(athlete[key]);
      percentiles[key] = isNaN(val) ? 50 : percentileRank(val, teamValues[key]);
      zScores[key]     = teamStds[key] > 0 ? (val - teamMeans[key]) / teamStds[key] : 0;
    }

    // Determine strengths / weaknesses using known metrics only
    const knownMetrics = METRIC_REGISTRY.filter(m => numericKeys.includes(m.key));
    const strengths:  string[] = [];
    const weaknesses: string[] = [];

    for (const meta of knownMetrics) {
      const p = percentiles[meta.key] ?? 50;
      const effective = meta.higherIsBetter ? p : 100 - p;
      if (effective >= 75) strengths.push(meta.key);
      if (effective <= 25) weaknesses.push(meta.key);
    }

    // Composite score: average effective-percentile across known metrics
    const effectivePercentiles = knownMetrics.map(m => {
      const p = percentiles[m.key] ?? 50;
      return m.higherIsBetter ? p : 100 - p;
    });
    const overallScore = Math.round(mean(effectivePercentiles));

    // Auto-generate flags
    const flags: string[] = [];
    const asymMeta = METRIC_REGISTRY.find(m => m.key === "asymmetry_index");
    if (asymMeta) {
      const asym = Number(athlete.asymmetry_index);
      if (!isNaN(asym) && asym > 10) flags.push(`High asymmetry index (${asym.toFixed(1)}%) — monitor injury risk`);
    }
    if (overallScore < 30) flags.push("Below-average overall profile — consider targeted intervention");
    if (weaknesses.length >= 3) flags.push(`${weaknesses.length} metrics in bottom quartile — prioritise in programme design`);

    return {
      ...athlete,
      id: `${athlete.athlete_name}-${athlete.session_date}-${i}`,
      percentiles,
      zScores,
      strengths,
      weaknesses,
      overallScore,
      flags,
    };
  });
}

// ─── Group stats (team + per-position) ───────────────────────────────────────

export function computeAllGroupStats(processed: AthleteProcessed[]) {
  const team = computeGroupStats(processed);

  const positions = [...new Set(processed.map(a => a.position))];
  const byPosition: Record<string, GroupStats> = {};
  for (const pos of positions) {
    byPosition[pos] = computeGroupStats(processed.filter(a => a.position === pos));
  }

  return { team, byPosition };
}

// ─── CSV/XLSX parsing helpers (called from file upload) ───────────────────────

export function coerceRow(row: Record<string, string>): AthleteRaw {
  const numericFields = [
    "jump_height_cm", "peak_power_w_kg", "peak_velocity_ms",
    "acceleration_ms2", "deceleration_ms2", "asymmetry_index",
    "rsi", "peak_force_n_kg", "contact_time_ms", "hip_rom_deg",
  ];
  const result: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(row)) {
    const key = k.trim().toLowerCase().replace(/\s+/g, "_");
    if (numericFields.includes(key)) {
      const n = parseFloat(String(v).replace(/[^0-9.\-]/g, ""));
      result[key] = isNaN(n) ? 0 : n;
    } else {
      result[key] = String(v).trim();
    }
  }
  // Ensure required string fields exist
  if (!result.athlete_name) result.athlete_name = "Unknown";
  if (!result.position)     result.position     = "Unknown";
  if (!result.session_date) result.session_date = new Date().toISOString().slice(0, 10);

  return result as unknown as AthleteRaw;
}

export { computeGroupStats, percentileRank, mean, std };
