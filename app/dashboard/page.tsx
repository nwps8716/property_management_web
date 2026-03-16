// src/app/dashboard/page.tsx
import { createClient } from '@/utils/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()

  // 再次檢查 User (雙重保障)
  const { data: { user } } = await supabase.auth.getUser()
  
  // 獲取一些後台統計數據案例
  const { count: userCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">儀表板</h1>
        <p className="mt-2 text-gray-600">系統概覽與統計資訊</p>
      </div>

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
    </div>
  )
}