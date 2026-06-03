"use client";
import { cn, trafficBg, trafficLight, fmt, ordinal } from "@/lib/utils";
import type { MetricMeta } from "@/types/athlete";

interface MetricCardProps {
  meta: MetricMeta;
  value: number;
  percentile: number;
  teamAvg: number;
}

export function MetricCard({ meta, value, percentile, teamAvg }: MetricCardProps) {
  const effective   = meta.higherIsBetter ? percentile : 100 - percentile;
  const diff        = value - teamAvg;
  const diffPct     = teamAvg !== 0 ? (diff / teamAvg) * 100 : 0;
  const isAboveAvg  = meta.higherIsBetter ? diff > 0 : diff < 0;

  return (
    <div className={cn("card p-4 border", trafficBg(percentile, meta.higherIsBetter))}>
      {/* Header */}
      <div className="flex items-start justify-between gap-1 mb-3">
        <div>
          <p className="label-sm">{meta.label}</p>
          <p className="text-2xl font-bold text-white leading-tight mt-0.5">
            {fmt(value, "", meta.unit === "%" ? 1 : 1)}
            <span className="text-sm font-normal text-slate-400 ml-1">{meta.unit}</span>
          </p>
        </div>
        <div className={cn("text-right flex-shrink-0")}>
          <p className={cn("text-lg font-black leading-tight", trafficLight(percentile, meta.higherIsBetter))}>
            {ordinal(effective)}
          </p>
          <p className="text-xs text-slate-500">percentile</p>
        </div>
      </div>

      {/* Percentile bar */}
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700",
            effective >= 66 ? "bg-emerald-500" : effective >= 33 ? "bg-amber-500" : "bg-red-500"
          )}
          style={{ width: `${effective}%` }}
        />
      </div>

      {/* vs team avg */}
      <p className="text-xs text-slate-500">
        vs avg: {" "}
        <span className={cn("font-semibold", isAboveAvg ? "text-emerald-400" : "text-red-400")}>
          {diff > 0 ? "+" : ""}{fmt(diff, meta.unit, 1)} ({diffPct > 0 ? "+" : ""}{diffPct.toFixed(1)}%)
        </span>
      </p>
    </div>
  );
}
