import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Skeleton from '../../components/ui/Skeleton'
import Table, { type TableColumn } from '../../components/ui/Table'
import { useDashboard } from '../../hooks/useDashboard'
import { formatMoney, formatPercentage } from '../../utils/format'

type StatCardProps = {
  label: string
  value: string
  iconColor: string
  iconBackground: string
  direction: 'up' | 'down' | 'neutral'
  change: number
  icon: ReactNode
}

const statusLabelMap = {
  PRESENT: 'Keldi',
  ABSENT: 'Kelmadi',
  LATE: 'Kech',
} as const

const statusClassMap = {
  PRESENT: 'success',
  ABSENT: 'danger',
  LATE: 'warning',
} as const

const attendanceColumns: TableColumn<{
  id: string
  studentName: string
  groupName: string
  status: 'PRESENT' | 'ABSENT' | 'LATE'
  time: string
}>[] = [
  {
    key: 'studentName',
    label: "O'quvchi",
    render: (row) => <span className="font-medium text-gray-900">{row.studentName}</span>,
  },
  { key: 'groupName', label: 'Guruh' },
  {
    key: 'status',
    label: 'Holat',
    render: (row) => (
      <Badge variant={statusClassMap[row.status]}>
        {statusLabelMap[row.status]}
      </Badge>
    ),
  },
  { key: 'time', label: 'Vaqt' },
]

function DashboardPage() {
  const { data, isLoading, error, refetch } = useDashboard()

  if (error) {
    return (
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-primary-500">Dashboard yuklanmadi</h2>
        <p className="mt-2 text-sm leading-6 text-gray-500">{error}</p>
        <Button type="button" onClick={() => void refetch()} className="mt-5">
          Qayta urinib ko'rish
        </Button>
      </section>
    )
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-4 md:grid-cols-2">
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => <StatCardSkeleton key={index} />)
          : data && (
              <>
                <StatCard
                  label={data.stats.students.label}
                  value={String(data.stats.students.value)}
                  direction={data.stats.students.direction}
                  change={data.stats.students.change}
                  iconColor="text-blue-600"
                  iconBackground="bg-blue-50"
                  icon={
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  }
                />
                <StatCard
                  label={data.stats.activeGroups.label}
                  value={String(data.stats.activeGroups.value)}
                  direction={data.stats.activeGroups.direction}
                  change={data.stats.activeGroups.change}
                  iconColor="text-emerald-600"
                  iconBackground="bg-emerald-50"
                  icon={
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M3 7h18" />
                      <path d="M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
                      <path d="M8 11h8" />
                      <path d="M8 15h5" />
                    </svg>
                  }
                />
                <StatCard
                  label={data.stats.todayAttendance.label}
                  value={formatPercentage(data.stats.todayAttendance.value)}
                  direction={data.stats.todayAttendance.direction}
                  change={data.stats.todayAttendance.change}
                  iconColor="text-amber-600"
                  iconBackground="bg-amber-50"
                  icon={
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M9 11l3 3L22 4" />
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                    </svg>
                  }
                />
                <StatCard
                  label={data.stats.monthlyRevenue.label}
                  value={formatMoney(data.stats.monthlyRevenue.value)}
                  direction={data.stats.monthlyRevenue.direction}
                  change={data.stats.monthlyRevenue.change}
                  iconColor="text-violet-600"
                  iconBackground="bg-violet-50"
                  icon={
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="2" y="5" width="20" height="14" rx="2" />
                      <path d="M2 10h20" />
                      <path d="M7 15h2" />
                    </svg>
                  }
                />
              </>
            )}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.8fr)_minmax(320px,1fr)]">
        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Bugungi davomat</h2>
              <p className="mt-1 text-sm text-gray-500">So'nggi 10 ta belgilangan davomat</p>
            </div>
            <Link
              to="/attendance"
              className="text-sm font-medium text-primary-500 transition hover:text-primary-600"
            >
              Barchasini ko'rish
            </Link>
          </div>

          <div className="overflow-x-auto">
            <Table
              columns={attendanceColumns}
              data={data?.recentAttendance ?? []}
              loading={isLoading}
              rowKey={(row) => row.id}
              emptyState={
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700">Bugun hali davomat kiritilmagan</p>
                  <Link
                    to="/attendance"
                    className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-primary-500 px-4 text-sm font-medium text-white transition hover:bg-primary-600"
                  >
                    Davomatga o'tish
                  </Link>
                </div>
              }
            />
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="text-base font-semibold text-gray-900">Bugun darslar</h2>
            <p className="mt-1 text-sm text-gray-500">Bugungi jadval bo'yicha yaqinlashayotgan guruhlar</p>
          </div>

          <div className="p-5">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <ScheduleSkeleton key={index} />
                ))}
              </div>
            ) : data && data.todaySchedule.length > 0 ? (
              <div className="space-y-3">
                {data.todaySchedule.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-gray-200 bg-gray-25 px-4 py-4 transition hover:border-gray-300 hover:bg-white"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{item.groupName}</p>
                        <p className="mt-1 text-sm text-gray-500">{item.teacherName}</p>
                      </div>
                      <Badge variant="info">
                        {item.time}
                      </Badge>
                    </div>
                    <p className="mt-3 text-sm text-gray-600">Xona: {item.room}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center rounded-lg border border-dashed border-gray-200 bg-gray-25 px-6 py-10 text-center">
                <svg viewBox="0 0 120 120" className="h-28 w-28 text-gray-300" fill="none">
                  <rect x="18" y="28" width="84" height="62" rx="10" stroke="currentColor" strokeWidth="4" />
                  <path d="M18 48h84" stroke="currentColor" strokeWidth="4" />
                  <path d="M38 17v22M82 17v22" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                  <path d="M40 66h16M64 66h16" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
                <p className="mt-4 text-sm font-medium text-gray-700">Bugun rejalashtirilgan dars topilmadi</p>
                <Link
                  to="/groups"
                  className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-primary-500 px-4 text-sm font-medium text-white transition hover:bg-primary-600"
                >
                  Guruhlarni ko'rish
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

function StatCard({
  label,
  value,
  iconColor,
  iconBackground,
  direction,
  change,
  icon,
}: StatCardProps) {
  const trendClass =
    direction === 'up'
      ? 'text-emerald-600'
      : direction === 'down'
        ? 'text-red-600'
        : 'text-gray-500'

  return (
    <article className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${iconBackground} ${iconColor}`}>
          {icon}
        </div>
        <TrendIndicator direction={direction} change={change} className={trendClass} />
      </div>
      <p className="mt-5 text-[28px] font-bold leading-none tracking-[-0.03em] text-primary-500">{value}</p>
      <p className="mt-2 text-sm text-gray-500">{label}</p>
    </article>
  )
}

function TrendIndicator({
  direction,
  change,
  className,
}: {
  direction: 'up' | 'down' | 'neutral'
  change: number
  className: string
}) {
  return (
    <div className={`inline-flex items-center gap-1 text-xs font-medium ${className}`}>
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
        {direction === 'down' ? (
          <path d="m6 10 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        ) : direction === 'neutral' ? (
          <path d="M5 12h14" strokeLinecap="round" />
        ) : (
          <path d="m6 14 6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
      <span>{change}%</span>
    </div>
  )
}

function StatCardSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-4 w-14" />
      </div>
      <Skeleton className="mt-5 h-8 w-24" />
      <Skeleton className="mt-3 h-4 w-32" />
    </div>
  )
}

function ScheduleSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-25 px-4 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <Skeleton className="mt-3 h-4 w-32" />
    </div>
  )
}

export default DashboardPage
