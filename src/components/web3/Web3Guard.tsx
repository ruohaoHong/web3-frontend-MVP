"use client";

import type { ReactNode } from "react";
import { useAccount } from "wagmi";
import { Card } from "@/components/ui/Card";

export function Web3Guard({ children }: { children: ReactNode }) {
  const { isConnected, chain } = useAccount();

  // Not connected: let child components handle their own "not connected" UI
  if (!isConnected) return <>{children}</>;

  // Connected but unsupported: gate the web3 section
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
