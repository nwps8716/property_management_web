// src/app/dashboard/loading.tsx
export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頂部導覽列骨架 */}
      <nav className="h-16 border-b bg-white px-8 flex items-center justify-between">
        <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />
        <div className="flex items-center gap-4">
          <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
          <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
        </div>
      </nav>

      <main className="mx-auto max-w-7xl p-8">
        {/* 標題與按鈕區塊 */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
            <div className="mt-2 h-4 w-64 animate-pulse rounded bg-gray-100" />
          </div>
          <div className="h-10 w-28 animate-pulse rounded-lg bg-indigo-100" />
        </div>

        {/* 統計卡片組 */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-xl border bg-white p-6 shadow-sm">
              <div className="h-4 w-20 animate-pulse rounded bg-gray-100 mb-4" />
              <div className="h-8 w-16 animate-pulse rounded bg-gray-200" />
            </div>
          ))}
        </div>

        {/* 主要內容表格骨架 */}
        <div className="mt-8 rounded-xl border bg-white shadow-sm overflow-hidden">
          <div className="h-12 border-b bg-gray-50 px-6 py-3 flex items-center justify-between">
            <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="divide-y divide-gray-100 px-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="py-4 flex items-center gap-4">
                <div className="h-10 w-10 animate-pulse rounded-full bg-gray-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/4 animate-pulse rounded bg-gray-200" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}