'use client'

import { useState, useEffect } from 'react'
import { Building } from 'lucide-react'

export interface Company {
  id: string
  name: string
}

interface CompanySelectProps {
  companies: Company[]
}

export function CompanySelect({ companies }: CompanySelectProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCompany = companies.find(c => c.id === e.target.value)
    if (selectedCompany) {
      // 同時更新公司名稱隱藏欄位
      const companyNameInput = document.querySelector('input[name="company_name"]') as HTMLInputElement
      if (companyNameInput) {
        companyNameInput.value = selectedCompany.name
      }
    }
  }

  if (!mounted) {
    return (
      <div className="w-full px-4 py-2 border rounded-lg bg-slate-100 text-slate-500">
        載入中...
      </div>
    )
  }

  return (
    <select 
      name="company_id" 
      required 
      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
      onChange={handleChange}
    >
      <option value="">請選擇物業公司</option>
      {companies.map((company) => (
        <option key={company.id} value={company.id}>
          {company.name} ({company.id})
        </option>
      ))}
    </select>
  )
}
