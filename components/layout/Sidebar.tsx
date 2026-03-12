// src/components/layout/Sidebar.tsx
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { 
  LayoutDashboard, 
  Users,
  UserPlus, 
  Building2, 
  Settings, 
  LogOut,
  ShieldCheck,
  Building
} from 'lucide-react'

export default async function Sidebar() {
  const supabase = await createClient()
  
  // 獲取使用者資料
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  const role = profile?.role
  const isSuperAdmin = role === 'super_admin'

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold flex items-center gap-2 text-indigo-400">
          <Building2 size={24} />
          物業管理系統
        </h1>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">主要功能</p>
        
        <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-all">
          <LayoutDashboard size={20} />
          <span>儀表板</span>
        </Link>

        {/* 只有超級管理員看得到的選單 */}
        {isSuperAdmin && (
          <>
            <p className="px-4 pt-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">系統維護</p>
            <Link href="/dashboard/admin/user" className="flex items-center gap-3 px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-all">
              <Users size={20} />
              <span>管理員清單</span>
            </Link>
            <Link href="/dashboard/admin/companies" className="flex items-center gap-3 px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-all">
              <Building size={20} />
              <span>物業公司管理</span>
            </Link>
            <Link href="/dashboard/admin/invite" className="flex items-center gap-3 px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-all">
              <UserPlus size={20} />
              <span>邀請管理員</span>
            </Link>
            <Link href="/dashboard/admin/logs" className="flex items-center gap-3 px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-all">
              <ShieldCheck size={20} />
              <span>系統日誌</span>
            </Link>
          </>
        )}

        <p className="px-4 pt-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">個人設定</p>
        <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-all">
          <Settings size={20} />
          <span>個人資料</span>
        </Link>
      </nav>

      {/* 底部使用者資訊 */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/50">
        <div className="mb-4 px-2">
          <p className="text-sm font-medium text-white truncate">{profile?.name || '使用者'}</p>
          <p className="text-xs text-slate-400 truncate">{profile?.company_name || '系統維護員'}</p>
          <span className="mt-2 inline-block px-2 py-0.5 text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded uppercase">
            {role === 'super_admin' ? '超級管理員' : '物管管理員'}
          </span>
        </div>
        
        <form action="/auth/signout" method="post">
          <button className="flex w-full items-center gap-3 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all text-sm font-medium">
            <LogOut size={18} />
            登出系統
          </button>
        </form>
      </div>
    </aside>
  )
}