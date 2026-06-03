"use client";
import { trafficBar, trafficLight, ordinal } from "@/lib/utils";

interface PercentileBarProps {
  label: string;
  value: number | string;
  unit?: string;
  percentile: number;
  higherIsBetter: boolean;
  teamAvg?: number;
}

export function PercentileBar({ label, value, unit, percentile, higherIsBetter, teamAvg }: PercentileBarProps) {
  const barColor  = trafficBar(percentile, higherIsBetter);
  const textColor = trafficLight(percentile, higherIsBetter);
  const effective = higherIsBetter ? percentile : 100 - percentile;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-white">{value}{unit ? ` ${unit}` : ""}</span>
          <span className={`text-xs font-bold ${textColor}`}>{ordinal(effective)}</span>
        </div>
      </div>
      {/* Bar track */}
      <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${percentile}%` }}
        />
        {/* Team average marker */}
        {teamAvg != null && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white/50"
            style={{ left: `${teamAvg}%` }}
            title={`Team avg`}
          />
        )}
      </div>
    </div>
  );
}
