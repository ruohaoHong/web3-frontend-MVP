export function humanizeWeb3Error(err: unknown): string {
  if (!err) return "Something went wrong. Please try again.";

  const e = err as {
    name?: string;
    shortMessage?: string;
    message?: string;
    cause?: unknown;
  };

  const name = (e.name ?? "").toLowerCase();
  const msg = e.shortMessage ?? e.message ?? "";

  // User rejected actions
  if (name.includes("userrejected") || /rejected/i.test(msg)) {
    return "User rejected the request in the wallet.";
  }

  // Reverts / failed execution
  if (/execution reverted/i.test(msg) || /revert/i.test(msg)) {
    return "Transaction reverted. Please check inputs and try again.";
  }

  if (/insufficient funds/i.test(msg)) {
    return "Insufficient funds to pay for gas.";
  }

  // Generic fallback
  return msg || "Something went wrong. Please try again.";
}
