import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import type { CourseOption, CreateGroupPayload, GroupSummary, UpdateGroupPayload } from '../../api/groups'
import type { TeacherOption } from '../../api/teachers'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Modal from '../ui/Modal'

const groupFormSchema = z.object({
  name: z.string().min(1, 'Guruh nomi kiritilishi shart'),
  teacherId: z.string().min(1, "O'qituvchi tanlanishi shart"),
  courseId: z.string().min(1, 'Kurs tanlanishi shart'),
  capacity: z.coerce.number().min(1, "Sig'im kamida 1 bo'lishi kerak").max(100, "Sig'im 100 tadan oshmasligi kerak"),
  startDate: z.string().min(1, 'Boshlanish sanasi kiritilishi shart'),
  endDate: z.string().optional(),
  isActive: z.coerce.boolean(),
})

type GroupFormValues = z.infer<typeof groupFormSchema>

interface GroupFormModalProps {
  isOpen: boolean
  group?: GroupSummary | null
  teachers: TeacherOption[]
  courses: CourseOption[]
  teachersLoading?: boolean
  coursesLoading?: boolean
  submitting?: boolean
  onClose: () => void
  onSubmit: (payload: CreateGroupPayload | UpdateGroupPayload) => Promise<void>
}

const defaultValues: GroupFormValues = {
  name: '',
  teacherId: '',
  courseId: '',
  capacity: 20,
  startDate: '',
  endDate: '',
  isActive: true,
}

const toDateInputValue = (value?: string | null) => (value ? value.slice(0, 10) : '')

function GroupFormModal({
  isOpen,
  group,
  teachers,
  courses,
  teachersLoading = false,
  coursesLoading = false,
  submitting = false,
  onClose,
  onSubmit,
}: GroupFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GroupFormValues>({
    resolver: zodResolver(groupFormSchema),
    defaultValues,
  })

  useEffect(() => {
    if (!isOpen) {
      return
    }

    reset(
      group
        ? {
            name: group.name,
            teacherId: group.teacherId,
            courseId: group.courseId,
            capacity: group.capacity,
            startDate: toDateInputValue(group.startDate),
            endDate: toDateInputValue(group.endDate),
            isActive: group.isActive,
          }
        : defaultValues,
    )
  }, [group, isOpen, reset])

  const submitForm = handleSubmit(async (values) => {
    await onSubmit({
      name: values.name.trim(),
      teacherId: values.teacherId,
      courseId: values.courseId,
      capacity: values.capacity,
      startDate: new Date(values.startDate).toISOString(),
      endDate: values.endDate ? new Date(values.endDate).toISOString() : undefined,
      ...(group ? { isActive: values.isActive } : {}),
    })
    onClose()
  })

  return (
    <Modal
      isOpen={isOpen}
      title={group ? 'Guruhni tahrirlash' : 'Yangi guruh'}
      onClose={onClose}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            Bekor qilish
          </Button>
          <Button type="submit" form="group-form" loading={submitting}>
            Saqlash
          </Button>
        </>
      }
    >
      <form id="group-form" className="space-y-4" onSubmit={submitForm} noValidate>
        <Input
          id="name"
          label="Guruh nomi"
          placeholder="Matematika 9-sinf"
          error={errors.name?.message}
          {...register('name')}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="teacherId" className="mb-2 block text-sm font-medium text-gray-700">
              O'qituvchi
            </label>
            <select
              id="teacherId"
              className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 transition hover:border-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/15"
              disabled={teachersLoading}
              {...register('teacherId')}
            >
              <option value="">Tanlang</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.fullName} ({teacher.teacherProfile?.subject ?? "Fan yo'q"})
                </option>
              ))}
            </select>
            {errors.teacherId ? (
              <p className="mt-2 text-xs text-red-600">{errors.teacherId.message}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="courseId" className="mb-2 block text-sm font-medium text-gray-700">
              Kurs
            </label>
            <select
              id="courseId"
              className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 transition hover:border-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/15"
              disabled={coursesLoading}
              {...register('courseId')}
            >
              <option value="">Tanlang</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name} — {Number(course.price ?? 0).toLocaleString('uz-UZ')} so'm
                </option>
              ))}
            </select>
            {errors.courseId ? (
              <p className="mt-2 text-xs text-red-600">{errors.courseId.message}</p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input id="capacity" label="Sig'im" type="number" min={1} max={100} error={errors.capacity?.message} {...register('capacity')} />
          <Input
            id="startDate"
            label="Boshlanish sanasi"
            type="date"
            error={errors.startDate?.message}
            {...register('startDate')}
          />
        </div>

        <Input
          id="endDate"
          label="Tugash sanasi"
          type="date"
          error={errors.endDate?.message}
          {...register('endDate')}
        />

        {group ? (
          <label className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
              {...register('isActive')}
            />
            Guruh faol holatda
          </label>
        ) : null}
      </form>
    </Modal>
  )
}

export default GroupFormModal
