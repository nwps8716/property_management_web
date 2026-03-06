// src/middleware.ts
import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * 1. 這是 Next.js 的標準進入點 (Entry Point)
 * 名稱必須固定為 middleware
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

/**
 * 2. 這是你的業務邏輯，負責處理 Session 更新與路由守護
 */
async function updateSession(request: NextRequest) {
  // 建立一個初始 response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          // 更新請求中的 cookies，讓後續的 Server Components 能拿到最新的 session
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          
          // 更新回應中的 cookies，確保瀏覽器端存儲最新狀態
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 重要：getUser() 會驗證 JWT，比 getSession() 安全
  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  /**
   * 邏輯 A：定義「白名單」
   * 包含登入頁本身，以及 Supabase 用來處理驗證的 callback 路由
   */
  const isAuthPage = pathname === '/login' || pathname.startsWith('/auth')

  /**
   * 邏輯 B：沒登入的情況
   * 如果不是去白名單頁面，通通導向 /login
   */
  if (!user && !isAuthPage) {
    const url = new URL('/login', request.url)
    // 額外功能：紀錄原本想去的路徑，方便登入後跳轉回來
    if (pathname !== '/') {
      url.searchParams.set('next', pathname)
    }
    return NextResponse.redirect(url)
  }
  
  /**
   * 邏輯 C：有登入的情況
   * 如果試圖訪問首頁 (/) 或登入頁 (/login)，直接導向 /dashboard
   */
  if (user && (pathname === '/' || pathname === '/login')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * 匹配所有路徑，排除靜態檔案與 Next.js 內部路徑
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}