// import { Grid } from '../world/Grid.js'
// import { BEHAVIOR } from '../game/constants.js'

// /**
//  * HillClimbing — Guard action selection via local greedy search.
//  *
//  * Why Hill Climbing here?
//  *   - Each frame, the guard scores every possible action
//  *   - It picks the LOCALLY BEST action (greedy, no lookahead)
//  *   - Gene values shift the heuristic weights → evolved guards
//  *     make different decisions than naive guards
//  *
//  * Scored actions:
//  *   CHASE       → head directly for player
//  *   BLOCK       → run to escape point to cut off player
//  *   INVESTIGATE → go to last known location
//  *   SEARCH_BFS  → systematic sweep from current position
//  *   SEARCH_DFS  → aggressive building dive
//  *   PATROL      → follow patrol route
//  */
// export class HillClimbing {
//   /**
//    * @param {object} ctx - { guardTile, playerTile, escapeTile, lastKnown,
//    *                         playerVisible, alertLevel, gene, guardId, totalGuards }
//    * @returns {string} BEHAVIOR constant
//    */
//   static decide(ctx) {
//     const {
//       guardTile, playerTile, escapeTile, lastKnown,
//       playerVisible, alertLevel, gene,
//     } = ctx

//     const scores = {}

//     // ── CHASE ──────────────────────────────────────────────
//     if (playerVisible) {
//       scores[BEHAVIOR.CHASE] = 100 + gene.aggression * 50
//     }

//     // ── BLOCK ESCAPE ───────────────────────────────────────
//     if (playerTile && escapeTile) {
//       const guardToEsc  = Grid.manhattan(guardTile.x, guardTile.y, escapeTile.x, escapeTile.y)
//       const playerToEsc = Grid.manhattan(playerTile.x, playerTile.y, escapeTile.x, escapeTile.y)
//       const blockValue  = (playerToEsc - guardToEsc) * gene.teamwork * 30
//       if (blockValue > 0) scores[BEHAVIOR.BLOCK] = blockValue
//     }

//     // ── INVESTIGATE last known ─────────────────────────────
//     if (lastKnown && alertLevel > 0.3) {
//       const dist = Grid.manhattan(guardTile.x, guardTile.y, lastKnown.x, lastKnown.y)
//       scores[BEHAVIOR.INVESTIGATE] = alertLevel * 60 - dist * 0.5
//     }

//     // ── SEARCH BFS (methodical) ────────────────────────────
//     if (alertLevel > 0.2) {
//       scores[BEHAVIOR.SEARCH] = (1 - gene.aggression) * alertLevel * 40
//     }

//     // ── PATROL (fallback) ──────────────────────────────────
//     scores[BEHAVIOR.PATROL] = gene.patrolFreq * 10

//     // Pick highest scoring action
//     return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0]
//   }
// }
import { Grid } from '../world/Grid.js'
import { BEHAVIOR } from '../game/constants.js'

export class HillClimbing {
  static decide(ctx) {
    const {
      guardTile, playerTile, escapeTile, lastKnown,
      playerVisible, alertLevel, gene,
    } = ctx

    const scores = {}

    // ── CHASE — highest priority when player visible or full alert ──
    if (playerVisible || alertLevel >= 0.99) {
      scores[BEHAVIOR.CHASE] = 1000   // always wins
    } else if (alertLevel > 0.5 && lastKnown) {
      scores[BEHAVIOR.CHASE] = 200 + gene.aggression * 80
    }

    // ── BLOCK escape ───────────────────────────────────────────────
    if (playerTile && escapeTile && alertLevel > 0.5) {
      const guardToEsc  = Grid.manhattan(guardTile.x, guardTile.y, escapeTile.x, escapeTile.y)
      const playerToEsc = Grid.manhattan(playerTile.x, playerTile.y, escapeTile.x, escapeTile.y)
      const blockValue  = (playerToEsc - guardToEsc) * gene.teamwork * 30
      if (blockValue > 0) scores[BEHAVIOR.BLOCK] = blockValue
    }

    // ── INVESTIGATE last known ─────────────────────────────────────
    if (lastKnown && alertLevel > 0.3) {
      const dist = Grid.manhattan(guardTile.x, guardTile.y, lastKnown.x, lastKnown.y)
      scores[BEHAVIOR.INVESTIGATE] = alertLevel * 60 - dist * 0.5
    }

    // ── SEARCH ─────────────────────────────────────────────────────
    if (alertLevel > 0.2) {
      scores[BEHAVIOR.SEARCH] = (1 - gene.aggression) * alertLevel * 40
    }

    // ── PATROL (fallback) ──────────────────────────────────────────
    scores[BEHAVIOR.PATROL] = gene.patrolFreq * 10

    return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0]
  }
}