[English](./README.md) | [繁體中文](./README.zh-TW.md)

`This MVP focuses on safe wallet UX and transaction lifecycle state handling, which maps to trading/analytics UI reliability.`

# Web3 Frontend MVP + /vibe

Two resume-ready mini projects in one repo:

- **Main: Web3 Frontend MVP** (wallet connect, network switching, signing, contract read/write, tx lifecycle + explorer links)
- **Side: /vibe** (frontend-only AI-assisted UI iteration tool: small inputs → premium/calm UI preview + tokens)

---

## Demo

- Live demo: `https://web3-frontend-mvp.vercel.app/`

> Note: If `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is missing, injected wallets (e.g., MetaMask) should still work. WalletConnect options may be limited, but the app should not crash.

### How to test (recommended)
- Use a **test wallet** and small test funds only.
- Why Sepolia + Linea Sepolia: a widely-used L1 testnet + an L2 testnet, good for demonstrating **network switch** and **explorer differences**.
- Get test ETH (keywords): **"Sepolia faucet"**, **"Linea Sepolia faucet"**.

## 30-second tour

1) Open the demo: `https://web3-frontend-mvp.vercel.app/`
2) Click **Connect** and connect with an injected wallet (MetaMask).  
3) Try **Network switch**: Sepolia ↔ Linea Sepolia (and see **Wrong network gating** when unsupported).
4) Try **Sign message** and copy the signature.
5) Try **ERC20 read**: click “Use demo token” → see `balanceOf` (raw).
6) Try **ERC20 transfer** and watch **TxStatus** (pending → success/error) with explorer links.
7) Visit `/vibe` and tweak theme/radius/spacing → copy the generated CSS tokens.

---

## Screenshots

- Home (Web3 MVP)  
  ![Home](./public/screenshots/home.png)

- /vibe  
  ![/vibe](./public/screenshots/vibe.png)

---

## What it is

### Web3 Frontend MVP (Home)
A demoable, verifiable Web3 frontend covering common wallet flows and contract interactions:

- Connect wallet (RainbowKit)
- Show address / chain / native balance
- Supported network switch: Sepolia ↔ Linea Sepolia
- Wrong network state + gating (Web3Guard)
- Sign message (`useSignMessage`)
- ERC20 read: `balanceOf` (optionally read `decimals()` for formatting)
- ERC20 write: `transfer` (this MVP assumes 18 decimals and shows it in UI)
- Tx lifecycle: pending/success/error + chain-aware explorer links  
  - Detects MetaMask **Speed Up / Cancel** as replacement transactions and continues tracking the **latest hash** (no stale explorer links)

### /vibe (AI-assisted UI mini tool)
A deploy-safe, frontend-only UI iteration sandbox:

- Inputs: accent theme / radius / spacing density / keyword (luxury) / light|dark
- Preview: Card + Buttons + Input + Badge + Empty state + Validation state
- Output: real-time CSS variables tokens (the preview is actually driven by these tokens)
- Copy tokens (clipboard) + success message (fallback message if clipboard is unavailable)
- No external APIs

## Development approach (AI-assisted)

If you want to review how this repo was built (traceable and demoable commits):

- `DEVLOG.md` — per-commit notes: verification steps, risks, rollback strategy
- `PROMPTS.md` — prompts used for each commit (what was asked / implemented)
- `VIBE_CODING_PROCESS.md` — my AI-assisted workflow + guardrails

---

## Features (scannable)

### Feature → Source map

| Feature | Source (entry points) |
|---|---|
| Wrong network gating | `src/components/web3/Web3Guard.tsx` |
| Post-connection network switch | `src/components/web3/NetworkCard.tsx` |
| Account info (address/chain/balance) | `src/components/web3/AccountCard.tsx` |
| Sign message | `src/components/web3/SignMessageCard.tsx` |
| ERC20 read (`balanceOf`) | `src/components/web3/ContractReadCard.tsx`, `src/abi/erc20.ts` |
| ERC20 write (`transfer`) | `src/components/web3/ContractWriteCard.tsx`, `src/abi/erc20.ts` |
| Explorer links (chain-aware) | `src/hooks/useExplorerLink.ts` |
| Replacement tx tracking (Speed Up / Cancel) | `src/hooks/useTxState.ts` + `src/components/web3/TxStatus.tsx` |

### Wallet & Network
- RainbowKit connect wallet
- Account info: shortened address, chain name + chainId, native balance
- Post-connection network handling:
  - Supports Sepolia / Linea Sepolia
  - If user switches to an unsupported chain in the wallet → show **Wrong network** + gate Web3 actions

### Signing
- Sign message: input → wallet prompt → show signature
- Friendly reject errors (not just console logs)

### Contracts
- ERC20 Read: `balanceOf` (token address input + demo token)
  - Raw display (uint256 / BigInt)
  - Optional: read `decimals()` and format
  - Resets card state on supported-chain switch (avoid chain-specific token confusion)
- ERC20 Write: `transfer(to, amount)`
  - Basic validation: `to` must be an address, `amount > 0`
  - Show tx hash after submission
  - Amount assumes 18 decimals (explicit in UI)

### Tx Lifecycle + Explorer
- pending → success/error (receipt confirmation)
- chain-aware explorer links:
  - Sepolia → Etherscan
  - Linea Sepolia → LineaScan + Linea Explorer (multiple explorers to reduce indexing lag impact)
- MetaMask replacement transactions (speed up / cancel):
  - Detects replacement and tracks the latest hash
  - Shows replaced/repriced/cancelled reason when available

---

## Tech Stack
- Next.js (App Router) + TypeScript
- Tailwind CSS (v4)
- wagmi + viem
- RainbowKit
- TanStack Query (React Query)

---

## Setup

### Prerequisites
- Node.js (recommended >= 18)
- pnpm

### Install
```bash
pnpm install
```

### Env
This project uses `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` (recommended in `.env.local`, not committed).

1) Create `.env.local`
```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=YOUR_PROJECT_ID
```

**Security note (WalletConnect Project ID)**
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is a **public identifier** (used client-side). Treat it as public, and protect your quota with **allowed-origins/domain allowlisting** plus **usage monitoring/limits** in the WalletConnect dashboard.
- To reduce abuse/quota drain, configure an **Allowed Origins** (domain allowlist) for the project in the WalletConnect dashboard (e.g., only your Vercel domain and `http://localhost:3000`).
- Never store it as a secret; instead, enforce origin restrictions and monitor usage to prevent unauthorized traffic.

Example allowlist:
- `https://web3-frontend-mvp.vercel.app`
- `http://localhost:3000`

2) `.env.example` is provided as a reference.

> Without a project id:
> - Injected wallets (e.g., MetaMask) should still work
> - WalletConnect-related flows may be limited

### Run
```bash
pnpm dev
```

Open:
- Home: `http://localhost:3000`
- Vibe: `http://localhost:3000/vibe`

### Build / Start
```bash
pnpm build
pnpm start
```

---

## Deploy (Vercel)

### Steps
1) Import this GitHub repo into Vercel
2) Framework preset: Next.js (auto-detected)
3) (Optional) Add Env Var:
   - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
4) Deploy

### Verify after deploy
- Home and `/vibe` both load
- Wallet connect works (MetaMask injected should work even if WalletConnect project id is not set)
- Switching networks and tx lifecycle UI work as expected

---

## Quick Verification Checklist

### Home (Web3 MVP)
- Connect wallet successfully
- AccountCard shows:
  - shortened address
  - chain name + chainId
  - native balance
- NetworkCard:
  - switching between Sepolia / Linea Sepolia works
  - switching to an unsupported chain → Wrong network + Web3 section is gated
- SignMessageCard:
  - signing shows signature
  - reject shows friendly error
- ContractReadCard:
  - token address input or “Use demo token” → shows `balanceOf`
  - formatting mode (if enabled) reads decimals and displays formatted balance
- ContractWriteCard + TxStatus:
  - transfer submission shows pending immediately
  - success shows explorer links after confirmation
  - reject shows friendly error (no hash)
  - MetaMask Speed Up / Cancel updates tracking to the replacement hash (no stale pending)

### /vibe
- Changing inputs updates the preview immediately
- Empty state / validation state works
- Tokens can be copied (or fallback message shows)
- Preview is driven by tokens (bg/surface/shadow/blur/space/radius reflect changes)

---

## Known assumptions / limitations

### Contracts
- ERC20 transfer amount currently **assumes 18 decimals** (explicit in UI).  
  *(Tradeoff for MVP; can be improved by reading `decimals()` and converting.)*
- ERC20 read defaults to **raw** `balanceOf` (uint256 / BigInt).  
  Formatting via `decimals()` is optional (kept small for MVP scope).
- Demo token addresses are **chain-specific** (Sepolia vs Linea Sepolia).

### Wallet / Networks
- Supported chains: **Sepolia ↔ Linea Sepolia** (to demonstrate L1/L2 testnet switching + explorer differences).
- Frontend-only demo (no backend, no indexer).

---