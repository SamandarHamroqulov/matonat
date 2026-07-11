import { useState } from 'react'
import toast from 'react-hot-toast'
import CourseFormModal from '../../components/courses/CourseFormModal'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { useCourses } from '../../hooks/useCourses'
import { formatMoney } from '../../utils/format'
import type { CourseOption } from '../../api/groups'
import type { CreateCoursePayload, UpdateCoursePayload } from '../../api/courses'

function CoursesPage() {
  const { courses, isLoading, error, refetch, addCourse, editCourse, removeCourse } = useCourses()
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<CourseOption | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleCreateOpen = () => {
    setSelectedCourse(null)
    setFormOpen(true)
  }

  const handleFormSubmit = async (payload: CreateCoursePayload | UpdateCoursePayload) => {
    try {
      setSubmitting(true)
      if (selectedCourse) {
        await editCourse(selectedCourse.id, payload as UpdateCoursePayload)
        toast.success("Kurs muvaffaqiyatli yangilandi")
      } else {
        await addCourse(payload as CreateCoursePayload)
        toast.success("Yangi kurs qo'shildi")
      }
    } catch {
      toast.error(selectedCourse ? "Kursni yangilab bo'lmadi" : "Kursni qo'shib bo'lmadi")
      throw new Error('submit failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedCourse) return
    try {
      setDeleting(true)
      await removeCourse(selectedCourse.id)
      toast.success("Kurs o'chirildi")
      setDeleteOpen(false)
      setSelectedCourse(null)
    } catch {
      toast.error("Kursni o'chirib bo'lmadi")
    } finally {
      setDeleting(false)
    }
  }

  if (error) {
    return (
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-primary-500">Kurslar yuklanmadi</h2>
        <p className="mt-2 text-sm leading-6 text-gray-500">{error}</p>
        <Button type="button" onClick={() => void refetch()} className="mt-5">
          Qayta urinish
        </Button>
      </section>
    )
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-primary-500">O'quv Kurslari</h2>
            <p className="mt-1 text-sm text-gray-500">
              Markazdagi mavjud barcha yo'nalishlar va kurslarni boshqaring
            </p>
          </div>
          <Button type="button" onClick={handleCreateOpen}>
            Yangi kurs qo'shish
          </Button>
        </div>
      </section>

      <section>
        {isLoading ? (
          <div className="text-sm font-medium text-gray-500">Yuklanmoqda...</div>
        ) : courses.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-10 text-center">
            <p className="text-sm font-medium text-gray-700">Hozircha kurslar topilmadi</p>
            <Button type="button" className="mt-4" onClick={handleCreateOpen}>
              Birinchi kursni qo'shish
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {courses.map((course) => (
              <div key={course.id} className="group relative flex flex-col justify-between rounded-lg border border-gray-200 bg-white transition hover:shadow-md">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition">
                      {course.name}
                    </h3>
                    <Badge variant={course.isActive ? 'success' : 'gray'}>
                      {course.isActive ? 'Faol' : 'Nofaol'}
                    </Badge>
                  </div>
                  
                  {course.description && (
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{course.description}</p>
                  )}
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{course.duration} oy davomiyligi</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{formatMoney(Number(course.price))} / oy</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 border-t border-gray-100 p-4">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCourse(course)
                      setFormOpen(true)
                    }}
                    className="flex-1 rounded-md px-3 py-1.5 text-xs font-semibold text-gray-600 border border-gray-200 transition hover:bg-gray-50 hover:text-primary-500"
                  >
                    Tahrirlash
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCourse(course)
                      setDeleteOpen(true)
                    }}
                    className="flex-1 rounded-md px-3 py-1.5 text-xs font-semibold text-gray-600 border border-gray-200 transition hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                  >
                    O'chirish
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <CourseFormModal
        isOpen={formOpen}
        course={selectedCourse}
        submitting={submitting}
        onClose={() => {
          setFormOpen(false)
          setSelectedCourse(null)
        }}
        onSubmit={handleFormSubmit}
      />

      <Modal
        isOpen={deleteOpen}
        title="Kursni o'chirish"
        onClose={() => {
          if (!deleting) {
            setDeleteOpen(false)
            setSelectedCourse(null)
          }
        }}
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setDeleteOpen(false)
                setSelectedCourse(null)
              }}
              disabled={deleting}
            >
              Bekor qilish
            </Button>
            <Button type="button" variant="danger" loading={deleting} onClick={() => void handleDelete()}>
              O'chirish
            </Button>
          </>
        }
      >
        <p className="text-sm leading-6 text-gray-600">
          <span className="font-medium text-gray-900">{selectedCourse?.name}</span> kursini
          o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi. (Agar kursga bog'langan guruhlar bo'lsa o'chmasligi mumkin).
        </p>
      </Modal>
    </div>
  )
}

export default CoursesPage
