import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import GroupFormModal from '../../components/groups/GroupFormModal'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Pagination from '../../components/ui/Pagination'
import SearchInput from '../../components/ui/SearchInput'
import Skeleton from '../../components/ui/Skeleton'
import { useCourseOptions } from '../../hooks/useCourseOptions'
import { useGroups } from '../../hooks/useGroups'
import { useTeacherOptions } from '../../hooks/useTeacherOptions'
import type { CreateGroupPayload, GroupSummary, UpdateGroupPayload } from '../../api/groups'

const dayLabels: Record<string, string> = {
  MONDAY: 'Du',
  TUESDAY: 'Se',
  WEDNESDAY: 'Ch',
  THURSDAY: 'Pa',
  FRIDAY: 'Ju',
  SATURDAY: 'Sh',
  SUNDAY: 'Ya',
}

const formatUzDate = (date: string) =>
  new Date(date).toLocaleDateString('uz-UZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

function TeacherIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" />
      <path d="M4 20a8 8 0 0 1 16 0" strokeLinecap="round" />
    </svg>
  )
}

function CourseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 5h16v14H4z" />
      <path d="M8 9h8M8 13h5" strokeLinecap="round" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function GroupsPage() {
  const navigate = useNavigate()
  const {
    groups,
    total,
    page,
    limit,
    isLoading,
    error,
    search,
    setSearch,
    setPage,
    refetch,
    addGroup,
    editGroup,
    removeGroup,
  } = useGroups(20)
  const { teachers, isLoading: teachersLoading } = useTeacherOptions()
  const { courses, isLoading: coursesLoading } = useCourseOptions()

  const [formOpen, setFormOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<GroupSummary | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleSubmit = async (payload: CreateGroupPayload | UpdateGroupPayload) => {
    try {
      setSubmitting(true)
      if (selectedGroup) {
        await editGroup(selectedGroup.id, payload)
        toast.success('Guruh o\'zgartirildi')
      } else {
        await addGroup(payload as CreateGroupPayload)
        toast.success('Guruh qo\'shildi')
      }
      setFormOpen(false)
      setSelectedGroup(null)
    } catch {
      toast.error(selectedGroup ? 'Guruhni yangilab bo\'lmadi' : 'Guruhni qo\'shib bo\'lmadi')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (groupId: string) => {
    try {
      await removeGroup(groupId)
      toast.success('Guruh o\'chirildi')
      setDeletingId(null)
    } catch {
      toast.error('Guruhni o\'chirib bo\'lmadi')
    }
  }

  const cards = useMemo(() => groups, [groups])

  useEffect(() => {
    setPage(1)
  }, [search, setPage])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-xl font-semibold text-gray-800">Guruhlar</h1>
        <Button
          type="button"
          onClick={() => {
            setSelectedGroup(null)
            setFormOpen(true)
          }}
        >
          Guruh qo&apos;shish
        </Button>
      </div>

      <SearchInput
        value={search}
        onSearch={setSearch}
        placeholder="Guruh nomi bo'yicha qidirish"
      />

      {error ? (
        <section className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-800">Guruhlar yuklanmadi</h2>
          <p className="mt-2 text-sm text-gray-500">{error}</p>
          <Button type="button" className="mt-4" onClick={() => void refetch()}>
            Qayta urinib ko&apos;rish
          </Button>
        </section>
      ) : isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="rounded-lg border border-gray-200 bg-white p-5">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="mt-4 h-4 w-48" />
              <Skeleton className="mt-3 h-4 w-40" />
              <Skeleton className="mt-3 h-4 w-44" />
            </div>
          ))}
        </div>
      ) : cards.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-10 text-center">
          <p className="text-sm text-gray-500">Guruhlar topilmadi</p>
          <Button
            type="button"
            className="mt-4"
            onClick={() => {
              setSelectedGroup(null)
              setFormOpen(true)
            }}
          >
            Guruh qo&apos;shish
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((group) => {
            const studentsCount = group._count?.students ?? 0
            const capacityPercent = group.capacity ? Math.min(100, Math.round((studentsCount / group.capacity) * 100)) : 0
            const scheduleText =
              group.schedules?.length
                ? `${group.schedules.map((schedule) => dayLabels[schedule.dayOfWeek] ?? schedule.dayOfWeek).join(', ')} • ${group.schedules[0]?.startTime ?? '00:00'}-${group.schedules[0]?.endTime ?? '00:00'}`
                : 'Jadval belgilanmagan'

            return (
              <button
                key={group.id}
                type="button"
                onClick={() => navigate(`/groups/${group.id}`)}
                className="group rounded-lg border border-gray-200 bg-white p-5 text-left transition hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">{group.name}</h3>
                  </div>
                  <Badge variant={group.isActive ? 'success' : 'gray'}>
                    {group.isActive ? 'Faol' : 'Nofaol'}
                  </Badge>
                </div>

                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <TeacherIcon />
                    <span>{group.teacher?.user?.fullName ?? "O'qituvchi biriktirilmagan"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CourseIcon />
                    <span>{group.course?.name ?? 'Kurs topilmadi'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <ClockIcon />
                    <span>{scheduleText}</span>
                  </div>
                </div>

                <div className="mt-4 border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>O&apos;quvchilar: {studentsCount}/{group.capacity}</span>
                    <span>{formatUzDate(group.startDate)}</span>
                  </div>
                  <div className="mt-2 h-1 rounded-full bg-gray-100">
                    <div
                      className="h-1 rounded-full bg-primary-600"
                      style={{ width: `${capacityPercent}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-end gap-2 border-t border-gray-100 pt-4">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      setSelectedGroup(group)
                      setFormOpen(true)
                    }}
                    className="rounded-md px-3 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-100"
                  >
                    Tahrirlash
                  </button>
                  {deletingId === group.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Rostdan ham o&apos;chirmoqchimisiz?</span>
                      <Button type="button" size="sm" variant="danger" onClick={() => void handleDelete(group.id)}>
                        Ha
                      </Button>
                      <Button type="button" size="sm" variant="secondary" onClick={() => setDeletingId(null)}>
                        Yo&apos;q
                      </Button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation()
                        setDeletingId(group.id)
                      }}
                      className="rounded-md px-3 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-100 hover:text-red-600"
                    >
                      O&apos;chirish
                    </button>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}

      <div className="flex justify-end">
        <Pagination page={page} limit={limit} total={total} onPageChange={setPage} />
      </div>

      <GroupFormModal
        isOpen={formOpen}
        group={selectedGroup}
        teachers={teachers}
        courses={courses}
        teachersLoading={teachersLoading}
        coursesLoading={coursesLoading}
        submitting={submitting}
        onClose={() => {
          setFormOpen(false)
          setSelectedGroup(null)
        }}
        onSubmit={handleSubmit}
      />
    </div>
  )
}

export default GroupsPage
