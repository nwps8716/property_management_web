// src/app/login/page.tsx
'use client'

import { useState, Suspense } from 'react'
import { login } from './actions'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { useSearchParams } from 'next/navigation'

function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const next = searchParams.get('next') // 取得 middleware 傳過來的跳轉目標

  async function clientAction(formData: FormData) {
    setError(null)
    const result = await login(formData)
    if (result?.error) {
      setError(result.error)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-10 shadow-xl border border-gray-100">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 mb-4">
            <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">歡迎回來</h2>
          <p className="mt-2 text-sm text-gray-500">請登入以管理您的系統</p>
        </div>

        <form action={clientAction} className="mt-8 space-y-6">
          {/* 傳遞跳轉目標的隱藏欄位 */}
          <input type="hidden" name="next" value={next ?? '/dashboard'} />

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                name="email"
                type="email"
                required
                className="block w-full rounded-lg border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors"
                placeholder="name@company.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">密碼</label>
              <input
                name="password"
                type="password"
                required
                className="block w-full rounded-lg border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <SubmitButton label="登入系統" loadingLabel="正在驗證身份..." />
        </form>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-10 shadow-xl border border-gray-100">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 mb-4">
              <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">歡迎回來</h2>
            <p className="mt-2 text-sm text-gray-500">請登入以管理您的系統</p>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}