import { Grid } from '../world/Grid.js'
import { BEHAVIOR } from '../game/constants.js'

export class MultiAgentCoord {
  /**
   * When ANY guard spots the player → alert the ENTIRE squad immediately.
   * Every guard gets the player's last known position and switches to CHASE.
   */
  static broadcastSighting(spotter, playerTile, allGuards) {
    for (const other of allGuards) {
      if (other === spotter) continue

      // Full alert — every guard now knows where you are
      other.alertLevel      = 1
      other.lastKnownPlayer = { ...playerTile }
      other.radioFlash      = 60   // frames to show radio animation

      // Force into chase/investigate — no more wandering
      if (other.state === BEHAVIOR.PATROL || other.state === BEHAVIOR.SEARCH) {
        other.state = BEHAVIOR.CHASE
        // Reset path so they recalculate immediately toward player
        other.path  = []
        other.framesSincePath = 999
      }
    }
  }

  /**
   * Assign ONE guard to block the escape point.
   * Pick the guard already closest to the escape.
   */
  static assignBlocker(guards, escapeTile) {
    // Check if we already have a blocker
    if (guards.some(g => g.state === BEHAVIOR.BLOCK)) return

    let best = null, bestDist = Infinity
    for (const g of guards) {
      if (g.state === BEHAVIOR.CHASE) continue   // keep chasers chasing
      const dist = Grid.manhattan(g.tileX, g.tileY, escapeTile.x, escapeTile.y)
      if (dist < bestDist) { bestDist = dist; best = g }
    }

    if (best) {
      best.state = BEHAVIOR.BLOCK
      best.path  = []
      best.framesSincePath = 999
    }
  }
}