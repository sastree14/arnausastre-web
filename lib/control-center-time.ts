export const CONTROL_CENTER_TIME_ZONE = 'Europe/Madrid'

type DateParts = {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
}

function parseLocalInput(value: string): DateParts {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value)
  if (!match) throw new Error('Invalid local datetime format')
  const [, y, mo, d, h, mi, s = '00'] = match
  const parts = {
    year: Number(y),
    month: Number(mo),
    day: Number(d),
    hour: Number(h),
    minute: Number(mi),
    second: Number(s),
  }
  const probe = new Date(Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second))
  if (
    probe.getUTCFullYear() !== parts.year ||
    probe.getUTCMonth() + 1 !== parts.month ||
    probe.getUTCDate() !== parts.day ||
    probe.getUTCHours() !== parts.hour ||
    probe.getUTCMinutes() !== parts.minute ||
    probe.getUTCSeconds() !== parts.second
  ) throw new Error('Invalid local datetime value')
  return parts
}

function partsInTimeZone(date: Date, timeZone = CONTROL_CENTER_TIME_ZONE): DateParts {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  })
  const map = new Map(formatter.formatToParts(date).map((part) => [part.type, part.value]))
  return {
    year: Number(map.get('year')),
    month: Number(map.get('month')),
    day: Number(map.get('day')),
    hour: Number(map.get('hour')),
    minute: Number(map.get('minute')),
    second: Number(map.get('second')),
  }
}

function offsetMinutesAt(date: Date, timeZone = CONTROL_CENTER_TIME_ZONE): number {
  const p = partsInTimeZone(date, timeZone)
  const renderedAsUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second)
  return Math.round((renderedAsUtc - date.getTime()) / 60000)
}

export function parseControlCenterDateTime(value: string): Date {
  const p = parseLocalInput(value)
  const wallClockUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second)
  let candidate = new Date(wallClockUtc)

  for (let i = 0; i < 4; i += 1) {
    const offsetMinutes = offsetMinutesAt(candidate)
    const next = new Date(wallClockUtc - offsetMinutes * 60000)
    if (next.getTime() === candidate.getTime()) break
    candidate = next
  }

  const roundTrip = partsInTimeZone(candidate)
  if (
    roundTrip.year !== p.year ||
    roundTrip.month !== p.month ||
    roundTrip.day !== p.day ||
    roundTrip.hour !== p.hour ||
    roundTrip.minute !== p.minute
  ) throw new Error('Selected time does not exist in Europe/Madrid because of a daylight-saving transition')

  return candidate
}

function pad(value: number) {
  return String(value).padStart(2, '0')
}

export function controlCenterDateKey(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const p = partsInTimeZone(date)
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`
}

export function toControlCenterDateTimeLocal(value?: string | null): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const p = partsInTimeZone(date)
  return `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}`
}

export function formatControlCenterDate(value?: string | null, withTime = false): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('es-ES', withTime
    ? { timeZone: CONTROL_CENTER_TIME_ZONE, day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }
    : { timeZone: CONTROL_CENTER_TIME_ZONE, day: '2-digit', month: 'short', year: 'numeric' })
}

export function addDaysToDateKey(key: string, days: number): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key)
  if (!match) return key
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]) + days, 12))
  return date.toISOString().slice(0, 10)
}

export function formatCalendarDateKey(key: string, part: 'weekday' | 'date'): string {
  const date = new Date(`${key}T12:00:00Z`)
  if (Number.isNaN(date.getTime())) return key
  return date.toLocaleDateString('es-ES', part === 'weekday'
    ? { timeZone: 'UTC', weekday: 'short' }
    : { timeZone: 'UTC', day: '2-digit', month: 'short' })
}
