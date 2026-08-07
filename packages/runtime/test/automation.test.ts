import { describe, it, expect } from "vitest";
import { MockClock } from "../src/automation/Clock";
import { Scheduler } from "../src/automation/Scheduler";
import { InMemorySnapshotStore } from "../src/automation/SnapshotStore";
import { PipelineRunner } from "../src/automation/PipelineRunner";
import type { SnapshotRecord } from "../src/automation/AutomationTypes";
import { AutomationEngine } from "../src/automation/AutomationEngine";

// Mocks
class MockCollector {
  async collect() {
    return [{ id: "e1" }];
  }
}

class MockSignalEngine {
  async generate(evidence: unknown[]) {
    return [
      {
        id: "sig-1",
        type: "test",
        title: "Signal 1",
        description: "desc",
        confidence: 0.5,
        evidenceIds: ["e1"],
        supportingEvidence: [],
        timestamp: 1,
      },
    ];
  }
}

class MockReportGenerator {
  async generate(signals: any[], opts?: { generatedAt?: string }) {
    return { id: "r1", title: "Report 1", generatedAt: opts?.generatedAt };
  }
}

describe("Automation foundation — deterministic orchestration", () => {
  it("PipelineRunner runs and SnapshotStore stores deterministic records", async () => {
    const clock = new MockClock("2026-08-07T00:00:00.000Z");
    const store = new InMemorySnapshotStore(clock);
    const runner = new PipelineRunner(
      new MockCollector(),
      new MockSignalEngine(),
      new MockReportGenerator(),
      store,
      clock,
    );

    const snapshot = await runner.runOnce();
    expect(snapshot).toBeDefined();
    expect(snapshot.signals.length).toBe(1);
    expect(snapshot.generatedAt).toBe(clock.now());

    const latest = store.latest();
    expect(latest).toEqual(snapshot);
  });

  it("Scheduler triggers registered job at intervals deterministically", async () => {
    const clock = new MockClock("2026-08-07T00:00:00.000Z");
    const scheduler = new Scheduler(clock);

    let runs = 0;
    const job = {
      id: "job1",
      name: "test-job",
      enabled: true,
      intervalMs: 1000,
      async run() {
        runs += 1;
      },
    } as const;

    scheduler.register(job as any);
    scheduler.start();

    // advance clock 3 intervals, expect 3 runs
    clock.advanceBy(1000);
    clock.advanceBy(1000);
    clock.advanceBy(1000);

    expect(runs).toBe(3);
    scheduler.stop();
  });

  it("AutomationEngine runOnce stores latest and exposes history", async () => {
    const clock = new MockClock("2026-08-07T00:00:00.000Z");
    const store = new InMemorySnapshotStore(clock);
    const runner = new PipelineRunner(
      new MockCollector(),
      new MockSignalEngine(),
      new MockReportGenerator(),
      store,
      clock,
    );
    const scheduler = new Scheduler(clock);

    const engine = new AutomationEngine(scheduler, runner as any, store, clock);

    const snap = await engine.runOnce();
    expect(engine.latestReport()).toEqual(snap);

    const hist = engine.history();
    expect(hist.length).toBe(1);
  });
});
