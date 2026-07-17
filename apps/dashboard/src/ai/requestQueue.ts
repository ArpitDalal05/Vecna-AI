import { logger } from "../services/logging/logger";

export interface QueuedRequest {
  id: string;
  fn: () => Promise<any>;
  priority: number;
  retries: number;
  maxRetries: number;
  resolve: (value: any) => void;
  reject: (reason: any) => void;
}

export class RequestQueue {
  private queue: QueuedRequest[] = [];
  private activeCount = 0;
  private maxConcurrency = 2;

  enqueue<T>(fn: () => Promise<T>, priority = 0, maxRetries = 3): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const request: QueuedRequest = {
        id: `req_${Math.random().toString(36).substring(2, 9)}`,
        fn,
        priority,
        retries: 0,
        maxRetries,
        resolve,
        reject
      };
      this.queue.push(request);
      this.sort();
      this.processNext();
    });
  }

  private sort() {
    this.queue.sort((a, b) => b.priority - a.priority);
  }

  private async processNext() {
    if (this.activeCount >= this.maxConcurrency) return;

    const next = this.queue.shift();
    if (!next) return;

    this.activeCount++;
    try {
      const res = await next.fn();
      next.resolve(res);
    } catch (err: any) {
      if (next.retries < next.maxRetries) {
        next.retries++;
        const backoff = Math.pow(2, next.retries) * 500;
        logger.warn("QUEUE", "REQUEST_RETRY", `Retrying request ${next.id} inside queue - attempt ${next.retries}/${next.maxRetries}. Backoff: ${backoff}ms.`);
        setTimeout(() => {
          this.queue.push(next);
          this.sort();
          this.processNext();
        }, backoff);
      } else {
        next.reject(err);
      }
    } finally {
      this.activeCount--;
      this.processNext();
    }
  }

  getQueueSize(): number {
    return this.queue.length;
  }
}

export const requestQueue = new RequestQueue();
export default requestQueue;
