export interface Job {
  id: string;
  name: string;
  args: any;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED";
  retries: number;
  maxRetries: number;
}

export class ExecutionQueue {
  private queue: Job[] = [];

  enqueue(job: Job) {
    this.queue.push(job);
    this.sortQueue();
  }

  dequeue(): Job | undefined {
    return this.queue.find(j => j.status === "QUEUED");
  }

  getJobs(): Job[] {
    return [...this.queue];
  }

  updateStatus(id: string, status: Job["status"]) {
    const job = this.queue.find(j => j.id === id);
    if (job) job.status = status;
  }

  private sortQueue() {
    const priorityMap = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
    this.queue.sort((a, b) => priorityMap[b.priority] - priorityMap[a.priority]);
  }
}

export const executionQueue = new ExecutionQueue();
export default executionQueue;
