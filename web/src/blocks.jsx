import { useState } from 'react'

export function Fire({ items }) {
  return (
    <section className="panel fire" aria-label="Що горить">
      <h2>Що горить</h2>
      {items.map((f, i) => (
        <div className="item" key={i}>
          <span className="item-top"><span>{f.title}</span><span className="mono">{f.due}</span></span>
          <span className="item-sub">{f.why}</span>
        </div>
      ))}
    </section>
  )
}

export function Plan({ items }) {
  const [done, setDone] = useState({})
  return (
    <section className="panel grow" aria-label="План на день">
      <div className="panel-head"><h2>План на день</h2><span className="hint">склав AI</span></div>
      {items.map((p, i) => (
        <label className={`task${done[i] ? ' done' : ''}`} key={i}>
          <input type="checkbox" checked={!!done[i]} onChange={() => setDone({ ...done, [i]: !done[i] })} />
          <span className="mono" style={{ color: 'var(--muted)', fontSize: 13 }}>{p.time}</span>
          <span className="bar" style={{ background: p.color }} />
          <span>{p.title}</span>
        </label>
      ))}
    </section>
  )
}

export function Emails({ items }) {
  return (
    <section className="panel glow" aria-label="Листи">
      <div className="panel-head">
        <h2>Листи</h2>
        <span className="hint">{items.length} важливих</span>
      </div>
      {items.map((e, i) => (
        <div className="item" key={i}>
          <span className="item-top"><span>{e.from}</span><span className="mono" style={{ color: 'var(--muted)' }}>{e.time}</span></span>
          <span className="item-sub">{e.summary}</span>
        </div>
      ))}
    </section>
  )
}

export function Vault({ items }) {
  const [q, setQ] = useState('')
  const shown = items.filter((n) => n.title.toLowerCase().includes(q.toLowerCase()))
  return (
    <section className="panel vault grow" aria-label="База Obsidian">
      <div className="panel-head"><h2>База · Obsidian</h2><span className="hint">етап 4</span></div>
      <label htmlFor="vault" className="sr-only">Пошук у базі</label>
      <input id="vault" type="search" placeholder="Знайти в нотатках…" value={q} onChange={(e) => setQ(e.target.value)} />
      {shown.map((n, i) => (
        <div className="note" key={i}><span>{n.title}</span><span>{n.folder}</span></div>
      ))}
    </section>
  )
}

export function Projects({ items, onAnalyze }) {
  return (
    <section className="panel" aria-label="Проєкти">
      <div className="panel-head">
        <div>
          <h2>Проєкти</h2>
          <span className="hint">AI аналізує стан кожного проєкту й пропонує, що покращити</span>
        </div>
        <button className="btn" onClick={onAnalyze}>Запитати про проєкти</button>
      </div>
      <div className="projects">
        {items.map((p, i) => (
          <article className="project" key={i}>
            <div className="item-top">
              <span style={{ fontSize: 16 }}>{p.name}</span>
              <span className="tag" style={{ color: p.color }}>{p.status}</span>
            </div>
            <div><span className="label">АНАЛІЗ</span><p>{p.analysis}</p></div>
            <div className="idea"><span className="label">ІДЕЯ</span><p style={{ color: 'var(--text)' }}>{p.idea}</p></div>
          </article>
        ))}
      </div>
    </section>
  )
}
