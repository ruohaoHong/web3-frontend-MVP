# DEVLOG 
# Commits mark safe checkpoints. Push when the checkpoint is demo-able and worth revisiting.

> Purpose:
> This devlog exists only to help AI and future me recall recent changes,
> identify potential risk areas, and avoid reintroducing known pitfalls.
> It is NOT a design spec, roadmap, or set of hard rules.
> Keep entries factual, minimal, and reversible.

---

## chore: init nextjs + ts + tailwind

- Goal:
  Initialize a clean Next.js App Router project with TypeScript and Tailwind CSS.

- Files:
  - package.json
  - src/app/layout.tsx
  - src/app/page.tsx
  - src/app/globals.css
  - src/components/layout/Header.tsx
  - src/components/layout/Container.tsx

- Verify:
  - `pnpm dev` runs without errors
  - Home page renders with basic layout and Tailwind styles

- Risk:
  - Tailwind v4 directive or PostCSS configuration mismatch could disable styles

- Rollback:
  - Revert this commit to return to a clean Next.js scaffold

- Next:
  - Add Web3 providers (wagmi + RainbowKit)

---

## chore: add wagmi viem rainbowkit providers

- Goal:
  Wire up wagmi v2, viem, and RainbowKit providers using Sepolia as default chain.

- Files:
  - src/app/providers.tsx
  - src/app/layout.tsx
  - .env.example
  - package.json

- Verify:
  - `pnpm dev` runs without `indexedDB is not defined`
  - App renders normally with providers wrapped

- Risk:
  - Provider initialization order or SSR timing issues may cause runtime errors
  - WalletConnect usage without projectId could cause connection failures

- Rollback:
  - Revert to previous layout without providers

- Next:
  - Add a basic Connect Wallet button

---

## feat(web3): connect wallet button

- Goal:
  Display a RainbowKit Connect Wallet button on the home page.

- Files:
  - src/components/web3/ConnectButton.tsx
  - src/components/ui/Card.tsx
  - src/app/page.tsx
  - src/app/providers.tsx

- Verify:
  - Home page shows a Connect Wallet button
  - Clicking Connect opens RainbowKit modal
  - After connecting, a shortened address is displayed
  - No `WagmiProviderNotFoundError` occurs

- Risk:
  - `WagmiProviderNotFoundError` if any web3 component renders outside provider
  - Future provider refactors could reintroduce hydration timing issues

- Rollback:
  - Revert this commit to remove wallet connection UI

- Next:
  - Display connected account info (address, chain, balance)

---

## feat(web3): account card (address + balance + chain)

- Goal:
  Display connected wallet account information including address, chain, and native ETH balance.

- Files:
  - src/components/web3/AccountCard.tsx
  - src/lib/format.ts
  - src/app/page.tsx

- Verify:
  - `pnpm dev` runs without errors
  - When wallet is disconnected, AccountCard shows a safe placeholder message
  - When connected, address is displayed in shortened format
  - Current chain name and chainId are shown
  - Native ETH balance is displayed and formatted
  - Page refresh does not trigger `WagmiProviderNotFoundError`

- Risk:
  - Balance formatting relies on bigint → number conversion and may lose precision for very large values
  - Chain display currently assumes Sepolia; adding multi-chain support requires refactor

- Rollback:
  - Revert this commit to remove account display and return to wallet-only UI

- Next:
  - Add network switcher UI to allow switching between supported chains

