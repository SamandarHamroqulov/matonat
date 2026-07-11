import axiosInstance from './axios'
import type { User } from '../types'

export interface UpdateProfilePayload {
  fullName?: string
  phone?: string
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

export const getMe = async () => {
  const response = await axiosInstance.get<User>('/users/me')
  return response.data
}

export const updateMe = async (payload: UpdateProfilePayload) => {
  const response = await axiosInstance.patch<User>('/users/me', payload)
  return response.data
}

export const changePassword = async (payload: ChangePasswordPayload) => {
  const response = await axiosInstance.patch<{ message: string }>('/users/me/password', payload)
  return response.data
}
