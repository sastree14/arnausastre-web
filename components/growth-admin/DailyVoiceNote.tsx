'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

type SpeechResult = { isFinal: boolean; 0: { transcript: string } }
type SpeechEvent = { resultIndex: number; results: ArrayLike<SpeechResult> }
type BrowserRecognition = {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((event: SpeechEvent) => void) | null
  onerror: ((event: { error: string }) => void) | null
  start: () => void
  stop: () => void
}
type SpeechConstructor = new () => BrowserRecognition

const panel = 'rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900'
const button = 'rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50'

export default function DailyVoiceNote({relationId,initialContact='',initialTitle=''}:{relationId?:string;initialContact?:string;initialTitle?:string} = {}) {
  const router = useRouter()
  const recorder = useRef<MediaRecorder | null>(null)
  const stream = useRef<MediaStream | null>(null)
  const recognition = useRef<BrowserRecognition | null>(null)
  const recordedChunks = useRef<Blob[]>([])
  const [recording, setRecording] = useState(false)
  const [blob, setBlob] = useState<Blob | null>(null)
  const [title, setTitle] = useState(initialTitle)
  const [body, setBody] = useState('')
  const [contact, setContact] = useState(initialContact)
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDate, setTaskDate] = useState('')
  const [meetingDate, setMeetingDate] = useState('')
  const [browserDictation, setBrowserDictation] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [speechAvailable, setSpeechAvailable] = useState<boolean | null>(null)

  async function begin() {
    setError('')
    setNotice('')
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('Este navegador no permite grabar audio. Puedes escribir una nota igualmente.')
      return
    }
    try {
      const media = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.current = media
      recordedChunks.current = []
      const mime = ['audio/webm;codecs=opus','audio/webm','audio/mp4','audio/ogg'].find(t => MediaRecorder.isTypeSupported(t))
      const instance = new MediaRecorder(media, mime ? {mimeType:mime} : undefined)
      recorder.current = instance
      instance.ondataavailable = event => { if(event.data.size) recordedChunks.current.push(event.data) }
      instance.onstop = () => {
        const audio = new Blob(recordedChunks.current, {type:instance.mimeType || 'audio/webm'})
        if(audio.size) setBlob(audio)
        stream.current?.getTracks().forEach(track => track.stop())
        stream.current = null
        recorder.current = null
      }
      instance.start(1000)
      setBlob(null)
      setRecording(true)

      if (browserDictation) {
        const speechWindow = window as typeof window & { SpeechRecognition?: SpeechConstructor; webkitSpeechRecognition?: SpeechConstructor }
        const Speech = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition
        setSpeechAvailable(Boolean(Speech))
        if (Speech) {
          try {
            const sr = new Speech()
            sr.lang = 'es-ES'
            sr.continuous = true
            sr.interimResults = false
            sr.onresult = event => {
              const parts:string[] = []
              for(let n=event.resultIndex;n<event.results.length;n+=1) {
                const result=event.results[n]
                if(result.isFinal) parts.push(result[0].transcript.trim())
              }
              if(parts.length) setBody(previous => [previous,...parts].filter(Boolean).join('\n'))
            }
            sr.onerror = () => setNotice('El dictado del navegador no está disponible; el audio se seguirá guardando.')
            recognition.current = sr
            sr.start()
          } catch { setNotice('No se ha podido iniciar el dictado; el audio se seguirá guardando.') }
        } else setNotice('El navegador no admite dictado automático. Puedes redactar un resumen tras grabar.')
      }
    } catch {
      setError('No se ha podido acceder al micrófono. Revisa el permiso del navegador.')
      stream.current?.getTracks().forEach(track => track.stop())
      stream.current = null
    }
  }

  function stop() {
    if (recorder.current?.state === 'recording') recorder.current.stop()
    recognition.current?.stop()
    recognition.current = null
    setRecording(false)
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (recording) { setError('Detén la grabación antes de guardarla.'); return }
    if (!title.trim() || (!body.trim() && !blob)) { setError('Añade un título y una nota o un audio.'); return }
    setSaving(true); setError(''); setNotice('')
    try {
      const form = new FormData()
      form.set('title', title)
      form.set('body', body)
      form.set('contact_email', contact)
      if (relationId) form.set('relation_id', relationId)
      form.set('meeting_date', meetingDate)
      form.set('task_title', taskTitle)
      form.set('task_date', taskDate)
      if (blob) form.set('audio', blob, blob.type.startsWith('audio/mp4') ? 'reunion.m4a' : 'reunion.webm')
      const response = await fetch('/api/growth-admin/dia-a-dia/voice', {method:'POST',body:form,credentials:'same-origin'})
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'No se ha guardado')
      setTitle(initialTitle);setBody('');setBlob(null);setTaskTitle('');setTaskDate('');setMeetingDate('');setContact(initialContact)
      setNotice('Nota guardada en el CMI privado.' + (result.task_created?' Compromiso añadido a tareas.':''))
      router.refresh()
    } catch (e) {
      setError(e instanceof Error?e.message:'No se ha podido guardar')
    } finally { setSaving(false) }
  }

  return <form onSubmit={save} className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
    <p className="text-sm font-semibold text-slate-900">{relationId?'Añadir actualización de esta relación':'Registrar lo que acaba de pasar'}</p>
    <p className="text-xs leading-5 text-slate-500">Puedes grabar una nota de voz o escribir un resumen de cambios. Se vinculará a esta relación sin inventar interacciones ni tareas. Solo se crea una tarea si escribes expresamente su título.</p>
    <div className="grid gap-2 sm:grid-cols-2">
      <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Reunión o conversación *" maxLength={240} className={panel} required/>
      <input value={contact} onChange={e=>setContact(e.target.value)} placeholder="Correo del contacto (opcional)" type="email" readOnly={Boolean(relationId)} className={panel}/>
    </div>
    <div className="flex flex-wrap items-center gap-3">
      {recording ? <button type="button" onClick={stop} className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white">■ Detener grabación</button> :
        <button type="button" onClick={begin} disabled={saving} className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white">🎙 Grabar nota de voz</button>}
      <label className="flex items-center gap-2 text-xs text-slate-600">
        <input type="checkbox" checked={browserDictation} disabled={recording} onChange={e=>setBrowserDictation(e.target.checked)}/>
        Activar dictado del navegador (opcional)
      </label>
      {recording && <span className="text-xs font-semibold text-rose-700">● Grabando…</span>}
      {blob && !recording && <span className="text-xs text-emerald-700">Audio listo · {Math.round(blob.size/1024)} KB</span>}
    </div>
    {browserDictation && <p className="text-xs text-amber-700">El reconocimiento de voz puede utilizar servicios externos del navegador. No lo actives para información confidencial si no tienes autorización.</p>}
    {speechAvailable===false && <p className="text-xs text-amber-700">Tu navegador no admite transcripción integrada.</p>}
    <textarea value={body} onChange={e=>setBody(e.target.value)} rows={3} maxLength={20000} placeholder="Resumen: qué se habló, qué quedó acordado, fechas, decisiones…" className={panel + ' w-full'} />
    <div className="grid gap-2 sm:grid-cols-3">
      <label className="text-xs text-slate-600">Fecha de reunión (opcional)<input type="date" value={meetingDate} onChange={e=>setMeetingDate(e.target.value)} className={panel + ' mt-1 w-full'}/></label>
      <input value={taskTitle} onChange={e=>setTaskTitle(e.target.value)} placeholder="Tarea real acordada (opcional)" className={panel + ' self-end'}/>
      <label className="text-xs text-slate-600">Trabajar (por defecto, siguiente día hábil)<input type="date" value={taskDate} onChange={e=>setTaskDate(e.target.value)} className={panel + ' mt-1 w-full'}/></label>
    </div>
    <button disabled={saving || recording} className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving?'Guardando…':'Guardar nota y compromiso'}</button>
    {notice && <p role="status" className="text-sm text-emerald-700">{notice}</p>}
    {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
  </form>
}
