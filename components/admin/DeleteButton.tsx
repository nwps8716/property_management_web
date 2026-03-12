'use client'

import { deletePropertyAdmin } from '@/app/dashboard/admin/actions'
import { Trash2, Loader2 } from 'lucide-react'
import { useState } from 'react'

export function DeleteButton({ adminId, adminName }: { adminId: string, adminName: string }) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`確定要刪除管理員「${adminName}」嗎？此操作無法復原。`)) return

    setIsDeleting(true)
    const result = await deletePropertyAdmin(adminId)
    if (!result.success) {
      alert(result.message)
      setIsDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
      title="刪除"
    >
      {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
    </button>
  )
}