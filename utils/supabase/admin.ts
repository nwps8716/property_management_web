// src/utils/supabase/admin.ts
import { createClient } from '@supabase/supabase-js'

// 注意：SUPABASE_SERVICE_ROLE_KEY 絕對不能暴露在客戶端
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, 
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)