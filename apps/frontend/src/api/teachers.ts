import axiosInstance from './axios'
import type { PaginatedListResponse } from '../types'

export interface TeacherOption {
  id: string
  fullName: string
  email: string
  phone?: string | null
  teacherProfile?: {
    id: string
    subject: string
  } | null
}

export interface TeacherListItem {
  id: string
  email: string
  fullName: string
  phone?: string | null
  role: 'TEACHER'
  isActive?: boolean
  createdAt: string
  teacherProfile?: {
    id: string
    subject: string
    salary: string | number
    groups?: Array<{ id: string; name: string }>
  } | null
}

export interface TeacherQueryParams {
  page?: number
  limit?: number
  search?: string
}

export interface CreateTeacherPayload {
  fullName: string
  email: string
  phone?: string
  subject: string
  salary?: number
}

export interface UpdateTeacherPayload {
  fullName?: string
  phone?: string
  subject?: string
  salary?: number
  isActive?: boolean
}

export interface CreatedTeacherResponse {
  id: string
  email: string
  fullName: string
  phone?: string | null
  role: 'TEACHER'
  profileId: string
  subject: string
  salary: string | number
  generatedLogin?: string
  generatedPassword?: string
  createdAt: string
}

export const getTeachers = async (params: TeacherQueryParams = { page: 1, limit: 100 }) => {
  const response = await axiosInstance.get<PaginatedListResponse<TeacherListItem>>('/teachers', {
    params,
  })

  return response.data
}

export const getTeacher = async (id: string) => {
  const response = await axiosInstance.get<TeacherListItem>(`/teachers/${id}`)
  return response.data
}

export const createTeacher = async (payload: CreateTeacherPayload) => {
  const response = await axiosInstance.post<CreatedTeacherResponse>('/teachers', payload)
  return response.data
}

export const updateTeacher = async (id: string, payload: UpdateTeacherPayload) => {
  const response = await axiosInstance.patch<TeacherListItem>(`/teachers/${id}`, payload)
  return response.data
}

export const deleteTeacher = async (id: string) => {
  await axiosInstance.delete(`/teachers/${id}`)
}
