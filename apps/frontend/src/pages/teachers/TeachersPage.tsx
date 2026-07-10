import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import TeacherCredentialsModal from '../../components/teachers/TeacherCredentialsModal'
import TeacherFormModal from '../../components/teachers/TeacherFormModal'
import Button from '../../components/ui/Button'
import Pagination from '../../components/ui/Pagination'
import SearchInput from '../../components/ui/SearchInput'
import Table, { type TableColumn } from '../../components/ui/Table'
import { useTeachers } from '../../hooks/useTeachers'
import type {
  CreatedTeacherResponse,
  CreateTeacherPayload,
  TeacherListItem,
  UpdateTeacherPayload,
} from '../../api/teachers'
import { formatMoney } from '../../utils/format'

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

function TeachersPage() {
  const {
    teachers,
    total,
    page,
    limit,
    isLoading,
    error,
    search,
    setSearch,
    setPage,
    refetch,
    addTeacher,
    editTeacher,
    removeTeacher,
  } = useTeachers(20)

  const [formOpen, setFormOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherListItem | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [credentials, setCredentials] = useState<CreatedTeacherResponse | null>(null)

  const columns = useMemo<TableColumn<TeacherListItem>[]>(
    () => [
      {
        key: 'fullName',
        label: 'Ism',
        render: (row) => <span className="font-medium text-gray-900">{row.fullName}</span>,
      },
      {
        key: 'subject',
        label: 'Fan',
        render: (row) => row.teacherProfile?.subject ?? 'Bilanmagan',
      },
      {
        key: 'email',
        label: 'Email',
      },
      {
        key: 'phone',
        label: 'Telefon',
        render: (row) => row.phone ?? '—',
      },
      {
        key: 'salary',
        label: 'Maosh',
        render: (row) => `${formatMoney(Number(row.teacherProfile?.salary ?? 0))}`,
      },
      {
        key: 'actions',
        label: 'Amallar',
        render: (row) => (
          <div className="flex items-center gap-2">
            {deleteId === row.id ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Rostdan ham o&apos;chirmoqchimisiz?</span>
                <Button type="button" size="sm" variant="danger" onClick={() => void handleDelete(row.id)}>
                  Ha
                </Button>
                <Button type="button" size="sm" variant="secondary" onClick={() => setDeleteId(null)}>
                  Yo&apos;q
                </Button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTeacher(row)
                    setFormOpen(true)
                  }}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
                  aria-label="Tahrirlash"
                >
                  <PencilIcon />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteId(row.id)}
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
    [deleteId],
  )

  const handleDelete = async (id: string) => {
    try {
      await removeTeacher(id)
      toast.success("O'qituvchi o'chirildi")
      setDeleteId(null)
    } catch {
      toast.error("O'qituvchini o'chirib bo'lmadi")
    }
  }

  const handleSubmit = async (payload: CreateTeacherPayload | UpdateTeacherPayload) => {
    try {
      setSubmitting(true)
      if (selectedTeacher) {
        await editTeacher(selectedTeacher.id, payload as UpdateTeacherPayload)
        toast.success("O'zgarishlar saqlandi")
      } else {
        const response = await addTeacher(payload as CreateTeacherPayload)
        setCredentials(response)
        toast.success("O'qituvchi qo'shildi")
      }
      setFormOpen(false)
      setSelectedTeacher(null)
    } catch {
      toast.error(selectedTeacher ? "O'zgarishlarni saqlab bo'lmadi" : "O'qituvchini qo'shib bo'lmadi")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-xl font-semibold text-gray-800">O&apos;qituvchilar</h1>
        <Button
          type="button"
          onClick={() => {
            setSelectedTeacher(null)
            setFormOpen(true)
          }}
        >
          O&apos;qituvchi qo&apos;shish
        </Button>
      </div>

      <SearchInput
        value={search}
        onSearch={setSearch}
        placeholder="Ism bo'yicha qidirish"
      />

      {error ? (
        <section className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-800">O&apos;qituvchilar yuklanmadi</h2>
          <p className="mt-2 text-sm text-gray-500">{error}</p>
          <Button type="button" className="mt-4" onClick={() => void refetch()}>
            Qayta urinib ko&apos;rish
          </Button>
        </section>
      ) : (
        <section className="rounded-lg border border-gray-200 bg-white">
          <Table
            columns={columns}
            data={teachers}
            loading={isLoading}
            rowKey={(row) => row.id}
            emptyState={
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <p className="text-sm text-gray-500">O&apos;qituvchilar topilmadi</p>
                <Button type="button" onClick={() => setFormOpen(true)}>
                  O&apos;qituvchi qo&apos;shish
                </Button>
              </div>
            }
          />
          <div className="border-t border-gray-200 px-5 py-4">
            <Pagination page={page} limit={limit} total={total} onPageChange={setPage} />
          </div>
        </section>
      )}

      <TeacherFormModal
        isOpen={formOpen}
        teacher={selectedTeacher}
        submitting={submitting}
        onClose={() => {
          setFormOpen(false)
          setSelectedTeacher(null)
        }}
        onSubmit={handleSubmit}
      />

      <TeacherCredentialsModal
        isOpen={Boolean(credentials)}
        login={credentials?.generatedLogin ?? ''}
        password={credentials?.generatedPassword ?? ''}
        onClose={() => setCredentials(null)}
      />
    </div>
  )
}

export default TeachersPage
