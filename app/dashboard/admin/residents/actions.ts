'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { supabaseAdmin } from '@/utils/supabase/admin'

export interface ActionState {
  success: boolean
  message: string
}

export interface Resident {
  id: string
  name: string
  email: string
  phone: string | null
  community_id: string | null
  role: string
  resident_details?: {
    building: string | null
    floor: string | null
    unit_number: string | null
    parking_space: string | null
  } | null
  communities?: {
    id: string
    name: string
    company_id: string
  } | null
}

export interface Community {
  id: string
  name: string
  company_id: string
  companies?: {
    id: string
    name: string
  }
}

// Get current user role and company_id
async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, company_id')
    .eq('id', user.id)
    .single()
  
  return { user, profile }
}

// Get communities based on user role
export async function getCommunitiesForUser(): Promise<{ communities: Community[] | null; error?: string }> {
  const currentUser = await getCurrentUser()
  
  if (!currentUser) {
    return { communities: null, error: '未登入' }
  }
  
  const { profile } = currentUser
  const isSuperAdmin = profile?.role === 'super_admin'
  
  let query = supabaseAdmin
    .from('communities')
    .select(`
      *,
      companies:company_id (
        id,
        name
      )
    `)
    .order('name')
  
  // property_admin and community_manager can only see their company's communities
  if (!isSuperAdmin && profile?.company_id) {
    query = query.eq('company_id', profile.company_id)
  }
  
  const { data: communities, error } = await query
  
  if (error) {
    return { communities: null, error: error.message }
  }
  
  return { communities: communities as Community[] || [] }
}

// Get residents based on user role and selected community
export async function getResidents(communityId?: string): Promise<{ residents: Resident[] | null; error?: string }> {
  const currentUser = await getCurrentUser()
  
  if (!currentUser) {
    return { residents: null, error: '未登入' }
  }
  
  const { profile } = currentUser
  const isSuperAdmin = profile?.role === 'super_admin'
  
  // Build the base query with resident_details join
  // Note: profiles table doesn't have email column, email is in auth.users
  let query = supabaseAdmin
    .from('profiles')
    .select(`
      id,
      name,
      community_id,
      company_id,
      role,
      created_at,
      updated_at,
      resident_details (
        building,
        floor,
        unit_number,
        parking_space
      ),
      communities (
        id,
        name,
        company_id
      )
    `)
    .eq('role', 'resident')  // Only get residents
    .order('name')
  
  if (isSuperAdmin) {
    // super_admin: filter by selected community if provided
    if (communityId) {
      query = query.eq('community_id', communityId)
    }
  } else {
    // property_admin and community_manager: get all communities for their company
    const { data: companyCommunities } = await supabaseAdmin
      .from('communities')
      .select('id')
      .eq('company_id', profile?.company_id || '')
    
    const communityIds = companyCommunities?.map(c => c.id) || []
    
    // Filter by specific community if selected, otherwise filter by all company's communities
    if (communityId) {
      if (communityIds.includes(communityId)) {
        query = query.eq('community_id', communityId)
      } else {
        return { residents: [], error: '無權限查看此社區' }
      }
    } else if (communityIds.length > 0) {
      query = query.in('community_id', communityIds)
    } else {
      return { residents: [], error: '無管理的社區' }
    }
  }
  
  const { data: residents, error } = await query
  
  if (error) {
    return { residents: null, error: error.message }
  }
  
  // Fetch email from auth.users for each resident
  const residentsWithEmail: Resident[] = []
  for (const resident of residents || []) {
    // Supabase returns resident_details and communities as arrays, extract first element or null
    const residentDetails = Array.isArray(resident.resident_details) 
      ? resident.resident_details[0] || null 
      : resident.resident_details
    const communities = Array.isArray(resident.communities)
      ? resident.communities[0] || null
      : resident.communities
    
    try {
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(resident.id)
      
      residentsWithEmail.push({
        ...resident,
        email: userData?.user?.email || '',
        phone: userData?.user?.phone || null,
        resident_details: residentDetails,
        communities
      })
    } catch {
      residentsWithEmail.push({
        ...resident,
        email: '',
        phone: null,
        resident_details: residentDetails,
        communities
      })
    }
  }
  
  return { residents: residentsWithEmail, error: undefined }
}

// Helper function to format Taiwan phone number
function formatTaiwanPhone(phone: string): string | null {
  if (!phone || !phone.trim()) return null
  
  let cleaned = phone.trim().replace(/\s/g, '')
  
  // If already has +886 prefix, validate it
  if (cleaned.startsWith('+886')) {
    const numberPart = cleaned.slice(4)
    // Check if it's 9 digits (without leading 0) or 10 digits (with leading 0)
    if (/^9\d{8}$/.test(numberPart)) {
      return `+886${numberPart}`
    }
    if (/^09\d{8}$/.test(numberPart)) {
      return `+886${numberPart.slice(1)}`
    }
    return null // Invalid format
  }
  
  // If starts with 0, remove it and add +886
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.slice(1)
  }
  
  // Now should be 9 digits (e.g., 912345678)
  if (/^\d{9}$/.test(cleaned)) {
    return `+886${cleaned}`
  }
  
  // If it's 10 digits starting with 9 (e.g., 9123456789 - too long)
  if (/^\d{10,}$/.test(cleaned)) {
    return null // Too long
  }
  
  return null // Invalid format
}

// Create resident
export async function createResident(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  try {
    const currentUser = await getCurrentUser()
    
    if (!currentUser) {
      return { success: false, message: '未登入' }
    }
    
    const { profile } = currentUser
    const isSuperAdmin = profile?.role === 'super_admin'
    
    // Get form data
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const password = formData.get('password') as string
    const community_id = formData.get('community_id') as string
    const company_id = formData.get('company_id') as string
    const building = formData.get('building') as string
    const floor = formData.get('floor') as string
    const unit_number = formData.get('unit_number') as string
    const parking_space = formData.get('parking_space') as string
    
    // Validation - basic info all required except phone and resident details
    if (!name || !email || !password || !community_id || !company_id) {
      return { success: false, message: '姓名、電子郵件、密碼、社區和物業公司為必填欄位' }
    }
    
    // Format Taiwan phone number
    let formattedPhone: string | null = null
    if (phone && phone.trim()) {
      formattedPhone = formatTaiwanPhone(phone)
      if (!formattedPhone) {
        return { success: false, message: '電話號碼格式錯誤，請輸入有效的台灣手機號碼（如：0912345678）' }
      }
    }
    
    // Check permission for property_admin and community_manager
    if (!isSuperAdmin) {
      // Check if community belongs to user's company
      const { data: community } = await supabaseAdmin
        .from('communities')
        .select('company_id')
        .eq('id', community_id)
        .single()
      
      if (!community || community.company_id !== profile?.company_id) {
        return { success: false, message: '無權限為此社區新增住戶' }
      }
      
      // property_admin and community_manager can only use their own company
      if (company_id && company_id !== profile?.company_id) {
        return { success: false, message: '無權限使用此物業公司' }
      }
    }
    
    // Create auth user
    // Build auth user data - phone is optional and must be E.164 format
    const authUserData: any = {
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role: 'resident',
        community_id,
        company_id: isSuperAdmin ? company_id : profile?.company_id
      }
    }
    
    // Use formatted Taiwan phone number
    if (formattedPhone) {
      authUserData.phone = formattedPhone
    }
    
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser(authUserData)
    
    if (authError) {
      if (authError.message.includes('already registered')) {
        return { success: false, message: '此電子郵件已被註冊' }
      }
      return { success: false, message: `Auth 錯誤: ${authError.message}` }
    }
    
    if (!authUser?.user) {
      return { success: false, message: '創建用戶失敗 - 無用戶資料返回' }
    }
    
    // Manually create profile (don't rely on trigger - it may not be set up)
    const { error: insertProfileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: authUser.user.id,
        name,
        community_id,
        company_id: isSuperAdmin ? company_id : profile?.company_id,
        role: 'resident',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' })
    
    if (insertProfileError) {
      return { success: false, message: `Profile 創建錯誤: ${insertProfileError.message}` }
    }
    
    // Create resident_details immediately after profile is created
    const residentDetailsData = {
      profile_id: authUser.user.id,
      building: building || null,
      floor: floor || null,
      unit_number: unit_number || null,
      parking_space: parking_space || null,
      updated_at: new Date().toISOString()
    }
    
    const { error: detailsError, data: detailsData } = await supabaseAdmin
      .from('resident_details')
      .insert(residentDetailsData)
      .select()
    
    if (detailsError) {
      return { success: false, message: `Resident_details 錯誤: ${detailsError.message}` }
    }
    
    revalidatePath('/dashboard/admin/residents')
    return { success: true, message: '住戶創建成功' }
  } catch (error: any) {
    return { success: false, message: `創建住戶時發生錯誤: ${error?.message || '未知錯誤'}` }
  }
}

// Update resident
export async function updateResident(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  try {
    const currentUser = await getCurrentUser()
    
    if (!currentUser) {
      return { success: false, message: '未登入' }
    }
    
    const { profile } = currentUser
    const isSuperAdmin = profile?.role === 'super_admin'
    
    // Get form data
    const id = formData.get('id') as string
    const name = formData.get('name') as string
    const phone = formData.get('phone') as string
    const community_id = formData.get('community_id') as string
    const company_id = formData.get('company_id') as string
    const building = formData.get('building') as string
    const floor = formData.get('floor') as string
    const unit_number = formData.get('unit_number') as string
    const parking_space = formData.get('parking_space') as string
    
    // Validation - email cannot be changed in edit mode
    if (!id || !name) {
      return { success: false, message: '缺少必要欄位' }
    }
    
    // Get current resident data for permission check
    const { data: resident } = await supabaseAdmin
      .from('profiles')
      .select('company_id, community_id, role')
      .eq('id', id)
      .single()
    
    if (!resident || resident.role !== 'resident') {
      return { success: false, message: '找不到該住戶' }
    }
    
    // Check permission
    if (!isSuperAdmin) {
      if (resident.company_id !== profile?.company_id) {
        return { success: false, message: '無權限修改此住戶' }
      }
      
      // Check if new community belongs to user's company
      if (community_id) {
        const { data: community } = await supabaseAdmin
          .from('communities')
          .select('company_id')
          .eq('id', community_id)
          .single()
        
        if (!community || community.company_id !== profile?.company_id) {
          return { success: false, message: '無權限將住戶移至該社區' }
        }
      }
      
      // Cannot change company
      if (company_id && company_id !== profile?.company_id) {
        return { success: false, message: '無權限更改物業公司' }
      }
    }
    
    // Update auth user - do not change email in edit mode
    const updateData: any = {
      user_metadata: {
        name,
        role: 'resident',
        community_id,
        company_id: isSuperAdmin ? company_id : profile?.company_id
      }
    }
    
    // Only add phone if provided and in valid E.164 format
    if (phone && phone.trim()) {
      const e164Regex = /^\+[1-9]\d{1,14}$/
      if (e164Regex.test(phone.trim())) {
        updateData.phone = phone.trim()
      }
    }
    
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, updateData)
    
    if (authError) {
      return { success: false, message: authError.message }
    }
    
    // Update profile (email is stored in auth, not profiles)
    const profileUpdateData: any = {
      name,
      updated_at: new Date().toISOString()
    }
    
    if (community_id) {
      profileUpdateData.community_id = community_id
    }
    
    if (isSuperAdmin && company_id) {
      profileUpdateData.company_id = company_id
    }
    
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update(profileUpdateData)
      .eq('id', id)
    
    if (profileError) {
      return { success: false, message: profileError.message }
    }
    
    // Update or create resident_details
    const { data: existingDetails } = await supabaseAdmin
      .from('resident_details')
      .select('profile_id')
      .eq('profile_id', id)
      .single()
    
    const detailsData = {
      building: building || null,
      floor: floor || null,
      unit_number: unit_number || null,
      parking_space: parking_space || null,
      updated_at: new Date().toISOString()
    }
    
    if (existingDetails) {
      const { error: detailsError } = await supabaseAdmin
        .from('resident_details')
        .update(detailsData)
        .eq('profile_id', id)
      
      if (detailsError) {
        return { success: false, message: detailsError.message }
      }
    } else {
      const { error: detailsError } = await supabaseAdmin
        .from('resident_details')
        .insert({
          profile_id: id,
          ...detailsData
        })
      
      if (detailsError) {
        return { success: false, message: detailsError.message }
      }
    }
    
    revalidatePath('/dashboard/admin/residents')
    return { success: true, message: '住戶更新成功' }
  } catch (error) {
    return { success: false, message: '更新住戶時發生錯誤' }
  }
}

// Delete resident
export async function deleteResident(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  try {
    const currentUser = await getCurrentUser()
    
    if (!currentUser) {
      return { success: false, message: '未登入' }
    }
    
    const { profile } = currentUser
    const isSuperAdmin = profile?.role === 'super_admin'
    
    const id = formData.get('id') as string
    
    if (!id) {
      return { success: false, message: '缺少住戶 ID' }
    }
    
    // Get resident data for permission check
    const { data: resident } = await supabaseAdmin
      .from('profiles')
      .select('company_id, role')
      .eq('id', id)
      .single()
    
    if (!resident || resident.role !== 'resident') {
      return { success: false, message: '找不到該住戶' }
    }
    
    // Check permission
    if (!isSuperAdmin && resident.company_id !== profile?.company_id) {
      return { success: false, message: '無權限刪除此住戶' }
    }
    
    // Delete auth user (will cascade delete profile via trigger)
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id)
    
    if (authError) {
      return { success: false, message: authError.message }
    }
    
    // Delete resident_details (in case trigger doesn't handle it)
    await supabaseAdmin
      .from('resident_details')
      .delete()
      .eq('profile_id', id)
    
    revalidatePath('/dashboard/admin/residents')
    return { success: true, message: '住戶刪除成功' }
  } catch (error) {
    return { success: false, message: '刪除住戶時發生錯誤' }
  }
}

// Get companies for form selection
export async function getCompaniesForForm(): Promise<{ companies: { id: string; name: string }[] | null; error?: string }> {
  const currentUser = await getCurrentUser()
  
  if (!currentUser) {
    return { companies: null, error: '未登入' }
  }
  
  const { profile } = currentUser
  const isSuperAdmin = profile?.role === 'super_admin'
  
  let query = supabaseAdmin
    .from('companies')
    .select('id, name')
    .order('name')
  
  if (!isSuperAdmin && profile?.company_id) {
    query = query.eq('id', profile.company_id)
  }
  
  const { data: companies, error } = await query
  
  if (error) {
    return { companies: null, error: error.message }
  }
  
  return { companies: companies || [] }
}
