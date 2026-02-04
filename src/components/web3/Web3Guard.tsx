"use client";

import type { ReactNode } from "react";
import { useAccount } from "wagmi";
import { Card } from "@/components/ui/Card";
import { useSyncExternalStore } from "react";

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export function Web3Guard({ children }: { children: ReactNode }) {
  const isClient = useIsClient();
  const { isConnected, chain } = useAccount();

  if (!isClient) {
    return (
      <Card title="Web3">
        <p className="text-sm text-black/60">Loading wallet state…</p>
      </Card>
    );
  }

  if (!isConnected) {
    return (
      <Card title="Web3">
        <div className="space-y-2 text-sm">
          <div className="font-medium">Not connected</div>
          <div className="text-black/60">
            Please connect your wallet to use Web3 features.
          </div>
        </div>
      </Card>
    );
  }

  if (chain === undefined) {
    return (
      <Card title="Web3">
        <div className="space-y-2 text-sm">
          <div className="font-medium text-red-600">Wrong network</div>
          <div className="text-black/60">
            This section is disabled because your wallet is on an unsupported
            network. Use the Network card above to switch back to a supported
            network.
          </div>
        </div>
      </Card>
    );
  }

  return <>{children}</>;
}
