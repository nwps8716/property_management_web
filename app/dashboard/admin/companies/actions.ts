'use server'

import { supabaseAdmin } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

export interface CompanyActionState {
  success: boolean
  message: string
}

// 新增物業公司
export async function createCompany(formData: FormData): Promise<CompanyActionState> {
  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const owner_name = formData.get('owner_name') as string
  const contact_phone = formData.get('contact_phone') as string
  const contact_email = formData.get('contact_email') as string

  // 驗證必填欄位
  if (!id?.trim()) {
    return { success: false, message: '公司代碼為必填欄位' }
  }
  
  if (!name?.trim()) {
    return { success: false, message: '公司名稱為必填欄位' }
  }

  // 檢查公司代碼是否已存在
  const { data: existingCompany } = await supabaseAdmin
    .from('companies')
    .select('id')
    .eq('id', id.trim())
    .single()

  if (existingCompany) {
    return { success: false, message: '公司代碼已存在' }
  }

  // 檢查公司名稱是否已存在
  const { data: existingName } = await supabaseAdmin
    .from('companies')
    .select('name')
    .eq('name', name.trim())
    .single()

  if (existingName) {
    return { success: false, message: '公司名稱已存在' }
  }

  // 新增資料
  const { error } = await supabaseAdmin
    .from('companies')
    .insert({
      id: id.trim(),
      name: name.trim(),
      owner_name: owner_name?.trim() || null,
      contact_phone: contact_phone?.trim() || null,
      contact_email: contact_email?.trim() || null,
    })

  if (error) {
    console.error('Create company error:', error)
    return { success: false, message: `新增失敗: ${error.message}` }
  }

  revalidatePath('/dashboard/admin/companies')
  return { success: true, message: '物業公司新增成功' }
}

// 更新物業公司
export async function updateCompany(companyId: string, formData: FormData): Promise<CompanyActionState> {
  const name = formData.get('name') as string
  const owner_name = formData.get('owner_name') as string
  const contact_phone = formData.get('contact_phone') as string
  const contact_email = formData.get('contact_email') as string

  // 驗證必填欄位
  if (!name?.trim()) {
    return { success: false, message: '公司名稱為必填欄位' }
  }

  // 檢查公司名稱是否已存在（排除自己）
  const { data: existingName } = await supabaseAdmin
    .from('companies')
    .select('name')
    .eq('name', name.trim())
    .neq('id', companyId)
    .single()

  if (existingName) {
    return { success: false, message: '公司名稱已存在' }
  }

  // 更新資料
  const { error } = await supabaseAdmin
    .from('companies')
    .update({
      name: name.trim(),
      owner_name: owner_name?.trim() || null,
      contact_phone: contact_phone?.trim() || null,
      contact_email: contact_email?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', companyId)

  if (error) {
    console.error('Update company error:', error)
    return { success: false, message: `更新失敗: ${error.message}` }
  }

  revalidatePath('/dashboard/admin/companies')
  return { success: true, message: '物業公司更新成功' }
}

// 刪除物業公司
export async function deleteCompany(companyId: string): Promise<CompanyActionState> {
  // 檢查是否有關聯的管理員
  const { data: relatedProfiles } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('company_id', companyId)
    .limit(1)

  if (relatedProfiles && relatedProfiles.length > 0) {
    return { 
      success: false, 
      message: '無法刪除，此物業公司仍有關聯的管理員帳號' 
    }
  }

  // 刪除資料
  const { error } = await supabaseAdmin
    .from('companies')
    .delete()
    .eq('id', companyId)

  if (error) {
    console.error('Delete company error:', error)
    return { success: false, message: `刪除失敗: ${error.message}` }
  }

  revalidatePath('/dashboard/admin/companies')
  return { success: true, message: '物業公司刪除成功' }
}
