import { supabaseAdmin } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminTable } from '@/components/admin/AdminTable'

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. 權限檢查
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single()
  if (profile?.role !== 'super_admin') redirect('/dashboard')

  // 2. 同時抓取 Profiles 與 Auth Users
  // 使用 Promise.all 讓兩個請求並行，加快速度
  const [profilesResponse, authResponse] = await Promise.all([
    supabaseAdmin
      .from('profiles')
      .select(`
        *,
        companies:company_id (
          name
        )
      `)
      .eq('role', 'property_admin')
      .order('created_at', { ascending: false }),
    supabaseAdmin.auth.admin.listUsers()
  ])

  const profiles = profilesResponse.data || []
  const authUsers = authResponse.data.users || []

  // 3. 資料整合 (Data Merging)
  // 將 profiles 作為基底，根據 id 去 authUsers 裡面找對應的 email
  const combinedAdmins = profiles.map(profile => {
    const authUser = authUsers.find(u => u.id === profile.id)
    return {
      ...profile,
      email: authUser?.email || '無電子郵件' // 整合 email 欄位
    }
  })

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">管理員清單</h1>
        <p className="text-slate-500">您可以編輯或移除現有的物業管理員帳號。</p>
      </div>

      {/* 將整合後的資料送入 AdminTable */}
      <AdminTable initialAdmins={combinedAdmins || []} />
    </div>
  )
}