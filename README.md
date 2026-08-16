# 合成大果

Playgrounds SAM 小遊戲。系列：**懷舊**。純 HTML／CSS／JavaScript，無建置步驟，手機優先。

## 玩法

移動指標並點杯子或「放下水果」。兩顆同級水果接觸後合成更大一級，越過紅線即結束。

## 開發

```bash
npx --yes serve .
npx --yes vitest run
```

可用的遊戲會將最高分送往 Playgrounds host 的 `/api/kv/`；離線或獨立開啟時不影響遊玩。

## 檔案

- `game.js`：可測試的純遊戲邏輯
- `app.js`：DOM／Canvas 互動與呈現
- `functions.js`：Playgrounds Functions 入口

## 授權

程式碼採 MIT License，Copyright © 2026 Sampot。素材詳見 [ATTRIBUTION.md](ATTRIBUTION.md)。
