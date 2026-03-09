'use client'

import { useActionState, useState } from 'react'
import { handleAdminAction } from '@/app/dashboard/admin/actions'
import { Mail, User, Building, Hash, Key, Send, UserPlus } from 'lucide-react'
import { SubmitButton } from '@/components/ui/SubmitButton'

export function InviteForm() {
  const [mode, setMode] = useState<'invite' | 'create'>('invite')
  const [state, formAction] = useActionState(handleAdminAction, null)

  return (
    <div className="space-y-6">
      {/* 模式切換器 */}
      <div className="flex bg-slate-100 p-1 rounded-lg w-fit">
        <button 
          onClick={() => setMode('invite')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${mode === 'invite' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}
        >
          <Send size={14} /> 發送邀請信
        </button>
        <button 
          onClick={() => setMode('create')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${mode === 'create' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}
        >
          <UserPlus size={14} /> 直接建立帳號
        </button>
      </div>

      <form action={formAction} className="space-y-6">
        {/* 基本資料區 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">管理員姓名</label>
            <input name="name" type="text" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">電子郵件</label>
            <input name="email" type="email" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Building size={16} /> 物業公司名稱
            </label>
            <input name="company_name" type="text" required placeholder="例如：安居物業"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
          </div>

          {/* 公司 ID */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Hash size={16} /> 公司識別碼 (Company ID)
            </label>
            <input name="company_id" type="text" required placeholder="AJ001"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
          </div>
        </div>

        {/* 模式特有欄位：密碼 */}
        {mode === 'create' && (
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg space-y-2 animate-in fade-in slide-in-from-top-2">
            <label className="text-sm font-medium text-amber-800 flex items-center gap-2">
              <Key size={16} /> 設定初始密碼
            </label>
            <input name="password" type="text" required placeholder="例如: Property123!" className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
            <p className="text-xs text-amber-600">※ 直接建立帳號將跳過郵件驗證，使用者可立即登入。</p>
          </div>
        )}

        {state?.message && (
          <div className={`p-4 rounded-lg text-sm ${state.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {state.message}
          </div>
        )}

        <SubmitButton label={mode === 'invite' ? "發送邀請信" : "直接建立並啟用帳號"} />
      </form>
    </div>
  )
}