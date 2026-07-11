import { useCallback, useEffect, useState } from 'react'
import { AxiosError } from 'axios'
import {
  createPayment,
  getPayments,
  type CreatePaymentPayload,
  type PaymentMethod,
  type PaymentQueryParams,
  type PaymentRecord,
} from '../api/payments'

interface UsePaymentsResult {
  payments: PaymentRecord[]
  total: number
  page: number
  limit: number
  isLoading: boolean
  error: string | null
  search: string
  method: PaymentMethod | ''
  setSearch: (value: string) => void
  setMethod: (value: PaymentMethod | '') => void
  setPage: (page: number) => void
  refetch: () => Promise<void>
  addPayment: (payload: CreatePaymentPayload) => Promise<void>
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message
    if (typeof message === 'string') return message
    if (Array.isArray(message)) return message.join(', ')
  }
  return fallback
}

export const usePayments = (initialLimit = 10): UsePaymentsResult => {
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(initialLimit)
  const [search, setSearch] = useState('')
  const [method, setMethod] = useState<PaymentMethod | ''>('')
  
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPayments = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const params: PaymentQueryParams = {
        page,
        limit,
      }

      if (search) params.search = search
      if (method) params.method = method

      const response = await getPayments(params)
      setPayments(response.data)
      setTotal(response.meta.total)
    } catch (requestError) {
      setError(getErrorMessage(requestError, "To'lovlar ro'yxatini yuklab bo'lmadi"))
    } finally {
      setIsLoading(false)
    }
  }, [limit, method, page, search])

  useEffect(() => {
    void fetchPayments()
  }, [fetchPayments])

  useEffect(() => {
    setPage(1)
  }, [search, method])

  const addPayment = async (payload: CreatePaymentPayload) => {
    await createPayment(payload)
    await fetchPayments()
  }

  return {
    payments,
    total,
    page,
    limit,
    isLoading,
    error,
    search,
    method,
    setSearch,
    setMethod,
    setPage,
    refetch: fetchPayments,
    addPayment,
  }
}
