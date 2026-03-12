'use client'

import { useState, useEffect } from 'react'

interface FormattedDateProps {
  date: string | Date
  showTime?: boolean    // 是否顯示時分秒
  className?: string    // 外部樣式
}

export function FormattedDate({ 
  date, 
  showTime = true, 
  className = "" 
}: FormattedDateProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // 使用 requestAnimationFrame 或 setTimeout(..., 0)
    const handle = requestAnimationFrame(() => {
        setMounted(true);
    });
    return () => cancelAnimationFrame(handle);
  }, []);

  // 伺服器端渲染：先顯示一個灰色的佔位符或簡短格式，避免 Hydration 衝突
  if (!mounted) {
    return <span className={`animate-pulse text-slate-300 ${className}`}>Loading...</span>
  }

  const dateObj = typeof date === 'string' ? new Date(date) : date

  const formatted = dateObj.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: showTime ? '2-digit' : undefined,
    minute: showTime ? '2-digit' : undefined,
    second: showTime ? '2-digit' : undefined,
    hour12: false,
  }).replace(/\//g, '-')

  return <span className={className}>{formatted}</span>
}