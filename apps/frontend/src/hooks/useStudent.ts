import { useCallback, useEffect, useState } from 'react'
import { AxiosError } from 'axios'
import {
  deleteStudent,
  getStudent,
  updateStudent,
  type UpdateStudentPayload,
} from '../api/students'
import type { Student } from '../types'

interface UseStudentResult {
  student: Student | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  editStudent: (payload: UpdateStudentPayload) => Promise<void>
  removeStudent: () => Promise<void>
}

const getErrorMessage = (error: unknown) => {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message
    if (typeof message === 'string') {
      return message
    }
  }

  return "O'quvchi ma'lumotlarini yuklab bo'lmadi"
}

export const useStudent = (id?: string): UseStudentResult => {
  const [student, setStudent] = useState<Student | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStudent = useCallback(async () => {
    if (!id) {
      setStudent(null)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const response = await getStudent(id)
      setStudent(response)
    } catch (requestError) {
      setError(getErrorMessage(requestError))
      setStudent(null)
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    void fetchStudent()
  }, [fetchStudent])

  const editStudent = async (payload: UpdateStudentPayload) => {
    if (!id) {
      return
    }

    await updateStudent(id, payload)
    await fetchStudent()
  }

  const removeStudent = async () => {
    if (!id) {
      return
    }

    await deleteStudent(id)
  }

  return {
    student,
    isLoading,
    error,
    refetch: fetchStudent,
    editStudent,
    removeStudent,
  }
}
