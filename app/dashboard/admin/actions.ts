'use server'

import { supabaseAdmin } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

// 1. 定義回傳值的類型介面
export interface ActionState {
  success: boolean;
  message: string;
}

export async function handleAdminAction(prevState: ActionState | null, formData: FormData): Promise<ActionState> {
  const email = formData.get('email') as string
  const name = formData.get('name') as string
  const company_id = formData.get('company_id') as string
  const company_name = formData.get('company_name') as string
  const password = formData.get('password') as string // 取得密碼欄位

  if (password) {
    /** * 模式 A：直接建立帳號 (createUser)
     */
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role: 'property_admin', company_id }
    })

    if (authError) return { success: false, message: `建立失敗: ${authError.message}` }

    if (authUser?.user) {
      // 確保拿到剛建立的 user.id
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: authUser.user.id, // 這是對應 Auth 的 UUID
          name: name,
          role: 'property_admin',
          company_id: company_id,
          created_at: new Date().toISOString()
        })

      if (profileError) {
        console.error('Profile 寫入失敗詳情:', profileError)
        return { success: false, message: `Auth 成功但 Profile 失敗: ${profileError.message}` }
      }
    }

    revalidatePath('/dashboard/admin/invite')
    return { success: true, message: `帳號 ${email} 已直接建立，密碼為 ${password}` }

  } else {
    /** * 模式 B：發送邀請信 (inviteUserByEmail)
     */
    const { error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: { name, role: 'property_admin', company_id, company_name },
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/dashboard/set-password`
    })

    if (inviteError) return { success: false, message: `邀請失敗: ${inviteError.message}` }

    revalidatePath('/dashboard/admin/invite')
    return { success: true, message: `邀請信已發送至 ${email}` }
  }
}

// 刪除管理員
export async function deletePropertyAdmin(adminId: string) {
  // 1. 先刪除 Auth 帳號（這會觸發級聯刪除 profile，如果 SQL 有設定的話）
  const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(adminId)
  
  if (authError) return { success: false, message: authError.message }

  // 2. 確保 Profile 也被刪除 (保險起見)
  await supabaseAdmin.from('profiles').delete().eq('id', adminId)

  revalidatePath('/dashboard/admin/users')
  return { success: true, message: '管理員已成功刪除' }
}

// 編輯管理員資訊
export async function updatePropertyAdmin(adminId: string, formData: FormData) {
  const name = formData.get('name') as string
  const company_id = formData.get('company_id') as string
  // 注意：不再更新 company_name，因為該欄位已從 profiles 表移除

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ name, company_id })
    .eq('id', adminId)

  if (error) return { success: false, message: error.message }

  revalidatePath('/dashboard/admin/users')
  return { success: true, message: '資訊已更新' }
}

// 發送 Email 變更邀請
export async function sendEmailChangeLink(adminId: string, newEmail: string) {
  // 這裡使用 admin 權限來觸發 email 更新
  // Supabase 會自動發送一封驗證信到「新信箱」
  const { error } = await supabaseAdmin.auth.admin.updateUserById(
    adminId,
    { email: newEmail }
  )

  if (error) {
    return { success: false, message: '發送失敗：' + error.message }
  }

  return { success: true, message: '驗證信已發送到新信箱，請通知管理員查收' }
}