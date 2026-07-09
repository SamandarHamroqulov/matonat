import Button from './Button'

interface PaginationProps {
  page: number
  limit: number
  total: number
  onPageChange: (page: number) => void
}

const getPageNumbers = (page: number, totalPages: number) => {
  const start = Math.max(1, page - 1)
  const end = Math.min(totalPages, page + 1)
  const pages: number[] = []

  for (let current = start; current <= end; current += 1) {
    pages.push(current)
  }

  return pages
}

function Pagination({ page, limit, total, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit))
  const start = total === 0 ? 0 : (page - 1) * limit + 1
  const end = Math.min(page * limit, total)

  return (
    <div className="flex flex-col gap-4 border-t border-gray-200 pt-4 md:flex-row md:items-center md:justify-between">
      <p className="text-sm text-gray-500">
        {start} dan {end} tagacha, jami {total} ta
      </p>

      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
          Oldingi
        </Button>
        {getPageNumbers(page, totalPages).map((pageNumber) => (
          <button
            key={pageNumber}
            type="button"
            onClick={() => onPageChange(pageNumber)}
            className={`inline-flex h-9 min-w-9 items-center justify-center rounded-md px-3 text-sm font-medium transition ${
              pageNumber === page
                ? 'bg-primary-500 text-white'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            {pageNumber}
          </button>
        ))}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Keyingi
        </Button>
      </div>
    </div>
  )
}

export default Pagination
