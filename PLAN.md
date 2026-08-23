# 合成大果（`pg-fruitmerge`）— 遊戲規劃文檔

> **用途：** 本 repo 的遊戲權威規格——coding agent 改動前必讀：這個遊戲是什麼、規則、設計限制、優化方向。
> **整理方式：** 從本 repo 實作反向整理（2026-08-23）。**改玩法先改此檔再改碼**；本檔與程式碼衝突時，以「規則（§3）」描述的設計意圖為準回報差異。
> **上游契約：** [PG-GAME-AGENT-GUIDE.md](https://github.com/sampot/playgrounds/blob/main/docs/PG-GAME-AGENT-GUIDE.md)（唯一必讀；本檔不重複其全文）· 型錄條目 `playgrounds/catalog/entries/pg-fruitmerge.yaml`

## 1. 一句話

瞄準杯口放下水果、同級相碰合成更大一級的物理堆疊遊戲——水果越過紅線即出局，致敬「合成大西瓜」類型玩法，非任一商業作品復刻。

## 2. 定案速覽

| 項 | 值 |
| --- | --- |
| catalog id / kind / series | `pg-fruitmerge` / `game` / `懷舊` |
| status | `listed` |
| 模式 | 單人單局制；杯滿即終局 |
| 階數 | **8** 級：🍒🍓🍊🍎🍐🍑🍍🍉（`TIERS`）；半徑 `14 + tier×4`（14→42） |
| 物理 | 重力 280 px/s²；60fps rAF，dt 上限 0.025s |
| 素材 | Canvas 程序繪製（emoji＋HSL 圓）；`assets/` 另有 Kenney 圖檔（**未接入繪製**） |
| 交付形 | 純 HTML＋CSS＋ESM JS；無 build；`npx vitest run` 測試 |

## 3. 完整規則（現行實作）

### 3.1 場地與掉落

- 邏輯畫布 **300×400**：左右牆 x=0/300（出界鉗回）、杯底 y=390（`y+r>390` 貼底，反彈 ×−0.18，|vy|<8 歸零）；紅色虛線危險線 **y=45**。
- 掉落：`dropFruit(s, aim)` 在 y=25 生成 `s.next` 級水果，x 鉗在 20–280；落地冷卻 **0.45s**。
- 待生成等級 `next = floor(rand×3)`：只會是前三級（🍒🍓🍊）之一。

### 3.2 合併與分離（`stepWorld`）

- 同級且圓心距 < 兩半徑和 → 合併：兩顆移除、於中點生成高一級（`tier+1`，上限第 8 級🍉不再合併）、向上初速 vy=−20；得分 **10×2^tier**（🍒合=10 … 🍍合🍉=640）。
- **每個 sim step 至多合併一對**（命中即 `break outer`）；連鎖靠逐幀自然發生。
- 不同級重疊：沿法線各推 `(min−d)/2` 分離，速度阻尼 ×0.7。

### 3.3 出局判定

- `isOverflow`：任一「已沉澱」水果（`settled > 0.5s`）其頂緣 `y − radius < 45` → over。剛落下的水果有約半秒寬限，避免誤判。
- 出局後 overlay 顯示本局分數；物理停止更新（僅剩繪製）。`saved` 旗標保證每局只寫一次最高分。

### 3.4 HUD 與狀態訊息

HUD 三欄：分數／下一顆／最大果；訊息列提示「點杯口瞄準，或按下方按鈕放果」。出局面板「杯子滿了！」＋再合一次按鈕。禁原生對話框。

## 4. 操作與畫面

| 輸入 | 動作 |
| --- | --- |
| 指標在畫布移動 | 瞄準線跟隨（換算邏輯座標，鉗 15–285） |
| 點畫布 / 「放下水果」鈕 | 於瞄準線掉落（冷卻 0.45s） |
| 出局面板「再合一次」 | 新局（不需確認） |

- 水果以 `hsl(tier×42,75%,58%)` 底色圓＋emoji 字元繪製；杯壁白框、紅線虛線、頂部短瞄準線。
- Mobile-first：畫布 `width:100%` 縮放；主操作為點擊而非 hover。

## 5. 持久化（KV 權威）

| key | 內容 | 讀寫時機 |
| --- | --- | --- |
| `pg-fruitmerge-best` | 最高分純文字數字 | **僅寫不讀**：出局時 PUT 一次（`saved` 旗標防重複） |

- 已正確使用遊戲前綴（與 merge2048 的裸 `highscore` 不同鍵，無互相覆寫問題）。
- 缺口：UI 從未 GET 回讀，畫面也沒有「最佳」欄——玩家看不到自己的紀錄（見 §9）。
- 未用 localStorage；`functions.js` 僅 stub。

## 6. 美術／音效／署名

- `assets/`：Kenney [Food Kit](https://kenney.nl/assets/food-kit) 7 張水果 PNG（cherries/strawberry/orange/apple/pear/pineapple/watermelon；**缺 peach、無 grape**），CC0 1.0，原授權副本 `assets/License.txt`——詳 `ATTRIBUTION.md`（CC0 不要求仍照慣例署名）。**但 `app.js` 實際以 emoji＋色圓繪製，PNG 目前未被任何程式引用**，僅隨 `sam-manifest.json` 出貨。
- **無音效**（無 WebAudio 也無音檔）。
- 新增素材一律拷進 `assets/`、更新 `ATTRIBUTION.md`、同步 `sam-manifest.json` files 清單。

## 7. 測試（`npx vitest run`，僅 `game.test.js`）

現有覆蓋（4 例）：掉落帶入佇列等級（首顆 tier 0）、同級接觸合成為一顆升級果、半徑隨級成長、沉澱果越線偵測（自訂 line 參數）。

缺口與最小必測建議：合併得分公式（10×2^tier）、第 8 級不再合併、`isOverflow` 寬限（settled ≤0.5 不算）、牆/底鉗制、出局後 `dropFruit` 無效。改動物理或計分前先補上述失敗測試。

## 8. 硬約束（不可違反）

1. 僅 HTML＋CSS＋ESM JS；**無 build**、不入庫 `node_modules`、不安套件；工具一律 `npx <pkg>` 臨時執行。
2. 禁瀏覽器原生 `alert`／`confirm`／`prompt`；確認一律頁內 UI。
3. Mobile-first；主操作不可 hover-only。
4. 分數以 `/api/kv/{key}` 為權威；禁止裸 `localStorage` 當權威。
5. 不自行載入 `sdk.js`；宿主注入 `window.PG`。本作用 vanilla canvas，勿無故引入框架。
6. 改動可執行邏輯前先寫失敗測試（TDD）。
7. 檔案清單變動須同步 `sam-manifest.json`（含 assets PNG）。

## 9. 優化建議（可玩性與樂趣）

依優先級；實作前先在此登記並補測試。原則：強化手感與目標感，不改變「落下合成、杯滿出局」的核心認同。

**高優先**

1. **最佳分讀回並顯示**：開局 GET `pg-fruitmerge-best`、HUD 加「最佳」欄、破紀錄當場提示——現在只寫不讀，等於沒有長期目標。
2. **升階鏈圖鑑**：側欄常駐 🍒→🍉 升級鏈與已達成的最大果，新手不必猜「什麼能合什麼」，也給收集感。
3. **合出西瓜的慶祝**：最大級達成時全屏閃光＋震動＋獨立音色；這是目前最難的一步，值得儀式感。

**中優先**

4. **WebAudio 合成音效**：落下（噗）、合併（音高隨 tier 升）、近線警告、出局四音色，比照系列 `audio.js` 模式附開關。
5. **危線預警**：最高堆疊接近 y=45 時紅線加粗發光或心跳脈衝，把抽象閾值變成可感知壓力。
6. **連鎖 combo 加成**：一次落下觸發多層合併時分數乘係數（如 ×1.5/×2），鼓勵布局型打法。

**低優先**

7. **Kenney PNG 接入或下架**：已署名出貨卻未使用；要么以貼圖取代 emoji 提升質感（需處理 peach 缺件），要么從 manifest 移除減少下載體積。
8. **每日種子挑戰**：固定 RNG 種子的日挑模式（`next` 序列可重現），KV 存每日最佳，增加回流理由。
