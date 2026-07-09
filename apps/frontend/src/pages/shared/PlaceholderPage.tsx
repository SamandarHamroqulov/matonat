import { Link } from 'react-router-dom'

interface PlaceholderPageProps {
  title: string
  description: string
}

function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5 md:p-6">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-primary-500">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">{description}</p>
        </div>
        <Link
          to="/dashboard"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary-500 px-4 text-sm font-medium text-white transition hover:bg-primary-600"
        >
          Bosh sahifaga qaytish
        </Link>
      </div>
    </section>
  )
}

export default PlaceholderPage
