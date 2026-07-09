import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/auth.store'
import { getPageTitle } from '../../router'

interface HeaderProps {
  onMenuClick: () => void
}

function Header({ onMenuClick }: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const dropdownRef = useRef<HTMLDivElement | null>(null)
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }

    window.addEventListener('mousedown', handleOutsideClick)
    return () => window.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const handleLogout = () => {
    logout()
    setDropdownOpen(false)
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-20 flex h-[60px] items-center justify-between border-b border-gray-200 bg-white px-4 shadow-none md:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-gray-200 text-gray-600 transition hover:border-gray-300 hover:bg-gray-100 hover:text-primary-500 md:hidden"
          aria-label="Menyuni ochish"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
          </svg>
        </button>
        <div>
          <h1 className="text-lg font-semibold text-gray-900">{getPageTitle(location.pathname)}</h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-md border border-gray-200 text-gray-600 transition hover:border-gray-300 hover:bg-gray-100 hover:text-primary-500"
          aria-label="Bildirishnomalar"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M15 17H9m9-1V11a6 6 0 1 0-12 0v5l-2 2h16l-2-2Z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="absolute right-1.5 top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-500 px-1 text-[10px] font-semibold text-primary-700">
            3
          </span>
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((value) => !value)}
            className="flex items-center gap-3 rounded-md border border-gray-200 px-3 py-2 text-left transition hover:border-gray-300 hover:bg-gray-100"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-600">
              {user?.fullName?.slice(0, 1).toUpperCase() ?? 'M'}
            </div>
            <div className="hidden min-w-0 sm:block">
              <p className="truncate text-sm font-medium text-gray-900">{user?.fullName ?? 'Foydalanuvchi'}</p>
              <p className="truncate text-xs text-gray-500">{user?.email ?? 'email mavjud emas'}</p>
            </div>
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {dropdownOpen ? (
            <div className="absolute right-0 mt-2 w-64 rounded-lg border border-gray-200 bg-white p-2 shadow-none">
              <div className="border-b border-gray-100 px-3 py-2">
                <p className="text-sm font-medium text-gray-900">{user?.fullName ?? 'Foydalanuvchi'}</p>
                <p className="mt-1 text-xs text-gray-500">{user?.email ?? 'email mavjud emas'}</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="mt-2 flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-red-50 hover:text-red-600"
              >
                Chiqish
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}

export default Header
