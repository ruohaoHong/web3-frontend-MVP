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
  
---

## feat(web3): add erc20 abi + token read

- Goal:
  Add ERC20 ABI and a contract read UI to query `balanceOf` for the connected address, with optional decimals formatting and a demo token helper.

- Files:
  - src/abi/erc20.ts
  - src/lib/constants.ts
  - src/components/web3/ContractReadCard.tsx
  - src/app/page.tsx

- Verify:
  - `pnpm dev` runs without errors
  - Disconnected / unsupported chain: gated by Web3Guard (card not interactive / not shown in Web3 section)
  - Token address input validates 0x address; invalid input does not trigger reads
  - After loading a valid ERC20 address (or clicking "Use demo token"):
    - Reads `balanceOf(connectedAddress)` successfully
    - Shows raw uint256 balance (BigInt string) with clear "Raw" labeling
  - Optional formatting:
    - Enabling "Format using decimals" triggers `decimals()` read and shows formatted value when available
    - If `decimals()` fails, UI falls back gracefully to raw display
  - Switching between supported chains resets token input/active token state to avoid chain-specific confusion
  - No red console errors / no unhandled rejections

- Risk:
  - Token addresses are chain-specific; wrong-chain addresses may revert or decode-fail (handled via UI error messaging)
  - Remount-on-chain-change resets local UI state by design (may surprise users but reduces incorrect cross-chain assumptions)

- Rollback:
  - Revert this commit to remove ERC20 read functionality and demo token helpers

- Next:
  - Implement contract write (ERC20 transfer) or native send tx with lifecycle UI + explorer link

---

## feat(web3): contract write (erc20 transfer)

- Goal:
  Submit an ERC20 `transfer(to, amount)` transaction and display the tx hash (no confirmation lifecycle yet).

- Files:
  - src/abi/erc20.ts
  - src/components/web3/ContractWriteCard.tsx
  - src/app/page.tsx

- Verify:
  - `pnpm dev` runs without errors
  - In Web3Guard (connected + supported chain):
    - Load token address (manual + Load or "Use demo token")
    - Enter valid `to` address and `amount > 0`
    - Click Transfer → wallet prompt appears → after submission shows tx hash
  - User rejects in wallet → UI shows a human-readable error
  - Disconnected / unsupported chain → gated by Web3Guard
  - No red console errors / no unhandled rejections

- Risk:
  - Amount conversion assumes 18 decimals (explicitly stated); tokens with different decimals will transfer unexpected units
  - This commit does not wait for confirmations; a tx hash does not guarantee success on-chain

- Rollback:
  - Revert this commit to remove ERC20 transfer UI and restore read-only state

- Next:
  - Add tx lifecycle UI (pending/success/error) and explorer link for submitted transactions

---

## feat(web3): tx lifecycle ui + explorer links

- Goal:
  Add single-tx lifecycle UI (pending/success/error) with chain-aware explorer links, including correct handling for MetaMask speed up/cancel (replacement tx).

- Files:
  - src/hooks/useExplorerLink.ts
  - src/hooks/useTxState.ts
  - src/components/web3/TxStatus.tsx
  - src/components/web3/ContractWriteCard.tsx

- Verify:
  - `pnpm dev` runs without errors
  - After submitting an ERC20 transfer:
    - Shows pending immediately (awaiting wallet → submitted/pending)
    - After 1 confirmation, shows success and explorer link
  - User rejects/cancels before submission (no hash):
    - Shows friendly error and no explorer link
  - MetaMask Speed up:
    - UI detects replacement and updates to the latest tx hash
    - Explorer link points to the latest hash (not the dropped one)
    - Eventually resolves to success/error (no infinite pending)
  - MetaMask Cancel:
    - UI detects cancellation as replacement tx
    - After cancellation confirms, shows “Cancelled” state (no infinite pending)
  - Explorer links are chain-aware:
    - Sepolia uses Etherscan
    - Linea Sepolia provides LineaScan and Linea explorer (Blockscout)
  - No red console errors / no unhandled rejections

- Risk:
  - Explorer indexing lag can temporarily show “not found” even for valid hashes; UI follows replacement hash to reduce dropped-hash links
  - Replacement handling is wallet/provider dependent; behavior may vary across wallets/networks

- Rollback:
  - Revert this commit to remove lifecycle tracking and fall back to showing only tx hash without confirmation state

- Next:
  - Add tx lifecycle UI to other actions (native send / contract reads/writes), and optionally add “copy hash” + “reset tx” controls

  ---

## feat(vibe): add /vibe page (ai-assisted ui mini tool)

- Goal:
  Add an interactive `/vibe` page that turns small inputs into a calm, premium UI preview driven by a copyable CSS variable token set.

- Files:
  - src/app/vibe/page.tsx

- Verify:
  - `/vibe` route loads and is interactive
  - Changing inputs (theme/radius/density/keyword/mode) updates preview immediately
  - Empty state shows when no theme is selected and no custom accent is provided
  - Validation state shows for invalid custom accent (#RRGGBB) and disables Copy
  - Tokens panel outputs a full CSS variables block and preview reads from those variables
  - Copy button works (clipboard success notice; graceful fallback message if unavailable)
  - `pnpm build` passes; no red console errors

- Risk:
  - Clipboard API may be unavailable outside https/localhost; fallback message is required
  - Inline style usage relies on CSS variable support; should be fine for modern browsers but keep scope limited to `/vibe`

- Rollback:
  - Revert this commit to remove the `/vibe` page and related UI iteration demo

- Next:
  - Polish preview interactions (copy-toasts, small a11y tweaks) and link `/vibe` from the main header for discoverability

  ---

## docs: add README + screenshots + run instructions

- Goal:
  Add a resume-ready README that explains the Web3 MVP + `/vibe`, lists features/stack, and provides setup/run instructions with screenshots.

- Files:
  - README.md
  - public/screenshots/home.(png|webp)
  - public/screenshots/vibe.(png|webp)
  - .env.example

- Verify:
  - README renders correctly on GitHub and is scannable (What it is / Features / Stack / Setup / Run / Screenshots)
  - Code blocks use `~~~`
  - Screenshot images load in README
  - Setup instructions are complete (mentions `.env.local` and `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`)
  - `pnpm dev` and `pnpm build` still work

- Risk:
  - Screenshot paths may break if filenames or folders change (keep `public/screenshots/*` stable)
  - Wording like “prompt” can be misread as AI prompt; prefer “wallet confirmation” / “signature confirmation”

- Rollback:
  - Revert this commit to return to the previous documentation state.

- Next:
  - Move any AI/process notes out of product UI into dedicated docs (e.g., `VIBE_CODING_PROCESS*.md`, `PROMPTS*.md`) and link them from README.
