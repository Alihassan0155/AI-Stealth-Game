// // // import { useEffect, useRef, useState, useCallback } from 'react'
// // // import { Game }     from '../game/Game.js'
// // // import { EventBus } from '../systems/EventBus.js'

// // // /**
// // //  * useGameLoop — React hook that owns the Game instance.
// // //  *
// // //  * Returns: { canvasRef, gameState, roundData, startRound, toggleDebug }
// // //  */
// // // export function useGameLoop() {
// // //   const canvasRef  = useRef(null)
// // //   const gameRef    = useRef(null)

// // //   const [gameState, setGameState] = useState('menu')   // menu | playing | end
// // //   const [roundData, setRoundData] = useState(null)
// // //   const [hud, setHud]             = useState({
// // //     round: 1, guards: 0, alertLevel: 0, timeLeft: 180, escaped: 0, globalAlert: false,
// // //   })

// // //   // Init game once canvas is mounted
// // //   useEffect(() => {
// // //     if (!canvasRef.current) return
// // //     const game = new Game(canvasRef.current)
// // //     gameRef.current = game
// // //     game.drawMenuPreview()

// // //     // HUD ticker
// // //     const ticker = setInterval(() => {
// // //       if (!gameRef.current || gameRef.current.state !== 'playing') return
// // //       const g = gameRef.current
// // //       const maxAlert = g.guards?.length
// // //         ? Math.max(...g.guards.map(guard => guard.alertLevel))
// // //         : 0
// // //       setHud({
// // //         round:       g.round,
// // //         guards:      g.guards?.length ?? 0,
// // //         alertLevel:  maxAlert,
// // //         timeLeft:    Math.max(0, g.timeLeft),
// // //         escaped:     g.escaped,
// // //         globalAlert: g.globalAlert,
// // //       })
// // //     }, 100)

// // //     // Round end event
// // //     const unsub = EventBus.on('round:end', (data) => {
// // //       setRoundData(data)
// // //       setGameState('end')
// // //     })

// // //     return () => {
// // //       clearInterval(ticker)
// // //       unsub()
// // //       gameRef.current?.stop()
// // //     }
// // //   }, [])

// // //   const startRound = useCallback(() => {
// // //     setGameState('playing')
// // //     setRoundData(null)
// // //     gameRef.current?.startRound()
// // //   }, [])

// // //   const toggleDebug = useCallback(() => {
// // //     if (gameRef.current) gameRef.current.debug = !gameRef.current.debug
// // //   }, [])

// // //   return { canvasRef, gameState, roundData, hud, startRound, toggleDebug }
// // // }

// // import { useEffect, useRef, useState, useCallback } from 'react'
// // import { Game }     from '../game/Game.js'
// // import { EventBus } from '../systems/EventBus.js'

// // export function useGameLoop() {
// //   const canvasRef  = useRef(null)
// //   const gameRef    = useRef(null)

// //   const [gameState, setGameState] = useState('menu')
// //   const [roundData, setRoundData] = useState(null)
// //   const [hud, setHud]             = useState({
// //     round: 1, guards: 0, alertLevel: 0, timeLeft: 180, escaped: 0, globalAlert: false,
// //   })

// //   useEffect(() => {
// //     if (!canvasRef.current) return
// //     const game = new Game(canvasRef.current)
// //     gameRef.current = game
// //     game.drawMenuPreview()

// //     const ticker = setInterval(() => {
// //       if (!gameRef.current || gameRef.current.state !== 'playing') return
// //       const g = gameRef.current
// //       const maxAlert = g.guards?.length
// //         ? Math.max(...g.guards.map(guard => guard.alertLevel))
// //         : 0
// //       setHud({
// //         round:       g.round,
// //         guards:      g.guards?.length ?? 0,
// //         alertLevel:  maxAlert,
// //         timeLeft:    Math.max(0, g.timeLeft),
// //         escaped:     g.escaped,
// //         globalAlert: g.globalAlert,
// //       })
// //     }, 100)

// //     const unsub = EventBus.on('round:end', (data) => {
// //       setRoundData(data)
// //       setGameState('end')
// //     })

// //     return () => { clearInterval(ticker); unsub(); gameRef.current?.stop() }
// //   }, [])

// //   // config = { mode, difficulty }
// //   const startRound = useCallback((config = {}) => {
// //     setGameState('playing')
// //     setRoundData(null)
// //     gameRef.current?.startRound(config)
// //   }, [])

// //   const toggleDebug = useCallback(() => {
// //     if (gameRef.current) gameRef.current.debug = !gameRef.current.debug
// //   }, [])

// //   return { canvasRef, gameState, roundData, hud, startRound, toggleDebug }
// // }
// import { useEffect, useRef, useState, useCallback } from 'react'
// import { Game }     from '../game/Game.js'
// import { EventBus } from '../systems/EventBus.js'

// export function useGameLoop() {
//   const canvasRef  = useRef(null)
//   const gameRef    = useRef(null)

//   const [gameState, setGameState] = useState('menu')
//   const [roundData, setRoundData] = useState(null)
//   const [hud, setHud]             = useState({
//     round: 1, guards: 0, alertLevel: 0, timeLeft: 180, escaped: 0, globalAlert: false,
//   })

//   useEffect(() => {
//     if (!canvasRef.current) return
//     const game = new Game(canvasRef.current)
//     gameRef.current = game
//     game.drawMenuPreview()

//     const ticker = setInterval(() => {
//       if (!gameRef.current || gameRef.current.state !== 'playing') return
//       const g = gameRef.current
//       const maxAlert = g.guards?.length
//         ? Math.max(...g.guards.map(guard => guard.alertLevel))
//         : 0
//       setHud({
//         round:         g.round,
//         guards:        g.guards?.length ?? 0,
//         alertLevel:    maxAlert,
//         timeLeft:      Math.max(0, g.timeLeft),
//         escaped:       g.escaped,
//         globalAlert:   g.globalAlert,
//         mode:          g._mode,
//         difficulty:    g._difficulty,
//         keysCollected: g.keycard?.collectedCount ?? 0,
//         keysTotal:     g.keycard?._total ?? 0,
//         wantedLevel:   g.wanted?.level ?? 0,
//       })
//     }, 100)

//     const unsub = EventBus.on('round:end', (data) => {
//       setRoundData(data)
//       setGameState('end')
//     })

//     return () => { clearInterval(ticker); unsub(); gameRef.current?.stop() }
//   }, [])

//   // config = { mode, difficulty }
//   const startRound = useCallback((config = {}) => {
//     setGameState('playing')
//     setRoundData(null)
//     gameRef.current?.startRound(config)
//   }, [])

//   const toggleDebug = useCallback(() => {
//     if (gameRef.current) gameRef.current.debug = !gameRef.current.debug
//   }, [])

//   return { canvasRef, gameState, roundData, hud, startRound, toggleDebug }
// }

import { useEffect, useRef, useState, useCallback } from 'react'
import { Game }     from '../game/Game.js'
import { EventBus } from '../systems/EventBus.js'

export function useGameLoop() {
  const canvasRef  = useRef(null)
  const gameRef    = useRef(null)

  const [gameState, setGameState] = useState('menu')
  const [roundData, setRoundData] = useState(null)
  const [hud, setHud]             = useState({
    guards: 0, alertLevel: 0, timeLeft: 180, escaped: 0, globalAlert: false,
  })

  useEffect(() => {
    if (!canvasRef.current) return
    const game = new Game(canvasRef.current)
    gameRef.current = game
    game.drawMenuPreview()

    const ticker = setInterval(() => {
      if (!gameRef.current || gameRef.current.state !== 'playing') return
      const g = gameRef.current
      const maxAlert = g.guards?.length
        ? Math.max(...g.guards.map(guard => guard.alertLevel))
        : 0
      setHud({
        guards:        g.guards?.length ?? 0,
        alertLevel:    maxAlert,
        timeLeft:      Math.max(0, g.timeLeft),
        escaped:       g.escaped,
        globalAlert:   g.globalAlert,
        mode:          g._mode,
        difficulty:    g._difficulty,
        keysCollected: g.keycard?.collectedCount ?? 0,
        keysTotal:     g.keycard?._total ?? 0,
        wantedLevel:   g.wanted?.level ?? 0,
      })
    }, 100)

    const unsub = EventBus.on('round:end', (data) => {
      setRoundData(data)
      setGameState('end')
    })

    return () => { clearInterval(ticker); unsub(); gameRef.current?.stop() }
  }, [])

  // config = { mode, difficulty }
  const startRound = useCallback((config = {}) => {
    setGameState('playing')
    setRoundData(null)
    gameRef.current?.startRound(config)
  }, [])

  const toggleDebug = useCallback(() => {
    if (gameRef.current) gameRef.current.debug = !gameRef.current.debug
  }, [])

  return { canvasRef, gameState, roundData, hud, startRound, toggleDebug }
}