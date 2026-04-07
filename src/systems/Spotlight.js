// import { TILE_SIZE } from '../game/constants.js'

// const T = TILE_SIZE

// /**
//  * Spotlight — directional flashlight cone for guards.
//  *
//  * Points in the guard's movement direction.
//  * 76° wide cone with soft gradient falloff.
//  * Color + flicker changes by alert state.
//  */
// export class Spotlight {
//   /**
//    * @param {CanvasRenderingContext2D} ctx
//    * @param {number} x          - guard pixel x
//    * @param {number} y          - guard pixel y
//    * @param {number} angle      - facing angle in radians
//    * @param {number} range      - vision range in pixels
//    * @param {number} alertLevel - 0 to 1
//    * @param {string} state      - BEHAVIOR constant
//    */
//   static draw(ctx, x, y, angle, range, alertLevel, state) {
//     const HALF_ANGLE = (Math.PI / 180) * 38   // 76° total cone width

//     // Color by state
//     const isChase  = state === 'chase' || state === 'block'
//     const isSearch = state === 'search' || state === 'investigate'
//     const rgb      = isChase  ? '255,60,0'
//                    : isSearch ? '255,210,0'
//                    : '255,80,80'

//     // Flicker effect on full alert
//     const flicker    = alertLevel > 0.85 ? 1 - Math.random() * 0.12 : 1
//     const coneRange  = range * flicker

//     ctx.save()

//     // Cone radial gradient — bright near guard, fades out
//     const grd = ctx.createRadialGradient(x, y, T * 0.2, x, y, coneRange)
//     grd.addColorStop(0,   `rgba(${rgb},${0.22 * flicker})`)
//     grd.addColorStop(0.4, `rgba(${rgb},${0.14 * flicker})`)
//     grd.addColorStop(0.8, `rgba(${rgb},${0.06 * flicker})`)
//     grd.addColorStop(1,   `rgba(${rgb},0)`)
//     ctx.fillStyle = grd

//     // Draw cone as arc sector
//     ctx.beginPath()
//     ctx.moveTo(x, y)
//     ctx.arc(x, y, coneRange, angle - HALF_ANGLE, angle + HALF_ANGLE)
//     ctx.closePath()
//     ctx.fill()

//     // Subtle hard edge lines on cone sides
//     ctx.strokeStyle = `rgba(${rgb},${0.18 * alertLevel})`
//     ctx.lineWidth   = 1
//     ctx.beginPath()
//     ctx.moveTo(x, y)
//     ctx.lineTo(
//       x + Math.cos(angle - HALF_ANGLE) * coneRange,
//       y + Math.sin(angle - HALF_ANGLE) * coneRange
//     )
//     ctx.moveTo(x, y)
//     ctx.lineTo(
//       x + Math.cos(angle + HALF_ANGLE) * coneRange,
//       y + Math.sin(angle + HALF_ANGLE) * coneRange
//     )
//     ctx.stroke()

//     ctx.restore()
//   }
// }

import { TILE_SIZE } from '../game/constants.js'

const T = TILE_SIZE

export class Spotlight {
  static draw(ctx, x, y, angle, range, alertLevel, state) {
    const HALF_ANGLE = (Math.PI / 180) * 38

    const isChase  = state === 'chase' || state === 'block'
    const isSearch = state === 'search' || state === 'investigate'

    // NO yellow — search uses orange, chase uses red, patrol uses dim red
    const rgb = isChase  ? '255,40,0'
              : isSearch ? '255,120,0'   // orange instead of yellow
              : '200,60,60'

    const flicker   = alertLevel > 0.85 ? 1 - Math.random() * 0.12 : 1
    const coneRange = range * flicker

    ctx.save()

    const grd = ctx.createRadialGradient(x, y, T * 0.2, x, y, coneRange)
    grd.addColorStop(0,   `rgba(${rgb},${0.22 * flicker})`)
    grd.addColorStop(0.4, `rgba(${rgb},${0.14 * flicker})`)
    grd.addColorStop(0.8, `rgba(${rgb},${0.06 * flicker})`)
    grd.addColorStop(1,   `rgba(${rgb},0)`)
    ctx.fillStyle = grd

    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.arc(x, y, coneRange, angle - HALF_ANGLE, angle + HALF_ANGLE)
    ctx.closePath()
    ctx.fill()

    ctx.strokeStyle = `rgba(${rgb},${0.15 * alertLevel})`
    ctx.lineWidth   = 1
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + Math.cos(angle - HALF_ANGLE) * coneRange, y + Math.sin(angle - HALF_ANGLE) * coneRange)
    ctx.moveTo(x, y)
    ctx.lineTo(x + Math.cos(angle + HALF_ANGLE) * coneRange, y + Math.sin(angle + HALF_ANGLE) * coneRange)
    ctx.stroke()

    ctx.restore()
  }
}