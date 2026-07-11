import { useCallback, useEffect, useState } from 'react'
import { AxiosError } from 'axios'
import {
  createCourse,
  deleteCourse,
  getCourses,
  updateCourse,
  type CreateCoursePayload,
  type UpdateCoursePayload,
} from '../api/courses'
import type { CourseOption } from '../api/groups'

interface UseCoursesResult {
  courses: CourseOption[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  addCourse: (payload: CreateCoursePayload) => Promise<void>
  editCourse: (id: string, payload: UpdateCoursePayload) => Promise<void>
  removeCourse: (id: string) => Promise<void>
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message
    if (typeof message === 'string') return message
    if (Array.isArray(message)) return message.join(', ')
  }
  return fallback
}

export const useCourses = (): UseCoursesResult => {
  const [courses, setCourses] = useState<CourseOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCourses = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getCourses()
      setCourses(data)
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Kurslar ro'yxatini yuklab bo'lmadi"))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchCourses()
  }, [fetchCourses])

  const addCourse = async (payload: CreateCoursePayload) => {
    await createCourse(payload)
    await fetchCourses()
  }

  const editCourse = async (id: string, payload: UpdateCoursePayload) => {
    await updateCourse(id, payload)
    await fetchCourses()
  }

  const removeCourse = async (id: string) => {
    await deleteCourse(id)
    await fetchCourses()
  }

  return {
    courses,
    isLoading,
    error,
    refetch: fetchCourses,
    addCourse,
    editCourse,
    removeCourse,
  }
}
