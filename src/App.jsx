
// import { useState, useCallback, useEffect, useRef } from 'react'
// import { useGameLoop } from './hooks/useGameLoop.js'
// import { HUD }         from './ui/HUD.jsx'
// import { Overlay }     from './ui/Overlay.jsx'
// import { GenePanel }   from './ui/GenePanel.jsx'
// import { Legend }      from './ui/Legend.jsx'
// import styles from './App.module.css'

// const GAME_W = 1200
// const GAME_H = 800

// export default function App() {
//   const { canvasRef, gameState, roundData, hud, startRound, toggleDebug } = useGameLoop()
//   const [showGenes, setShowGenes] = useState(false)
//   const [scale, setScale]         = useState(1)
//   const wrapRef                   = useRef(null)

//   // Recalculate scale whenever window resizes
//   useEffect(() => {
//     const HUD_H  = 48    // approx HUD height
//     const HINT_H = 28    // approx hint bar height

//     function recalc() {
//       const availW = window.innerWidth
//       const availH = window.innerHeight - HUD_H - HINT_H
//       const s = Math.min(availW / GAME_W, availH / GAME_H, 1)
//       setScale(s)
//     }

//     recalc()
//     window.addEventListener('resize', recalc)
//     return () => window.removeEventListener('resize', recalc)
//   }, [])

//   const handleKeyDown = useCallback((e) => {
//     if (e.code === 'KeyG') setShowGenes(v => !v)
//   }, [])

//   return (
//     <div className={styles.app} onKeyDown={handleKeyDown} tabIndex={0}>

//       <HUD hud={hud} onDebug={toggleDebug} onNewMap={startRound} />

//       <div className={styles.canvasOuter} ref={wrapRef}>
//         <div
//           className={styles.canvasWrap}
//           style={{
//             width:     GAME_W,
//             height:    GAME_H,
//             transform: `scale(${scale})`,
//           }}
//         >
//           <canvas ref={canvasRef} />

//           {hud.globalAlert && gameState === 'playing' && (
//             <div className={styles.alertBanner}>
//               ⚠ PLAYER DETECTED — ALL UNITS CONVERGE
//             </div>
//           )}

//           <GenePanel visible={showGenes} bestGene={roundData?.bestGene} />

//           <Overlay
//             gameState={gameState}
//             roundData={roundData}
//             onStart={startRound}
//           />
//         </div>
//       </div>

//       <div className={styles.hint}>
//         WASD/ARROWS — move &nbsp;|&nbsp;
//         SHIFT — sprint &nbsp;|&nbsp;
//         CTRL — crouch &nbsp;|&nbsp;
//         TAB — debug &nbsp;|&nbsp;
//         G — genes
//       </div>

//       <Legend />
//     </div>
//   )
// }

import { useState, useCallback, useEffect, useRef } from 'react'
import { useGameLoop } from './hooks/useGameLoop.js'
import { HUD }         from './ui/HUD.jsx'
import { Overlay }     from './ui/Overlay.jsx'
import { GenePanel }   from './ui/GenePanel.jsx'
import { Legend }      from './ui/Legend.jsx'
import styles from './App.module.css'

const GAME_W = 1200
const GAME_H = 800

export default function App() {
  const { canvasRef, gameState, roundData, hud, startRound, toggleDebug } = useGameLoop()
  const [showGenes, setShowGenes] = useState(false)
  const [scale, setScale]         = useState(1)
  const outerRef                  = useRef(null)

  useEffect(() => {
    function recalc() {
      if (!outerRef.current) return
      const rect = outerRef.current.getBoundingClientRect()
      // Scale so the 1200x800 world fits entirely inside the available box
      const s = Math.min(rect.width / GAME_W, rect.height / GAME_H, 1)
      setScale(Math.max(0.1, s))
    }
    // Small delay so DOM has measured the actual sizes after layout
    const t = setTimeout(recalc, 0)
    window.addEventListener('resize', recalc)
    return () => { clearTimeout(t); window.removeEventListener('resize', recalc) }
  }, [])

  const handleKeyDown = useCallback((e) => {
    if (e.code === 'KeyG') setShowGenes(v => !v)
    if (e.code === 'Tab')  { e.preventDefault(); toggleDebug() }
  }, [toggleDebug])

  return (
    <div className={styles.app} onKeyDown={handleKeyDown} tabIndex={0}>

      <HUD hud={hud} onDebug={toggleDebug} onNewMap={startRound} />

      {/* This div is measured — scale is calculated from its actual pixel size */}
      <div className={styles.canvasOuter} ref={outerRef}>
        <div
          className={styles.canvasWrap}
          style={{ transform: `scale(${scale})` }}
        >
          <canvas ref={canvasRef} />

          {hud.globalAlert && gameState === 'playing' && (
            <div className={styles.alertBanner}>
              ⚠ PLAYER DETECTED — ALL UNITS CONVERGE
            </div>
          )}

          <GenePanel visible={showGenes} bestGene={roundData?.bestGene} />

          <Overlay
            gameState={gameState}
            roundData={roundData}
            onStart={startRound}
          />
        </div>
      </div>

      <div className={styles.hint}>
        WASD/ARROWS — move &nbsp;|&nbsp;
        SHIFT — sprint &nbsp;|&nbsp;
        CTRL — crouch &nbsp;|&nbsp;
        TAB — debug &nbsp;|&nbsp;
        G — genes
      </div>

      <Legend />
    </div>
  )
}
