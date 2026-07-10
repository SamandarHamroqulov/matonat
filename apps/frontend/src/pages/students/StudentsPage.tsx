import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import StudentFormModal from '../../components/students/StudentFormModal'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Pagination from '../../components/ui/Pagination'
import SearchInput from '../../components/ui/SearchInput'
import Table, { type TableColumn } from '../../components/ui/Table'
import { getGroups, type GroupSummary } from '../../api/groups'
import type { CreateStudentPayload, UpdateStudentPayload } from '../../api/students'
import { useStudents } from '../../hooks/useStudents'
import type { Student } from '../../types'

type StudentStatusFilter = '' | 'true' | 'false'

const formatPhone = (value: string | null) => value ?? '—'

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="m4 20 4.5-1 10-10a1.5 1.5 0 0 0 0-2.1l-1.4-1.4a1.5 1.5 0 0 0-2.1 0l-10 10L4 20Z" />
      <path d="m13.5 6.5 4 4" strokeLinecap="round" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 6h18" strokeLinecap="round" />
      <path d="M8 6V4.5A1.5 1.5 0 0 1 9.5 3h5A1.5 1.5 0 0 1 16 4.5V6" />
      <path d="M19 6l-1 13.5A1.5 1.5 0 0 1 16.5 21h-9A1.5 1.5 0 0 1 6 19.5L5 6" />
      <path d="M10 10v6M14 10v6" strokeLinecap="round" />
    </svg>
  )
}

function StudentsPage() {
  const {
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
    refetch,
    addStudent,
    editStudent,
    removeStudent,
  } = useStudents(20)

  const [groups, setGroups] = useState<GroupSummary[]>([])
  const [groupsLoading, setGroupsLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const loadGroups = async () => {
      try {
        setGroupsLoading(true)
        const response = await getGroups({ page: 1, limit: 100 })
        if (active) {
          setGroups(response.data)
        }
      } catch {
        if (active) {
          toast.error("Guruhlarni yuklab bo'lmadi")
        }
      } finally {
        if (active) {
          setGroupsLoading(false)
        }
      }
    }

    void loadGroups()

    return () => {
      active = false
    }
  }, [])

  const columns = useMemo<TableColumn<Student>[]>(
    () => [
      {
        key: 'fullName',
        label: 'Ism familiya',
        render: (row) => <span className="text-sm font-medium text-gray-900">{row.fullName}</span>,
      },
      {
        key: 'group',
        label: 'Guruh',
        render: (row) =>
          row.group ? (
            <Badge variant="gray">{row.group.name}</Badge>
          ) : (
            <Badge variant="gray">Guruhsiz</Badge>
          ),
      },
      {
        key: 'phone',
        label: 'Telefon',
        render: (row) => <span className="text-sm text-gray-600">{formatPhone(row.phone)}</span>,
      },
      {
        key: 'parentPhone',
        label: 'Ota-ona tel',
        render: (row) => <span className="text-sm text-gray-600">{row.parentPhone}</span>,
      },
      {
        key: 'isActive',
        label: 'Holat',
        render: (row) => (
          <Badge variant={row.isActive ? 'success' : 'danger'}>{row.isActive ? 'Faol' : 'Nofaol'}</Badge>
        ),
      },
      {
        key: 'actions',
        label: 'Amallar',
        render: (row) => (
          <div className="flex items-center gap-2">
            {deletingId === row.id ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Rostdan ham o&apos;chirmoqchimisiz?</span>
                <Button
                  type="button"
                  size="sm"
                  variant="danger"
                  onClick={() => void handleDelete(row.id)}
                >
                  Ha
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => setDeletingId(null)}
                >
                  Yo&apos;q
                </Button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStudent(row)
                    setFormOpen(true)
                  }}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
                  aria-label="Tahrirlash"
                >
                  <PencilIcon />
                </button>
                <button
                  type="button"
                  onClick={() => setDeletingId(row.id)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-600 transition hover:bg-gray-100 hover:text-red-600"
                  aria-label="O'chirish"
                >
                  <TrashIcon />
                </button>
              </>
            )}
          </div>
        ),
      },
    ],
    [deletingId],
  )

  useEffect(() => {
    setPage(1)
  }, [groupId, isActive, search, setPage])

  const handleDelete = async (id: string) => {
    try {
      await removeStudent(id)
      toast.success("O'quvchi o'chirildi")
      setDeletingId(null)
    } catch {
      toast.error("O'quvchini o'chirib bo'lmadi")
    }
  }

  const handleSubmit = async (payload: CreateStudentPayload | UpdateStudentPayload) => {
    try {
      setSubmitting(true)
      if (selectedStudent) {
        await editStudent(selectedStudent.id, payload as UpdateStudentPayload)
        toast.success("O'zgarishlar saqlandi")
      } else {
        await addStudent(payload as CreateStudentPayload)
        toast.success("O'quvchi qo'shildi")
      }
      setFormOpen(false)
      setSelectedStudent(null)
    } catch {
      toast.error(selectedStudent ? "O'zgarishlarni saqlab bo'lmadi" : "O'quvchini qo'shib bo'lmadi")
    } finally {
      setSubmitting(false)
    }
  }

  const filteredError = error

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-xl font-semibold text-gray-800">O&apos;quvchilar</h1>
        <Button
          type="button"
          icon={
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
          }
          onClick={() => {
            setSelectedStudent(null)
            setFormOpen(true)
          }}
        >
          O&apos;quvchi qo&apos;shish
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_320px]">
        <SearchInput
          value={search}
          onSearch={setSearch}
          placeholder="Ism yoki telefon bo'yicha qidirish"
        />

        <select
          value={groupId}
          onChange={(event) => setGroupId(event.target.value)}
          disabled={groupsLoading}
          className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/15"
        >
          <option value="">Barcha guruhlar</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          {[
            { label: 'Barchasi', value: '' as StudentStatusFilter },
            { label: 'Faol', value: 'true' as StudentStatusFilter },
            { label: 'Nofaol', value: 'false' as StudentStatusFilter },
          ].map((item) => {
            const active = isActive === item.value
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => setIsActive(item.value)}
                className={
                  active
                    ? 'h-10 flex-1 rounded-md bg-primary-600 px-4 text-sm font-medium text-white'
                    : 'h-10 flex-1 rounded-md border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50'
                }
              >
                {item.label}
              </button>
            )
          })}
        </div>
      </div>

      {filteredError ? (
        <section className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-800">O&apos;quvchilar yuklanmadi</h2>
          <p className="mt-2 text-sm text-gray-500">{filteredError}</p>
          <Button type="button" className="mt-4" onClick={() => void refetch()}>
            Qayta urinib ko&apos;rish
          </Button>
        </section>
      ) : (
        <section className="rounded-lg border border-gray-200 bg-white">
          <Table
            columns={columns}
            data={students}
            loading={isLoading}
            skeletonRows={8}
            rowKey={(row) => row.id}
            emptyState={
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <p className="text-sm text-gray-500">O&apos;quvchilar topilmadi</p>
                <Button
                  type="button"
                  onClick={() => {
                    setSelectedStudent(null)
                    setFormOpen(true)
                  }}
                >
                  O&apos;quvchi qo&apos;shish
                </Button>
              </div>
            }
          />
          <div className="border-t border-gray-200 px-5 py-4">
            <Pagination page={page} limit={limit} total={total} onPageChange={setPage} />
          </div>
        </section>
      )}

      <StudentFormModal
        isOpen={formOpen}
        student={selectedStudent}
        groups={groups}
        groupsLoading={groupsLoading}
        submitting={submitting}
        onClose={() => {
          setFormOpen(false)
          setSelectedStudent(null)
        }}
        onSubmit={handleSubmit}
      />
    </div>
  )
}

export default StudentsPage
