import { useCallback, useEffect, useState } from 'react'
import { AxiosError } from 'axios'
import { getDashboardData, type DashboardData } from '../api/dashboard'

interface UseDashboardResult {
  data: DashboardData | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const getErrorMessage = (error: unknown) => {
  if (error instanceof AxiosError) {
    return error.response?.data?.message ?? "Dashboard ma'lumotlarini yuklab bo'lmadi"
  }

  return "Dashboard ma'lumotlarini yuklab bo'lmadi"
}

export const useDashboard = (): UseDashboardResult => {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await getDashboardData()
      setData(response)
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  }
}
