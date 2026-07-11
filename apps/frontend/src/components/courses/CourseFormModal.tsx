import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { CreateCoursePayload, UpdateCoursePayload } from '../../api/courses'
import type { CourseOption } from '../../api/groups'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Modal from '../ui/Modal'

const courseSchema = z.object({
  name: z.string().min(1, 'Kurs nomi kiritilishi shart'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Narx noldan kichik bo\'lmasligi kerak'),
  duration: z.coerce.number().min(1, 'Davomiylik (oy) majburiy'),
  isActive: z.boolean(),
})

type CourseFormValues = z.infer<typeof courseSchema>

interface CourseFormModalProps {
  isOpen: boolean
  course: CourseOption | null
  submitting: boolean
  onClose: () => void
  onSubmit: (payload: CreateCoursePayload | UpdateCoursePayload) => Promise<void>
}

export default function CourseFormModal({
  isOpen,
  course,
  submitting,
  onClose,
  onSubmit,
}: CourseFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      duration: 1,
      isActive: true,
    },
  })

  useEffect(() => {
    if (isOpen) {
      if (course) {
        reset({
          name: course.name,
          description: course.description || '',
          price: Number(course.price),
          duration: course.duration,
          isActive: course.isActive !== false,
        })
      } else {
        reset({
          name: '',
          description: '',
          price: 0,
          duration: 1,
          isActive: true,
        })
      }
    }
  }, [isOpen, course, reset])

  const handleFormSubmit = async (data: CourseFormValues) => {
    try {
      await onSubmit(data)
      onClose()
    } catch (err) {
      // Handled by parent
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      title={course ? "Kursni tahrirlash" : "Yangi kurs qo'shish"}
      onClose={onClose}
    >
      <form id="course-form" onSubmit={(e) => void handleSubmit(handleFormSubmit)(e)} className="space-y-4">
        <Input
          label="Kurs nomi"
          {...register('name')}
          error={errors.name?.message}
          placeholder="Masalan, Matematika"
        />

        <Input
          label="Tavsif (ixtiyoriy)"
          {...register('description')}
          error={errors.description?.message}
          placeholder="Batafsil ma'lumot"
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Oylik to'lov (so'm)"
            type="number"
            {...register('price')}
            error={errors.price?.message}
            placeholder="0"
          />
          <Input
            label="Davomiylik (oy)"
            type="number"
            {...register('duration')}
            error={errors.duration?.message}
            placeholder="1"
          />
        </div>

        {course && (
          <div className="flex flex-col gap-2 pt-2">
            <span className="text-sm font-medium text-gray-700">Holat</span>
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 transition hover:bg-gray-50 focus-within:ring-2 focus-within:ring-primary-500/20">
              <input
                type="checkbox"
                className="h-5 w-5 cursor-pointer rounded border-gray-300 text-primary-600 focus:ring-primary-600 focus:ring-offset-0"
                {...register('isActive')}
              />
              <span className="text-sm font-medium text-gray-900 group-hover:text-primary-600">
                Faol (yangi guruhlar ochish mumkin)
              </span>
            </label>
            {errors.isActive && (
              <p className="mt-1 text-xs text-red-600">{errors.isActive.message}</p>
            )}
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-200 pt-5">
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            Bekor qilish
          </Button>
          <Button type="submit" loading={submitting}>
            Saqlash
          </Button>
        </div>
      </form>
    </Modal>
  )
}
