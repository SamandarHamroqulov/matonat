import axiosInstance from './axios'

interface ListResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
    totalAmount?: number | string
  }
}

interface StudentListItem {
  id: string
  fullName: string
}

interface GroupSchedule {
  id: string
  dayOfWeek: DayOfWeek
  startTime: string
  endTime: string
  room?: string | null
}

interface GroupListItem {
  id: string
  name: string
  teacher?: {
    user?: {
      fullName?: string
    }
  }
}

interface GroupDetailResponse extends GroupListItem {
  schedules: GroupSchedule[]
}

interface AttendanceListItem {
  id: string
  date: string
  status: AttendanceStatus
  createdAt: string
  student?: {
    id: string
    fullName: string
  }
  group?: {
    id: string
    name: string
  }
}

type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY'

type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE'

export interface DashboardStat {
  label: string
  value: number
  change: number
  direction: 'up' | 'down' | 'neutral'
}

export interface DashboardAttendanceRow {
  id: string
  studentName: string
  groupName: string
  status: AttendanceStatus
  time: string
}

export interface DashboardScheduleItem {
  id: string
  groupName: string
  time: string
  teacherName: string
  room: string
}

export interface DashboardData {
  stats: {
    students: DashboardStat
    activeGroups: DashboardStat
    todayAttendance: DashboardStat
    monthlyRevenue: DashboardStat
  }
  recentAttendance: DashboardAttendanceRow[]
  todaySchedule: DashboardScheduleItem[]
}

const formatApiDate = (date: Date) => date.toISOString()

const getRangeForToday = () => {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date()
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

const getRangeForYesterday = () => {
  const start = new Date()
  start.setDate(start.getDate() - 1)
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

const getRangeForMonth = (offset: number) => {
  const current = new Date()
  const start = new Date(current.getFullYear(), current.getMonth() + offset, 1)
  const end = new Date(current.getFullYear(), current.getMonth() + offset + 1, 0, 23, 59, 59, 999)
  return { start, end }
}

const getTrend = (current: number, previous: number) => {
  if (previous === 0) {
    return {
      change: current > 0 ? 100 : 0,
      direction: current > 0 ? 'up' : 'neutral',
    } as const
  }

  const rawChange = Math.round(((current - previous) / previous) * 100)

  if (rawChange > 0) {
    return { change: rawChange, direction: 'up' } as const
  }

  if (rawChange < 0) {
    return { change: Math.abs(rawChange), direction: 'down' } as const
  }

  return { change: 0, direction: 'neutral' } as const
}

const getTodayWeekday = (): DayOfWeek => {
  const days: DayOfWeek[] = [
    'SUNDAY',
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
  ]

  return days[new Date().getDay()]
}

export const getDashboardData = async (): Promise<DashboardData> => {
  const today = getRangeForToday()
  const yesterday = getRangeForYesterday()
  const thisMonth = getRangeForMonth(0)
  const lastMonth = getRangeForMonth(-1)

  const [
    studentsResponse,
    activeGroupsResponse,
    todayAttendanceResponse,
    yesterdayAttendanceResponse,
    recentAttendanceResponse,
    currentMonthPaymentsResponse,
    previousMonthPaymentsResponse,
    groupsResponse,
  ] = await Promise.all([
    axiosInstance.get<ListResponse<StudentListItem>>('/students', {
      params: { page: 1, limit: 1 },
    }),
    axiosInstance.get<ListResponse<GroupListItem>>('/groups', {
      params: { page: 1, limit: 1, isActive: true },
    }),
    axiosInstance.get<ListResponse<AttendanceListItem>>('/attendance', {
      params: {
        page: 1,
        limit: 5000,
        startDate: formatApiDate(today.start),
        endDate: formatApiDate(today.end),
      },
    }),
    axiosInstance.get<ListResponse<AttendanceListItem>>('/attendance', {
      params: {
        page: 1,
        limit: 5000,
        startDate: formatApiDate(yesterday.start),
        endDate: formatApiDate(yesterday.end),
      },
    }),
    axiosInstance.get<ListResponse<AttendanceListItem>>('/attendance', {
      params: {
        page: 1,
        limit: 10,
        startDate: formatApiDate(today.start),
        endDate: formatApiDate(today.end),
      },
    }),
    axiosInstance.get<ListResponse<{ id: string }>>('/payments', {
      params: {
        page: 1,
        limit: 1,
        startDate: formatApiDate(thisMonth.start),
        endDate: formatApiDate(thisMonth.end),
      },
    }),
    axiosInstance.get<ListResponse<{ id: string }>>('/payments', {
      params: {
        page: 1,
        limit: 1,
        startDate: formatApiDate(lastMonth.start),
        endDate: formatApiDate(lastMonth.end),
      },
    }),
    axiosInstance.get<ListResponse<GroupListItem>>('/groups', {
      params: {
        page: 1,
        limit: 100,
        isActive: true,
      },
    }),
  ])

  const todayAttendanceTotal = todayAttendanceResponse.data.meta.total
  const todayPresentCount = todayAttendanceResponse.data.data.filter(
    (item) => item.status === 'PRESENT',
  ).length
  const todayAttendancePercentage =
    todayAttendanceTotal > 0 ? Math.round((todayPresentCount / todayAttendanceTotal) * 100) : 0

  const yesterdayAttendanceTotal = yesterdayAttendanceResponse.data.meta.total
  const yesterdayPresentCount = yesterdayAttendanceResponse.data.data.filter(
    (item) => item.status === 'PRESENT',
  ).length
  const yesterdayAttendancePercentage =
    yesterdayAttendanceTotal > 0
      ? Math.round((yesterdayPresentCount / yesterdayAttendanceTotal) * 100)
      : 0

  const attendanceTrend = getTrend(todayAttendancePercentage, yesterdayAttendancePercentage)
  const monthlyRevenue = Number(currentMonthPaymentsResponse.data.meta.totalAmount ?? 0)
  const previousMonthRevenue = Number(previousMonthPaymentsResponse.data.meta.totalAmount ?? 0)
  const revenueTrend = getTrend(monthlyRevenue, previousMonthRevenue)

  const weekday = getTodayWeekday()
  const detailedGroups = await Promise.all(
    groupsResponse.data.data.map(async (group) => {
      const response = await axiosInstance.get<GroupDetailResponse>(`/groups/${group.id}`)
      return response.data
    }),
  )

  const todaySchedule = detailedGroups
    .flatMap((group) =>
      group.schedules
        .filter((schedule) => schedule.dayOfWeek === weekday)
        .map((schedule) => ({
          id: schedule.id,
          groupName: group.name,
          time: `${schedule.startTime.slice(0, 5)} - ${schedule.endTime.slice(0, 5)}`,
          teacherName: group.teacher?.user?.fullName ?? "O'qituvchi biriktirilmagan",
          room: schedule.room ?? 'Xona belgilanmagan',
        })),
    )
    .sort((left, right) => left.time.localeCompare(right.time))

  return {
    stats: {
      students: {
        label: "Jami o'quvchilar",
        value: studentsResponse.data.meta.total,
        change: 0,
        direction: 'neutral',
      },
      activeGroups: {
        label: 'Faol guruhlar',
        value: activeGroupsResponse.data.meta.total,
        change: 0,
        direction: 'neutral',
      },
      todayAttendance: {
        label: 'Bugungi davomat',
        value: todayAttendancePercentage,
        ...attendanceTrend,
      },
      monthlyRevenue: {
        label: 'Bu oylik daromad',
        value: monthlyRevenue,
        ...revenueTrend,
      },
    },
    recentAttendance: recentAttendanceResponse.data.data.map((item) => ({
      id: item.id,
      studentName: item.student?.fullName ?? "O'quvchi topilmadi",
      groupName: item.group?.name ?? 'Guruh topilmadi',
      status: item.status,
      time: new Intl.DateTimeFormat('uz-UZ', {
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(item.createdAt)),
    })),
    todaySchedule,
  }
}
