import type { AthleteProcessed, GroupStats } from "@/types/athlete";
import { METRIC_MAP, fmt, ordinal } from "@/lib/utils";
import { mean } from "@/lib/data-processing";

// ─── Individual athlete plain-language narrative ───────────────────────────────

export function generateAthleteNarrative(athlete: AthleteProcessed): string[] {
  const lines: string[] = [];
  const { strengths, weaknesses, overallScore, percentiles } = athlete;

  // Overall summary
  if (overallScore >= 75) {
    lines.push(`${athlete.athlete_name} presents an elite overall kinematic profile, ranking in the top quartile of the group across multiple CMJ and DDJ metrics.`);
  } else if (overallScore >= 50) {
    lines.push(`${athlete.athlete_name} demonstrates an above-average overall profile, with several standout qualities relative to the current comparison group.`);
  } else if (overallScore >= 30) {
    lines.push(`${athlete.athlete_name} shows a developing profile with clear areas of strength alongside targeted opportunities for improvement.`);
  } else {
    lines.push(`${athlete.athlete_name} currently ranks below the group average on most measures. A structured intervention is recommended.`);
  }

  // Strengths
  if (strengths.length) {
    const labels = strengths.map(k => METRIC_MAP[k]?.label ?? k).join(", ");
    lines.push(`Key strengths: ${labels} — all ranking at or above the 75th percentile within the filtered group.`);
  }

  // Weaknesses
  if (weaknesses.length) {
    const labels = weaknesses.map(k => METRIC_MAP[k]?.label ?? k).join(", ");
    lines.push(`Priority development areas: ${labels}. These metrics fall in the bottom quartile and warrant targeted attention in the preseason programme.`);
  }

  // CMJ Jump Height
  const cmjPct = percentiles["cmj_jump_height_m"];
  const cmjVal = Number(athlete.cmj_jump_height_m);
  if (!isNaN(cmjVal) && cmjPct != null) {
    lines.push(`CMJ jump height of ${fmt(cmjVal, "m", 2)} sits at the ${ordinal(cmjPct)} percentile, indicating ${cmjPct >= 66 ? "strong" : cmjPct >= 33 ? "moderate" : "below-average"} bilateral explosive power output.`);
  }

  // DDJ RSI
  const rsiPct = percentiles["ddj_rsi_final"];
  const rsiVal = Number(athlete.ddj_rsi_final);
  if (!isNaN(rsiVal) && rsiPct != null) {
    lines.push(`DDJ reactive strength index of ${fmt(rsiVal, "m/s", 2)} ranks at the ${ordinal(rsiPct)} percentile, reflecting ${rsiPct >= 66 ? "high" : rsiPct >= 33 ? "moderate" : "limited"} neuromuscular stiffness and SSC efficiency.`);
  }

  // Asymmetry
  const asym = Number(athlete.ddj_rsi_asymmetry);
  if (!isNaN(asym)) {
    if (asym > 15) {
      lines.push(`⚠ RSI asymmetry of ${asym.toFixed(1)}% substantially exceeds the 15% clinical threshold. A unilateral strength assessment and targeted corrective loading is strongly advised.`);
    } else if (asym > 10) {
      lines.push(`RSI asymmetry of ${asym.toFixed(1)}% is above the 10% caution threshold. Monitor closely and incorporate unilateral work into the programme where appropriate.`);
    } else {
      lines.push(`Between-limb RSI symmetry is within acceptable range (${asym.toFixed(1)}%), suggesting balanced reactive neuromuscular function.`);
    }
  }

  return lines;
}

// ─── Team-level insights ──────────────────────────────────────────────────────

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

  // Top performer
  const top = [...athletes].sort((a, b) => b.overallScore - a.overallScore)[0];
  insights.push({ type: "top", text: `${top.athlete_name} leads the group with the highest overall performance score (${top.overallScore}/100) across CMJ and DDJ metrics.` });

  // Flagged athletes
  const flagged = athletes.filter(a => a.flags.length > 0);
  if (flagged.length) {
    insights.push({ type: "flag", text: `${flagged.length} athlete${flagged.length > 1 ? "s" : ""} flagged for follow-up: ${flagged.map(a => a.athlete_name).join(", ")}.` });
  }

  // High asymmetry
  const highAsym = athletes.filter(a => Number(a.ddj_rsi_asymmetry) > 15);
  if (highAsym.length) {
    insights.push({ type: "flag", text: `${highAsym.length} athlete${highAsym.length > 1 ? "s" : ""} exceed the 15% RSI asymmetry clinical threshold (${highAsym.map(a => a.athlete_name).join(", ")}). Unilateral assessment recommended.` });
  }

  // Group comparisons
  const sports = [...new Set(athletes.map(a => a.position))];
  if (sports.length >= 2) {
    const sportMeans: Record<string, Record<string, number>> = {};
    for (const sp of sports) {
      const grp = athletes.filter(a => a.position === sp);
      sportMeans[sp] = {
        cmj_jump_height_m: mean(grp.map(a => Number(a.cmj_jump_height_m)).filter(v => !isNaN(v))),
        ddj_rsi_final:     mean(grp.map(a => Number(a.ddj_rsi_final)).filter(v => !isNaN(v))),
      };
    }

    const topCmjSport = sports.sort((a, b) => (sportMeans[b]?.cmj_jump_height_m ?? 0) - (sportMeans[a]?.cmj_jump_height_m ?? 0))[0];
    insights.push({ type: "group", text: `${topCmjSport} athletes recorded the highest mean CMJ jump height (${fmt(sportMeans[topCmjSport]?.cmj_jump_height_m, "m", 2)}) among all sport groups.` });

    const topRsiSport = sports.sort((a, b) => (sportMeans[b]?.ddj_rsi_final ?? 0) - (sportMeans[a]?.ddj_rsi_final ?? 0))[0];
    insights.push({ type: "group", text: `${topRsiSport} athletes demonstrated the highest mean DDJ RSI (${fmt(sportMeans[topRsiSport]?.ddj_rsi_final, "m/s", 2)}), indicating superior reactive strength for this group.` });
  }

  // Top individual on key metrics
  for (const key of ["cmj_jump_height_m", "ddj_rsi_final", "ddj_gct_s"] as const) {
    const meta = METRIC_MAP[key];
    if (!meta) continue;
    const sorted = [...athletes].sort((a, b) =>
      meta.higherIsBetter
        ? Number(b[key]) - Number(a[key])
        : Number(a[key]) - Number(b[key])
    );
    const best = sorted[0];
    if (best) {
      const p = best.percentiles[key] ?? 0;
      const eff = meta.higherIsBetter ? p : 100 - p;
      insights.push({ type: "metric", text: `${best.athlete_name} ranks in the top ${100 - eff + 1}% for ${meta.label} (${fmt(Number(best[key]), meta.unit, 2)}).` });
    }
  }

  // Team average note
  const avgCmj = teamStats.mean["cmj_jump_height_m"];
  if (avgCmj != null) {
    insights.push({ type: "info", text: `Group mean CMJ jump height is ${fmt(avgCmj, "m", 2)} — use this as a baseline to track training adaptations across the preseason period.` });
  }

  return insights;
}
