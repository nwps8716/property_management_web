import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * 1. Next.js 標準進入點
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

/**
 * 2. Session 更新與路由守護邏輯
 */
async function updateSession(request: NextRequest) {
  // 建立初始 Response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 初始化 Supabase Server Client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          // 同步 Request 中的 Cookies
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          
          // 更新 Response 中的 Cookies
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

  // 獲取當前登入使用者
  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  /**
   * 邏輯 A：路徑定義
   */
  // 驗證相關的白名單（包含 callback, 登入, 密碼重設等）
  const isAuthPage = pathname === '/login' || pathname.startsWith('/auth')
  
  // 設定密碼頁面（邀請制的核心過渡頁）
  const isSetPasswordPage = pathname === '/dashboard/set-password'

  /**
   * 邏輯 B：未登入 (No Session) 的處理
   * 排除白名單後，沒登入一律導向 /login
   */
  if (!user && !isAuthPage) {
    const url = new URL('/login', request.url)
    // 儲存原始想去的路徑，方便登入後跳轉
    if (pathname !== '/') {
      url.searchParams.set('next', pathname)
    }
    return NextResponse.redirect(url)
  }
  
  /**
   * 邏輯 C：已登入 (Authenticated) 的處理
   */
  if (user) {
    // 1. 如果已登入卻想訪問 /login 或根目錄 /，送去 /dashboard
    // 注意：這裡不攔截 /dashboard/set-password，讓新使用者能順利設定密碼
    if (pathname === '/login' || pathname === '/') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // 2. 可以在這裡增加針對已設定密碼使用者的防護 (選做)
    // 如果使用者已經有密碼（非邀請中的新帳號），卻試圖進入 set-password，可將其導向首頁
    // 但為了簡化邏輯，目前放行，讓頁面內的邏輯判斷即可
  }

  return response
}

/**
 * 3. Matcher 配置
 */
export const config = {
  matcher: [
    /*
     * 匹配所有路徑，但排除：
     * - _next/static (靜態檔案)
     * - _next/image (圖片優化)
     * - favicon.ico (圖示)
     * - 所有的圖片檔格式 (svg, png, jpg, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}