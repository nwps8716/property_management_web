// src/app/dashboard/layout.tsx
import Sidebar from '@/components/layout/Sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      {/* 側邊欄固定在左側 */}
      <Sidebar />
      
      {/* 主要內容區 */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b flex items-center px-8">
          {/* 這裡可以放麵包屑或頂部搜尋欄 */}
          <div className="text-sm text-gray-500">系統管理 / 概覽</div>
        </header>
        
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  )
}