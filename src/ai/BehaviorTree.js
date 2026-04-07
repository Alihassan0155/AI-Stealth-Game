import { BEHAVIOR } from '../game/constants.js'
import { HillClimbing } from './HillClimbing.js'

export class BehaviorTree {
  constructor(gene) {
    this.gene         = gene
    this.state        = BEHAVIOR.PATROL
    this._chaseSince  = null   
    this._lostSightAt = null   
  }

  tick({ guardTile, playerTile, escapeTile, lastKnown,
         playerVisible, alertLevel, chaseMemorySeconds = 5 }) {

    const now = Date.now() / 1000

    // Track when we last saw the player
    if (playerVisible) {
      this._lostSightAt = null
      this._chaseSince  = this._chaseSince ?? now
    } else if (this.state === BEHAVIOR.CHASE && !this._lostSightAt) {
      this._lostSightAt = now
    }

    // Keep chasing for chaseMemorySeconds after losing sight
    const stillChasing = this._lostSightAt !== null &&
      (now - this._lostSightAt) < chaseMemorySeconds

    if (playerVisible || stillChasing) {
      this.state = BEHAVIOR.CHASE
      return this.state
    }

    // Lost them — reset chase tracking
    if (this._lostSightAt && (now - this._lostSightAt) >= chaseMemorySeconds) {
      this._lostSightAt = null
      this._chaseSince  = null
    }

    this.state = HillClimbing.decide({
      guardTile, playerTile, escapeTile, lastKnown,
      playerVisible, alertLevel,
      gene: this.gene,
    })
    return this.state
  }
}