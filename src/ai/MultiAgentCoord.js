import { Grid } from '../world/Grid.js'
import { BEHAVIOR } from '../game/constants.js'

export class MultiAgentCoord {
  static broadcastSighting(spotter, playerTile, allGuards) {
    for (const other of allGuards) {
      if (other === spotter) continue
      other.alertLevel      = 1
      other.lastKnownPlayer = { ...playerTile }
      other.radioFlash      = 60

      if (other.state === BEHAVIOR.PATROL || other.state === BEHAVIOR.SEARCH) {
        other.state           = BEHAVIOR.CHASE
        other.path            = []
        other.framesSincePath = 999
      }
    }

    // Spread guards out — assign different intercept roles
    MultiAgentCoord._assignRoles(allGuards, playerTile, spotter)
  }

  /**
   * Instead of all guards chasing from same direction,
   * assign intercept angles so they spread around the player.
   */
  static _assignRoles(allGuards, playerTile, spotter) {
    const chasers = allGuards.filter(g => g !== spotter && g.state === BEHAVIOR.CHASE)
    if (chasers.length < 2) return

    // Sort by angle to player — assign intercept offsets
    chasers.forEach((g, i) => {
      const angle     = (i / chasers.length) * Math.PI * 2
      const intercept = {
        x: playerTile.x + Math.round(Math.cos(angle) * 4),
        y: playerTile.y + Math.round(Math.sin(angle) * 4),
      }
      // Clamp to grid
      intercept.x = Math.max(0, Math.min(g.grid.cols - 1, intercept.x))
      intercept.y = Math.max(0, Math.min(g.grid.rows - 1, intercept.y))
      g._interceptTarget = intercept
    })
  }

  static assignBlocker(guards, escapeTile) {
    if (guards.some(g => g.state === BEHAVIOR.BLOCK)) return
    let best = null, bestDist = Infinity
    for (const g of guards) {
      if (g.state === BEHAVIOR.CHASE) continue
      const dist = Grid.manhattan(g.tileX, g.tileY, escapeTile.x, escapeTile.y)
      if (dist < bestDist) { bestDist = dist; best = g }
    }
    if (best) {
      best.state           = BEHAVIOR.BLOCK
      best.path            = []
      best.framesSincePath = 999
    }
  }
}