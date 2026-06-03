import type { AthleteProcessed, GroupStats } from "@/types/athlete";
import { METRIC_MAP, ordinal, fmt } from "@/lib/utils";
import { mean } from "@/lib/data-processing";

// ─── Individual athlete plain-language interpretation ─────────────────────────

export function generateAthleteNarrative(athlete: AthleteProcessed): string[] {
  const lines: string[] = [];
  const { strengths, weaknesses, overallScore, percentiles, flags } = athlete;

  // Overall
  if (overallScore >= 75) {
    lines.push(`${athlete.athlete_name} presents an elite overall profile, ranking in the top quartile of the squad across multiple performance metrics.`);
  } else if (overallScore >= 50) {
    lines.push(`${athlete.athlete_name} demonstrates an above-average overall profile relative to the squad, with several standout qualities.`);
  } else if (overallScore >= 30) {
    lines.push(`${athlete.athlete_name} shows a developing profile, with clear areas of strength and targeted opportunities for improvement.`);
  } else {
    lines.push(`${athlete.athlete_name} currently sits below the squad average on most measures. A structured development programme is recommended.`);
  }

  // Strengths
  if (strengths.length) {
    const labels = strengths.map(k => METRIC_MAP[k]?.label ?? k).join(", ");
    lines.push(`Key strengths include ${labels} — all ranking in the 75th percentile or above within the group.`);
  }

  // Weaknesses
  if (weaknesses.length) {
    const labels = weaknesses.map(k => METRIC_MAP[k]?.label ?? k).join(", ");
    lines.push(`Priority development areas: ${labels}. These metrics sit in the bottom quartile and warrant targeted attention in the preseason programme.`);
  }

  // Asymmetry flag
  const asym = athlete.asymmetry_index;
  if (typeof asym === "number") {
    if (asym > 15) {
      lines.push(`⚠ Asymmetry Index of ${asym.toFixed(1)}% is notably high (>15%). This warrants clinical review and possible unilateral strength work to reduce injury risk.`);
    } else if (asym > 10) {
      lines.push(`Asymmetry Index of ${asym.toFixed(1)}% slightly exceeds the recommended threshold of 10%. Monitor closely and incorporate corrective loading where appropriate.`);
    } else {
      lines.push(`Limb symmetry is within the acceptable range (${asym.toFixed(1)}%), suggesting balanced neuromuscular function.`);
    }
  }

  // Jump height context
  const jumpPct = percentiles["jump_height_cm"];
  if (jumpPct != null) {
    lines.push(`CMJ height is in the ${ordinal(jumpPct)} percentile for the squad, reflecting ${jumpPct >= 66 ? "strong" : jumpPct >= 33 ? "moderate" : "limited"} lower-body explosive capacity.`);
  }

  return lines;
}

// ─── Team-level summary insights ─────────────────────────────────────────────

export interface TeamInsight {
  type: "top" | "flag" | "group" | "metric" | "info";
  text: string;
}

export function generateTeamInsights(
  athletes: AthleteProcessed[],
  teamStats: GroupStats
): TeamInsight[] {
  const insights: TeamInsight[] = [];
  if (!athletes.length) return insights;

  // Top performer overall
  const top = [...athletes].sort((a, b) => b.overallScore - a.overallScore)[0];
  insights.push({ type: "top", text: `${top.athlete_name} leads the squad with the highest overall performance score (${top.overallScore}/100).` });

  // Flagged athletes
  const flagged = athletes.filter(a => a.flags.length > 0);
  if (flagged.length) {
    insights.push({ type: "flag", text: `${flagged.length} athlete${flagged.length > 1 ? "s" : ""} flagged for follow-up: ${flagged.map(a => a.athlete_name).join(", ")}.` });
  }

  // High asymmetry athletes
  const highAsym = athletes.filter(a => Number(a.asymmetry_index) > 10);
  if (highAsym.length) {
    insights.push({ type: "flag", text: `${highAsym.length} athlete${highAsym.length > 1 ? "s" : ""} exceed the 10% asymmetry threshold (${highAsym.map(a => a.athlete_name).join(", ")}). Clinical review recommended.` });
  }

  // Position group comparison on key metrics
  const positions = [...new Set(athletes.map(a => a.position))];
  if (positions.length >= 2) {
    const posMeans: Record<string, Record<string, number>> = {};
    for (const pos of positions) {
      const grp = athletes.filter(a => a.position === pos);
      posMeans[pos] = {};
      for (const key of ["peak_velocity_ms", "jump_height_cm", "deceleration_ms2", "peak_force_n_kg"]) {
        const vals = grp.map(a => Number(a[key])).filter(v => !isNaN(v));
        posMeans[pos][key] = mean(vals);
      }
    }

    // Highest velocity group
    const velRanked = positions.sort((a, b) => (posMeans[b]?.peak_velocity_ms ?? 0) - (posMeans[a]?.peak_velocity_ms ?? 0));
    if (velRanked.length >= 2) {
      insights.push({ type: "group", text: `${velRanked[0]}s recorded the highest mean peak velocity (${fmt(posMeans[velRanked[0]]?.peak_velocity_ms, "m/s")}) compared to ${velRanked[velRanked.length - 1]}s (${fmt(posMeans[velRanked[velRanked.length - 1]]?.peak_velocity_ms, "m/s")}).` });
    }

    // Highest jump group
    const jumpRanked = [...positions].sort((a, b) => (posMeans[b]?.jump_height_cm ?? 0) - (posMeans[a]?.jump_height_cm ?? 0));
    insights.push({ type: "group", text: `${jumpRanked[0]}s demonstrated the highest average CMJ height (${fmt(posMeans[jumpRanked[0]]?.jump_height_cm, "cm")}).` });
  }

  // Elite performers per metric
  const eliteMetrics = ["jump_height_cm", "peak_velocity_ms", "rsi"];
  for (const key of eliteMetrics) {
    const topAthlete = [...athletes].sort((a, b) => Number(b[key]) - Number(a[key]))[0];
    const meta = METRIC_MAP[key];
    if (topAthlete && meta) {
      const p = topAthlete.percentiles[key] ?? 0;
      insights.push({ type: "metric", text: `${topAthlete.athlete_name} ranks in the top ${100 - p + 1}% for ${meta.label} (${fmt(Number(topAthlete[key]), meta.unit)}).` });
    }
  }

  // Team average readout
  const teamAvgPower = teamStats.mean["peak_power_w_kg"];
  if (teamAvgPower != null) {
    insights.push({ type: "info", text: `Squad mean peak power is ${fmt(teamAvgPower, "W/kg")} — a useful baseline for tracking preseason training adaptations.` });
  }

  return insights;
}
