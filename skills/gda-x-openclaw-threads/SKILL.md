---
name: gda-x-openclaw-threads
description: 在 X (Twitter) 上搜尋 OpenClaw / AI 相關推文，並製作 Threads 帖子。適用於：(1) 調研 OpenClaw 熱門話題，(2) 製作社群內容，(3) 追蹤趨勢。
---

# GDA X OpenClaw Threads 製作工具

## 功能

自動搜尋 X (Twitter) 上關於 OpenClaw 或 AI 的熱門推文，並製作成台灣繁體中文的 Threads 帖子。

## 觸發關鍵字

- 搜尋 OpenClaw
- 找 AI 熱門貼文
- 製作 Threads
- OpenClaw 趨勢
- X 熱門話題

---

## 📝 素材模板

每次生成新的素材文件時，**必須使用 `data/Template.md` 模板格式**。

模板位置：`data/Template.md`

模板格式包含：
- 收集時間、數據來源、關鍵詞
- Top 熱門推文（按觀看量排序）
- 每條推文包含：原文連結、原文內容、Threads 改編、互動數據
- 筆記說明

---

## 工作流程

### Step 1: 搜尋 X 上的推文

使用瀏覽器工具開啟 X 搜尋頁面：

```
# OpenClaw 搜尋
https://x.com/search?q=openclaw&src=typed_query&f=live

# AI 搜尋
https://x.com/search?q=AI&src=typed_query&f=live

# OpenAI 搜尋
https://x.com/search?q=OpenAI&src=typed_query&f=live

# Claude 搜尋
https://x.com/search?q=Claude+AI&src=typed_query&f=live
```

選擇「最新」(Latest) 分頁，確保取得最新推文。

### Step 2: 等待頁面載入

執行 `browser snapshot` 取得頁面內容，確認推文已載入。

### Step 3: 過濾推文

從搜尋結果中篩選：

1. **時間過濾**：只選 24 小時內的推文
2. **內容過濾**：
   - 排除涉及中國時政的內容
   - 排除可能引起爭議的帳號
   - 保留技術討論、商業應用、產品測評等內容
3. **選擇標準**：
   - 有獨特觀點
   - 具討論性
   - 適合社群傳播
   - 有圖片/影片者優先

### Step 4: 提取數據

從每條推文提取：
- 帳號名稱與 ID
- 推文內容
- 觀看次數、轉發數、點讚數
- 圖片/影片連結
- 推文連結

### Step 5: 製作成 Threads 帖子

將選定的推文改寫為台灣繁體中文的 Threads 格式：

```
🧵 【標題】

@帳號：推文內容摘要

**相關連結：**
- 原始推文：https://x.com/...
- 媒體（圖片/影片）：https://x.com/.../photo/1 或 .../video/1

#OpenClaw #相關標籤
```

### Step 6: 輸出格式

每條 Threads 應包含：
- 標題序號（如 🧵 【1】）
- 改寫後的內容（繁體中文）
- 原始推文連結
- 媒體連結（X 推文本身）
- 相關 hashtags
- 不超過 500 字

---

## 📝 OpenClaw 熱門推文素材庫（2026年3月）

### TOP 10 熱門推文

| # | 作者 | 時間 | 內容摘要 | 熱度 |
|---|------|------|----------|------|
| 1 | **@ai_muzi** | 3/12 | 開源 OpenClaw 控制中心！可看 Token 消耗、健康狀態、Agent 活動 | 28萬觀看 |
| 2 | **@iamlukethedev** | 3/14 | 如果 OpenClaw agents 不去健身房，你的設定有問題。於是我給 3D 辦公室加了健身房🏋️ | 22萬觀看 |
| 3 | **@IndieDevHailey** | 3/8 | 發現一個統計 OpenClaw 賺多少錢的網站！132個項目、最近30天收入$29萬+ | 18萬觀看 |
| 4 | **@iamlukethedev** | 9小時前 | 給 3D 辦公室加了清潔人員🧹，新對話時會自動打掃 | 8,388觀看 |
| 5 | **@GithubProjects** | 3/13 | 127+ 高品質 OpenClaw skills 整合庫！AI/DevOps/自動化和更多 | 4.4萬觀看 |
| 6 | **@Salad_Chefs** | 廣告 | OpenClaw 用 per-token API = $59/天，用 SaladCloud = $3.84/天 | 2.9萬觀看 |
| 7 | **@hubz_yuma** | 22小時前 | (日文) 經歷過那些風波後，OpenClaw 做了很多防止用戶流失的措施和新功能 | 482觀看 |
| 8 | **@shadowcompute** | 26秒前 | OpenClaw 幫我規劃蜜月旅行！為了省錢它訂了灰狗巴士🚌 | 最新🔥 |
| 9 | **@onenewbite** | 14秒前 | 給 OpenClaw 一個任務，不到3分鐘就做好了一個短影片！ | 最新 |
| 10 | **@iamlukethedev** | 23小時前 | OpenClaw 3D 辦公室展示影片 | 5,047觀看 |

---

## 📝 Threads 帖子範例

### 🧵 【1】開源你的 OpenClaw 控制中心！

```
@ai_muzi 木子不写代码 開源了一個超實用的 OpenClaw 控制中心！

這個面板可以：
✅ 看哪些任務燒了多少 Token（百分比）
✅ 看整個 OpenClaw 現在健不健康
✅ 看每個 Agent 現在在幹嘛，有沒有卡住
✅ 直接查看和修改 Agent 的記憶、人設、任務文檔
✅ 看定時任務和心跳任務有沒有正常在跑

這才是真正的「掌握全域」啊～

[影片](https://x.com/ai_muzi/status/2032032878855348702)

#OpenClaw #開源 #AI #自動化
```

觀看：28.5萬 | 轉發：308 | 點讚：1,338

---

### 🧵 【2】OpenClaw 也有 3D 健身房了！

```
@iamlukethedev Luke The Dev 又出新花招！

他說：「如果你的 OpenClaw agents 不去健身房，你的設定有問題。」

於是...他給 3D 辦公室加了健身房🏋️

當 agents 在學習或開發新技能時，會去訓練。
「就連 AI 工程師也需要練腿日！」

這畫面太美我不敢看 XDD

[影片](https://x.com/iamlukethedev/status/2032620613869723757)

#OpenClaw #AI #開發者 #有趣
```

觀看：22.2萬 | 轉發：159 | 點讚：1,742

---

### 🧵 【3】OpenClaw 賺了多少？有人幫你統計！

```
@IndieDevHailey 發現一個超猛網站！

專門統計用 OpenClaw 賺了多少錢👀

📊 目前榜單：
• 132 個 OpenClaw 項目
• 最近 30 天收入：$29萬+
• 最狠的項目：月收入 $51K

而且這些產品其實都很簡單：
• OpenClaw 一鍵部署
• AI Agent Hosting

看完只想說：我也來做一個！

[影片](https://x.com/IndieDevHailey/status/2030545813299142860)

#OpenClaw #創業 #被動收入 #AI
```

觀看：18萬 | 轉發：453 | 點讚：1,897

---

### 🧵 【4】OpenClaw 127+ Skills 整合庫！

```
@GithubProjects  сообщает：

OpenClaw agents 大升級！

這個 Repo 整理了 127+ 高品質 OpenClaw skills：
✅ AI 工具
✅ DevOps
✅ 網路自動化
✅ 生產力
✅ 前端/後端

不用從頭開始建技能，
一個來源，全部插上去就用！

[圖片](https://x.com/GithubProjects/status/2032246338759639291)

#OpenClaw #GitHub #DevOps #自動化
```

觀看：4.4萬 | 轉發：98 | 點讚：705

---

### 🧵 【5】OpenClaw 幫你規劃蜜月旅行！

```
@shadowcompute 回覆網友說：

OpenClaw 幫我規劃了整個蜜月旅行！

為了省錢，它幫我們訂了灰狗巴士🚌跨國旅行，
還查詢了 YMCA 的空房狀況。

這...這也太精打細算了吧 XDD

[推文](https://x.com/shadowcompute/status/2033354525440905528)

#OpenClaw #AI #旅行 #省錢
```

觀看：最新 | 轉發：0 | 點讚：0

---

### 🧵 【6】3分鐘做好一支短影片！

```
@onenewbite 分享他的體驗：

給了 OpenClaw 一個任務：
去他的「閃念筆記」裡找一個可以做短影片的 idea，做出來。

結果...
不到 3 分鐘就做好了！⏱️

這效率是要逼死誰啦～

[影片](https://x.com/onenewbite/status/2033354574665531797)

#OpenClaw #AI #短影片 #自動化
```

觀看：最新 | 轉發：0 | 點讚：0

---

### 🧵 【7】OpenClaw 健身房升級 - 清潔人員上線！

```
@iamlukethedev 又來了！

星期天適合打掃辦公室～
於是給 OpenClaw 3D 辦公室加了清潔人員🧹

當你開始新對話或說「new context」時，
他們就會進來打掃一切。

✅ Fresh context
✅ Clean office
✅ Happy agents

[影片](https://x.com/iamlukethedev/status/2033207456826835068)

#OpenClaw #AI #開發
```

觀看：8,388 | 轉發：3 | 點讚：192

---

### 🧵 【8】省錢大法：$59 → $3.84/天

```
@Salad_Chefs 幫你算好帳：

OpenClaw 用 per-token API：
💸 $59/天

用 SaladCloud：
💰 $3.84/天

省下來的都是錢啊～

[網站](https://salad.com/openclaw)

#OpenClaw #省錢 #AI #雲端
```

觀看：2.9萬 | 轉發：2 | 點讚：11

---

## 注意事項

- 確保推文時間在 24 小時內
- 移除任何政治敏感內容
- 保持內容中立客觀
- 使用適當的台灣用語
- 影片連結要分開列舉
- 數據（觀看/轉發/點讚）要標註清楚
- 定期更新素材庫（每週一次）
