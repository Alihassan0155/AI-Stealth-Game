// import { TILE_SIZE, COLORS, TILE } from '../game/constants.js'

// const T = TILE_SIZE

// export class Tilemap {
//   static draw(ctx, grid) {
//     for (let y = 0; y < grid.rows; y++) {
//       for (let x = 0; x < grid.cols; x++) {
//         const t = grid.get(x, y)
//         ctx.fillStyle = COLORS[t] ?? '#000'
//         ctx.fillRect(x * T, y * T, T, T)
//       }
//     }

//     ctx.strokeStyle = COLORS.ROAD_LINE
//     ctx.lineWidth = 0.5
//     for (let y = 0; y < grid.rows; y++) {
//       for (let x = 0; x < grid.cols; x++) {
//         if (grid.get(x, y) === TILE.ROAD) ctx.strokeRect(x * T, y * T, T, T)
//       }
//     }

//     const esc = grid.findAll(TILE.ESCAPE)[0]
//     if (esc) {
//       const cx = esc.x * T + T / 2
//       const cy = esc.y * T + T / 2
//       const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, T * 5)
//       grd.addColorStop(0, 'rgba(0,255,136,0.35)')
//       grd.addColorStop(1, 'rgba(0,255,136,0)')
//       ctx.fillStyle = grd
//       ctx.fillRect((esc.x - 5) * T, (esc.y - 5) * T, T * 11, T * 11)
//       const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 400)
//       ctx.fillStyle = COLORS.escapePulse(0.3 + pulse * 0.45)
//       ctx.fillRect(esc.x * T, esc.y * T, T, T)
//     }
//   }

//   // Fog drawn on offscreen canvas so player/guards rendered AFTER are always visible
//   static drawFog(ctx, playerPx, playerPy, visionRadius, canvasW, canvasH) {
//     if (!Tilemap._fogCanvas || Tilemap._fogCanvas.width !== canvasW) {
//       Tilemap._fogCanvas = document.createElement('canvas')
//       Tilemap._fogCanvas.width = canvasW
//       Tilemap._fogCanvas.height = canvasH
//     }
//     const fc = Tilemap._fogCanvas
//     const fct = fc.getContext('2d')

//     fct.clearRect(0, 0, canvasW, canvasH)
//     fct.fillStyle = 'rgba(5,5,8,0.93)'
//     fct.fillRect(0, 0, canvasW, canvasH)

//     fct.globalCompositeOperation = 'destination-out'
//     const grd = fct.createRadialGradient(playerPx, playerPy, 0, playerPx, playerPy, visionRadius)
//     grd.addColorStop(0,    'rgba(0,0,0,1)')
//     grd.addColorStop(0.5,  'rgba(0,0,0,0.98)')
//     grd.addColorStop(0.8,  'rgba(0,0,0,0.5)')
//     grd.addColorStop(1,    'rgba(0,0,0,0)')
//     fct.fillStyle = grd
//     fct.beginPath()
//     fct.arc(playerPx, playerPy, visionRadius, 0, Math.PI * 2)
//     fct.fill()
//     fct.globalCompositeOperation = 'source-over'

//     // Stamp fog onto main canvas — sprites drawn after this sit on top
//     ctx.drawImage(fc, 0, 0)
//   }

//   static drawHeatmap(ctx, heatmap, grid) {
//     for (let y = 0; y < grid.rows; y++) {
//       for (let x = 0; x < grid.cols; x++) {
//         const v = heatmap.get(x, y)
//         if (v > 0.05 && grid.isWalkable(x, y)) {
//           ctx.fillStyle = COLORS.heat(v)
//           ctx.fillRect(x * T, y * T, T, T)
//         }
//       }
//     }
//   }
// }

import { TILE_SIZE, COLORS, TILE } from '../game/constants.js'

const T = TILE_SIZE

export class Tilemap {
  static draw(ctx, grid, lightsOut = false) {
    for (let y = 0; y < grid.rows; y++) {
      for (let x = 0; x < grid.cols; x++) {
        const t = grid.get(x, y)
        ctx.fillStyle = COLORS[t] ?? '#000'
        ctx.fillRect(x * T, y * T, T, T)

        // Red zone tint
        if (t === TILE.REDZONE) {
          ctx.fillStyle = 'rgba(180,0,0,0.18)'
          ctx.fillRect(x * T, y * T, T, T)
        }
      }
    }

    // Road grid lines
    ctx.strokeStyle = COLORS.ROAD_LINE
    ctx.lineWidth   = 0.5
    for (let y = 0; y < grid.rows; y++)
      for (let x = 0; x < grid.cols; x++)
        if (grid.get(x,y) === TILE.ROAD || grid.get(x,y) === TILE.REDZONE)
          ctx.strokeRect(x*T, y*T, T, T)

    // Sewer entrances
    // const sewers = grid.findAll(TILE.SEWER)
    // for (const s of sewers) {
    //   const cx = s.x * T + T / 2
    //   const cy = s.y * T + T / 2
    //   ctx.fillStyle = '#0a3a0a'
    //   ctx.fillRect(s.x * T, s.y * T, T, T)
    //   ctx.font      = `${Math.floor(T * 0.75)}px serif`
    //   ctx.textAlign = 'center'
    //   ctx.fillStyle = '#00aa44'
    //   ctx.fillText('🕳️', cx, cy + T * 0.3)

    //   // Subtle glow
    //   const pulse = 0.3 + 0.2 * Math.sin(Date.now() / 600)
    //   ctx.strokeStyle = `rgba(0,180,80,${pulse})`
    //   ctx.lineWidth   = 1.5
    //   ctx.beginPath()
    //   ctx.arc(cx, cy, T * 0.6, 0, Math.PI * 2)
    //   ctx.stroke()
    // }
    // Among Us style vents
const sewers = grid.findAll(TILE.SEWER)
for (const s of sewers) {
  const sx = s.x * T
  const sy = s.y * T
  const cx = sx + T / 2
  const cy = sy + T / 2

  // Vent base — dark metal floor plate
  ctx.fillStyle = '#1a1a2a'
  ctx.fillRect(sx, sy, T, T)

  // Vent outer frame — rounded rectangle
  ctx.strokeStyle = '#445566'
  ctx.lineWidth   = 1.5
  ctx.fillStyle   = '#0d1520'
  ctx.beginPath()
  ctx.roundRect(sx + 2, sy + 2, T - 4, T - 4, 3)
  ctx.fill()
  ctx.stroke()

  // Vent slats — horizontal bars like a real vent grate
  ctx.strokeStyle = '#445566'
  ctx.lineWidth   = 1.2
  const slats = 4
  const slatSpacing = (T - 6) / (slats + 1)
  for (let i = 1; i <= slats; i++) {
    const gy = sy + 3 + i * slatSpacing
    ctx.beginPath()
    ctx.moveTo(sx + 4, gy)
    ctx.lineTo(sx + T - 4, gy)
    ctx.stroke()
  }

  // Green glow through the slats (Among Us cyan/green tint)
  const pulse = 0.3 + 0.2 * Math.sin(Date.now() / 700 + s.x)
  const grd   = ctx.createRadialGradient(cx, cy, 0, cx, cy, T * 0.7)
  grd.addColorStop(0, `rgba(0,220,120,${pulse})`)
  grd.addColorStop(1, `rgba(0,220,120,0)`)
  ctx.fillStyle = grd
  ctx.beginPath()
  ctx.roundRect(sx + 2, sy + 2, T - 4, T - 4, 3)
  ctx.fill()

  // Screw dots in corners — detail
  ctx.fillStyle = '#334455'
  const screws = [
    [sx + 4, sy + 4], [sx + T - 4, sy + 4],
    [sx + 4, sy + T - 4], [sx + T - 4, sy + T - 4]
  ]
  for (const [scx, scy] of screws) {
    ctx.beginPath()
    ctx.arc(scx, scy, 1.2, 0, Math.PI * 2)
    ctx.fill()
  }
}

    // Keycard
    const keycards = grid.findAll(TILE.KEYCARD)
    for (const k of keycards) {
      const cx  = k.x * T + T / 2
      const cy  = k.y * T + T / 2
      const bob = Math.sin(Date.now() / 400) * 2
      ctx.fillStyle = '#1a1a00'
      ctx.fillRect(k.x * T, k.y * T, T, T)
      ctx.font      = `${Math.floor(T * 0.8)}px serif`
      ctx.textAlign = 'center'
      ctx.fillText('🗝️', cx, cy + T * 0.3 + bob)
      // Glow
      ctx.shadowBlur  = 12
      ctx.shadowColor = '#ffdd00'
      ctx.strokeStyle = `rgba(255,220,0,${0.4 + 0.3 * Math.sin(Date.now() / 300)})`
      ctx.lineWidth   = 1.5
      ctx.beginPath()
      ctx.arc(cx, cy, T * 0.65, 0, Math.PI * 2)
      ctx.stroke()
      ctx.shadowBlur = 0
    }

    // Escape tile
    const esc = grid.findAll(TILE.ESCAPE)[0]
    if (esc) {
      const cx  = esc.x * T + T / 2
      const cy  = esc.y * T + T / 2
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, T * 5)
      grd.addColorStop(0, 'rgba(0,255,136,0.35)')
      grd.addColorStop(1, 'rgba(0,255,136,0)')
      ctx.fillStyle = grd
      ctx.fillRect((esc.x-5)*T, (esc.y-5)*T, T*11, T*11)
      const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 400)
      ctx.fillStyle = COLORS.escapePulse(0.3 + pulse * 0.45)
      ctx.fillRect(esc.x * T, esc.y * T, T, T)
    }

    // Lights out overlay
    if (lightsOut) {
      ctx.fillStyle = 'rgba(0,0,0,0.45)'
      ctx.fillRect(0, 0, grid.cols * T, grid.rows * T)
    }
  }

  static drawFog(ctx, playerPx, playerPy, visionRadius, canvasW, canvasH) {
    if (
      !Tilemap._fogCanvas ||
      Tilemap._fogCanvas.width  !== canvasW ||
      Tilemap._fogCanvas.height !== canvasH
    ) {
      Tilemap._fogCanvas        = document.createElement('canvas')
      Tilemap._fogCanvas.width  = canvasW
      Tilemap._fogCanvas.height = canvasH
    }

    const fc  = Tilemap._fogCanvas
    const fct = fc.getContext('2d')
    fct.clearRect(0, 0, canvasW, canvasH)
    fct.fillStyle = 'rgba(5,5,8,0.93)'
    fct.fillRect(0, 0, canvasW, canvasH)

    fct.globalCompositeOperation = 'destination-out'
    const grd = fct.createRadialGradient(playerPx, playerPy, 0, playerPx, playerPy, visionRadius)
    grd.addColorStop(0,   'rgba(0,0,0,1)')
    grd.addColorStop(0.5, 'rgba(0,0,0,0.98)')
    grd.addColorStop(0.8, 'rgba(0,0,0,0.5)')
    grd.addColorStop(1,   'rgba(0,0,0,0)')
    fct.fillStyle = grd
    fct.beginPath()
    fct.arc(playerPx, playerPy, visionRadius, 0, Math.PI * 2)
    fct.fill()
    fct.globalCompositeOperation = 'source-over'

    ctx.drawImage(fc, 0, 0)
  }

  static drawHeatmap(ctx, heatmap, grid) {
    for (let y = 0; y < grid.rows; y++)
      for (let x = 0; x < grid.cols; x++) {
        const v = heatmap.get(x, y)
        if (v > 0.05 && grid.isWalkable(x, y)) {
          ctx.fillStyle = COLORS.heat(v)
          ctx.fillRect(x * T, y * T, T, T)
        }
      }
  }
}