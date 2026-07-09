export const formatMoney = (value: number) =>
  `${value.toLocaleString('uz-UZ')} so'm`

export const formatDate = (value: string | Date) =>
  new Intl.DateTimeFormat('uz-UZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value))

export const formatTime = (value: string) => value.slice(0, 5)

export const formatPercentage = (value: number) => `${value}%`
