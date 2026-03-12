'use client'

import { useActionState, useState, useEffect } from 'react'
import { handleAdminAction } from '@/app/dashboard/admin/actions'
import { Building, Hash, Key, Send, UserPlus, AlertTriangle } from 'lucide-react'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { CompanySelect, Company } from './CompanySelect'

export function InviteForm() {
  const [mode, setMode] = useState<'invite' | 'create'>('invite')
  const [state, formAction] = useActionState(handleAdminAction, null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch('/api/companies')
        if (response.ok) {
          const data = await response.json()
          setCompanies(data.companies || [])
        }
      } catch (error) {
        console.error('Failed to fetch companies:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCompanies()
  }, [])

  const hasCompanies = companies.length > 0

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-slate-100 rounded"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 無物業公司時的提示 */}
      {!hasCompanies && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">尚無物業公司資料</p>
              <p className="text-sm text-amber-600 mt-1">請先至「物業公司管理」新增物業公司後，再進行管理員邀請或建立。</p>
            </div>
          </div>
        </div>
      )}

      {/* 模式切換器 */}
      <div className="flex bg-slate-100 p-1 rounded-lg w-fit">
        <button 
          onClick={() => setMode('invite')}
          disabled={!hasCompanies}
          className={`px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${
            mode === 'invite' 
              ? 'bg-white shadow text-indigo-600' 
              : hasCompanies 
                ? 'text-slate-500 hover:text-slate-700' 
                : 'text-slate-300 cursor-not-allowed'
          }`}
        >
          <Send size={14} /> 發送邀請信
        </button>
        <button 
          onClick={() => setMode('create')}
          disabled={!hasCompanies}
          className={`px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${
            mode === 'create' 
              ? 'bg-white shadow text-indigo-600' 
              : hasCompanies 
                ? 'text-slate-500 hover:text-slate-700' 
                : 'text-slate-300 cursor-not-allowed'
          }`}
        >
          <UserPlus size={14} /> 直接建立帳號
        </button>
      </div>

      <form action={formAction} className="space-y-6">
        {/* 基本資料區 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">管理員姓名</label>
            <input name="name" type="text" required 
              disabled={!hasCompanies}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-slate-100 disabled:text-slate-500" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">電子郵件</label>
            <input name="email" type="email" required 
              disabled={!hasCompanies}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-slate-100 disabled:text-slate-500" 
            />
          </div>

          {/* 物業公司下拉選單 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Building size={16} /> 物業公司
            </label>
            {hasCompanies ? (
              <CompanySelect companies={companies} />
            ) : (
              <input 
                type="text" 
                value="尚無物業公司" 
                disabled 
                className="w-full px-4 py-2 border rounded-lg bg-slate-100 text-slate-500 cursor-not-allowed" 
              />
            )}
            {/* 隱藏的公司名稱欄位，用於表單提交 */}
            {mode === 'invite' && hasCompanies && (
              <input 
                type="hidden" 
                name="company_name" 
                required 
              />
            )}
          </div>
        </div>

        {/* 模式特有欄位：密碼 */}
        {mode === 'create' && (
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg space-y-2 animate-in fade-in slide-in-from-top-2">
            <label className="text-sm font-medium text-amber-800 flex items-center gap-2">
              <Key size={16} /> 設定初始密碼
            </label>
            <input name="password" type="text" required placeholder="例如: Property123!" 
              disabled={!hasCompanies}
              className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none disabled:bg-slate-100 disabled:text-slate-500" 
            />
            <p className="text-xs text-amber-600">※ 直接建立帳號將跳過郵件驗證，使用者可立即登入。</p>
          </div>
        )}

        {state?.message && (
          <div className={`p-4 rounded-lg text-sm ${state.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {state.message}
          </div>
        )}

        <SubmitButton 
          label={mode === 'invite' ? "發送邀請信" : "直接建立並啟用帳號"} 
          disabled={!hasCompanies}
        />
      </form>
    </div>
  )
}