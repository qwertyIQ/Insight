import { describe, expect, it } from "vitest";
import type { IntelligenceSignal } from "@insight/intelligence";
import { generateReportFromSignals } from "../src/report/ReportGenerator";
import { renderMarkdown } from "../src/report/MarkdownRenderer";
import { renderHtml } from "../src/report/HtmlRenderer";
import { renderJson } from "../src/report/JsonRenderer";

const SIGNALS: IntelligenceSignal[] = [
  {
    id: "s1",
    type: "ecosystem-growth",
    title: "Test Signal A",
    description: "Signal A description",
    confidence: 0.75,
    evidenceIds: ["e1"],
    supportingEvidence: [{ evidenceId: "e1", relationship: "supports", weight: 0.8 }],
    timestamp: 1650000000000,
  },
  {
    id: "s2",
    type: "protocol-momentum",
    title: "Test Signal B",
    description: "Signal B description",
    confidence: 0.42,
    evidenceIds: ["e2", "e3"],
    supportingEvidence: [
      { evidenceId: "e2", relationship: "supports", weight: 0.4 },
      { evidenceId: "e3", relationship: "correlates", weight: 0.3 },
    ],
    timestamp: 1650000001000,
  },
];

describe("ReportGenerator — deterministic outputs", () => {
  it("generates a renderable report", () => {
    const report = generateReportFromSignals(SIGNALS, { generatedAt: "2026-08-07T00:00:00.000Z" });
    expect(report.id).toContain("report-");
    expect(report.signals.length).toBe(2);
    expect(report.sections.findings[0]).toContain("Test Signal A");
  });

  it("renders markdown without throwing and contains titles", () => {
    const report = generateReportFromSignals(SIGNALS, { generatedAt: "2026-08-07T00:00:00.000Z" });
    const md = renderMarkdown(report);
    expect(md).toContain("# Signals Report");
    expect(md).toContain("Test Signal A");
  });

  it("renders html and contains an h1", () => {
    const report = generateReportFromSignals(SIGNALS, { generatedAt: "2026-08-07T00:00:00.000Z" });
    const html = renderHtml(report);
    expect(html).toContain("<h1>");
    expect(html).toContain("Test Signal B");
  });

  it("renders stable json that parses", () => {
    const report = generateReportFromSignals(SIGNALS, { generatedAt: "2026-08-07T00:00:00.000Z" });
    const j = renderJson(report);
    const parsed = JSON.parse(j);
    expect(parsed.signals.length).toBe(2);
  });
});
