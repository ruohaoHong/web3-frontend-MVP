"use client";

import { useMemo, useState } from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { sepolia, lineaSepolia } from "wagmi/chains";
import { injected, coinbaseWallet } from "wagmi/connectors";

import "@rainbow-me/rainbowkit/styles.css";

const chains = [sepolia, lineaSepolia] as const;

export default function Providers({ children }: { children: React.ReactNode }) {
  const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

  const config = useMemo(() => {
    // ✅ 有 projectId：用 RainbowKit 官方 getDefaultConfig
    if (projectId) {
      return getDefaultConfig({
        appName: "Web3 Frontend MVP",
        projectId,
        chains: [...chains],
        ssr: false,
        transports: {
          [sepolia.id]: http(),
          [lineaSepolia.id]: http(),
        },
      });
    }

    // ✅ 沒 projectId：fallback（至少 injected / coinbase 可用，且不崩潰）
    return createConfig({
      chains: [...chains],
      transports: {
        [sepolia.id]: http(),
        [lineaSepolia.id]: http(),
      },
      connectors: [
        injected(),
        coinbaseWallet({
          appName: "Web3 Frontend MVP",
        }),
      ],
      ssr: false,
    });
  }, [projectId]);

  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}