'use client'

import { useState } from 'react'
import { deleteCommunity, Community } from '@/app/dashboard/admin/communities/actions'
import { CommunityForm } from './CommunityForm'
import { Home, Building2, Ticket, Edit2, Trash2, Plus } from 'lucide-react'
import { Company } from './CompanySelect'

interface CommunityTableProps {
  communities: Community[]
  companies: Company[]
  userRole: 'super_admin' | 'property_admin'
  userCompanyId?: string
}

export function CommunityTable({
  communities,
  companies,
  userRole,
  userCompanyId
}: CommunityTableProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingCommunity, setEditingCommunity] = useState<Community | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    const formData = new FormData()
    formData.append('id', id)
    const result = await deleteCommunity(null, formData)
    if (result.success) {
      setDeleteConfirmId(null)
      window.location.reload()
    }
  }

  const handleEditSuccess = () => {
    setEditingCommunity(null)
    window.location.reload()
  }

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false)
    window.location.reload()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">社區管理</h1>
          <p className="mt-1 text-slate-600">
            {userRole === 'super_admin' 
              ? '管理所有社區資料' 
              : '管理您所屬物業公司的社區'}
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          新增社區
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  <Home className="inline w-4 h-4 mr-1" />
                  社區名稱
                </th>
                {userRole === 'super_admin' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    <Building2 className="inline w-4 h-4 mr-1" />
                    所屬公司
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  設施
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  <Ticket className="inline w-4 h-4 mr-1" />
                  邀請代碼
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {communities.length === 0 ? (
                <tr>
                  <td
                    colSpan={userRole === 'super_admin' ? 5 : 4}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    <Home className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                    <p>暫無社區資料</p>
                    <p className="text-sm mt-1">
                      {userRole === 'property_admin' 
                        ? '請聯繫超級管理員為您創建社區' 
                        : '點擊右上角按鈕創建第一個社區'}
                    </p>
                  </td>
                </tr>
              ) : (
                communities.map((community) => (
                  <tr key={community.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-slate-900">{community.name}</div>
                    </td>
                    {userRole === 'super_admin' && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-slate-600">
                          {community.companies?.name || '未知公司'}
                        </div>
                        <div className="text-xs text-slate-400">{community.company_id}</div>
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {community.facilities && community.facilities.length > 0 ? (
                          community.facilities.slice(0, 3).map((facility, idx) => (
                            <span
                              key={idx}
                              className="inline-block px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded"
                            >
                              {typeof facility === 'string' ? facility : facility.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 text-sm">無設施</span>
                        )}
                        {community.facilities && community.facilities.length > 3 && (
                          <span className="inline-block px-2 py-0.5 text-xs text-slate-400">
                            +{community.facilities.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-sm font-mono">
                        {community.invite_code}
                      </code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingCommunity(community)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="編輯"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(community.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="刪除"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-900 text-lg">新增社區</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <CommunityForm
                mode="create"
                companies={companies}
                userRole={userRole}
                userCompanyId={userCompanyId}
                onSuccess={handleCreateSuccess}
                onCancel={() => setIsCreateModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingCommunity && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-900 text-lg">編輯社區</h3>
              <button
                onClick={() => setEditingCommunity(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <CommunityForm
                mode="edit"
                community={editingCommunity}
                companies={companies}
                userRole={userRole}
                userCompanyId={userCompanyId}
                onSuccess={handleEditSuccess}
                onCancel={() => setEditingCommunity(null)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-red-50">
              <h3 className="font-bold text-red-900 text-lg">確認刪除</h3>
            </div>
            <div className="p-6">
              <p className="text-slate-700 mb-6">
                確定要刪除此社區嗎？此操作無法復原，該社區的所有相關資料將被永久刪除。
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirmId)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
                >
                  確認刪除
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
