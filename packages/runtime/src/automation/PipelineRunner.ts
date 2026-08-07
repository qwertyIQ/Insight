import type { SnapshotStore } from "./SnapshotStore";
import type { Clock } from "./Clock";
import type { IntelligenceSignal } from "@insight/intelligence";
import type { SnapshotRecord } from "./AutomationTypes";

/** Minimal collaborator interfaces so PipelineRunner doesn't depend on implementation details */
export interface EvidenceCollector {
  collect(): Promise<unknown[]>; // opaque evidence items
}

export interface SignalEngine {
  generate(evidence: unknown[]): Promise<IntelligenceSignal[]>;
}

export interface ReportGenerator {
  generate(
    signals: IntelligenceSignal[],
    opts?: { generatedAt?: string },
  ): Promise<{ id: string; title: string } & Record<string, unknown>>;
}

export class PipelineRunner {
  private readonly collector: EvidenceCollector;
  private readonly signalEngine: SignalEngine;
  private readonly reportGenerator: ReportGenerator;
  private readonly snapshotStore: SnapshotStore;
  private readonly clock: Clock;

  constructor(
    collector: EvidenceCollector,
    signalEngine: SignalEngine,
    reportGenerator: ReportGenerator,
    snapshotStore: SnapshotStore,
    clock: Clock,
  ) {
    this.collector = collector;
    this.signalEngine = signalEngine;
    this.reportGenerator = reportGenerator;
    this.snapshotStore = snapshotStore;
    this.clock = clock;
  }

  /** Run the pipeline once: collect, signal, report, store snapshot. */
  async runOnce(): Promise<SnapshotRecord> {
    const evidence = await this.collector.collect();
    const signals = await this.signalEngine.generate(evidence);
    const report = await this.reportGenerator.generate(signals, { generatedAt: this.clock.now() });

    const snapshot: SnapshotRecord = this.snapshotStore.save({
      id: `snapshot-${Date.now()}`,
      reportId: String(report.id),
      reportTitle: String(report.title),
      signals,
      generatedAt: this.clock.now(),
    });

    return snapshot;
  }
}
