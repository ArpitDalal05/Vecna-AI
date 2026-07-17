import { executionQueue, Job } from "./executionQueue";
import { toolManager } from "../../tools/toolManager";
import { logger } from "../../services/logging/logger";

export class JobScheduler {
  private activeJobsCount = 0;
  private maxConcurrency = 3;

  schedule(name: string, args: any, priority: Job["priority"] = "MEDIUM"): Job {
    const job: Job = {
      id: `job_${Math.random().toString(36).substring(2, 9)}`,
      name,
      args,
      priority,
      status: "QUEUED",
      retries: 0,
      maxRetries: 3
    };

    executionQueue.enqueue(job);
    logger.info("SCHEDULER", "JOB_ENQUEUED", `Job "${name}" (${job.id}) enqueued with priority ${priority}.`);
    
    this.processNext();

    return job;
  }

  private async processNext() {
    if (this.activeJobsCount >= this.maxConcurrency) return;

    const nextJob = executionQueue.dequeue();
    if (!nextJob) return;

    this.activeJobsCount++;
    executionQueue.updateStatus(nextJob.id, "RUNNING");
    logger.info("SCHEDULER", "JOB_START", `Starting execution of job "${nextJob.name}" (${nextJob.id}).`);

    try {
      await toolManager.executeTool(nextJob.name, nextJob.args);
      executionQueue.updateStatus(nextJob.id, "COMPLETED");
      logger.info("SCHEDULER", "JOB_SUCCESS", `Job "${nextJob.name}" (${nextJob.id}) completed successfully.`);
    } catch (err: any) {
      logger.error("SCHEDULER", "JOB_FAIL", `Job "${nextJob.name}" (${nextJob.id}) failed: ${err.message}.`);
      
      if (nextJob.retries < nextJob.maxRetries) {
        nextJob.retries++;
        nextJob.status = "QUEUED";
        logger.warn("SCHEDULER", "JOB_RETRY", `Retrying job "${nextJob.name}" (${nextJob.id}) - attempt ${nextJob.retries}/${nextJob.maxRetries}.`);
      } else {
        executionQueue.updateStatus(nextJob.id, "FAILED");
      }
    } finally {
      this.activeJobsCount--;
      this.processNext();
    }
  }
}

export const jobScheduler = new JobScheduler();
export default jobScheduler;
