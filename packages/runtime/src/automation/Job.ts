import type { JobId } from "./AutomationTypes";

export interface Job {
  id: JobId;
  name: string;
  enabled: boolean;
  intervalMs: number;
  run(): Promise<void>;
}
