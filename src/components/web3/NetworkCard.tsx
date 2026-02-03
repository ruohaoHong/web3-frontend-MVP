"use client";

import { useMemo, useState } from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { sepolia, lineaSepolia } from "wagmi/chains";
import { Card } from "@/components/ui/Card";

type Notice = { kind: "success" | "error"; text: string } | null;

function mapSwitchError(err: unknown): string {
  if (!err) return "Switch failed. Please try again.";
  const e = err as { name?: string; shortMessage?: string; message?: string };

  const name = e.name ?? "";
  const msg = e.shortMessage ?? e.message ?? "";

  if (name.toLowerCase().includes("userrejected") || /rejected/i.test(msg)) {
    return "Request was rejected in your wallet.";
  }

  if (/not supported/i.test(msg) || /does not support/i.test(msg)) {
    return "Your wallet does not support switching networks automatically. Please switch manually in your wallet.";
  }

  return msg || "Switch failed. Please try again.";
}

export function NetworkCard() {
  const { isConnected, chain } = useAccount();
  const { switchChainAsync, isPending, error } = useSwitchChain();

  const [notice, setNotice] = useState<Notice>(null);

  const supported = useMemo(() => [sepolia, lineaSepolia], []);
  const isUnsupported = isConnected && chain === undefined;

  async function onSwitch(targetChainId: number) {
    setNotice(null);
    try {
      await switchChainAsync({ chainId: targetChainId });
      setNotice({ kind: "success", text: "Network switched." });
    } catch (err) {
      // Ensure no unhandled rejections + show human readable error
      setNotice({ kind: "error", text: mapSwitchError(err) });
    }
  }

  const currentChainId = chain?.id;
  const isOnSepolia = currentChainId === sepolia.id;
  const isOnLinea = currentChainId === lineaSepolia.id;

  // If wagmi exposes an error but we didn't catch it (rare), show it without setState.
  const derivedErrorText = !notice && error ? mapSwitchError(error) : null;

  return (
    <Card title="Network">
      {!isConnected ? (
        <p className="text-sm text-black/60">Connect wallet to view network.</p>
      ) : (
        <div className="space-y-3 text-sm">
          <div className="space-y-1">
            <div>
              <span className="text-black/60">Current:</span>{" "}
              {isUnsupported ? (
                <span className="font-medium text-red-600">
                  Wrong network (unsupported)
                </span>
              ) : (
                <span className="font-medium">
                  {chain?.name} ({chain?.id})
                </span>
              )}
            </div>

            {isUnsupported && (
              <div className="text-black/60">
                Your wallet is connected to a network that this app doesn’t
                support. Please switch to a supported network.
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-lg border border-black/10 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isPending || isOnSepolia}
              onClick={() => onSwitch(sepolia.id)}
            >
              {isOnSepolia ? "On Sepolia" : "Switch to Sepolia"}
            </button>

            <button
              type="button"
              className="rounded-lg border border-black/10 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isPending || isOnLinea}
              onClick={() => onSwitch(lineaSepolia.id)}
            >
              {isOnLinea ? "On Linea Sepolia" : "Switch to Linea Sepolia"}
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

          {!notice && derivedErrorText && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {derivedErrorText}
            </div>
          )}

          {!notice && !derivedErrorText && isPending && (
            <div className="text-black/60">Switching network…</div>
          )}

          {!notice && !derivedErrorText && !isPending && (
            <div className="text-black/60">
              Supported:{" "}
              {supported.map((c) => `${c.name} (${c.id})`).join(" · ")}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
