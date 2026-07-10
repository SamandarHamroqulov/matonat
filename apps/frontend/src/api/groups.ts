import axiosInstance from './axios'
import type { PaginatedListResponse, Student } from '../types'

export interface CourseOption {
  id: string
  name: string
  description?: string | null
  price?: string
  duration: number
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export interface GroupTeacherProfile {
  id: string
  userId?: string
  subject?: string
  user?: {
    id?: string
    fullName?: string
    email?: string
  }
}

export interface GroupSchedule {
  id: string
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY'
  startTime: string
  endTime: string
  room?: string | null
}

export interface GroupSummary {
  id: string
  name: string
  teacherId: string
  courseId: string
  capacity: number
  startDate: string
  endDate?: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  teacher?: GroupTeacherProfile
  course?: CourseOption
  schedules?: GroupSchedule[]
  _count?: {
    students: number
  }
}

export interface GroupDetail extends GroupSummary {
  students: Student[]
  schedules: GroupSchedule[]
  _count?: {
    students: number
    attendances: number
  }
}

export interface GroupQueryParams {
  page?: number
  limit?: number
  search?: string
  teacherId?: string
  courseId?: string
  isActive?: boolean
}

export interface CreateGroupPayload {
  name: string
  teacherId: string
  courseId: string
  capacity?: number
  startDate: string
  endDate?: string
}

export interface UpdateGroupPayload {
  name?: string
  teacherId?: string
  courseId?: string
  capacity?: number
  startDate?: string
  endDate?: string
  isActive?: boolean
}

export const getGroups = async (params: GroupQueryParams = {}) => {
  const response = await axiosInstance.get<PaginatedListResponse<GroupSummary>>('/groups', {
    params,
  })
  return response.data
}

export const getGroup = async (id: string) => {
  const response = await axiosInstance.get<GroupDetail>(`/groups/${id}`)
  return response.data
}

export const createGroup = async (payload: CreateGroupPayload) => {
  const response = await axiosInstance.post<GroupDetail>('/groups', payload)
  return response.data
}

export const updateGroup = async (id: string, payload: UpdateGroupPayload) => {
  const response = await axiosInstance.patch<GroupDetail>(`/groups/${id}`, payload)
  return response.data
}

export const deleteGroup = async (id: string) => {
  await axiosInstance.delete(`/groups/${id}`)
}
