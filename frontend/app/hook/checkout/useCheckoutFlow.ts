import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CHECKOUT_FALLBACK_ERROR_MESSAGE, getOrder, postCheckout } from "../../utils/checkout/api";
import {
  buildCheckoutItemsSignature,
  calculateCheckoutTotal,
  createInvalidQuantityOrder,
  getCheckoutButtonDisabled,
  getCheckoutMessageTone,
  getCheckoutQuantityStatus,
  toCheckoutErrorOrder,
  type CheckoutDisplayOrder,
  type CheckoutMessageTone,
} from "../../utils/checkout/view-model";
import { useCheckoutIdempotency } from "~/hook/checkout/useCheckoutIdempotency";

type CheckoutProduct = {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
};

type UseCheckoutFlowParams = {
  product: CheckoutProduct;
};

export type CheckoutFlow = {
  product: CheckoutProduct;
  quantity: number;
  totalPrice: number;
  checkoutOrder: CheckoutDisplayOrder | null;
  checkoutMessageTone: CheckoutMessageTone;
  isSubmittingCheckout: boolean;
  isCheckoutButtonDisabled: boolean;
  canDecrementQuantity: boolean;
  incrementQuantity: () => void;
  decrementQuantity: () => void;
  submitCheckout: () => void;
};

export function useCheckoutFlow({ product }: UseCheckoutFlowParams): CheckoutFlow {
  const [quantity, setQuantity] = useState(1);
  const [isSubmittingCheckout, setIsSubmittingCheckout] = useState(false);
  const [checkoutOrder, setCheckoutOrder] =
    useState<CheckoutDisplayOrder | null>(null);
  const isCheckoutSubmitLockedRef = useRef(false);

  const checkoutItemsSignature = buildCheckoutItemsSignature(product.id, quantity);
  const checkoutIdempotency = useCheckoutIdempotency(checkoutItemsSignature);
  const quantityStatus = getCheckoutQuantityStatus(quantity);
  const isOrderProcessing = checkoutOrder?.status === "PROCESSING";
  const totalPrice = calculateCheckoutTotal(product, quantity);
  const isCheckoutButtonDisabled = getCheckoutButtonDisabled({
    isQuantityValid: quantityStatus.isValid,
    isSubmittingCheckout,
    isOrderProcessing,
  });
  const checkoutMessageTone = checkoutOrder
    ? getCheckoutMessageTone(checkoutOrder)
    : "error";
  const processingOrderId = isOrderProcessing ? checkoutOrder.order_id : null;

  const orderStatusQuery = useQuery({
    queryKey: ["checkout-order", processingOrderId],
    queryFn: () => getOrder(processingOrderId ?? ""),
    enabled: Boolean(processingOrderId) && isOrderProcessing,
    refetchInterval: (query) => {
      const order = query.state.data;

      return order?.status === "PROCESSING" ? 2000 : false;
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: postCheckout,
    onSuccess: (order) => {
      setCheckoutOrder(order);
      checkoutIdempotency.syncAttemptStatus(order.status);
    },
    onError: (error) => {
      checkoutIdempotency.syncAttemptStatus("FAILED");
      setCheckoutOrder(toCheckoutErrorOrder(error));
    },
    onSettled: () => {
      isCheckoutSubmitLockedRef.current = false;
      setIsSubmittingCheckout(false);
    },
  });

  useEffect(() => {
    if (!orderStatusQuery.data) {
      return;
    }

    setCheckoutOrder(orderStatusQuery.data);
    checkoutIdempotency.syncAttemptStatus(orderStatusQuery.data.status);
  }, [orderStatusQuery.data, checkoutIdempotency]);

  useEffect(() => {
    if (!orderStatusQuery.error || !isOrderProcessing) {
      return;
    }

    checkoutIdempotency.syncAttemptStatus("FAILED");
    setCheckoutOrder(toCheckoutErrorOrder(new Error(CHECKOUT_FALLBACK_ERROR_MESSAGE)));
  }, [orderStatusQuery.error, isOrderProcessing, checkoutIdempotency]);

  const decrementQuantity = useCallback(() => {
    setQuantity((current) => Math.max(1, current - 1));
  }, []);

  const incrementQuantity = useCallback(() => {
    setQuantity((current) => current + 1);
  }, []);

  const submitCheckout = useCallback(() => {
    if (!quantityStatus.isValid) {
      setCheckoutOrder(createInvalidQuantityOrder());
      return;
    }

    if (
      isCheckoutSubmitLockedRef.current ||
      isSubmittingCheckout ||
      isOrderProcessing
    ) {
      return;
    }

    isCheckoutSubmitLockedRef.current = true;
    const idempotencyKey = checkoutIdempotency.getOrCreateKey();

    setIsSubmittingCheckout(true);
    setCheckoutOrder(null);
    checkoutIdempotency.syncAttemptStatus("SENDING");

    checkoutMutation.mutate({
      productId: product.id,
      quantity,
      idempotencyKey,
    });
  }, [
    checkoutIdempotency,
    checkoutMutation,
    isOrderProcessing,
    isSubmittingCheckout,
    product.id,
    quantity,
    quantityStatus.isValid,
  ]);

  return {
    product,
    quantity,
    totalPrice,
    checkoutOrder,
    checkoutMessageTone,
    isSubmittingCheckout,
    isCheckoutButtonDisabled,
    canDecrementQuantity: quantityStatus.canDecrement,
    incrementQuantity,
    decrementQuantity,
    submitCheckout,
  };
}
