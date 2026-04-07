import { TILE_SIZE } from '../game/constants.js'

const GRID = { COLS: 60, ROWS: 40 }

const { COLS, ROWS } = GRID

/**
 * HeatMap — Probabilistic player location tracking.
 *
 * When guards lose sight of the player, the heatmap retains
 * a "memory" of where they last saw / heard them.
 * Heat spreads and decays over time, so guards naturally search
 * the most likely locations first.
 *
 * This creates the realistic effect of guards converging on
 * where you were, not where you are.
 */
export class HeatMap {
  constructor() {
    this.map = new Float32Array(COLS * ROWS)
  }

  _idx(x, y) { return y * COLS + x }

  get(x, y) {
    if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return 0
    return this.map[this._idx(x, y)]
  }

  set(x, y, v) {
    if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return
    this.map[this._idx(x, y)] = Math.min(1, Math.max(0, v))
  }

  /** Spike heat around a point (player spotted / heard) */
  spike(x, y, radius = 4) {
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const d  = Math.sqrt(dx * dx + dy * dy)
        if (d > radius) continue
        const cx = x + dx, cy = y + dy
        if (cx < 0 || cy < 0 || cx >= COLS || cy >= ROWS) continue
        const i = this._idx(cx, cy)
        this.map[i] = Math.max(this.map[i], 1 - d / radius)
      }
    }
  }

  /** Decay all heat values each frame */
  decay(rate = 0.004) {
    for (let i = 0; i < this.map.length; i++)
      this.map[i] = Math.max(0, this.map[i] - rate)
  }

  /** Spread heat to adjacent tiles (diffusion) */
  spread() {
    const tmp = new Float32Array(this.map.length)
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const v = this.get(x, y)
        tmp[this._idx(x, y)] += v * 0.6
        for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
          const nx = x + dx, ny = y + dy
          if (nx >= 0 && ny >= 0 && nx < COLS && ny < ROWS)
            tmp[this._idx(nx, ny)] += v * 0.1
        }
      }
    }
    for (let i = 0; i < this.map.length; i++)
      this.map[i] = Math.min(1, tmp[i])
  }

  /** Return the tile with highest heat */
  hottest() {
    let bx = 0, by = 0, bv = 0
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const v = this.get(x, y)
        if (v > bv) { bv = v; bx = x; by = y }
      }
    }
    return { x: bx, y: by, v: bv }
  }

  reset() {
    this.map.fill(0)
  }
}
