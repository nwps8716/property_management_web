import { supabaseAdmin } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { CompanyTable } from '@/components/admin/CompanyTable'

export default async function CompaniesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. 權限檢查
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single()
  if (profile?.role !== 'super_admin') redirect('/dashboard')

  // 2. 獲取所有物業公司資料
  const { data: companies, error } = await supabaseAdmin
    .from('companies')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch companies:', error)
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">物業公司管理</h1>
        <p className="mt-2 text-gray-600">管理系統中的物業公司資訊</p>
      </div>

      <CompanyTable companies={companies || []} />
    </div>
  )
}
