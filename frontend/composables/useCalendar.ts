import type { Event } from '~/types'

export function useCalendar() {
  function formatDateForICS(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }

  function escapeICS(text: string): string {
    return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
  }

  function generateICS(event: Event): string {
    const startDate = new Date(event.datetime.start)
    const endDate = event.datetime.end ? new Date(event.datetime.end) : new Date(startDate.getTime() + 2 * 60 * 60 * 1000) // Default 2 hours

    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Bieszczady.plus//Event Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${event.id}@bieszczady.plus`,
      `DTSTAMP:${formatDateForICS(new Date())}`,
      `DTSTART:${formatDateForICS(startDate)}`,
      `DTEND:${formatDateForICS(endDate)}`,
      `SUMMARY:${escapeICS(event.title)}`,
      `DESCRIPTION:${escapeICS(event.description)}`,
      `LOCATION:${escapeICS(`${event.location.address}, ${event.venue_name}`)}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ]

    return lines.join('\r\n')
  }

  function downloadICS(event: Event) {
    const ics = generateICS(event)
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${event.title.replace(/[^a-z0-9]/gi, '_')}.ics`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return {
    generateICS,
    downloadICS,
  }
}
