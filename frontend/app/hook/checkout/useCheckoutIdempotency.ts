import { useCallback, useEffect, useRef } from "react";
import { createIdempotencyKey } from "~/utils/idempotency";

type FinalOrderStatus = "APPROVED" | "REJECTED";
type CheckoutAttemptStatus = "SENDING" | "PROCESSING" | "FAILED" | FinalOrderStatus;

export function useCheckoutIdempotency(itemsSignature: string) {
  const currentKeyRef = useRef<string | null>(null);
  const currentKeyItemsSignatureRef = useRef<string | null>(null);
  const activeAttemptStatusRef = useRef<CheckoutAttemptStatus | null>(null);
  const lastFinalizedItemsSignatureRef = useRef<string | null>(null);

  useEffect(() => {
    if (
      lastFinalizedItemsSignatureRef.current !== null &&
      lastFinalizedItemsSignatureRef.current !== itemsSignature
    ) {
      currentKeyRef.current = null;
      currentKeyItemsSignatureRef.current = null;
      activeAttemptStatusRef.current = null;
      lastFinalizedItemsSignatureRef.current = null;
    }
  }, [itemsSignature]);

  const getOrCreateKey = useCallback(() => {
    if (
      currentKeyRef.current !== null &&
      currentKeyItemsSignatureRef.current !== itemsSignature &&
      activeAttemptStatusRef.current !== "SENDING" &&
      activeAttemptStatusRef.current !== "PROCESSING"
    ) {
      currentKeyRef.current = null;
      currentKeyItemsSignatureRef.current = null;
      activeAttemptStatusRef.current = null;
    }

    if (currentKeyRef.current === null) {
      currentKeyRef.current = createIdempotencyKey();
      currentKeyItemsSignatureRef.current = itemsSignature;
    }

    return currentKeyRef.current;
  }, [itemsSignature]);

  const syncAttemptStatus = useCallback(
    (status: CheckoutAttemptStatus) => {
      activeAttemptStatusRef.current = status;

      if (status === "APPROVED" || status === "REJECTED") {
        currentKeyRef.current = null;
        currentKeyItemsSignatureRef.current = null;
        activeAttemptStatusRef.current = null;
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
