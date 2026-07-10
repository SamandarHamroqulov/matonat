import type { ReactNode } from 'react'
import Skeleton from './Skeleton'

export interface TableColumn<T> {
  key: keyof T | string
  label: string
  render?: (row: T) => ReactNode
}

interface TableProps<T> {
  columns: TableColumn<T>[]
  data: T[]
  loading?: boolean
  skeletonRows?: number
  emptyState?: ReactNode
  rowKey: (row: T) => string
}

function Table<T>({ columns, data, loading = false, skeletonRows = 6, emptyState, rowKey }: TableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-0">
        <thead>
          <tr className="text-left text-xs font-semibold uppercase tracking-[0.04em] text-gray-500">
            {columns.map((column) => (
              <th key={String(column.key)} className="px-5 py-3">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: skeletonRows }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column) => (
                  <td key={String(column.key)} className="px-5 py-4">
                    <Skeleton variant="text" className="h-4" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length > 0 ? (
            data.map((row, index) => (
              <tr key={rowKey(row)} className={index % 2 === 0 ? 'bg-gray-25' : 'bg-white'}>
                {columns.map((column) => (
                  <td key={String(column.key)} className="px-5 py-4 text-sm text-gray-600">
                    {column.render ? column.render(row) : String(row[column.key as keyof T] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-5 py-10 text-center">
                {emptyState}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default Table
