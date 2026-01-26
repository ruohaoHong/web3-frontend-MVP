"use client";

import { useEffect, useState } from "react";
import { WagmiProvider, type Config } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "@rainbow-me/rainbowkit/styles.css";

import type { CreateConnectorFn } from "wagmi";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<Config | null>(null);
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { createConfig, http } = await import("wagmi");
      const { sepolia } = await import("wagmi/chains");
      const { injected, coinbaseWallet, walletConnect } = await import(
        "wagmi/connectors"
      );

      const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

      const connectors: CreateConnectorFn[] = [
        injected(),
        ...(projectId
          ? [
              walletConnect({
                projectId,
                // 先開著，避免某些情況下沒有 QR modal
                showQrModal: true,
              }),
            ]
          : []),
        coinbaseWallet({
          appName: "Web3 Frontend MVP",
        }),
      ];

      const cfg = createConfig({
        chains: [sepolia],
        transports: {
          [sepolia.id]: http(),
        },
        connectors,
        ssr: false,
      });

      if (mounted) setConfig(cfg);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Config 還沒建立前先渲染 children，避免 hydration/SSR 問題
  if (!config) return <>{children}</>;

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
