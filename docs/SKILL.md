---
name: sillytavern-viewer-tools
description: >
  SillyTavern 預設詞預覽器（stpreset-viewer）與世界書預覽器（worldinfo-viewer）的架構與維護指南。
  當使用者要修改、擴充或 debug 這兩個工具網頁時，必須優先閱讀此 SKILL。
---

# SillyTavern Viewer Tools — SKILL 文件

本文件描述兩個純前端 HTML 工具的完整架構、資料模型、關鍵函數，以便 AI 快速理解並維護。

---

## 📁 檔案位置

| 工具 | 本機路徑 | GitHub Pages URL |
|------|---------|-----------------|
| 預設詞預覽器 | `stpreset-viewer/index.html` | https://minijinai75.github.io/stpreset-viewer/ |
| 世界書預覽器 | `stpreset-viewer/worldinfo-viewer.html` | https://minijinai75.github.io/stpreset-viewer/worldinfo-viewer.html |
| OpenCC 引擎 | `stpreset-viewer/lib/opencc-full.js` | （CDN 本地化，已 bundled） |
| 台灣詞庫 | `stpreset-viewer/lib/taiwan-vocabs.js` | （2013 條兩階段詞庫） |

> ⚠️ `tools/` 目錄下的版本是開發用副本，正式部署版本在 `stpreset-viewer/` 目錄。

---

## 🏗️ 共用架構原則

兩個工具都是**單檔 HTML**，沒有打包器、無框架，結構為：

```
<head>    → 引入 Font Awesome、Google Fonts、opencc-full.js、taiwan-vocabs.js
<style>   → 所有 CSS 變數與樣式
<body>    → 靜態 HTML 骨架（上傳區、預覽容器）
<script>  → 所有 JS 邏輯（狀態、解析、渲染、轉換、匯出）
```

### CSS 設計系統（兩者共用）

| 變數 | 色值 | 用途 |
|------|------|------|
| `--bg-primary` | `#F4F3EE` | 頁面背景 |
| `--bg-card` | `#FFFFFF` | 卡片背景 |
| `--text-primary` | `#463F3A` | 主要文字 |
| `--accent` | `#85BFD2` | 主色（按鈕、圖標） |
| `--accent-dark` | `#5A9BB5` | hover 狀態 |
| `--border` | `#D5D0C7` | 邊框 |
| `--success` | `#67c23a` | 成功、啟用 |
| `--warning` | `#E09F3E` | 警告色 |
| `--danger` | `#E76F51` | 錯誤、危險 |

---

## 📄 stpreset-viewer/index.html（預設詞預覽器）

### 資料模型

SillyTavern 預設詞 JSON 結構：

```json
{
  "name": "預設詞名稱",
  "prompts": [
    { "identifier": "unique_id", "name": "提詞名稱", "content": "內容", "enabled": true, "role": "system" }
  ],
  "prompt_order": [
    { "character_id": 100000, "order": [{ "identifier": "unique_id", "enabled": true }] }
  ],
  "new_chat_prompt": "...",
  "continue_nudge_prompt": "..."
}
```

### 核心全域變數

```js
let currentPreset = null;     // 當前載入的 preset JSON 物件
let originalFileName = '';    // 上傳的檔名（不含 .json 副檔名）
let editMode = false;         // 是否處於編輯模式
let modifiedPrompts = new Set(); // 已修改的 identifier 集合
let openccConverter = null;   // OpenCC 轉換器實體（延遲初始化）
```

### 關鍵函數索引

| 函數名稱 | 說明 |
|---------|------|
| `handleFile(file)` | 讀取並解析上傳的 JSON 檔案 |
| `getBestOrder(preset)` | 從 `prompt_order` 選出 order 最多的 character_id 條目（修正多 character_id 問題） |
| `getOrderedPrompts(preset)` | 按 `prompt_order` 排序，回傳帶 `_enabled` 屬性的 prompt 陣列 |
| `getEnabledPromptsCount(preset)` | 計算啟用的 prompt 數量 |
| `renderPreset(preset)` | 主渲染函數，依序產生 header、stats、prompt list 等 |
| `togglePrompt(identifier)` | 切換單一 prompt 的 enabled 狀態 |
| `toggleEditMode()` | 切換編輯/預覽模式並重新渲染 |
| `handlePromptEdit(identifier)` | 讀取 textarea 值並更新 currentPreset |
| `exportModifiedPreset()` | 將 currentPreset 序列化後下載為 JSON |
| `convertToTraditional()` | 四層簡→繁轉換（見下方轉換流程） |
| `hasChinese(text)` | 偵測字串是否含中文 |
| `applyVocabReplacement(text, vocabs)` | 套用詞庫批次替換 |
| `replaceLanguageDirectives(text)` | 將「简体中文/zh-cn」等替換為繁體 |

### 四層簡→繁轉換流程

```
原文
  ↓ 1. linguipediaVocabs（簡體詞彙，OpenCC 前）
  ↓ 2. OpenCC s2twp（字形轉換：简→繁）
  ↓ 3. taiwanChinaVocabs（繁體用語，OpenCC 後）
  ↓ 4. replaceLanguageDirectives（语言指令替換）
台灣繁體
```

轉換範圍：`name`（檔名）、`preset.name`、所有 `prompts[].name`、所有 `prompts[].content`、`new_chat_prompt`、`continue_nudge_prompt`、`regex_scripts`。

### 已知 Bug 與修正記錄

| Bug | 修正方式 |
|-----|---------|
| 多個 `character_id` 時只處理第一個 | 引入 `getBestOrder()` 選擇 order 最多者 |
| marker 類型 prompt 缺少 `enabled` 欄位 | `getOrderedPrompts` 中先讀 order entry 的 enabled，再 fallback 到 prompt.enabled，最後預設 true |

---

## 🌍 stpreset-viewer/worldinfo-viewer.html（世界書預覽器）

### 資料模型

SillyTavern World Info JSON 結構：

```json
{
  "entries": {
    "0": {
      "uid": 0,
      "key": ["觸發詞1", "觸發詞2"],
      "keysecondary": ["次要觸發詞"],
      "comment": "條目名稱（顯示用）",
      "content": "注入文字內容",
      "constant": false,
      "selective": true,
      "disable": false,
      "order": 100,
      "position": 0,
      "depth": 4,
      "probability": 100,
      "group": "",
      "sticky": 0,
      "cooldown": 0,
      "delay": 0
    }
  }
}
```

`position` 對照表：
- `0` → Before Char Defs（↑Before）
- `1` → After Char Defs（↓After）
- `2` → Before Author's Note
- `3` → After Author's Note
- `4` → At Depth（⊕ Depth，配合 `depth` 欄位）

### 核心全域變數

```js
let currentWorldInfo = null;  // 當前載入的 World Info JSON 物件
let originalFileName = '';    // 上傳的檔名（不含 .json）
let editMode = false;         // 是否在編輯模式
let modifiedEntries = new Set(); // 已修改的 entry key 集合
let openccConverter = null;   // OpenCC 轉換器（延遲初始化）
```

### 關鍵函數索引

| 函數名稱 | 說明 |
|---------|------|
| `handleFile(file)` | 讀取並解析 JSON，必須有 `entries` 欄位 |
| `getSortedEntries(wi)` | 將 entries 物件轉為陣列，按 order **降序**排列 |
| `renderWorldInfo(wi)` | 主渲染函數 |
| `renderEntryManager(entries)` | 渲染 Entry 清單（含 header、stats bar） |
| `renderEntryItem(entry, idx)` | 渲染單行 entry（圖標、名稱、key tags、order、position badge、tokens） |
| `renderEntryContent(entry)` | 渲染展開後的詳細內容（預覽模式或編輯模式） |
| `toggleEditMode()` | 切換編輯/預覽模式 |
| `handleEntryEdit(key, field, value)` | 更新 currentWorldInfo.entries[key] 的指定欄位 |
| `exportWorldInfo()` | 下載修改後的 JSON |
| `convertToTraditional()` | 四層簡→繁轉換（同 stpreset-viewer 流程） |
| `convertText(text)` | 對單一字串執行四層轉換（可重用） |
| `estimateTokens(text)` | 粗估 Token 數（字元數 / 4） |
| `getPositionLabel(pos)` | 回傳 position 對應的 badge 文字與 CSS class |
| `getEntryTypeIcon(entry)` | 根據 constant/selective/disable 回傳 FontAwesome 圖標 |

### 轉換範圍（worldinfo-viewer）

遍歷所有 `entries[key]`，轉換：`comment`、`content`、`key[]`、`keysecondary[]`，以及 `originalFileName`。

---

## 🔧 台灣詞庫（taiwan-vocabs.js）

包含兩個分類：

```js
taiwanVocabs[]         // 所有 2013 條詞彙（linguipedia + taiwan_china）
linguipediaVocabs[]    // 前 1251 條：簡體詞彙（OpenCC 前使用）
taiwanChinaVocabs[]    // 後 762 條：繁體在地化詞彙（OpenCC 後使用）
```

- 每條格式：`{ cn: "...", tw: "..." }`
- `cn` 欄位是要被替換的詞，`tw` 是對應的台灣用語

---

## 🚀 常見維護操作

### 新增 Entry 顯示欄位（worldinfo-viewer）

在 `renderEntryContent()` 的 `details` 陣列中加入：

```js
{ label: '新欄位', value: entry.newField },
```

### 新增 Prompt 顯示欄位（stpreset-viewer）

在對應的 `renderPromptItem()` 或 detail 區域中加入。

### 新增詞庫

直接在 `taiwan-vocabs.js` 的 `taiwanVocabs` 陣列中加入 `{ cn: "...", tw: "..." }`。  
注意前 1251 條為 linguipedia（簡體形式），後 762 條為 taiwan_china（繁體形式）。

### 推播更新步驟

```powershell
cd "H:\我的雲端硬碟\【0】AI WORK\研究酒館\stpreset-viewer"
git add .
git commit -m "fix/feat: 說明本次修改"
git push origin main
```

修改 `tools/` 目錄的代碼後，也需要同步複製到 `stpreset-viewer/`：

```powershell
Copy-Item "tools\worldinfo-viewer.html" "stpreset-viewer\worldinfo-viewer.html" -Force
Copy-Item "tools\lib\taiwan-vocabs.js" "stpreset-viewer\lib\taiwan-vocabs.js" -Force
```

---

## 📌 注意事項

- `opencc-full.js` 會在 `<head>` 中同步載入，並立即嘗試初始化 `openccConverter`；如失敗，`convertToTraditional()` 內有延遲初始化的 fallback。
- 兩個工具的 `convertToTraditional()` 函數架構相同，修改時請同步兩者。
- `taiwan-vocabs.js` 是共用的，修改後兩個 viewer 都會受影響。
