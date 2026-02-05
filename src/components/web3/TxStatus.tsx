"use client";

import { Card } from "@/components/ui/Card";
import { getTxExplorerLinks } from "@/hooks/useExplorerLink";

export type TxStatusKind = "idle" | "pending" | "success" | "error";
export type ReplacementReason = "replaced" | "repriced" | "cancelled";

export function TxStatus({
  title = "Tx Status",
  kind,
  message,
  hash,
  chainId,
  originalHash,
  replacementReason,
}: {
  title?: string;
  kind: TxStatusKind;
  message?: string | null;
  hash?: `0x${string}` | null;
  chainId?: number | null;
  originalHash?: `0x${string}` | null;
  replacementReason?: ReplacementReason | null;
}) {
  if (kind === "idle") return null;

  const links = hash && chainId ? getTxExplorerLinks(chainId, hash) : [];
  const hasReplacement = Boolean(originalHash && hash && originalHash !== hash);

  const badgeClass =
    kind === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : kind === "error"
        ? "border-red-200 bg-red-50 text-red-700"
        : "border-black/10 bg-black/5 text-black/70";

  const label = kind === "pending" ? "Pending" : kind === "success" ? "Success" : "Error";

  const replacementText =
    replacementReason === "repriced"
      ? "Sped up (repriced)"
      : replacementReason === "cancelled"
        ? "Cancelled (replaced)"
        : replacementReason === "replaced"
          ? "Replaced"
          : null;

  return (
    <Card title={title}>
      <div className="space-y-2 text-sm">
        <div className={`inline-flex rounded-full border px-3 py-1 text-xs ${badgeClass}`}>
          {label}
        </div>

        {message ? <div className="text-sm">{message}</div> : null}

        {hasReplacement && replacementText ? (
          <div className="rounded-lg border border-black/10 bg-white p-3">
            <div className="text-xs text-black/60">Replacement detected</div>
            <div className="mt-1 text-xs">{replacementText}</div>
            <div className="mt-2 text-xs text-black/60">Original hash</div>
            <div className="mt-1 break-all font-mono text-xs">{originalHash}</div>
          </div>
        ) : null}

        {hash ? (
          <div className="rounded-lg border border-black/10 bg-white p-3">
            <div className="text-xs text-black/60">Tracking tx hash</div>
            <div className="mt-1 break-all font-mono text-xs">{hash}</div>

            {links.length ? (
              <div className="mt-2 flex flex-wrap gap-3">
                {links.map((l) => (
                  <a
                    key={l.url}
                    className="text-xs underline underline-offset-2"
                    href={l.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View on {l.name}
                  </a>
                ))}
              </div>
            ) : null}

            {kind === "pending" ? (
              <div className="mt-2 text-xs text-black/50">
                If the explorer shows “not found”, wait ~30–60s for indexing.
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </Card>
  );
}