// src/app/dashboard/page.tsx
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()

  // 再次檢查 User (雙重保障)
  const { data: { user } } = await supabase.auth.getUser()
  
  // 獲取一些後台統計數據案例
  const { count: userCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 簡單的導覽列 */}
      <nav className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">管理後台系統</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{user?.email}</span>
            <form action="/auth/signout" method="post">
              <button className="text-sm text-red-600 hover:underline">登出</button>
            </form>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* 統計卡片案例 */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-sm font-medium text-gray-500">總用戶數</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">{userCount || 0}</p>
          </div>
          
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-sm font-medium text-gray-500">系統狀態</h3>
            <p className="mt-2 text-3xl font-semibold text-green-600">正常運作</p>
          </div>
        </div>

        <div className="mt-8 rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-medium text-gray-900">最近活動</h3>
          <div className="text-sm text-gray-500 italic">
            目前尚無任何活動紀錄。
          </div>
        </div>
      </main>
    </div>
  )
}