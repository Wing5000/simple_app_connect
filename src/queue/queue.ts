import { Queue, Worker, QueueEvents, JobsOptions } from 'bullmq';
import { cfg } from '../services/config.js';
import IORedis from 'ioredis';
import type { FastifyBaseLogger } from 'fastify';
import { processRequestOnce } from '../modules/airdrop/service.js';

let queue: Queue | null = null;

export async function connectQueue(log: FastifyBaseLogger) {
  if (!cfg.redisUrl) {
    log.warn('REDIS_URL not set – queue disabled, using on-demand processing only');
    return;
  }
  const connection = new IORedis(cfg.redisUrl);
  queue = new Queue('airdrop', { connection });
  const worker = new Worker(
    'airdrop',
    async (job) => {
      const { requestId } = job.data as { requestId: string };
      await processRequestOnce(requestId, log);
      // Jeśli są dalsze batch’e – requeue
      await job.updateProgress(100);
      return true;
    },
    { connection, concurrency: 1 }
  );
  const events = new QueueEvents('airdrop', { connection });
  events.on('error', (e) => log.error(e, 'Queue error'));
  worker.on('failed', (job, err) => log.error({ jobId: job?.id, err }, 'Job failed'));
  worker.on('completed', async (job) => {
    log.info({ jobId: job.id }, 'Job completed (one batch)');
  });
}

export async function enqueueAirdrop(requestId: string, opts?: JobsOptions) {
  if (!queue) return; // fallback: bez kolejki (np. testy) – można odpalić ręcznie processRequestOnce
  await queue.add('airdrop', { requestId }, { removeOnComplete: 100, removeOnFail: 100, ...(opts ?? {}) });
}
