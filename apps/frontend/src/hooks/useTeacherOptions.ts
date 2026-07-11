import { useEffect, useState } from 'react'
import { getTeachers, type TeacherOption } from '../api/teachers'

export const useTeacherOptions = () => {
  const [teachers, setTeachers] = useState<TeacherOption[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setIsLoading(true)
        const response = await getTeachers()
        setTeachers(response.data)
      } finally {
        setIsLoading(false)
      }
    }

    void fetchTeachers()
  }, [])

  return { teachers, isLoading }
}
