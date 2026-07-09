import { useMemo, type ReactElement } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/auth.store'
import { ROLE, type Role } from '../../types'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

interface NavigationItem {
  label: string
  path: string
  roles: Role[]
  icon: (className?: string) => ReactElement
}

const roleLabels: Record<Role, string> = {
  [ROLE.SUPER_ADMIN]: 'Super admin',
  [ROLE.ADMIN]: 'Admin',
  [ROLE.TEACHER]: "O'qituvchi",
}

const navigationItems: NavigationItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    roles: [ROLE.SUPER_ADMIN, ROLE.ADMIN, ROLE.TEACHER],
    icon: (className = 'h-[18px] w-[18px]') => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 13h6V4H4v9ZM14 20h6v-6h-6v6ZM14 10h6V4h-6v6ZM4 20h6v-3H4v3Z" />
      </svg>
    ),
  },
  {
    label: "O'quvchilar",
    path: '/students',
    roles: [ROLE.SUPER_ADMIN, ROLE.ADMIN],
    icon: (className = 'h-[18px] w-[18px]') => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: 'Guruhlar',
    path: '/groups',
    roles: [ROLE.SUPER_ADMIN, ROLE.ADMIN, ROLE.TEACHER],
    icon: (className = 'h-[18px] w-[18px]') => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 7h18" />
        <path d="M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
        <path d="M8 11h8" />
        <path d="M8 15h5" />
      </svg>
    ),
  },
  {
    label: "O'qituvchilar",
    path: '/teachers',
    roles: [ROLE.SUPER_ADMIN, ROLE.ADMIN],
    icon: (className = 'h-[18px] w-[18px]') => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 14 3 9l9-5 9 5-9 5Z" />
        <path d="M7 12v5.5A10.3 10.3 0 0 0 12 19a10.3 10.3 0 0 0 5-1.5V12" />
      </svg>
    ),
  },
  {
    label: 'Davomat',
    path: '/attendance',
    roles: [ROLE.SUPER_ADMIN, ROLE.ADMIN, ROLE.TEACHER],
    icon: (className = 'h-[18px] w-[18px]') => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    label: "To'lovlar",
    path: '/payments',
    roles: [ROLE.SUPER_ADMIN, ROLE.ADMIN],
    icon: (className = 'h-[18px] w-[18px]') => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
        <path d="M7 15h2" />
      </svg>
    ),
  },
  {
    label: "E'lonlar",
    path: '/announcements',
    roles: [ROLE.SUPER_ADMIN, ROLE.ADMIN],
    icon: (className = 'h-[18px] w-[18px]') => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 11V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" />
        <path d="M8 15h8" />
        <path d="M10 19h4" />
        <path d="M6 11h12v4a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-4Z" />
      </svg>
    ),
  },
  {
    label: 'Sozlamalar',
    path: '/settings',
    roles: [ROLE.SUPER_ADMIN],
    icon: (className = 'h-[18px] w-[18px]') => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.02a1.65 1.65 0 0 0 .98-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 .99 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.02a1.65 1.65 0 0 0 1.51.98H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51.99V15Z" />
      </svg>
    ),
  },
]

const getInitials = (fullName: string) =>
  fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  const availableItems = useMemo(() => {
    if (!user) {
      return []
    }

    return navigationItems.filter((item) => item.roles.includes(user.role))
  }, [user])

  const handleLogout = () => {
    logout()
    onClose()
    navigate('/login', { replace: true })
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-slate-950/30 transition md:hidden ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-[260px] flex-col bg-primary-700 transition-transform duration-200 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-5 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent-500 text-lg font-semibold text-primary-700">
              M
            </div>
            <div>
              <p className="text-base font-semibold text-white">Matonat</p>
              <p className="text-sm text-gray-400">O'quv markazi</p>
            </div>
          </div>
          <div className="mt-6 h-px bg-white/10" />
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-4 pb-6">
          {availableItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/dashboard' && location.pathname.startsWith(`${item.path}/`))

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                }`}
              >
                {item.icon()}
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="border-t border-white/10 px-4 py-4">
          <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white">
              {getInitials(user?.fullName ?? 'MU')}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{user?.fullName ?? 'Matonat foydalanuvchisi'}</p>
              <span className="mt-1 inline-flex rounded-full bg-white/10 px-2 py-1 text-[11px] font-medium text-gray-300">
                {user ? roleLabels[user.role] : 'Mehmon'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-3 flex w-full items-center justify-center rounded-md border border-transparent px-3 py-2 text-sm font-medium text-gray-300 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300"
          >
            Chiqish
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
