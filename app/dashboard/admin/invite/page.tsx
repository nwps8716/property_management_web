import { createClient } from '@/utils/supabase/server'
import { supabaseAdmin } from '@/utils/supabase/admin'
import { InviteForm } from '@/components/admin/InviteForm'
import { redirect } from 'next/navigation'

export default async function InvitePage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single()

  // 權限守護：非超級管理員禁入
  if (profile?.role !== 'super_admin') {
    redirect('/dashboard')
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">邀請新物業管理員</h2>
        <p className="text-gray-500">系統將發送電子郵件，由管理員點擊連結設定密碼。</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-8">
        <InviteForm />
      </div>
    </div>
  )
}