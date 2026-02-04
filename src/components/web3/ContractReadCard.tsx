"use client";

import { useMemo, useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { isAddress, formatUnits, type Address } from "viem";
import { Card } from "@/components/ui/Card";
import { erc20Abi } from "@/abi/erc20";
import { DEMO_ERC20_BY_CHAIN_ID } from "@/lib/constants";

type Notice = { kind: "error"; text: string } | null;

function humanizeReadError(err: unknown): string {
  if (!err) return "Read failed. Please try again.";
  const e = err as { shortMessage?: string; message?: string };
  const msg = e.shortMessage ?? e.message ?? "";
  if (/execution reverted/i.test(msg))
    return "Contract call reverted. Check token address and network.";
  if (/could not decode/i.test(msg))
    return "This address may not be an ERC20 contract (ABI decode failed).";
  return msg || "Read failed. Please try again.";
}

/**
 * Wrapper: force remount on supported-chain changes to reset token-specific UI state.
 * - No useEffect
 * - No setState inside effects
 * - Avoids “chain-specific token address” confusion
 */
export function ContractReadCard() {
  const { chain } = useAccount();
  const chainIdKey = chain?.id ?? "unknown";

  return <ContractReadCardInner key={chainIdKey} />;
}

function ContractReadCardInner() {
  const { address, chain } = useAccount();

  const [input, setInput] = useState<string>("");
  const [tokenAddress, setTokenAddress] = useState<Address | null>(null);
  const [format, setFormat] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  const inputIsValid = useMemo(() => isAddress(input), [input]);

  const demoToken = useMemo(() => {
    const chainId = chain?.id;
    if (!chainId) return null;
    return DEMO_ERC20_BY_CHAIN_ID[chainId] ?? null;
  }, [chain?.id]);

  const canRead = Boolean(address && tokenAddress);

  const {
    data: rawBalance,
    isLoading: isLoadingBalance,
    error: balanceError,
  } = useReadContract({
    abi: erc20Abi,
    address: tokenAddress ?? undefined,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: canRead },
  });

  const {
    data: decimals,
    isLoading: isLoadingDecimals,
    error: decimalsError,
  } = useReadContract({
    abi: erc20Abi,
    address: tokenAddress ?? undefined,
    functionName: "decimals",
    query: { enabled: Boolean(format && tokenAddress) },
  });

  const effectiveError = notice
    ? notice.text
    : balanceError
      ? humanizeReadError(balanceError)
      : decimalsError
        ? humanizeReadError(decimalsError)
        : null;

  const formatted =
    typeof rawBalance === "bigint" && typeof decimals === "number"
      ? formatUnits(rawBalance, decimals)
      : null;

  function onLoad() {
    setNotice(null);

    if (!inputIsValid) {
      setTokenAddress(null);
      setNotice({ kind: "error", text: "Invalid token address." });
      return;
    }

    setTokenAddress(input as Address);
  }

  function onUseDemo() {
    setNotice(null);

    if (!demoToken) {
      setNotice({
        kind: "error",
        text: "No demo token configured for the current network.",
      });
      return;
    }

    setInput(demoToken);
    setTokenAddress(demoToken);
  }

  function onClear() {
    setNotice(null);
    setTokenAddress(null);
    setInput("");
  }

  return (
    <Card title="Contract Read (ERC20 balanceOf)">
      <div className="space-y-3 text-sm">
        <div className="space-y-1">
          <label className="text-black/60">Token address</label>
          <input
            value={input}
            onChange={(e) => {
              setInput(e.target.value.trim());
              setNotice(null);
            }}
            placeholder="0x… (ERC20 contract address)"
            className="w-full rounded-lg border border-black/10 px-3 py-2 outline-none focus:ring-2 focus:ring-black/10"
            spellCheck={false}
          />
          <div className="text-xs text-black/50">
            Token addresses are chain-specific. Switching between supported
            networks resets this card to avoid confusion.
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onLoad}
            className="rounded-lg border border-black/10 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!inputIsValid}
            title={!inputIsValid ? "Enter a valid 0x address first" : "Load token"}
          >
            Load
          </button>

          <button
            type="button"
            onClick={onUseDemo}
            className="rounded-lg border border-black/10 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!demoToken}
            title={!demoToken ? "No demo token for this network" : "Use demo token"}
          >
            Use demo token
          </button>

          <button
            type="button"
            onClick={onClear}
            className="rounded-lg border border-black/10 px-3 py-2"
          >
            Clear
          </button>

          <label className="ml-2 inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={format}
              onChange={(e) => setFormat(e.target.checked)}
            />
            Format using decimals
          </label>
        </div>

        {demoToken ? (
          <div className="text-xs text-black/50">
            Demo token for {chain?.name}:{" "}
            <span className="font-mono">{demoToken}</span>
          </div>
        ) : (
          <div className="text-xs text-black/50">
            No demo token configured for the current network.
          </div>
        )}

        {tokenAddress ? (
          <div className="rounded-lg border border-black/10 bg-black/5 p-3">
            <div className="text-xs text-black/60">Active token</div>
            <div className="mt-1 font-mono text-xs">{tokenAddress}</div>
          </div>
        ) : (
          <div className="text-black/60">No token loaded yet.</div>
        )}

        <div className="space-y-1">
          <div className="text-black/60">Result</div>

          {!canRead ? (
            <div className="text-black/60">
              Waiting for a connected address and a loaded token…
            </div>
          ) : isLoadingBalance ? (
            <div className="text-black/60">Reading balanceOf…</div>
          ) : typeof rawBalance === "bigint" ? (
            <div className="space-y-2">
              <div className="rounded-lg border border-black/10 bg-white p-3">
                <div className="text-xs text-black/60">Raw (uint256)</div>
                <div className="mt-1 font-mono text-xs">
                  {rawBalance.toString()}
                </div>
              </div>

              {format ? (
                isLoadingDecimals ? (
                  <div className="text-black/60">Reading decimals…</div>
                ) : typeof decimals === "number" && formatted !== null ? (
                  <div className="rounded-lg border border-black/10 bg-white p-3">
                    <div className="text-xs text-black/60">
                      Formatted (decimals = {decimals})
                    </div>
                    <div className="mt-1 font-mono text-xs">{formatted}</div>
                  </div>
                ) : (
                  <div className="text-black/60">
                    Decimals not available. Showing raw only.
                  </div>
                )
              ) : null}
            </div>
          ) : (
            <div className="text-black/60">No data yet.</div>
          )}
        </div>

        {effectiveError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {effectiveError}
          </div>
        ) : null}
      </div>
    </Card>
  );
}
