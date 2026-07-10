import type { Student } from '../types'

export const toDateInputValue = (value?: string | null) => {
  if (!value) {
    return ''
  }

  return value.slice(0, 10)
}

export const toStudentFormValues = (student: Student) => {
  return {
    fullName: student.fullName,
    phone: student.phone ?? '',
    parentPhone: student.parentPhone,
    birthDate: toDateInputValue(student.birthDate),
    groupId: student.groupId ?? '',
  }
}
