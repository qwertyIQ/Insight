import type { IntelligenceSignal } from "@insight/intelligence";
import type { RenderableReport, RenderOptions } from "./ReportTypes";

function isoNow(): string {
  // Deterministic: prefer caller-provided timestamp; fallback to a fixed epoch.
  return new Date(0).toISOString();
}

/** Create a simple, deterministic renderable report from a list of signals. */
export function generateReportFromSignals(
  signals: readonly IntelligenceSignal[],
  opts: RenderOptions = {},
): RenderableReport {
  const sorted = [...signals].slice().sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

  const thesis = sorted.length
    ? `This report summarizes ${sorted.length} intelligence signal(s) produced by the engine.`
    : "No signals detected.";

  const findings = sorted.map(
    (s) => `${s.type}: ${s.title} (confidence=${s.confidence.toFixed(2)})`,
  );

  const recommendations = sorted.map(
    (s) => `Investigate signal ${s.id} and review evidence: ${s.evidenceIds.join(", ")}`,
  );

  return {
    id: opts.id ?? `report-${sorted.map((s) => s.id).join("-") || "empty"}`,
    title: opts.title ?? `Signals Report (${sorted.length})`,
    sections: {
      thesis,
      findings,
      recommendations,
    },
    signals: sorted,
    generatedAt: opts.generatedAt ?? isoNow(),
  };
}
