import type { SnapshotRecord, Timestamp } from "./AutomationTypes";
import type { Clock } from "./Clock";

export interface SnapshotStore {
  save(record: Omit<SnapshotRecord, "generatedAt"> & { generatedAt?: Timestamp }): SnapshotRecord;
  latest(): SnapshotRecord | undefined;
  history(): SnapshotRecord[];
  clear(): void;
  limit(max: number): void;
}

export class InMemorySnapshotStore implements SnapshotStore {
  private readonly clock: Clock;
  private snapshots: SnapshotRecord[] = [];
  private maxSnapshots = Infinity;

  constructor(clock: Clock) {
    this.clock = clock;
  }

  save(record: Omit<SnapshotRecord, "generatedAt"> & { generatedAt?: Timestamp }): SnapshotRecord {
    const generatedAt = record.generatedAt ?? this.clock.now();
    const saved: SnapshotRecord = { ...record, generatedAt };
    this.snapshots.push(saved);
    if (this.snapshots.length > this.maxSnapshots)
      this.snapshots = this.snapshots.slice(-this.maxSnapshots);
    return saved;
  }

  latest(): SnapshotRecord | undefined {
    return this.snapshots[this.snapshots.length - 1];
  }

  history(): SnapshotRecord[] {
    return [...this.snapshots];
  }

  clear(): void {
    this.snapshots = [];
  }

  limit(max: number): void {
    this.maxSnapshots = max;
    if (this.snapshots.length > max) this.snapshots = this.snapshots.slice(-max);
  }
}
