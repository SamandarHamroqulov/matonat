import { useEffect, useState } from 'react'
import Button from '../ui/Button'

interface TeacherCredentialsModalProps {
  isOpen: boolean
  login: string
  password: string
  onClose: () => void
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 9h10v10H9z" />
      <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="m3 3 18 18" strokeLinecap="round" />
      <path d="M10.6 5.2A9.9 9.9 0 0 1 12 5c6.5 0 10 7 10 7a17.8 17.8 0 0 1-3.1 4.2" />
      <path d="M6.2 6.2C3.8 8 2 12 2 12s3.5 7 10 7a10 10 0 0 0 4.8-1.2" />
    </svg>
  )
}

export default function TeacherCredentialsModal({
  isOpen,
  login,
  password,
  onClose,
}: TeacherCredentialsModalProps) {
  const [copied, setCopied] = useState<'' | 'login' | 'password'>('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setCopied('')
      setShowPassword(false)
    }
  }, [isOpen])

  const handleCopy = async (value: string, field: 'login' | 'password') => {
    await navigator.clipboard.writeText(value)
    setCopied(field)
    window.setTimeout(() => setCopied(''), 2000)
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4">
      <div className="w-full max-w-lg rounded-xl border border-gray-200 bg-white shadow-2xl">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-900">O&apos;qituvchi ma&apos;lumotlari</h2>
        </div>

        <div className="px-5 py-5">
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Bu ma&apos;lumotlar faqat bir marta ko&apos;rsatiladi. Hoziroq nusxa oling!
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Login</label>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={login}
                  className="h-10 flex-1 rounded-md border border-gray-300 bg-gray-50 px-3 font-mono text-sm text-gray-900"
                />
                <Button
                  type="button"
                  variant="secondary"
                  icon={<CopyIcon />}
                  onClick={() => void handleCopy(login, 'login')}
                >
                  {copied === 'login' ? 'Nusxalandi ✓' : 'Nusxa'}
                </Button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Parol</label>
              <div className="flex gap-2">
                <input
                  readOnly
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  className="h-10 flex-1 rounded-md border border-gray-300 bg-gray-50 px-3 font-mono text-sm text-gray-900"
                />
                <Button
                  type="button"
                  variant="secondary"
                  icon={<CopyIcon />}
                  onClick={() => void handleCopy(password, 'password')}
                >
                  {copied === 'password' ? 'Nusxalandi ✓' : 'Nusxa'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  icon={showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  onClick={() => setShowPassword((current) => !current)}
                >
                  {showPassword ? 'Yashirish' : 'Ko&apos;rsatish'}
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end border-t border-gray-200 pt-4">
            <Button type="button" onClick={onClose}>
              Yopish
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
