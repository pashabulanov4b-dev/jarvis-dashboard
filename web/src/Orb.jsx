// Світна сфера асистента. thinking = кільця крутяться швидше, listening = яскравіше ядро
export default function Orb({ thinking, listening, onClick, label }) {
  return (
    <div className={`orb-wrap${thinking ? ' thinking' : ''}`}>
      <svg viewBox="0 0 400 400" aria-hidden="true">
        <defs>
          <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="18%" stopColor="#CFF0FF" />
            <stop offset="45%" stopColor="#4FC3FF" stopOpacity={listening ? 0.95 : 0.75} />
            <stop offset="100%" stopColor="#4FC3FF" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="200" cy="200" r="190" fill="none" stroke="#4FC3FF" strokeOpacity="0.35" strokeWidth="2" />
        <g className="ticks">
          <circle cx="200" cy="200" r="176" fill="none" stroke="#4FC3FF" strokeOpacity="0.6" strokeWidth="12" strokeDasharray="1.5 7.7" />
        </g>
        <circle cx="200" cy="200" r="160" fill="none" stroke="#4FC3FF" strokeOpacity="0.45" strokeWidth="1.5" />
        <g className="segs">
          <circle cx="200" cy="200" r="130" fill="none" stroke="#1C4E86" strokeWidth="38" strokeDasharray="64 4.07" />
          <circle cx="200" cy="200" r="130" fill="none" stroke="#4FC3FF" strokeWidth="40" strokeDasharray="64 4.07" opacity="0.18" />
        </g>
        <circle cx="200" cy="200" r="88" fill="none" stroke="#21588F" strokeWidth="22" strokeDasharray="51.3 4" />
        <circle cx="200" cy="200" r="72" fill="#0B1E3C" stroke="#4FC3FF" strokeOpacity="0.7" strokeWidth="2" />
        <circle className="core" cx="200" cy="200" r={listening ? 80 : 72} fill="url(#coreGlow)" />
      </svg>
      <button className="orb-button" aria-label={label} onClick={onClick} />
    </div>
  )
}
