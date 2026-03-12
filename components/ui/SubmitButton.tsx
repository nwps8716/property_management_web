'use client'

import { useFormStatus } from 'react-dom'

interface SubmitButtonProps {
  label: string
  loadingLabel?: string
  className?: string
  disabled?: boolean
}

export function SubmitButton({ 
  label, 
  loadingLabel = '處理中...', 
  className,
  disabled = false
}: SubmitButtonProps) {
  const { pending } = useFormStatus()

  // 核心邏輯：如果有傳入 className 就用傳入的，否則使用預設的一長串樣式
  const defaultStyle = "relative flex w-full justify-center rounded-md bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-indigo-400 transition-all duration-200"
  
  const finalStyle = className ? className : defaultStyle

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className={finalStyle}
    >
      {pending ? (
        <div className="flex items-center gap-2">
          <svg className="h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{loadingLabel}</span>
        </div>
      ) : (
        label
      )}
    </button>
  )
}