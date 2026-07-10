import { useEffect, useState } from 'react'
import { AxiosError } from 'axios'
import { getGroupAttendance, markAttendance, type AttendanceStatus } from '../api/attendance'

interface AttendanceStudent {
  studentId: string
  fullName: string
  phone: string | null
  parentPhone: string
  attendance: AttendanceStatus | null
}

interface UseAttendanceResult {
  attendanceStudents: AttendanceStudent[]
  isLoading: boolean
  error: string | null
  groupId: string
  date: string
  statusMap: Record<string, AttendanceStatus>
  setGroupId: (value: string) => void
  setDate: (value: string) => void
  setStatus: (studentId: string, status: AttendanceStatus) => void
  refetch: () => Promise<void>
  saveAttendance: () => Promise<void>
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message
    if (typeof message === 'string') return message
    if (Array.isArray(message)) return message.join(', ')
  }
  return fallback
}

const todayValue = () => {
  const now = new Date()
  const offset = now.getTimezoneOffset()
  return new Date(now.getTime() - offset * 60 * 1000).toISOString().split('T')[0]
}

export const useAttendance = () => {
  const [groupId, setGroupId] = useState('')
  const [date, setDate] = useState(todayValue())
  const [attendanceStudents, setAttendanceStudents] = useState<AttendanceStudent[]>([])
  const [statusMap, setStatusMap] = useState<Record<string, AttendanceStatus>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAttendance = async () => {
    if (!groupId) {
      setAttendanceStudents([])
      setStatusMap({})
      setError(null)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const response = await getGroupAttendance(groupId, date)
      setAttendanceStudents(response.data)
      const nextMap: Record<string, AttendanceStatus> = {}
      response.data.forEach((student) => {
        nextMap[student.studentId] = student.attendance ?? 'PRESENT'
      })
      setStatusMap(nextMap)
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Davomat ma'lumotlarini yuklab bo'lmadi"))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void fetchAttendance()
  }, [groupId, date])

  useEffect(() => {
    setAttendanceStudents([])
    setStatusMap({})
  }, [groupId])

  const setStatus = (studentId: string, status: AttendanceStatus) => {
    setStatusMap((current) => ({
      ...current,
      [studentId]: status,
    }))
  }

  const saveAttendance = async () => {
    if (!groupId) {
      return
    }

    await markAttendance({
      groupId,
      date,
      entries: attendanceStudents.map((student) => ({
        studentId: student.studentId,
        status: statusMap[student.studentId] ?? student.attendance ?? 'PRESENT',
        note: '',
      })),
    })

    await fetchAttendance()
  }

  return {
    attendanceStudents,
    isLoading,
    error,
    groupId,
    date,
    statusMap,
    setGroupId,
    setDate,
    setStatus,
    refetch: fetchAttendance,
    saveAttendance,
  } satisfies UseAttendanceResult
}
