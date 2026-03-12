'use client'

import { useState } from 'react'
import { updatePropertyAdmin, sendEmailChangeLink } from '@/app/dashboard/admin/actions'
import { DeleteButton } from './DeleteButton'
import { FormattedDate } from '@/components/ui/FormattedDate'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { User, Mail, Building2, Calendar, X } from 'lucide-react'

// 1. 定義 Admin 的資料結構，取代 any
interface AdminProfile {
  id: string
  name: string
  company_name: string
  company_id: string
  created_at: string
  role: string
  email: string
}

export function AdminTable({ initialAdmins }: { initialAdmins: AdminProfile[] }) {
  const [editingAdmin, setEditingAdmin] = useState<AdminProfile | null>(null)
  const [newEmail, setNewEmail] = useState<string>('')
  const [isSaving, setIsSaving] = useState(false)

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!editingAdmin) return;

    setIsSaving(true)
    const formData = new FormData(e.currentTarget)
    
    const result = await updatePropertyAdmin(editingAdmin.id, formData)
    
    if (result.success) {
      setEditingAdmin(null)
    } else {
      alert(result.message)
    }
    setIsSaving(false)
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">管理員姓名</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">所屬公司</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">公司 ID</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">建立時間</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {initialAdmins.map((admin) => (
              <tr key={admin.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm text-slate-900 font-medium">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                      <User size={14} />
                    </div>
                    {admin.name}
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      <Mail size={12} className="text-slate-400" />
                    {admin.email}
                  </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-900">
                  <div className="flex items-center gap-2">
                    <Building2 size={16} />
                    {admin.company_name}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-mono font-bold border border-indigo-100">
                    {admin.company_id}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    <FormattedDate date={admin.created_at} />
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setEditingAdmin(admin)}
                      className="text-indigo-600 hover:text-indigo-900 font-medium"
                    >
                      編輯
                    </button>
                    <DeleteButton adminId={admin.id} adminName={admin.name} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 編輯 Modal 彈窗 */}
      {editingAdmin && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Building2 size={18} className="text-indigo-600" />
                編輯管理員資訊
              </h3>
              <button onClick={() => setEditingAdmin(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">姓名</label>
                <input name="name" defaultValue={editingAdmin.name} required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">帳號 (Email)</label>
                <div className="flex gap-2">
                  <input 
                    type="email"
                    defaultValue={editingAdmin.email}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="輸入新 Email"
                    className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" 
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (!newEmail || newEmail === editingAdmin.email) {
                        alert('請輸入不同的新 Email');
                        return;
                      }
                      const res = await sendEmailChangeLink(editingAdmin.id, newEmail);
                      if (res.success) alert(res.message);
                      else alert(res.message);
                    }}
                    className="px-3 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-semibold hover:bg-amber-100 transition-colors"
                  >
                    發送變更連結
                  </button>
                </div>
                <p className="mt-1 text-[12px] text-slate-400">
                  * 點擊發送後，系統會寄送驗證信。在對方更改前，帳號仍維持舊信箱。
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">公司名稱</label>
                <input name="company_name" defaultValue={editingAdmin.company_name} required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">公司 ID (需唯一)</label>
                <input name="company_id" defaultValue={editingAdmin.company_id} required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setEditingAdmin(null)}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                >
                  取消
                </button>
                <SubmitButton 
                  label="儲存變更"
                  loadingLabel="儲存中..."
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center justify-center gap-2"
                />
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}