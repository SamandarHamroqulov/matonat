import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-lg rounded-lg border border-gray-200 bg-white p-8 text-center">
        <p className="text-sm font-medium text-accent-600">404</p>
        <h1 className="mt-2 text-2xl font-semibold text-primary-500">Sahifa topilmadi</h1>
        <p className="mt-3 text-sm leading-6 text-gray-500">
          Siz izlayotgan sahifa mavjud emas yoki boshqa manzilga ko'chirilgan bo'lishi mumkin.
        </p>
        <Link
          to="/dashboard"
          className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-primary-500 px-4 text-sm font-medium text-white transition hover:bg-primary-600"
        >
          Bosh sahifaga o'tish
        </Link>
      </div>
    </main>
  )
}

export default NotFoundPage
