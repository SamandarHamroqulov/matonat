import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Skeleton from '../../components/ui/Skeleton'
import Table, { type TableColumn } from '../../components/ui/Table'
import { useGroup } from '../../hooks/useGroup'
import {
  getGroupAttendance,
  markAttendance,
  type AttendanceStatus,
  type GroupAttendanceStudent,
} from '../../api/attendance'
import type { GroupSchedule } from '../../api/groups'
import { formatTime } from '../../utils/format'

type TabKey = 'students' | 'attendance' | 'schedule'

const dayLabels: Record<GroupSchedule['dayOfWeek'], string> = {
  MONDAY: 'Du',
  TUESDAY: 'Se',
  WEDNESDAY: 'Ch',
  THURSDAY: 'Pa',
  FRIDAY: 'Ju',
  SATURDAY: 'Sh',
  SUNDAY: 'Ya',
}

const fullDayLabels: Record<GroupSchedule['dayOfWeek'], string> = {
  MONDAY: 'Dushanba',
  TUESDAY: 'Seshanba',
  WEDNESDAY: 'Chorshanba',
  THURSDAY: 'Payshanba',
  FRIDAY: 'Juma',
  SATURDAY: 'Shanba',
  SUNDAY: 'Yakshanba',
}

const attendanceColors: Record<AttendanceStatus, string> = {
  PRESENT: 'bg-emerald-600 text-white border-emerald-600',
  LATE: 'bg-amber-500 text-white border-amber-500',
  ABSENT: 'bg-red-600 text-white border-red-600',
}

const attendanceLabels: Record<AttendanceStatus, string> = {
  PRESENT: 'Keldi',
  LATE: 'Kech',
  ABSENT: 'Kelmadi',
}

const dateInputValue = (date: Date) => {
  const offset = date.getTimezoneOffset()
  return new Date(date.getTime() - offset * 60 * 1000).toISOString().split('T')[0]
}

function AttendanceButton({
  active,
  status,
  label,
  onClick,
}: {
  active: boolean
  status: AttendanceStatus
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? `rounded-md border px-3 py-1.5 text-xs font-medium ${attendanceColors[status]}`
          : 'rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50'
      }
    >
      {label}
    </button>
  )
}

const studentColumns: TableColumn<{ id: string; fullName: string; phone: string | null; parentPhone: string }>[] = [
  { key: 'fullName', label: 'Ism' },
  { key: 'phone', label: 'Telefon', render: (row) => row.phone ?? '—' },
  { key: 'parentPhone', label: 'Ota-ona tel' },
  {
    key: 'status',
    label: 'Holat',
    render: () => <Badge variant="success">Faol</Badge>,
  },
]

function GroupDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { group, isLoading, error, refetch } = useGroup(id)
  const [activeTab, setActiveTab] = useState<TabKey>('students')
  const [selectedDate, setSelectedDate] = useState(dateInputValue(new Date()))
  const [attendanceStudents, setAttendanceStudents] = useState<GroupAttendanceStudent[]>([])
  const [attendanceLoading, setAttendanceLoading] = useState(false)
  const [attendanceSaving, setAttendanceSaving] = useState(false)
  const [statusMap, setStatusMap] = useState<Record<string, AttendanceStatus>>({})

  const groupSchedules = group?.schedules ?? []

  useEffect(() => {
    if (activeTab !== 'attendance' || !id) {
      return
    }

    let active = true

    const loadAttendance = async () => {
      try {
        setAttendanceLoading(true)
        const response = await getGroupAttendance(id, selectedDate)
        if (!active) {
          return
        }

        setAttendanceStudents(
          response.students.map((student) => ({
            studentId: student.studentId,
            fullName: student.fullName,
            phone: null,
            parentPhone: '',
            attendance: student.attendance?.status ?? null,
          })),
        )
        const nextStatus: Record<string, AttendanceStatus> = {}
        response.students.forEach((item) => {
          nextStatus[item.studentId] = item.attendance?.status ?? 'PRESENT'
        })
        setStatusMap(nextStatus)
      } catch {
        if (active) {
          toast.error("Davomat ma'lumotlarini yuklab bo'lmadi")
        }
      } finally {
        if (active) {
          setAttendanceLoading(false)
        }
      }
    }

    void loadAttendance()

    return () => {
      active = false
    }
  }, [activeTab, id, selectedDate])

  const selectedStudents = useMemo(
    () => group?.students ?? [],
    [group?.students],
  )

  const handleAttendanceSave = async () => {
    if (!id) {
      return
    }

    try {
      setAttendanceSaving(true)
      await markAttendance({
        groupId: id,
        date: new Date(selectedDate).toISOString(),
        entries: attendanceStudents.map((student) => ({
          studentId: student.studentId,
          status: statusMap[student.studentId] ?? student.attendance ?? 'PRESENT',
          note: undefined,
        })),
      })
      toast.success('Davomat saqlandi')
      const response = await getGroupAttendance(id, selectedDate)
      setAttendanceStudents(
        response.students.map((student) => ({
          studentId: student.studentId,
          fullName: student.fullName,
          phone: null,
          parentPhone: '',
          attendance: student.attendance?.status ?? null,
        })),
      )
    } catch {
      toast.error("Davomatni saqlab bo'lmadi")
    } finally {
      setAttendanceSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-40" />
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="mt-4 h-4 w-full max-w-xl" />
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-16" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !group) {
    return (
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-800">Guruh topilmadi</h2>
        <p className="mt-2 text-sm text-gray-500">{error ?? "So'ralgan guruh topilmadi."}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button type="button" onClick={() => void refetch()}>
            Qayta urinib ko&apos;rish
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
            ← Orqaga
          </Button>
        </div>
      </section>
    )
  }

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-primary-600"
      >
        ← Orqaga
      </button>

      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex flex-col gap-4 border-b border-gray-200 pb-5 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold text-gray-900">{group.name}</h1>
              <Badge variant={group.isActive ? 'success' : 'gray'}>
                {group.isActive ? 'Faol' : 'Nofaol'}
              </Badge>
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
              <span>O&apos;qituvchi: {group.teacher?.user?.fullName ?? "Biriktirilmagan"}</span>
              <span>Kurs: {group.course?.name ?? 'Kurs topilmadi'}</span>
              <span>Sig&apos;im: {group._count?.students ?? 0}/{group.capacity}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-gray-200">
        <nav className="-mb-px flex gap-8" aria-label="Tabs">
          {[
            { key: 'students', label: `O'quvchilar (${group.students.length})` },
            { key: 'attendance', label: 'Davomat' },
            { key: 'schedule', label: 'Jadval' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as TabKey)}
              className={
                activeTab === tab.key
                  ? 'border-b-2 border-primary-600 py-4 text-sm font-medium text-primary-600'
                  : 'border-b-2 border-transparent py-4 text-sm font-medium text-gray-500 hover:text-gray-700'
              }
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </section>

      {activeTab === 'students' ? (
        <section className="rounded-lg border border-gray-200 bg-white">
          <Table
            columns={studentColumns}
            data={selectedStudents}
            rowKey={(row) => row.id}
            emptyState={
              <div className="py-10 text-center text-sm text-gray-500">O&apos;quvchi yo&apos;q</div>
            }
          />
        </section>
      ) : null}

      {activeTab === 'attendance' ? (
        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Davomat</h2>
              <p className="mt-1 text-sm text-gray-500">Sana tanlang va har bir o&apos;quvchi holatini belgilang.</p>
            </div>
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/15"
            />
          </div>

          <div className="mt-5 space-y-3">
            {attendanceLoading ? (
              Array.from({ length: Math.max(group.students.length, 4) }).map((_, index) => (
                <Skeleton key={index} className="h-14" />
              ))
            ) : attendanceStudents.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-200 px-6 py-10 text-center text-sm text-gray-500">
                O&apos;quvchilar topilmadi
              </div>
            ) : (
              attendanceStudents.map((student) => {
                const current = statusMap[student.studentId] ?? student.attendance ?? 'PRESENT'
                return (
                  <div key={student.studentId} className="flex items-center justify-between gap-4 border-b border-gray-100 py-3">
                    <div>
                      <div className="font-medium text-gray-900">{student.fullName}</div>
                      <div className="text-sm text-gray-500">{student.phone ?? '—'}</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(Object.keys(attendanceLabels) as AttendanceStatus[]).map((status) => (
                        <AttendanceButton
                          key={status}
                          active={current === status}
                          status={status}
                          label={attendanceLabels[status]}
                          onClick={() =>
                            setStatusMap((prev) => ({
                              ...prev,
                              [student.studentId]: status,
                            }))
                          }
                        />
                      ))}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              type="button"
              loading={attendanceSaving}
              disabled={attendanceStudents.length === 0}
              onClick={() => void handleAttendanceSave()}
            >
              Saqlash
            </Button>
          </div>
        </section>
      ) : null}

      {activeTab === 'schedule' ? (
        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-base font-semibold text-gray-900">Haftalik jadval</h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
            {(Object.keys(dayLabels) as GroupSchedule['dayOfWeek'][]).map((day) => {
              const schedules = groupSchedules.filter((schedule) => schedule.dayOfWeek === day)
              const hasClass = schedules.length > 0
              return (
                <div
                  key={day}
                  className={
                    hasClass
                      ? 'rounded-lg border border-primary-200 bg-primary-50 p-3'
                      : 'rounded-lg border border-gray-200 bg-white p-3'
                  }
                >
                  <div className="text-sm font-semibold text-gray-900">{dayLabels[day]}</div>
                  <div className="mt-2 text-xs text-gray-500">{fullDayLabels[day]}</div>
                  {hasClass ? (
                    <div className="mt-3 space-y-2">
                      {schedules.map((schedule) => (
                        <div key={schedule.id} className="rounded-md bg-white px-3 py-2 text-xs text-gray-600">
                          <div>{formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}</div>
                          <div className="mt-1">Xona: {schedule.room ?? 'Belgilanmagan'}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-3 text-xs text-gray-400">Dars yo&apos;q</div>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      ) : null}
    </div>
  )
}

export default GroupDetailPage
