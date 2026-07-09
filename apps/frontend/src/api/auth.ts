import axiosInstance from './axios'
import type { User } from '../types'

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  user: User
}

export const login = async (payload: LoginPayload) => {
  const response = await axiosInstance.post<LoginResponse>('/auth/login', payload)
  return response.data
}
