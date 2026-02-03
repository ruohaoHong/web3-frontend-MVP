"use client";

import { useMemo, useState } from "react";
import { useSignMessage } from "wagmi";
import { Card } from "@/components/ui/Card";

type Notice = { kind: "success" | "error"; text: string } | null;

function mapSignError(err: unknown): string {
  if (!err) return "Signing failed. Please try again.";
  const e = err as { name?: string; shortMessage?: string; message?: string };
  const name = e.name ?? "";
  const msg = e.shortMessage ?? e.message ?? "";

  if (name.toLowerCase().includes("userrejected") || /rejected/i.test(msg)) {
    return "User rejected signature.";
  }

  return msg || "Signing failed. Please try again.";
}

export function SignMessageCard() {
  const demoMessage = useMemo(
    () => "Web3 Frontend MVP — sign-in demo (no gas).",
    []
  );
  const [message, setMessage] = useState(demoMessage);
  const [notice, setNotice] = useState<Notice>(null);

  const { signMessageAsync, data, isPending } = useSignMessage();

  async function onSign() {
    setNotice(null);

    const trimmed = message.trim();
    if (!trimmed) {
      setNotice({ kind: "error", text: "Message cannot be empty." });
      return;
    }

    try {
      await signMessageAsync({ message: trimmed });
      setNotice({ kind: "success", text: "Signed successfully." });
    } catch (err) {
      setNotice({ kind: "error", text: mapSignError(err) });
    }
  }

  const signature = data ?? null;

  return (
    <Card title="Sign Message">
      <div className="space-y-3 text-sm">
        <div className="space-y-1">
          <label className="text-black/60">Message</label>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded-lg border border-black/10 px-3 py-2 outline-none focus:ring-2 focus:ring-black/10"
            placeholder="Type a message to sign"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onSign}
            disabled={isPending}
            className="rounded-lg border border-black/10 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Signing…" : "Sign"}
          </button>

          {signature && (
            <button
              type="button"
              className="rounded-lg border border-black/10 px-3 py-2"
              onClick={() => navigator.clipboard.writeText(signature)}
            >
              Copy signature
            </button>
          )}
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

        {signature && (
          <div className="space-y-1">
            <div className="text-black/60">Signature</div>
            <pre className="overflow-x-auto rounded-lg border border-black/10 bg-black/5 p-3 text-xs">
{signature}
            </pre>
          </div>
        )}

        <div className="text-black/60">
          This does not send a transaction and costs no gas. It’s commonly used
          for authentication/authorization flows.
        </div>
      </div>
    </Card>
  );
}
