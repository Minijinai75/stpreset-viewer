# stpreset-viewer — SillyTavern 繁中轉換工具箱

下載了角色卡或預設但不知道裡面寫什麼？拖進去就能看。

**線上版**：https://minijinai75.github.io/stpreset-viewer/

## 工具一覽

| 工具 | 支援格式 | 說明 |
|------|---------|------|
| 預設檢視器 | `.json`（ST preset） | 預覽提示詞內容與採樣參數 |
| 世界書檢視器 | `.json`（lorebook） | 查看觸發關鍵字、條目內容、插入位置 |
| 角色卡檢視器 | `.png` / `.json` | 顯示角色描述、開場白、範例對話、創作者備註 |
| 正則檢視器 | `.json`（regex script） | 列出所有正則規則與替換目標 |

## 功能

- **拖放或選擇檔案**即可預覽
- **PNG 角色卡解析**：直接讀取 PNG 內嵌的 tEXt chunk（V2/V3 卡片格式皆支援）
- **簡→繁轉換**：OpenCC 引擎，世界書與角色卡額外套用台灣用語詞庫
- **詞庫轉換逐筆還原**：轉換後每筆詞彙替換旁有「還原」按鈕，可個別回退不想要的轉換
- **編輯與匯出**：修改欄位後匯出 JSON 或 PNG（保留原始圖片）
- **本機處理**：所有檔案只在瀏覽器解析，不會上傳

## 使用方式

用瀏覽器直接開 `index.html`，或從各工具頁面進入。零外部依賴（OpenCC 已內嵌）。

## 相關工具

- [Chat-to-ST Converter](https://github.com/Minijinai75/chat-converter) — 對話紀錄轉換器，Gemini/GPT 對話轉酒館 .jsonl

## 作者

[Mini / Minijin](https://portaly.cc/minijinai75) · [Discord](https://discord.gg/4vphMtzzEP)
