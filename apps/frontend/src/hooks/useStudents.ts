import { useCallback, useEffect, useState } from 'react'
import { AxiosError } from 'axios'
import {
  createStudent,
  deleteStudent,
  getStudents,
  updateStudent,
  type CreateStudentPayload,
  type StudentQueryParams,
  type UpdateStudentPayload,
} from '../api/students'
import type { Student } from '../types'

interface UseStudentsResult {
  students: Student[]
  total: number
  page: number
  limit: number
  isLoading: boolean
  error: string | null
  search: string
  groupId: string
  isActive: string
  setSearch: (value: string) => void
  setGroupId: (value: string) => void
  setIsActive: (value: string) => void
  setPage: (page: number) => void
  refetch: () => Promise<void>
  addStudent: (payload: CreateStudentPayload) => Promise<void>
  editStudent: (id: string, payload: UpdateStudentPayload) => Promise<void>
  removeStudent: (id: string) => Promise<void>
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

export const useStudents = (initialLimit = 10): UseStudentsResult => {
  const [students, setStudents] = useState<Student[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(initialLimit)
  const [search, setSearch] = useState('')
  const [groupId, setGroupId] = useState('')
  const [isActive, setIsActive] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStudents = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const params: StudentQueryParams = {
        page,
        limit,
      }

      if (search) {
        params.search = search
      }

      if (groupId) {
        params.groupId = groupId
      }

      if (isActive === 'true') {
        params.isActive = true
      } else if (isActive === 'false') {
        params.isActive = false
      }

      const response = await getStudents(params)
      setStudents(response.data)
      setTotal(response.meta.total)
    } catch (requestError) {
      setError(getErrorMessage(requestError, "O'quvchilar ro'yxatini yuklab bo'lmadi"))
    } finally {
      setIsLoading(false)
    }
  }, [groupId, isActive, limit, page, search])

  useEffect(() => {
    void fetchStudents()
  }, [fetchStudents])

  useEffect(() => {
    setPage(1)
  }, [search, groupId, isActive])

  const addStudent = async (payload: CreateStudentPayload) => {
    await createStudent(payload)
    await fetchStudents()
  }

  const editStudent = async (id: string, payload: UpdateStudentPayload) => {
    await updateStudent(id, payload)
    await fetchStudents()
  }

  const removeStudent = async (id: string) => {
    await deleteStudent(id)
    await fetchStudents()
  }

  return {
    students,
    total,
    page,
    limit,
    isLoading,
    error,
    search,
    groupId,
    isActive,
    setSearch,
    setGroupId,
    setIsActive,
    setPage,
    refetch: fetchStudents,
    addStudent,
    editStudent,
    removeStudent,
  }
}
