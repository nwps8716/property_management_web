// src/app/auth/callback/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// src/app/auth/callback/route.ts
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // 檢查是否有邀請連結專用的 type
  const type = searchParams.get('type') // 邀請信連結通常會帶 type=invite 或 type=recovery

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // 如果是邀請信進來的，導向設定密碼頁面
      if (type === 'invite' || type === 'recovery') {
        return NextResponse.redirect(`${origin}/dashboard/set-password`)
      }
      
      // 一般登入則去 dashboard
      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}