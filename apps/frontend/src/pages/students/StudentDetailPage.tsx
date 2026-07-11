import { useEffect, useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import StudentFormModal from '../../components/students/StudentFormModal'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Skeleton from '../../components/ui/Skeleton'
import Table, { type TableColumn } from '../../components/ui/Table'
import { getAttendances, type AttendanceRecord } from '../../api/attendance'
import { useGroupOptions } from '../../hooks/useGroupOptions'
import { useStudent } from '../../hooks/useStudent'
import { formatDate } from '../../utils/format'
import type { CreateStudentPayload, UpdateStudentPayload } from '../../api/students'
function StudentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { student, isLoading, error, refetch, editStudent, removeStudent } = useStudent(id)
  const { groups, isLoading: groupsLoading } = useGroupOptions()
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([])
  const [attendanceLoading, setAttendanceLoading] = useState(false)
  const [attendanceError, setAttendanceError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      return
    }

    let active = true

    const loadHistory = async () => {
      try {
        setAttendanceLoading(true)
        setAttendanceError(null)
        const response = await getAttendances({ studentId: id, limit: 10, page: 1 })
        if (active) {
          setAttendanceHistory(response.data)
        }
      } catch {
        if (active) {
          setAttendanceError("Davomat tarixini yuklab bo'lmadi")
        }
      } finally {
        if (active) {
          setAttendanceLoading(false)
        }
      }
    }

    void loadHistory()

    return () => {
      active = false
    }
  }, [id])

  const handleFormSubmit = async (payload: CreateStudentPayload | UpdateStudentPayload) => {
    try {
      setSubmitting(true)
      await editStudent(payload)
      toast.success("O'quvchi yangilandi")
    } catch {
      toast.error("O'quvchini yangilab bo'lmadi")
      throw new Error('submit failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    try {
      setDeleting(true)
      await removeStudent()
      toast.success("O'quvchi o'chirildi")
      navigate('/students', { replace: true })
    } catch {
      toast.error("O'quvchini o'chirib bo'lmadi")
    } finally {
      setDeleting(false)
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

  if (error || !student) {
    return (
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-primary-500">O'quvchi topilmadi</h2>
        <p className="mt-2 text-sm leading-6 text-gray-500">
          {error ?? "So'ralgan o'quvchi mavjud emas yoki o'chirilgan bo'lishi mumkin."}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button type="button" onClick={() => void refetch()}>
            Qayta urinib ko'rish
          </Button>
          <Link
            to="/students"
            className="inline-flex h-10 items-center justify-center rounded-md border border-gray-300 px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Ro'yxatga qaytish
          </Link>
        </div>
      </section>
    )
  }

  return (
    <div className="space-y-6">
      <Link
        to="/students"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-primary-500"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        O'quvchilar ro'yxatiga qaytish
      </Link>

      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex flex-col gap-4 border-b border-gray-200 pb-5 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-semibold text-primary-500">{student.fullName}</h2>
              <Badge variant={student.isActive ? 'success' : 'gray'}>
                {student.isActive ? 'Faol' : 'Nofaol'}
              </Badge>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Ro'yxatga olingan: {formatDate(student.createdAt)}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="secondary" onClick={() => setFormOpen(true)}>
              Tahrirlash
            </Button>
            <Button type="button" variant="danger" onClick={() => setDeleteOpen(true)}>
              O'chirish
            </Button>
          </div>
        </div>

        <dl className="mt-6 grid gap-4 md:grid-cols-2">
          <DetailItem label="Telefon" value={student.phone || 'Kiritilmagan'} />
          <DetailItem label="Ota-ona telefoni" value={student.parentPhone || 'Kiritilmagan'} />
          <DetailItem
            label="Tug'ilgan sana"
            value={student.birthDate ? formatDate(student.birthDate) : 'Kiritilmagan'}
          />
          <DetailItem
            label="Guruh"
            value={
              student.group ? (
                <Link
                  to={`/groups/${student.group.id}`}
                  className="font-medium text-primary-500 transition hover:text-primary-600"
                >
                  {student.group.name}
                </Link>
              ) : (
                'Guruh biriktirilmagan'
              )
            }
          />
          <DetailItem label="Yangilangan" value={formatDate(student.updatedAt)} />
          <DetailItem label="ID" value={student.id} />
        </dl>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Davomat tarixi</h3>
            <p className="mt-1 text-sm text-gray-500">So'nggi davomat yozuvlari</p>
          </div>
        </div>

        {attendanceError ? (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {attendanceError}
          </div>
        ) : attendanceLoading ? (
          <div className="mt-4 space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-12" />
            ))}
          </div>
        ) : attendanceHistory.length === 0 ? (
          <div className="mt-4 rounded-lg border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
            Davomat tarixi topilmadi
          </div>
        ) : (
          <div className="mt-4">
            <Table
              columns={attendanceColumns}
              data={attendanceHistory}
              rowKey={(row) => row.id}
            />
          </div>
        )}
      </section>

      <StudentFormModal
        isOpen={formOpen}
        student={student}
        groups={groups}
        groupsLoading={groupsLoading}
        submitting={submitting}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      <Modal
        isOpen={deleteOpen}
        title="O'quvchini o'chirish"
        onClose={() => {
          if (!deleting) {
            setDeleteOpen(false)
          }
        }}
        footer={
          <>
            <Button type="button" variant="secondary" onClick={() => setDeleteOpen(false)} disabled={deleting}>
              Bekor qilish
            </Button>
            <Button type="button" variant="danger" loading={deleting} onClick={() => void handleDelete()}>
              O'chirish
            </Button>
          </>
        }
      >
        <p className="text-sm leading-6 text-gray-600">
          <span className="font-medium text-gray-900">{student.fullName}</span> o'quvchisini o'chirmoqchimisiz?
        </p>
      </Modal>
    </div>
  )
}

function DetailItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-25 px-4 py-4">
      <dt className="text-xs font-medium uppercase tracking-[0.04em] text-gray-500">{label}</dt>
      <dd className="mt-2 text-sm font-medium text-gray-900">{value}</dd>
    </div>
  )
}

const attendanceColumns: TableColumn<AttendanceRecord>[] = [
  {
    key: 'date',
    label: 'Sana',
    render: (row) => formatDate(row.date),
  },
  {
    key: 'group',
    label: 'Guruh',
    render: (row) => row.group?.name ?? '—',
  },
  {
    key: 'status',
    label: 'Holat',
    render: (row) => (
      <Badge
        variant={
          row.status === 'PRESENT' ? 'success' : row.status === 'LATE' ? 'warning' : 'danger'
        }
      >
        {row.status === 'PRESENT' ? 'Keldi' : row.status === 'LATE' ? 'Kech' : 'Kelmadi'}
      </Badge>
    ),
  },
  {
    key: 'markedBy',
    label: 'Belgilagan',
    render: (row) => row.markedBy?.fullName ?? '—',
  },
]

export default StudentDetailPage
