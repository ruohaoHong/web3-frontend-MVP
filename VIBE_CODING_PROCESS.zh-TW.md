# VIBE_CODING_PROCESS（中文）

> 目的：
> 這份文件說明我在此 repo 採用的「Vibe Coding」開發流程（每個 commit 都可跑、可驗收）。
> 它不是規格書、不是 roadmap，也不是硬性規則。重點是：可複製、可回溯、可維護。

---

## 核心原則

- 每個 commit 都要 **可執行**（`pnpm dev`）且 **可 demo**（新增一個可見能力）
- 變更保持 **最小**
  - 優先小 diff、避免大改與無關重構
  - 盡量避免同一個 commit 同時做多件事
- 每個 commit 都要有 **驗收方法**
  - 明確說「怎麼確認沒壞、功能可用」
- 每個 commit 都要有 **風險提示** 與 **回滾策略**
  - 具體描述「最可能踩的坑」
  - 一句話說明「炸了怎麼退回」

---

## 每個 Commit 的循環（Workflow Loop）

1) 定義這次 commit 只做「一件事」（一句話）
2) 實作（以最小改動達成）
3) 本機驗收（run + click path）
4) 寫 DEVLOG（Goal / Files / Verify / Risk / Rollback / Next）
5) commit（清楚的 message）

---

## Commit 節奏（12-commit 的典型拆法）

> commit 數量可彈性，但節奏固定：wire → show → guard → read/write → lifecycle → docs/deploy

範例節奏：
- Commit 1：專案初始化（Next.js + TS + Tailwind）
- Commit 2：Web3 providers wiring（wagmi + RainbowKit）
- Commit 3：Connect wallet UI
- Commit 4：帳戶資訊（address / chain / balance）
- Commit 5：切鏈 + wrong network gating
- Commit 6：Sign message flow
- Commit 7：ERC20 read（balanceOf）
- Commit 8：ERC20 write（transfer submission）
- Commit 9：Tx lifecycle + explorer link（含 replacement tx 處理）
- Commit 10：`/vibe` 小工具
- Commit 11：README + screenshots + run instructions
- Commit 12：Deploy + polish（可選）

---

## Done 的標準（Quality Bar）

一個 commit 要算完成，至少要符合：

- `pnpm dev` 無 errors
- 功能可用（簡單 click path 可跑通）
- console 無 red errors / unhandled rejections
- 已知坑有避開（列出最重要幾個）：
  - hydration mismatch
  - `WagmiProviderNotFoundError`
  - React `useEffect` 內同步 `setState` 造成 cascading renders 警告
  - MetaMask speed up/cancel（replacement tx）導致 stuck pending / wrong hash link

---

## 常見風險模式 & 本 repo 的處理方式

### 1) Hydration mismatch
- 避免 SSR / Client 初始 DOM 不一致
- 優先讓第一次 render 穩定一致，再做 client enhancement

### 2) Provider readiness
- 確保 hooks 一定在 WagmiProvider 之下
- 使用「安全的初始 config」→ 再擴充 connectors

### 3) React effect 的坑
- 盡量避免 effect body 直接 `setState`
- 優先用「推導狀態」或事件 handler 更新狀態

### 4) MetaMask Speed up / Cancel（replacement tx）
- tx hash 不是永久不變：可能被替換
- 追蹤 replacement（`onReplaced`）並更新目前顯示的 hash，避免 stuck pending

---

## 文件分工（Where Things Live）

- 產品功能：
  - Home：Web3 MVP
  - `/vibe`：UI tokens preview 工具
- 流程記錄：
  - `DEVLOG.md`：每個 commit 的可驗收紀錄（Verify / Risk / Rollback）
  - （可選）`PROMPTS.md`：逐 commit 的 prompts（若需要保留原始提示）

---

##（可選）Prompt 撰寫風格

> 一次一件事，明確列出約束與交付物。

模板：
~~~txt
Goal: <一句話說清楚這次只做什麼>
Constraints:
- keep changes minimal
- touch <= N files
- avoid known pitfalls: <list>
Deliverables:
- files to edit:
- full code:
- verify checklist:
~~~

---

## Appendix（可選）

- 連結：
  - DEVLOG：`DEVLOG.md`
  - Prompts：`PROMPTS.md`（如有）
