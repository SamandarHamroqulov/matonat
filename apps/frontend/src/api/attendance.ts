import axiosInstance from './axios'
import type { PaginatedListResponse } from '../types'

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE'

export interface AttendanceRecord {
  id: string
  studentId: string
  groupId: string
  date: string
  status: AttendanceStatus
  notes?: string | null
  createdAt: string
  updatedAt: string
  student?: {
    id: string
    fullName: string
  }
  group?: {
    id: string
    name: string
  }
}

export interface AttendanceQueryParams {
  page?: number
  limit?: number
  groupId?: string
  startDate?: string
  endDate?: string
}

export interface BulkAttendanceItem {
  studentId: string
  status: AttendanceStatus
  notes?: string
}

export interface BulkAttendancePayload {
  groupId: string
  date: string // ISO date string (YYYY-MM-DD or equivalent without time part issues)
  records: BulkAttendanceItem[]
}

export interface GroupAttendanceStudent {
  studentId: string
  fullName: string
  phone: string | null
  parentPhone: string
  attendance: AttendanceStatus | null
}

export interface GroupAttendanceResponse {
  groupId: string
  groupName: string
  date: string
  students: Array<{
    studentId: string
    fullName: string
    attendance: {
      id: string
      studentId: string
      groupId: string
      date: string
      status: AttendanceStatus
      note?: string | null
      createdAt: string
      updatedAt: string
    } | null
  }>
}

export const getAttendances = async (params: AttendanceQueryParams = {}) => {
  const response = await axiosInstance.get<PaginatedListResponse<AttendanceRecord>>('/attendance', {
    params,
  })
  return response.data
}

export const bulkUpsertAttendance = async (payload: BulkAttendancePayload) => {
  const response = await axiosInstance.post<{ count: number }>('/attendance/bulk', payload)
  return response.data
}

export const getGroupAttendance = async (groupId: string, date: string) => {
  const response = await axiosInstance.get<GroupAttendanceResponse>(
    `/attendance/group/${groupId}/date/${encodeURIComponent(date)}`,
  )
  return response.data
}

export const markAttendance = async (payload: {
  groupId: string
  date: string
  entries: Array<{ studentId: string; status: AttendanceStatus; note?: string }>
}) => {
  const response = await axiosInstance.post<{ count: number }>('/attendance/mark', payload)
  return response.data
}
