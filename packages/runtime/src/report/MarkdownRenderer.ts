import type { RenderableReport } from "./ReportTypes";

function escapeMarkdown(s: string): string {
  return s.replace(/[\\*_`]/g, "\\$&");
}

export function renderMarkdown(report: RenderableReport): string {
  const lines: string[] = [];
  lines.push(`# ${escapeMarkdown(report.title)}`);
  lines.push("");
  lines.push(`Generated at: ${report.generatedAt}`);
  lines.push("");
  lines.push("## Thesis");
  lines.push("");
  lines.push(escapeMarkdown(report.sections.thesis));
  lines.push("");
  lines.push("## Findings");
  lines.push("");
  for (const f of report.sections.findings) {
    lines.push(`- ${escapeMarkdown(f)}`);
  }
  lines.push("");
  lines.push("## Recommendations");
  lines.push("");
  for (const r of report.sections.recommendations) {
    lines.push(`- ${escapeMarkdown(r)}`);
  }
  lines.push("");
  lines.push("## Signals (raw)");
  lines.push("");
  for (const s of report.signals) {
    lines.push(
      `- ${escapeMarkdown(s.id)} | ${escapeMarkdown(s.title)} | confidence=${s.confidence.toFixed(2)}`,
    );
  }
  return lines.join("\n");
}
