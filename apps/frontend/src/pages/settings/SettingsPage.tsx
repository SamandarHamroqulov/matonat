import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Skeleton from '../../components/ui/Skeleton'
import { useAuthStore } from '../../store/auth.store'
import { changePassword, getMe, updateMe } from '../../api/users'
import type { User } from '../../types'

const profileSchema = z.object({
  fullName: z.string().min(2, 'Ism kamida 2 ta belgidan iborat bo\'lishi kerak'),
  phone: z.string().optional(),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Joriy parol kerak'),
  newPassword: z.string().min(8, 'Yangi parol kamida 8 ta belgidan iborat bo\'lishi kerak'),
})

type ProfileValues = z.infer<typeof profileSchema>
type PasswordValues = z.infer<typeof passwordSchema>

function SettingsPage() {
  const navigate = useNavigate()
  const authUser = useAuthStore((state) => state.user)
  const setAuth = useAuthStore((state) => state.setAuth)
  const logout = useAuthStore((state) => state.logout)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      phone: '',
    },
  })

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
    },
  })

  useEffect(() => {
    let active = true

    const loadUser = async () => {
      try {
        setIsLoading(true)
        const response = await getMe()
        if (!active) {
          return
        }
        setUser(response)
        profileForm.reset({
          fullName: response.fullName,
          phone: response.phone ?? '',
        })
      } catch {
        if (active) {
          toast.error('Profil ma\'lumotlarini yuklab bo\'lmadi')
        }
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    void loadUser()

    return () => {
      active = false
    }
  }, [profileForm])

  const handleProfileSubmit = profileForm.handleSubmit(async (values) => {
    try {
      setSavingProfile(true)
      const updated = await updateMe(values)
      setUser(updated)
      if (authUser) {
        setAuth(
          {
            ...authUser,
            fullName: updated.fullName,
            phone: updated.phone ?? null,
          },
          useAuthStore.getState().accessToken ?? '',
        )
      }
      toast.success('Profil yangilandi')
    } catch {
      toast.error('Profilni yangilab bo\'lmadi')
    } finally {
      setSavingProfile(false)
    }
  })

  const handlePasswordSubmit = passwordForm.handleSubmit(async (values) => {
    try {
      setChangingPassword(true)
      await changePassword(values)
      passwordForm.reset({ currentPassword: '', newPassword: '' })
      toast.success('Parol yangilandi, qayta kirish talab qilinadi')
      logout()
      navigate('/login', { replace: true })
    } catch {
      toast.error('Parolni yangilab bo\'lmadi')
    } finally {
      setChangingPassword(false)
    }
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-52" />
        <Skeleton className="h-52" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-primary-500">Sozlamalar</h2>
        <p className="mt-1 text-sm text-gray-500">
          Shaxsiy profil va parolni boshqaring
        </p>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="text-base font-semibold text-gray-900">Profil ma'lumotlari</h3>
        <form className="mt-5 space-y-4" onSubmit={handleProfileSubmit} noValidate>
          <Input
            label="To'liq ism"
            {...profileForm.register('fullName')}
            error={profileForm.formState.errors.fullName?.message}
          />
          <Input
            label="Telefon"
            {...profileForm.register('phone')}
            error={profileForm.formState.errors.phone?.message}
            helperText="Ixtiyoriy"
          />
          <div className="flex items-center justify-end">
            <Button type="submit" loading={savingProfile}>
              Saqlash
            </Button>
          </div>
        </form>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="text-base font-semibold text-gray-900">Parolni almashtirish</h3>
        <form className="mt-5 space-y-4" onSubmit={handlePasswordSubmit} noValidate>
          <Input
            label="Joriy parol"
            type="password"
            {...passwordForm.register('currentPassword')}
            error={passwordForm.formState.errors.currentPassword?.message}
          />
          <Input
            label="Yangi parol"
            type="password"
            {...passwordForm.register('newPassword')}
            error={passwordForm.formState.errors.newPassword?.message}
          />
          <div className="flex items-center justify-end">
            <Button type="submit" loading={changingPassword}>
              Parolni yangilash
            </Button>
          </div>
        </form>
      </section>

      <section className="rounded-lg border border-gray-200 bg-amber-50 p-6">
        <h3 className="text-base font-semibold text-amber-900">Hisob haqida</h3>
        <div className="mt-4 grid gap-3 text-sm text-amber-900 md:grid-cols-2">
          <div>Rol: {user?.role}</div>
          <div>Email: {user?.email}</div>
          <div>Holat: {user?.isActive ? 'Faol' : 'Nofaol'}</div>
          <div>Telefon: {user?.phone ?? 'Kiritilmagan'}</div>
        </div>
      </section>
    </div>
  )
}

export default SettingsPage
