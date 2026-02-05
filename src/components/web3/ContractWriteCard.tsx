"use client";

import { useMemo, useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { isAddress, parseUnits, type Address } from "viem";
import { Card } from "@/components/ui/Card";
import { erc20Abi } from "@/abi/erc20";
import { DEMO_ERC20_BY_CHAIN_ID } from "@/lib/constants";
import { TxStatus, type ReplacementReason } from "@/components/web3/TxStatus";
import { useTxState } from "@/hooks/useTxState";

type Notice = { kind: "error" | "success"; text: string } | null;

type SubmittedTx = {
  hash: `0x${string}`;
  chainId: number;
  originalHash?: `0x${string}`;
  replacementReason?: ReplacementReason;
};

function humanizeSubmitError(err: unknown): string {
  if (!err) return "Transaction failed. Please try again.";
  const e = err as { name?: string; shortMessage?: string; message?: string };
  const name = e.name ?? "";
  const msg = e.shortMessage ?? e.message ?? "";

  if (name.toLowerCase().includes("userrejected") || /rejected/i.test(msg)) {
    return "User rejected the transaction in the wallet.";
  }
  if (/insufficient funds/i.test(msg)) return "Insufficient funds to pay for gas.";
  if (/execution reverted/i.test(msg)) return "Transaction reverted. Check token, amount, and recipient.";
  return msg || "Transaction failed. Please try again.";
}

export function ContractWriteCard() {
  const { chain } = useAccount();
  const ZERO = BigInt(0);

  const [tokenInput, setTokenInput] = useState<string>("");
  const [tokenAddress, setTokenAddress] = useState<Address | null>(null);

  const [to, setTo] = useState<string>("");
  const [amount, setAmount] = useState<string>("");

  const [notice, setNotice] = useState<Notice>(null);

  // lifecycle state (single tx)
  const [isAwaitingWallet, setIsAwaitingWallet] = useState(false);
  const [submitted, setSubmitted] = useState<SubmittedTx | null>(null);

  const { writeContractAsync } = useWriteContract();

  const tokenInputValid = useMemo(() => isAddress(tokenInput), [tokenInput]);
  const toValid = useMemo(() => isAddress(to), [to]);

  const demoToken = useMemo(() => {
    const chainId = chain?.id;
    if (!chainId) return null;
    return DEMO_ERC20_BY_CHAIN_ID[chainId] ?? null;
  }, [chain?.id]);

  const amountWei = useMemo(() => {
    try {
      return parseUnits(amount.trim(), 18); // MVP: assume 18 decimals
    } catch {
      return null;
    }
  }, [amount]);

  const amountValid = Boolean(amountWei !== null && amountWei > ZERO);

  const canSubmit = Boolean(
    tokenAddress && toValid && amountValid && !isAwaitingWallet
  );

  const txState = useTxState({
    hash: submitted?.hash ?? null,
    chainId: submitted?.chainId ?? null,
    onReplaced: (r) => {
      // IMPORTANT: follow replacement tx hash so links/receipt don't get stuck on dropped hash
      setSubmitted((prev) => {
        if (!prev) return prev;
        const nextHash = r.transaction.hash as `0x${string}`;
        if (prev.hash === nextHash) return prev;

        const originalHash = (prev.originalHash ?? prev.hash) as `0x${string}`;
        return {
          ...prev,
          originalHash,
          hash: nextHash,
          replacementReason: r.reason,
        };
      });
    },
  });

  const isCancelledReplacement =
    Boolean(submitted?.replacementReason === "cancelled" && submitted?.originalHash && submitted?.originalHash !== submitted?.hash);

  // derived lifecycle for display
  const txKind =
    notice?.kind === "error" && !submitted
      ? "error"
      : isAwaitingWallet
        ? "pending"
        : isCancelledReplacement
          ? (txState.status === "pending" ? "pending" : "error")
          : txState.status === "pending"
            ? "pending"
            : txState.status === "success"
              ? "success"
              : txState.status === "error"
                ? "error"
                : "idle";

  const replacementHint =
    submitted?.originalHash && submitted.originalHash !== submitted.hash
      ? submitted.replacementReason === "repriced"
        ? "MetaMask sped up the transaction. Tracking the latest hash."
        : submitted.replacementReason === "cancelled"
          ? "MetaMask cancelled the transaction (replacement tx)."
          : "Transaction was replaced. Tracking the latest hash."
      : null;

  const txMessage =
    notice?.kind === "error" && !submitted
      ? notice.text
      : isAwaitingWallet
        ? "Awaiting wallet confirmation…"
        : isCancelledReplacement
          ? (txState.status === "pending"
              ? "Cancellation transaction submitted. Waiting for confirmation…"
              : "Transaction cancelled in wallet (replaced).")
          : txState.status === "pending"
            ? "Transaction submitted. Waiting for confirmation…"
            : txState.status === "success"
              ? "Confirmed on-chain."
              : txState.status === "error"
                ? txState.errorMessage ?? "Transaction failed."
                : null;

  function clearTxUI() {
    setNotice(null);
    setSubmitted(null);
    setIsAwaitingWallet(false);
  }

  function onLoadToken() {
    clearTxUI();

    if (!tokenInputValid) {
      setTokenAddress(null);
      setNotice({ kind: "error", text: "Invalid token address." });
      return;
    }
    setTokenAddress(tokenInput as Address);
  }

  function onUseDemoToken() {
    clearTxUI();

    if (!demoToken) {
      setNotice({
        kind: "error",
        text: "No demo token configured for the current network.",
      });
      return;
    }
    setTokenInput(demoToken);
    setTokenAddress(demoToken);
  }

  function onClearToken() {
    clearTxUI();
    setTokenInput("");
    setTokenAddress(null);
  }

  async function onTransfer() {
    setNotice(null);
    setSubmitted(null);

    if (!tokenAddress) {
      setNotice({ kind: "error", text: "Load a token address first." });
      return;
    }
    if (!toValid) {
      setNotice({ kind: "error", text: "Recipient address is invalid." });
      return;
    }
    if (!amountWei || amountWei <= ZERO) {
      setNotice({ kind: "error", text: "Amount must be a valid number > 0." });
      return;
    }
    if (!chain?.id) {
      setNotice({ kind: "error", text: "Unknown chain. Please reconnect wallet." });
      return;
    }

    setIsAwaitingWallet(true);
    try {
      const hash = await writeContractAsync({
        abi: erc20Abi,
        address: tokenAddress,
        functionName: "transfer",
        args: [to as Address, amountWei],
      });

      setSubmitted({ hash, chainId: chain.id });
      setNotice({ kind: "success", text: "Transaction submitted." });
    } catch (err) {
      // user rejected / failed before a tx hash exists
      setNotice({ kind: "error", text: humanizeSubmitError(err) });
    } finally {
      setIsAwaitingWallet(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card title="Contract Write (ERC20 transfer)">
        <div className="space-y-3 text-sm">
          <div className="space-y-1">
            <label className="text-black/60">Token address</label>
            <input
              value={tokenInput}
              onChange={(e) => {
                setTokenInput(e.target.value.trim());
                clearTxUI();
              }}
              placeholder="0x… (ERC20 contract address)"
              className="w-full rounded-lg border border-black/10 px-3 py-2 outline-none focus:ring-2 focus:ring-black/10"
              spellCheck={false}
            />
            <div className="text-xs text-black/50">
              Token addresses are chain-specific. Amount assumes{" "}
              <span className="font-medium">18 decimals</span>.
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onLoadToken}
              className="rounded-lg border border-black/10 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!tokenInputValid}
            >
              Load
            </button>

            <button
              type="button"
              onClick={onUseDemoToken}
              className="rounded-lg border border-black/10 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!demoToken}
            >
              Use demo token
            </button>

            <button
              type="button"
              onClick={onClearToken}
              className="rounded-lg border border-black/10 px-3 py-2"
            >
              Clear
            </button>
          </div>

          {tokenAddress ? (
            <div className="rounded-lg border border-black/10 bg-black/5 p-3">
              <div className="text-xs text-black/60">Active token</div>
              <div className="mt-1 font-mono text-xs">{tokenAddress}</div>
            </div>
          ) : (
            <div className="text-black/60">No token loaded yet.</div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-black/60">To (recipient)</label>
              <input
                value={to}
                onChange={(e) => {
                  setTo(e.target.value.trim());
                  clearTxUI();
                }}
                placeholder="0x…"
                className="w-full rounded-lg border border-black/10 px-3 py-2 font-mono text-xs outline-none focus:ring-2 focus:ring-black/10"
                spellCheck={false}
              />
            </div>

            <div className="space-y-1">
              <label className="text-black/60">Amount</label>
              <input
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  clearTxUI();
                }}
                placeholder="e.g. 1.5"
                className="w-full rounded-lg border border-black/10 px-3 py-2 outline-none focus:ring-2 focus:ring-black/10"
                inputMode="decimal"
              />
              <div className="text-xs text-black/50">
                Assuming <span className="font-medium">18 decimals</span> for MVP.
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onTransfer}
              disabled={!canSubmit}
              className="rounded-lg border border-black/10 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isAwaitingWallet ? "Waiting for wallet…" : "Transfer"}
            </button>
          </div>

          {notice && (
            <div
              className={[
                "rounded-lg border px-3 py-2 text-sm",
                notice.kind === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-red-200 bg-red-50 text-red-700",
              ].join(" ")}
            >
              {notice.text}
            </div>
          )}

          {replacementHint ? (
            <div className="rounded-lg border border-black/10 bg-white px-3 py-2 text-xs text-black/70">
              {replacementHint}
            </div>
          ) : null}
        </div>
      </Card>

      <TxStatus
        kind={txKind}
        message={txMessage}
        hash={submitted?.hash ?? null}
        chainId={submitted?.chainId ?? null}
        originalHash={submitted?.originalHash ?? null}
        replacementReason={submitted?.replacementReason ?? null}
      />
    </div>
  );
}