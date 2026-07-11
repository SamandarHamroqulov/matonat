import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import PaymentFormModal from '../../components/payments/PaymentFormModal'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Pagination from '../../components/ui/Pagination'
import SearchInput from '../../components/ui/SearchInput'
import Table, { type TableColumn } from '../../components/ui/Table'
import { usePayments } from '../../hooks/usePayments'
import type { PaymentRecord, CreatePaymentPayload, PaymentMethod } from '../../api/payments'
import { formatDate, formatMoney } from '../../utils/format'

const methodLabels: Record<PaymentMethod, string> = {
  CASH: 'Naqd pul',
  CARD: 'Plastik karta',
  TRANSFER: 'O\'tkazma',
}

const methodColors: Record<PaymentMethod, 'success' | 'info' | 'warning'> = {
  CASH: 'success',
  CARD: 'info',
  TRANSFER: 'warning',
}

function PaymentsPage() {
  const {
    payments,
    total,
    page,
    limit,
    isLoading,
    error,
    search,
    method,
    setSearch,
    setMethod,
    setPage,
    refetch,
    addPayment,
  } = usePayments()

  const [formOpen, setFormOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const columns = useMemo<TableColumn<PaymentRecord>[]>(
    () => [
      {
        key: 'student',
        label: "O'quvchi",
        render: (row) => (
          <Link
            to={`/students/${row.student?.id}`}
            className="font-medium text-primary-500 transition hover:text-primary-600"
          >
            {row.student?.fullName ?? 'Noma\'lum'}
          </Link>
        ),
      },
      {
        key: 'amount',
        label: 'Summa',
        render: (row) => <span className="font-semibold">{formatMoney(Number(row.amount))}</span>,
      },
      {
        key: 'method',
        label: 'To\'lov usuli',
        render: (row) => (
          <Badge variant={methodColors[row.method]}>
            {methodLabels[row.method]}
          </Badge>
        ),
      },
      {
        key: 'month',
        label: 'Oy',
        render: (row) => formatDate(row.month),
      },
      {
        key: 'receiver',
        label: 'Qabul qildi',
        render: (row) => row.receivedBy?.fullName ?? 'Noma\'lum',
      },
    ],
    [],
  )

  const handleCreateOpen = () => {
    setFormOpen(true)
  }

  const handleFormSubmit = async (payload: CreatePaymentPayload) => {
    try {
      setSubmitting(true)
      await addPayment(payload)
      toast.success("To'lov muvaffaqiyatli saqlandi")
    } catch {
      toast.error("To'lovni saqlab bo'lmadi")
      throw new Error('submit failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (error) {
    return (
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-primary-500">To'lovlar yuklanmadi</h2>
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
            <h2 className="text-xl font-semibold text-primary-500">To'lovlar</h2>
            <p className="mt-1 text-sm text-gray-500">
              Barcha to'lovlar tarixini ko'rish va yangi to'lov qabul qilish
            </p>
          </div>
          <Button type="button" onClick={handleCreateOpen}>
            To'lov qabul qilish
          </Button>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-[minmax(0,1fr)_240px]">
          <SearchInput value={search} onSearch={setSearch} placeholder="O'quvchi yoki guruh nomi bo'yicha qidirish" />
          <div>
            <label htmlFor="method-filter" className="mb-2 block text-sm font-medium text-gray-700">
              To'lov usuli
            </label>
            <select
              id="method-filter"
              value={method}
              onChange={(event) => setMethod(event.target.value as PaymentMethod | '')}
              className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 transition hover:border-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/15"
            >
              <option value="">Barcha usullar</option>
              <option value="CASH">Naqd pul</option>
              <option value="CARD">Plastik karta</option>
              <option value="TRANSFER">O'tkazma</option>
            </select>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white">
        <Table
          columns={columns}
          data={payments}
          loading={isLoading}
          rowKey={(row) => row.id}
          emptyState={
             <div className="text-center">
               <p className="text-sm font-medium text-gray-700">Hozircha to'lovlar topilmadi</p>
               <Button type="button" className="mt-4" onClick={handleCreateOpen}>
                 Birinchi to'lovni qabul qilish
               </Button>
             </div>
          }
        />

        <div className="px-5 pb-5">
          <Pagination page={page} limit={limit} total={total} onPageChange={setPage} />
        </div>
      </section>

      <PaymentFormModal
        isOpen={formOpen}
        submitting={submitting}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />
    </div>
  )
}

export default PaymentsPage
