import styles from './Legend.module.css'

const ITEMS = [
  { color: '#00d4ff',               label: 'YOU' },
  { color: '#00ff88',               label: 'ESCAPE' },
  { color: '#ff3333',               label: 'GUARD PATROL' },
  { color: '#ff8800',               label: 'GUARD ALERT' },
  { color: '#e8e800',               label: 'GUARD SEARCH' },
  { color: 'rgba(255,0,0,0.4)',     label: 'HEAT MAP' },
  { color: 'rgba(5,5,8,0.88)',      label: 'FOG OF WAR', border: '1px solid rgba(0,212,255,0.2)' },
]

export function Legend() {
  return (
    <div className={styles.legend}>
      {ITEMS.map(({ color, label, border }) => (
        <div key={label} className={styles.item}>
          <div className={styles.dot} style={{ background: color, border }} />
          <span>{label}</span>
        </div>
      ))}
    </div>
  )
}
