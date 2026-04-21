# Portfolio Link Tracker

為每家目標公司 / HR 生成專屬追蹤連結，即時掌握誰打開了你的作品集。

## 功能

- **Magic Link 登入** — 輸入 Email 收信即可登入 Admin，不需記密碼
- **一鍵生成追蹤連結** — 輸入公司名稱 → 自動生成 `/p/[slug]` 短連結
- **瀏覽追蹤** — 每次有人點開連結，自動記錄時間、User-Agent、Referrer
- **Email 通知（選配）** — 透過 Resend API 即時通知你「XXX 公司剛打開了作品集」
- **管理後台** — 查看所有連結、瀏覽次數、一鍵複製 & 刪除

## 技術棧

- **Next.js 15** (App Router)
- **Supabase** (PostgreSQL + Auth + RLS)
- **Tailwind CSS v4** + **shadcn/ui**
- **Resend** (Email 通知，選配)

## 快速開始

### 1. 建立 Supabase 專案

1. 前往 [supabase.com](https://supabase.com) 建立新專案
2. 進入 **SQL Editor** → 貼上 `supabase/schema.sql` 的內容並執行
3. 進入 **Authentication → URL Configuration**：
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`

### 2. 設定環境變數

```bash
cp .env.example .env.local
```

填入你的 Supabase 專案資訊（Dashboard → Settings → API）：

| 變數 | 說明 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 專案 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon / public key |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key（僅 server 用） |
| `NEXT_PUBLIC_DEFAULT_PORTFOLIO_URL` | 你的作品集預設網址 |
| `NEXT_PUBLIC_BASE_URL` | 本站 URL（本地為 `http://localhost:3000`） |
| `RESEND_API_KEY` | （選配）Resend API Key |
| `NOTIFICATION_EMAIL` | （選配）接收通知的 Email |

### 3. 安裝 & 啟動

```bash
npm install
npm run dev
```

開啟 http://localhost:3000 → 點「登入」→ 輸入 Email → 收信點連結 → 進入 Admin。

## 部署到 Vercel

1. Push 到 GitHub
2. 在 Vercel 匯入 repo
3. 在 Vercel 環境變數設定上述所有 `.env` 值
4. 更新 Supabase Authentication 的 Redirect URLs 為你的 Vercel 網域
5. 將 `NEXT_PUBLIC_BASE_URL` 改為你的正式網域

## 專案結構

```
src/
├── app/
│   ├── admin/           # 管理後台（需登入）
│   │   ├── page.tsx     # Admin 主頁面
│   │   ├── actions.ts   # Server Actions (create/delete link)
│   │   ├── link-generator.tsx
│   │   └── link-table.tsx
│   ├── auth/
│   │   └── callback/route.ts  # Magic Link callback
│   ├── login/
│   │   └── page.tsx     # 登入頁面
│   ├── p/
│   │   └── [slug]/route.ts    # 動態轉址 + 記錄 view
│   ├── layout.tsx
│   └── page.tsx         # 首頁
├── components/ui/       # shadcn/ui 元件
├── lib/
│   ├── supabase/
│   │   ├── client.ts    # Browser client
│   │   ├── server.ts    # Server client + service client
│   │   └── middleware.ts # Auth middleware
│   └── utils.ts
├── middleware.ts         # Next.js middleware (保護 /admin)
supabase/
└── schema.sql           # 資料庫 Schema（含 RLS）
```
