// src/router/index.tsx
import { lazy, Suspense, type ReactNode } from 'react'
import { Navigate, type RouteObject, matchPath } from 'react-router-dom'
import type { Role } from '../types'
import { ROLE } from '../types'
import SplashScreen from '../components/ui/SplashScreen'

// Lazy imports — circular import muammosini hal qiladi
const AppLayout = lazy(() => import('../components/layout/AppLayout'))
const ProtectedRoute = lazy(() => import('../components/guards/ProtectedRoute'))
const LoginPage = lazy(() => import('../pages/auth/LoginPage'))
const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage'))
const CoursesPage = lazy(() => import('../pages/courses/CoursesPage'))
const GroupsPage = lazy(() => import('../pages/groups/GroupsPage'))
const GroupDetailPage = lazy(() => import('../pages/groups/GroupDetailPage'))
const StudentsPage = lazy(() => import('../pages/students/StudentsPage'))
const StudentDetailPage = lazy(() => import('../pages/students/StudentDetailPage'))
const TeachersPage = lazy(() => import('../pages/teachers/TeachersPage'))
const AttendancePage = lazy(() => import('../pages/attendance/AttendancePage'))
const PaymentsPage = lazy(() => import('../pages/payments/PaymentsPage'))
const AnnouncementsPage = lazy(() => import('../pages/announcements/AnnouncementsPage'))
const SettingsPage = lazy(() => import('../pages/settings/SettingsPage'))
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'))

// Suspense wrapper
const withSuspense = (component: ReactNode) => (
  <Suspense fallback={<div className="flex min-h-[200px] items-center justify-center"><SplashScreen variant="inline" /></div>}>
    {component}
  </Suspense>
)

const withProtection = (children: ReactNode, allowedRoles?: Role[]) => (
  <ProtectedRoute allowedRoles={allowedRoles}>
    {children}
  </ProtectedRoute>
)

export interface AppRouteMeta {
  path: string
  title: string
  allowedRoles?: Role[]
}

export const protectedRouteMeta: AppRouteMeta[] = [
  { path: '/dashboard', title: 'Boshqaruv paneli' },
  { path: '/students', title: "O'quvchilar", allowedRoles: [ROLE.ADMIN, ROLE.SUPER_ADMIN] },
  { path: '/students/:id', title: "O'quvchi ma'lumotlari", allowedRoles: [ROLE.ADMIN, ROLE.SUPER_ADMIN] },
  { path: '/courses', title: 'Kurslar', allowedRoles: [ROLE.ADMIN, ROLE.SUPER_ADMIN] },
  { path: '/groups', title: 'Guruhlar', allowedRoles: [ROLE.ADMIN, ROLE.SUPER_ADMIN, ROLE.TEACHER] },
  { path: '/groups/:id', title: 'Guruh ma\'lumotlari', allowedRoles: [ROLE.ADMIN, ROLE.SUPER_ADMIN, ROLE.TEACHER] },
  { path: '/teachers', title: "O'qituvchilar", allowedRoles: [ROLE.ADMIN, ROLE.SUPER_ADMIN] },
  { path: '/attendance', title: 'Davomat', allowedRoles: [ROLE.ADMIN, ROLE.SUPER_ADMIN, ROLE.TEACHER] },
  { path: '/payments', title: "To'lovlar", allowedRoles: [ROLE.ADMIN, ROLE.SUPER_ADMIN] },
  { path: '/announcements', title: "E'lonlar", allowedRoles: [ROLE.ADMIN, ROLE.SUPER_ADMIN] },
  { path: '/settings', title: 'Sozlamalar', allowedRoles: [ROLE.SUPER_ADMIN] },
]

export const appRoutes: RouteObject[] = [
  { path: '/login', element: withSuspense(<LoginPage />) },
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  {
    element: withSuspense(withProtection(<AppLayout />)),
    children: [
      { path: '/dashboard', element: withSuspense(<DashboardPage />) },
      { path: '/students', element: withSuspense(withProtection(<StudentsPage />, [ROLE.ADMIN, ROLE.SUPER_ADMIN])) },
      { path: '/students/:id', element: withSuspense(withProtection(<StudentDetailPage />, [ROLE.ADMIN, ROLE.SUPER_ADMIN])) },
      { path: '/courses', element: withSuspense(withProtection(<CoursesPage />, [ROLE.ADMIN, ROLE.SUPER_ADMIN])) },
      { path: '/groups', element: withSuspense(withProtection(<GroupsPage />, [ROLE.ADMIN, ROLE.SUPER_ADMIN, ROLE.TEACHER])) },
      { path: '/groups/:id', element: withSuspense(withProtection(<GroupDetailPage />, [ROLE.ADMIN, ROLE.SUPER_ADMIN, ROLE.TEACHER])) },
      { path: '/teachers', element: withSuspense(withProtection(<TeachersPage />, [ROLE.ADMIN, ROLE.SUPER_ADMIN])) },
      { path: '/attendance', element: withSuspense(withProtection(<AttendancePage />, [ROLE.ADMIN, ROLE.SUPER_ADMIN, ROLE.TEACHER])) },
      { path: '/payments', element: withSuspense(withProtection(<PaymentsPage />, [ROLE.ADMIN, ROLE.SUPER_ADMIN])) },
      { path: '/announcements', element: withSuspense(withProtection(<AnnouncementsPage />, [ROLE.ADMIN, ROLE.SUPER_ADMIN])) },
      { path: '/settings', element: withSuspense(withProtection(<SettingsPage />, [ROLE.SUPER_ADMIN])) },
    ],
  },
  { path: '*', element: withSuspense(<NotFoundPage />) },
]

export const getPageTitle = (pathname: string) => {
  const matched = protectedRouteMeta.find((r) => matchPath(r.path, pathname))
  return matched?.title ?? 'Matonat'
}
