// src/app/login/actions.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // 讀取 URL 中的 next 參數（這需要從客戶端傳過來，或是從 Request 讀取）
  // 這裡假設我們在表單中加了一個隱藏的 input 名稱為 "next"
  const nextPath = (formData.get('next') as string) || '/dashboard'

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: '帳號或密碼錯誤' }
  }

  // 登入成功，導向後台
  redirect(nextPath)
}