import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Student } from '../../types'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Modal from '../ui/Modal'
import type { CreateStudentPayload, UpdateStudentPayload } from '../../api/students'

const schema = z.object({
  fullName: z.string().min(2, "Kamida 2 ta harf"),
  phone: z.string().regex(/^\+998\d{9}$/, "Noto'g'ri format").optional().or(z.literal('')),
  parentPhone: z.string().regex(/^\+998\d{9}$/, "Noto'g'ri format: +998901234567"),
  birthDate: z.string().optional(),
  groupId: z.string().optional(),
})

type StudentFormValues = z.infer<typeof schema>

interface GroupOption {
  id: string
  name: string
}

interface StudentFormModalProps {
  isOpen: boolean
  student: Student | null
  groups: GroupOption[]
  groupsLoading?: boolean
  submitting?: boolean
  onClose: () => void
  onSubmit: (payload: CreateStudentPayload | UpdateStudentPayload) => Promise<void>
}

const defaultValues: StudentFormValues = {
  fullName: '',
  phone: '',
  parentPhone: '',
  birthDate: '',
  groupId: '',
}

const toFormValues = (student: Student): StudentFormValues => ({
  fullName: student.fullName,
  phone: student.phone ?? '',
  parentPhone: student.parentPhone,
  birthDate: student.birthDate ? student.birthDate.slice(0, 10) : '',
  groupId: student.groupId ?? '',
})

function StudentFormModal({
  isOpen,
  student,
  groups,
  groupsLoading = false,
  submitting = false,
  onClose,
  onSubmit,
}: StudentFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  useEffect(() => {
    if (!isOpen) {
      return
    }

    reset(student ? toFormValues(student) : defaultValues)
  }, [isOpen, reset, student])

  const submitForm = handleSubmit(async (values) => {
    const payload: CreateStudentPayload = {
      fullName: values.fullName.trim(),
      phone: values.phone?.trim() || undefined,
      parentPhone: values.parentPhone.trim(),
      birthDate: values.birthDate || undefined,
      groupId: values.groupId || undefined,
    }

    await onSubmit(payload)
    onClose()
  })

  return (
    <Modal
      isOpen={isOpen}
      title={student ? "O'quvchini tahrirlash" : "Yangi o'quvchi qo'shish"}
      onClose={onClose}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            Bekor qilish
          </Button>
          <Button type="submit" form="student-form" loading={submitting}>
            Saqlash
          </Button>
        </>
      }
    >
      <form id="student-form" className="space-y-4" onSubmit={submitForm} noValidate>
        <Input
          label="F.I.O"
          placeholder="Ali Valiyev"
          error={errors.fullName?.message}
          {...register('fullName')}
        />

        <Input
          label="Telefon"
          placeholder="+998901234567"
          error={errors.phone?.message}
          {...register('phone')}
        />

        <Input
          label="Ota-ona telefoni"
          placeholder="+998901234567"
          error={errors.parentPhone?.message}
          {...register('parentPhone')}
        />

        <Input
          label="Tug'ilgan sana"
          type="date"
          error={errors.birthDate?.message}
          {...register('birthDate')}
        />

        <div>
          <label htmlFor="groupId" className="mb-2 block text-sm font-medium text-gray-700">
            Guruh
          </label>
          <select
            id="groupId"
            className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 transition hover:border-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/15"
            disabled={groupsLoading}
            {...register('groupId')}
          >
            <option value="">Guruhsiz</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>
      </form>
    </Modal>
  )
}

export default StudentFormModal
