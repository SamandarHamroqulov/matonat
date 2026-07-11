import axios, {
  AxiosError,
  type InternalAxiosRequestConfig,
  type AxiosRequestHeaders,
} from 'axios'
import { useAuthStore } from '../store/auth.store'

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

interface RefreshResponse {
  accessToken: string
}

const baseURL = import.meta.env.VITE_API_URL

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
})

export const getCookieValue = (name: string) => {
  if (typeof document === 'undefined') {
    return null
  }

  const match = document.cookie
    .split('; ')
    .find((part) => part.startsWith(`${encodeURIComponent(name)}=`))

  if (!match) {
    return null
  }

  return decodeURIComponent(match.slice(name.length + 1))
}

let isRefreshing = false
let refreshSubscribers: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

const subscribeTokenRefresh = (
  resolve: (token: string) => void,
  reject: (error: unknown) => void,
) => {
  refreshSubscribers.push({ resolve, reject })
}

const notifyTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((subscriber) => subscriber.resolve(token))
  refreshSubscribers = []
}

const notifyRefreshFailed = (error: unknown) => {
  refreshSubscribers.forEach((subscriber) => subscriber.reject(error))
  refreshSubscribers = []
}

const redirectToLogin = () => {
  if (window.location.pathname !== '/login') {
    window.location.href = '/login'
  }
}

axiosInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken

  if (token) {
    const headers = (config.headers ?? {}) as AxiosRequestHeaders
    headers.Authorization = `Bearer ${token}`
    config.headers = headers
  }

  const method = config.method?.toUpperCase()
  if (method && !['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const csrfToken = getCookieValue('csrf_token')
    if (csrfToken) {
      const headers = (config.headers ?? {}) as AxiosRequestHeaders
      headers['X-CSRF-Token'] = csrfToken
      config.headers = headers
    }
  }

  return config
})

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined

    if (
      !originalRequest ||
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes('/auth/login')
    ) {
      return Promise.reject(error)
    }

    if (originalRequest.url?.includes('/auth/refresh')) {
      useAuthStore.getState().logout()
      redirectToLogin()
      return Promise.reject(error)
    }

    originalRequest._retry = true

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh(
          (token) => {
          const headers = (originalRequest.headers ?? {}) as AxiosRequestHeaders
          headers.Authorization = `Bearer ${token}`
          originalRequest.headers = headers
          resolve(axiosInstance(originalRequest))
          },
          reject,
        )
      })
    }

    isRefreshing = true

    try {
      const response = await axios.post<RefreshResponse>(
        `${baseURL}/auth/refresh`,
        {},
        { withCredentials: true },
      )

      const currentUser = useAuthStore.getState().user
      const nextToken = response.data.accessToken

      if (!currentUser) {
        throw new Error('Foydalanuvchi topilmadi')
      }

      useAuthStore.getState().setAuth(currentUser, nextToken)
      notifyTokenRefreshed(nextToken)

      const headers = (originalRequest.headers ?? {}) as AxiosRequestHeaders
      headers.Authorization = `Bearer ${nextToken}`
      originalRequest.headers = headers

      return axiosInstance(originalRequest)
    } catch (refreshError) {
      notifyRefreshFailed(refreshError)
      useAuthStore.getState().logout()
      redirectToLogin()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

export default axiosInstance
