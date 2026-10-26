import 'server-only'
import { queryGrowthTable } from '@/lib/supabase-growth'
import { getGmailAccessToken, getGmailConnections } from '@/lib/google-oauth-finance'
import type { GrowthMeeting } from '@/lib/growth-admin'

export type BusinessMeeting = {
  id: string
  title: string
  starts_at: string
  ends_at?: string
  url?: string
  account: string
  source: 'google_calendar' | 'crm'
  response: 'accepted' | 'needsAction' | 'tentative' | 'declined' | 'unknown'
  status: string
  calendar_event_id?: string
}
export type MeetingMailSignal = { id: string; subject: string; received_at: string; account: string; url: string }
export type MeetingAgenda = {
  meetings: BusinessMeeting[]
  mail_signals: MeetingMailSignal[]
  calendar_authorized: number
  calendar_reconnect: string[]
  checked_accounts: number
  errors: string[]
  checked_at: string
}

type GoogleEvent = {
  id?: string
  summary?: string
  status?: string
  eventType?: string
  htmlLink?: string
  start?: { dateTime?: string; date?: string }
  end?: { dateTime?: string; date?: string }
  attendees?: Array<{ self?: boolean; email?: string; responseStatus?: string }>
  organizer?: { self?: boolean }
}
type GmailMessage = { id?: string; threadId?: string; labelIds?: string[]; internalDate?: string; payload?: { headers?: Array<{name: string; value: string}> } }

const currentWindow = () => {
  const now = Date.now()
  return {
    min: new Date(now - 90 * 86400000).toISOString(),
    max: new Date(now + 150 * 86400000).toISOString(),
    gmailAfter: new Date(now - 90 * 86400000).toISOString().slice(0,10).replaceAll('-', '/'),
  }
}
const str = (value: unknown) => typeof value === 'string' ? value : ''
const dateOk = (value: string) => Number.isFinite(new Date(value).getTime())
const timeInWindow = (value: string, min: string, max: string) => dateOk(value) && new Date(value).getTime() >= new Date(min).getTime() && new Date(value).getTime() <= new Date(max).getTime()
const isAllowedUrl = (value: string) => {
  try { return new URL(value).protocol === 'https:' ? value : '' } catch { return '' }
}
function responseLabel(raw: string): BusinessMeeting['response'] {
  return ['accepted','needsAction','tentative','declined'].includes(raw) ? raw as BusinessMeeting['response'] : 'unknown'
}
async function fetchGoogleJson<T>(url: string, token: string): Promise<T> {
  const response = await fetch(url, {headers:{Authorization:'Bearer ' + token},cache:'no-store',signal:AbortSignal.timeout(12000)})
  if (!response.ok) throw new Error('Google API returned ' + response.status)
  return response.json() as Promise<T>
}

export async function getMeetingAgenda(): Promise<MeetingAgenda> {
  const now = new Date().toISOString()
  const { min, max, gmailAfter } = currentWindow()
  const [crmRows, connections] = await Promise.all([
    queryGrowthTable<GrowthMeeting>('crm_meetings', {tenant_id:'eq.sc-analytics',order:'starts_at.desc',limit:'250'}, {cacheSeconds:0})
      .catch(() => [] as GrowthMeeting[]),
    getGmailConnections().catch(() => [] as Array<Record<string,unknown>>),
  ])
  const meetings: BusinessMeeting[] = crmRows.filter(m => Boolean(m.starts_at) && !['cancelled','pending_confirmation','pending_reschedule'].includes(m.status) && timeInWindow(str(m.starts_at),min,max)).map(m => {
    const meta = m.metadata || {}
    return {
      id: 'crm:' + m.meeting_id,
      calendar_event_id: m.provider === 'google_calendar' ? (m.external_id || undefined) : undefined,
      title: str(meta.title || meta.summary || meta.meeting_title || meta.event_name) || 'Reunión comercial',
      starts_at: str(m.starts_at),
      ends_at: str(meta.ends_at || meta.end_at) || undefined,
      url: isAllowedUrl(str(m.booking_url)),
      account: 'CMI',
      source: 'crm' as const,
      response: responseLabel(str(meta.attendee_response || meta.response_status)),
      status: m.status,
    }
  })
  const mailSignals: MeetingMailSignal[] = []
  const reconnect: string[] = []
  const errors: string[] = []
  let calendarAuthorized = 0
  await Promise.all(connections.map(async connection => {
    const account = str(connection.provider_subject || connection.display_name)
    const scopes = Array.isArray(connection.scopes) ? connection.scopes.map(String) : []
    const calendarScope = scopes.some(s => s === 'https://www.googleapis.com/auth/calendar.readonly' || s === 'https://www.googleapis.com/auth/calendar.events.readonly')
    if (!calendarScope) reconnect.push(account)
    let token: string
    try { token = await getGmailAccessToken(connection) }
    catch { errors.push('No se pudo acceder a la conexión Google de ' + account + '.'); return }
    if (calendarScope) {
      try {
        const params = new URLSearchParams({
          timeMin:min,timeMax:max,maxResults:'250',singleEvents:'true',orderBy:'startTime',
          fields:'items(id,summary,status,eventType,htmlLink,start,end,attendees,organizer),nextPageToken',
        })
        const url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events?' + params.toString()
        const data = await fetchGoogleJson<{items?:GoogleEvent[]}>(url, token)
        calendarAuthorized += 1
        for (const event of data.items || []) {
          if (!event.id || event.status === 'cancelled' || event.eventType === 'outOfOffice' || event.eventType === 'focusTime' || /^SIN REUNI[ÓO]N/i.test(str(event.summary))) continue
          const hasGuests = (event.attendees || []).some(guest => !guest.self && guest.email?.toLowerCase() !== account.toLowerCase())
          if (!hasGuests && !/meeting|call|entrevista|reuni[oó]n|discovery|partner|partnership|cliente|client|workshop|demo/i.test(str(event.summary))) continue
          const start = str(event.start?.dateTime)
          if (!start || !dateOk(start)) continue // All-day reminders are not business meetings
          const self = event.attendees?.find(x => x.self || x.email?.toLowerCase() === account.toLowerCase())
          const response = responseLabel(str(self?.responseStatus || (event.organizer?.self ? 'accepted' : 'unknown')))
          if (response === 'declined') continue
          meetings.push({
            id: 'gcal:' + account + ':' + event.id, calendar_event_id: event.id,
            title: str(event.summary) || 'Evento de calendario',
            starts_at: start, ends_at: str(event.end?.dateTime) || undefined,
            url: isAllowedUrl(str(event.htmlLink)), account, source:'google_calendar',
            response, status:str(event.status) || 'unknown',
          })
        }
      } catch { errors.push('No se ha podido consultar Google Calendar para ' + account + '. Puede ser necesario reconectar con permiso de calendario.'); reconnect.push(account) }
    }
    // Gmail is a source of meeting suggestions, never proof of an accepted booking.
    try {
      const q = 'after:' + gmailAfter + ' (subject:invitation OR subject:confirmed OR subject:meeting OR subject:entrevista OR subject:reunión OR subject:discovery OR subject:calendly) -category:promotions -in:trash'
      const listUrl = 'https://gmail.googleapis.com/gmail/v1/users/me/messages?' + new URLSearchParams({q,maxResults:'24'}).toString()
      const list = await fetchGoogleJson<{messages?:Array<{id?:string}>}>(listUrl, token)
      const ids = (list.messages || []).slice(0,18).map(m => m.id).filter((id):id is string => Boolean(id))
      const details = await Promise.allSettled(ids.map(id => fetchGoogleJson<GmailMessage>(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages/' + encodeURIComponent(id) + '?format=metadata&metadataHeaders=Subject', token
      )))
      for (const result of details) {
        if (result.status !== 'fulfilled') continue
        const msg = result.value
        if (!msg.id || !msg.internalDate || (msg.labelIds || []).includes('SENT') || (msg.labelIds || []).includes('TRASH')) continue
        const subject = str(msg.payload?.headers?.find(h => h.name.toLowerCase() === 'subject')?.value)
        if (!/invitation|confirmed:|meeting|entrevista|reuni[oó]n|discovery|calendly|booking/i.test(subject)) continue
        const received = new Date(Number(msg.internalDate || 0)).toISOString()
        mailSignals.push({
          id:account + ':' + msg.id,subject,received_at:received,account,
          url:'https://mail.google.com/mail/u/?authuser=' + encodeURIComponent(account) + '#all/' + (msg.threadId || msg.id),
        })
      }
    } catch { errors.push('No se han podido revisar las invitaciones recientes de Gmail en ' + account + '.'); }
  }))
  // Prefer live Google Calendar for matching CRM bookings, and collapse cross-account duplicates.
  const ordered = [...meetings].sort((a,b) => a.starts_at.localeCompare(b.starts_at))
  const distinct = new Map<string,BusinessMeeting>()
  for (const event of ordered) {
    // A CRM copy and its Google Calendar invitation refer to the same booking;
    // match by immutable provider ID before falling back to date/title.
    const key = event.calendar_event_id ? 'calendar:' + event.calendar_event_id : new Date(event.starts_at).getTime() + ':' + event.title.trim().toLowerCase()
    const prior = distinct.get(key)
    if (!prior || (event.source === 'google_calendar' && prior.source !== 'google_calendar')) distinct.set(key,event)
  }
  const dedupMail = new Map<string,MeetingMailSignal>()
  for (const signal of mailSignals.sort((a,b) => b.received_at.localeCompare(a.received_at))) {
    const key = signal.account + ':' + signal.subject.toLowerCase()
    if (!dedupMail.has(key)) dedupMail.set(key,signal)
  }
  return {
    meetings:[...distinct.values()].sort((a,b) => a.starts_at.localeCompare(b.starts_at)),
    mail_signals:[...dedupMail.values()].slice(0,18),
    calendar_authorized:calendarAuthorized,
    calendar_reconnect:[...new Set(reconnect)],
    checked_accounts:connections.length,
    errors,checked_at:now,
  }
}
