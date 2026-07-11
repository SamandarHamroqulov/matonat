import { useEffect, useState } from 'react'
import { useNavigate, useRoutes } from 'react-router-dom'
import axios from 'axios'
import SplashScreen from './components/ui/SplashScreen'
import { getCookieValue } from './api/axios'
import { useAuthStore } from './store/auth.store'
import type { User } from './types'
import { appRoutes } from './router'

function App() {
  const [isInitializing, setIsInitializing] = useState(true)
  const accessToken = useAuthStore((state) => state.accessToken)
  const setAuth = useAuthStore((state) => state.setAuth)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()

  useEffect(() => {
    let isMounted = true
    let timedOut = false
    const timeoutId = window.setTimeout(() => {
      timedOut = true
      if (!isMounted) {
        return
      }

      setIsInitializing(false)
      navigate('/login', { replace: true })
    }, 8000)

    const bootstrapAuth = async () => {
      if (accessToken) {
        if (isMounted) {
          window.clearTimeout(timeoutId)
          setIsInitializing(false)
        }
        return
      }

      try {
        const response = await axios.post<{ accessToken: string; user: User }>(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          {},
          {
            withCredentials: true,
            headers: getCookieValue('csrf_token')
              ? { 'X-CSRF-Token': getCookieValue('csrf_token') as string }
              : undefined,
          },
        )

        if (isMounted && !timedOut) {
          window.clearTimeout(timeoutId)
          setAuth(response.data.user, response.data.accessToken)
          setIsInitializing(false)
        }
      } catch {
        if (isMounted && !timedOut) {
          window.clearTimeout(timeoutId)
          logout()
          setIsInitializing(false)
          navigate('/login', { replace: true })
        }
      }
    }

    void bootstrapAuth()

    return () => {
      isMounted = false
      window.clearTimeout(timeoutId)
    }
  }, [accessToken, logout, navigate, setAuth])

  const routes = useRoutes(appRoutes)

  if (isInitializing) {
    return <SplashScreen variant="full" />
  }

  return routes
}

export default App
