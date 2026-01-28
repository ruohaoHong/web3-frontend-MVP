"use client";

import { useAccount, useBalance, useChainId } from "wagmi";
import { Card } from "@/components/ui/Card";
import { formatAddress, formatEth } from "@/lib/format";
import { sepolia } from "wagmi/chains";

export function AccountCard() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  const { data: balance, isLoading } = useBalance({
    address,
  });

  if (!isConnected) {
    return (
      <Card title="Account">
        <p className="text-sm text-black/60">
          Wallet not connected.
        </p>
      </Card>
    );
  }

  return (
    <Card title="Account">
      <div className="space-y-2 text-sm">
        <div>
          <span className="text-black/60">Address:</span>{" "}
          <span className="font-mono">
            {formatAddress(address)}
          </span>
        </div>

        <div>
          <span className="text-black/60">Chain:</span>{" "}
          {sepolia.name} ({chainId})
        </div>

        <div>
          <span className="text-black/60">Balance:</span>{" "}
          {isLoading
            ? "Loading…"
            : `${formatEth(balance?.value)} ETH`}
        </div>
      </div>
    </Card>
  );
}
