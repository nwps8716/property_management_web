'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export interface UpdateProfileState {
  success: boolean
  message: string
}

export async function updateProfile(formData: FormData): Promise<UpdateProfileState> {
  const supabase = await createClient()
  
  // 取得目前登入使用者
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, message: '未登入或登入已過期' }
  }
  
  // 取得表單資料
  const name = formData.get('name') as string
  
  console.log('[updateProfile] Form data:', { name })
  
  // 驗證必填欄位
  if (!name?.trim()) {
    return { success: false, message: '姓名為必填欄位' }
  }
  
  // 使用 admin 客戶端更新資料（繞過 RLS）
  const updateData = {
    name: name.trim(),
    updated_at: new Date().toISOString()
  }
  
  console.log('[updateProfile] Update data:', updateData)
  console.log('[updateProfile] User ID for update:', user.id)
  
  // 更新資料庫
  const { error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', user.id)
  
  if (error) {
    console.error('Update profile error:', error)
    return { success: false, message: '更新失敗，請稍後再試' }
  }
  
  // 重新驗證路徑以更新快取
  revalidatePath('/dashboard/settings')
  revalidatePath('/dashboard')
  
  return { success: true, message: '個人資料已更新' }
}
