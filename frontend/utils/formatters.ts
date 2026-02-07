export function formatDate(date: string | Date, locale = 'pl'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatTime(date: string | Date, locale = 'pl'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDateTime(date: string | Date, locale = 'pl'): string {
  return `${formatDate(date, locale)}, ${formatTime(date, locale)}`
}

export function formatPrice(amount: number, currency = 'PLN'): string {
  return `${amount.toFixed(2)} ${currency}`
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}
