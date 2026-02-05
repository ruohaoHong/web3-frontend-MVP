"use client";

import { useMemo } from "react";
import { useWaitForTransactionReceipt, type UseWaitForTransactionReceiptParameters } from "wagmi";

export type TxLifecycleStatus = "idle" | "pending" | "success" | "error";

function humanizeReceiptError(err: unknown): string {
  if (!err) return "Transaction failed. Please try again.";
  const e = err as { shortMessage?: string; message?: string };
  const msg = e.shortMessage ?? e.message ?? "";

  if (/reverted/i.test(msg) || /execution reverted/i.test(msg)) {
    return "Transaction reverted on-chain.";
  }
  if (/not found/i.test(msg)) {
    return "Transaction not found yet. Explorer may be lagging.";
  }
  return msg || "Transaction failed. Please try again.";
}

export function useTxState(params: {
  hash: `0x${string}` | null;
  chainId: number | null;
  onReplaced?: NonNullable<UseWaitForTransactionReceiptParameters["onReplaced"]>;
}) {
  const { hash, chainId, onReplaced } = params;

  const receiptQuery = useWaitForTransactionReceipt({
    hash: hash ?? undefined,
    chainId: chainId ?? undefined,
    confirmations: 1,
    onReplaced,
    query: { enabled: Boolean(hash && chainId) },
  });

  const status: TxLifecycleStatus = useMemo(() => {
    if (!hash || !chainId) return "idle";
    if (receiptQuery.isLoading) return "pending";
    if (receiptQuery.isSuccess) return "success";
    if (receiptQuery.isError) return "error";
    return "pending";
  }, [hash, chainId, receiptQuery.isLoading, receiptQuery.isSuccess, receiptQuery.isError]);

  const errorMessage = useMemo(() => {
    if (!receiptQuery.error) return null;
    return humanizeReceiptError(receiptQuery.error);
  }, [receiptQuery.error]);

  return {
    status,
    receipt: receiptQuery.data ?? null,
    errorMessage,
  };
}