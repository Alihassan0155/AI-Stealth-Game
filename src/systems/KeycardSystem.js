// import { TILE } from '../game/constants.js'

// export class KeycardSystem {
//   constructor() {
//     this.collected = false
//     this.pos       = null
//   }

//   reset(keycardPos) {
//     this.collected = false
//     this.pos       = keycardPos
//   }

//   update(playerTileX, playerTileY, grid) {
//     if (this.collected || !this.pos) return false
//     const dist = Math.abs(playerTileX - this.pos.x) + Math.abs(playerTileY - this.pos.y)
//     if (dist <= 1) {
//       this.collected = true
//       if (grid) grid.set(this.pos.x, this.pos.y, TILE.ROAD)
//       return true
//     }
//     return false
//   }

//   get isUnlocked() {
//     return this.collected || !this.pos
//   }
// }

import { TILE } from '../game/constants.js'

export class KeycardSystem {
  constructor() {
    this._positions = []
    this._collected = []
    this._total     = 1
  }

  // positions: single {x,y} or array
  reset(positions, total = 1) {
    this._total     = total
    this._positions = Array.isArray(positions)
      ? positions
      : (positions ? [positions] : [])
    this._collected = new Array(this._positions.length).fill(false)
  }

  get pos()       { return this._positions[0] || null }
  get positions() { return this._positions }

  update(playerTileX, playerTileY, grid) {
    let anyCollected = false
    for (let i = 0; i < this._positions.length; i++) {
      if (this._collected[i]) continue
      const p = this._positions[i]
      if (Math.abs(playerTileX - p.x) + Math.abs(playerTileY - p.y) <= 1) {
        this._collected[i] = true
        if (grid) grid.set(p.x, p.y, TILE.ROAD)
        anyCollected = true
      }
    }
    return anyCollected
  }

  get collectedCount() { return this._collected.filter(Boolean).length }
  get remaining()      { return this._positions.filter((_, i) => !this._collected[i]) }
  get isUnlocked()     { return this._positions.length === 0 || this._collected.every(Boolean) }
  get collected()      { return this.isUnlocked }
}
