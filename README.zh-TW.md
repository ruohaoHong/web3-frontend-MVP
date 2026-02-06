# Web3 Frontend MVP + /vibe

兩個可投履歷的小作品放在同一個 repo：

- **主作品：Web3 Frontend MVP**（錢包連線、網路切換、簽名、合約讀寫、Tx lifecycle + explorer link）
- **副作品：/vibe**（純前端的 AI-assisted UI 迭代小工具：輸入少量參數 → 產生 premium/calm UI preview + tokens）

---

## Screenshots

> （本 repo 先附上 placeholder 圖，方便 README 完整。你可以隨時用真實截圖覆蓋同一路徑。）

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

## 開發方式（Vibe Coding） 
- 開發流程（中文）：`VIBE_CODING_PROCESS.zh-TW.md `
- 步驟提示詞（中文）：`PROMPTS.zh-TW.md `
- 每次 commit 記錄：`DEVLOG.md`

---

## Features (scannable)

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

## Notes / Limitations
- ERC20 transfer amount：目前假設 18 decimals（MVP 取捨，之後可改成讀 decimals）
- Demo token 為測試用途，且 token address 是 chain-specific（不同鏈可能不同）
- 全部為純前端 demo（無後端、無外部 API）

---