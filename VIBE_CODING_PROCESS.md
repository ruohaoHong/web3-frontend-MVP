# VIBE_CODING_PROCESS

> Purpose:
> This document explains the *process* I used to build this repo in small, demoable steps.
> It is not a spec or roadmap. It’s meant to be practical, scannable, and reproducible.

---

## Core Principles

- Each commit is **runnable** (`pnpm dev`) and **demoable** (adds one visible capability).
- Keep changes **small**:
  - Prefer minimal diffs over big refactors.
  - Avoid touching unrelated files.
- Always include **verification** (how to confirm it works).
- Always note **risk** (most likely pitfall) and **rollback** (how to revert safely).
- Prefer **user-facing clarity**:
  - Product UI stays clean.
  - Process notes live in docs (`DEVLOG.md`, this file).

---

## Workflow Loop (per commit)

1) Define the *one thing* this commit delivers  
2) Implement with minimal changes  
3) Verify locally (run + click path)  
4) Write a short DEVLOG entry:
   - Goal / Files / Verify / Risk / Rollback / Next  
5) Commit with a clear message

---

## Commit Rhythm (12-commit style)

> The exact commit count may vary, but the rhythm stays the same:
> wire → show → guard → read/write → lifecycle → polish/docs/deploy

### Example cadence
- Commit 1: Project bootstrap (Next.js + TS + Tailwind)
- Commit 2: Web3 providers wiring (wagmi + RainbowKit)
- Commit 3: Connect wallet UI
- Commit 4: Account info (address / chain / balance)
- Commit 5: Network switch + wrong network gating
- Commit 6: Sign message flow
- Commit 7: ERC20 read (balanceOf)
- Commit 8: ERC20 write (transfer submission)
- Commit 9: Tx lifecycle + explorer links (including replacement tx handling)
- Commit 10: `/vibe` mini tool
- Commit 11: README + screenshots + run instructions
- Commit 12: Deploy + final polish (optional)

---

## What “Done” Means (Quality Bar)

A commit is “done” only if:

- `pnpm dev` runs with **no errors**
- Feature works via a simple click path:
  - e.g. connect → switch → sign → read → write → tx status
- No **red console errors** / **unhandled rejections**
- Known pitfalls are explicitly avoided:
  - Hydration mismatch
  - `WagmiProviderNotFoundError`
  - React “setState in effect” cascading renders warning
  - MetaMask replacement tx (speed up/cancel) causing stuck pending or wrong hash links

---

## Risk Patterns & How This Repo Avoids Them

### 1) Hydration mismatch
- Avoid SSR/client divergence in UI trees.
- Prefer stable first render, then enhance on client if needed.

### 2) Provider readiness
- Ensure WagmiProvider exists before hooks render.
- Prefer “safe initial config” → then extend connectors after mount.

### 3) React effect pitfalls
- Avoid synchronous `setState` inside `useEffect` when possible.
- Prefer deriving UI state from hook outputs or event handlers.

### 4) MetaMask Speed up / Cancel (replacement tx)
- Treat “tx hash” as *replaceable*.
- Follow replacement via receipt-wait hooks (`onReplaced`) and update tracked hash.

---

## Where Things Live

- Product functionality:
  - Home route: Web3 MVP
  - `/vibe`: UI token preview tool
- Process memory:
  - `DEVLOG.md` — per-commit factual notes (verify/risk/rollback)
  - (Optional) `PROMPTS.md` — exact prompts used per commit

---

## Optional: Prompting Style (if using AI tools)

> Keep prompts small and explicit. One capability per prompt.
> Always include guardrails (files touched, constraints, “no external API”, etc.)

Template:
```txt
Goal: <one thing>
Constraints:
- Keep changes minimal
- Touch <= N files
- Avoid known pitfalls: <list>
Deliverables:
- Files to edit:
- Full code:
- Verify checklist:
```

---

## Appendix (Optional)

- Links:
  - DEVLOG: `DEVLOG.md`
  - Prompts: `PROMPTS.md` (if present)
