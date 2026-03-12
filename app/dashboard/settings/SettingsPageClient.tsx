'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { updateProfile, UpdateProfileState } from './actions'
import { User, Building2, Mail, Shield } from 'lucide-react'

interface Profile {
  id: string
  name: string
  email: string
  company_name: string | null
  role: string
  created_at: string
  updated_at: string
}

interface SettingsPageClientProps {
  profile: Profile
}

export default function SettingsPageClient({ profile: initialProfile }: SettingsPageClientProps) {
  const [profile, setProfile] = useState<Profile>(initialProfile)
  const [isEditing, setIsEditing] = useState(false)
  const [result, setResult] = useState<UpdateProfileState | null>(null)
  const [isPending, setIsPending] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true)
    setResult(null)
    
    const response = await updateProfile(formData)
    setResult(response)
    
    if (response.success) {
      setIsEditing(false)
      // 更新本地狀態 - 使用客戶端重新獲取資料
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        if (data) {
          // 確保有 email 資料
          const updatedProfile = {
            ...data,
            email: user.email || data.email
          }
          setProfile(updatedProfile)
        }
      }
    }
    
    setIsPending(false)
  }

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'super_admin':
        return '超級管理員'
      case 'property_admin':
        return '物管管理員'
      default:
        return role
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* 頁面標題 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">個人資料</h1>
        <p className="mt-2 text-gray-600">管理您的帳戶資訊和個人設定</p>
      </div>

      {/* 成功/錯誤訊息 */}
      {result && (
        <div
          className={`mb-6 rounded-lg p-4 ${
            result.success
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {result.success ? (
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <span className="font-medium">{result.message}</span>
          </div>
        </div>
      )}

      {/* 主要內容卡片 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* 卡片標題 */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <User className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">基本資料</h2>
              <p className="text-sm text-slate-500">編輯您的個人資訊</p>
            </div>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              編輯資料
            </button>
          )}
        </div>

        {/* 表單 */}
        <form action={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 姓名欄位 */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-400" />
                  姓名 <span className="text-red-500">*</span>
                </div>
              </label>
              {isEditing ? (
                <input
                  type="text"
                  id="name"
                  name="name"
                  defaultValue={profile.name}
                  required
                  className="block w-full rounded-lg border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors border"
                  placeholder="請輸入您的姓名"
                />
              ) : (
                <div className="block w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 sm:text-sm">
                  {profile.name}
                </div>
              )}
            </div>

            {/* 電子郵件欄位 (唯讀) */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-400" />
                  電子郵件
                </div>
              </label>
              <div className="block w-full rounded-lg border border-slate-200 bg-slate-100 px-4 py-2.5 text-slate-500 sm:text-sm">
                {profile.email}
              </div>
              <p className="text-xs text-slate-400">電子郵件無法修改，如需變更請聯繫系統管理員</p>
            </div>

            {/* 公司名稱欄位 (唯讀) */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-slate-400" />
                  公司名稱
                </div>
              </label>
              <div className="block w-full rounded-lg border border-slate-200 bg-slate-100 px-4 py-2.5 text-slate-500 sm:text-sm">
                {profile.company_name || '-'}
              </div>
              <p className="text-xs text-slate-400">公司名稱無法修改，如需變更請聯繫系統管理員</p>
            </div>

            {/* 角色欄位 (唯讀) */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-slate-400" />
                  角色權限
                </div>
              </label>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    profile.role === 'super_admin'
                      ? 'bg-purple-100 text-purple-800 border border-purple-200'
                      : 'bg-blue-100 text-blue-800 border border-blue-200'
                  }`}
                >
                  {getRoleDisplay(profile.role)}
                </span>
              </div>
              <p className="text-xs text-slate-400">角色權限由系統管理員設定</p>
            </div>
          </div>

          {/* 帳戶資訊 */}
          <div className="pt-6 border-t border-slate-200">
            <h3 className="text-sm font-medium text-slate-700 mb-4">帳戶資訊</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <span className="text-slate-500">建立時間</span>
                <p className="text-slate-900">
                  {new Date(profile.created_at).toLocaleDateString('zh-TW', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500">最後更新</span>
                <p className="text-slate-900">
                  {profile.updated_at 
                    ? new Date(profile.updated_at).toLocaleDateString('zh-TW', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '-'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* 操作按鈕 */}
          {isEditing && (
            <div className="pt-6 border-t border-slate-200 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false)
                  setResult(null)
                }}
                disabled={isPending}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                取消
              </button>
              <SubmitButton
                label="儲存變更"
                loadingLabel="正在儲存..."
                className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center justify-center gap-2 transition-colors"
              />
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
