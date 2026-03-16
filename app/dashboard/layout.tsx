'use client'

// src/app/dashboard/layout.tsx
import Sidebar from '@/components/layout/Sidebar'
import { usePathname } from 'next/navigation'

function DashboardHeader() {
  const pathname = usePathname()
  
  // 根據路徑生成麵包屑
  const getBreadcrumbs = () => {
    const pathSegments = pathname.split('/').filter(Boolean)
    const breadcrumbs = ['系統管理']
    
    if (pathSegments.length > 1) {
      if (pathSegments[1] === 'admin') {
        breadcrumbs.push('管理功能')
        if (pathSegments[2]) {
          const pageNames: Record<string, string> = {
            companies: '物業公司管理',
            communities: '社區管理',
            residents: '住戶管理',
            invite: '邀請管理員',
            user: '使用者管理'
          }
          breadcrumbs.push(pageNames[pathSegments[2]] || pathSegments[2])
        }
      } else if (pathSegments[1] === 'settings') {
        breadcrumbs.push('個人設定')
      }
    } else {
      breadcrumbs.push('概覽')
    }
    
    return breadcrumbs.join(' / ')
  }

  return (
    <header className="h-16 bg-white border-b flex items-center px-8">
      <div className="text-sm text-gray-500">{getBreadcrumbs()}</div>
    </header>
  )
}

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
        <DashboardHeader />
        
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  )
}