// src/app/auth/callback/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // 如果網址中有 'next' 參數，登入後導向該頁面，否則回首頁
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    
    // 【核心步驟】用 Code 換取 Session
    // 這會自動處理 Cookie 的寫入 (透過我們之前在 server.ts 定義的 setAll)
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // 成功換取後，導向目標頁面
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // 如果發生錯誤（Code 無效或過期），導向錯誤頁面或登入頁
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}