'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export const CRM_REALTIME_EVENT = 'sc-growth-realtime-change'

type RealtimeConfig = {
  url: string
  publishableKey: string
  table: string
  tenantId: string
}

type RealtimePayload = {
  data?: {
    table?: string
    type?: string
    record?: Record<string, unknown>
  }
}

const RECONNECT_DELAYS = [1000, 2000, 5000, 10000]
const HEARTBEAT_MS = 20000
const REFRESH_DEBOUNCE_MS = 180

export default function SupabaseRealtimeInvalidator() {
  const router = useRouter()
  const socketRef = useRef<WebSocket | null>(null)
  const reconnectRef = useRef<number | null>(null)
  const refreshRef = useRef<number | null>(null)
  const heartbeatRef = useRef<number | null>(null)
  const attemptsRef = useRef(0)
  const stoppedRef = useRef(false)
  const refCounter = useRef(2)

  useEffect(() => {
    stoppedRef.current = false

    const clearTimers = () => {
      if (reconnectRef.current) window.clearTimeout(reconnectRef.current)
      if (refreshRef.current) window.clearTimeout(refreshRef.current)
      if (heartbeatRef.current) window.clearInterval(heartbeatRef.current)
      reconnectRef.current = null
      refreshRef.current = null
      heartbeatRef.current = null
    }

    const scheduleRefresh = (payload?: RealtimePayload) => {
      if (refreshRef.current) window.clearTimeout(refreshRef.current)
      refreshRef.current = window.setTimeout(() => {
        const detail = payload?.data || {}
        window.dispatchEvent(new CustomEvent(CRM_REALTIME_EVENT, { detail }))
        router.refresh()
      }, REFRESH_DEBOUNCE_MS)
    }

    const connect = async () => {
      try {
        const response = await fetch('/api/growth-admin/realtime-config', { cache: 'no-store' })
        if (!response.ok || stoppedRef.current) return
        const config = await response.json() as RealtimeConfig
        const endpoint = new URL(config.url)
        endpoint.protocol = endpoint.protocol === 'https:' ? 'wss:' : 'ws:'
        endpoint.pathname = '/realtime/v1/websocket'
        endpoint.searchParams.set('apikey', config.publishableKey)
        endpoint.searchParams.set('vsn', '2.0.0')

        const socket = new WebSocket(endpoint.toString())
        socketRef.current = socket
        const topic = 'realtime:sc-analytics-ui-events'
        const joinRef = '1'

        const push = (event: string, payload: Record<string, unknown>, join: string | null = joinRef) => {
          if (socket.readyState !== WebSocket.OPEN) return
          const ref = String(refCounter.current++)
          socket.send(JSON.stringify([join, ref, event === 'heartbeat' ? 'phoenix' : topic, event, payload]))
        }

        socket.onopen = () => {
          attemptsRef.current = 0
          socket.send(JSON.stringify([
            joinRef,
            joinRef,
            topic,
            'phx_join',
            {
              config: {
                broadcast: { ack: false, self: false },
                presence: { enabled: false },
                postgres_changes: [{
                  event: '*',
                  schema: 'public',
                  table: config.table,
                  filter: `tenant_id=eq.${config.tenantId}`,
                }],
                private: false,
              },
            },
          ]))
          heartbeatRef.current = window.setInterval(() => push('heartbeat', {}, null), HEARTBEAT_MS)
        }

        socket.onmessage = (message) => {
          try {
            const frame = JSON.parse(String(message.data))
            if (!Array.isArray(frame) || frame.length < 5) return
            const event = frame[3]
            if (event === 'postgres_changes') scheduleRefresh(frame[4] as RealtimePayload)
          } catch {
            // Ignore malformed/non-JSON frames; reconnect logic handles socket failures.
          }
        }

        socket.onclose = () => {
          if (heartbeatRef.current) window.clearInterval(heartbeatRef.current)
          heartbeatRef.current = null
          if (stoppedRef.current) return
          const attempt = Math.min(attemptsRef.current, RECONNECT_DELAYS.length - 1)
          const delay = RECONNECT_DELAYS[attempt]
          attemptsRef.current += 1
          reconnectRef.current = window.setTimeout(connect, delay)
        }

        socket.onerror = () => {
          try { socket.close() } catch {}
        }
      } catch {
        if (stoppedRef.current) return
        const attempt = Math.min(attemptsRef.current, RECONNECT_DELAYS.length - 1)
        attemptsRef.current += 1
        reconnectRef.current = window.setTimeout(connect, RECONNECT_DELAYS[attempt])
      }
    }

    void connect()

    const onVisible = () => {
      if (document.visibilityState !== 'visible') return
      const socket = socketRef.current
      if (!socket || socket.readyState === WebSocket.CLOSED) void connect()
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      stoppedRef.current = true
      document.removeEventListener('visibilitychange', onVisible)
      clearTimers()
      const socket = socketRef.current
      socketRef.current = null
      if (socket && socket.readyState <= WebSocket.OPEN) {
        try { socket.close(1000, 'unmount') } catch {}
      }
    }
  }, [router])

  return null
}
