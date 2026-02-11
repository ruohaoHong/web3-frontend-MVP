# Web3 Frontend MVP + /vibe

兩個可投履歷的小作品放在同一個 repo：

- **主作品：Web3 Frontend MVP**（錢包連線、網路切換、簽名、合約讀寫、Tx lifecycle + explorer link）
- **副作品：/vibe**（純前端的 AI-assisted UI 迭代小工具：輸入少量參數 → 產生 premium/calm UI preview + tokens）

---

## Demo

- 線上 demo：`https://web3-frontend-mvp.vercel.app/`

> 註：若未設定 `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`，注入式錢包（例如 MetaMask）仍應可使用；WalletConnect 相關流程可能受限，但頁面不應崩潰。

### 推薦測試方式
- 建議使用 **測試錢包**，只放少量測試幣。
- 為何選 Sepolia + Linea Sepolia：主流 L1 測試鏈 + L2 測試鏈，能展示 **切鏈** 與 **explorer 差異**。
- 取得測試幣（關鍵字）：**「Sepolia faucet」**、**「Linea Sepolia faucet」**

## 30 秒導覽

1) 打開 Demo：`https://web3-frontend-mvp.vercel.app/`
2) 點 **Connect**，用瀏覽器錢包（MetaMask）連線  
3) 試 **切鏈**：Sepolia ↔ Linea Sepolia（切到不支援鏈會看到 **Wrong network gating**）
4) 試 **Sign message**：成功後可複製 signature
5) 試 **ERC20 read**：按「Use demo token」→ 看到 `balanceOf`（raw）
6) 試 **ERC20 transfer**：送出後看 **TxStatus**（pending → success/error）+ explorer link
7) 打開 `/vibe`：改主題/圓角/間距 → 複製 CSS tokens

---

## Screenshots

- Home (Web3 MVP)  
  ![Home](./public/screenshots/home.png)

- /vibe  
  ![/vibe](./public/screenshots/vibe.png)

---

## What it is

### Web3 Frontend MVP (Home)
一個「可 demo、可驗收」的 Web3 前端範例，涵蓋常見 wallet flow 與合約互動：

- Connect wallet（RainbowKit）
- 顯示 address / chain / native balance
- 支援鏈切換：Sepolia ↔ Linea Sepolia
- Wrong network 狀態 + gating（Web3Guard）
- Sign message（useSignMessage）
- ERC20 read：balanceOf（可選讀 decimals 進行格式化）
- ERC20 write：transfer（本 MVP 先假設 18 decimals，UI 有明示）
- Tx lifecycle：pending/success/error + chain-aware explorer link
  - 正確處理 MetaMask **Speed up / Cancel**（replacement tx）：會自動追蹤最新 hash，不會連到 dropped hash

### /vibe (AI-assisted UI mini tool)
純前端、deploy-safe 的 UI 迭代展示頁：

- Inputs：accent theme / radius / spacing density / keyword(luxury) / light|dark
- Preview：Card + Buttons + Input + Badge + Empty state + Validation state
- Output：即時生成 CSS variables tokens（preview 實際由 tokens 驅動）
- Copy tokens（clipboard）+ 成功提示（不支援時提供 fallback 提示）
- 不使用外部 API

## 開發方式（AI-assisted / Vibe Coding）

如果你想看整個過程（可溯源、可驗證的 commit）：

- `DEVLOG.md` — 每個 commit 的驗證方式 / 風險 / rollback
- `PROMPTS.zh-TW.md` — 每個 commit 的提示詞（做了什麼、怎麼做）
- `VIBE_CODING_PROCESS.zh-TW.md` — 我的 Vibe Coding 流程與守則

---

## Features (scannable)

### Feature → Source 對照

| 功能 | 對應程式碼（入口） |
|---|---|
| Wrong network gating | `src/components/web3/Web3Guard.tsx` |
| 連線後切鏈 | `src/components/web3/NetworkCard.tsx` |
| 帳戶資訊（地址/鏈/餘額） | `src/components/web3/AccountCard.tsx` |
| Sign message | `src/components/web3/SignMessageCard.tsx` |
| ERC20 讀取（`balanceOf`） | `src/components/web3/ContractReadCard.tsx`, `src/abi/erc20.ts` |
| ERC20 轉帳（`transfer`） | `src/components/web3/ContractWriteCard.tsx`, `src/abi/erc20.ts` |
| Explorer links（依鏈） | `src/hooks/useExplorerLink.ts` |
| Replacement tx 追蹤（加速/取消） | `src/hooks/useTxState.ts` + `src/components/web3/TxStatus.tsx` |

### Wallet & Network
- RainbowKit connect wallet
- Account info：address（縮短顯示）、chain name + chainId、native balance
- Post-connection network handling：
  - 支援 Sepolia / Linea Sepolia
  - wallet 手動切到 unsupported chain → 顯示 Wrong network + gating（避免錯網路操作）

### Signing
- Sign message：輸入訊息 → 錢包簽名 → 顯示 signature
- Reject 有人話提示（不只 console）

### Contracts
- ERC20 Read：balanceOf（token address input + demo token）
  - Raw 顯示（uint256）
  - 可選：讀 decimals 再 format
  - 支援鏈切換時會 reset 卡片狀態（避免 chain-specific token 混淆）
- ERC20 Write：transfer(to, amount)
  - 基本驗證：to 必須是 address、amount > 0
  - 送出後顯示 tx hash
  - Amount 目前假設 18 decimals（UI 明示）

### Tx Lifecycle + Explorer
- pending → success/error（receipt confirmation）
- chain-aware explorer links：
  - Sepolia → Etherscan
  - Linea Sepolia → LineaScan + Linea Explorer（多 explorer 降低 indexing 落差）
- MetaMask replacement tx（speed up/cancel）：
  - UI 會偵測 replacement，追蹤最新 hash，並顯示 replaced/repriced/cancelled

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
- Node.js（建議 >= 18）
- pnpm

### Install
```bash
pnpm install
```

### Env
本專案使用 `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`（開發建議放 `.env.local`，不 commit）。

1) 建立 `.env.local`
```bash
cp .env.example .env.local
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=YOUR_PROJECT_ID
```
**安全性說明（WalletConnect Project ID）**
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` 為前端使用的公開識別碼，請視為公開資訊。
- 建議在 WalletConnect Dashboard 設定 **Allowed Origins（網域白名單）**（僅允許 Vercel 網域與 `http://localhost:3000`），並搭配用量監控/限制以避免濫用與配額耗盡。

範例 allowlist：
- https://web3-frontend-mvp.vercel.app
- http://localhost:3000

2) repo 內已提供 `.env.example` 作為說明（可參考）

> 沒有 project id 時：
> - injected wallet（如 MetaMask）仍可用
> - WalletConnect 相關功能可能無法完整運作

### Run
```bash
pnpm dev
```
開啟：
- Home：`http://localhost:3000`
- Vibe：`http://localhost:3000/vibe`

### Build / Start
```bash
pnpm build
pnpm start
```

---

## 部署(Vercel)

### 步驟
1) 在 Vercel 匯入此 GitHub repo
2) Framework preset：Next.js（通常自動偵測）
3) 設定環境變數（可選）：
   - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
4) Deploy

### 部署後驗收
- `/` 與 `/vibe` 都能正常開啟
- 未設定 `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` 時頁面不會崩，MetaMask（injected）仍可連
- 設定 env 後，WalletConnect 相關選項可用
- 切鏈與 tx lifecycle UI 正常

---

## Quick Verification Checklist

### Home (Web3 MVP)
- Connect wallet 成功
- AccountCard 顯示：
  - address（縮短）
  - chain name + chainId
  - native balance
- NetworkCard：
  - 在 Sepolia / Linea Sepolia 間切換正常
  - 切到 unsupported chain → Wrong network + Web3 區塊被 gating
- SignMessageCard：
  - Sign 成功顯示 signature
  - Reject 顯示人話錯誤
- ContractReadCard：
  - 輸入 token address 或 Use demo token → 顯示 balanceOf
  - Format 開關可讀 decimals 後顯示 formatted
- ContractWriteCard + TxStatus：
  - Transfer 送出後立即 pending
  - 確認後 success + explorer link
  - Reject 顯示 error（無 hash）
  - MetaMask Speed up / Cancel：會自動追蹤 replacement hash，不會卡 pending

### /vibe
- 變更 inputs → preview 立即更新
- Empty state / validation state 正常
- Tokens 區可 copy（或顯示 fallback 提示）
- preview 真正由 tokens 驅動（bg/surface/shadow/blur/space/radius 都會反映）

---

## 已知假設 / 限制（Known limitations）

### Contracts
- ERC20 transfer 金額目前 **假設 18 decimals**（UI 有明示）。  
  （MVP 取捨；可改成讀 `decimals()` 後轉換）
- ERC20 read 預設顯示 `balanceOf` 的 **raw** 值（uint256 / BigInt）；格式化屬於可選（避免一次做太大）
- Demo token address **依鏈不同**（Sepolia / Linea Sepolia）

### Wallet / Networks
- 支援鏈：**Sepolia ↔ Linea Sepolia**（用來展示切鏈與 explorer 差異）
- 純前端 demo（無後端、無 indexer）

---