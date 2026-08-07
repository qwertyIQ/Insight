import type { Job } from "./Job";

export class JobRegistry {
  private readonly jobs = new Map<string, Job>();

  register(job: Job) {
    this.jobs.set(job.id, job);
  }

  unregister(id: string) {
    this.jobs.delete(id);
  }

  get(id: string): Job | undefined {
    return this.jobs.get(id);
  }

  list(): Job[] {
    return Array.from(this.jobs.values());
  }

  async run(id: string): Promise<void> {
    const job = this.jobs.get(id);
    if (job && job.enabled) await job.run();
  }

  async runAll(): Promise<void> {
    for (const job of this.jobs.values()) {
      if (job.enabled) await job.run();
    }
  }
}
