import { useEffect, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthStore } from '../../store/auth.store'
import type { Role } from '../../types'

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles?: Role[]
}

function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const location = useLocation()
  const { isAuthenticated, user } = useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    user: state.user,
  }))

  const isAllowed = !allowedRoles || (user ? allowedRoles.includes(user.role) : false)

  useEffect(() => {
    if (isAuthenticated && !isAllowed) {
      toast.error("Ruxsat yo'q")
    }
  }, [isAllowed, isAuthenticated])

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (!isAllowed) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
