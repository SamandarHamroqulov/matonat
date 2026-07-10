import axiosInstance from './axios'
import type { PaginatedListResponse, Student, CreateStudentDto, UpdateStudentDto } from '../types'

export interface StudentQueryParams {
  page?: number
  limit?: number
  search?: string
  groupId?: string
  isActive?: boolean
}

export type CreateStudentPayload = CreateStudentDto
export type UpdateStudentPayload = UpdateStudentDto

export const getStudents = async (params: StudentQueryParams) => {
  const response = await axiosInstance.get<PaginatedListResponse<Student>>('/students', {
    params,
  })
  return response.data
}

export const getStudent = async (id: string) => {
  const response = await axiosInstance.get<Student>(`/students/${id}`)
  return response.data
}

export const createStudent = async (payload: CreateStudentPayload) => {
  const response = await axiosInstance.post<Student>('/students', payload)
  return response.data
}

export const updateStudent = async (id: string, payload: UpdateStudentPayload) => {
  const response = await axiosInstance.patch<Student>(`/students/${id}`, payload)
  return response.data
}

export const deleteStudent = async (id: string) => {
  await axiosInstance.delete(`/students/${id}`)
}
