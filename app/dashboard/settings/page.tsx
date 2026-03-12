import { createClient } from '@/utils/supabase/server'
import { supabaseAdmin } from '@/utils/supabase/admin'
import { redirect } from 'next/navigation'
import SettingsPageClient from './SettingsPageClient'

export default async function SettingsPage() {
  const supabase = await createClient()
  
  // 取得目前登入使用者
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  // 使用 supabaseAdmin 獲取完整的使用者資料（包含 email）
  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  if (error || !profile) {
    // 如果找不到資料，顯示錯誤或重新導向
    console.error('Failed to fetch profile:', error)
    redirect('/dashboard')
  }
  
  // 確保有 email 資料
  const profileWithEmail = {
    ...profile,
    email: user.email || profile.email
  }
  
  return <SettingsPageClient profile={profileWithEmail} />
}
