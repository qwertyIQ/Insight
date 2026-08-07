import type { RenderableReport } from "./ReportTypes";

function escapeHtml(s: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return s.replace(/[&<>"']/g, (c) => map[c] ?? "");
}

export function renderHtml(report: RenderableReport): string {
  const parts: string[] = [];
  parts.push(
    `<html><head><meta charset="utf-8"><title>${escapeHtml(report.title)}</title></head><body>`,
  );
  parts.push(`<h1>${escapeHtml(report.title)}</h1>`);
  parts.push(`<p><em>Generated at: ${escapeHtml(report.generatedAt)}</em></p>`);
  parts.push(`<h2>Thesis</h2><p>${escapeHtml(report.sections.thesis)}</p>`);
  parts.push(`<h2>Findings</h2><ul>`);
  for (const f of report.sections.findings) parts.push(`<li>${escapeHtml(f)}</li>`);
  parts.push(`</ul>`);
  parts.push(`<h2>Recommendations</h2><ul>`);
  for (const r of report.sections.recommendations) parts.push(`<li>${escapeHtml(r)}</li>`);
  parts.push(`</ul>`);
  parts.push(`<h2>Signals (raw)</h2><ul>`);
  for (const s of report.signals)
    parts.push(
      `<li>${escapeHtml(s.id)} | ${escapeHtml(s.title)} | confidence=${s.confidence.toFixed(2)}</li>`,
    );
  parts.push(`</ul>`);
  parts.push(`</body></html>`);
  return parts.join("\n");
}
