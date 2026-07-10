import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import type { CreateTeacherPayload, TeacherListItem, UpdateTeacherPayload } from '../../api/teachers'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Modal from '../ui/Modal'

const teacherSchema = z.object({
  fullName: z.string().min(2, "Ism kamida 2 ta belgidan iborat bo'lishi kerak"),
  email: z.string().email("Yaroqli email kiriting"),
  phone: z.string().regex(/^\+998\d{9}$/, "Noto'g'ri format").optional().or(z.literal('')),
  subject: z.string().min(2, "Fan kiritilishi shart"),
  salary: z.coerce.number().min(0, "Maosh manfiy bo'lishi mumkin emas"),
})

type TeacherFormValues = z.infer<typeof teacherSchema>

interface TeacherFormModalProps {
  isOpen: boolean
  teacher: TeacherListItem | null
  submitting: boolean
  onClose: () => void
  onSubmit: (payload: CreateTeacherPayload | UpdateTeacherPayload) => Promise<void>
}

const defaultValues: TeacherFormValues = {
  fullName: '',
  email: '',
  phone: '',
  subject: '',
  salary: 0,
}

export default function TeacherFormModal({
  isOpen,
  teacher,
  submitting,
  onClose,
  onSubmit,
}: TeacherFormModalProps) {
  const isEditing = Boolean(teacher)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TeacherFormValues>({
    resolver: zodResolver(teacherSchema),
    defaultValues,
  })

  useEffect(() => {
    if (!isOpen) {
      return
    }

    if (teacher) {
      reset({
        fullName: teacher.fullName,
        email: teacher.email,
        phone: teacher.phone ?? '',
        subject: teacher.teacherProfile?.subject ?? '',
        salary: Number(teacher.teacherProfile?.salary ?? 0),
      })
      return
    }

    reset(defaultValues)
  }, [isOpen, reset, teacher])

  const submitForm = handleSubmit(async (values) => {
    if (teacher) {
      await onSubmit({
        fullName: values.fullName.trim(),
        phone: values.phone?.trim() || undefined,
        subject: values.subject.trim(),
        salary: values.salary,
      })
      return
    }

    await onSubmit({
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      phone: values.phone?.trim() || undefined,
      subject: values.subject.trim(),
      salary: values.salary,
    })
  })

  return (
    <Modal
      isOpen={isOpen}
      title={isEditing ? "O'qituvchini tahrirlash" : "Yangi o'qituvchi qo'shish"}
      onClose={onClose}
      className="max-w-md"
    >
      <form id="teacher-form" className="space-y-4" onSubmit={(event) => void submitForm(event)}>
        <Input
          label="Ism va familiya"
          placeholder="Masalan: Alisher Navoiy"
          error={errors.fullName?.message}
          {...register('fullName')}
        />

        <Input
          label="Email"
          type="email"
          placeholder="alisher@matonat.uz"
          disabled={isEditing}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Telefon"
          placeholder="+998901234567"
          error={errors.phone?.message}
          {...register('phone')}
        />

        <Input
          label="Fan"
          placeholder="Masalan: Matematika"
          error={errors.subject?.message}
          {...register('subject')}
        />

        <Input
          label="Oylik maosh"
          type="number"
          placeholder="0"
          error={errors.salary?.message}
          {...register('salary')}
        />

        <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-5">
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            Bekor qilish
          </Button>
          <Button type="submit" loading={submitting}>
            {isEditing ? 'Saqlash' : "Qo'shish"}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
