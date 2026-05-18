type RateLimitEntry = {
    count: number;
    resetAt: number;
  };
  
  const WINDOW_MS = 10 * 60 * 1000;
  const MAX_REQUESTS = 5;
  
  const buckets = new Map<string, RateLimitEntry>();
  
  export function checkRateLimit(key: string) {
    const now = Date.now();
  
    for (const [bucketKey, entry] of buckets.entries()) {
      if (entry.resetAt <= now) {
        buckets.delete(bucketKey);
      }
    }
  
    const bucketKey = key || 'unknown';
    const existing = buckets.get(bucketKey);
  
    if (!existing) {
      buckets.set(bucketKey, {
        count: 1,
        resetAt: now + WINDOW_MS,
      });
  
      return {
        allowed: true,
        remaining: MAX_REQUESTS - 1,
      };
    }
  
    if (existing.count >= MAX_REQUESTS) {
      return {
        allowed: false,
        retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
      };
    }
  
    existing.count += 1;
    buckets.set(bucketKey, existing);
  
    return {
      allowed: true,
      remaining: MAX_REQUESTS - existing.count,
    };
  }


  