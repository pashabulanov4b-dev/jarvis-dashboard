import { useCallback, useEffect, useRef, useState } from 'react'
import Orb from './Orb.jsx'
import { Emails, Fire, Plan, Projects, Vault } from './blocks.jsx'

const today = new Intl.DateTimeFormat('uk-UA', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())

// Розпізнавання мови в браузері (Chrome, Safari). Повний голосовий Jarvis — етап 5.
const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition

function speak(text) {
  if (!window.speechSynthesis) return
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'uk-UA'
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(u)
}

export default function App() {
  const [data, setData] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [thinking, setThinking] = useState(false)
  const [listening, setListening] = useState(false)
  const [error, setError] = useState('')
  const wsOpen = useRef(false)
  const chatEnd = useRef(null)
  const speakNext = useRef(false)

  const loadMessages = useCallback(() => {
    fetch('/api/messages?limit=30').then((r) => r.json()).then(setMessages).catch(() => {})
  }, [])

  useEffect(() => {
    fetch('/api/dashboard').then((r) => r.json()).then(setData).catch(() => setError('Ядро не відповідає. Чи запущено сервер?'))
    loadMessages()
  }, [loadMessages])

  // Живі оновлення: повідомлення з будь-якого джерела (дашборд, голос) зʼявляються тут
  useEffect(() => {
    let ws, retry
    const connect = () => {
      const proto = location.protocol === 'https:' ? 'wss' : 'ws'
      ws = new WebSocket(`${proto}://${location.host}/ws`)
      ws.onopen = () => { wsOpen.current = true }
      ws.onclose = () => { wsOpen.current = false; retry = setTimeout(connect, 3000) }
      ws.onmessage = (ev) => {
        const e = JSON.parse(ev.data)
        if (e.type !== 'message') return
        setMessages((m) => [...m, { role: e.role, content: e.content }])
        if (e.role === 'assistant' && speakNext.current) { speakNext.current = false; speak(e.content) }
      }
    }
    connect()
    return () => { clearTimeout(retry); if (ws) { ws.onclose = null; ws.close() } }
  }, [])

  useEffect(() => { chatEnd.current?.scrollIntoView({ block: 'nearest' }) }, [messages])

  const send = async (question, fromVoice = false) => {
    const q = question.trim()
    if (!q || thinking) return
    setText('')
    setError('')
    setThinking(true)
    speakNext.current = fromVoice
    try {
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: q, source: fromVoice ? 'voice' : 'dashboard' }),
      })
      const body = await r.json()
      if (!r.ok) throw new Error(body.detail || 'Помилка')
      if (!wsOpen.current) {
        loadMessages()
        if (fromVoice) speak(body.answer)
      }
    } catch (e) {
      setError(e.message)
      speakNext.current = false
    } finally {
      setThinking(false)
    }
  }

  const listen = () => {
    if (!Recognition) { setError('Цей браузер не підтримує голосовий ввід — спробуй Chrome або Safari'); return }
    const rec = new Recognition()
    rec.lang = 'uk-UA'
    rec.interimResults = false
    rec.onstart = () => setListening(true)
    rec.onend = () => setListening(false)
    rec.onerror = () => setListening(false)
    rec.onresult = (ev) => send(ev.results[0][0].transcript, true)
    rec.start()
  }

  return (
    <main className="page">
      <header className="header">
        <div>
          <div className="date">{today}</div>
          <h1>Jarvis · Павло</h1>
        </div>
        <div className="chip-row">
          <div className="pill"><span className="dot" style={{ background: 'var(--ok)' }} />Баланс <strong>{data?.balance ?? '[СУМА]'} €</strong></div>
        </div>
      </header>

      {data?.demo && <div className="demo-banner">Демо-дані: справжні листи, календар і Trello підключимо на етапі 2. Чат з Claude вже справжній.</div>}

      <div className="row">
        <div className="col col-side">
          {data && <Fire items={data.fire} />}
          {data && <Plan items={data.plan} />}
        </div>

        <section className="col col-center assistant" aria-label="Голосовий асистент">
          <Orb
            thinking={thinking}
            listening={listening}
            onClick={listen}
            label={listening ? 'Слухаю…' : 'Говорити з асистентом'}
          />
          <div className="caption">{listening ? 'СЛУХАЮ…' : thinking ? 'ДУМАЮ…' : 'АСИСТЕНТ · НА БАЗІ CLAUDE'}</div>

          {messages.length > 0 && (
            <div className="chat" aria-live="polite">
              {messages.slice(-8).map((m, i) => (
                <div key={i} className={`msg ${m.role}`}>{m.content}</div>
              ))}
              <div ref={chatEnd} />
            </div>
          )}

          <form className="ask" onSubmit={(e) => { e.preventDefault(); send(text) }}>
            <label htmlFor="ask" className="sr-only">Запит до асистента</label>
            <input id="ask" value={text} onChange={(e) => setText(e.target.value)} placeholder="Що в мене горить сьогодні?" autoComplete="off" />
            <button type="submit" disabled={thinking}>{thinking ? '…' : 'Ок'}</button>
          </form>
          {error && <div className="error" role="alert">{error}</div>}

          {data && (
            <div className="access">
              {data.access.map((a) => <span className="tag" key={a}>{a}</span>)}
            </div>
          )}
        </section>

        <div className="col col-side">
          {data && <Emails items={data.emails} />}
          {data && <Vault items={data.notes} />}
        </div>
      </div>

      {data && <Projects items={data.projects} onAnalyze={() => send('Проаналізуй мої проєкти з дашборду: що найважливіше покращити цього тижня?')} />}
    </main>
  )
}
