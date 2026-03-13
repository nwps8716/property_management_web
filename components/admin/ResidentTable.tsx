'use client'

import { useState } from 'react'
import { deleteResident, Resident, Community } from '@/app/dashboard/admin/residents/actions'
import { ResidentForm } from './ResidentForm'
import { User, Home, Building, MapPin, Car, Phone, Mail, Edit2, Trash2, Plus } from 'lucide-react'

interface Company {
  id: string
  name: string
}

interface ResidentTableProps {
  residents: Resident[]
  communities: Community[]
  companies: Company[]
  userRole: 'super_admin' | 'property_admin'
  userCompanyId?: string
  initialCommunityId?: string
}

export function ResidentTable({
  residents,
  communities,
  companies,
  userRole,
  userCompanyId,
  initialCommunityId
}: ResidentTableProps) {
  const [selectedCommunityId, setSelectedCommunityId] = useState<string>(initialCommunityId || '')
  const [filteredResidents, setFilteredResidents] = useState<Resident[]>(residents)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingResident, setEditingResident] = useState<Resident | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const isSuperAdmin = userRole === 'super_admin'

  // Handle community filter change
  const handleCommunityChange = (communityId: string) => {
    setSelectedCommunityId(communityId)
    if (communityId) {
      setFilteredResidents(residents.filter(r => r.community_id === communityId))
    } else {
      setFilteredResidents(residents)
    }
  }

  const handleDelete = async (id: string) => {
    const formData = new FormData()
    formData.append('id', id)
    const result = await deleteResident(null, formData)
    if (result.success) {
      setDeleteConfirmId(null)
      window.location.reload()
    } else {
      // Show error alert for debugging
      alert(`刪除失敗：${result.message}`)
      setDeleteConfirmId(null)
    }
  }

  const handleEditSuccess = () => {
    setEditingResident(null)
    window.location.reload()
  }

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false)
    window.location.reload()
  }

  // Get current selected community name
  const selectedCommunity = communities.find(c => c.id === selectedCommunityId)

  return (
    <div className="space-y-6">
      {/* Header with Community Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">住戶管理</h1>
          <p className="mt-1 text-slate-600">
            {isSuperAdmin 
              ? '管理所有社區的住戶資料' 
              : '管理所屬物業公司的住戶資料'}
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          新增住戶
        </button>
      </div>

      {/* Community Filter - Always show for super_admin, or when multiple communities */}
      {(isSuperAdmin || communities.length > 1) && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <Home className="inline w-4 h-4 mr-1" />
            {isSuperAdmin ? '選擇社區查看住戶' : '篩選社區'}
          </label>
          <select
            value={selectedCommunityId}
            onChange={(e) => handleCommunityChange(e.target.value)}
            className="w-full sm:w-80 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          >
            <option value="">
              {isSuperAdmin ? '請選擇社區（顯示所有住戶）' : '顯示所有管理的社區'}
            </option>
            {communities.map((community) => (
              <option key={community.id} value={community.id}>
                {community.name} {community.companies ? `(${community.companies.name})` : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  <User className="inline w-4 h-4 mr-1" />
                  住戶姓名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  <Mail className="inline w-4 h-4 mr-1" />
                  聯絡資訊
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  <Building className="inline w-4 h-4 mr-1" />
                  所屬社區
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  <MapPin className="inline w-4 h-4 mr-1" />
                  住址資訊
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  <Car className="inline w-4 h-4 mr-1" />
                  車位
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredResidents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <User className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                    <p>暫無住戶資料</p>
                    <p className="text-sm mt-1">
                      {selectedCommunityId 
                        ? '該社區目前沒有住戶' 
                        : isSuperAdmin 
                          ? '請先選擇社區或直接新增住戶' 
                          : '請新增第一個住戶'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredResidents.map((resident) => (
                  <tr key={resident.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-slate-900">{resident.name}</div>
                      <div className="text-xs text-slate-400">{resident.id.slice(0, 8)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-600">
                        <Mail className="inline w-3 h-3 mr-1" />
                        {resident.email}
                      </div>
                      {resident.phone && (
                        <div className="text-sm text-slate-600 mt-1">
                          <Phone className="inline w-3 h-3 mr-1" />
                          {resident.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {resident.communities ? (
                        <div>
                          <div className="text-sm text-slate-900">{resident.communities.name}</div>
                          {isSuperAdmin && resident.communities.company_id && (
                            <div className="text-xs text-slate-500">
                              {companies.find(c => c.id === resident.communities?.company_id)?.name || '未知公司'}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-sm">未分配</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {resident.resident_details ? (
                        <div className="text-sm text-slate-600">
                          {resident.resident_details.building && (
                            <span>{resident.resident_details.building}</span>
                          )}
                          {resident.resident_details.floor && (
                            <span> {resident.resident_details.floor}</span>
                          )}
                          {resident.resident_details.unit_number && (
                            <span className="text-slate-900 font-medium ml-1">
                              {resident.resident_details.unit_number}
                            </span>
                          )}
                          {!resident.resident_details.building && !resident.resident_details.floor && !resident.resident_details.unit_number && (
                            <span className="text-slate-400">未填寫</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-sm">未填寫</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {resident.resident_details?.parking_space ? (
                        <div className="text-sm text-slate-900">
                          <Car className="inline w-4 h-4 mr-1 text-indigo-500" />
                          {resident.resident_details.parking_space}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-sm">無</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingResident(resident)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="編輯"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(resident.id)}
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-900 text-lg">新增住戶</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <ResidentForm
                mode="create"
                communities={communities}
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
      {editingResident && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-900 text-lg">編輯住戶</h3>
              <button
                onClick={() => setEditingResident(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <ResidentForm
                mode="edit"
                resident={editingResident}
                communities={communities}
                companies={companies}
                userRole={userRole}
                userCompanyId={userCompanyId}
                onSuccess={handleEditSuccess}
                onCancel={() => setEditingResident(null)}
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
                確定要刪除此住戶嗎？此操作無法復原，該住戶的所有相關資料將被永久刪除。
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
