export function createFallbackIdempotencyKey() {
  const secret = process.env.IDEMPOTENCY_KEY_SECRET || "fallback-secret";
  const timestampPart = Date.now().toString(36);
  const randomPart = Math.random().toString(36).slice(2);

  return `${secret}-${timestampPart}-${randomPart}`;
}

export function createIdempotencyKey() {
  return globalThis.crypto?.randomUUID?.() ?? createFallbackIdempotencyKey();
}