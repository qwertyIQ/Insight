import type { Clock } from "./Clock";
import type { Job } from "./Job";
import type { JobId, SchedulerStatus } from "./AutomationTypes";

/** Scheduler is deterministic given an injected Clock. It does not use wall-clock APIs directly. */
export class Scheduler {
  private readonly clock: Clock;
  private readonly jobs = new Map<JobId, { job: Job; lastRun?: number }>();
  private status: SchedulerStatus = "idle";
  private disposed?: { dispose(): void };

  constructor(clock: Clock) {
    this.clock = clock;
  }

  start(): void {
    if (this.status === "running") return;
    this.status = "running";
    this.disposed = this.clock.onTick((now) => this.onTick(now));
  }

  stop(): void {
    if (this.status === "stopped") return;
    this.status = "stopped";
    this.disposed?.dispose();
  }

  pause(): void {
    if (this.status !== "running") return;
    this.status = "paused";
    this.disposed?.dispose();
  }

  resume(): void {
    if (this.status !== "paused") return;
    this.status = "running";
    this.disposed = this.clock.onTick((now) => this.onTick(now));
  }

  isRunning(): boolean {
    return this.status === "running";
  }

  register(job: Job): void {
    this.jobs.set(job.id, { job });
  }

  unregister(id: JobId): void {
    this.jobs.delete(id);
  }

  /** Trigger a single run of the given job irrespective of scheduling. */
  async runOnce(id: JobId): Promise<void> {
    const entry = this.jobs.get(id);
    if (!entry) return;
    if (!entry.job.enabled) return;
    await entry.job.run();
    entry.lastRun = Date.now();
  }

  /** Returns ISO timestamp for next scheduled run across all jobs, if any */
  nextRun(): string | undefined {
    let earliest: number | undefined;
    for (const [_, entry] of this.jobs) {
      const interval = entry.job.intervalMs;
      const last = entry.lastRun ?? 0;
      const candidate = last + interval;
      if (earliest === undefined || candidate < earliest) earliest = candidate;
    }
    return earliest ? new Date(earliest).toISOString() : undefined;
  }

  private async onTick(nowIso: string) {
    if (this.status !== "running") return;
    const now = Date.parse(nowIso);
    for (const [id, entry] of Array.from(this.jobs)) {
      if (!entry.job.enabled) continue;
      const last = entry.lastRun ?? 0;
      if (now - last >= entry.job.intervalMs) {
        // run synchronously to preserve deterministic ordering
        // eslint-disable-next-line no-await-in-loop
        await entry.job.run();
        entry.lastRun = now;
      }
    }
  }
}
