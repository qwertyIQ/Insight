import type { IntelligenceSignal } from "@insight/intelligence";

export type Timestamp = string; // ISO-8601

export interface SnapshotRecord {
  id: string;
  reportId: string;
  reportTitle: string;
  generatedAt: Timestamp;
  signals: IntelligenceSignal[];
}

export type JobId = string;

export interface JobDescriptor {
  id: JobId;
  name: string;
  enabled: boolean;
  intervalMs: number; // how often to run
}

export type SchedulerStatus = "idle" | "running" | "paused" | "stopped";

export interface AutomationStatus {
  scheduler: SchedulerStatus;
  lastRun?: Timestamp;
}
