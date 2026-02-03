"use client";

import { useEffect, useState } from "react";
import { WagmiProvider, type Config, createConfig, http } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { sepolia, lineaSepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";

import "@rainbow-me/rainbowkit/styles.css";

export default function Providers({ children }: { children: React.ReactNode }) {
  /**
   * 建立一個「安全的初始 config」
   * - 只有 injected
   * - 不碰 walletconnect / indexedDB
   * - 保證 WagmiProvider 永遠存在
   */
  const [config, setConfig] = useState<Config>(() =>
    createConfig({
      chains: [sepolia, lineaSepolia],
      transports: {
        [sepolia.id]: http(),
        [lineaSepolia.id]: http(),
      },
      connectors: [injected()],
      ssr: false,
    })
  );

  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { walletConnect, coinbaseWallet } = await import("wagmi/connectors");

      const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

      const connectors = [
        injected(),
        ...(projectId
          ? [
              walletConnect({
                projectId,
                showQrModal: true,
              }),
            ]
          : []),
        coinbaseWallet({
          appName: "Web3 Frontend MVP",
        }),
      ];

      const nextConfig = createConfig({
        chains: [sepolia, lineaSepolia],
        transports: {
          [sepolia.id]: http(),
          [lineaSepolia.id]: http(),
        },
        connectors,
        ssr: false,
      });

      if (mounted) setConfig(nextConfig);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
