// // import styles from './HUD.module.css'

// // export function HUD({ hud, onDebug, onNewMap }) {
// //   const { round, guards, alertLevel, timeLeft, escaped, globalAlert } = hud

// //   const alertLabel = alertLevel > 0.8 ? 'HIGH' : alertLevel > 0.4 ? 'MED' : 'LOW'
// //   const alertClass = alertLevel > 0.8 ? styles.danger : alertLevel > 0.4 ? styles.warning : ''

// //   const mins = Math.floor(timeLeft / 60)
// //   const secs = Math.floor(timeLeft % 60).toString().padStart(2, '0')
// //   const timeClass = timeLeft < 30 ? styles.danger : ''

// //   return (
// //     <header className={`${styles.hud} ${globalAlert ? styles.alerted : ''}`}>
// //       <div className={styles.logo}>ESCAPE CITY</div>

// //       <div className={styles.stats}>
// //         <Stat label="ROUND"   value={round} />
// //         <Stat label="GUARDS"  value={guards} />
// //         <Stat label="ALERT"   value={alertLabel} className={alertClass} />
// //         <Stat label="TIME"    value={`${mins}:${secs}`} className={timeClass} />
// //         <Stat label="ESCAPED" value={escaped} />
// //       </div>

// //       <div className={styles.actions}>
// //         <button className={styles.btn} onClick={onDebug}>DEBUG</button>
// //         <button className={styles.btn} onClick={onNewMap}>NEW MAP</button>
// //       </div>
// //     </header>
// //   )
// // }

// // function Stat({ label, value, className = '' }) {
// //   return (
// //     <div className={styles.stat}>
// //       <span className={styles.statLabel}>{label}</span>
// //       <span className={`${styles.statValue} ${className}`}>{value}</span>
// //     </div>
// //   )
// // }
// import styles from './HUD.module.css'

// const MODE_ICONS = { city: '🏙️', warehouse: '🏭', slums: '🪨', industrial: '⚙️' }
// const DIFF_COLORS = { routine: '#00ff88', alert: '#ffaa00', lockdown: '#ff6600', manhunt: '#ff2222' }
// const DIFF_LABELS = { routine: 'ROUTINE', alert: 'HIGH ALERT', lockdown: 'LOCKDOWN', manhunt: 'MANHUNT' }

// export function HUD({ hud, onDebug, onNewMap }) {
//   const {
//     round, guards, alertLevel, timeLeft, escaped,
//     globalAlert, mode, difficulty, keysCollected, keysTotal, wantedLevel,
//   } = hud

//   const alertLabel = alertLevel > 0.8 ? 'HIGH' : alertLevel > 0.4 ? 'MED' : 'LOW'
//   const alertClass = alertLevel > 0.8 ? styles.danger : alertLevel > 0.4 ? styles.warning : ''

//   const mins      = Math.floor(timeLeft / 60)
//   const secs      = Math.floor(timeLeft % 60).toString().padStart(2, '0')
//   const timeClass = timeLeft < 30 ? styles.danger : timeLeft < 60 ? styles.warning : ''

//   const diffColor = DIFF_COLORS[difficulty] || '#00ff88'
//   const modeIcon  = MODE_ICONS[mode] || '🏙️'
//   const diffLabel = DIFF_LABELS[difficulty] || ''

//   // Keycard display
//   const keyDisplay = keysTotal > 0
//     ? `${keysCollected}/${keysTotal}`
//     : '—'
//   const keyClass = keysCollected >= keysTotal && keysTotal > 0 ? styles.success : ''

//   // Wanted stars
//   const wantedStars = '★'.repeat(wantedLevel || 0) + '☆'.repeat(5 - (wantedLevel || 0))

//   return (
//     <header className={`${styles.hud} ${globalAlert ? styles.alerted : ''}`}>
//       {/* Left: logo + mode/diff badge */}
//       <div className={styles.left}>
//         <div className={styles.logo}>ESCAPE CITY</div>
//         {mode && (
//           <div className={styles.modeBadge} style={{ color: diffColor }}>
//             {modeIcon} {diffLabel}
//           </div>
//         )}
//       </div>

//       {/* Center: stats */}
//       <div className={styles.stats}>
//         <Stat label="ROUND"   value={round} />
//         <Stat label="GUARDS"  value={guards} />
//         <Stat label="ALERT"   value={alertLabel} className={alertClass} />
//         <Stat label="TIME"    value={`${mins}:${secs}`} className={timeClass} />
//         <Stat label="🗝"      value={keyDisplay} className={keyClass} />
//         <Stat label="ESCAPED" value={escaped} />
//         {(wantedLevel > 0) && (
//           <Stat label="WANTED" value={wantedStars} className={wantedLevel >= 4 ? styles.danger : wantedLevel >= 2 ? styles.warning : ''} />
//         )}
//       </div>

//       {/* Right: buttons */}
//       <div className={styles.actions}>
//         <button className={styles.btn} onClick={onDebug}>DEBUG</button>
//         <button className={styles.btn} onClick={onNewMap}>NEW MAP</button>
//       </div>
//     </header>
//   )
// }

// function Stat({ label, value, className = '' }) {
//   return (
//     <div className={styles.stat}>
//       <span className={styles.statLabel}>{label}</span>
//       <span className={`${styles.statValue} ${className}`}>{value}</span>
//     </div>
//   )
// }

import styles from './HUD.module.css'

const MODE_ICONS = { city: '🏙️', warehouse: '🏭', slums: '🪨', industrial: '⚙️' }
const DIFF_COLORS = { routine: '#00ff88', alert: '#ffaa00', lockdown: '#ff6600', manhunt: '#ff2222' }
const DIFF_LABELS = { routine: 'ROUTINE', alert: 'HIGH ALERT', lockdown: 'LOCKDOWN', manhunt: 'MANHUNT' }

export function HUD({ hud, onDebug, onNewMap }) {
  const {
    guards, alertLevel, timeLeft, escaped,
    globalAlert, mode, difficulty, keysCollected, keysTotal, wantedLevel,
  } = hud

  const alertLabel = alertLevel > 0.8 ? 'HIGH' : alertLevel > 0.4 ? 'MED' : 'LOW'
  const alertClass = alertLevel > 0.8 ? styles.danger : alertLevel > 0.4 ? styles.warning : ''

  const mins      = Math.floor(timeLeft / 60)
  const secs      = Math.floor(timeLeft % 60).toString().padStart(2, '0')
  const timeClass = timeLeft < 30 ? styles.danger : timeLeft < 60 ? styles.warning : ''

  const diffColor = DIFF_COLORS[difficulty] || '#00ff88'
  const modeIcon  = MODE_ICONS[mode] || '🏙️'
  const diffLabel = DIFF_LABELS[difficulty] || ''

  // Keycard display
  const keyDisplay = keysTotal > 0
    ? `${keysCollected}/${keysTotal}`
    : '—'
  const keyClass = keysCollected >= keysTotal && keysTotal > 0 ? styles.success : ''

  // Wanted stars
  const wantedStars = '★'.repeat(wantedLevel || 0) + '☆'.repeat(5 - (wantedLevel || 0))

  return (
    <header className={`${styles.hud} ${globalAlert ? styles.alerted : ''}`}>
      {/* Left: logo + mode/diff badge */}
      <div className={styles.left}>
        <div className={styles.logo}>ESCAPE CITY</div>
        {mode && (
          <div className={styles.modeBadge} style={{ color: diffColor }}>
            {modeIcon} {diffLabel}
          </div>
        )}
      </div>

      {/* Center: stats */}
      <div className={styles.stats}>
        <Stat label="GUARDS"  value={guards} />
        <Stat label="ALERT"   value={alertLabel} className={alertClass} />
        <Stat label="TIME"    value={`${mins}:${secs}`} className={timeClass} />
        <Stat label="🗝"      value={keyDisplay} className={keyClass} />
        <Stat label="ESCAPED" value={escaped} />
        {(wantedLevel > 0) && (
          <Stat label="WANTED" value={wantedStars} className={wantedLevel >= 4 ? styles.danger : wantedLevel >= 2 ? styles.warning : ''} />
        )}
      </div>

      {/* Right: buttons */}
      <div className={styles.actions}>
        <button className={styles.btn} onClick={onDebug}>DEBUG</button>
        <button className={styles.btn} onClick={onNewMap}>NEW MAP</button>
      </div>
    </header>
  )
}

function Stat({ label, value, className = '' }) {
  return (
    <div className={styles.stat}>
      <span className={styles.statLabel}>{label}</span>
      <span className={`${styles.statValue} ${className}`}>{value}</span>
    </div>
  )
}