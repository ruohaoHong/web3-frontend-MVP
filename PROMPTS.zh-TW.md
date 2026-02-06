# Commit 1 — chore: init nextjs + ts + tailwind

## Prompt
Create a Next.js (App Router) + TypeScript + Tailwind project. Add a simple layout with Header and Container. Keep code minimal and clean.

## 目標
- 專案可跑、Tailwind 可用
- 有基本版型（Header + Container）

## 註記（避免誤會）
- 以「最小可跑」為主，不做設計系統、不加複雜元件
- Tailwind 若樣式沒生效，優先檢查 Tailwind v4 指令/設定是否對齊 Next App Router

## Done（驗收標準）
- `pnpm dev` 可正常啟動且無 error
- 首頁可看到基本版型（Header + Container）
- Tailwind class 有生效（背景/字體/間距至少一項可視化）

## 最小改動策略
- 只改動必要檔案：`layout.tsx` / `page.tsx` / `globals.css` + 少量 layout components

## 建議 commit message
chore: init nextjs + ts + tailwind


# Commit 2 — chore: add wagmi viem rainbowkit providers

## Prompt
Add wagmi v2 + viem + RainbowKit to a Next.js App Router project. Create `providers.tsx` and wrap it in `layout.tsx`. Use Sepolia as default chain.

## 目標
- Web3 基礎 wiring 完成（wagmi + RainbowKit + react-query）
- `.env.example` 補上 WalletConnect project id

## 註記（避免誤會）
- 目標是「先把 provider 接好」，先不做任何 Web3 UI（ConnectButton 留給下一個 commit）
- SSR / hydration 風險高：App Router 下建議 `providers.tsx` 使用 `use client`
- 缺 `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` 時應能 graceful fallback（至少 injected wallet 不受影響）

## Done（驗收標準）
- `pnpm dev` 可正常啟動
- App 正常渲染（沒有 `indexedDB is not defined` 或 hydration 類錯誤）
- `layout.tsx` 已包住 Providers
- `.env.example` 有 `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`

## 最小改動策略
- 新增 `src/app/providers.tsx`，並在 `src/app/layout.tsx` 包起來
- `chains` 先只用 `sepolia`（之後擴充給 network switcher）

## 建議 commit message
chore: add wagmi viem rainbowkit providers


# Commit 3 — feat(web3): connect wallet button

## Prompt
Add a `ConnectButton` component using RainbowKit. Place it on the home page inside a simple Card. Ensure no provider/hydration errors.

## 目標
- 首頁出現 Connect Wallet 按鈕
- 能完成連線並顯示已連線狀態

## 註記（避免誤會）
- Web3 元件必須渲染在 Providers 之內，避免 `WagmiProviderNotFoundError`
- 先求「能 demo」，UI 乾淨即可，不要一次做太多卡片/功能

## Done（驗收標準）
- 首頁顯示 Connect Wallet 按鈕
- 點擊可打開 RainbowKit modal 並完成連線
- 連線後顯示縮短地址 / 已連線狀態（RainbowKit 預設即可）
- console 無紅字（尤其是 provider/hydration 相關）

## 最小改動策略
- 新增 `src/components/web3/ConnectButton.tsx`
- `src/app/page.tsx` 加入 ConnectButton（可用簡單 Card 包起來）

## 建議 commit message
feat(web3): connect wallet button


# Commit 4 — feat(web3): account card (address + balance + chain)

## Prompt
Build `AccountCard` using wagmi hooks (`useAccount`, `useBalance`, and the connected chain info). Display:
- Address (shortened)
- Chain name + chainId
- Formatted native balance
Handle disconnected state gracefully. No unhandled console errors.

## 目標
- 連線後顯示 address / chain / native balance
- 斷線狀態有提示（不崩潰）

## 註記（避免誤會）
- chain 建議以 `useAccount().chain` 為主要來源（可以同時顯示 name + id）
- balance 格式化要清楚（顯示符號如 ETH、保留合理小數位）

## Done（驗收標準）
- 連線後 AccountCard 顯示：
  - address（縮短）
  - chain name + chainId
  - native balance（格式化）
- 未連線時顯示空狀態/提示（不顯示錯誤）
- console 無紅字 / unhandled rejections

## 最小改動策略
- 新增 `src/components/web3/AccountCard.tsx`
- `src/app/page.tsx` 把 AccountCard 放在 ConnectButton 下方
- 不做 ENS / Avatar / Indexer（MVP 先不加）

## 建議 commit message
feat(web3): account card (address + balance + chain)

# Commit 5 — feat(web3): network switcher

## Prompt
Implement `NetworkCard` with `useSwitchChain` for **post-connection** network handling.
Show current chain **name + chainId** from the **connected account**. Support switching between **Sepolia** and **Linea Sepolia**.
If the wallet is on an **unsupported chain**, show a clear “Wrong network” state and **gate the Web3 section** (disable/hide web3 actions).
Handle switch success/failure with user-friendly messages and **no unhandled console errors**.

## 目標
- 連線後（post-connection）顯示目前 chain（name + chainId）
- 使用者連線後在錢包手動切到非支援鏈 → 顯示 Wrong network + 引導切回
- 至少兩條鏈可切換：Sepolia ↔ Linea Sepolia

## 註記（避免誤會）
- 核心場景是「連線後網路被改掉」，而不是 connect flow 本身（connect 時 RainbowKit 可能會引導切到支援鏈）。
- 不要手打 chainId：一律用 `wagmi/chains` 內建的 `sepolia` / `lineaSepolia` 物件（避免 chainId/名稱/Explorer 設錯）。
- unsupported chain 判斷建議用 `useAccount().chain`：
  - 若已連線但 `chain === undefined` ⇒ 代表目前連到的鏈不在你的 wagmi config 內，視為 unsupported。
  - 避免用 `useChainId()` 來判 unsupported（遇到不在 config 的鏈可能誤判）。

## Done（驗收標準）
- NetworkCard 顯示 chain name + chainId（連線後）
- 兩個按鈕或 dropdown：Switch to Sepolia / Switch to Linea Sepolia
- 已在該鏈 → 對應按鈕 disabled（no-op）
- 若目前 chain 不在支援清單 → 顯示 Wrong network（清楚提示）
- Unsupported chain 時：Web3 區塊被 gating（提示 + 禁用互動）
- 切鏈失敗（Reject/不支援/請求被拒）→ UI 顯示人話錯誤（不只 console）
- console 無 red errors / unhandled rejections

## 最小改動策略
- providers：chains 從 `[sepolia]` 擴成 `[sepolia, lineaSepolia]`
- NetworkCard：用 `useAccount().chain` 顯示目前 chain；用 `useSwitchChain` 做切換 + error mapping
- 新增 `Web3Guard`：一次 gate 整個 Web3 區塊，不要每張卡重複判斷

## 風險
- 使用者切到不在 config 的鏈時，若判斷邏輯用錯 hook 可能誤判（所以用 `useAccount().chain`）。

## Rollback
- revert 本 commit，退回只支援單鏈的狀態

## 建議 commit message
feat(web3): network switcher (post-connection) + add linea sepolia


# Commit 6 — feat(web3): sign message flow

## Prompt
Implement `SignMessageCard` with `useSignMessage`. Provide input + Sign button.
Disable when disconnected or on unsupported chain (**use Web3Guard**). Display signature on success, user-friendly error on reject. No unhandled console errors.

## 目標
- Sign Message 跑通：輸入訊息 → Sign → 顯示 signature
- Reject 時顯示人話錯誤

## 註記（避免誤會）
- Sign Message 不上鏈、不花 gas，是身份驗證/授權流程示範
- unsupported chain 應由 Web3Guard 擋下（避免使用者在錯網路做任何 Web3 動作造成混亂；這是 MVP 的產品選擇）

## Done（驗收標準）
- input 可輸入訊息（提供預設 demo message）
- 點 Sign → 錢包跳窗 → 成功顯示 signature（可 copy）
- user rejected → 顯示明確提示（例：User rejected signature）
- disconnected：提示 + disabled
- unsupported chain：被 Web3Guard 擋下（提示 + disabled）
- console 無 red errors / unhandled rejections

## 最小改動策略
- 新增 `SignMessageCard` component
- 全部 gating 交給 Web3Guard（不要在 card 裡寫一堆 guard）

## 建議 commit message
feat(web3): sign message flow


# Commit 7 — feat(web3): add erc20 abi + token read

## Prompt
Add ERC20 ABI and implement `ContractReadCard` using `useReadContract` to read `balanceOf` for the connected address.
Provide a token address input with basic validation. Display balance (**raw acceptable**, optionally format using `decimals`). Guard via Web3Guard. Handle errors gracefully.

## 目標
- Contract Read 跑通（ERC20 `balanceOf`）
- token address 來源：使用者輸入 + 可提供預設
- decimals 策略清楚（可先簡化）

## 註記（避免誤會）
- Token address 是 chain-specific：不同鏈地址可能不同
- MVP 建議用雙模式：
  - 預設顯示 raw（BigInt）+ 標註「raw」
  - 可選：按下 “Format” 才去讀 `decimals()` 再格式化（避免一次做太大）

## Done（驗收標準）
- token address input（基本驗證：不是 address 不讀）
- 顯示 connected address 的 `balanceOf`
- decimals 策略符合以下之一：
  - A) raw 顯示 + 標註 raw
  - B) 同時讀 `decimals()` 並格式化
- disconnected / unsupported chain：由 Web3Guard 擋下
- read 失敗/合約不存在：有提示、不崩潰
- console 無 red errors

## 最小改動策略
- 新增 `abi/erc20.ts`
- 新增 `ContractReadCard`
- 不做 token 清單 / indexer / ENS

## 建議 commit message
feat(web3): add erc20 abi + token read


# Commit 8 — feat(web3): contract write (erc20 transfer)

## Prompt
Implement `ContractWriteCard` using `useWriteContract` to call ERC20 `transfer(to, amount)`.
Provide `to` + `amount` inputs with basic validation. Show tx hash after submission and map common errors (user rejected) to friendly UI.
Use Web3Guard. **Do not implement confirmation lifecycle yet.**

## 目標
- Contract Write 跑通（ERC20 transfer）：to + amount → 發送 → 顯示 tx hash

## 註記（避免誤會）
- 本 commit 只做到「送出 + 拿到 tx hash」
- pending/success（等待確認）留給 Commit 9
- amount 的單位策略要清楚（MVP 允許先簡化）：
  - Option A：先假設 18 decimals，UI 明示 “Assuming 18 decimals”
  - Option B：若 Commit 7 已做 decimals 讀取，則可沿用 decimals 轉換

## Done（驗收標準）
- to address + amount input
- 基本驗證：to 必須是 address；amount > 0
- 點 Transfer → 錢包跳窗 → 送出後顯示 tx hash
- user rejected → 人話錯誤
- disconnected / unsupported chain：由 Web3Guard 擋下
- console 無 red errors

## 最小改動策略
- 新增 `ContractWriteCard`
- 先 single-token（輸入 token address 或沿用 Commit 7 的 token address）

## 建議 commit message
feat(web3): contract write (erc20 transfer)


# Commit 9 — feat(web3): tx lifecycle ui + explorer links

## Prompt
Add `TxStatus` lifecycle UI: pending/success/error with **chain-aware explorer links** for Sepolia and Linea Sepolia.
After submission, show pending immediately; mark success when receipt is confirmed; show friendly errors (user rejected and reverted). Keep it **single-tx**.

## 目標
- tx lifecycle UI：pending/success/error + explorer link（chain-aware）

## 註記（避免誤會）
- Explorer link 必須依 chain 生成：
  - Sepolia: https://sepolia.etherscan.io/tx/<hash>
  - Linea Sepolia: https://sepolia.lineascan.build/tx/<hash>  (or https://explorer.sepolia.linea.build/tx/<hash>)
- 只支援「最後一筆 tx」即可，不做 multi-queue

## Done（驗收標準）
- pending：送出後立即顯示等待狀態
- success：確認後顯示成功 + explorer link
- error：顯示錯誤（含 user rejected / reverted）
- explorer link chain-aware（不同鏈 explorer base URL 不同）
- console 無 red errors / unhandled rejections

## 最小改動策略
- 抽 `useExplorerLink` 或 util function（chainId → baseUrl）
- `TxStatus` component 只負責顯示狀態，邏輯放 hook（例如 `useTxState`）

## 建議 commit message
feat(web3): tx lifecycle ui + explorer links


# Commit 10 — feat(vibe): add /vibe page (ai-assisted ui mini tool)

## Prompt
Create a `/vibe` page that demonstrates AI-assisted product UI iteration: a small interactive tool that takes user input and renders a polished UI preview.
Keep it purely frontend, visually clean, with empty states and basic validation.

## 目標
- 副作品完成：/vibe 可互動工具，展示 AI 輔助迭代 UI/互動能力

## 建議題材（最能展示你）
- Design Token Playground：輸入 base color / radius / spacing → 即時 preview 一組卡片與按鈕
- Spec-to-UI Card Generator：輸入需求句子（短）→ 產生 UI 卡片（固定模板 + 狀態）

## Done（驗收標準）
- `/vibe` route 存在且可互動
- input → 立即產生 UI 預覽
- 有 empty state / validation
- UI 看起來像產品（排版、間距、層級、狀態）

## 最小改動策略
- 一個 page + 少量 components 即可
- 不接外部 API，部署更穩

## 建議 commit message
feat(vibe): add /vibe page (ai-assisted ui mini tool)


# Commit 11 — docs: add README + screenshots + run instructions

## Prompt
Write a resume-ready README: describe the two projects (Web3 MVP + /vibe), list features, stack, setup instructions (including env), run commands, and include screenshots/GIFs.
Keep it concise and scannable.

## 目標
- 投遞用文件齊全：陌生人看 README 能跑、能懂、能驗收

## Done（驗收標準）
README 必含：
- What it is（主作品 + 副作品）
- Features（對應 commit 3–9）
- Stack（Next.js + TS + Tailwind + wagmi/viem + RainbowKit）
- Setup（含 `.env.example`、WalletConnect Project ID）
- Run commands
- Demo URL（若已 deploy）
- Screenshots/GIF（至少首頁 + /vibe）

## 最小改動策略
- README 用 checklist + 短段落
- 只放 1～2 張圖（太多反而噪音）

## 建議 commit message
docs: add README + screenshots + run instructions


# Commit 12 — chore: prepare vercel deploy

## Prompt
Prepare for Vercel deployment: ensure the app builds, document required env vars, and add the deployed URL to README.
The app should handle missing WalletConnect projectId gracefully (e.g., injected wallet still works or show a clear message).

## 目標
- 部署成功並文件化，讓作品可公開 demo

## 註記（避免誤會）
- `.env.example` 必列 `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
- 缺 env 時 app 不應崩潰：至少 injected wallet 仍可用，或顯示清楚提示

## Done（驗收標準）
- Vercel 部署成功，URL 放 README
- build 通過、線上可跑
- 缺 env 時仍可開啟頁面且不爆（有 fallback 或提示）

## 最小改動策略
- 不做 CI/CD；只做到「可部署、可重現」

## 建議 commit message
chore: prepare vercel deploy
