import type { ReactNode } from 'react'
import { Navigate, type RouteObject, matchPath } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import ProtectedRoute from '../components/guards/ProtectedRoute'
import LoginPage from '../pages/auth/LoginPage'
import DashboardPage from '../pages/dashboard/DashboardPage'
import GroupsPage from '../pages/groups/GroupsPage'
import GroupDetailPage from '../pages/groups/GroupDetailPage'
import StudentsPage from '../pages/students/StudentsPage'
import StudentDetailPage from '../pages/students/StudentDetailPage'
import TeachersPage from '../pages/teachers/TeachersPage'
import AttendancePage from '../pages/attendance/AttendancePage'
import PaymentsPage from '../pages/payments/PaymentsPage'
import AnnouncementsPage from '../pages/announcements/AnnouncementsPage'
import SettingsPage from '../pages/settings/SettingsPage'
import NotFoundPage from '../pages/NotFoundPage'
import type { Role } from '../types'
import { ROLE } from '../types'

export interface AppRouteMeta {
  path: string
  title: string
  allowedRoles?: Role[]
}

export const protectedRouteMeta: AppRouteMeta[] = [
  { path: '/dashboard', title: 'Boshqaruv paneli' },
  {
    path: '/students',
    title: "O'quvchilar",
    allowedRoles: [ROLE.ADMIN, ROLE.SUPER_ADMIN],
  },
  {
    path: '/students/:id',
    title: "O'quvchi ma'lumotlari",
    allowedRoles: [ROLE.ADMIN, ROLE.SUPER_ADMIN],
  },
  {
    path: '/groups',
    title: 'Guruhlar',
    allowedRoles: [ROLE.ADMIN, ROLE.SUPER_ADMIN, ROLE.TEACHER],
  },
  {
    path: '/groups/:id',
    title: 'Guruh ma`lumotlari',
    allowedRoles: [ROLE.ADMIN, ROLE.SUPER_ADMIN, ROLE.TEACHER],
  },
  {
    path: '/teachers',
    title: "O'qituvchilar",
    allowedRoles: [ROLE.ADMIN, ROLE.SUPER_ADMIN],
  },
  {
    path: '/attendance',
    title: 'Davomat',
    allowedRoles: [ROLE.ADMIN, ROLE.SUPER_ADMIN, ROLE.TEACHER],
  },
  {
    path: '/payments',
    title: "To'lovlar",
    allowedRoles: [ROLE.ADMIN, ROLE.SUPER_ADMIN],
  },
  {
    path: '/announcements',
    title: "E'lonlar",
    allowedRoles: [ROLE.ADMIN, ROLE.SUPER_ADMIN],
  },
  {
    path: '/settings',
    title: 'Sozlamalar',
    allowedRoles: [ROLE.SUPER_ADMIN],
  },
]

const withProtection = (children: ReactNode, allowedRoles?: Role[]) => (
  <ProtectedRoute allowedRoles={allowedRoles}>
    {children}
  </ProtectedRoute>
)

export const appRoutes: RouteObject[] = [
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    element: withProtection(<AppLayout />),
    children: [
      {
        path: '/dashboard',
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/students',
        element: (
          <ProtectedRoute allowedRoles={[ROLE.ADMIN, ROLE.SUPER_ADMIN]}>
            <StudentsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/students/:id',
        element: (
          <ProtectedRoute allowedRoles={[ROLE.ADMIN, ROLE.SUPER_ADMIN]}>
            <StudentDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/groups',
        element: (
          <ProtectedRoute allowedRoles={[ROLE.ADMIN, ROLE.SUPER_ADMIN, ROLE.TEACHER]}>
            <GroupsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/groups/:id',
        element: (
          <ProtectedRoute allowedRoles={[ROLE.ADMIN, ROLE.SUPER_ADMIN, ROLE.TEACHER]}>
            <GroupDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/teachers',
        element: (
          <ProtectedRoute allowedRoles={[ROLE.ADMIN, ROLE.SUPER_ADMIN]}>
            <TeachersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/attendance',
        element: (
          <ProtectedRoute allowedRoles={[ROLE.ADMIN, ROLE.SUPER_ADMIN, ROLE.TEACHER]}>
            <AttendancePage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/payments',
        element: (
          <ProtectedRoute allowedRoles={[ROLE.ADMIN, ROLE.SUPER_ADMIN]}>
            <PaymentsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/announcements',
        element: (
          <ProtectedRoute allowedRoles={[ROLE.ADMIN, ROLE.SUPER_ADMIN]}>
            <AnnouncementsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/settings',
        element: (
          <ProtectedRoute allowedRoles={[ROLE.SUPER_ADMIN]}>
            <SettingsPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]

export const getPageTitle = (pathname: string) => {
  const matchedRoute = protectedRouteMeta.find((route) => matchPath(route.path, pathname))
  return matchedRoute?.title ?? 'Matonat'
}
