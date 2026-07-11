import axiosInstance from './axios'
import type { PaginatedListResponse } from '../types'

export type PaymentMethod = 'CASH' | 'CARD' | 'TRANSFER'

export interface PaymentRecord {
  id: string
  studentId: string
  amount: number | string
  method: PaymentMethod
  month: string
  note?: string | null
  createdAt: string
  student?: {
    id: string
    fullName: string
  }
  receivedBy?: {
    id: string
    fullName: string
  }
}

export interface PaymentQueryParams {
  page?: number
  limit?: number
  search?: string
  method?: PaymentMethod | ''
  startDate?: string
  endDate?: string
}

export interface CreatePaymentPayload {
  studentId: string
  amount: number
  month: string
  method: PaymentMethod
  note?: string
}

export const getPayments = async (params: PaymentQueryParams = {}) => {
  const response = await axiosInstance.get<PaginatedListResponse<PaymentRecord>>('/payments', {
    params,
  })
  return response.data
}

export const createPayment = async (payload: CreatePaymentPayload) => {
  const response = await axiosInstance.post<PaymentRecord>('/payments', payload)
  return response.data
}
