import axiosInstance from './axios'
import type { CourseOption } from './groups'

export interface CreateCoursePayload {
  name: string
  description?: string
  price: number
  duration: number
  isActive?: boolean
}

export interface UpdateCoursePayload {
  name?: string
  description?: string
  price?: number
  duration?: number
  isActive?: boolean
}

export const getCourses = async () => {
  const response = await axiosInstance.get<CourseOption[]>('/courses')
  return response.data
}

export const getCourse = async (id: string) => {
  const response = await axiosInstance.get<CourseOption>(`/courses/${id}`)
  return response.data
}

export const createCourse = async (payload: CreateCoursePayload) => {
  const response = await axiosInstance.post<CourseOption>('/courses', payload)
  return response.data
}

export const updateCourse = async (id: string, payload: UpdateCoursePayload) => {
  const response = await axiosInstance.patch<CourseOption>(`/courses/${id}`, payload)
  return response.data
}

export const deleteCourse = async (id: string) => {
  await axiosInstance.delete(`/courses/${id}`)
}
