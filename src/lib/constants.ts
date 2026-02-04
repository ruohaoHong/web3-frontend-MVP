import { sepolia, lineaSepolia } from "wagmi/chains";
import type { Address } from "viem";

export const DEMO_ERC20_BY_CHAIN_ID: Record<number, Address> = {
  [sepolia.id]: "0x09720b03264A7278299d74465e4D94E203040304",
  [lineaSepolia.id]: "0x09720b03264A7278299d74465e4D94E203040304",
};
