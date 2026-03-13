'use client'

import { useState, useActionState, useEffect } from 'react'
import { createResident, updateResident, ActionState, Resident, Community } from '@/app/dashboard/admin/residents/actions'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { User, Mail, Phone, Building, Home, MapPin, Car, Lock } from 'lucide-react'

interface Company {
  id: string
  name: string
}

interface ResidentFormProps {
  mode: 'create' | 'edit'
  resident?: Resident
  communities: Community[]
  companies: Company[]
  userRole: 'super_admin' | 'property_admin'
  userCompanyId?: string
  onSuccess: () => void
  onCancel: () => void
}

export function ResidentForm({
  mode,
  resident,
  communities,
  companies,
  userRole,
  userCompanyId,
  onSuccess,
  onCancel
}: ResidentFormProps) {
  const action = mode === 'create' ? createResident : updateResident
  const [state, formAction, isPending] = useActionState<ActionState | null, FormData>(
    action,
    null
  )

  // Reset state when switching modes or closing
  useEffect(() => {
    if (state?.success) {
      onSuccess()
    }
  }, [state, onSuccess])

  const isSuperAdmin = userRole === 'super_admin'

  // Filter communities based on selected company
  const [selectedCompanyId, setSelectedCompanyId] = useState(
    resident?.communities?.company_id || (isSuperAdmin ? '' : userCompanyId || '')
  )

  const filteredCommunities = selectedCompanyId
    ? communities.filter(c => c.company_id === selectedCompanyId)
    : communities

  return (
    <form 
      action={(formData) => {
        // Debug: log all form data
        console.log('[ResidentForm] Submitting form data:')
        for (const [key, value] of formData.entries()) {
          console.log(`  ${key}: ${value}`)
        }
        formAction(formData)
      }} 
      className="space-y-5"
    >
      {/* Hidden field for resident ID in edit mode */}
      {mode === 'edit' && resident && (
        <input type="hidden" name="id" value={resident.id} />
      )}

      {/* Hidden field for company_id when not super_admin */}
      {!isSuperAdmin && (
        <input type="hidden" name="company_id" value={userCompanyId || ''} />
      )}

      {/* Error/Success Messages */}
      {state?.success === false && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {state.message}
        </div>
      )}

      {state?.success === true && (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-600">
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {state.message}
        </div>
      )}

      {/* Basic Info Section */}
      <div className="space-y-4">
        <h4 className="font-medium text-slate-900 text-sm uppercase tracking-wide">基本資料</h4>

        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
            <User className="inline w-4 h-4 mr-1" />
            住戶姓名
          </label>
          <input
            type="text"
            id="name"
            name="name"
            defaultValue={resident?.name || ''}
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            placeholder="請輸入住戶姓名"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
            <Mail className="inline w-4 h-4 mr-1" />
            電子郵件
          </label>
          <input
            type="email"
            id="email"
            name="email"
            defaultValue={resident?.email || ''}
            required
            disabled={mode === 'edit'}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all disabled:bg-slate-100 disabled:text-slate-500"
            placeholder="請輸入電子郵件"
          />
          {mode === 'edit' && (
            <p className="text-xs text-slate-500 mt-1">電子郵件無法修改</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
            <Phone className="inline w-4 h-4 mr-1" />
            電話號碼
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            defaultValue={resident?.phone || ''}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            placeholder="0912345678"
          />
          <p className="text-xs text-slate-500 mt-1">
            系統會自動加上 +886 國碼並移除第一個 0（選填）
          </p>
        </div>

        {/* Password (only for create) */}
        {mode === 'create' && (
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
              <Lock className="inline w-4 h-4 mr-1" />
              密碼
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              minLength={6}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="請輸入密碼（至少6位）"
            />
          </div>
        )}
      </div>

      <hr className="border-slate-200" />

      {/* Organization Section */}
      <div className="space-y-4">
        <h4 className="font-medium text-slate-900 text-sm uppercase tracking-wide">所屬單位</h4>

        {/* Company Select */}
        <div>
          <label htmlFor="company_id" className="block text-sm font-medium text-slate-700 mb-1">
            <Building className="inline w-4 h-4 mr-1" />
            物業公司
          </label>
          <select
            id="company_id"
            name="company_id"
            value={selectedCompanyId}
            onChange={(e) => setSelectedCompanyId(e.target.value)}
            required
            disabled={!isSuperAdmin}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all disabled:bg-slate-100 disabled:text-slate-500"
          >
            <option value="">請選擇物業公司</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
          {!isSuperAdmin && (
            <p className="text-xs text-slate-500 mt-1">您只能選擇所屬的物業公司</p>
          )}
        </div>

        {/* Community Select */}
        <div>
          <label htmlFor="community_id" className="block text-sm font-medium text-slate-700 mb-1">
            <Home className="inline w-4 h-4 mr-1" />
            所屬社區
          </label>
          <select
            id="community_id"
            name="community_id"
            defaultValue={resident?.community_id || ''}
            required
            disabled={!selectedCompanyId && filteredCommunities.length === 0}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all disabled:bg-slate-100 disabled:text-slate-500"
          >
            <option value="">
              {!selectedCompanyId ? '請先選擇物業公司' : '請選擇社區'}
            </option>
            {filteredCommunities.map((community) => (
              <option key={community.id} value={community.id}>
                {community.name}
              </option>
            ))}
          </select>
          {filteredCommunities.length === 0 && selectedCompanyId && (
            <p className="text-xs text-amber-600 mt-1">該物業公司暫無社區</p>
          )}
        </div>
      </div>

      <hr className="border-slate-200" />

      {/* Resident Details Section */}
      <div className="space-y-4">
        <h4 className="font-medium text-slate-900 text-sm uppercase tracking-wide">住戶詳細資料</h4>

        {/* Building */}
        <div>
          <label htmlFor="building" className="block text-sm font-medium text-slate-700 mb-1">
            <Building className="inline w-4 h-4 mr-1" />
            棟別
          </label>
          <input
            type="text"
            id="building"
            name="building"
            defaultValue={resident?.resident_details?.building || ''}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            placeholder="例如：A 棟"
          />
        </div>

        {/* Floor */}
        <div>
          <label htmlFor="floor" className="block text-sm font-medium text-slate-700 mb-1">
            <MapPin className="inline w-4 h-4 mr-1" />
            樓層
          </label>
          <input
            type="text"
            id="floor"
            name="floor"
            defaultValue={resident?.resident_details?.floor || ''}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            placeholder="例如：12 樓"
          />
        </div>

        {/* Unit Number */}
        <div>
          <label htmlFor="unit_number" className="block text-sm font-medium text-slate-700 mb-1">
            <MapPin className="inline w-4 h-4 mr-1" />
            門牌號碼
          </label>
          <input
            type="text"
            id="unit_number"
            name="unit_number"
            defaultValue={resident?.resident_details?.unit_number || ''}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            placeholder="例如：1201"
          />
        </div>

        {/* Parking Space */}
        <div>
          <label htmlFor="parking_space" className="block text-sm font-medium text-slate-700 mb-1">
            <Car className="inline w-4 h-4 mr-1" />
            車位號碼
          </label>
          <input
            type="text"
            id="parking_space"
            name="parking_space"
            defaultValue={resident?.resident_details?.parking_space || ''}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            placeholder="例如：B2-123"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
        >
          取消
        </button>
        <SubmitButton
          label={mode === 'create' ? '新增住戶' : '更新住戶'}
          className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
        />
      </div>
    </form>
  )
}
