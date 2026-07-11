import { useCallback, useEffect, useState } from 'react'
import { AxiosError } from 'axios'
import {
  createTeacher,
  deleteTeacher,
  getTeachers,
  updateTeacher,
  type CreateTeacherPayload,
  type CreatedTeacherResponse,
  type TeacherListItem,
  type TeacherQueryParams,
  type UpdateTeacherPayload,
} from '../api/teachers'

interface UseTeachersResult {
  teachers: TeacherListItem[]
  total: number
  page: number
  limit: number
  isLoading: boolean
  error: string | null
  search: string
  setSearch: (value: string) => void
  setPage: (page: number) => void
  refetch: () => Promise<void>
  addTeacher: (payload: CreateTeacherPayload) => Promise<CreatedTeacherResponse>
  editTeacher: (id: string, payload: UpdateTeacherPayload) => Promise<void>
  removeTeacher: (id: string) => Promise<void>
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message
    if (typeof message === 'string') {
      return message
    }
    if (Array.isArray(message)) {
      return message.join(', ')
    }
  }

  return fallback
}

export const useTeachers = (initialLimit = 10): UseTeachersResult => {
  const [teachers, setTeachers] = useState<TeacherListItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(initialLimit)
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTeachers = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const params: TeacherQueryParams = { page, limit }
      if (search) {
        params.search = search
      }

      const response = await getTeachers(params)
      setTeachers(response.data)
      setTotal(response.meta.total)
    } catch (requestError) {
      setError(getErrorMessage(requestError, "O'qituvchilar ro'yxatini yuklab bo'lmadi"))
    } finally {
      setIsLoading(false)
    }
  }, [limit, page, search])

  useEffect(() => {
    void fetchTeachers()
  }, [fetchTeachers])

  useEffect(() => {
    setPage(1)
  }, [search])

  return {
    teachers,
    total,
    page,
    limit,
    isLoading,
    error,
    search,
    setSearch,
    setPage,
    refetch: fetchTeachers,
    addTeacher: async (payload) => {
      const response = await createTeacher(payload)
      await fetchTeachers()
      return response
    },
    editTeacher: async (id, payload) => {
      await updateTeacher(id, payload)
      await fetchTeachers()
    },
    removeTeacher: async (id) => {
      await deleteTeacher(id)
      await fetchTeachers()
    },
  }
}
