'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'

export interface ActionState {
  success: boolean
  message: string
}

export interface Community {
  id: string
  name: string
  facilities: any[]
  invite_code: string
  company_id: string
  created_at: string
  updated_at: string
  companies?: {
    name: string
  }
}

// Generate random invite code
function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// Check if user is super_admin
async function checkSuperAdmin(): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return false
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  return profile?.role === 'super_admin'
}

// Get current user's company_id
async function getCurrentUserCompanyId(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single()
  
  return profile?.company_id || null
}

// Create community
export async function createCommunity(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  try {
    const name = formData.get('name') as string
    const facilities = formData.get('facilities') as string
    const company_id = formData.get('company_id') as string

    if (!name || !company_id) {
      return { success: false, message: '社區名稱和物業公司為必填欄位' }
    }

    // Check permissions
    const isSuperAdmin = await checkSuperAdmin()
    const userCompanyId = await getCurrentUserCompanyId()

    if (!isSuperAdmin && userCompanyId !== company_id) {
      return { success: false, message: '您沒有權限為其他公司創建社區' }
    }

    // Parse facilities JSON
    let parsedFacilities = []
    if (facilities) {
      try {
        parsedFacilities = JSON.parse(facilities)
      } catch {
        parsedFacilities = facilities.split(',').map(f => f.trim()).filter(Boolean)
      }
    }

    // Generate unique invite code
    let invite_code = generateInviteCode()
    let isUnique = false
    let attempts = 0

    while (!isUnique && attempts < 10) {
      const { data: existing } = await supabaseAdmin
        .from('communities')
        .select('id')
        .eq('invite_code', invite_code)
        .single()

      if (!existing) {
        isUnique = true
      } else {
        invite_code = generateInviteCode()
        attempts++
      }
    }

    const { error } = await supabaseAdmin.from('communities').insert({
      name,
      facilities: parsedFacilities,
      invite_code,
      company_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })

    if (error) {
      if (error.code === '23505') {
        return { success: false, message: '邀請代碼重複，請重試' }
      }
      return { success: false, message: error.message }
    }

    revalidatePath('/dashboard/admin/communities')
    return { success: true, message: '社區創建成功' }
  } catch (error) {
    return { success: false, message: '創建社區時發生錯誤' }
  }
}

// Update community
export async function updateCommunity(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  try {
    const id = formData.get('id') as string
    const name = formData.get('name') as string
    const facilities = formData.get('facilities') as string
    const company_id = formData.get('company_id') as string

    if (!id || !name) {
      return { success: false, message: '缺少必要欄位' }
    }

    // Check permissions
    const isSuperAdmin = await checkSuperAdmin()
    const userCompanyId = await getCurrentUserCompanyId()

    // Get current community to check ownership
    const { data: community } = await supabaseAdmin
      .from('communities')
      .select('company_id')
      .eq('id', id)
      .single()

    if (!community) {
      return { success: false, message: '找不到該社區' }
    }

    // Only super_admin can change company_id, property_admin cannot change company
    if (!isSuperAdmin) {
      if (userCompanyId !== community.company_id) {
        return { success: false, message: '您沒有權限修改此社區' }
      }
      // Property admin cannot change company
      if (company_id && company_id !== userCompanyId) {
        return { success: false, message: '您無法更改社區所屬公司' }
      }
    }

    // Parse facilities JSON
    let parsedFacilities = []
    if (facilities) {
      try {
        parsedFacilities = JSON.parse(facilities)
      } catch {
        parsedFacilities = facilities.split(',').map(f => f.trim()).filter(Boolean)
      }
    }

    const updateData: any = {
      name,
      facilities: parsedFacilities,
      updated_at: new Date().toISOString()
    }

    // Only super_admin can change company
    if (isSuperAdmin && company_id) {
      updateData.company_id = company_id
    }

    const { error } = await supabaseAdmin
      .from('communities')
      .update(updateData)
      .eq('id', id)

    if (error) {
      return { success: false, message: error.message }
    }

    revalidatePath('/dashboard/admin/communities')
    return { success: true, message: '社區更新成功' }
  } catch (error) {
    return { success: false, message: '更新社區時發生錯誤' }
  }
}

// Delete community
export async function deleteCommunity(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  try {
    const id = formData.get('id') as string

    if (!id) {
      return { success: false, message: '缺少社區 ID' }
    }

    // Check permissions
    const isSuperAdmin = await checkSuperAdmin()
    const userCompanyId = await getCurrentUserCompanyId()

    // Get current community to check ownership
    const { data: community } = await supabaseAdmin
      .from('communities')
      .select('company_id')
      .eq('id', id)
      .single()

    if (!community) {
      return { success: false, message: '找不到該社區' }
    }

    if (!isSuperAdmin && userCompanyId !== community.company_id) {
      return { success: false, message: '您沒有權限刪除此社區' }
    }

    const { error } = await supabaseAdmin
      .from('communities')
      .delete()
      .eq('id', id)

    if (error) {
      return { success: false, message: error.message }
    }

    revalidatePath('/dashboard/admin/communities')
    return { success: true, message: '社區刪除成功' }
  } catch (error) {
    return { success: false, message: '刪除社區時發生錯誤' }
  }
}

// Get communities based on user role
export async function getCommunities(): Promise<{ communities: Community[]; error?: string }> {
  try {
    const isSuperAdmin = await checkSuperAdmin()
    const userCompanyId = await getCurrentUserCompanyId()

    let query = supabaseAdmin
      .from('communities')
      .select(`
        *,
        companies:company_id (
          name
        )
      `)
      .order('created_at', { ascending: false })

    // If property_admin, filter by company_id
    if (!isSuperAdmin && userCompanyId) {
      query = query.eq('company_id', userCompanyId)
    }

    const { data: communities, error } = await query

    if (error) {
      return { communities: [], error: error.message }
    }

    return { communities: communities || [] }
  } catch (error) {
    return { communities: [], error: '獲取社區列表時發生錯誤' }
  }
}
