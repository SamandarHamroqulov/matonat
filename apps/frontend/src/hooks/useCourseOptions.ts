import { useEffect, useState } from 'react'
import { getCourses } from '../api/courses'
import type { CourseOption } from '../api/groups'

export const useCourseOptions = () => {
  const [courses, setCourses] = useState<CourseOption[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true)
        const response = await getCourses()
        setCourses(response)
      } finally {
        setIsLoading(false)
      }
    }

    void fetchCourses()
  }, [])

  return { courses, isLoading }
}
