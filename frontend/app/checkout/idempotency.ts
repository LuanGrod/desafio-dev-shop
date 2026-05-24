import { useCallback, useEffect, useRef } from "react";

type FinalOrderStatus = "APPROVED" | "REJECTED";
type CheckoutAttemptStatus = "SENDING" | "PROCESSING" | FinalOrderStatus;

function createFallbackIdempotencyKey() {
  const timestampPart = Date.now().toString(36);
  const randomPart = Math.random().toString(36).slice(2);

  return `checkout-${timestampPart}-${randomPart}`;
}

export function createCheckoutIdempotencyKey() {
  return globalThis.crypto?.randomUUID?.() ?? createFallbackIdempotencyKey();
}

export function useCheckoutIdempotency(itemsSignature: string) {
  const currentKeyRef = useRef<string | null>(null);
  const lastFinalizedItemsSignatureRef = useRef<string | null>(null);

  useEffect(() => {
    if (
      lastFinalizedItemsSignatureRef.current !== null &&
      lastFinalizedItemsSignatureRef.current !== itemsSignature
    ) {
      currentKeyRef.current = null;
      lastFinalizedItemsSignatureRef.current = null;
    }
  }, [itemsSignature]);

  const getOrCreateKey = useCallback(() => {
    currentKeyRef.current ??= createCheckoutIdempotencyKey();
    return currentKeyRef.current;
  }, []);

  const syncAttemptStatus = useCallback(
    (status: CheckoutAttemptStatus) => {
      if (status === "APPROVED" || status === "REJECTED") {
        currentKeyRef.current = null;
        lastFinalizedItemsSignatureRef.current = itemsSignature;
      }
    },
    [itemsSignature],
  );

  return {
    getOrCreateKey,
    syncAttemptStatus,
  };
}
