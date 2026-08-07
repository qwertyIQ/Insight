import type { IntelligenceSignal } from "@insight/intelligence";

/** Minimal renderable report produced from intelligence signals. */
export interface RenderableReport {
  id: string;
  title: string;
  sections: {
    thesis: string;
    findings: string[];
    recommendations: string[];
  };
  signals: IntelligenceSignal[];
  generatedAt: string; // ISO timestamp
}

export type RenderOptions = { id?: string; title?: string; generatedAt?: string };
