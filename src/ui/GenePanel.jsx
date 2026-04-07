import { useState, useEffect } from 'react'
import { EventBus } from '../systems/EventBus.js'
import styles from './GenePanel.module.css'

const GENE_KEYS = [
  'aggression', 'searchRadius', 'patrolFreq',
  'teamwork', 'predictionAcc', 'visionMult', 'speedMult',
]

const GENE_LABELS = {
  aggression:    'AGGRESSION',
  searchRadius:  'SEARCH RAD',
  patrolFreq:    'PATROL FREQ',
  teamwork:      'TEAMWORK',
  predictionAcc: 'PREDICTION',
  visionMult:    'VISION',
  speedMult:     'SPEED',
}

export function GenePanel({ visible, bestGene }) {
  if (!visible || !bestGene) return null

  return (
    <div className={styles.panel}>
      <h3 className={styles.title}>BEST GUARD GENES</h3>
      {GENE_KEYS.map(k => (
        <div key={k} className={styles.bar}>
          <div className={styles.barLabel}>{GENE_LABELS[k]}</div>
          <div className={styles.barTrack}>
            <div
              className={styles.barFill}
              style={{ width: `${Math.min(1, Math.abs(bestGene[k] ?? 0)) * 100}%` }}
            />
          </div>
          <span className={styles.barVal}>{((bestGene[k] ?? 0) * 100).toFixed(0)}</span>
        </div>
      ))}
    </div>
  )
}
