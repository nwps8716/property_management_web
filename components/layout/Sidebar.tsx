'use client'

// src/components/layout/Sidebar.tsx
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { 
  LayoutDashboard, 
  Users,
  UserPlus, 
  Building2, 
  Settings, 
  LogOut,
  ShieldCheck,
  Building,
  Home,
  User,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react'

interface UserProfile {
  name: string
  email: string
  role: string
}

const roleLabels: Record<string, string> = {
  'super_admin': '超級管理員',
  'property_admin': '物業管理員',
  'community_manager': '社區管理員'
}

const roleColors: Record<string, string> = {
  'super_admin': 'bg-red-500',
  'property_admin': 'bg-blue-500',
  'community_manager': 'bg-green-500'
}

export default function Sidebar() {
  const pathname = usePathname()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    const getUserProfile = async () => {
      try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, role')
            .eq('id', user.id)
            .single()
          
          setUserProfile({
            name: profile?.name || user.email || '',
            email: user.email || '',
            role: profile?.role || ''
          })
        }
      } catch (error) {
        console.error('Error fetching user profile:', error)
      } finally {
        setLoading(false)
      }
    }

    getUserProfile()
  }, [])

  const isActive = (path: string) => pathname === path

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  const menuItems = [
    {
      href: '/dashboard',
      icon: LayoutDashboard,
      label: '儀表板',
      showFor: ['super_admin', 'property_admin']
    },
    {
      href: '/dashboard/admin/companies',
      icon: Building2,
      label: '物業公司管理',
      showFor: ['super_admin']
    },
    {
      href: '/dashboard/admin/communities',
      icon: Building,
      label: '社區管理',
      showFor: ['super_admin', 'property_admin']
    },
    {
      href: '/dashboard/admin/residents',
      icon: Home,
      label: '住戶管理',
      showFor: ['super_admin', 'property_admin', 'community_manager']
    },
    {
      href: '/dashboard/admin/invite',
      icon: UserPlus,
      label: '邀請管理員',
      showFor: ['super_admin']
    },
    {
      href: '/dashboard/admin/user',
      icon: Users,
      label: '使用者管理',
      showFor: ['super_admin']
    },
    {
      href: '/dashboard/settings',
      icon: Settings,
      label: '個人設定',
      showFor: ['super_admin', 'property_admin', 'community_manager']
    }
  ]

  const filteredMenuItems = menuItems.filter(item => 
    userProfile && item.showFor.includes(userProfile.role)
  )

  if (loading) {
    return (
      <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-slate-900 text-white transition-all duration-300 ease-in-out`}>
        <div className="animate-pulse">
          <div className={`p-6 border-b border-slate-700`}>
            <div className={`h-8 bg-slate-700 rounded ${isCollapsed ? 'w-8 mx-auto' : ''}`}></div>
          </div>
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className={`h-10 bg-slate-700 rounded ${isCollapsed ? 'w-8 mx-auto' : ''}`}></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-slate-900 text-white flex flex-col transition-all duration-300 ease-in-out`}>
      {/* Logo */}
      <div className={`p-4 border-b border-slate-700 ${isCollapsed ? 'px-2' : 'px-6'}`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed && (
            <h1 className="text-xl font-bold flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 shrink-0" />
              <span className="truncate">物業管理系統</span>
            </h1>
          )}
          <button
            onClick={toggleCollapse}
            className="p-1.5 rounded hover:bg-slate-800 transition-colors shrink-0"
            title={isCollapsed ? '展開側邊欄' : '收合側邊欄'}
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
        {isCollapsed && (
          <div className="flex justify-center mt-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-4 py-2 rounded-lg transition-all ${
                isActive(item.href) 
                  ? 'bg-slate-800 text-white' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
              title={isCollapsed ? item.label : ''}
            >
              <Icon size={20} className="shrink-0" />
              {!isCollapsed && (
                <span className="truncate">{item.label}</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User Info */}
      {userProfile && (
        <div className={`p-4 border-t border-slate-700 ${isCollapsed ? 'px-2' : 'px-4'}`}>
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} mb-3`}>
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center shrink-0">
              <User size={20} />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{userProfile.name}</div>
                <div className="text-sm text-slate-400 truncate">{userProfile.email}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white ${roleColors[userProfile.role] || 'bg-gray-500'}`}>
                    {roleLabels[userProfile.role] || userProfile.role}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          {!isCollapsed && (
            <form action="/auth/signout" method="post">
              <button 
                type="submit"
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-all"
              >
                <LogOut size={16} className="shrink-0" />
                <span>登出</span>
              </button>
            </form>
          )}
          
          {isCollapsed && (
            <form action="/auth/signout" method="post" className="flex justify-center">
              <button 
                type="submit"
                className="p-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-all"
                title="登出"
              >
                <LogOut size={16} />
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
