# Prompt 30: Redis Job Queue Adapter

## Context

The job queue in `src/lib/scale/index.ts` is in-memory only, with a comment at line 87: `JOB QUEUE IMPLEMENTATION (In-Memory — Redis adapter planned)`. This means all queued jobs are lost on process restart, no horizontal scaling is possible, and there's no persistence or visibility. The codebase already uses Redis elsewhere (`src/lib/database.ts` has Redis client setup).

## Current State

```
src/lib/scale/index.ts       ← In-memory JobQueue class (~200 lines), full API surface
                                 - registerHandler(), enqueue(), start(), stop()
                                 - Retry with exponential backoff
                                 - Dead letter queue (in-memory)
                                 - Metrics (pending, active, completed, failed, dead, throughput)
                                 - Concurrency control
src/lib/database.ts           ← Redis client exists (ioredis or upstash)
src/lib/inngest/              ← Inngest is also used for some background jobs
```

## Task

### Phase 1: Abstract Queue Interface

1. **Create `src/lib/scale/queue-interface.ts`** — Common interface both adapters implement

```typescript
export interface QueueAdapter {
  enqueue<T>(type: string, data: T, options?: EnqueueOptions): Promise<string>;
  dequeue(type: string, count?: number): Promise<Job[]>;
  ack(jobId: string): Promise<void>;
  nack(jobId: string, error: string): Promise<void>;
  moveToDeadLetter(jobId: string): Promise<void>;
  getMetrics(): Promise<QueueMetrics>;
  getJob(jobId: string): Promise<Job | null>;
  getDeadLetterJobs(limit?: number): Promise<Job[]>;
  retryDeadLetterJob(jobId: string): Promise<void>;
  purgeDeadLetter(): Promise<number>;
  size(type?: string): Promise<number>;
}
```

### Phase 2: Redis Adapter

2. **Create `src/lib/scale/redis-queue.ts`** — BullMQ-compatible Redis queue

```typescript
import { Redis } from 'ioredis';

export class RedisQueueAdapter implements QueueAdapter {
  private redis: Redis;
  private prefix = 'fcn:queue:';

  constructor(redis: Redis) { ... }

  // Uses Redis sorted sets for scheduling:
  // - {prefix}:pending:{type}    — sorted set (score = priority/timestamp)
  // - {prefix}:active            — set of currently processing job IDs
  // - {prefix}:dead              — sorted set of dead letter jobs
  // - {prefix}:job:{id}          — hash with job data
  // - {prefix}:metrics           — hash with counters

  async enqueue<T>(type: string, data: T, options?: EnqueueOptions): Promise<string> {
    // MULTI: HSET job data + ZADD to pending set
    // Support: delay, priority, deduplication key
  }

  async dequeue(type: string, count = 1): Promise<Job[]> {
    // ZPOPMIN from pending, SADD to active
    // Use BRPOPLPUSH for blocking dequeue if needed
  }

  async ack(jobId: string): Promise<void> {
    // SREM from active, DEL job data, HINCRBY metrics
  }

  async nack(jobId: string, error: string): Promise<void> {
    // Increment attempt count
    // If attempts < maxAttempts: ZADD back to pending with backoff delay
    // If attempts >= maxAttempts: moveToDeadLetter
  }
}
```

### Phase 3: Refactor In-Memory Adapter

3. **Create `src/lib/scale/memory-queue.ts`** — Extract existing logic to implement `QueueAdapter`

```typescript
export class MemoryQueueAdapter implements QueueAdapter {
  // Move existing Map-based logic from JobQueue class into this adapter
}
```

### Phase 4: Update JobQueue to Use Adapters

4. **Refactor `src/lib/scale/index.ts`** — `JobQueue` takes an adapter parameter

```typescript
class JobQueue {
  private adapter: QueueAdapter;

  constructor(
    config: Partial<JobQueueConfig> & { adapter?: QueueAdapter } = {},
  ) {
    // Default to MemoryQueueAdapter
    // Use RedisQueueAdapter if REDIS_URL is set
    this.adapter =
      config.adapter ??
      (process.env.REDIS_URL
        ? new RedisQueueAdapter(getRedisClient())
        : new MemoryQueueAdapter());
  }
}
```

### Phase 5: Queue Dashboard API

5. **Create `src/app/api/admin/queue/route.ts`** — Queue management endpoints (admin only)

```
GET    /api/admin/queue              — Queue metrics (pending, active, failed, dead)
GET    /api/admin/queue/dead         — List dead letter jobs
POST   /api/admin/queue/dead/retry   — Retry specific dead letter job
DELETE /api/admin/queue/dead         — Purge dead letter queue
```

### Phase 6: Tests

6. **Create `src/lib/scale/__tests__/redis-queue.test.ts`** — Redis adapter tests (use ioredis-mock or testcontainers)
7. **Create `src/lib/scale/__tests__/memory-queue.test.ts`** — Memory adapter tests
8. **Create `src/lib/scale/__tests__/queue-interface.test.ts`** — Contract tests that both adapters must pass

```typescript
// Shared test suite run against both adapters
describe.each([
  ['MemoryQueueAdapter', () => new MemoryQueueAdapter()],
  ['RedisQueueAdapter', () => new RedisQueueAdapter(mockRedis)],
])('%s', (name, factory) => {
  it('enqueues and dequeues a job', async () => { ... });
  it('retries failed jobs with backoff', async () => { ... });
  it('moves to dead letter after max attempts', async () => { ... });
  it('tracks metrics correctly', async () => { ... });
});
```

## Packages to Install

```bash
pnpm add ioredis
pnpm add -D ioredis-mock
```

## Acceptance Criteria

- [ ] Redis adapter implements full QueueAdapter interface
- [ ] Jobs survive process restart when Redis adapter is active
- [ ] Exponential backoff retry works via Redis sorted set scores
- [ ] Dead letter queue is inspectable and retryable
- [ ] Automatic fallback to in-memory adapter when no REDIS_URL
- [ ] Queue metrics available via admin API
- [ ] Both adapters pass identical contract test suite
- [ ] No behavioral change for existing callers (backward compatible)
