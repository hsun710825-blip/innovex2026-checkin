# InnoVex2026 基隆主題館開幕儀式｜貴賓數位簽到系統

Mobile-first 數位簽到系統，供貴賓掃描 QR Code 完成簽到，後台可匯出排序後的 PDF 簽到表。

## 功能

- **前台 `/`**：單位選擇、姓名、職稱、手寫簽名，提交後存入 Redis
- **後台 `/admin`**（隱藏路徑）：一鍵匯出依單位順序排列的 A4 PDF 簽到表

## 技術棧

- Next.js 16 (App Router)
- Tailwind CSS 4
- Vercel KV / Upstash Redis
- react-signature-canvas、jspdf、html2canvas

## 本地開發

```bash
cd innovex2026-checkin
npm install
npm run dev
```

開啟 [http://localhost:3000](http://localhost:3000) 測試簽到，[http://localhost:3000/admin](http://localhost:3000/admin) 測試匯出。

> 未設定 Redis 環境變數時，資料暫存於伺服器記憶體（重啟後消失），適合本地測試。

## 部署至 GitHub

### 1. 建立 GitHub 儲存庫

1. 前往 [GitHub](https://github.com/new) 建立新 repo，例如 `innovex2026-checkin`
2. 在本機專案目錄執行：

```bash
cd innovex2026-checkin
git add .
git commit -m "feat: InnoVex2026 基隆主題館貴賓數位簽到系統"
git branch -M main
git remote add origin https://github.com/你的帳號/innovex2026-checkin.git
git push -u origin main
```

## 部署至 Vercel

### 1. 匯入專案

1. 登入 [Vercel Dashboard](https://vercel.com/dashboard)
2. 點 **Add New → Project**
3. 選擇剛推送的 GitHub repo `innovex2026-checkin`
4. Framework 會自動偵測為 **Next.js**，直接 **Deploy**

### 2. 設定 Redis 儲存（取代舊版 Vercel KV）

> `@vercel/kv` 已整合至 **Upstash Redis**。在 Vercel 新增 Storage 即可。

1. 進入 Vercel 專案 → **Storage** 分頁
2. 點 **Create Database** → 選 **Upstash for Redis**（或 Marketplace 搜尋 Redis）
3. 建立後 Vercel 會自動注入環境變數：
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
4. 重新部署（Redeploy）使環境變數生效

也可在 **Settings → Environment Variables** 手動確認上述兩個變數已存在。

### 3. 取得正式網址

部署完成後會得到類似 `https://innovex2026-checkin.vercel.app` 的網址。

- 簽到頁：`https://你的網域/`
- 後台匯出：`https://你的網域/admin`（請勿公開連結，僅工作人員使用）

### 4. 產生 QR Code

將正式網址 `https://你的網域/` 製作成 QR Code，列印或顯示於現場供貴賓掃描。

可用線上工具如 [qr.io](https://qr.io) 或任何 QR 產生器。

## PDF 匯出排序規則

1. 基隆市政府產業發展處
2. 9 家廠商（茁思科技 → 蔡技企業，固定順序）
3. 嘉澄股份有限公司
4. 其他（自行輸入的單位名稱）

## 專案結構

```
src/
├── app/
│   ├── page.tsx              # 前台簽到
│   ├── admin/page.tsx        # 後台 PDF 匯出
│   ├── api/checkin/route.ts  # POST 簽到
│   └── api/checkin/export/route.ts  # GET 取得排序後資料
├── components/
│   ├── CheckInForm.tsx
│   └── SignatureField.tsx
└── lib/
    ├── constants.ts
    ├── types.ts
    ├── storage.ts
    └── sort-checkins.ts
```

## 環境變數

| 變數 | 說明 |
|------|------|
| `KV_REST_API_URL` | Upstash Redis REST URL |
| `KV_REST_API_TOKEN` | Upstash Redis REST Token |

複製 `.env.example` 為 `.env.local` 並填入上述值即可在本地連接正式資料庫。
