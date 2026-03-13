# 物業管理系統

一個現代化的物業管理後台系統，採用 Next.js 16 + TypeScript + Tailwind CSS + Supabase 技術棧開發，支援多角色權限管理和完整的物業管理功能。

## 功能特色

### 角色權限管理
- **超級管理員 (super_admin)**：完整系統管理權限
- **物業管理員 (property_admin)**：管理所屬物業公司和社區
- **住戶 (resident)**：社區住戶帳號

### 核心功能模組

#### 1. 物業公司管理 (Company Management)
- 建立、編輯、刪除物業公司資料
- 記錄公司聯絡資訊（負責人、電話、Email）
- 僅限 super_admin 存取

#### 2. 社區管理 (Community Management)
- 建立、編輯、刪除社區資料
- 設施標籤管理（游泳池、健身房等）
- 自動生成 8 碼英數邀請碼
- 社區與物業公司綁定
- super_admin 管理所有社區，property_admin 僅管理所屬公司社區

#### 3. 住戶管理 (Resident Management)
- 建立、編輯、刪除住戶帳號
- 住戶詳細資料管理（棟別、樓層、門牌、車位）
- 台灣手機號碼自動格式轉換（E.164 標準）
- **先選社區後載入**：為效能優化，必須先選擇社區才會載入住戶資料
- 支援 URL 參數分享特定社區連結（`?community=xxx`）

#### 4. 管理員邀請系統 (Admin Invitation)
- 邀請物業管理員加入系統
- 自動發送邀請郵件
- 新管理員首次登入設定密碼

#### 5. 系統功能
- 頁面切換動畫效果
- 響應式側邊導覽列
- 表單錯誤提示與驗證
- 載入狀態骨架屏
- 繁體中文介面

## 技術架構

### 前端技術
- **框架**：Next.js 16.1.6 (App Router)
- **語言**：TypeScript 5+ (嚴格模式)
- **樣式**：Tailwind CSS v4
- **圖示**：Lucide React
- **字體**：Geist Sans & Geist Mono

### 後端技術
- **認證**：Supabase Auth (@supabase/ssr)
- **資料庫**：PostgreSQL (Supabase)
- **權限**：Middleware 路由保護 + 角色驗證

### 開發工具
- **套件管理**：npm
- **程式碼檢查**：ESLint
- **版本控制**：Git

## 資料庫結構

### 核心資料表

#### auth.users (Supabase Auth)
| 欄位 | 類型 | 說明 |
|------|------|------|
| id | UUID | 主鍵 |
| email | string | 電子郵件 |
| phone | string | E.164 格式電話 |
| user_metadata | JSONB | { name, role, community_id, company_id } |

#### profiles
| 欄位 | 類型 | 說明 |
|------|------|------|
| id | UUID | 關聯 auth.users |
| name | string | 顯示名稱 |
| community_id | UUID | 所屬社區 |
| company_id | string | 所屬物業公司 |
| role | string | super_admin / property_admin / resident |
| created_at | timestamp | 建立時間 |
| updated_at | timestamp | 更新時間 |

#### resident_details
| 欄位 | 類型 | 說明 |
|------|------|------|
| profile_id | UUID | 關聯 profiles.id |
| building | string | 棟別 |
| floor | string | 樓層 |
| unit_number | string | 門牌號碼 |
| parking_space | string | 車位號碼 |
| updated_at | timestamp | 更新時間 |

#### companies
| 欄位 | 類型 | 說明 |
|------|------|------|
| id | string | 公司代碼（如 STAR-001）|
| name | string | 公司名稱 |
| owner_name | string | 負責人姓名 |
| contact_phone | string | 聯絡電話 |
| contact_email | string | 聯絡信箱 |

#### communities
| 欄位 | 類型 | 說明 |
|------|------|------|
| id | UUID | 主鍵 |
| name | string | 社區名稱 |
| facilities | JSONB | 設施陣列 |
| invite_code | string | 8 碼邀請碼 |
| company_id | string | 所屬物業公司 |

## 目錄結構

```
my-first-nextjs/
├── app/                          # Next.js App Router
│   ├── api/                      # API 路由
│   ├── auth/                     # 認證相關頁面
│   ├── dashboard/                # 後台儀表板
│   │   ├── admin/                # 管理功能
│   │   │   ├── companies/        # 物業公司管理
│   │   │   ├── communities/      # 社區管理
│   │   │   ├── residents/        # 住戶管理
│   │   │   ├── invite/           # 邀請管理員
│   │   │   └── user/             # 使用者管理
│   │   ├── layout.tsx            # 儀表板佈局
│   │   └── settings/             # 個人設定
│   └── login/                    # 登入頁面
├── components/                   # React 元件
│   ├── admin/                    # 管理後台元件
│   │   ├── ResidentTable.tsx     # 住戶列表
│   │   ├── ResidentForm.tsx      # 住戶表單
│   │   ├── CommunityTable.tsx    # 社區列表
│   │   ├── CommunityForm.tsx     # 社區表單
│   │   ├── CompanyTable.tsx      # 公司列表
│   │   └── InviteForm.tsx        # 邀請表單
│   ├── layout/                   # 佈局元件
│   │   └── Sidebar.tsx           # 側邊導覽
│   └── ui/                       # 通用 UI 元件
│       ├── SubmitButton.tsx      # 提交按鈕
│       └── PageTransitionProvider.tsx
├── utils/                        # 工具函數
│   └── supabase/                 # Supabase 客戶端
│       ├── server.ts             # 伺服器端
│       ├── client.ts             # 瀏覽器端
│       └── admin.ts              # 管理員權限
├── middleware.ts                 # 路由保護中介軟體
└── package.json                  # 專案設定
```

## 環境變數設定

建立 `.env.local` 檔案：

```env
# Supabase 設定
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 應用程式設定
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 開發指令

```bash
# 安裝依賴
npm install

# 開發伺服器（http://localhost:3000）
npm run dev

# 建置生產版本
npm run build

# 啟動生產伺服器
npm run start

# 程式碼檢查
npm run lint
```

## 使用說明

### 超級管理員操作流程

1. **登入系統**
   - 使用 super_admin 帳號登入
   - 進入後台儀表板

2. **建立物業公司**
   - 前往「物業公司管理」
   - 點擊「新增物業公司」
   - 填寫公司資訊並儲存

3. **建立社區**
   - 前往「社區管理」
   - 選擇所屬物業公司
   - 填寫社區名稱和設施
   - 系統自動生成邀請碼

4. **管理住戶**
   - 前往「住戶管理」
   - **必須先選擇社區**才能查看住戶
   - 點擊「新增住戶」建立帳號
   - 可填寫棟別、樓層、門牌、車位等詳細資訊

5. **邀請管理員**
   - 前往「邀請管理員」
   - 輸入 Email 和選擇所屬公司
   - 系統自動發送邀請郵件

### 物業管理員操作流程

1. **接受邀請**
   - 點擊邀請郵件中的連結
   - 設定登入密碼

2. **管理社區**
   - 僅能看到所屬公司的社區
   - 可新增、編輯社區

3. **管理住戶**
   - **必須先選擇社區**才能查看住戶
   - 僅能管理所屬公司社區的住戶

### 住戶帳號建立流程

系統採用三步驟建立住戶：

1. **建立 Auth 使用者**
   - 使用 Supabase Auth Admin API
   - 設定 email、password、phone（E.164 格式）
   - 帶入 user_metadata（name, role, community_id, company_id）

2. **建立 Profile 記錄**
   - 在 profiles 資料表建立對應記錄
   - 關聯 auth.users.id

3. **建立 Resident Details**
   - 在 resident_details 資料表建立詳細資訊
   - 記錄棟別、樓層、門牌、車位

## 效能優化設計

### 住戶載入策略
為避免資料量過大影響效能，系統採用「先選社區後載入」策略：

- 初始進入「住戶管理」不載入任何住戶資料
- 必須選擇特定社區後，才查詢該社區的住戶
- 查詢結果透過 URL 參數保留（`?community=xxx`）
- 方便分享特定社區的住戶管理連結

### 台灣電話格式處理
系統自動將台灣手機號碼轉換為 E.164 國際格式：

- 輸入格式：`0912345678` 或 `912345678`
- 儲存格式：`+886912345678`
- 驗證規則：自動檢查有效台灣手機格式

## 常見問題

### Q: 為什麼住戶管理頁面沒有顯示住戶？
A: 請先從下拉選單選擇一個社區，系統才會載入該社區的住戶資料。

### Q: 如何修改住戶的電子郵件？
A: 住戶的電子郵件只能在編輯模式下由管理員修改，住戶本人無法修改。

### Q: property_admin 可以看到其他公司的住戶嗎？
A: 不行，property_admin 僅能看到和管理所屬物業公司的社區和住戶。

## 開發團隊注意事項

### 程式碼規範
- UI 文字使用繁體中文
- 程式碼註解使用英文
- 元件命名使用 PascalCase
- 檔案命名使用 camelCase（工具函數）或 PascalCase（元件）

### 開發新功能檢查清單
- [ ] 定義 TypeScript 類型
- [ ] 確認 Server/Client 元件邊界
- [ ] 使用 SubmitButton 元件
- [ ] 實作錯誤處理
- [ ] 提供載入狀態
- [ ] 考慮響應式設計
- [ ] 處理快取失效（revalidatePath）

## 授權

本專案為內部物業管理系統，未公開授權。

---

**開發日期**：2026年  
**技術棧**：Next.js 16 + TypeScript + Tailwind CSS + Supabase  
**介面語言**：繁體中文

