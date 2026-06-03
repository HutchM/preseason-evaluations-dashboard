import type { AthleteRaw, AthleteProcessed, GroupStats } from "@/types/athlete";
import { METRIC_REGISTRY } from "@/lib/utils";

// ─── Statistical helpers ──────────────────────────────────────────────────────

export function mean(arr: number[]): number {
  const valid = arr.filter(v => !isNaN(v) && isFinite(v));
  if (!valid.length) return NaN;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}

export function std(arr: number[], m?: number): number {
  const valid = arr.filter(v => !isNaN(v) && isFinite(v));
  if (valid.length < 2) return 0;
  const mu = m ?? mean(valid);
  return Math.sqrt(valid.reduce((s, v) => s + (v - mu) ** 2, 0) / (valid.length - 1));
}

export function percentileRank(value: number, arr: number[]): number {
  const valid = arr.filter(v => !isNaN(v) && isFinite(v));
  if (!valid.length || isNaN(value)) return 50;
  const below = valid.filter(v => v < value).length;
  const equal = valid.filter(v => v === value).length;
  return Math.round(((below + equal * 0.5) / valid.length) * 100);
}

function quantile(sorted: number[], q: number): number {
  if (!sorted.length) return NaN;
  const pos  = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  return sorted[base];
}

function groupBy<T>(arr: T[], key: (item: T) => string): Record<string, T[]> {
  const out: Record<string, T[]> = {};
  for (const item of arr) {
    const k = key(item);
    (out[k] ??= []).push(item);
  }
  return out;
}

// ─── Long-format detector ─────────────────────────────────────────────────────
// Returns true when the CSV looks like the long "normative" format
// (has columns: metric, value, task, side, athlete_id)

export function isLongFormat(rows: Record<string, string>[]): boolean {
  if (!rows.length) return false;
  const keys = Object.keys(rows[0]).map(k => k.trim().toLowerCase());
  return keys.includes("metric") && keys.includes("value") && keys.includes("task");
}

// ─── Long → Wide pivot ───────────────────────────────────────────────────────
// Reads the normative long-format CSV and returns one AthleteRaw per athlete.
// Filters: include_for_modeling_strict=TRUE, manual_exclude=FALSE,
//          cohort_exclude_from_analysis=FALSE

export function parseLongFormat(rows: Record<string, string>[]): AthleteRaw[] {
  // Normalise column names
  const norm = rows.map(r => {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(r)) out[k.trim().toLowerCase()] = String(v ?? "").trim();
    return out;
  });

  // Filter valid rows
  const valid = norm.filter(r =>
    r.include_for_modeling_strict === "TRUE" &&
    r.manual_exclude !== "TRUE" &&
    r.cohort_exclude_from_analysis !== "TRUE"
  );

  if (!valid.length) return [];

  const byAthlete = groupBy(valid, r => r.athlete_id);

  return Object.entries(byAthlete).map(([athleteId, aRows]) => {
    const first = aRows[0];

    // Helper: average metric across a subset of rows
    const avgMetric = (subset: Record<string, string>[], metricKey: string): number => {
      const vals = subset
        .filter(r => r.metric === metricKey)
        .map(r => parseFloat(r.value))
        .filter(v => !isNaN(v));
      return vals.length ? mean(vals) : NaN;
    };

    const cmj  = aRows.filter(r => r.task === "CMJ" && r.side === "bilat");
    const ddjL = aRows.filter(r => r.task === "DDJ" && r.side === "DJ-L");
    const ddjR = aRows.filter(r => r.task === "DDJ" && r.side === "DJ-R");

    // CMJ metrics (mean of bilat trials)
    const cmjJumpHeight     = avgMetric(cmj, "cmj_jump_height_m");
    const cmjTakeoffVel     = avgMetric(cmj, "cmj_takeoff_velocity_ms");
    const cmjDepth          = avgMetric(cmj, "cmj_cm_depth_m");
    const cmjFlightTime     = avgMetric(cmj, "cmj_flight_time_s");
    const cmjPropDuration   = avgMetric(cmj, "cmj_propulsive_duration_s");
    const cmjPeakDescent    = Math.abs(avgMetric(cmj, "cmj_cm_peak_descent_velocity_ms"));

    // DDJ metrics: average L and R separately, then mean of both
    const avg2 = (l: number, r: number): number => mean([l, r]);

    const ddjRsiL    = avgMetric(ddjL, "ddj_rsi_final");
    const ddjRsiR    = avgMetric(ddjR, "ddj_rsi_final");
    const ddjRsi     = avg2(ddjRsiL, ddjRsiR);

    const ddjJumpL   = avgMetric(ddjL, "ddj_jump_height_m");
    const ddjJumpR   = avgMetric(ddjR, "ddj_jump_height_m");
    const ddjJump    = avg2(ddjJumpL, ddjJumpR);

    const ddjGctL    = avgMetric(ddjL, "ddj_gct_s");
    const ddjGctR    = avgMetric(ddjR, "ddj_gct_s");
    const ddjGct     = avg2(ddjGctL, ddjGctR);

    const ddjVgrfL   = avgMetric(ddjL, "ddj_peak_vgrf_bw");
    const ddjVgrfR   = avgMetric(ddjR, "ddj_peak_vgrf_bw");
    const ddjVgrf    = avg2(ddjVgrfL, ddjVgrfR);

    const ddjLoadL   = avgMetric(ddjL, "ddj_loading_rate_bw_s");
    const ddjLoadR   = avgMetric(ddjR, "ddj_loading_rate_bw_s");
    const ddjLoad    = avg2(ddjLoadL, ddjLoadR);

    // RSI asymmetry: |L − R| / ((L + R) / 2) × 100
    const ddjRsiAsym = (!isNaN(ddjRsiL) && !isNaN(ddjRsiR) && (ddjRsiL + ddjRsiR) > 0)
      ? (Math.abs(ddjRsiL - ddjRsiR) / ((ddjRsiL + ddjRsiR) / 2)) * 100
      : NaN;

    return {
      athlete_name:                athleteId,
      position:                    first.demo_sport   ?? "Unknown",
      session_date:                first.demo_year_of_study ?? "",
      sex:                         first.demo_sex     ?? "",
      age:                         parseFloat(first.demo_age_years ?? "NaN"),
      cmj_jump_height_m:            cmjJumpHeight,
      cmj_takeoff_velocity_ms:      cmjTakeoffVel,
      cmj_cm_depth_m:               cmjDepth,
      cmj_flight_time_s:            cmjFlightTime,
      cmj_propulsive_duration_s:    cmjPropDuration,
      cmj_peak_descent_velocity_ms: cmjPeakDescent,
      ddj_rsi_final:                ddjRsi,
      ddj_jump_height_m:            ddjJump,
      ddj_gct_s:                    ddjGct,
      ddj_peak_vgrf_bw:             ddjVgrf,
      ddj_loading_rate_bw_s:        ddjLoad,
      ddj_rsi_asymmetry:            ddjRsiAsym,
    } as AthleteRaw;
  });
}

// ─── Numeric column detection ─────────────────────────────────────────────────

export function getNumericKeys(athletes: AthleteRaw[]): string[] {
  if (!athletes.length) return [];
  const skip = new Set(["athlete_name", "position", "session_date", "sex", "id"]);
  return Object.keys(athletes[0]).filter(k => {
    if (skip.has(k)) return false;
    const val = athletes[0][k];
    return typeof val === "number" || (!isNaN(Number(val)) && val !== "");
  });
}

// ─── Main processing: wide-format athletes → AthleteProcessed ────────────────

export function processAthletes(raw: AthleteRaw[]): AthleteProcessed[] {
  if (!raw.length) return [];

  const numericKeys = getNumericKeys(raw);

  const teamValues: Record<string, number[]> = {};
  for (const key of numericKeys) {
    teamValues[key] = raw
      .map(a => Number(a[key]))
      .filter(v => !isNaN(v) && isFinite(v));
  }

  const teamMeans: Record<string, number> = {};
  const teamStds:  Record<string, number> = {};
  for (const key of numericKeys) {
    teamMeans[key] = mean(teamValues[key]);
    teamStds[key]  = std(teamValues[key], teamMeans[key]);
  }

  return raw.map((athlete, i) => {
    const percentiles: Record<string, number> = {};
    const zScores:     Record<string, number> = {};

    for (const key of numericKeys) {
      const val = Number(athlete[key]);
      percentiles[key] = isNaN(val) ? 50 : percentileRank(val, teamValues[key]);
      zScores[key]     = teamStds[key] > 0 ? (val - teamMeans[key]) / teamStds[key] : 0;
    }

    const knownMetrics = METRIC_REGISTRY.filter(m => numericKeys.includes(m.key));
    const strengths:  string[] = [];
    const weaknesses: string[] = [];

    for (const meta of knownMetrics) {
      const p   = percentiles[meta.key] ?? 50;
      const eff = meta.higherIsBetter ? p : 100 - p;
      if (eff >= 75) strengths.push(meta.key);
      if (eff <= 25) weaknesses.push(meta.key);
    }

    const effectivePercentiles = knownMetrics
      .map(m => {
        const p = percentiles[m.key] ?? 50;
        return m.higherIsBetter ? p : 100 - p;
      })
      .filter(v => !isNaN(v));

    const overallScore = Math.round(mean(effectivePercentiles)) || 0;

    // Flags
    const flags: string[] = [];
    const asym = Number(athlete.ddj_rsi_asymmetry);
    if (!isNaN(asym) && asym > 15) {
      flags.push(`RSI asymmetry of ${asym.toFixed(1)}% exceeds 15% threshold — clinical review recommended`);
    } else if (!isNaN(asym) && asym > 10) {
      flags.push(`RSI asymmetry of ${asym.toFixed(1)}% is above the 10% caution threshold — monitor closely`);
    }
    if (overallScore < 30) {
      flags.push("Overall profile is in the bottom quartile — consider targeted intervention");
    }
    if (weaknesses.length >= 4) {
      flags.push(`${weaknesses.length} metrics in bottom quartile — prioritise in programme design`);
    }

    return {
      ...athlete,
      id: `${athlete.athlete_name}-${i}`,
      percentiles,
      zScores,
      strengths,
      weaknesses,
      overallScore,
      flags,
    };
  });
}

// ─── Group stats ──────────────────────────────────────────────────────────────

function computeGroupStats(athletes: AthleteRaw[]): GroupStats {
  const stats: GroupStats = { mean: {}, median: {}, std: {}, min: {}, max: {}, p25: {}, p75: {} };
  const keys = getNumericKeys(athletes);

  for (const key of keys) {
    const vals   = athletes.map(a => Number(a[key])).filter(v => !isNaN(v) && isFinite(v));
    const sorted = [...vals].sort((a, b) => a - b);
    const mu     = mean(vals);
    stats.mean[key]   = mu;
    stats.median[key] = quantile(sorted, 0.5);
    stats.std[key]    = std(vals, mu);
    stats.min[key]    = sorted[0]  ?? NaN;
    stats.max[key]    = sorted[sorted.length - 1] ?? NaN;
    stats.p25[key]    = quantile(sorted, 0.25);
    stats.p75[key]    = quantile(sorted, 0.75);
  }
  return stats;
}

export function computeAllGroupStats(processed: AthleteProcessed[]) {
  const team = computeGroupStats(processed);
  const positions = [...new Set(processed.map(a => a.position))];
  const byPosition: Record<string, GroupStats> = {};
  for (const pos of positions) {
    byPosition[pos] = computeGroupStats(processed.filter(a => a.position === pos));
  }
  return { team, byPosition };
}
