'use client'

import { useActionState, useState, useEffect } from 'react'
import { createCommunity, updateCommunity, ActionState } from '@/app/dashboard/admin/communities/actions'
import { Building2, Home, Sparkles, Plus, X } from 'lucide-react'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { Company } from '@/components/admin/CompanySelect'

interface CommunityFormProps {
  mode: 'create' | 'edit'
  community?: {
    id: string
    name: string
    facilities: any[]
    company_id: string
  }
  companies: Company[]
  userRole: 'super_admin' | 'property_admin'
  userCompanyId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function CommunityForm({
  mode,
  community,
  companies,
  userRole,
  userCompanyId,
  onSuccess,
  onCancel
}: CommunityFormProps) {
  const action = mode === 'create' ? createCommunity : updateCommunity
  const [state, formAction, isPending] = useActionState<ActionState | null, FormData>(
    action,
    null
  )
  const [facilities, setFacilities] = useState<string[]>(
    community?.facilities?.map((f: any) => typeof f === 'string' ? f : f.name) || []
  )
  const [newFacility, setNewFacility] = useState('')
  const [selectedCompanyId, setSelectedCompanyId] = useState(
    community?.company_id || (userRole === 'property_admin' ? userCompanyId : '')
  )

  // Filter companies based on user role
  const availableCompanies = userRole === 'super_admin'
    ? companies
    : companies.filter(c => c.id === userCompanyId)

  const handleAddFacility = () => {
    if (newFacility.trim() && !facilities.includes(newFacility.trim())) {
      setFacilities([...facilities, newFacility.trim()])
      setNewFacility('')
    }
  }

  const handleRemoveFacility = (facility: string) => {
    setFacilities(facilities.filter(f => f !== facility))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddFacility()
    }
  }

  useEffect(() => {
    if (state?.success) {
      onSuccess?.()
    }
  }, [state, onSuccess])

  return (
    <form action={formAction} className="space-y-6">
      {/* Hidden fields */}
      {mode === 'edit' && <input type="hidden" name="id" value={community?.id} />}
      <input type="hidden" name="facilities" value={JSON.stringify(facilities)} />

      {/* Company Selection */}
      <div>
        <label htmlFor="company_id" className="block text-sm font-medium text-slate-700 mb-2">
          <Building2 className="inline w-4 h-4 mr-1" />
          所屬物業公司 {userRole === 'property_admin' && <span className="text-slate-500">(已鎖定)</span>}
        </label>
        {userRole === 'super_admin' ? (
          <select
            id="company_id"
            name="company_id"
            value={selectedCompanyId}
            onChange={(e) => setSelectedCompanyId(e.target.value)}
            required
            className="block w-full rounded-lg border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors"
          >
            <option value="">請選擇物業公司</option>
            {availableCompanies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name} ({company.id})
              </option>
            ))}
          </select>
        ) : (
          <div className="block w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 sm:text-sm">
            {availableCompanies.find(c => c.id === userCompanyId)?.name || '載入中...'}
            <input type="hidden" name="company_id" value={userCompanyId} />
          </div>
        )}
      </div>

      {/* Community Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
          <Home className="inline w-4 h-4 mr-1" />
          社區名稱 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          defaultValue={community?.name}
          required
          placeholder="請輸入社區名稱"
          className="block w-full rounded-lg border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors"
        />
      </div>

      {/* Facilities */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          <Sparkles className="inline w-4 h-4 mr-1" />
          社區設施
        </label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newFacility}
            onChange={(e) => setNewFacility(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="輸入設施名稱後按 Enter"
            className="flex-1 rounded-lg border-slate-300 bg-white px-4 py-2 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors"
          />
          <button
            type="button"
            onClick={handleAddFacility}
            className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        
        {/* Facility Tags */}
        {facilities.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {facilities.map((facility, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm"
              >
                {facility}
                <button
                  type="button"
                  onClick={() => handleRemoveFacility(facility)}
                  className="ml-1 p-0.5 hover:bg-indigo-100 rounded-full transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        {facilities.length === 0 && (
          <p className="text-sm text-slate-400">尚未添加任何設施</p>
        )}
      </div>

      {/* Error Message */}
      {state && !state.success && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {state.message}
        </div>
      )}

      {/* Success Message */}
      {state?.success && (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-600">
          {state.message}
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3 pt-4">
        <SubmitButton
          label={mode === 'create' ? '創建社區' : '儲存變更'}
          loadingLabel={mode === 'create' ? '創建中...' : '儲存中...'}
          className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
        />
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
          >
            取消
          </button>
        )}
      </div>
    </form>
  )
}
