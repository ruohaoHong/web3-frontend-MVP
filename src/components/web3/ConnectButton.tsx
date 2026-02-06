"use client";

import { ConnectButton as RKConnectButton } from "@rainbow-me/rainbowkit";
import { useConfig } from "wagmi";
import { useSyncExternalStore } from "react";

function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export default function ConnectButton() {
  const hydrated = useHydrated();
  const config = useConfig();

  const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
  const hasWalletConnect = config.connectors.some((c) => c.id === "walletConnect");

  // SSR / hydration 階段先不要渲染真正的 RK ConnectButton，避免 Hydrate 期間 setState 警告
  if (!hydrated) {
    return (
      <button
        type="button"
        disabled
        className="inline-flex items-center rounded-xl bg-black px-4 py-2 text-sm font-medium text-white/80 opacity-60"
      >
        Loading…
      </button>
    );
  }

  // 有 projectId 時，等待 walletConnect connector 真正掛上來再顯示 RK ConnectButton
  if (projectId && !hasWalletConnect) {
    return (
      <button
        type="button"
        disabled
        className="inline-flex items-center rounded-xl bg-black px-4 py-2 text-sm font-medium text-white/80 opacity-60"
      >
        Loading wallets…
      </button>
    );
  }

  return <RKConnectButton />;
}