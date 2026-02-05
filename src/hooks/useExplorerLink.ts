import { sepolia, lineaSepolia } from "wagmi/chains";

export type ExplorerLink = { name: string; url: string };

const TX_EXPLORERS: Record<number, ExplorerLink[]> = {
  [sepolia.id]: [{ name: "Etherscan (Sepolia)", url: "https://sepolia.etherscan.io/tx/" }],
  [lineaSepolia.id]: [
    { name: "LineaScan (Sepolia)", url: "https://sepolia.lineascan.build/tx/" },
    { name: "Linea Explorer (Sepolia)", url: "https://explorer.sepolia.linea.build/tx/" },
  ],
};

export function getTxExplorerLinks(chainId: number | undefined, hash: `0x${string}`) {
  if (!chainId) return [] as ExplorerLink[];
  const bases = TX_EXPLORERS[chainId];
  if (!bases) return [] as ExplorerLink[];
  return bases.map((b) => ({ name: b.name, url: `${b.url}${hash}` }));
}