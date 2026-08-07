import type { Clock } from "./Clock";
import { Scheduler } from "./Scheduler";
import type { SnapshotStore } from "./SnapshotStore";
import type { PipelineRunner } from "./PipelineRunner";
import type { AutomationStatus, SnapshotRecord } from "./AutomationTypes";
import { Job } from "./Job";

/** Facade coordinating scheduler, pipeline runner and snapshot store. */
export class AutomationEngine {
  private readonly scheduler: Scheduler;
  private readonly pipelineRunner: PipelineRunner;
  private readonly snapshotStore: SnapshotStore;
  private readonly clock: Clock;
  private latest?: SnapshotRecord;

  constructor(
    scheduler: Scheduler,
    pipelineRunner: PipelineRunner,
    snapshotStore: SnapshotStore,
    clock: Clock,
  ) {
    this.scheduler = scheduler;
    this.pipelineRunner = pipelineRunner;
    this.snapshotStore = snapshotStore;
    this.clock = clock;
  }

  start(): void {
    this.scheduler.start();
  }

  stop(): void {
    this.scheduler.stop();
  }

  async runOnce(): Promise<SnapshotRecord> {
    const snapshot = await this.pipelineRunner.runOnce();
    this.latest = snapshot;
    return snapshot;
  }

  latestReport(): SnapshotRecord | undefined {
    return this.latest ?? this.snapshotStore.latest();
  }

  history(): SnapshotRecord[] {
    return this.snapshotStore.history();
  }

  status(): AutomationStatus {
    return {
      scheduler: this.scheduler.isRunning() ? "running" : "idle",
      lastRun: this.latest?.generatedAt,
    };
  }
}
