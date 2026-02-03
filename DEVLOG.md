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

---

## feat(web3): network switcher (post-connection) + add linea sepolia

- Goal:
  Add post-connection network switching (Sepolia ↔ Linea Sepolia) and gate Web3 actions on unsupported chains.

- Files:
  - src/app/providers.tsx
  - src/components/web3/NetworkCard.tsx
  - src/components/web3/Web3Guard.tsx
  - src/app/page.tsx

- Verify:
  - `pnpm dev` runs without errors and no red console errors / unhandled rejections
  - NetworkCard shows current chain name + chainId after connecting
  - Switch buttons:
    - Disabled when already on the target chain
    - Successful switch shows a success notice
  - Manual wallet switch to an unsupported chain:
    - NetworkCard shows "Wrong network"
    - Web3 section is gated by Web3Guard with a clear message
  - Rejecting a switch request shows a user-friendly error message

- Risk:
  - Unsupported-chain detection depends on `useAccount().chain === undefined` (requires wagmi config to include all supported chains)
  - Switching behavior differs across wallets/providers; some may not support programmatic switching

- Rollback:
  - Revert this commit to return to single-network behavior and remove gating

- Next:
  - Implement sign message flow gated by Web3Guard

---

## feat(web3): sign message flow

- Goal:
  Implement a sign message demo flow (no gas): input → sign → show signature, with human-readable errors and Web3 gating.

- Files:
  - src/components/web3/SignMessageCard.tsx
  - src/components/web3/Web3Guard.tsx
  - src/components/web3/NetworkCard.tsx
  - src/app/page.tsx

- Verify:
  - `pnpm dev` runs without errors
  - Connected on a supported chain:
    - Input accepts a message (with a default demo message)
    - Clicking Sign opens wallet prompt
    - On success, signature is displayed and can be copied
  - User rejects signature:
    - UI shows a clear message (e.g. "User rejected signature.")
    - No unhandled rejections / no red console errors
  - Disconnected:
    - Web3Guard gates the section and shows a "Not connected" message
  - Unsupported chain:
    - Web3Guard gates the section and shows a "Wrong network" message

- Risk:
  - Wallet connection state may differ between SSR and client hydration; NetworkCard uses a client-only gate to avoid mismatches
  - Gating unmounts children, so local UI state (e.g., signature) resets when disconnecting or switching to unsupported chain

- Rollback:
  - Revert this commit to remove SignMessage flow and restore previous Web3 section behavior

- Next:
  - Add contract read (ERC20 balanceOf) or a native send tx with lifecycle UI
