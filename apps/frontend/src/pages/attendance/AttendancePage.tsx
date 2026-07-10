import { useMemo } from 'react'
import toast from 'react-hot-toast'
import Button from '../../components/ui/Button'
import Skeleton from '../../components/ui/Skeleton'
import { useAttendance } from '../../hooks/useAttendance'
import { useGroupOptions } from '../../hooks/useGroupOptions'
import type { AttendanceStatus } from '../../api/attendance'

const attendanceMeta: Record<
  AttendanceStatus,
  { label: string; activeClass: string; inactiveClass: string }
> = {
  PRESENT: {
    label: '✓ Keldi',
    activeClass: 'border-emerald-600 bg-emerald-600 text-white',
    inactiveClass: 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50',
  },
  LATE: {
    label: '⏰ Kech',
    activeClass: 'border-amber-500 bg-amber-500 text-white',
    inactiveClass: 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50',
  },
  ABSENT: {
    label: '✗ Kelmadi',
    activeClass: 'border-red-600 bg-red-600 text-white',
    inactiveClass: 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50',
  },
}

const todayValue = () => {
  const now = new Date()
  const offset = now.getTimezoneOffset()
  return new Date(now.getTime() - offset * 60 * 1000).toISOString().split('T')[0]
}

function AttendancePage() {
  const { groups, isLoading: groupsLoading } = useGroupOptions()
  const {
    attendanceStudents,
    isLoading,
    error,
    groupId,
    date,
    statusMap,
    setGroupId,
    setDate,
    setStatus,
    refetch,
    saveAttendance,
  } = useAttendance()

  const selectedCount = useMemo(
    () => attendanceStudents.length,
    [attendanceStudents.length],
  )

  const handleSave = async () => {
    try {
      await saveAttendance()
      toast.success('Davomat saqlandi')
    } catch {
      toast.error("Davomatni saqlab bo'lmadi")
    }
  }

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Davomat</h1>
          <p className="mt-1 text-sm text-gray-500">Guruh va sanani tanlab davomatni belgilang.</p>
        </div>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
          <div>
            <label htmlFor="group-select" className="mb-2 block text-sm font-medium text-gray-700">
              Guruh tanlang
            </label>
            <select
              id="group-select"
              value={groupId}
              onChange={(event) => setGroupId(event.target.value)}
              disabled={groupsLoading}
              className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/15"
            >
              <option value="">Guruh tanlang</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="date-select" className="mb-2 block text-sm font-medium text-gray-700">
              Sana
            </label>
            <input
              id="date-select"
              type="date"
              value={date}
              max={todayValue()}
              onChange={(event) => setDate(event.target.value)}
              className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/15"
            />
          </div>
        </div>
      </section>

      {!groupId ? (
        <section className="rounded-lg border border-gray-200 bg-white p-10 text-center">
          <p className="text-sm text-gray-500">Guruh va sanani tanlang</p>
        </section>
      ) : error ? (
        <section className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-800">Davomat yuklanmadi</h2>
          <p className="mt-2 text-sm text-gray-500">{error}</p>
          <Button type="button" className="mt-4" onClick={() => void refetch()}>
            Qayta urinib ko&apos;rish
          </Button>
        </section>
      ) : isLoading ? (
        <section className="space-y-3 rounded-lg border border-gray-200 bg-white p-5">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-14" />
          ))}
        </section>
      ) : (
        <section className="rounded-lg border border-gray-200 bg-white">
          <div className="divide-y divide-gray-100">
            {attendanceStudents.map((student) => {
              const current = statusMap[student.studentId] ?? student.attendance ?? 'PRESENT'
              return (
                <div
                  key={student.studentId}
                  className="flex flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <div className="font-medium text-gray-900">{student.fullName}</div>
                    <div className="text-sm text-gray-500">{student.phone ?? '—'}</div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(attendanceMeta) as AttendanceStatus[]).map((status) => {
                      const meta = attendanceMeta[status]
                      return (
                        <button
                          key={status}
                          type="button"
                          onClick={() => setStatus(student.studentId, status)}
                          className={`rounded-md border px-3 py-1.5 text-xs font-medium transition ${
                            current === status ? meta.activeClass : meta.inactiveClass
                          }`}
                        >
                          {meta.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {groupId ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 px-4 py-3 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <p className="text-sm text-gray-600">{selectedCount} ta o&apos;quvchi uchun saqlash</p>
            <Button type="button" onClick={() => void handleSave()} disabled={selectedCount === 0}>
              Saqlash
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default AttendancePage
