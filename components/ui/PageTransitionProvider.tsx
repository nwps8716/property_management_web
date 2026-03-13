'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

interface PageTransitionProviderProps {
  children: React.ReactNode
}

export function PageTransitionProvider({ children }: PageTransitionProviderProps) {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    // 監聽路徑變化
    setIsTransitioning(true)
    
    // 短暫延遲後顯示新內容
    const timer = setTimeout(() => {
      setIsTransitioning(false)
    }, 150)

    return () => clearTimeout(timer)
  }, [pathname])

  return (
    <div className={`transition-all duration-300 ease-in-out ${
      isTransitioning 
        ? 'opacity-0 transform translate-y-2' 
        : 'opacity-100 transform translate-y-0'
    }`}>
      {children}
    </div>
  )
}
