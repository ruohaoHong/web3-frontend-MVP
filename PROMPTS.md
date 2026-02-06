# Commit 1 — chore: init nextjs + ts + tailwind

## Prompt
Create a Next.js (App Router) + TypeScript + Tailwind project. Add a simple layout with Header and Container. Keep code minimal and clean.

## Goals
- Project runs locally with Next.js App Router + TypeScript + Tailwind
- Basic layout exists (Header + Container)

## Notes
- Keep changes minimal and reversible (no design system yet).
- If Tailwind styles don’t apply, check Tailwind v4 directives/config alignment with App Router.

## Done (Acceptance)
- `pnpm dev` runs without errors
- Home page renders Header + Container
- Tailwind classes are visibly working (spacing/typography/background)

## Minimal-change strategy
- Touch only necessary files: `layout.tsx`, `page.tsx`, `globals.css`, and minimal layout components

## Suggested commit message
chore: init nextjs + ts + tailwind


# Commit 2 — chore: add wagmi viem rainbowkit providers

## Prompt
Add wagmi v2 + viem + RainbowKit to a Next.js App Router project. Create `providers.tsx` and wrap it in `layout.tsx`. Use Sepolia as the default chain.

## Goals
- Wire wagmi + RainbowKit + TanStack Query providers correctly
- Add `.env.example` for WalletConnect project id

## Notes
- Focus on provider wiring only; no Web3 UI yet (Connect button in next commit).
- App Router hydration/SSR issues are common: `providers.tsx` should be `use client`.
- Missing `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` should fail gracefully (at least injected wallets still work).

## Done (Acceptance)
- `pnpm dev` runs cleanly
- App renders without `indexedDB is not defined` / hydration errors
- `layout.tsx` wraps the app with Providers
- `.env.example` contains `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`

## Minimal-change strategy
- Add `src/app/providers.tsx`, wrap it in `src/app/layout.tsx`
- Configure only `sepolia` for now (expand chains later)

## Suggested commit message
chore: add wagmi viem rainbowkit providers


# Commit 3 — feat(web3): connect wallet button

## Prompt
Add a `ConnectButton` component using RainbowKit. Place it on the home page inside a simple Card. Ensure no provider/hydration errors.

## Goals
- Show a Connect Wallet button on `/`
- Allow connecting a wallet and displaying connected state

## Notes
- Web3 components must render under Providers to avoid `WagmiProviderNotFoundError`.
- Keep UI clean and minimal; focus on a demoable flow.

## Done (Acceptance)
- Home shows a Connect Wallet button
- Clicking opens RainbowKit modal and connects successfully
- Connected state shows (e.g., shortened address)
- No red console errors

## Minimal-change strategy
- Add `src/components/web3/ConnectButton.tsx`
- Update `src/app/page.tsx` to render it (optionally in a simple Card)

## Suggested commit message
feat(web3): connect wallet button


# Commit 4 — feat(web3): account card (address + balance + chain)

## Prompt
Build `AccountCard` using wagmi hooks (`useAccount`, `useBalance`, and connected chain info). Display:
- Address (shortened)
- Chain name + chainId
- Formatted native balance
Handle disconnected state gracefully. No unhandled console errors.

## Goals
- After connection, show address / chain / native balance
- Provide a clean disconnected empty state

## Notes
- Prefer `useAccount().chain` as the source of chain name/id.
- Balance formatting should be clear (symbol + reasonable decimals).

## Done (Acceptance)
- When connected, AccountCard shows:
  - shortened address
  - chain name + chainId
  - formatted native balance
- When disconnected, shows an empty state (no crashes)
- No red console errors / unhandled rejections

## Minimal-change strategy
- Add `src/components/web3/AccountCard.tsx`
- Render under the ConnectButton on `src/app/page.tsx`
- Skip ENS/indexers for MVP

## Suggested commit message
feat(web3): account card (address + balance + chain)


# Commit 5 — feat(web3): network switcher

## Prompt
Implement `NetworkCard` with `useSwitchChain` for **post-connection** network handling.
Show current chain **name + chainId** from the connected account. Support switching between **Sepolia** and **Linea Sepolia**.
If the wallet is on an **unsupported chain**, show a clear “Wrong network” state and **gate the Web3 section** (disable/hide Web3 actions).
Handle switch success/failure with user-friendly messages and no unhandled console errors.

## Goals
- After connection, display current chain (name + chainId)
- If user switches to an unsupported chain in the wallet → show Wrong network + guide them back
- Support switching: Sepolia ↔ Linea Sepolia

## Notes
- Core scenario is post-connection chain changes (not connect-time flow).
- Do not hardcode chainId; use `wagmi/chains` objects (`sepolia`, `lineaSepolia`).
- Detect unsupported chain via `useAccount().chain`:
  - Connected but `chain === undefined` ⇒ chain not in config ⇒ treat as unsupported.

## Done (Acceptance)
- NetworkCard shows chain name + chainId (post-connection)
- Switch UI: Switch to Sepolia / Switch to Linea Sepolia
- Button for current chain is disabled (no-op)
- Unsupported chain shows clear Wrong network state
- Unsupported chain gates the Web3 section (no Web3 actions)
- Switch failure (reject/not supported) shows human-friendly UI error
- No red console errors / unhandled rejections

## Minimal-change strategy
- Expand `providers` chains from `[sepolia]` to `[sepolia, lineaSepolia]`
- Add `NetworkCard` + error mapping
- Add a lightweight `Web3Guard` to gate the entire Web3 section once

## Suggested commit message
feat(web3): network switcher (post-connection) + add linea sepolia


# Commit 6 — feat(web3): sign message flow

## Prompt
Implement `SignMessageCard` with `useSignMessage`. Provide input + Sign button.
Disable when disconnected or on unsupported chain (use Web3Guard). Display signature on success and friendly errors on reject. No unhandled console errors.

## Goals
- Input message → sign → show signature
- Show friendly errors on reject

## Notes
- Sign Message is off-chain (no gas), used for auth/consent demos.
- For this MVP, gate signing on unsupported chains to avoid user confusion (product choice).

## Done (Acceptance)
- Input accepts message (provide a default demo message)
- Sign triggers wallet prompt and shows signature on success (copyable)
- User rejected shows a clear message
- Disconnected and unsupported chain states are gated by Web3Guard
- No red console errors / unhandled rejections

## Minimal-change strategy
- Add `SignMessageCard` component
- Keep gating logic centralized in Web3Guard

## Suggested commit message
feat(web3): sign message flow


# Commit 7 — feat(web3): add erc20 abi + token read

## Prompt
Add ERC20 ABI and implement `ContractReadCard` using `useReadContract` to read `balanceOf` for the connected address.
Provide a token address input with basic validation. Display balance (raw acceptable; optionally format via `decimals`).
Guard via Web3Guard. Handle errors gracefully.

## Goals
- Read ERC20 `balanceOf` for connected address
- Token address is user-provided (plus a demo token shortcut)
- Clear decimals strategy (can be simplified)

## Notes
- Token addresses are chain-specific; avoid cross-chain confusion.
- MVP can default to raw display and optionally enable formatted display.

## Done (Acceptance)
- Token address input with basic validation (only read if valid address)
- Shows `balanceOf` for connected address
- Decimals strategy:
  - A) raw only, clearly labeled, OR
  - B) read `decimals()` and format
- Disconnected/unsupported chain gated by Web3Guard
- Read failures show a friendly message (no crashes)
- No red console errors

## Minimal-change strategy
- Add `src/abi/erc20.ts`
- Add `ContractReadCard`
- Skip token lists/indexers/ENS

## Suggested commit message
feat(web3): add erc20 abi + token read


# Commit 8 — feat(web3): contract write (erc20 transfer)

## Prompt
Implement `ContractWriteCard` using `useWriteContract` to call ERC20 `transfer(to, amount)`.
Provide `to` + `amount` inputs with basic validation. Show tx hash after submission and map common errors (user rejected) to friendly UI.
Use Web3Guard. Do not implement confirmation lifecycle yet.

## Goals
- Execute ERC20 `transfer` and display tx hash on submission

## Notes
- This commit is submission + hash only; confirmation UI comes in Commit 9.
- Amount units must be explicit:
  - Option A: assume 18 decimals and label it clearly
  - Option B: reuse decimals read from Commit 7 if implemented

## Done (Acceptance)
- `to` + `amount` inputs
- Validation: `to` is an address; `amount > 0`
- Transfer triggers wallet prompt; shows tx hash after submission
- User rejected shows friendly message
- Disconnected/unsupported chain gated by Web3Guard
- No red console errors

## Minimal-change strategy
- Add `ContractWriteCard`
- Single token scope (token address input or reuse read card token address)

## Suggested commit message
feat(web3): contract write (erc20 transfer)


# Commit 9 — feat(web3): tx lifecycle ui + explorer links

## Prompt
Add `TxStatus` lifecycle UI: pending/success/error with chain-aware explorer links for Sepolia and Linea Sepolia.
After submission, show pending immediately; mark success when receipt confirms; show friendly errors (reverted, not found). Keep it single-tx.

Also handle MetaMask Speed Up / Cancel by detecting replacement transactions and continuing to track the latest hash (update explorer links accordingly).

## Goals
- Show tx lifecycle: pending → success/error
- Provide chain-aware explorer links
- Handle replacement tx flows (speed up/cancel)

## Notes
- Explorer base differs per chain; generate links from chainId.
- Single latest tx only (no queue).
- Use `useWaitForTransactionReceipt` and `onReplaced` to detect replacement tx and update tracked hash.

## Done (Acceptance)
- Pending shows immediately after submit
- Success shows after 1 confirmation + explorer links
- Error shows friendly message (reverted/not found/user rejected where applicable)
- Explorer links are correct per chain
- Replacement tx (speed up/cancel) updates tracking to the latest hash and shows replacement info
- No red console errors / unhandled rejections

## Minimal-change strategy
- Add a small `useExplorerLink` util/hook
- Add `useTxState` hook with receipt + replacement handling
- Keep `TxStatus` UI dumb (display-only)

## Suggested commit message
feat(web3): tx lifecycle ui + explorer links


# Commit 10 — feat(vibe): add /vibe page (ai-assisted ui mini tool)

## Prompt
Create a `/vibe` page that demonstrates AI-assisted product UI iteration by generating a premium, calm, modern UI preview from small user inputs.
Do NOT reference any specific brand. The aesthetic should be minimal, premium, and calm: generous whitespace, clear typography hierarchy, subtle frosted surfaces, soft shadows, no heavy borders, a single low-saturation accent color, and gentle micro-interactions.

The tool should:
1) Take inputs (accent theme, radius, spacing density, optional keyword like "luxury")
2) Render a polished UI preview (Card + Buttons + Input + Badge)
3) Output a token set (CSS variables) that drives the preview
4) Include empty states + basic validation
5) Provide Copy button for tokens (clipboard)

Keep it frontend-only (no external APIs) and deploy-safe.

## Goals
- Build a `/vibe` interactive tool that proves AI-assisted UI iteration
- Produce consistent “premium/calm/modern” previews via tokens (without naming brands)

## Notes
- “Luxury” should mean restrained premium minimalism (not loud gold/neon).
- Keep it isolated to `/vibe` scope; do not refactor the whole app’s design system.

## Done (Acceptance)
- `/vibe` route exists and is interactive
- Inputs update preview immediately
- Empty state + validation present
- Tokens are copyable and actually drive the preview
- No external APIs; `pnpm build` succeeds; no red console errors

## Minimal-change strategy
- One page + a few small components only
- Apply CSS variables on the `/vibe` container (not globally)

## Suggested commit message
feat(vibe): add /vibe page (ai-assisted ui mini tool)


# Commit 11 — docs: add README.md + screenshots + run instructions

## Prompt
Create a resume-ready `README.md` at repo root that documents both projects (Web3 MVP + `/vibe`), features, stack, setup, run, and screenshots. Keep it concise and scannable.

## Goals
- A stranger can understand and run the repo from the README
- Documentation is resume-ready (clear, honest, verifiable)

## Notes
- Do not claim features that are not implemented.
- Include placeholders if demo URL is not available.
- Add 1–2 screenshots (optional) under `public/screenshots/`.

## Done (Acceptance)
README includes:
- What it is (main + side project)
- Features (mapped to commits 3–10)
- Tech stack
- Setup (env + install + run + build)
- Screenshots/GIFs
- Demo URL (or “coming soon”)

## Minimal-change strategy
- Only add/update `README.md` and optional screenshot files
- Do not touch application code

## Suggested commit message
docs: add README + screenshots + run instructions


# Commit 12 — chore: prepare vercel deploy

## Prompt
Prepare for Vercel deployment: ensure the app builds, document required env vars, and add deployed URL to README.
The app should handle missing WalletConnect projectId gracefully (injected wallet still works or show a clear message).

## Goals
- Deploy successfully to Vercel and document it
- App remains usable even with missing optional env vars

## Notes
- `.env.example` must clearly list `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`.
- If WalletConnect project id is missing, avoid crashes and show a clear UX.

## Done (Acceptance)
- Vercel deploy URL added to README
- `pnpm build` passes locally
- App works on Vercel
- Missing env var does not crash the app (fallback or message)

## Minimal-change strategy
- Do not add CI/CD; keep it simple and reproducible

## Suggested commit message
chore: prepare vercel deploy
