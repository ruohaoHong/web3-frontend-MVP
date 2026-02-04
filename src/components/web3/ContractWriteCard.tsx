"use client";

import { useMemo, useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { isAddress, parseUnits, type Address } from "viem";
import { Card } from "@/components/ui/Card";
import { erc20Abi } from "@/abi/erc20";
import { DEMO_ERC20_BY_CHAIN_ID } from "@/lib/constants";

type Notice = { kind: "error" | "success"; text: string } | null;

function humanizeWriteError(err: unknown): string {
  if (!err) return "Transaction failed. Please try again.";
  const e = err as { name?: string; shortMessage?: string; message?: string };
  const name = e.name ?? "";
  const msg = e.shortMessage ?? e.message ?? "";

  if (name.toLowerCase().includes("userrejected") || /rejected/i.test(msg)) {
    return "User rejected the transaction in the wallet.";
  }

  // Common cases (insufficient funds / revert / invalid params)
  if (/insufficient funds/i.test(msg)) return "Insufficient funds to pay for gas.";
  if (/execution reverted/i.test(msg)) return "Transaction reverted. Check token, amount, and recipient.";
  if (/invalid address/i.test(msg)) return "Invalid address.";
  return msg || "Transaction failed. Please try again.";
}

export function ContractWriteCard() {
  const { chain } = useAccount();

  // Token address load pattern (same as read card UX)
  const [tokenInput, setTokenInput] = useState<string>("");
  const [tokenAddress, setTokenAddress] = useState<Address | null>(null);

  const [to, setTo] = useState<string>("");
  const [amount, setAmount] = useState<string>("");

  const [notice, setNotice] = useState<Notice>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);

  const { writeContractAsync, isPending } = useWriteContract();

  const tokenInputValid = useMemo(() => isAddress(tokenInput), [tokenInput]);
  const toValid = useMemo(() => isAddress(to), [to]);

  const demoToken = useMemo(() => {
    const chainId = chain?.id;
    if (!chainId) return null;
    return DEMO_ERC20_BY_CHAIN_ID[chainId] ?? null;
  }, [chain?.id]);

  const amountValid = useMemo(() => {
    const n = Number(amount);
    return Number.isFinite(n) && n > 0;
  }, [amount]);

  const canSubmit = Boolean(tokenAddress && toValid && amountValid && !isPending);

  function onLoadToken() {
    setNotice(null);
    setTxHash(null);

    if (!tokenInputValid) {
      setTokenAddress(null);
      setNotice({ kind: "error", text: "Invalid token address." });
      return;
    }
    setTokenAddress(tokenInput as Address);
  }

  function onUseDemoToken() {
    setNotice(null);
    setTxHash(null);

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
    setNotice(null);
    setTxHash(null);
    setTokenInput("");
    setTokenAddress(null);
  }

  async function onTransfer() {
    setNotice(null);
    setTxHash(null);

    if (!tokenAddress) {
      setNotice({ kind: "error", text: "Load a token address first." });
      return;
    }
    if (!toValid) {
      setNotice({ kind: "error", text: "Recipient address is invalid." });
      return;
    }
    if (!amountValid) {
      setNotice({ kind: "error", text: "Amount must be greater than 0." });
      return;
    }

    try {
      // MVP: assume 18 decimals and make it explicit in UI
      const value = parseUnits(amount, 18);

      const hash = await writeContractAsync({
        abi: erc20Abi,
        address: tokenAddress,
        functionName: "transfer",
        args: [to as Address, value],
      });

      setTxHash(hash);
      setNotice({ kind: "success", text: "Transaction submitted." });
    } catch (err) {
      setNotice({ kind: "error", text: humanizeWriteError(err) });
    }
  }

  return (
    <Card title="Contract Write (ERC20 transfer)">
      <div className="space-y-3 text-sm">
        <div className="space-y-1">
          <label className="text-black/60">Token address</label>
          <input
            value={tokenInput}
            onChange={(e) => {
              setTokenInput(e.target.value.trim());
              setNotice(null);
              setTxHash(null);
            }}
            placeholder="0x… (ERC20 contract address)"
            className="w-full rounded-lg border border-black/10 px-3 py-2 outline-none focus:ring-2 focus:ring-black/10"
            spellCheck={false}
          />
          <div className="text-xs text-black/50">
            Token addresses are chain-specific. Load a token on the current network.
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
                setNotice(null);
                setTxHash(null);
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
                setNotice(null);
                setTxHash(null);
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
            {isPending ? "Submitting…" : "Transfer"}
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

        {txHash && (
          <div className="rounded-lg border border-black/10 bg-white p-3">
            <div className="text-xs text-black/60">Tx hash</div>
            <div className="mt-1 font-mono text-xs break-all">{txHash}</div>
          </div>
        )}

        <div className="text-xs text-black/50">
          This commit only submits the transaction and shows the tx hash. Confirmation lifecycle will be added in the next commit.
        </div>
      </div>
    </Card>
  );
}
