export interface Clock {
  now(): string; // ISO timestamp
  onTick(cb: (now: string) => void): { dispose(): void };
}

/** SystemClock uses setInterval under the hood. Tests should use MockClock. */
export class SystemClock implements Clock {
  private readonly intervalMs: number;
  private readonly listeners = new Set<(now: string) => void>();
  private timer?: NodeJS.Timer;

  constructor(intervalMs = 1000) {
    this.intervalMs = intervalMs;
  }

  now(): string {
    return new Date().toISOString();
  }

  onTick(cb: (now: string) => void) {
    this.listeners.add(cb);
    if (!this.timer) {
      this.timer = setInterval(() => {
        const t = this.now();
        for (const l of this.listeners) l(t);
      }, this.intervalMs);
    }
    return { dispose: () => this.listeners.delete(cb) };
  }
}

/** MockClock is fully controllable for deterministic tests. */
export class MockClock implements Clock {
  private current: number;
  private readonly listeners = new Set<(now: string) => void>();

  constructor(startIso = "1970-01-01T00:00:00.000Z") {
    this.current = Date.parse(startIso);
  }

  now(): string {
    return new Date(this.current).toISOString();
  }

  onTick(cb: (now: string) => void) {
    this.listeners.add(cb);
    return { dispose: () => this.listeners.delete(cb) };
  }

  /** Advance the clock by ms and notify listeners once. */
  advanceBy(ms: number) {
    this.current += ms;
    const t = this.now();
    for (const l of Array.from(this.listeners)) l(t);
  }

  /** Set absolute time (iso) and notify. */
  setTime(iso: string) {
    this.current = Date.parse(iso);
    const t = this.now();
    for (const l of Array.from(this.listeners)) l(t);
  }
}
