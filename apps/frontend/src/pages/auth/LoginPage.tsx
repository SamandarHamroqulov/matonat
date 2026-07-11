import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { login } from '../../api/auth'
import { useAuthStore } from '../../store/auth.store'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email kiritilishi shart')
    .email("Email manzili noto'g'ri"),
  password: z.string().min(6, "Parol kamida 6 ta belgidan iborat bo'lishi kerak"),
})

type LoginFormValues = z.infer<typeof loginSchema>

const EyeIcon = ({ open }: { open: boolean }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className="h-[18px] w-[18px]"
  >
    <path
      d={
        open
          ? 'M2.25 12S5.25 6.75 12 6.75 21.75 12 21.75 12 18.75 17.25 12 17.25 2.25 12 2.25 12Z'
          : 'M3 3L21 21'
      }
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {open ? (
      <circle cx="12" cy="12" r="3" />
    ) : (
      <>
        <path
          d="M10.585 10.587A2 2 0 0 0 13.414 13.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9.88 5.585A10.78 10.78 0 0 1 12 5.25c6.75 0 9.75 6.75 9.75 6.75a16.826 16.826 0 0 1-3.275 4.359M6.61 6.61A16.17 16.17 0 0 0 2.25 12s3 6.75 9.75 6.75a10.7 10.7 0 0 0 4.112-.798"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    )}
  </svg>
)

function LoginPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
const setAuth = useAuthStore((state) => state.setAuth)
const setLoading = useAuthStore((state) => state.setLoading)
const isLoading = useAuthStore((state) => state.isLoading)

  const defaultValues = useMemo<LoginFormValues>(
    () => ({
      email: '',
      password: '',
    }),
    [],
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues,
  })

  const onSubmit = handleSubmit(async (values) => {
    try {
      setLoading(true)
      const response = await login(values)
      setAuth(response.user, response.accessToken)
      toast.success('Xush kelibsiz')
      navigate('/dashboard', { replace: true })
    } catch {
      toast.error("Email yoki parol noto'g'ri")
    } finally {
      setLoading(false)
    }
  })

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-[420px] rounded-xl border border-gray-200 bg-white p-8">
        <div className="mb-8 border-l-4 border-primary-500 pl-4">
          <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-primary-500">
            Matonat
          </h1>
          <p className="mt-1 text-sm text-gray-500">O'quv markazi</p>
        </div>

        <form className="space-y-5" onSubmit={onSubmit} noValidate>
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="admin@matonat.uz"
              error={errors.email?.message}
              {...register('email')}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Parol
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="off"
                className="h-10 w-full rounded-md border border-gray-300 px-3 pr-11 text-sm text-gray-900 transition placeholder:text-gray-400 hover:border-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15"
                placeholder="Parolingizni kiriting"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-md text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
                aria-label={showPassword ? 'Parolni yashirish' : "Parolni ko'rsatish"}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
            {errors.password ? (
              <p className="mt-2 text-xs text-red-600">{errors.password.message}</p>
            ) : null}
          </div>

          <Button type="submit" loading={isLoading} className="w-full">
            {isLoading ? 'Yuklanmoqda...' : 'Kirish'}
          </Button>
        </form>
      </div>
    </main>
  )
}

export default LoginPage
