// // // import { useState } from 'react'
// // // import styles from './Overlay.module.css'

// // // const MODES = [
// // //   { id: 'city',       label: 'CITY STREETS', icon: '🏙️', desc: 'Dense urban grid. Roads and alleys. Classic escape.' },
// // //   { id: 'warehouse',  label: 'WAREHOUSE',    icon: '🏭', desc: 'Wide open floors, long sight lines. Stealth is critical.' },
// // //   { id: 'slums',      label: 'SLUMS',        icon: '🪨', desc: 'Tight maze of alleys. Guards get confused. So will you.' },
// // //   { id: 'industrial', label: 'INDUSTRIAL',   icon: '⚙️', desc: 'Blocky compounds. Multiple red zones. High guard density.' },
// // // ]

// // // const DIFFICULTIES = [
// // //   { id: 'routine',  label: 'ROUTINE',    color: '#00ff88', stars: 1, desc: '5 guards · 150s · Normal vision · 1 keycard' },
// // //   { id: 'alert',    label: 'HIGH ALERT', color: '#ffaa00', stars: 2, desc: '7 guards · 120s · Enhanced vision · 2 keycards' },
// // //   { id: 'lockdown', label: 'LOCKDOWN',   color: '#ff6600', stars: 3, desc: '10 guards · 100s · Fast guards · 3 keycards · Early lights out' },
// // //   { id: 'manhunt',  label: 'MANHUNT',    color: '#ff2222', stars: 4, desc: '14 guards · 80s · Max speed · 3 keycards · Always dark' },
// // // ]

// // // export function Overlay({ gameState, roundData, onStart }) {
// // //   const [screen, setScreen]         = useState('mode')
// // //   const [mode, setMode]             = useState(null)
// // //   const [difficulty, setDifficulty] = useState(null)

// // //   const isMenu = gameState === 'menu'
// // //   const isEnd  = gameState === 'end'
// // //   if (!isMenu && !isEnd) return null

// // //   const fire = (d) => onStart({ mode, difficulty: d || difficulty })

// // //   // ── END SCREEN ──────────────────────────────────────────────
// // //   if (isEnd) {
// // //     const result     = roundData?.result
// // //     const titleColor = result === 'escaped' ? '#00ff88' : result === 'caught' ? '#ff3333' : '#ff8800'
// // //     const titleText  = result === 'escaped' ? 'ESCAPED!' : result === 'caught' ? 'CAPTURED' : 'TIME OUT'
// // //     const sub        = result === 'escaped' ? 'YOU MADE IT OUT... THIS TIME.'
// // //                      : result === 'caught'  ? 'THE AI LEARNS FROM YOUR FAILURE.'
// // //                      : 'THE CITY LOCKS DOWN.'

// // //     if (screen === 'end-diff') {
// // //       return (
// // //         <div className={styles.overlay}>
// // //           <div className={styles.badge}>ROUND {roundData.round - 1} COMPLETE — GEN {roundData.generation}</div>
// // //           <h1 className={styles.title} style={{ color: titleColor }}>{titleText}</h1>
// // //           <p className={styles.sub}>{sub}</p>
// // //           <div className={styles.stats}>
// // //             <div>ROUND    <span>{roundData.round - 1}</span></div>
// // //             <div>GA GEN   <span>{roundData.generation}</span></div>
// // //             <div>ESCAPED  <span>{roundData.escaped}</span></div>
// // //             <div>GUARDS   <span>{roundData.guards}</span></div>
// // //             <div>BEST SPD <span>{(roundData.bestGene?.speedMult * 100).toFixed(0)}%</span></div>
// // //             <div>TEAMWORK <span>{(roundData.bestGene?.teamwork * 100).toFixed(0)}%</span></div>
// // //           </div>
// // //           <p className={styles.pickLabel}>SELECT DIFFICULTY FOR ROUND {roundData.round}</p>
// // //           <div className={styles.diffGrid}>
// // //             {DIFFICULTIES.map(d => (
// // //               <button key={d.id}
// // //                 className={`${styles.diffCard} ${difficulty === d.id ? styles.selected : ''}`}
// // //                 style={{ '--accent': d.color }}
// // //                 onClick={() => { setDifficulty(d.id); fire(d.id) }}
// // //               >
// // //                 <span className={styles.diffStars}>{'★'.repeat(d.stars)}{'☆'.repeat(4 - d.stars)}</span>
// // //                 <span className={styles.diffLabel} style={{ color: d.color }}>{d.label}</span>
// // //                 <span className={styles.diffDesc}>{d.desc}</span>
// // //               </button>
// // //             ))}
// // //           </div>
// // //           <button className={styles.btnSecondary} onClick={() => { setScreen('mode'); }}>← CHANGE MODE</button>
// // //         </div>
// // //       )
// // //     }

// // //     return (
// // //       <div className={styles.overlay}>
// // //         <div className={styles.badge}>ROUND {roundData.round - 1} COMPLETE — GEN {roundData.generation}</div>
// // //         <h1 className={styles.title} style={{ color: titleColor }}>{titleText}</h1>
// // //         <p className={styles.sub}>{sub}</p>
// // //         <div className={styles.stats}>
// // //           <div>ROUND    <span>{roundData.round - 1}</span></div>
// // //           <div>GA GEN   <span>{roundData.generation}</span></div>
// // //           <div>ESCAPED  <span>{roundData.escaped}</span></div>
// // //           <div>GUARDS   <span>{roundData.guards}</span></div>
// // //           <div>BEST SPD <span>{(roundData.bestGene?.speedMult * 100).toFixed(0)}%</span></div>
// // //           <div>TEAMWORK <span>{(roundData.bestGene?.teamwork * 100).toFixed(0)}%</span></div>
// // //         </div>
// // //         <button className={styles.btn} onClick={() => setScreen('end-diff')}>
// // //           NEXT ROUND ({roundData.round}) →
// // //         </button>
// // //       </div>
// // //     )
// // //   }

// // //   // ── MODE SELECT ─────────────────────────────────────────────
// // //   if (screen === 'mode') {
// // //     return (
// // //       <div className={styles.overlay}>
// // //         <h1 className={styles.title} style={{ color: '#00ff88' }}>EVOLVING ESCAPE</h1>
// // //         <p className={styles.sub}>AI LEARNS. CITY ADAPTS. CAN YOU ESCAPE?</p>
// // //         <p className={styles.pickLabel}>SELECT MAP MODE</p>
// // //         <div className={styles.modeGrid}>
// // //           {MODES.map(m => (
// // //             <button key={m.id}
// // //               className={`${styles.modeCard} ${mode === m.id ? styles.selected : ''}`}
// // //               onClick={() => setMode(m.id)}
// // //             >
// // //               <span className={styles.modeIcon}>{m.icon}</span>
// // //               <span className={styles.modeLabel}>{m.label}</span>
// // //               <span className={styles.modeDesc}>{m.desc}</span>
// // //             </button>
// // //           ))}
// // //         </div>
// // //         <button className={styles.btn} disabled={!mode} onClick={() => setScreen('difficulty')}>
// // //           NEXT: DIFFICULTY →
// // //         </button>
// // //       </div>
// // //     )
// // //   }

// // //   // ── DIFFICULTY SELECT ────────────────────────────────────────
// // //   const selectedMode = MODES.find(m => m.id === mode)
// // //   return (
// // //     <div className={styles.overlay}>
// // //       <div className={styles.badge}>{selectedMode?.icon} {selectedMode?.label}</div>
// // //       <h1 className={styles.title} style={{ color: '#00ff88' }}>SELECT DIFFICULTY</h1>
// // //       <p className={styles.sub}>THE AI EVOLVES EACH ROUND — CHOOSE YOUR FATE</p>
// // //       <div className={styles.diffGrid}>
// // //         {DIFFICULTIES.map(d => (
// // //           <button key={d.id}
// // //             className={`${styles.diffCard} ${difficulty === d.id ? styles.selected : ''}`}
// // //             style={{ '--accent': d.color }}
// // //             onClick={() => setDifficulty(d.id)}
// // //           >
// // //             <span className={styles.diffStars}>{'★'.repeat(d.stars)}{'☆'.repeat(4 - d.stars)}</span>
// // //             <span className={styles.diffLabel} style={{ color: d.color }}>{d.label}</span>
// // //             <span className={styles.diffDesc}>{d.desc}</span>
// // //           </button>
// // //         ))}
// // //       </div>
// // //       <div className={styles.btnRow}>
// // //         <button className={styles.btnSecondary} onClick={() => setScreen('mode')}>← BACK</button>
// // //         <button className={styles.btn} disabled={!difficulty} onClick={() => fire()}>INITIATE ESCAPE</button>
// // //       </div>
// // //     </div>
// // //   )
// // // }
// // import { useState } from 'react'
// // import styles from './Overlay.module.css'

// // const MODES = [
// //   { id: 'city',       label: 'CITY STREETS', icon: '🏙️', desc: 'Dense urban grid. Roads and alleys. Classic escape.' },
// //   { id: 'warehouse',  label: 'WAREHOUSE',    icon: '🏭', desc: 'Wide open floors, long sight lines. Stealth is critical.' },
// //   { id: 'slums',      label: 'SLUMS',        icon: '🪨', desc: 'Tight maze of alleys. Guards get confused. So will you.' },
// //   { id: 'industrial', label: 'INDUSTRIAL',   icon: '⚙️', desc: 'Blocky compounds. Multiple red zones. High guard density.' },
// // ]

// // const DIFFICULTIES = [
// //   { id: 'routine',  label: 'ROUTINE',    color: '#00ff88', stars: 1, desc: '4 guards · 150s · Normal speed · 1 keycard' },
// //   { id: 'alert',    label: 'HIGH ALERT', color: '#ffaa00', stars: 2, desc: '5 guards · 140s · Slightly faster · 1 keycard' },
// //   { id: 'lockdown', label: 'LOCKDOWN',   color: '#ff6600', stars: 3, desc: '7 guards · 130s · 1.1× speed · 2 keycards' },
// //   { id: 'manhunt',  label: 'MANHUNT',    color: '#ff2222', stars: 4, desc: '9 guards · 115s · 1.25× speed · 2 keycards · Lights out at 60s' },
// // ]

// // // screen values: 'mode' | 'difficulty' | 'end-stats' | 'end-diff'
// // export function Overlay({ gameState, roundData, onStart }) {
// //   const [screen, setScreen]         = useState('mode')
// //   const [mode, setMode]             = useState(null)
// //   const [difficulty, setDifficulty] = useState(null)

// //   // When a round ends, jump to the stats screen
// //   // (but don't override if user is navigating mode/difficulty)
// //   if (gameState === 'end' && screen !== 'end-diff' && screen !== 'mode' && screen !== 'difficulty') {
// //     if (screen !== 'end-stats') setScreen('end-stats')
// //   }

// //   const isVisible = gameState === 'menu' || gameState === 'end'
// //   if (!isVisible) return null

// //   const fire = (d) => onStart({ mode, difficulty: d || difficulty })

// //   // ── MODE SELECT (works from both menu and end screen) ───────
// //   if (screen === 'mode') {
// //     return (
// //       <div className={styles.overlay}>
// //         <h1 className={styles.title} style={{ color: '#00ff88' }}>EVOLVING ESCAPE</h1>
// //         <p className={styles.sub}>AI LEARNS. CITY ADAPTS. CAN YOU ESCAPE?</p>
// //         <p className={styles.pickLabel}>SELECT MAP MODE</p>
// //         <div className={styles.modeGrid}>
// //           {MODES.map(m => (
// //             <button key={m.id}
// //               className={`${styles.modeCard} ${mode === m.id ? styles.selected : ''}`}
// //               onClick={() => setMode(m.id)}
// //             >
// //               <span className={styles.modeIcon}>{m.icon}</span>
// //               <span className={styles.modeLabel}>{m.label}</span>
// //               <span className={styles.modeDesc}>{m.desc}</span>
// //             </button>
// //           ))}
// //         </div>
// //         <button className={styles.btn} disabled={!mode} onClick={() => setScreen('difficulty')}>
// //           NEXT: DIFFICULTY →
// //         </button>
// //       </div>
// //     )
// //   }

// //   // ── DIFFICULTY SELECT (works from both menu and end screen) ─
// //   if (screen === 'difficulty') {
// //     const selectedMode = MODES.find(m => m.id === mode)
// //     return (
// //       <div className={styles.overlay}>
// //         <div className={styles.badge}>{selectedMode?.icon} {selectedMode?.label}</div>
// //         <h1 className={styles.title} style={{ color: '#00ff88' }}>SELECT DIFFICULTY</h1>
// //         <p className={styles.sub}>THE AI EVOLVES EACH ROUND — CHOOSE YOUR FATE</p>
// //         <div className={styles.diffGrid}>
// //           {DIFFICULTIES.map(d => (
// //             <button key={d.id}
// //               className={`${styles.diffCard} ${difficulty === d.id ? styles.selected : ''}`}
// //               style={{ '--accent': d.color }}
// //               onClick={() => setDifficulty(d.id)}
// //             >
// //               <span className={styles.diffStars}>{'★'.repeat(d.stars)}{'☆'.repeat(4 - d.stars)}</span>
// //               <span className={styles.diffLabel} style={{ color: d.color }}>{d.label}</span>
// //               <span className={styles.diffDesc}>{d.desc}</span>
// //             </button>
// //           ))}
// //         </div>
// //         <div className={styles.btnRow}>
// //           <button className={styles.btnSecondary} onClick={() => setScreen('mode')}>← BACK</button>
// //           <button className={styles.btn} disabled={!difficulty} onClick={() => fire()}>INITIATE ESCAPE</button>
// //         </div>
// //       </div>
// //     )
// //   }

// //   // ── END: QUICK DIFF PICK (same mode, next round) ────────────
// //   if (screen === 'end-diff') {
// //     const result     = roundData?.result
// //     const titleColor = result === 'escaped' ? '#00ff88' : result === 'caught' ? '#ff3333' : '#ff8800'
// //     const titleText  = result === 'escaped' ? 'ESCAPED!' : result === 'caught' ? 'CAPTURED' : 'TIME OUT'
// //     const sub        = result === 'escaped' ? 'YOU MADE IT OUT... THIS TIME.'
// //                      : result === 'caught'  ? 'THE AI LEARNS FROM YOUR FAILURE.'
// //                      : 'THE CITY LOCKS DOWN.'
// //     return (
// //       <div className={styles.overlay}>
// //         <div className={styles.badge}>ROUND {roundData.round - 1} COMPLETE — GEN {roundData.generation}</div>
// //         <h1 className={styles.title} style={{ color: titleColor }}>{titleText}</h1>
// //         <p className={styles.sub}>{sub}</p>
// //         <div className={styles.stats}>
// //           <div>ROUND    <span>{roundData.round - 1}</span></div>
// //           <div>GA GEN   <span>{roundData.generation}</span></div>
// //           <div>ESCAPED  <span>{roundData.escaped}</span></div>
// //           <div>GUARDS   <span>{roundData.guards}</span></div>
// //           <div>BEST SPD <span>{(roundData.bestGene?.speedMult * 100).toFixed(0)}%</span></div>
// //           <div>TEAMWORK <span>{(roundData.bestGene?.teamwork * 100).toFixed(0)}%</span></div>
// //         </div>
// //         <p className={styles.pickLabel}>SELECT DIFFICULTY FOR ROUND {roundData.round}</p>
// //         <div className={styles.diffGrid}>
// //           {DIFFICULTIES.map(d => (
// //             <button key={d.id}
// //               className={`${styles.diffCard} ${difficulty === d.id ? styles.selected : ''}`}
// //               style={{ '--accent': d.color }}
// //               onClick={() => { setDifficulty(d.id); fire(d.id) }}
// //             >
// //               <span className={styles.diffStars}>{'★'.repeat(d.stars)}{'☆'.repeat(4 - d.stars)}</span>
// //               <span className={styles.diffLabel} style={{ color: d.color }}>{d.label}</span>
// //               <span className={styles.diffDesc}>{d.desc}</span>
// //             </button>
// //           ))}
// //         </div>
// //         <button className={styles.btnSecondary} onClick={() => setScreen('mode')}>← CHANGE MODE</button>
// //       </div>
// //     )
// //   }

// //   // ── END: STATS SCREEN (default after round ends) ────────────
// //   const result     = roundData?.result
// //   const titleColor = result === 'escaped' ? '#00ff88' : result === 'caught' ? '#ff3333' : '#ff8800'
// //   const titleText  = result === 'escaped' ? 'ESCAPED!' : result === 'caught' ? 'CAPTURED' : 'TIME OUT'
// //   const sub        = result === 'escaped' ? 'YOU MADE IT OUT... THIS TIME.'
// //                    : result === 'caught'  ? 'THE AI LEARNS FROM YOUR FAILURE.'
// //                    : 'THE CITY LOCKS DOWN.'
// //   return (
// //     <div className={styles.overlay}>
// //       <div className={styles.badge}>ROUND {roundData.round - 1} COMPLETE — GEN {roundData.generation}</div>
// //       <h1 className={styles.title} style={{ color: titleColor }}>{titleText}</h1>
// //       <p className={styles.sub}>{sub}</p>
// //       <div className={styles.stats}>
// //         <div>ROUND    <span>{roundData.round - 1}</span></div>
// //         <div>GA GEN   <span>{roundData.generation}</span></div>
// //         <div>ESCAPED  <span>{roundData.escaped}</span></div>
// //         <div>GUARDS   <span>{roundData.guards}</span></div>
// //         <div>BEST SPD <span>{(roundData.bestGene?.speedMult * 100).toFixed(0)}%</span></div>
// //         <div>TEAMWORK <span>{(roundData.bestGene?.teamwork * 100).toFixed(0)}%</span></div>
// //       </div>
// //       <button className={styles.btn} onClick={() => setScreen('end-diff')}>
// //         NEXT ROUND ({roundData?.round}) →
// //       </button>
// //     </div>
// //   )
// // }

// import { useState } from 'react'
// import styles from './Overlay.module.css'

// const MODES = [
//   { id: 'city',       label: 'CITY STREETS', icon: '🏙️', desc: 'Dense urban grid. Roads and alleys. Classic escape.' },
//   { id: 'warehouse',  label: 'WAREHOUSE',    icon: '🏭', desc: 'Wide open floors, long sight lines. Stealth is critical.' },
//   { id: 'slums',      label: 'SLUMS',        icon: '🪨', desc: 'Tight maze of alleys. Guards get confused. So will you.' },
//   { id: 'industrial', label: 'INDUSTRIAL',   icon: '⚙️', desc: 'Blocky compounds. Multiple red zones. High guard density.' },
// ]

// const DIFFICULTIES = [
//   { id: 'routine',  label: 'ROUTINE',    color: '#00ff88', stars: 1, desc: 'Normal guards · 150s · 0.8× guard count · 1 keycard' },
//   { id: 'alert',    label: 'HIGH ALERT', color: '#ffaa00', stars: 2, desc: 'More guards · 140s · 1.0× guard count · 1 keycard' },
//   { id: 'lockdown', label: 'LOCKDOWN',   color: '#ff6600', stars: 3, desc: 'Heavy guards · 130s · 1.4× guard count · 2 keycards' },
//   { id: 'manhunt',  label: 'MANHUNT',    color: '#ff2222', stars: 4, desc: 'Max guards · 115s · 1.8× guard count · 2 keycards · Lights out at 60s' },
// ]

// // screen values: 'mode' | 'difficulty' | 'end-stats' | 'end-diff'
// export function Overlay({ gameState, roundData, onStart }) {
//   const [screen, setScreen]         = useState('mode')
//   const [mode, setMode]             = useState(null)
//   const [difficulty, setDifficulty] = useState(null)

//   // When a round ends, jump to the stats screen
//   // (but don't override if user is navigating mode/difficulty)
//   if (gameState === 'end' && screen !== 'end-diff' && screen !== 'mode' && screen !== 'difficulty') {
//     if (screen !== 'end-stats') setScreen('end-stats')
//   }

//   const isVisible = gameState === 'menu' || gameState === 'end'
//   if (!isVisible) return null

//   const fire = (d) => onStart({ mode, difficulty: d || difficulty })

//   // ── MODE SELECT (works from both menu and end screen) ───────
//   if (screen === 'mode') {
//     return (
//       <div className={styles.overlay}>
//         <h1 className={styles.title} style={{ color: '#00ff88' }}>EVOLVING ESCAPE</h1>
//         <p className={styles.sub}>AI LEARNS. CITY ADAPTS. CAN YOU ESCAPE?</p>
//         <p className={styles.pickLabel}>SELECT MAP MODE</p>
//         <div className={styles.modeGrid}>
//           {MODES.map(m => (
//             <button key={m.id}
//               className={`${styles.modeCard} ${mode === m.id ? styles.selected : ''}`}
//               onClick={() => setMode(m.id)}
//             >
//               <span className={styles.modeIcon}>{m.icon}</span>
//               <span className={styles.modeLabel}>{m.label}</span>
//               <span className={styles.modeDesc}>{m.desc}</span>
//             </button>
//           ))}
//         </div>
//         <button className={styles.btn} disabled={!mode} onClick={() => setScreen('difficulty')}>
//           NEXT: DIFFICULTY →
//         </button>
//       </div>
//     )
//   }

//   // ── DIFFICULTY SELECT (works from both menu and end screen) ─
//   if (screen === 'difficulty') {
//     const selectedMode = MODES.find(m => m.id === mode)
//     return (
//       <div className={styles.overlay}>
//         <div className={styles.badge}>{selectedMode?.icon} {selectedMode?.label}</div>
//         <h1 className={styles.title} style={{ color: '#00ff88' }}>SELECT DIFFICULTY</h1>
//         <p className={styles.sub}>THE AI EVOLVES — CHOOSE YOUR FATE</p>
//         <div className={styles.diffGrid}>
//           {DIFFICULTIES.map(d => (
//             <button key={d.id}
//               className={`${styles.diffCard} ${difficulty === d.id ? styles.selected : ''}`}
//               style={{ '--accent': d.color }}
//               onClick={() => setDifficulty(d.id)}
//             >
//               <span className={styles.diffStars}>{'★'.repeat(d.stars)}{'☆'.repeat(4 - d.stars)}</span>
//               <span className={styles.diffLabel} style={{ color: d.color }}>{d.label}</span>
//               <span className={styles.diffDesc}>{d.desc}</span>
//             </button>
//           ))}
//         </div>
//         <div className={styles.btnRow}>
//           <button className={styles.btnSecondary} onClick={() => setScreen('mode')}>← BACK</button>
//           <button className={styles.btn} disabled={!difficulty} onClick={() => fire()}>INITIATE ESCAPE</button>
//         </div>
//       </div>
//     )
//   }

//   // ── END: QUICK DIFF PICK (same mode, next round) ────────────
//   if (screen === 'end-diff') {
//     const result     = roundData?.result
//     const titleColor = result === 'escaped' ? '#00ff88' : result === 'caught' ? '#ff3333' : '#ff8800'
//     const titleText  = result === 'escaped' ? 'ESCAPED!' : result === 'caught' ? 'CAPTURED' : 'TIME OUT'
//     const sub        = result === 'escaped' ? 'YOU MADE IT OUT... THIS TIME.'
//                      : result === 'caught'  ? 'THE AI LEARNS FROM YOUR FAILURE.'
//                      : 'THE CITY LOCKS DOWN.'
//     return (
//       <div className={styles.overlay}>
//         <div className={styles.badge}>GEN {roundData.generation} — COMPLETE</div>
//         <h1 className={styles.title} style={{ color: titleColor }}>{titleText}</h1>
//         <p className={styles.sub}>{sub}</p>
//         <div className={styles.stats}>
//           <div>GA GEN   <span>{roundData.generation}</span></div>
//           <div>ESCAPED  <span>{roundData.escaped}</span></div>
//           <div>GUARDS   <span>{roundData.guards}</span></div>
//           <div>BEST SPD <span>{(roundData.bestGene?.speedMult * 100).toFixed(0)}%</span></div>
//           <div>TEAMWORK <span>{(roundData.bestGene?.teamwork * 100).toFixed(0)}%</span></div>
//         </div>
//         <p className={styles.pickLabel}>SELECT DIFFICULTY</p>
//         <div className={styles.diffGrid}>
//           {DIFFICULTIES.map(d => (
//             <button key={d.id}
//               className={`${styles.diffCard} ${difficulty === d.id ? styles.selected : ''}`}
//               style={{ '--accent': d.color }}
//               onClick={() => { setDifficulty(d.id); fire(d.id) }}
//             >
//               <span className={styles.diffStars}>{'★'.repeat(d.stars)}{'☆'.repeat(4 - d.stars)}</span>
//               <span className={styles.diffLabel} style={{ color: d.color }}>{d.label}</span>
//               <span className={styles.diffDesc}>{d.desc}</span>
//             </button>
//           ))}
//         </div>
//         <button className={styles.btnSecondary} onClick={() => setScreen('mode')}>← CHANGE MODE</button>
//       </div>
//     )
//   }

//   // ── END: STATS SCREEN (default after round ends) ────────────
//   const result     = roundData?.result
//   const titleColor = result === 'escaped' ? '#00ff88' : result === 'caught' ? '#ff3333' : '#ff8800'
//   const titleText  = result === 'escaped' ? 'ESCAPED!' : result === 'caught' ? 'CAPTURED' : 'TIME OUT'
//   const sub        = result === 'escaped' ? 'YOU MADE IT OUT... THIS TIME.'
//                    : result === 'caught'  ? 'THE AI LEARNS FROM YOUR FAILURE.'
//                    : 'THE CITY LOCKS DOWN.'
//   return (
//     <div className={styles.overlay}>
//       <div className={styles.badge}>GEN {roundData.generation} — COMPLETE</div>
//       <h1 className={styles.title} style={{ color: titleColor }}>{titleText}</h1>
//       <p className={styles.sub}>{sub}</p>
//       <div className={styles.stats}>
//         <div>GA GEN   <span>{roundData.generation}</span></div>
//         <div>ESCAPED  <span>{roundData.escaped}</span></div>
//         <div>GUARDS   <span>{roundData.guards}</span></div>
//         <div>BEST SPD <span>{(roundData.bestGene?.speedMult * 100).toFixed(0)}%</span></div>
//         <div>TEAMWORK <span>{(roundData.bestGene?.teamwork * 100).toFixed(0)}%</span></div>
//       </div>
//       <button className={styles.btn} onClick={() => setScreen('end-diff')}>
//         PLAY AGAIN →
//       </button>
//     </div>
//   )
// }

import { useState } from 'react'
import styles from './Overlay.module.css'

const MODES = [
  { id: 'city',       label: 'CITY STREETS', icon: '🌆', desc: 'Dense urban grid. Roads and alleys. Classic escape.' },
  { id: 'warehouse',  label: 'WAREHOUSE',    icon: '📦', desc: 'Wide open floors, long sight lines. Stealth is critical.' },
  { id: 'slums',      label: 'SLUMS',        icon: '🛖', desc: 'Tight maze of alleys. Guards get confused. So will you.' },
  { id: 'industrial', label: 'INDUSTRIAL',   icon: '🏗️', desc: 'Blocky compounds. Multiple red zones. High guard density.' },
]

const DIFFICULTIES = [
  { id: 'routine',  label: 'ROUTINE',    color: '#00ff88', stars: 1, desc: 'Normal guards · 150s · 0.8× guard count · 1 keycard' },
  { id: 'alert',    label: 'HIGH ALERT', color: '#ffaa00', stars: 2, desc: 'More guards · 140s · 1.0× guard count · 1 keycard' },
  { id: 'lockdown', label: 'LOCKDOWN',   color: '#ff6600', stars: 3, desc: 'Heavy guards · 130s · 1.4× guard count · 2 keycards' },
  { id: 'manhunt',  label: 'MANHUNT',    color: '#ff2222', stars: 4, desc: 'Max guards · 115s · 1.8× guard count · 2 keycards · Lights out at 60s' },
]

// screen values: 'mode' | 'difficulty' | 'end-stats' | 'end-diff'
export function Overlay({ gameState, roundData, onStart }) {
  const [screen, setScreen]         = useState('mode')
  const [mode, setMode]             = useState(null)
  const [difficulty, setDifficulty] = useState(null)

  // When a round ends, jump to the stats screen
  // (but don't override if user is navigating mode/difficulty)
  if (gameState === 'end' && screen !== 'end-diff' && screen !== 'mode' && screen !== 'difficulty') {
    if (screen !== 'end-stats') setScreen('end-stats')
  }

  const isVisible = gameState === 'menu' || gameState === 'end'
  if (!isVisible) return null

  const fire = (d) => onStart({ mode, difficulty: d || difficulty })

  // ── MODE SELECT (works from both menu and end screen) ───────
  if (screen === 'mode') {
    return (
      <div className={styles.overlay}>
        <h1 className={styles.title} style={{ color: '#00ff88' }}>EVOLVING ESCAPE</h1>
        <p className={styles.sub}>AI LEARNS. CITY ADAPTS. CAN YOU ESCAPE?</p>
        <p className={styles.pickLabel}>SELECT MAP MODE</p>
        <div className={styles.modeGrid}>
          {MODES.map(m => (
            <button key={m.id}
              className={`${styles.modeCard} ${mode === m.id ? styles.selected : ''}`}
              onClick={() => setMode(m.id)}
            >
              <div className={styles.modeTop}>
                <span className={styles.modeIcon}>{m.icon}</span>
                <span className={styles.modeLabel}>{m.label}</span>
              </div>
              <span className={styles.modeDesc}>{m.desc}</span>
            </button>
          ))}
        </div>
        <button className={styles.btn} disabled={!mode} onClick={() => setScreen('difficulty')}>
          NEXT →
        </button>
      </div>
    )
  }

  // ── DIFFICULTY SELECT (works from both menu and end screen) ─
  if (screen === 'difficulty') {
    const selectedMode = MODES.find(m => m.id === mode)
    return (
      <div className={styles.overlay}>
        <div className={styles.badge}>{selectedMode?.icon} {selectedMode?.label}</div>
        <h1 className={styles.title} style={{ color: '#00ff88' }}>SELECT DIFFICULTY</h1>
        <p className={styles.sub}>THE AI EVOLVES — CHOOSE YOUR FATE</p>
        <div className={styles.diffGrid}>
          {DIFFICULTIES.map(d => (
            <button key={d.id}
              className={`${styles.diffCard} ${difficulty === d.id ? styles.selected : ''}`}
              style={{ '--accent': d.color }}
              onClick={() => setDifficulty(d.id)}
            >
              <div className={styles.diffTop}>
                <span className={styles.diffLabel} style={{ color: d.color }}>{d.label}</span>
                <span className={styles.diffStars}>{'★'.repeat(d.stars)}{'☆'.repeat(4 - d.stars)}</span>
              </div>
              <span className={styles.diffDesc}>{d.desc}</span>
            </button>
          ))}
        </div>
        <div className={styles.btnRow}>
          <button className={styles.btnSecondary} onClick={() => setScreen('mode')}>← BACK</button>
          <button className={styles.btn} disabled={!difficulty} onClick={() => fire()}>INITIATE ESCAPE</button>
        </div>
      </div>
    )
  }

  // ── END: QUICK DIFF PICK (same mode, next round) ────────────
  if (screen === 'end-diff') {
    const result     = roundData?.result
    const titleColor = result === 'escaped' ? '#00ff88' : result === 'caught' ? '#ff3333' : '#ff8800'
    const titleText  = result === 'escaped' ? 'ESCAPED!' : result === 'caught' ? 'CAPTURED' : 'TIME OUT'
    const sub        = result === 'escaped' ? 'YOU MADE IT OUT... THIS TIME.'
                     : result === 'caught'  ? 'THE AI LEARNS FROM YOUR FAILURE.'
                     : 'THE CITY LOCKS DOWN.'
    return (
      <div className={styles.overlay}>
        <div className={styles.badge}>GEN {roundData.generation} — COMPLETE</div>
        <h1 className={styles.title} style={{ color: titleColor }}>{titleText}</h1>
        <p className={styles.sub}>{sub}</p>
        <div className={styles.stats}>
          <div>GA GEN   <span>{roundData.generation}</span></div>
          <div>ESCAPED  <span>{roundData.escaped}</span></div>
          <div>GUARDS   <span>{roundData.guards}</span></div>
          <div>BEST SPD <span>{(roundData.bestGene?.speedMult * 100).toFixed(0)}%</span></div>
          <div>TEAMWORK <span>{(roundData.bestGene?.teamwork * 100).toFixed(0)}%</span></div>
        </div>
        <p className={styles.pickLabel}>SELECT DIFFICULTY</p>
        <div className={styles.diffGrid}>
          {DIFFICULTIES.map(d => (
            <button key={d.id}
              className={`${styles.diffCard} ${difficulty === d.id ? styles.selected : ''}`}
              style={{ '--accent': d.color }}
              onClick={() => { setDifficulty(d.id); fire(d.id) }}
            >
              <div className={styles.diffTop}>
                <span className={styles.diffLabel} style={{ color: d.color }}>{d.label}</span>
                <span className={styles.diffStars}>{'★'.repeat(d.stars)}{'☆'.repeat(4 - d.stars)}</span>
              </div>
              <span className={styles.diffDesc}>{d.desc}</span>
            </button>
          ))}
        </div>
        <button className={styles.btnSecondary} onClick={() => setScreen('mode')}>← CHANGE MODE</button>
      </div>
    )
  }

  // ── END: STATS SCREEN (default after round ends) ────────────
  const result     = roundData?.result
  const titleColor = result === 'escaped' ? '#00ff88' : result === 'caught' ? '#ff3333' : '#ff8800'
  const titleText  = result === 'escaped' ? 'ESCAPED!' : result === 'caught' ? 'CAPTURED' : 'TIME OUT'
  const sub        = result === 'escaped' ? 'YOU MADE IT OUT... THIS TIME.'
                   : result === 'caught'  ? 'THE AI LEARNS FROM YOUR FAILURE.'
                   : 'THE CITY LOCKS DOWN.'
  return (
    <div className={styles.overlay}>
      <div className={styles.badge}>GEN {roundData.generation} — COMPLETE</div>
      <h1 className={styles.title} style={{ color: titleColor }}>{titleText}</h1>
      <p className={styles.sub}>{sub}</p>
      <div className={styles.stats}>
        <div>GA GEN   <span>{roundData.generation}</span></div>
        <div>ESCAPED  <span>{roundData.escaped}</span></div>
        <div>GUARDS   <span>{roundData.guards}</span></div>
        <div>BEST SPD <span>{(roundData.bestGene?.speedMult * 100).toFixed(0)}%</span></div>
        <div>TEAMWORK <span>{(roundData.bestGene?.teamwork * 100).toFixed(0)}%</span></div>
      </div>
      <button className={styles.btn} onClick={() => setScreen('end-diff')}>
        PLAY AGAIN →
      </button>
    </div>
  )
}