export const ROLE = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  TEACHER: 'TEACHER',
} as const

export type Role = (typeof ROLE)[keyof typeof ROLE]

export interface User {
  id: string
  email: string
  role: Role
  fullName: string
  phone?: string | null
  avatar?: string | null
  isActive?: boolean
}

export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface Student {
  id: string
  fullName: string
  phone: string | null
  parentPhone: string
  birthDate: string | null
  groupId: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  group?: {
    id: string
    name: string
  }
}

export interface CreateStudentDto {
  fullName: string
  phone?: string
  parentPhone: string
  birthDate?: string
  groupId?: string
}

export interface UpdateStudentDto {
  fullName?: string
  phone?: string
  parentPhone?: string
  birthDate?: string
  groupId?: string | null
  isActive?: boolean
}

export interface ListMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface PaginatedListResponse<T> {
  data: T[]
  meta: ListMeta
}

export interface Teacher {
  id: string
  userId: string
  subject: string
  salary: string
  hiredAt: string
  user: User
}

export interface Group {
  id: string
  name: string
  teacherId: string
  courseId: string
  capacity: number
  startDate: string
  endDate?: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  teacher?: Teacher
}

export interface Attendance {
  id: string
  studentId: string
  groupId: string
  date: string
  status: 'PRESENT' | 'ABSENT' | 'LATE'
  note?: string | null
  markedById: string
  createdAt: string
  student?: Student
  group?: Group
}

export interface Payment {
  id: string
  studentId: string
  amount: string
  month: string
  method: 'CASH' | 'CARD' | 'TRANSFER'
  note?: string | null
  paidAt: string
  receivedById: string
  student?: Student
}
