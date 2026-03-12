'use client'

import { useState } from 'react'
import { Building2, Edit, Trash2, Plus, Mail, Phone, User } from 'lucide-react'
import { createCompany, updateCompany, deleteCompany } from '@/app/dashboard/admin/companies/actions'

interface Company {
  id: string
  name: string
  owner_name: string | null
  contact_phone: string | null
  contact_email: string | null
  created_at: string
  updated_at: string
}

interface CompanyTableProps {
  companies: Company[]
}

export function CompanyTable({ companies }: CompanyTableProps) {
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleSubmit = async (formData: FormData) => {
    setResult(null)
    
    let response
    if (editingCompany) {
      response = await updateCompany(editingCompany.id, formData)
    } else if (isAddingNew) {
      response = await createCompany(formData)
    }

    if (response) {
      setResult(response)
      if (response.success) {
        setEditingCompany(null)
        setIsAddingNew(false)
        // 重新載入頁面以顯示最新資料
        window.location.reload()
      }
    }
  }

  const handleDelete = async (companyId: string) => {
    if (!confirm('確定要刪除這個物業公司嗎？此操作無法復原。')) {
      return
    }

    const response = await deleteCompany(companyId)
    if (response) {
      setResult(response)
      if (response.success) {
        window.location.reload()
      }
    }
  }

  const openEditModal = (company: Company) => {
    setEditingCompany(company)
    setIsAddingNew(false)
    setResult(null)
  }

  const openAddModal = () => {
    setIsAddingNew(true)
    setEditingCompany(null)
    setResult(null)
  }

  const closeModal = () => {
    setEditingCompany(null)
    setIsAddingNew(false)
    setResult(null)
  }

  return (
    <div className="space-y-6">
      {/* 操作按鈕和結果訊息 */}
      <div className="flex items-center justify-between">
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          新增物業公司
        </button>

        {result && (
          <div
            className={`rounded-lg p-3 text-sm ${
              result.success
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            {result.message}
          </div>
        )}
      </div>

      {/* 資料表格 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  公司代碼
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  公司名稱
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  負責人
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  聯絡電話
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  聯絡信箱
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  建立時間
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {companies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <Building2 className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                    <p>尚無物業公司資料</p>
                    <p className="text-sm mt-1">點擊「新增物業公司」開始新增</p>
                  </td>
                </tr>
              ) : (
                companies.map((company) => (
                  <tr key={company.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      {company.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900">
                      {company.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {company.owner_name || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {company.contact_phone || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {company.contact_email || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(company.created_at).toLocaleDateString('zh-TW', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(company)}
                          className="p-1 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                          title="編輯"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(company.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="刪除"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 編輯/新增 Modal */}
      {(editingCompany || isAddingNew) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">
                {isAddingNew ? '新增物業公司' : '編輯物業公司'}
              </h2>
            </div>

            <form action={handleSubmit} className="p-6 space-y-4">
              {/* 公司代碼 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  公司代碼 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="id"
                  defaultValue={editingCompany?.id || ''}
                  required
                  disabled={!isAddingNew} // 編輯時不允許修改 ID
                  className="block w-full rounded-lg border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border disabled:bg-slate-100 disabled:text-slate-500"
                  placeholder="例如：STAR-001"
                />
                {!isAddingNew && (
                  <p className="text-xs text-slate-400">公司代碼建立後無法修改</p>
                )}
              </div>

              {/* 公司名稱 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  公司名稱 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingCompany?.name || ''}
                  required
                  className="block w-full rounded-lg border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border"
                  placeholder="請輸入公司名稱"
                />
              </div>

              {/* 負責人 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-400" />
                    負責人
                  </div>
                </label>
                <input
                  type="text"
                  name="owner_name"
                  defaultValue={editingCompany?.owner_name || ''}
                  className="block w-full rounded-lg border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border"
                  placeholder="請輸入負責人姓名"
                />
              </div>

              {/* 聯絡電話 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-slate-400" />
                    聯絡電話
                  </div>
                </label>
                <input
                  type="tel"
                  name="contact_phone"
                  defaultValue={editingCompany?.contact_phone || ''}
                  className="block w-full rounded-lg border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border"
                  placeholder="請輸入聯絡電話"
                />
              </div>

              {/* 聯絡信箱 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-slate-400" />
                    聯絡信箱
                  </div>
                </label>
                <input
                  type="email"
                  name="contact_email"
                  defaultValue={editingCompany?.contact_email || ''}
                  className="block w-full rounded-lg border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border"
                  placeholder="請輸入聯絡信箱"
                />
              </div>

              {/* 操作按鈕 */}
              <div className="pt-4 border-t border-slate-200 flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
                >
                  {isAddingNew ? '新增' : '儲存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
