import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Skeleton from '../../components/ui/Skeleton'
import Badge from '../../components/ui/Badge'
import Table, { type TableColumn } from '../../components/ui/Table'
import {
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncements,
  type AnnouncementItem,
  type CreateAnnouncementPayload,
} from '../../api/announcements'

function AnnouncementsPage() {
  const [items, setItems] = useState<AnnouncementItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<AnnouncementItem | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [sendToBot, setSendToBot] = useState(false)

  const loadAnnouncements = async () => {
    try {
      setIsLoading(true)
      setError(null)
      setItems(await getAnnouncements())
    } catch {
      setError("E'lonlarni yuklab bo'lmadi")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadAnnouncements()
  }, [])

  const columns = useMemo<TableColumn<AnnouncementItem>[]>(
    () => [
      {
        key: 'title',
        label: 'Sarlavha',
        render: (row) => (
          <div>
            <div className="font-medium text-gray-900">{row.title}</div>
            <div className="mt-1 text-sm text-gray-500 line-clamp-2">{row.content}</div>
          </div>
        ),
      },
      {
        key: 'author',
        label: 'Muallif',
        render: (row) => row.author?.fullName ?? '—',
      },
      {
        key: 'bot',
        label: 'Botga yuborish',
        render: (row) => (
          <Badge variant={row.sendToBot ? 'warning' : 'gray'}>
            {row.sendToBot ? 'Ha' : 'Yo‘q'}
          </Badge>
        ),
      },
      {
        key: 'date',
        label: 'Sana',
        render: (row) => new Intl.DateTimeFormat('uz-UZ', { dateStyle: 'medium' }).format(new Date(row.publishedAt)),
      },
      {
        key: 'actions',
        label: '',
        render: (row) => (
          <button
            type="button"
            onClick={() => setDeleteTarget(row)}
            className="text-sm font-medium text-red-600 transition hover:text-red-700"
          >
            O'chirish
          </button>
        ),
      },
    ],
    [],
  )

  const handleCreate = async () => {
    const payload: CreateAnnouncementPayload = {
      title: title.trim(),
      content: content.trim(),
      sendToBot,
    }

    try {
      setSubmitting(true)
      await createAnnouncement(payload)
      toast.success("E'lon saqlandi")
      setFormOpen(false)
      setTitle('')
      setContent('')
      setSendToBot(false)
      await loadAnnouncements()
    } catch {
      toast.error("E'lonni saqlab bo'lmadi")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) {
      return
    }

    try {
      setDeleting(true)
      await deleteAnnouncement(deleteTarget.id)
      toast.success("E'lon o'chirildi")
      setDeleteTarget(null)
      await loadAnnouncements()
    } catch {
      toast.error("E'loni o'chirib bo'lmadi")
    } finally {
      setDeleting(false)
    }
  }

  if (error) {
    return (
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-primary-500">E'lonlar yuklanmadi</h2>
        <p className="mt-2 text-sm leading-6 text-gray-500">{error}</p>
        <Button type="button" onClick={() => void loadAnnouncements()} className="mt-5">
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
            <h2 className="text-xl font-semibold text-primary-500">E'lonlar</h2>
            <p className="mt-1 text-sm text-gray-500">
              Ichki e'lonlarni yarating va zarur bo'lsa botga yuboring
            </p>
          </div>
          <Button type="button" onClick={() => setFormOpen(true)}>
            Yangi e'lon
          </Button>
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white">
        {isLoading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-20" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-500">Hozircha e'lonlar yo'q</div>
        ) : (
          <Table
            columns={columns}
            data={items}
            rowKey={(row) => row.id}
            emptyState={<div className="p-10 text-center text-sm text-gray-500">Hozircha e'lonlar yo'q</div>}
          />
        )}
      </section>

      <Modal
        isOpen={formOpen}
        title="Yangi e'lon"
        onClose={() => setFormOpen(false)}
        className="max-w-2xl"
        footer={
          <>
            <Button type="button" variant="secondary" onClick={() => setFormOpen(false)} disabled={submitting}>
              Bekor qilish
            </Button>
            <Button type="button" onClick={() => void handleCreate()} loading={submitting}>
              Saqlash
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Sarlavha</label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/15"
              placeholder="Masalan, Dars jadvali o'zgardi"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Matn</label>
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={6}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/15"
              placeholder="E'lon matnini kiriting"
            />
          </div>
          <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={sendToBot}
              onChange={(event) => setSendToBot(event.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
            />
            Ota-onalarga bot orqali yuborish
          </label>
        </div>
      </Modal>

      <Modal
        isOpen={deleteTarget !== null}
        title="E'loni o'chirish"
        onClose={() => setDeleteTarget(null)}
        footer={
          <>
            <Button type="button" variant="secondary" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Bekor qilish
            </Button>
            <Button type="button" variant="danger" loading={deleting} onClick={() => void handleDelete()}>
              O'chirish
            </Button>
          </>
        }
      >
        <p className="text-sm leading-6 text-gray-600">
          <span className="font-medium text-gray-900">{deleteTarget?.title}</span> e'lonini o'chirmoqchimisiz?
        </p>
      </Modal>
    </div>
  )
}

export default AnnouncementsPage
