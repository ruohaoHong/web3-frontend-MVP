export function formatAddress(address?: string) {
  if (!address) return "";
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function formatEth(balance?: bigint, decimals = 18) {
  if (!balance) return "0";
  const value = Number(balance) / 10 ** decimals;
  return value.toFixed(4);
}
