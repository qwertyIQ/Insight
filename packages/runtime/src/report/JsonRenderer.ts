import type { RenderableReport } from "./ReportTypes";

export function renderJson(report: RenderableReport): string {
  // Deterministic JSON serialization with stable key ordering via replacer
  return JSON.stringify(report, Object.keys(report).sort(), 2);
}
