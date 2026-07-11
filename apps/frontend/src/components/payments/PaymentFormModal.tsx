import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { CreatePaymentPayload } from '../../api/payments'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Modal from '../ui/Modal'
import { getStudents } from '../../api/students'
import type { Student } from '../../types'

const paymentSchema = z.object({
  studentId: z.string().min(1, 'O\'quvchi tanlanishi shart'),
  amount: z.coerce.number().min(1, 'To\'lov summasi noldan katta bo\'lishi kerak'),
  method: z.enum(['CASH', 'CARD', 'TRANSFER'] as const),
  month: z.string().min(1, 'Oy tanlanishi shart'),
  note: z.string().optional(),
})

type PaymentFormValues = z.infer<typeof paymentSchema>

interface PaymentFormModalProps {
  isOpen: boolean
  submitting: boolean
  onClose: () => void
  onSubmit: (payload: CreatePaymentPayload) => Promise<void>
}

export default function PaymentFormModal({
  isOpen,
  submitting,
  onClose,
  onSubmit,
}: PaymentFormModalProps) {
  const [students, setStudents] = useState<Student[]>([])
  const [loadingInitial, setLoadingInitial] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      studentId: '',
      amount: 0,
      method: 'CASH',
      month: new Date().toISOString().slice(0, 7),
      note: '',
    },
  })

  const selectedStudentId = watch('studentId')
  const selectedStudent = students.find((s) => s.id === selectedStudentId)

  useEffect(() => {
    let active = true
    async function init() {
      try {
        setLoadingInitial(true)
        const [st] = await Promise.all([
          getStudents({ limit: 2000, page: 1 }), // get a large list of students
        ])
        if (active) {
          setStudents(st.data)
        }
      } catch (err) {
         // handle
      } finally {
        if (active) {
          setLoadingInitial(false)
        }
      }
    }

    if (isOpen) {
      void init()
      reset({
        studentId: '',
        amount: 0,
        method: 'CASH',
        month: new Date().toISOString().slice(0, 7),
        note: '',
      })
    }
    return () => { active = false }
  }, [isOpen, reset])

  const handleFormSubmit = async (data: PaymentFormValues) => {
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
      title="To'lov qabul qilish"
      onClose={onClose}
      className="max-w-md"
    >
      <form id="payment-form" onSubmit={(e) => void handleSubmit(handleFormSubmit)(e)} className="space-y-4">
        {loadingInitial ? (
          <p className="text-sm text-gray-500">Ma'lumotlar yuklanmoqda...</p>
        ) : (
          <>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">O'quvchi</label>
              <select
                {...register('studentId')}
                className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/15"
              >
                <option value="">-- Tanlang --</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>{s.fullName}</option>
                ))}
              </select>
              {errors.studentId && <p className="mt-1 text-xs text-red-600">{errors.studentId.message}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Guruh</label>
              <div className="h-10 rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                {selectedStudent?.group?.name ?? (selectedStudentId ? "Guruh biriktirilmagan" : "Avval o'quvchini tanlang")}
              </div>
              {selectedStudentId && !selectedStudent?.group ? (
                <p className="mt-1 text-xs text-amber-600">Bu o'quvchi guruhga biriktirilmagan</p>
              ) : null}
            </div>

            <Input
              label="Summa (so'm)"
              type="number"
              {...register('amount')}
              error={errors.amount?.message}
              placeholder="0"
            />

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">To'lov usuli</label>
              <div className="grid grid-cols-3 gap-3">
                <label className="flex cursor-pointer items-center justify-center rounded-md border border-gray-200 p-3 text-sm transition hover:bg-gray-50 has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50 has-[:checked]:text-primary-700 font-medium">
                  <input type="radio" value="CASH" {...register('method')} className="sr-only" />
                  Naqd pul
                </label>
                <label className="flex cursor-pointer items-center justify-center rounded-md border border-gray-200 p-3 text-sm transition hover:bg-gray-50 has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50 has-[:checked]:text-primary-700 font-medium">
                  <input type="radio" value="CARD" {...register('method')} className="sr-only" />
                  Plastik orqali
                </label>
                <label className="flex cursor-pointer items-center justify-center rounded-md border border-gray-200 p-3 text-sm transition hover:bg-gray-50 has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50 has-[:checked]:text-primary-700 font-medium">
                  <input type="radio" value="TRANSFER" {...register('method')} className="sr-only" />
                  O'tkazma
                </label>
              </div>
              {errors.method && <p className="mt-1 text-xs text-red-600">{errors.method.message}</p>}
            </div>

            <Input
              label="Oy"
              type="month"
              {...register('month')}
              error={errors.month?.message}
            />

            <Input
              label="Izoh (ixtiyoriy)"
              {...register('note')}
              error={errors.note?.message}
              placeholder="Qo'shimcha ma'lumotlar"
            />
          </>
        )}

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-200 pt-5">
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            Bekor qilish
          </Button>
          <Button type="submit" loading={submitting} disabled={loadingInitial || !selectedStudent?.group}>
            To'lovni saqlash
          </Button>
        </div>
      </form>
    </Modal>
  )
}
