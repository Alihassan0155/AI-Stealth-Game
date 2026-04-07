// // // // // // import { TILE_SIZE, GUARD_CFG, BEHAVIOR, COLORS } from '../game/constants.js'
// // // // // // import { AStar }            from '../ai/AStar.js'
// // // // // // import { BFS }              from '../ai/BFS.js'
// // // // // // import { DFS }              from '../ai/DFS.js'
// // // // // // import { BehaviorTree }     from '../ai/BehaviorTree.js'
// // // // // // import { VisibilitySystem } from './VisibilitySystem.js'
// // // // // // import { MultiAgentCoord }  from './MultiAgentCoord.js'

// // // // // // const T = TILE_SIZE

// // // // // // export class Guard {
// // // // // //   constructor({ tileX, tileY, gene, id, geneIdx, grid, escapeTile }) {
// // // // // //     this.tileX      = tileX
// // // // // //     this.tileY      = tileY
// // // // // //     this.pixelX     = tileX * T + T / 2
// // // // // //     this.pixelY     = tileY * T + T / 2

// // // // // //     this.gene       = gene
// // // // // //     this.id         = id
// // // // // //     this.geneIdx    = geneIdx
// // // // // //     this.grid       = grid
// // // // // //     this.escapeTile = escapeTile

// // // // // //     this.state           = BEHAVIOR.PATROL
// // // // // //     this.alertLevel      = 0
// // // // // //     this.lastKnownPlayer = null

// // // // // //     this.path            = []
// // // // // //     this.pathIdx         = 1
// // // // // //     this.debugPath       = []
// // // // // //     this.framesSincePath = 0
// // // // // //     this._walkFrame      = 0
// // // // // //     this._moving         = false
// // // // // //     this._facingLeft     = false

// // // // // //     this.bfsQueue  = []
// // // // // //     this.bfsStep   = 0
// // // // // //     this.dfsQueue  = []
// // // // // //     this.dfsStep   = 0

// // // // // //     this.wanderTarget = null
// // // // // //     this.wanderTimer  = 0

// // // // // //     this.patrol    = this._buildPatrol()
// // // // // //     this.patrolIdx = 0

// // // // // //     this.speed      = (GUARD_CFG.BASE_SPEED + gene.speedMult * 0.8) * T
// // // // // //     this.visionPx   = (GUARD_CFG.BASE_VISION + gene.visionMult * 3) * T
// // // // // //     this.hearRadius = (GUARD_CFG.HEAR_BASE   + gene.searchRadius * 4)

// // // // // //     this.tree  = new BehaviorTree(gene)
// // // // // //     this.color = COLORS.GUARD_PATROL
// // // // // //   }

// // // // // //   // ── Main update ─────────────────────────────────────────────

// // // // // //   update(dt, playerTile, playerVisible, heatmap, allGuards, ga) {
// // // // // //     this.framesSincePath++
// // // // // //     this.alertLevel = Math.max(0, this.alertLevel - GUARD_CFG.ALERT_DECAY * dt * 60)

// // // // // //     if (playerVisible) {
// // // // // //       this.alertLevel      = 1
// // // // // //       this.lastKnownPlayer = { ...playerTile }
// // // // // //       ga.recordSpot(this.geneIdx)
// // // // // //       MultiAgentCoord.broadcastSighting(this, playerTile, allGuards)
// // // // // //     }

// // // // // //     this.state = this.tree.tick({
// // // // // //       guardTile:     { x: this.tileX, y: this.tileY },
// // // // // //       playerTile:    playerVisible ? playerTile : null,
// // // // // //       escapeTile:    this.escapeTile,
// // // // // //       lastKnown:     this.lastKnownPlayer,
// // // // // //       playerVisible,
// // // // // //       alertLevel:    this.alertLevel,
// // // // // //     })

// // // // // //     if (this.alertLevel > 0.8)
// // // // // //       MultiAgentCoord.assignBlocker(allGuards, this.escapeTile)

// // // // // //     const target = this._resolveTarget(heatmap)

// // // // // //     const recalcInterval = Math.max(15, GUARD_CFG.PATH_RECALC - Math.floor(this.gene.predictionAcc * 20))
// // // // // //     if (target && (this.framesSincePath > recalcInterval || this.path.length === 0)) {
// // // // // //       this.path  = AStar.findPath(this.grid, this.tileX, this.tileY, target.x, target.y)
// // // // // //       this.pathIdx = 1
// // // // // //       this.debugPath = this.path
// // // // // //       this.framesSincePath = 0
// // // // // //     }

// // // // // //     this._followPath(dt)
// // // // // //     this._updateColor()
// // // // // //   }

// // // // // //   // ── Resolve movement target ──────────────────────────────────

// // // // // //   _resolveTarget(heatmap) {
// // // // // //     switch (this.state) {
// // // // // //       case BEHAVIOR.CHASE:
// // // // // //         return this.lastKnownPlayer

// // // // // //       case BEHAVIOR.BLOCK:
// // // // // //         return this.escapeTile

// // // // // //       case BEHAVIOR.INVESTIGATE:
// // // // // //         if (!this.lastKnownPlayer) return null
// // // // // //         if (this._distTo(this.lastKnownPlayer) < 2) {
// // // // // //           if (this.gene.aggression > 0.5) {
// // // // // //             this.dfsQueue = DFS.sweep(this.grid, this.tileX, this.tileY, 60)
// // // // // //             this.dfsStep  = 0
// // // // // //           } else {
// // // // // //             this.bfsQueue = BFS.sweep(this.grid, this.tileX, this.tileY, 80)
// // // // // //             this.bfsStep  = 0
// // // // // //           }
// // // // // //           this.state = BEHAVIOR.SEARCH
// // // // // //         }
// // // // // //         return this.lastKnownPlayer

// // // // // //       case BEHAVIOR.SEARCH: {
// // // // // //         const queue = this.gene.aggression > 0.5 ? this.dfsQueue : this.bfsQueue
// // // // // //         const step  = this.gene.aggression > 0.5 ? this.dfsStep  : this.bfsStep
// // // // // //         if (step < queue.length) {
// // // // // //           const t = queue[step]
// // // // // //           if (this._distTo(t) < 2) {
// // // // // //             if (this.gene.aggression > 0.5) this.dfsStep++
// // // // // //             else this.bfsStep++
// // // // // //           }
// // // // // //           return t
// // // // // //         }
// // // // // //         const hot = heatmap.hottest()
// // // // // //         if (hot.v > 0.1) return hot
// // // // // //         this.state = BEHAVIOR.PATROL
// // // // // //         return null
// // // // // //       }

// // // // // //       case BEHAVIOR.PATROL: {
// // // // // //         const arrived  = this.wanderTarget && this._distTo(this.wanderTarget) < 2
// // // // // //         const timedOut = this.wanderTimer <= 0
// // // // // //         if (!this.wanderTarget || arrived || timedOut) {
// // // // // //           this.wanderTarget = this._pickRandomWaypoint()
// // // // // //           this.wanderTimer  = 180 + Math.random() * 240
// // // // // //         }
// // // // // //         this.wanderTimer--
// // // // // //         return this.wanderTarget
// // // // // //       }

// // // // // //       default: return null
// // // // // //     }
// // // // // //   }

// // // // // //   // ── Follow A* path ───────────────────────────────────────────

// // // // // //   _followPath(dt) {
// // // // // //     if (this.path.length < 2 || this.pathIdx >= this.path.length) {
// // // // // //       this._moving = false
// // // // // //       return
// // // // // //     }

// // // // // //     const next = this.path[this.pathIdx]
// // // // // //     const tpx  = next.x * T + T / 2
// // // // // //     const tpy  = next.y * T + T / 2
// // // // // //     const dx   = tpx - this.pixelX
// // // // // //     const dy   = tpy - this.pixelY
// // // // // //     const dist = Math.hypot(dx, dy)
// // // // // //     const spd  = this.speed * dt

// // // // // //     if (dist < spd + 1) {
// // // // // //       this.pixelX = tpx; this.pixelY = tpy
// // // // // //       this.tileX  = next.x; this.tileY = next.y
// // // // // //       this.pathIdx++
// // // // // //     } else {
// // // // // //       this.pixelX += (dx / dist) * spd
// // // // // //       this.pixelY += (dy / dist) * spd
// // // // // //     }
    
// // // // // //     this._moving      = dist > 1
// // // // // //     this._facingLeft  = dx < 0
// // // // // //     this._walkFrame  += spd * 0.25
// // // // // //     if (dist > 1) this._facingAngle = Math.atan2(dy, dx)
// // // // // //   }

// // // // // //   // ── Visibility & hearing ─────────────────────────────────────

// // // // // //   canSeePlayer(playerPixelX, playerPixelY) {
// // // // // //     return VisibilitySystem.hasLineOfSight(
// // // // // //       this.grid,
// // // // // //       this.pixelX, this.pixelY,
// // // // // //       playerPixelX, playerPixelY,
// // // // // //       this.visionPx
// // // // // //     )
// // // // // //   }

// // // // // //   hearPlayer(playerTile, playerNoise) {
// // // // // //     const d = Math.hypot(this.tileX - playerTile.x, this.tileY - playerTile.y)
// // // // // //     return d < this.hearRadius * playerNoise
// // // // // //   }

// // // // // //   // ── Patrol / wander helpers ───────────────────────────────────

// // // // // //   _pickRandomWaypoint() {
// // // // // //     const COLS = this.grid.cols
// // // // // //     const ROWS = this.grid.rows
// // // // // //     for (let i = 0; i < 20; i++) {
// // // // // //       const rx = Math.floor(Math.random() * COLS)
// // // // // //       const ry = Math.floor(Math.random() * ROWS)
// // // // // //       if (!this.grid.isWalkable(rx, ry)) continue
// // // // // //       const d = this._distTo({ x: rx, y: ry })
// // // // // //       if (d > 4 && d < 20) return { x: rx, y: ry }
// // // // // //     }
// // // // // //     for (let i = 0; i < 50; i++) {
// // // // // //       const rx = Math.floor(Math.random() * COLS)
// // // // // //       const ry = Math.floor(Math.random() * ROWS)
// // // // // //       if (this.grid.isWalkable(rx, ry)) return { x: rx, y: ry }
// // // // // //     }
// // // // // //     return { x: this.tileX, y: this.tileY }
// // // // // //   }

// // // // // //   _buildPatrol() {
// // // // // //     const order = BFS.sweep(this.grid, this.tileX, this.tileY, 40)
// // // // // //     const pts   = [{ x: this.tileX, y: this.tileY }]
// // // // // //     for (let i = 5; i < order.length; i += 8) pts.push(order[i])
// // // // // //     return pts
// // // // // //   }

// // // // // //   _distTo(tile) {
// // // // // //     return Math.abs(this.tileX - tile.x) + Math.abs(this.tileY - tile.y)
// // // // // //   }

// // // // // //   _updateColor() {
// // // // // //     if (this.state === BEHAVIOR.CHASE || this.state === BEHAVIOR.BLOCK)
// // // // // //       this.color = COLORS.GUARD_ALERT
// // // // // //     else if (this.state === BEHAVIOR.SEARCH || this.state === BEHAVIOR.INVESTIGATE)
// // // // // //       this.color = COLORS.GUARD_SEARCH
// // // // // //     else
// // // // // //       this.color = COLORS.GUARD_PATROL
// // // // // //   }

// // // // // //   // ── Render ───────────────────────────────────────────────────

// // // // // //   draw(ctx, debug) {
// // // // // //     const x = this.pixelX
// // // // // //     const y = this.pixelY
// // // // // //     const s = T * 0.88

// // // // // //     // Soft vision glow behind character
// // // // // //     const vColor = this.state === BEHAVIOR.CHASE || this.state === BEHAVIOR.BLOCK
// // // // // //       ? '255,80,0'
// // // // // //       : this.state === BEHAVIOR.SEARCH || this.state === BEHAVIOR.INVESTIGATE
// // // // // //         ? '220,220,0' : '255,51,51'
// // // // // //     const vGrd = ctx.createRadialGradient(x, y, 0, x, y, this.visionPx)
// // // // // //     vGrd.addColorStop(0,   `rgba(${vColor},0.08)`)
// // // // // //     vGrd.addColorStop(0.6, `rgba(${vColor},0.03)`)
// // // // // //     vGrd.addColorStop(1,   `rgba(${vColor},0)`)
// // // // // //     ctx.fillStyle = vGrd
// // // // // //     ctx.beginPath()
// // // // // //     ctx.arc(x, y, this.visionPx, 0, Math.PI * 2)
// // // // // //     ctx.fill()

// // // // // //     // Alert ! or ? above head
// // // // // //     if (this.alertLevel > 0.6) {
// // // // // //       const mark   = this.alertLevel > 0.85 ? '!' : '?'
// // // // // //       const bounce = Math.sin(Date.now() / 150) * 3
// // // // // //       ctx.font      = `bold ${Math.floor(s * 0.7)}px monospace`
// // // // // //       ctx.textAlign = 'center'
// // // // // //       ctx.fillStyle  = this.alertLevel > 0.85 ? '#ff3333' : '#ffcc00'
// // // // // //       ctx.shadowBlur  = 8
// // // // // //       ctx.shadowColor = ctx.fillStyle
// // // // // //       ctx.fillText(mark, x, y - s * 1.55 + bounce)
// // // // // //       ctx.shadowBlur = 0
// // // // // //     }

// // // // // //     ctx.save()
// // // // // //     ctx.translate(x, y)
// // // // // //     if (this._facingLeft) ctx.scale(-1, 1)

// // // // // //     const legSwing = this._moving ? Math.sin(this._walkFrame) * 0.3 : 0
// // // // // //     const bodyColor = this.state === BEHAVIOR.CHASE || this.state === BEHAVIOR.BLOCK
// // // // // //       ? '#b71c1c'
// // // // // //       : this.state === BEHAVIOR.SEARCH || this.state === BEHAVIOR.INVESTIGATE
// // // // // //         ? '#e65100' : '#c62828'

// // // // // //     // Left leg
// // // // // //     ctx.save()
// // // // // //     ctx.translate(-s * 0.16, s * 0.22)
// // // // // //     ctx.rotate(-legSwing)
// // // // // //     ctx.fillStyle = '#1a237e'
// // // // // //     ctx.beginPath()
// // // // // //     ctx.roundRect(-s*0.11, 0, s*0.2, s*0.42, s*0.07)
// // // // // //     ctx.fill()
// // // // // //     ctx.fillStyle = '#0d1117'
// // // // // //     ctx.beginPath()
// // // // // //     ctx.ellipse(0, s*0.43, s*0.13, s*0.08, 0, 0, Math.PI*2)
// // // // // //     ctx.fill()
// // // // // //     ctx.restore()

// // // // // //     // Right leg
// // // // // //     ctx.save()
// // // // // //     ctx.translate(s * 0.16, s * 0.22)
// // // // // //     ctx.rotate(legSwing)
// // // // // //     ctx.fillStyle = '#1a237e'
// // // // // //     ctx.beginPath()
// // // // // //     ctx.roundRect(-s*0.11, 0, s*0.2, s*0.42, s*0.07)
// // // // // //     ctx.fill()
// // // // // //     ctx.fillStyle = '#0d1117'
// // // // // //     ctx.beginPath()
// // // // // //     ctx.ellipse(0, s*0.43, s*0.13, s*0.08, 0, 0, Math.PI*2)
// // // // // //     ctx.fill()
// // // // // //     ctx.restore()

// // // // // //     // Body
// // // // // //     ctx.fillStyle   = bodyColor
// // // // // //     ctx.shadowBlur  = this.alertLevel > 0.5 ? 14 : 5
// // // // // //     ctx.shadowColor = this.color
// // // // // //     ctx.beginPath()
// // // // // //     ctx.roundRect(-s*0.3, -s*0.15, s*0.6, s*0.44, s*0.12)
// // // // // //     ctx.fill()
// // // // // //     ctx.shadowBlur = 0

// // // // // //     // Badge
// // // // // //     ctx.fillStyle = '#ffd600'
// // // // // //     ctx.beginPath()
// // // // // //     ctx.arc(-s*0.1, s*0.04, s*0.09, 0, Math.PI*2)
// // // // // //     ctx.fill()
// // // // // //     ctx.fillStyle = '#0d1117'
// // // // // //     ctx.font      = `bold ${Math.floor(s * 0.12)}px monospace`
// // // // // //     ctx.textAlign = 'center'
// // // // // //     ctx.fillText('★', -s*0.1, s*0.08)

// // // // // //     // Left arm
// // // // // //     const armSwing = this._moving ? Math.sin(this._walkFrame + Math.PI) * 0.35 : 0
// // // // // //     ctx.save()
// // // // // //     ctx.translate(-s*0.32, -s*0.08)
// // // // // //     ctx.rotate(armSwing - 0.15)
// // // // // //     ctx.fillStyle = bodyColor
// // // // // //     ctx.beginPath()
// // // // // //     ctx.roundRect(-s*0.09, 0, s*0.18, s*0.32, s*0.07)
// // // // // //     ctx.fill()
// // // // // //     ctx.restore()

// // // // // //     // Right arm
// // // // // //     ctx.save()
// // // // // //     ctx.translate(s*0.32, -s*0.08)
// // // // // //     ctx.rotate(-armSwing + 0.15)
// // // // // //     ctx.fillStyle = bodyColor
// // // // // //     ctx.beginPath()
// // // // // //     ctx.roundRect(-s*0.09, 0, s*0.18, s*0.32, s*0.07)
// // // // // //     ctx.fill()
// // // // // //     ctx.restore()

// // // // // //     // Head
// // // // // //     ctx.fillStyle   = '#ffcc80'
// // // // // //     ctx.shadowBlur  = 6
// // // // // //     ctx.shadowColor = this.color
// // // // // //     ctx.beginPath()
// // // // // //     ctx.arc(0, -s*0.38, s*0.26, 0, Math.PI * 2)
// // // // // //     ctx.fill()
// // // // // //     ctx.shadowBlur = 0

// // // // // //     // Police hat
// // // // // //     ctx.fillStyle = bodyColor
// // // // // //     ctx.beginPath()
// // // // // //     ctx.roundRect(-s*0.28, -s*0.62, s*0.56, s*0.2, [s*0.06, s*0.06, 0, 0])
// // // // // //     ctx.fill()
// // // // // //     ctx.fillRect(-s*0.32, -s*0.44, s*0.64, s*0.08)
// // // // // //     ctx.fillStyle = '#ffd600'
// // // // // //     ctx.beginPath()
// // // // // //     ctx.arc(0, -s*0.56, s*0.07, 0, Math.PI*2)
// // // // // //     ctx.fill()

// // // // // //     // Eyes
// // // // // //     const isAlert = this.alertLevel > 0.5
// // // // // //     ctx.fillStyle = isAlert ? '#b71c1c' : '#1a237e'
// // // // // //     ctx.beginPath()
// // // // // //     ctx.arc(-s*0.1, -s*0.4, s*0.06, 0, Math.PI*2)
// // // // // //     ctx.fill()
// // // // // //     ctx.beginPath()
// // // // // //     ctx.arc(s*0.1, -s*0.4, s*0.06, 0, Math.PI*2)
// // // // // //     ctx.fill()
// // // // // //     ctx.fillStyle = 'white'
// // // // // //     ctx.beginPath()
// // // // // //     ctx.arc(-s*0.08, -s*0.42, s*0.022, 0, Math.PI*2)
// // // // // //     ctx.fill()
// // // // // //     ctx.beginPath()
// // // // // //     ctx.arc(s*0.12, -s*0.42, s*0.022, 0, Math.PI*2)
// // // // // //     ctx.fill()

// // // // // //     // Mouth
// // // // // //     ctx.strokeStyle = '#5d3a1a'
// // // // // //     ctx.lineWidth   = s * 0.04
// // // // // //     ctx.lineCap     = 'round'
// // // // // //     ctx.beginPath()
// // // // // //     if (isAlert) {
// // // // // //       ctx.moveTo(-s*0.1, -s*0.28)
// // // // // //       ctx.lineTo(s*0.1,  -s*0.28)
// // // // // //     } else {
// // // // // //       ctx.arc(0, -s*0.22, s*0.1, Math.PI + 0.3, -0.3)
// // // // // //     }
// // // // // //     ctx.stroke()

// // // // // //     ctx.restore()

// // // // // //     // Debug: A* path
// // // // // //     if (debug && this.debugPath.length > 1) {
// // // // // //       ctx.strokeStyle = COLORS.ASTAR_PATH
// // // // // //       ctx.lineWidth   = 1.5
// // // // // //       ctx.beginPath()
// // // // // //       this.debugPath.forEach((p, i) => {
// // // // // //         const px = p.x * T + T / 2, py = p.y * T + T / 2
// // // // // //         i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
// // // // // //       })
// // // // // //       ctx.stroke()
// // // // // //     }
// // // // // //   }
// // // // // // }
// // // // // import { TILE_SIZE, GUARD_CFG, BEHAVIOR, COLORS } from '../game/constants.js'
// // // // // import { AStar }            from '../ai/AStar.js'
// // // // // import { BFS }              from '../ai/BFS.js'
// // // // // import { DFS }              from '../ai/DFS.js'
// // // // // import { BehaviorTree }     from '../ai/BehaviorTree.js'
// // // // // import { VisibilitySystem } from './VisibilitySystem.js'
// // // // // import { MultiAgentCoord }  from './MultiAgentCoord.js'

// // // // // const T = TILE_SIZE

// // // // // function rr(ctx, x, y, w, h, r) {
// // // // //   r = Math.min(r, w / 2, h / 2)
// // // // //   ctx.beginPath()
// // // // //   ctx.moveTo(x + r, y)
// // // // //   ctx.lineTo(x + w - r, y)
// // // // //   ctx.arcTo(x + w, y,     x + w, y + r,     r)
// // // // //   ctx.lineTo(x + w, y + h - r)
// // // // //   ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
// // // // //   ctx.lineTo(x + r, y + h)
// // // // //   ctx.arcTo(x,     y + h, x,       y + h - r, r)
// // // // //   ctx.lineTo(x,     y + r)
// // // // //   ctx.arcTo(x,     y,     x + r,   y,         r)
// // // // //   ctx.closePath()
// // // // // }

// // // // // export class Guard {
// // // // //   constructor({ tileX, tileY, gene, id, geneIdx, grid, escapeTile }) {
// // // // //     this.tileX      = tileX
// // // // //     this.tileY      = tileY
// // // // //     this.pixelX     = tileX * T + T / 2
// // // // //     this.pixelY     = tileY * T + T / 2

// // // // //     this.gene       = gene
// // // // //     this.id         = id
// // // // //     this.geneIdx    = geneIdx
// // // // //     this.grid       = grid
// // // // //     this.escapeTile = escapeTile

// // // // //     this.state           = BEHAVIOR.PATROL
// // // // //     this.alertLevel      = 0
// // // // //     this.lastKnownPlayer = null
// // // // //     this._isHearing      = false
// // // // //     this._interceptTarget = null

// // // // //     this.path            = []
// // // // //     this.pathIdx         = 1
// // // // //     this.debugPath       = []
// // // // //     this.framesSincePath = 0
// // // // //     this._walkFrame      = 0
// // // // //     this._moving         = false
// // // // //     this._facingLeft     = false
// // // // //     this._facingAngle    = 0

// // // // //     this.bfsQueue  = []
// // // // //     this.bfsStep   = 0
// // // // //     this.dfsQueue  = []
// // // // //     this.dfsStep   = 0

// // // // //     this.wanderTarget = null
// // // // //     this.wanderTimer  = 0

// // // // //     // Smarter patrol — build waypoints near exit
// // // // //     this.patrol    = this._buildSmartPatrol()
// // // // //     this.patrolIdx = 0

// // // // //     this.speed      = (GUARD_CFG.BASE_SPEED + gene.speedMult * 0.8) * T
// // // // //     this.visionPx   = (GUARD_CFG.BASE_VISION + gene.visionMult * 3) * T
// // // // //     this.hearRadius = (GUARD_CFG.HEAR_BASE   + gene.searchRadius * 4)

// // // // //     this.tree  = new BehaviorTree(gene)
// // // // //     this.color = COLORS.GUARD_PATROL
// // // // //   }

// // // // //   update(dt, playerTile, playerVisible, heatmap, allGuards, ga, wantedSpeedMult = 1) {
// // // // //     this.framesSincePath++
// // // // //     this._isHearing = false
// // // // //     this.alertLevel = Math.max(0, this.alertLevel - GUARD_CFG.ALERT_DECAY * dt * 60)

// // // // //     if (playerVisible) {
// // // // //       this.alertLevel      = 1
// // // // //       this.lastKnownPlayer = { ...playerTile }
// // // // //       // Face toward last known position
// // // // //       this._facingAngle = Math.atan2(
// // // // //         playerTile.y * T - this.pixelY,
// // // // //         playerTile.x * T - this.pixelX
// // // // //       )
// // // // //       ga.recordSpot(this.geneIdx)
// // // // //       MultiAgentCoord.broadcastSighting(this, playerTile, allGuards)
// // // // //     } else if (this.lastKnownPlayer) {
// // // // //       // Gradually rotate vision toward last known position
// // // // //       const targetAngle = Math.atan2(
// // // // //         this.lastKnownPlayer.y * T - this.pixelY,
// // // // //         this.lastKnownPlayer.x * T - this.pixelX
// // // // //       )
// // // // //       const diff = targetAngle - this._facingAngle
// // // // //       const wrapped = ((diff + Math.PI) % (Math.PI * 2)) - Math.PI
// // // // //       this._facingAngle += wrapped * dt * 1.5
// // // // //     }

// // // // //     this.state = this.tree.tick({
// // // // //       guardTile:          { x: this.tileX, y: this.tileY },
// // // // //       playerTile:         playerVisible ? playerTile : null,
// // // // //       escapeTile:         this.escapeTile,
// // // // //       lastKnown:          this.lastKnownPlayer,
// // // // //       playerVisible,
// // // // //       alertLevel:         this.alertLevel,
// // // // //       chaseMemorySeconds: GUARD_CFG.CHASE_MEMORY,
// // // // //     })

// // // // //     if (this.alertLevel > 0.8)
// // // // //       MultiAgentCoord.assignBlocker(allGuards, this.escapeTile)

// // // // //     const target = this._resolveTarget(heatmap)

// // // // //     const recalcInterval = Math.max(12, GUARD_CFG.PATH_RECALC - Math.floor(this.gene.predictionAcc * 20))
// // // // //     if (target && (this.framesSincePath > recalcInterval || this.path.length === 0)) {
// // // // //       this.path        = AStar.findPath(this.grid, this.tileX, this.tileY, target.x, target.y)
// // // // //       this.pathIdx     = 1
// // // // //       this.debugPath   = this.path
// // // // //       this.framesSincePath = 0
// // // // //     }

// // // // //     this._followPath(dt, wantedSpeedMult)
// // // // //     this._updateColor()
// // // // //   }

// // // // //   setHearing(heard) { this._isHearing = heard }

// // // // //   _resolveTarget(heatmap) {
// // // // //     switch (this.state) {
// // // // //       case BEHAVIOR.CHASE:
// // // // //         // Use intercept target if assigned, otherwise direct chase
// // // // //         if (this._interceptTarget) {
// // // // //           const d = this._distTo(this._interceptTarget)
// // // // //           if (d < 3) this._interceptTarget = null
// // // // //           else return this._interceptTarget
// // // // //         }
// // // // //         return this.lastKnownPlayer

// // // // //       case BEHAVIOR.BLOCK: return this.escapeTile

// // // // //       case BEHAVIOR.INVESTIGATE:
// // // // //         if (!this.lastKnownPlayer) return null
// // // // //         if (this._distTo(this.lastKnownPlayer) < 2) {
// // // // //           if (this.gene.aggression > 0.5) {
// // // // //             this.dfsQueue = DFS.sweep(this.grid, this.tileX, this.tileY, 60)
// // // // //             this.dfsStep  = 0
// // // // //           } else {
// // // // //             this.bfsQueue = BFS.sweep(this.grid, this.tileX, this.tileY, 80)
// // // // //             this.bfsStep  = 0
// // // // //           }
// // // // //           this.state = BEHAVIOR.SEARCH
// // // // //         }
// // // // //         return this.lastKnownPlayer

// // // // //       case BEHAVIOR.SEARCH: {
// // // // //         const queue = this.gene.aggression > 0.5 ? this.dfsQueue : this.bfsQueue
// // // // //         const step  = this.gene.aggression > 0.5 ? this.dfsStep  : this.bfsStep
// // // // //         if (step < queue.length) {
// // // // //           const t = queue[step]
// // // // //           if (this._distTo(t) < 2) {
// // // // //             if (this.gene.aggression > 0.5) this.dfsStep++
// // // // //             else this.bfsStep++
// // // // //           }
// // // // //           return t
// // // // //         }
// // // // //         const hot = heatmap.hottest()
// // // // //         if (hot.v > 0.1) return hot
// // // // //         this.state = BEHAVIOR.PATROL
// // // // //         return null
// // // // //       }

// // // // //       case BEHAVIOR.PATROL: {
// // // // //         // Use smart patrol waypoints near exit
// // // // //         const wp = this.patrol[this.patrolIdx % this.patrol.length]
// // // // //         if (this._distTo(wp) < 2) this.patrolIdx++
// // // // //         return wp
// // // // //       }

// // // // //       default: return null
// // // // //     }
// // // // //   }

// // // // //   _followPath(dt, speedMult = 1) {
// // // // //     if (this.path.length < 2 || this.pathIdx >= this.path.length) {
// // // // //       this._moving = false
// // // // //       return
// // // // //     }
// // // // //     const next = this.path[this.pathIdx]
// // // // //     const tpx  = next.x * T + T / 2
// // // // //     const tpy  = next.y * T + T / 2
// // // // //     const dx   = tpx - this.pixelX
// // // // //     const dy   = tpy - this.pixelY
// // // // //     const dist = Math.hypot(dx, dy)
// // // // //     const spd  = this.speed * speedMult * dt

// // // // //     if (dist < spd + 1) {
// // // // //       this.pixelX = tpx; this.pixelY = tpy
// // // // //       this.tileX  = next.x; this.tileY = next.y
// // // // //       this.pathIdx++
// // // // //     } else {
// // // // //       this.pixelX += (dx / dist) * spd
// // // // //       this.pixelY += (dy / dist) * spd
// // // // //     }

// // // // //     this._moving     = dist > 1
// // // // //     this._facingLeft = dx < 0
// // // // //     this._walkFrame += spd * 0.25
// // // // //     if (dist > 1) this._facingAngle = Math.atan2(dy, dx)
// // // // //   }

// // // // //   canSeePlayer(playerPixelX, playerPixelY) {
// // // // //     return VisibilitySystem.hasLineOfSight(
// // // // //       this.grid,
// // // // //       this.pixelX, this.pixelY,
// // // // //       playerPixelX, playerPixelY,
// // // // //       this.visionPx
// // // // //     )
// // // // //   }

// // // // //   hearPlayer(playerTile, playerNoise) {
// // // // //     const d = Math.hypot(this.tileX - playerTile.x, this.tileY - playerTile.y)
// // // // //     return d < this.hearRadius * playerNoise
// // // // //   }

// // // // //   // Smart patrol — mostly near exit, some random
// // // // //   _buildSmartPatrol() {
// // // // //     const pts = []
// // // // //     // 60% waypoints near escape tile
// // // // //     const exitArea = BFS.sweep(this.grid, this.escapeTile.x, this.escapeTile.y, 30)
// // // // //     for (let i = 3; i < exitArea.length; i += 6) pts.push(exitArea[i])

// // // // //     // 40% random waypoints elsewhere
// // // // //     const random = BFS.sweep(this.grid, this.tileX, this.tileY, 40)
// // // // //     for (let i = 5; i < random.length; i += 10) pts.push(random[i])

// // // // //     return pts.length > 0 ? pts : [{ x: this.tileX, y: this.tileY }]
// // // // //   }

// // // // //   _pickRandomWaypoint() {
// // // // //     const COLS = this.grid.cols
// // // // //     const ROWS = this.grid.rows
// // // // //     for (let i = 0; i < 20; i++) {
// // // // //       const rx = Math.floor(Math.random() * COLS)
// // // // //       const ry = Math.floor(Math.random() * ROWS)
// // // // //       if (!this.grid.isWalkable(rx, ry)) continue
// // // // //       const d = this._distTo({ x: rx, y: ry })
// // // // //       if (d > 4 && d < 20) return { x: rx, y: ry }
// // // // //     }
// // // // //     for (let i = 0; i < 50; i++) {
// // // // //       const rx = Math.floor(Math.random() * COLS)
// // // // //       const ry = Math.floor(Math.random() * ROWS)
// // // // //       if (this.grid.isWalkable(rx, ry)) return { x: rx, y: ry }
// // // // //     }
// // // // //     return { x: this.tileX, y: this.tileY }
// // // // //   }

// // // // //   _buildPatrol() { return this._buildSmartPatrol() }
// // // // //   _distTo(tile)  { return Math.abs(this.tileX - tile.x) + Math.abs(this.tileY - tile.y) }

// // // // //   _updateColor() {
// // // // //     if (this.state === BEHAVIOR.CHASE || this.state === BEHAVIOR.BLOCK)
// // // // //       this.color = COLORS.GUARD_ALERT
// // // // //     else if (this.state === BEHAVIOR.SEARCH || this.state === BEHAVIOR.INVESTIGATE)
// // // // //       this.color = COLORS.GUARD_SEARCH
// // // // //     else
// // // // //       this.color = COLORS.GUARD_PATROL
// // // // //   }

// // // // //   // draw(ctx, debug) {
// // // // //   //   const x = this.pixelX
// // // // //   //   const y = this.pixelY
// // // // //   //   const s = T * 0.88

// // // // //   //   // Hearing highlight
// // // // //   //   if (this._isHearing) {
// // // // //   //     const pulse = 0.6 + 0.4 * Math.sin(Date.now() / 80)
// // // // //   //     ctx.save()
// // // // //   //     ctx.strokeStyle = `rgba(255,230,0,${pulse})`
// // // // //   //     ctx.lineWidth   = 3
// // // // //   //     ctx.shadowBlur  = 18
// // // // //   //     ctx.shadowColor = '#ffdd00'
// // // // //   //     ctx.beginPath()
// // // // //   //     ctx.arc(x, y, s * 1.05, 0, Math.PI * 2)
// // // // //   //     ctx.stroke()
// // // // //   //     ctx.fillStyle = 'rgba(255,220,0,0.08)'
// // // // //   //     ctx.beginPath()
// // // // //   //     ctx.arc(x, y, s * 1.05, 0, Math.PI * 2)
// // // // //   //     ctx.fill()
// // // // //   //     ctx.restore()

// // // // //   //     ctx.save()
// // // // //   //     ctx.font      = `${Math.floor(s * 0.65)}px serif`
// // // // //   //     ctx.textAlign = 'center'
// // // // //   //     const bounce  = Math.sin(Date.now() / 120) * 2
// // // // //   //     ctx.fillStyle   = '#ffdd00'
// // // // //   //     ctx.shadowBlur  = 10
// // // // //   //     ctx.shadowColor = '#ffaa00'
// // // // //   //     ctx.fillText('👂', x, y - s * 1.55 + bounce)
// // // // //   //     ctx.shadowBlur = 0
// // // // //   //     ctx.restore()
// // // // //   //   }

// // // // //   //   // Alert ! or ?
// // // // //   //   if (this.alertLevel > 0.6 && !this._isHearing) {
// // // // //   //     const mark   = this.alertLevel > 0.85 ? '!' : '?'
// // // // //   //     const bounce = Math.sin(Date.now() / 150) * 3
// // // // //   //     ctx.font      = `bold ${Math.floor(s * 0.7)}px monospace`
// // // // //   //     ctx.textAlign = 'center'
// // // // //   //     ctx.fillStyle  = this.alertLevel > 0.85 ? '#ff3333' : '#ffcc00'
// // // // //   //     ctx.shadowBlur  = 8
// // // // //   //     ctx.shadowColor = ctx.fillStyle
// // // // //   //     ctx.fillText(mark, x, y - s * 1.55 + bounce)
// // // // //   //     ctx.shadowBlur = 0
// // // // //   //   }

// // // // //   //   ctx.save()
// // // // //   //   ctx.translate(x, y)
// // // // //   //   if (this._facingLeft) ctx.scale(-1, 1)

// // // // //   //   const legSwing  = this._moving ? Math.sin(this._walkFrame) * 0.3 : 0
// // // // //   //   const bodyColor = this.state === BEHAVIOR.CHASE || this.state === BEHAVIOR.BLOCK
// // // // //   //     ? '#b71c1c'
// // // // //   //     : this.state === BEHAVIOR.SEARCH || this.state === BEHAVIOR.INVESTIGATE
// // // // //   //       ? '#e65100' : '#c62828'

// // // // //   //   // Legs
// // // // //   //   ctx.save()
// // // // //   //   ctx.translate(-s*0.16, s*0.22)
// // // // //   //   ctx.rotate(-legSwing)
// // // // //   //   ctx.fillStyle = '#1a237e'
// // // // //   //   rr(ctx, -s*0.11, 0, s*0.2, s*0.42, s*0.07); ctx.fill()
// // // // //   //   ctx.fillStyle = '#0d1117'
// // // // //   //   ctx.beginPath(); ctx.ellipse(0, s*0.43, s*0.13, s*0.08, 0, 0, Math.PI*2); ctx.fill()
// // // // //   //   ctx.restore()

// // // // //   //   ctx.save()
// // // // //   //   ctx.translate(s*0.16, s*0.22)
// // // // //   //   ctx.rotate(legSwing)
// // // // //   //   ctx.fillStyle = '#1a237e'
// // // // //   //   rr(ctx, -s*0.11, 0, s*0.2, s*0.42, s*0.07); ctx.fill()
// // // // //   //   ctx.fillStyle = '#0d1117'
// // // // //   //   ctx.beginPath(); ctx.ellipse(0, s*0.43, s*0.13, s*0.08, 0, 0, Math.PI*2); ctx.fill()
// // // // //   //   ctx.restore()

// // // // //   //   // Body
// // // // //   //   ctx.fillStyle   = bodyColor
// // // // //   //   ctx.shadowBlur  = this._isHearing ? 20 : this.alertLevel > 0.5 ? 14 : 5
// // // // //   //   ctx.shadowColor = this._isHearing ? '#ffdd00' : this.color
// // // // //   //   rr(ctx, -s*0.3, -s*0.15, s*0.6, s*0.44, s*0.12); ctx.fill()
// // // // //   //   ctx.shadowBlur = 0

// // // // //   //   // Badge
// // // // //   //   ctx.fillStyle = '#ffd600'
// // // // //   //   ctx.beginPath(); ctx.arc(-s*0.1, s*0.04, s*0.09, 0, Math.PI*2); ctx.fill()
// // // // //   //   ctx.fillStyle = '#0d1117'
// // // // //   //   ctx.font = `bold ${Math.floor(s*0.12)}px monospace`
// // // // //   //   ctx.textAlign = 'center'
// // // // //   //   ctx.fillText('★', -s*0.1, s*0.08)

// // // // //   //   // Arms
// // // // //   //   const armSwing = this._moving ? Math.sin(this._walkFrame + Math.PI) * 0.35 : 0
// // // // //   //   ctx.save()
// // // // //   //   ctx.translate(-s*0.32, -s*0.08); ctx.rotate(armSwing - 0.15)
// // // // //   //   ctx.fillStyle = bodyColor
// // // // //   //   rr(ctx, -s*0.09, 0, s*0.18, s*0.32, s*0.07); ctx.fill()
// // // // //   //   ctx.restore()

// // // // //   //   ctx.save()
// // // // //   //   ctx.translate(s*0.32, -s*0.08); ctx.rotate(-armSwing + 0.15)
// // // // //   //   ctx.fillStyle = bodyColor
// // // // //   //   rr(ctx, -s*0.09, 0, s*0.18, s*0.32, s*0.07); ctx.fill()
// // // // //   //   ctx.restore()

// // // // //   //   // Head
// // // // //   //   ctx.fillStyle   = '#ffcc80'
// // // // //   //   ctx.shadowBlur  = 6
// // // // //   //   ctx.shadowColor = this._isHearing ? '#ffdd00' : this.color
// // // // //   //   ctx.beginPath(); ctx.arc(0, -s*0.38, s*0.26, 0, Math.PI*2); ctx.fill()
// // // // //   //   ctx.shadowBlur = 0

// // // // //   //   // Hat
// // // // //   //   ctx.fillStyle = bodyColor
// // // // //   //   rr(ctx, -s*0.28, -s*0.62, s*0.56, s*0.2, s*0.06); ctx.fill()
// // // // //   //   ctx.fillRect(-s*0.32, -s*0.44, s*0.64, s*0.08)
// // // // //   //   ctx.fillStyle = '#ffd600'
// // // // //   //   ctx.beginPath(); ctx.arc(0, -s*0.56, s*0.07, 0, Math.PI*2); ctx.fill()

// // // // //   //   // Eyes
// // // // //   //   const isAlert = this.alertLevel > 0.5
// // // // //   //   ctx.fillStyle = this._isHearing ? '#ff9800' : isAlert ? '#b71c1c' : '#1a237e'
// // // // //   //   ctx.beginPath(); ctx.arc(-s*0.1, -s*0.4, s*0.06, 0, Math.PI*2); ctx.fill()
// // // // //   //   ctx.beginPath(); ctx.arc(s*0.1, -s*0.4, s*0.06, 0, Math.PI*2); ctx.fill()
// // // // //   //   ctx.fillStyle = 'white'
// // // // //   //   ctx.beginPath(); ctx.arc(-s*0.08, -s*0.42, s*0.022, 0, Math.PI*2); ctx.fill()
// // // // //   //   ctx.beginPath(); ctx.arc(s*0.12, -s*0.42, s*0.022, 0, Math.PI*2); ctx.fill()

// // // // //   //   // Mouth
// // // // //   //   ctx.strokeStyle = '#5d3a1a'
// // // // //   //   ctx.lineWidth   = s * 0.04
// // // // //   //   ctx.lineCap     = 'round'
// // // // //   //   ctx.beginPath()
// // // // //   //   if (isAlert || this._isHearing) {
// // // // //   //     ctx.moveTo(-s*0.1, -s*0.28); ctx.lineTo(s*0.1, -s*0.28)
// // // // //   //   } else {
// // // // //   //     ctx.arc(0, -s*0.22, s*0.1, Math.PI + 0.3, -0.3)
// // // // //   //   }
// // // // //   //   ctx.stroke()
// // // // //   //   ctx.restore()

// // // // //   //   if (debug && this.debugPath.length > 1) {
// // // // //   //     ctx.strokeStyle = COLORS.ASTAR_PATH
// // // // //   //     ctx.lineWidth   = 1.5
// // // // //   //     ctx.beginPath()
// // // // //   //     this.debugPath.forEach((p, i) => {
// // // // //   //       const px = p.x*T+T/2, py = p.y*T+T/2
// // // // //   //       i === 0 ? ctx.moveTo(px,py) : ctx.lineTo(px,py)
// // // // //   //     })
// // // // //   //     ctx.stroke()
// // // // //   //   }
// // // // //   // }
// // // // //   draw(ctx, debug) {
// // // // //     const x = this.pixelX
// // // // //     const y = this.pixelY
// // // // //     const s = T * 0.88

// // // // //     // Alert ! or ? above head — only when alert, no hearing ring
// // // // //     if (this.alertLevel > 0.6) {
// // // // //       const mark   = this.alertLevel > 0.85 ? '!' : '?'
// // // // //       const bounce = Math.sin(Date.now() / 150) * 3
// // // // //       ctx.font      = `bold ${Math.floor(s * 0.7)}px monospace`
// // // // //       ctx.textAlign = 'center'
// // // // //       ctx.fillStyle  = this.alertLevel > 0.85 ? '#ff3333' : '#ffcc00'
// // // // //       ctx.shadowBlur  = 8
// // // // //       ctx.shadowColor = ctx.fillStyle
// // // // //       ctx.fillText(mark, x, y - s * 1.55 + bounce)
// // // // //       ctx.shadowBlur = 0
// // // // //     }

// // // // //     ctx.save()
// // // // //     ctx.translate(x, y)
// // // // //     if (this._facingLeft) ctx.scale(-1, 1)

// // // // //     const legSwing  = this._moving ? Math.sin(this._walkFrame) * 0.3 : 0
// // // // //     const bodyColor = this.state === BEHAVIOR.CHASE || this.state === BEHAVIOR.BLOCK
// // // // //       ? '#b71c1c'
// // // // //       : this.state === BEHAVIOR.SEARCH || this.state === BEHAVIOR.INVESTIGATE
// // // // //         ? '#e65100' : '#c62828'

// // // // //     // Left leg
// // // // //     ctx.save()
// // // // //     ctx.translate(-s*0.16, s*0.22)
// // // // //     ctx.rotate(-legSwing)
// // // // //     ctx.fillStyle = '#1a237e'
// // // // //     rr(ctx, -s*0.11, 0, s*0.2, s*0.42, s*0.07); ctx.fill()
// // // // //     ctx.fillStyle = '#0d1117'
// // // // //     ctx.beginPath(); ctx.ellipse(0, s*0.43, s*0.13, s*0.08, 0, 0, Math.PI*2); ctx.fill()
// // // // //     ctx.restore()

// // // // //     // Right leg
// // // // //     ctx.save()
// // // // //     ctx.translate(s*0.16, s*0.22)
// // // // //     ctx.rotate(legSwing)
// // // // //     ctx.fillStyle = '#1a237e'
// // // // //     rr(ctx, -s*0.11, 0, s*0.2, s*0.42, s*0.07); ctx.fill()
// // // // //     ctx.fillStyle = '#0d1117'
// // // // //     ctx.beginPath(); ctx.ellipse(0, s*0.43, s*0.13, s*0.08, 0, 0, Math.PI*2); ctx.fill()
// // // // //     ctx.restore()

// // // // //     // Body
// // // // //     ctx.fillStyle   = bodyColor
// // // // //     ctx.shadowBlur  = this.alertLevel > 0.5 ? 10 : 4
// // // // //     ctx.shadowColor = this.color
// // // // //     rr(ctx, -s*0.3, -s*0.15, s*0.6, s*0.44, s*0.12); ctx.fill()
// // // // //     ctx.shadowBlur = 0

// // // // //     // Badge
// // // // //     ctx.fillStyle = '#ffd600'
// // // // //     ctx.beginPath(); ctx.arc(-s*0.1, s*0.04, s*0.09, 0, Math.PI*2); ctx.fill()
// // // // //     ctx.fillStyle = '#0d1117'
// // // // //     ctx.font = `bold ${Math.floor(s*0.12)}px monospace`
// // // // //     ctx.textAlign = 'center'
// // // // //     ctx.fillText('★', -s*0.1, s*0.08)

// // // // //     // Arms
// // // // //     const armSwing = this._moving ? Math.sin(this._walkFrame + Math.PI) * 0.35 : 0
// // // // //     ctx.save()
// // // // //     ctx.translate(-s*0.32, -s*0.08); ctx.rotate(armSwing - 0.15)
// // // // //     ctx.fillStyle = bodyColor
// // // // //     rr(ctx, -s*0.09, 0, s*0.18, s*0.32, s*0.07); ctx.fill()
// // // // //     ctx.restore()

// // // // //     ctx.save()
// // // // //     ctx.translate(s*0.32, -s*0.08); ctx.rotate(-armSwing + 0.15)
// // // // //     ctx.fillStyle = bodyColor
// // // // //     rr(ctx, -s*0.09, 0, s*0.18, s*0.32, s*0.07); ctx.fill()
// // // // //     ctx.restore()

// // // // //     // Head
// // // // //     ctx.fillStyle   = '#ffcc80'
// // // // //     ctx.shadowBlur  = 4
// // // // //     ctx.shadowColor = this.color
// // // // //     ctx.beginPath(); ctx.arc(0, -s*0.38, s*0.26, 0, Math.PI*2); ctx.fill()
// // // // //     ctx.shadowBlur = 0

// // // // //     // Hat
// // // // //     ctx.fillStyle = bodyColor
// // // // //     rr(ctx, -s*0.28, -s*0.62, s*0.56, s*0.2, s*0.06); ctx.fill()
// // // // //     ctx.fillRect(-s*0.32, -s*0.44, s*0.64, s*0.08)
// // // // //     ctx.fillStyle = '#ffd600'
// // // // //     ctx.beginPath(); ctx.arc(0, -s*0.56, s*0.07, 0, Math.PI*2); ctx.fill()

// // // // //     // Eyes
// // // // //     const isAlert = this.alertLevel > 0.5
// // // // //     ctx.fillStyle = isAlert ? '#b71c1c' : '#1a237e'
// // // // //     ctx.beginPath(); ctx.arc(-s*0.1, -s*0.4, s*0.06, 0, Math.PI*2); ctx.fill()
// // // // //     ctx.beginPath(); ctx.arc(s*0.1, -s*0.4, s*0.06, 0, Math.PI*2); ctx.fill()
// // // // //     ctx.fillStyle = 'white'
// // // // //     ctx.beginPath(); ctx.arc(-s*0.08, -s*0.42, s*0.022, 0, Math.PI*2); ctx.fill()
// // // // //     ctx.beginPath(); ctx.arc(s*0.12, -s*0.42, s*0.022, 0, Math.PI*2); ctx.fill()

// // // // //     // Mouth
// // // // //     ctx.strokeStyle = '#5d3a1a'
// // // // //     ctx.lineWidth   = s * 0.04
// // // // //     ctx.lineCap     = 'round'
// // // // //     ctx.beginPath()
// // // // //     if (isAlert) {
// // // // //       ctx.moveTo(-s*0.1, -s*0.28); ctx.lineTo(s*0.1, -s*0.28)
// // // // //     } else {
// // // // //       ctx.arc(0, -s*0.22, s*0.1, Math.PI + 0.3, -0.3)
// // // // //     }
// // // // //     ctx.stroke()
// // // // //     ctx.restore()

// // // // //     // Debug A* path
// // // // //     if (debug && this.debugPath.length > 1) {
// // // // //       ctx.strokeStyle = COLORS.ASTAR_PATH
// // // // //       ctx.lineWidth   = 1.5
// // // // //       ctx.beginPath()
// // // // //       this.debugPath.forEach((p, i) => {
// // // // //         const px = p.x*T+T/2, py = p.y*T+T/2
// // // // //         i === 0 ? ctx.moveTo(px,py) : ctx.lineTo(px,py)
// // // // //       })
// // // // //       ctx.stroke()
// // // // //     }
// // // // //   }
// // // // // }
// // // // // import { TILE_SIZE, GUARD_CFG, BEHAVIOR, COLORS } from '../game/constants.js'
// // // // // import { AStar }            from '../ai/AStar.js'
// // // // // import { BFS }              from '../ai/BFS.js'
// // // // // import { DFS }              from '../ai/DFS.js'
// // // // // import { BehaviorTree }     from '../ai/BehaviorTree.js'
// // // // // import { VisibilitySystem } from './VisibilitySystem.js'
// // // // // import { MultiAgentCoord }  from './MultiAgentCoord.js'

// // // // // const T = TILE_SIZE

// // // // // export class Guard {
// // // // //   constructor({ tileX, tileY, gene, id, geneIdx, grid, escapeTile }) {
// // // // //     this.tileX      = tileX
// // // // //     this.tileY      = tileY
// // // // //     this.pixelX     = tileX * T + T / 2
// // // // //     this.pixelY     = tileY * T + T / 2

// // // // //     this.gene       = gene
// // // // //     this.id         = id
// // // // //     this.geneIdx    = geneIdx
// // // // //     this.grid       = grid
// // // // //     this.escapeTile = escapeTile

// // // // //     this.state           = BEHAVIOR.PATROL
// // // // //     this.alertLevel      = 0
// // // // //     this.lastKnownPlayer = null

// // // // //     this.path            = []
// // // // //     this.pathIdx         = 1
// // // // //     this.debugPath       = []
// // // // //     this.framesSincePath = 0
// // // // //     this._walkFrame      = 0
// // // // //     this._moving         = false
// // // // //     this._facingLeft     = false

// // // // //     this.bfsQueue  = []
// // // // //     this.bfsStep   = 0
// // // // //     this.dfsQueue  = []
// // // // //     this.dfsStep   = 0

// // // // //     this.wanderTarget = null
// // // // //     this.wanderTimer  = 0

// // // // //     this.patrol    = this._buildPatrol()
// // // // //     this.patrolIdx = 0

// // // // //     this.speed      = (GUARD_CFG.BASE_SPEED + gene.speedMult * 0.8) * T
// // // // //     this.visionPx   = (GUARD_CFG.BASE_VISION + gene.visionMult * 3) * T
// // // // //     this.hearRadius = (GUARD_CFG.HEAR_BASE   + gene.searchRadius * 4)

// // // // //     this.tree  = new BehaviorTree(gene)
// // // // //     this.color = COLORS.GUARD_PATROL
// // // // //   }

// // // // //   // ── Main update ─────────────────────────────────────────────

// // // // //   update(dt, playerTile, playerVisible, heatmap, allGuards, ga) {
// // // // //     this.framesSincePath++
// // // // //     this.alertLevel = Math.max(0, this.alertLevel - GUARD_CFG.ALERT_DECAY * dt * 60)

// // // // //     if (playerVisible) {
// // // // //       this.alertLevel      = 1
// // // // //       this.lastKnownPlayer = { ...playerTile }
// // // // //       ga.recordSpot(this.geneIdx)
// // // // //       MultiAgentCoord.broadcastSighting(this, playerTile, allGuards)
// // // // //     }

// // // // //     this.state = this.tree.tick({
// // // // //       guardTile:     { x: this.tileX, y: this.tileY },
// // // // //       playerTile:    playerVisible ? playerTile : null,
// // // // //       escapeTile:    this.escapeTile,
// // // // //       lastKnown:     this.lastKnownPlayer,
// // // // //       playerVisible,
// // // // //       alertLevel:    this.alertLevel,
// // // // //     })

// // // // //     if (this.alertLevel > 0.8)
// // // // //       MultiAgentCoord.assignBlocker(allGuards, this.escapeTile)

// // // // //     const target = this._resolveTarget(heatmap)

// // // // //     const recalcInterval = Math.max(15, GUARD_CFG.PATH_RECALC - Math.floor(this.gene.predictionAcc * 20))
// // // // //     if (target && (this.framesSincePath > recalcInterval || this.path.length === 0)) {
// // // // //       this.path  = AStar.findPath(this.grid, this.tileX, this.tileY, target.x, target.y)
// // // // //       this.pathIdx = 1
// // // // //       this.debugPath = this.path
// // // // //       this.framesSincePath = 0
// // // // //     }

// // // // //     this._followPath(dt)
// // // // //     this._updateColor()
// // // // //   }

// // // // //   // ── Resolve movement target ──────────────────────────────────

// // // // //   _resolveTarget(heatmap) {
// // // // //     switch (this.state) {
// // // // //       case BEHAVIOR.CHASE:
// // // // //         return this.lastKnownPlayer

// // // // //       case BEHAVIOR.BLOCK:
// // // // //         return this.escapeTile

// // // // //       case BEHAVIOR.INVESTIGATE:
// // // // //         if (!this.lastKnownPlayer) return null
// // // // //         if (this._distTo(this.lastKnownPlayer) < 2) {
// // // // //           if (this.gene.aggression > 0.5) {
// // // // //             this.dfsQueue = DFS.sweep(this.grid, this.tileX, this.tileY, 60)
// // // // //             this.dfsStep  = 0
// // // // //           } else {
// // // // //             this.bfsQueue = BFS.sweep(this.grid, this.tileX, this.tileY, 80)
// // // // //             this.bfsStep  = 0
// // // // //           }
// // // // //           this.state = BEHAVIOR.SEARCH
// // // // //         }
// // // // //         return this.lastKnownPlayer

// // // // //       case BEHAVIOR.SEARCH: {
// // // // //         const queue = this.gene.aggression > 0.5 ? this.dfsQueue : this.bfsQueue
// // // // //         const step  = this.gene.aggression > 0.5 ? this.dfsStep  : this.bfsStep
// // // // //         if (step < queue.length) {
// // // // //           const t = queue[step]
// // // // //           if (this._distTo(t) < 2) {
// // // // //             if (this.gene.aggression > 0.5) this.dfsStep++
// // // // //             else this.bfsStep++
// // // // //           }
// // // // //           return t
// // // // //         }
// // // // //         const hot = heatmap.hottest()
// // // // //         if (hot.v > 0.1) return hot
// // // // //         this.state = BEHAVIOR.PATROL
// // // // //         return null
// // // // //       }

// // // // //       case BEHAVIOR.PATROL: {
// // // // //         const arrived  = this.wanderTarget && this._distTo(this.wanderTarget) < 2
// // // // //         const timedOut = this.wanderTimer <= 0
// // // // //         if (!this.wanderTarget || arrived || timedOut) {
// // // // //           this.wanderTarget = this._pickRandomWaypoint()
// // // // //           this.wanderTimer  = 180 + Math.random() * 240
// // // // //         }
// // // // //         this.wanderTimer--
// // // // //         return this.wanderTarget
// // // // //       }

// // // // //       default: return null
// // // // //     }
// // // // //   }

// // // // //   // ── Follow A* path ───────────────────────────────────────────

// // // // //   _followPath(dt) {
// // // // //     if (this.path.length < 2 || this.pathIdx >= this.path.length) {
// // // // //       this._moving = false
// // // // //       return
// // // // //     }

// // // // //     const next = this.path[this.pathIdx]
// // // // //     const tpx  = next.x * T + T / 2
// // // // //     const tpy  = next.y * T + T / 2
// // // // //     const dx   = tpx - this.pixelX
// // // // //     const dy   = tpy - this.pixelY
// // // // //     const dist = Math.hypot(dx, dy)
// // // // //     const spd  = this.speed * dt

// // // // //     if (dist < spd + 1) {
// // // // //       this.pixelX = tpx; this.pixelY = tpy
// // // // //       this.tileX  = next.x; this.tileY = next.y
// // // // //       this.pathIdx++
// // // // //     } else {
// // // // //       this.pixelX += (dx / dist) * spd
// // // // //       this.pixelY += (dy / dist) * spd
// // // // //     }
    
// // // // //     this._moving      = dist > 1
// // // // //     this._facingLeft  = dx < 0
// // // // //     this._walkFrame  += spd * 0.25
// // // // //     if (dist > 1) this._facingAngle = Math.atan2(dy, dx)
// // // // //   }

// // // // //   // ── Visibility & hearing ─────────────────────────────────────

// // // // //   canSeePlayer(playerPixelX, playerPixelY) {
// // // // //     return VisibilitySystem.hasLineOfSight(
// // // // //       this.grid,
// // // // //       this.pixelX, this.pixelY,
// // // // //       playerPixelX, playerPixelY,
// // // // //       this.visionPx
// // // // //     )
// // // // //   }

// // // // //   hearPlayer(playerTile, playerNoise) {
// // // // //     const d = Math.hypot(this.tileX - playerTile.x, this.tileY - playerTile.y)
// // // // //     return d < this.hearRadius * playerNoise
// // // // //   }

// // // // //   // ── Patrol / wander helpers ───────────────────────────────────

// // // // //   _pickRandomWaypoint() {
// // // // //     const COLS = this.grid.cols
// // // // //     const ROWS = this.grid.rows
// // // // //     for (let i = 0; i < 20; i++) {
// // // // //       const rx = Math.floor(Math.random() * COLS)
// // // // //       const ry = Math.floor(Math.random() * ROWS)
// // // // //       if (!this.grid.isWalkable(rx, ry)) continue
// // // // //       const d = this._distTo({ x: rx, y: ry })
// // // // //       if (d > 4 && d < 20) return { x: rx, y: ry }
// // // // //     }
// // // // //     for (let i = 0; i < 50; i++) {
// // // // //       const rx = Math.floor(Math.random() * COLS)
// // // // //       const ry = Math.floor(Math.random() * ROWS)
// // // // //       if (this.grid.isWalkable(rx, ry)) return { x: rx, y: ry }
// // // // //     }
// // // // //     return { x: this.tileX, y: this.tileY }
// // // // //   }

// // // // //   _buildPatrol() {
// // // // //     const order = BFS.sweep(this.grid, this.tileX, this.tileY, 40)
// // // // //     const pts   = [{ x: this.tileX, y: this.tileY }]
// // // // //     for (let i = 5; i < order.length; i += 8) pts.push(order[i])
// // // // //     return pts
// // // // //   }

// // // // //   _distTo(tile) {
// // // // //     return Math.abs(this.tileX - tile.x) + Math.abs(this.tileY - tile.y)
// // // // //   }

// // // // //   _updateColor() {
// // // // //     if (this.state === BEHAVIOR.CHASE || this.state === BEHAVIOR.BLOCK)
// // // // //       this.color = COLORS.GUARD_ALERT
// // // // //     else if (this.state === BEHAVIOR.SEARCH || this.state === BEHAVIOR.INVESTIGATE)
// // // // //       this.color = COLORS.GUARD_SEARCH
// // // // //     else
// // // // //       this.color = COLORS.GUARD_PATROL
// // // // //   }

// // // // //   // ── Render ───────────────────────────────────────────────────

// // // // //   draw(ctx, debug) {
// // // // //     const x = this.pixelX
// // // // //     const y = this.pixelY
// // // // //     const s = T * 0.88

// // // // //     // Soft vision glow behind character
// // // // //     const vColor = this.state === BEHAVIOR.CHASE || this.state === BEHAVIOR.BLOCK
// // // // //       ? '255,80,0'
// // // // //       : this.state === BEHAVIOR.SEARCH || this.state === BEHAVIOR.INVESTIGATE
// // // // //         ? '220,220,0' : '255,51,51'
// // // // //     const vGrd = ctx.createRadialGradient(x, y, 0, x, y, this.visionPx)
// // // // //     vGrd.addColorStop(0,   `rgba(${vColor},0.08)`)
// // // // //     vGrd.addColorStop(0.6, `rgba(${vColor},0.03)`)
// // // // //     vGrd.addColorStop(1,   `rgba(${vColor},0)`)
// // // // //     ctx.fillStyle = vGrd
// // // // //     ctx.beginPath()
// // // // //     ctx.arc(x, y, this.visionPx, 0, Math.PI * 2)
// // // // //     ctx.fill()

// // // // //     // Alert ! or ? above head
// // // // //     if (this.alertLevel > 0.6) {
// // // // //       const mark   = this.alertLevel > 0.85 ? '!' : '?'
// // // // //       const bounce = Math.sin(Date.now() / 150) * 3
// // // // //       ctx.font      = `bold ${Math.floor(s * 0.7)}px monospace`
// // // // //       ctx.textAlign = 'center'
// // // // //       ctx.fillStyle  = this.alertLevel > 0.85 ? '#ff3333' : '#ffcc00'
// // // // //       ctx.shadowBlur  = 8
// // // // //       ctx.shadowColor = ctx.fillStyle
// // // // //       ctx.fillText(mark, x, y - s * 1.55 + bounce)
// // // // //       ctx.shadowBlur = 0
// // // // //     }

// // // // //     ctx.save()
// // // // //     ctx.translate(x, y)
// // // // //     if (this._facingLeft) ctx.scale(-1, 1)

// // // // //     const legSwing = this._moving ? Math.sin(this._walkFrame) * 0.3 : 0
// // // // //     const bodyColor = this.state === BEHAVIOR.CHASE || this.state === BEHAVIOR.BLOCK
// // // // //       ? '#b71c1c'
// // // // //       : this.state === BEHAVIOR.SEARCH || this.state === BEHAVIOR.INVESTIGATE
// // // // //         ? '#e65100' : '#c62828'

// // // // //     // Left leg
// // // // //     ctx.save()
// // // // //     ctx.translate(-s * 0.16, s * 0.22)
// // // // //     ctx.rotate(-legSwing)
// // // // //     ctx.fillStyle = '#1a237e'
// // // // //     ctx.beginPath()
// // // // //     ctx.roundRect(-s*0.11, 0, s*0.2, s*0.42, s*0.07)
// // // // //     ctx.fill()
// // // // //     ctx.fillStyle = '#0d1117'
// // // // //     ctx.beginPath()
// // // // //     ctx.ellipse(0, s*0.43, s*0.13, s*0.08, 0, 0, Math.PI*2)
// // // // //     ctx.fill()
// // // // //     ctx.restore()

// // // // //     // Right leg
// // // // //     ctx.save()
// // // // //     ctx.translate(s * 0.16, s * 0.22)
// // // // //     ctx.rotate(legSwing)
// // // // //     ctx.fillStyle = '#1a237e'
// // // // //     ctx.beginPath()
// // // // //     ctx.roundRect(-s*0.11, 0, s*0.2, s*0.42, s*0.07)
// // // // //     ctx.fill()
// // // // //     ctx.fillStyle = '#0d1117'
// // // // //     ctx.beginPath()
// // // // //     ctx.ellipse(0, s*0.43, s*0.13, s*0.08, 0, 0, Math.PI*2)
// // // // //     ctx.fill()
// // // // //     ctx.restore()

// // // // //     // Body
// // // // //     ctx.fillStyle   = bodyColor
// // // // //     ctx.shadowBlur  = this.alertLevel > 0.5 ? 14 : 5
// // // // //     ctx.shadowColor = this.color
// // // // //     ctx.beginPath()
// // // // //     ctx.roundRect(-s*0.3, -s*0.15, s*0.6, s*0.44, s*0.12)
// // // // //     ctx.fill()
// // // // //     ctx.shadowBlur = 0

// // // // //     // Badge
// // // // //     ctx.fillStyle = '#ffd600'
// // // // //     ctx.beginPath()
// // // // //     ctx.arc(-s*0.1, s*0.04, s*0.09, 0, Math.PI*2)
// // // // //     ctx.fill()
// // // // //     ctx.fillStyle = '#0d1117'
// // // // //     ctx.font      = `bold ${Math.floor(s * 0.12)}px monospace`
// // // // //     ctx.textAlign = 'center'
// // // // //     ctx.fillText('★', -s*0.1, s*0.08)

// // // // //     // Left arm
// // // // //     const armSwing = this._moving ? Math.sin(this._walkFrame + Math.PI) * 0.35 : 0
// // // // //     ctx.save()
// // // // //     ctx.translate(-s*0.32, -s*0.08)
// // // // //     ctx.rotate(armSwing - 0.15)
// // // // //     ctx.fillStyle = bodyColor
// // // // //     ctx.beginPath()
// // // // //     ctx.roundRect(-s*0.09, 0, s*0.18, s*0.32, s*0.07)
// // // // //     ctx.fill()
// // // // //     ctx.restore()

// // // // //     // Right arm
// // // // //     ctx.save()
// // // // //     ctx.translate(s*0.32, -s*0.08)
// // // // //     ctx.rotate(-armSwing + 0.15)
// // // // //     ctx.fillStyle = bodyColor
// // // // //     ctx.beginPath()
// // // // //     ctx.roundRect(-s*0.09, 0, s*0.18, s*0.32, s*0.07)
// // // // //     ctx.fill()
// // // // //     ctx.restore()

// // // // //     // Head
// // // // //     ctx.fillStyle   = '#ffcc80'
// // // // //     ctx.shadowBlur  = 6
// // // // //     ctx.shadowColor = this.color
// // // // //     ctx.beginPath()
// // // // //     ctx.arc(0, -s*0.38, s*0.26, 0, Math.PI * 2)
// // // // //     ctx.fill()
// // // // //     ctx.shadowBlur = 0

// // // // //     // Police hat
// // // // //     ctx.fillStyle = bodyColor
// // // // //     ctx.beginPath()
// // // // //     ctx.roundRect(-s*0.28, -s*0.62, s*0.56, s*0.2, [s*0.06, s*0.06, 0, 0])
// // // // //     ctx.fill()
// // // // //     ctx.fillRect(-s*0.32, -s*0.44, s*0.64, s*0.08)
// // // // //     ctx.fillStyle = '#ffd600'
// // // // //     ctx.beginPath()
// // // // //     ctx.arc(0, -s*0.56, s*0.07, 0, Math.PI*2)
// // // // //     ctx.fill()

// // // // //     // Eyes
// // // // //     const isAlert = this.alertLevel > 0.5
// // // // //     ctx.fillStyle = isAlert ? '#b71c1c' : '#1a237e'
// // // // //     ctx.beginPath()
// // // // //     ctx.arc(-s*0.1, -s*0.4, s*0.06, 0, Math.PI*2)
// // // // //     ctx.fill()
// // // // //     ctx.beginPath()
// // // // //     ctx.arc(s*0.1, -s*0.4, s*0.06, 0, Math.PI*2)
// // // // //     ctx.fill()
// // // // //     ctx.fillStyle = 'white'
// // // // //     ctx.beginPath()
// // // // //     ctx.arc(-s*0.08, -s*0.42, s*0.022, 0, Math.PI*2)
// // // // //     ctx.fill()
// // // // //     ctx.beginPath()
// // // // //     ctx.arc(s*0.12, -s*0.42, s*0.022, 0, Math.PI*2)
// // // // //     ctx.fill()

// // // // //     // Mouth
// // // // //     ctx.strokeStyle = '#5d3a1a'
// // // // //     ctx.lineWidth   = s * 0.04
// // // // //     ctx.lineCap     = 'round'
// // // // //     ctx.beginPath()
// // // // //     if (isAlert) {
// // // // //       ctx.moveTo(-s*0.1, -s*0.28)
// // // // //       ctx.lineTo(s*0.1,  -s*0.28)
// // // // //     } else {
// // // // //       ctx.arc(0, -s*0.22, s*0.1, Math.PI + 0.3, -0.3)
// // // // //     }
// // // // //     ctx.stroke()

// // // // //     ctx.restore()

// // // // //     // Debug: A* path
// // // // //     if (debug && this.debugPath.length > 1) {
// // // // //       ctx.strokeStyle = COLORS.ASTAR_PATH
// // // // //       ctx.lineWidth   = 1.5
// // // // //       ctx.beginPath()
// // // // //       this.debugPath.forEach((p, i) => {
// // // // //         const px = p.x * T + T / 2, py = p.y * T + T / 2
// // // // //         i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
// // // // //       })
// // // // //       ctx.stroke()
// // // // //     }
// // // // //   }
// // // // // }
// // // // import { TILE_SIZE, GUARD_CFG, BEHAVIOR, COLORS } from '../game/constants.js'
// // // // import { AStar }            from '../ai/AStar.js'
// // // // import { BFS }              from '../ai/BFS.js'
// // // // import { DFS }              from '../ai/DFS.js'
// // // // import { BehaviorTree }     from '../ai/BehaviorTree.js'
// // // // import { VisibilitySystem } from './VisibilitySystem.js'
// // // // import { MultiAgentCoord }  from './MultiAgentCoord.js'

// // // // const T = TILE_SIZE

// // // // function rr(ctx, x, y, w, h, r) {
// // // //   r = Math.min(r, w / 2, h / 2)
// // // //   ctx.beginPath()
// // // //   ctx.moveTo(x + r, y)
// // // //   ctx.lineTo(x + w - r, y)
// // // //   ctx.arcTo(x + w, y,     x + w, y + r,     r)
// // // //   ctx.lineTo(x + w, y + h - r)
// // // //   ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
// // // //   ctx.lineTo(x + r, y + h)
// // // //   ctx.arcTo(x,     y + h, x,       y + h - r, r)
// // // //   ctx.lineTo(x,     y + r)
// // // //   ctx.arcTo(x,     y,     x + r,   y,         r)
// // // //   ctx.closePath()
// // // // }

// // // // export class Guard {
// // // //   constructor({ tileX, tileY, gene, id, geneIdx, grid, escapeTile }) {
// // // //     this.tileX      = tileX
// // // //     this.tileY      = tileY
// // // //     this.pixelX     = tileX * T + T / 2
// // // //     this.pixelY     = tileY * T + T / 2

// // // //     this.gene       = gene
// // // //     this.id         = id
// // // //     this.geneIdx    = geneIdx
// // // //     this.grid       = grid
// // // //     this.escapeTile = escapeTile

// // // //     this.state           = BEHAVIOR.PATROL
// // // //     this.alertLevel      = 0
// // // //     this.lastKnownPlayer = null
// // // //     this._isHearing      = false
// // // //     this._interceptTarget = null

// // // //     this.path            = []
// // // //     this.pathIdx         = 1
// // // //     this.debugPath       = []
// // // //     this.framesSincePath = 0
// // // //     this._walkFrame      = 0
// // // //     this._moving         = false
// // // //     this._facingLeft     = false
// // // //     this._facingAngle    = 0

// // // //     this.bfsQueue  = []
// // // //     this.bfsStep   = 0
// // // //     this.dfsQueue  = []
// // // //     this.dfsStep   = 0

// // // //     this.wanderTarget = null
// // // //     this.wanderTimer  = 0

// // // //     // Smarter patrol — build waypoints near exit
// // // //     this.patrol    = this._buildSmartPatrol()
// // // //     this.patrolIdx = 0

// // // //     this.speed      = (GUARD_CFG.BASE_SPEED + gene.speedMult * 0.8) * T
// // // //     this.visionPx   = (GUARD_CFG.BASE_VISION + gene.visionMult * 3) * T
// // // //     this.hearRadius = (GUARD_CFG.HEAR_BASE   + gene.searchRadius * 4)

// // // //     this.tree  = new BehaviorTree(gene)
// // // //     this.color = COLORS.GUARD_PATROL
// // // //   }

// // // //   update(dt, playerTile, playerVisible, heatmap, allGuards, ga, wantedSpeedMult = 1) {
// // // //     this.framesSincePath++
// // // //     this._isHearing = false
// // // //     this.alertLevel = Math.max(0, this.alertLevel - GUARD_CFG.ALERT_DECAY * dt * 60)

// // // //     if (playerVisible) {
// // // //       this.alertLevel      = 1
// // // //       this.lastKnownPlayer = { ...playerTile }
// // // //       this._facingAngle = Math.atan2(
// // // //         playerTile.y * T - this.pixelY,
// // // //         playerTile.x * T - this.pixelX
// // // //       )
// // // //       ga.recordSpot(this.geneIdx)
// // // //       MultiAgentCoord.broadcastSighting(this, playerTile, allGuards)
// // // //     } else if (this.lastKnownPlayer) {
// // // //       const targetAngle = Math.atan2(
// // // //         this.lastKnownPlayer.y * T - this.pixelY,
// // // //         this.lastKnownPlayer.x * T - this.pixelX
// // // //       )
// // // //       const diff = targetAngle - this._facingAngle
// // // //       const wrapped = ((diff + Math.PI) % (Math.PI * 2)) - Math.PI
// // // //       this._facingAngle += wrapped * dt * 1.5
// // // //     }

// // // //     const prevState = this.state
// // // //     this.state = this.tree.tick({
// // // //       guardTile:          { x: this.tileX, y: this.tileY },
// // // //       playerTile:         playerVisible ? playerTile : null,
// // // //       escapeTile:         this.escapeTile,
// // // //       lastKnown:          this.lastKnownPlayer,
// // // //       playerVisible,
// // // //       alertLevel:         this.alertLevel,
// // // //       chaseMemorySeconds: GUARD_CFG.CHASE_MEMORY,
// // // //     })

// // // //     // FIX: When chase memory expires and guard transitions OUT of chase/investigate,
// // // //     // clear lastKnownPlayer and kick off a search sweep so they don't freeze in place.
// // // //     if (
// // // //       (prevState === BEHAVIOR.CHASE || prevState === BEHAVIOR.INVESTIGATE) &&
// // // //       this.state === BEHAVIOR.PATROL &&
// // // //       !playerVisible
// // // //     ) {
// // // //       // Do a search sweep from current position before returning to patrol
// // // //       if (this.gene.aggression > 0.5) {
// // // //         this.dfsQueue = DFS.sweep(this.grid, this.tileX, this.tileY, 40)
// // // //         this.dfsStep  = 0
// // // //       } else {
// // // //         this.bfsQueue = BFS.sweep(this.grid, this.tileX, this.tileY, 50)
// // // //         this.bfsStep  = 0
// // // //       }
// // // //       this.state            = BEHAVIOR.SEARCH
// // // //       this.lastKnownPlayer  = null
// // // //       this._interceptTarget = null
// // // //       this.path             = []  // force immediate path recalc toward first search tile
// // // //     }

// // // //     if (this.alertLevel > 0.8)
// // // //       MultiAgentCoord.assignBlocker(allGuards, this.escapeTile)

// // // //     const target = this._resolveTarget(heatmap)

// // // //     const recalcInterval = Math.max(12, GUARD_CFG.PATH_RECALC - Math.floor(this.gene.predictionAcc * 20))
// // // //     if (target && (this.framesSincePath > recalcInterval || this.path.length === 0)) {
// // // //       this.path        = AStar.findPath(this.grid, this.tileX, this.tileY, target.x, target.y)
// // // //       this.pathIdx     = 1
// // // //       this.debugPath   = this.path
// // // //       this.framesSincePath = 0
// // // //     }

// // // //     this._followPath(dt, wantedSpeedMult)
// // // //     this._updateColor()
// // // //   }

// // // //   setHearing(heard) { this._isHearing = heard }

// // // //   _resolveTarget(heatmap) {
// // // //     switch (this.state) {
// // // //       case BEHAVIOR.CHASE: {
// // // //         // Each guard gets a unique angle offset based on ID → they spread around player
// // // //         if (!this.lastKnownPlayer) return null
// // // //         if (this._interceptTarget) {
// // // //           const d = this._distTo(this._interceptTarget)
// // // //           if (d < 3) this._interceptTarget = null
// // // //           else return this._interceptTarget
// // // //         }
// // // //         // Assign a fresh intercept position spread around the last known player pos
// // // //         // Use guard ID so each guard naturally approaches from a different angle
// // // //         const angle   = (this.id / 7) * Math.PI * 2   // spread evenly, not all same dir
// // // //         const spread  = 5 + (this.id % 3) * 2          // vary radius so they don't stack
// // // //         const ix = this.lastKnownPlayer.x + Math.round(Math.cos(angle) * spread)
// // // //         const iy = this.lastKnownPlayer.y + Math.round(Math.sin(angle) * spread)
// // // //         // Only use offset if it is walkable, otherwise chase directly
// // // //         if (
// // // //           ix >= 0 && iy >= 0 &&
// // // //           ix < this.grid.cols && iy < this.grid.rows &&
// // // //           this.grid.isWalkable(ix, iy) &&
// // // //           this._distTo({ x: ix, y: iy }) > 3
// // // //         ) {
// // // //           return { x: ix, y: iy }
// // // //         }
// // // //         return this.lastKnownPlayer
// // // //       }

// // // //       case BEHAVIOR.BLOCK: return this.escapeTile

// // // //       case BEHAVIOR.INVESTIGATE:
// // // //         if (!this.lastKnownPlayer) return null
// // // //         if (this._distTo(this.lastKnownPlayer) < 2) {
// // // //           if (this.gene.aggression > 0.5) {
// // // //             this.dfsQueue = DFS.sweep(this.grid, this.tileX, this.tileY, 60)
// // // //             this.dfsStep  = 0
// // // //           } else {
// // // //             this.bfsQueue = BFS.sweep(this.grid, this.tileX, this.tileY, 80)
// // // //             this.bfsStep  = 0
// // // //           }
// // // //           this.state = BEHAVIOR.SEARCH
// // // //         }
// // // //         return this.lastKnownPlayer

// // // //       case BEHAVIOR.SEARCH: {
// // // //         const queue = this.gene.aggression > 0.5 ? this.dfsQueue : this.bfsQueue
// // // //         const step  = this.gene.aggression > 0.5 ? this.dfsStep  : this.bfsStep
// // // //         if (step < queue.length) {
// // // //           const t = queue[step]
// // // //           if (this._distTo(t) < 2) {
// // // //             if (this.gene.aggression > 0.5) this.dfsStep++
// // // //             else this.bfsStep++
// // // //           }
// // // //           return t
// // // //         }
// // // //         const hot = heatmap.hottest()
// // // //         if (hot.v > 0.1) return hot
// // // //         // Search done — rebuild patrol from current position so guard moves immediately
// // // //         this.patrol    = this._buildSmartPatrol()
// // // //         this.patrolIdx = 0
// // // //         this.path      = []   // force immediate A* recalc
// // // //         this.state     = BEHAVIOR.PATROL
// // // //         // Fall through to PATROL immediately — don't return null
// // // //       }
// // // //       // eslint-disable-next-line no-fallthrough
// // // //       case BEHAVIOR.PATROL: {
// // // //         // If somehow no patrol points, build them now
// // // //         if (!this.patrol || this.patrol.length === 0)
// // // //           this.patrol = this._buildSmartPatrol()

// // // //         const wp = this.patrol[this.patrolIdx % this.patrol.length]
// // // //         if (this._distTo(wp) < 2) {
// // // //           this.patrolIdx++
// // // //           // Every 3 waypoints, shuffle in a fresh random waypoint so patrol doesn't loop identically
// // // //           if (this.patrolIdx % 3 === 0) {
// // // //             const fresh = this._pickRandomWaypoint()
// // // //             if (fresh) this.patrol.splice(this.patrolIdx % this.patrol.length, 0, fresh)
// // // //           }
// // // //         }
// // // //         return wp
// // // //       }

// // // //       default: return null
// // // //     }
// // // //   }

// // // //   _followPath(dt, speedMult = 1) {
// // // //     if (this.path.length < 2 || this.pathIdx >= this.path.length) {
// // // //       this._moving = false
// // // //       // Force recalc next frame so guard never idles waiting for path
// // // //       this.framesSincePath = 999
// // // //       return
// // // //     }
// // // //     const next = this.path[this.pathIdx]
// // // //     const tpx  = next.x * T + T / 2
// // // //     const tpy  = next.y * T + T / 2
// // // //     const dx   = tpx - this.pixelX
// // // //     const dy   = tpy - this.pixelY
// // // //     const dist = Math.hypot(dx, dy)
// // // //     const spd  = this.speed * speedMult * dt

// // // //     if (dist < spd + 1) {
// // // //       this.pixelX = tpx; this.pixelY = tpy
// // // //       this.tileX  = next.x; this.tileY = next.y
// // // //       this.pathIdx++
// // // //     } else {
// // // //       this.pixelX += (dx / dist) * spd
// // // //       this.pixelY += (dy / dist) * spd
// // // //     }

// // // //     this._moving     = dist > 1
// // // //     this._facingLeft = dx < 0
// // // //     this._walkFrame += spd * 0.25
// // // //     if (dist > 1) this._facingAngle = Math.atan2(dy, dx)
// // // //   }

// // // //   canSeePlayer(playerPixelX, playerPixelY) {
// // // //     return VisibilitySystem.hasLineOfSight(
// // // //       this.grid,
// // // //       this.pixelX, this.pixelY,
// // // //       playerPixelX, playerPixelY,
// // // //       this.visionPx
// // // //     )
// // // //   }

// // // //   hearPlayer(playerTile, playerNoise) {
// // // //     const d = Math.hypot(this.tileX - playerTile.x, this.tileY - playerTile.y)
// // // //     return d < this.hearRadius * playerNoise
// // // //   }

// // // //   // Smart patrol — mostly near exit, some random
// // // //   _buildSmartPatrol() {
// // // //     const pts = []
// // // //     // 60% waypoints near escape tile
// // // //     const exitArea = BFS.sweep(this.grid, this.escapeTile.x, this.escapeTile.y, 30)
// // // //     for (let i = 3; i < exitArea.length; i += 6) pts.push(exitArea[i])

// // // //     // 40% random waypoints elsewhere
// // // //     const random = BFS.sweep(this.grid, this.tileX, this.tileY, 40)
// // // //     for (let i = 5; i < random.length; i += 10) pts.push(random[i])

// // // //     return pts.length > 0 ? pts : [{ x: this.tileX, y: this.tileY }]
// // // //   }

// // // //   _pickRandomWaypoint() {
// // // //     const COLS = this.grid.cols
// // // //     const ROWS = this.grid.rows
// // // //     for (let i = 0; i < 20; i++) {
// // // //       const rx = Math.floor(Math.random() * COLS)
// // // //       const ry = Math.floor(Math.random() * ROWS)
// // // //       if (!this.grid.isWalkable(rx, ry)) continue
// // // //       const d = this._distTo({ x: rx, y: ry })
// // // //       if (d > 4 && d < 20) return { x: rx, y: ry }
// // // //     }
// // // //     for (let i = 0; i < 50; i++) {
// // // //       const rx = Math.floor(Math.random() * COLS)
// // // //       const ry = Math.floor(Math.random() * ROWS)
// // // //       if (this.grid.isWalkable(rx, ry)) return { x: rx, y: ry }
// // // //     }
// // // //     return { x: this.tileX, y: this.tileY }
// // // //   }

// // // //   _buildPatrol() { return this._buildSmartPatrol() }
// // // //   _distTo(tile)  { return Math.abs(this.tileX - tile.x) + Math.abs(this.tileY - tile.y) }

// // // //   _updateColor() {
// // // //     if (this.state === BEHAVIOR.CHASE || this.state === BEHAVIOR.BLOCK)
// // // //       this.color = COLORS.GUARD_ALERT
// // // //     else if (this.state === BEHAVIOR.SEARCH || this.state === BEHAVIOR.INVESTIGATE)
// // // //       this.color = COLORS.GUARD_SEARCH
// // // //     else
// // // //       this.color = COLORS.GUARD_PATROL
// // // //   }

// // // //   // draw(ctx, debug) {
// // // //   //   const x = this.pixelX
// // // //   //   const y = this.pixelY
// // // //   //   const s = T * 0.88

// // // //   //   // Hearing highlight
// // // //   //   if (this._isHearing) {
// // // //   //     const pulse = 0.6 + 0.4 * Math.sin(Date.now() / 80)
// // // //   //     ctx.save()
// // // //   //     ctx.strokeStyle = `rgba(255,230,0,${pulse})`
// // // //   //     ctx.lineWidth   = 3
// // // //   //     ctx.shadowBlur  = 18
// // // //   //     ctx.shadowColor = '#ffdd00'
// // // //   //     ctx.beginPath()
// // // //   //     ctx.arc(x, y, s * 1.05, 0, Math.PI * 2)
// // // //   //     ctx.stroke()
// // // //   //     ctx.fillStyle = 'rgba(255,220,0,0.08)'
// // // //   //     ctx.beginPath()
// // // //   //     ctx.arc(x, y, s * 1.05, 0, Math.PI * 2)
// // // //   //     ctx.fill()
// // // //   //     ctx.restore()

// // // //   //     ctx.save()
// // // //   //     ctx.font      = `${Math.floor(s * 0.65)}px serif`
// // // //   //     ctx.textAlign = 'center'
// // // //   //     const bounce  = Math.sin(Date.now() / 120) * 2
// // // //   //     ctx.fillStyle   = '#ffdd00'
// // // //   //     ctx.shadowBlur  = 10
// // // //   //     ctx.shadowColor = '#ffaa00'
// // // //   //     ctx.fillText('👂', x, y - s * 1.55 + bounce)
// // // //   //     ctx.shadowBlur = 0
// // // //   //     ctx.restore()
// // // //   //   }

// // // //   //   // Alert ! or ?
// // // //   //   if (this.alertLevel > 0.6 && !this._isHearing) {
// // // //   //     const mark   = this.alertLevel > 0.85 ? '!' : '?'
// // // //   //     const bounce = Math.sin(Date.now() / 150) * 3
// // // //   //     ctx.font      = `bold ${Math.floor(s * 0.7)}px monospace`
// // // //   //     ctx.textAlign = 'center'
// // // //   //     ctx.fillStyle  = this.alertLevel > 0.85 ? '#ff3333' : '#ffcc00'
// // // //   //     ctx.shadowBlur  = 8
// // // //   //     ctx.shadowColor = ctx.fillStyle
// // // //   //     ctx.fillText(mark, x, y - s * 1.55 + bounce)
// // // //   //     ctx.shadowBlur = 0
// // // //   //   }

// // // //   //   ctx.save()
// // // //   //   ctx.translate(x, y)
// // // //   //   if (this._facingLeft) ctx.scale(-1, 1)

// // // //   //   const legSwing  = this._moving ? Math.sin(this._walkFrame) * 0.3 : 0
// // // //   //   const bodyColor = this.state === BEHAVIOR.CHASE || this.state === BEHAVIOR.BLOCK
// // // //   //     ? '#b71c1c'
// // // //   //     : this.state === BEHAVIOR.SEARCH || this.state === BEHAVIOR.INVESTIGATE
// // // //   //       ? '#e65100' : '#c62828'

// // // //   //   // Legs
// // // //   //   ctx.save()
// // // //   //   ctx.translate(-s*0.16, s*0.22)
// // // //   //   ctx.rotate(-legSwing)
// // // //   //   ctx.fillStyle = '#1a237e'
// // // //   //   rr(ctx, -s*0.11, 0, s*0.2, s*0.42, s*0.07); ctx.fill()
// // // //   //   ctx.fillStyle = '#0d1117'
// // // //   //   ctx.beginPath(); ctx.ellipse(0, s*0.43, s*0.13, s*0.08, 0, 0, Math.PI*2); ctx.fill()
// // // //   //   ctx.restore()

// // // //   //   ctx.save()
// // // //   //   ctx.translate(s*0.16, s*0.22)
// // // //   //   ctx.rotate(legSwing)
// // // //   //   ctx.fillStyle = '#1a237e'
// // // //   //   rr(ctx, -s*0.11, 0, s*0.2, s*0.42, s*0.07); ctx.fill()
// // // //   //   ctx.fillStyle = '#0d1117'
// // // //   //   ctx.beginPath(); ctx.ellipse(0, s*0.43, s*0.13, s*0.08, 0, 0, Math.PI*2); ctx.fill()
// // // //   //   ctx.restore()

// // // //   //   // Body
// // // //   //   ctx.fillStyle   = bodyColor
// // // //   //   ctx.shadowBlur  = this._isHearing ? 20 : this.alertLevel > 0.5 ? 14 : 5
// // // //   //   ctx.shadowColor = this._isHearing ? '#ffdd00' : this.color
// // // //   //   rr(ctx, -s*0.3, -s*0.15, s*0.6, s*0.44, s*0.12); ctx.fill()
// // // //   //   ctx.shadowBlur = 0

// // // //   //   // Badge
// // // //   //   ctx.fillStyle = '#ffd600'
// // // //   //   ctx.beginPath(); ctx.arc(-s*0.1, s*0.04, s*0.09, 0, Math.PI*2); ctx.fill()
// // // //   //   ctx.fillStyle = '#0d1117'
// // // //   //   ctx.font = `bold ${Math.floor(s*0.12)}px monospace`
// // // //   //   ctx.textAlign = 'center'
// // // //   //   ctx.fillText('★', -s*0.1, s*0.08)

// // // //   //   // Arms
// // // //   //   const armSwing = this._moving ? Math.sin(this._walkFrame + Math.PI) * 0.35 : 0
// // // //   //   ctx.save()
// // // //   //   ctx.translate(-s*0.32, -s*0.08); ctx.rotate(armSwing - 0.15)
// // // //   //   ctx.fillStyle = bodyColor
// // // //   //   rr(ctx, -s*0.09, 0, s*0.18, s*0.32, s*0.07); ctx.fill()
// // // //   //   ctx.restore()

// // // //   //   ctx.save()
// // // //   //   ctx.translate(s*0.32, -s*0.08); ctx.rotate(-armSwing + 0.15)
// // // //   //   ctx.fillStyle = bodyColor
// // // //   //   rr(ctx, -s*0.09, 0, s*0.18, s*0.32, s*0.07); ctx.fill()
// // // //   //   ctx.restore()

// // // //   //   // Head
// // // //   //   ctx.fillStyle   = '#ffcc80'
// // // //   //   ctx.shadowBlur  = 6
// // // //   //   ctx.shadowColor = this._isHearing ? '#ffdd00' : this.color
// // // //   //   ctx.beginPath(); ctx.arc(0, -s*0.38, s*0.26, 0, Math.PI*2); ctx.fill()
// // // //   //   ctx.shadowBlur = 0

// // // //   //   // Hat
// // // //   //   ctx.fillStyle = bodyColor
// // // //   //   rr(ctx, -s*0.28, -s*0.62, s*0.56, s*0.2, s*0.06); ctx.fill()
// // // //   //   ctx.fillRect(-s*0.32, -s*0.44, s*0.64, s*0.08)
// // // //   //   ctx.fillStyle = '#ffd600'
// // // //   //   ctx.beginPath(); ctx.arc(0, -s*0.56, s*0.07, 0, Math.PI*2); ctx.fill()

// // // //   //   // Eyes
// // // //   //   const isAlert = this.alertLevel > 0.5
// // // //   //   ctx.fillStyle = this._isHearing ? '#ff9800' : isAlert ? '#b71c1c' : '#1a237e'
// // // //   //   ctx.beginPath(); ctx.arc(-s*0.1, -s*0.4, s*0.06, 0, Math.PI*2); ctx.fill()
// // // //   //   ctx.beginPath(); ctx.arc(s*0.1, -s*0.4, s*0.06, 0, Math.PI*2); ctx.fill()
// // // //   //   ctx.fillStyle = 'white'
// // // //   //   ctx.beginPath(); ctx.arc(-s*0.08, -s*0.42, s*0.022, 0, Math.PI*2); ctx.fill()
// // // //   //   ctx.beginPath(); ctx.arc(s*0.12, -s*0.42, s*0.022, 0, Math.PI*2); ctx.fill()

// // // //   //   // Mouth
// // // //   //   ctx.strokeStyle = '#5d3a1a'
// // // //   //   ctx.lineWidth   = s * 0.04
// // // //   //   ctx.lineCap     = 'round'
// // // //   //   ctx.beginPath()
// // // //   //   if (isAlert || this._isHearing) {
// // // //   //     ctx.moveTo(-s*0.1, -s*0.28); ctx.lineTo(s*0.1, -s*0.28)
// // // //   //   } else {
// // // //   //     ctx.arc(0, -s*0.22, s*0.1, Math.PI + 0.3, -0.3)
// // // //   //   }
// // // //   //   ctx.stroke()
// // // //   //   ctx.restore()

// // // //   //   if (debug && this.debugPath.length > 1) {
// // // //   //     ctx.strokeStyle = COLORS.ASTAR_PATH
// // // //   //     ctx.lineWidth   = 1.5
// // // //   //     ctx.beginPath()
// // // //   //     this.debugPath.forEach((p, i) => {
// // // //   //       const px = p.x*T+T/2, py = p.y*T+T/2
// // // //   //       i === 0 ? ctx.moveTo(px,py) : ctx.lineTo(px,py)
// // // //   //     })
// // // //   //     ctx.stroke()
// // // //   //   }
// // // //   // }
// // // //   draw(ctx, debug) {
// // // //     const x = this.pixelX
// // // //     const y = this.pixelY
// // // //     const s = T * 0.88

// // // //     // Alert ! or ? above head — only when alert, no hearing ring
// // // //     if (this.alertLevel > 0.6) {
// // // //       const mark   = this.alertLevel > 0.85 ? '!' : '?'
// // // //       const bounce = Math.sin(Date.now() / 150) * 3
// // // //       ctx.font      = `bold ${Math.floor(s * 0.7)}px monospace`
// // // //       ctx.textAlign = 'center'
// // // //       ctx.fillStyle  = this.alertLevel > 0.85 ? '#ff3333' : '#ffcc00'
// // // //       ctx.shadowBlur  = 8
// // // //       ctx.shadowColor = ctx.fillStyle
// // // //       ctx.fillText(mark, x, y - s * 1.55 + bounce)
// // // //       ctx.shadowBlur = 0
// // // //     }

// // // //     ctx.save()
// // // //     ctx.translate(x, y)
// // // //     if (this._facingLeft) ctx.scale(-1, 1)

// // // //     const legSwing  = this._moving ? Math.sin(this._walkFrame) * 0.3 : 0
// // // //     const bodyColor = this.state === BEHAVIOR.CHASE || this.state === BEHAVIOR.BLOCK
// // // //       ? '#b71c1c'
// // // //       : this.state === BEHAVIOR.SEARCH || this.state === BEHAVIOR.INVESTIGATE
// // // //         ? '#e65100' : '#c62828'

// // // //     // Left leg
// // // //     ctx.save()
// // // //     ctx.translate(-s*0.16, s*0.22)
// // // //     ctx.rotate(-legSwing)
// // // //     ctx.fillStyle = '#1a237e'
// // // //     rr(ctx, -s*0.11, 0, s*0.2, s*0.42, s*0.07); ctx.fill()
// // // //     ctx.fillStyle = '#0d1117'
// // // //     ctx.beginPath(); ctx.ellipse(0, s*0.43, s*0.13, s*0.08, 0, 0, Math.PI*2); ctx.fill()
// // // //     ctx.restore()

// // // //     // Right leg
// // // //     ctx.save()
// // // //     ctx.translate(s*0.16, s*0.22)
// // // //     ctx.rotate(legSwing)
// // // //     ctx.fillStyle = '#1a237e'
// // // //     rr(ctx, -s*0.11, 0, s*0.2, s*0.42, s*0.07); ctx.fill()
// // // //     ctx.fillStyle = '#0d1117'
// // // //     ctx.beginPath(); ctx.ellipse(0, s*0.43, s*0.13, s*0.08, 0, 0, Math.PI*2); ctx.fill()
// // // //     ctx.restore()

// // // //     // Body
// // // //     ctx.fillStyle   = bodyColor
// // // //     ctx.shadowBlur  = this.alertLevel > 0.5 ? 10 : 4
// // // //     ctx.shadowColor = this.color
// // // //     rr(ctx, -s*0.3, -s*0.15, s*0.6, s*0.44, s*0.12); ctx.fill()
// // // //     ctx.shadowBlur = 0

// // // //     // Badge
// // // //     ctx.fillStyle = '#ffd600'
// // // //     ctx.beginPath(); ctx.arc(-s*0.1, s*0.04, s*0.09, 0, Math.PI*2); ctx.fill()
// // // //     ctx.fillStyle = '#0d1117'
// // // //     ctx.font = `bold ${Math.floor(s*0.12)}px monospace`
// // // //     ctx.textAlign = 'center'
// // // //     ctx.fillText('★', -s*0.1, s*0.08)

// // // //     // Arms
// // // //     const armSwing = this._moving ? Math.sin(this._walkFrame + Math.PI) * 0.35 : 0
// // // //     ctx.save()
// // // //     ctx.translate(-s*0.32, -s*0.08); ctx.rotate(armSwing - 0.15)
// // // //     ctx.fillStyle = bodyColor
// // // //     rr(ctx, -s*0.09, 0, s*0.18, s*0.32, s*0.07); ctx.fill()
// // // //     ctx.restore()

// // // //     ctx.save()
// // // //     ctx.translate(s*0.32, -s*0.08); ctx.rotate(-armSwing + 0.15)
// // // //     ctx.fillStyle = bodyColor
// // // //     rr(ctx, -s*0.09, 0, s*0.18, s*0.32, s*0.07); ctx.fill()
// // // //     ctx.restore()

// // // //     // Head
// // // //     ctx.fillStyle   = '#ffcc80'
// // // //     ctx.shadowBlur  = 4
// // // //     ctx.shadowColor = this.color
// // // //     ctx.beginPath(); ctx.arc(0, -s*0.38, s*0.26, 0, Math.PI*2); ctx.fill()
// // // //     ctx.shadowBlur = 0

// // // //     // Hat
// // // //     ctx.fillStyle = bodyColor
// // // //     rr(ctx, -s*0.28, -s*0.62, s*0.56, s*0.2, s*0.06); ctx.fill()
// // // //     ctx.fillRect(-s*0.32, -s*0.44, s*0.64, s*0.08)
// // // //     ctx.fillStyle = '#ffd600'
// // // //     ctx.beginPath(); ctx.arc(0, -s*0.56, s*0.07, 0, Math.PI*2); ctx.fill()

// // // //     // Eyes
// // // //     const isAlert = this.alertLevel > 0.5
// // // //     ctx.fillStyle = isAlert ? '#b71c1c' : '#1a237e'
// // // //     ctx.beginPath(); ctx.arc(-s*0.1, -s*0.4, s*0.06, 0, Math.PI*2); ctx.fill()
// // // //     ctx.beginPath(); ctx.arc(s*0.1, -s*0.4, s*0.06, 0, Math.PI*2); ctx.fill()
// // // //     ctx.fillStyle = 'white'
// // // //     ctx.beginPath(); ctx.arc(-s*0.08, -s*0.42, s*0.022, 0, Math.PI*2); ctx.fill()
// // // //     ctx.beginPath(); ctx.arc(s*0.12, -s*0.42, s*0.022, 0, Math.PI*2); ctx.fill()

// // // //     // Mouth
// // // //     ctx.strokeStyle = '#5d3a1a'
// // // //     ctx.lineWidth   = s * 0.04
// // // //     ctx.lineCap     = 'round'
// // // //     ctx.beginPath()
// // // //     if (isAlert) {
// // // //       ctx.moveTo(-s*0.1, -s*0.28); ctx.lineTo(s*0.1, -s*0.28)
// // // //     } else {
// // // //       ctx.arc(0, -s*0.22, s*0.1, Math.PI + 0.3, -0.3)
// // // //     }
// // // //     ctx.stroke()
// // // //     ctx.restore()

// // // //     // Debug A* path
// // // //     if (debug && this.debugPath.length > 1) {
// // // //       ctx.strokeStyle = COLORS.ASTAR_PATH
// // // //       ctx.lineWidth   = 1.5
// // // //       ctx.beginPath()
// // // //       this.debugPath.forEach((p, i) => {
// // // //         const px = p.x*T+T/2, py = p.y*T+T/2
// // // //         i === 0 ? ctx.moveTo(px,py) : ctx.lineTo(px,py)
// // // //       })
// // // //       ctx.stroke()
// // // //     }
// // // //   }
// // // // }


// // // // import { TILE_SIZE, GUARD_CFG, BEHAVIOR, COLORS } from '../game/constants.js'
// // // // import { AStar }            from '../ai/AStar.js'
// // // // import { BFS }              from '../ai/BFS.js'
// // // // import { DFS }              from '../ai/DFS.js'
// // // // import { BehaviorTree }     from '../ai/BehaviorTree.js'
// // // // import { VisibilitySystem } from './VisibilitySystem.js'
// // // // import { MultiAgentCoord }  from './MultiAgentCoord.js'

// // // // const T = TILE_SIZE

// // // // export class Guard {
// // // //   constructor({ tileX, tileY, gene, id, geneIdx, grid, escapeTile, speedMult = 1, visionMult = 1 }) {
// // // //     this.tileX      = tileX
// // // //     this.tileY      = tileY
// // // //     this.pixelX     = tileX * T + T / 2
// // // //     this.pixelY     = tileY * T + T / 2

// // // //     this.gene       = gene
// // // //     this.id         = id
// // // //     this.geneIdx    = geneIdx
// // // //     this.grid       = grid
// // // //     this.escapeTile = escapeTile

// // // //     this.state           = BEHAVIOR.PATROL
// // // //     this.alertLevel      = 0
// // // //     this.lastKnownPlayer = null

// // // //     this.path            = []
// // // //     this.pathIdx         = 1
// // // //     this.debugPath       = []
// // // //     this.framesSincePath = 0
// // // //     this._walkFrame      = 0
// // // //     this._moving         = false
// // // //     this._facingLeft     = false

// // // //     this.bfsQueue  = []
// // // //     this.bfsStep   = 0
// // // //     this.dfsQueue  = []
// // // //     this.dfsStep   = 0

// // // //     this.wanderTarget = null
// // // //     this.wanderTimer  = 0

// // // //     this.patrol    = this._buildPatrol()
// // // //     this.patrolIdx = 0

// // // //     this.speed      = (GUARD_CFG.BASE_SPEED + gene.speedMult * 0.8) * T
// // // //     this.visionPx   = (GUARD_CFG.BASE_VISION + gene.visionMult * 3) * T
// // // //     this.hearRadius = (GUARD_CFG.HEAR_BASE   + gene.searchRadius * 4)

// // // //     this.tree  = new BehaviorTree(gene)
// // // //     this.color = COLORS.GUARD_PATROL
// // // //   }

// // // //   // ── Main update ─────────────────────────────────────────────

// // // //   update(dt, playerTile, playerVisible, heatmap, allGuards, ga) {
// // // //     this.framesSincePath++
// // // //     this.alertLevel = Math.max(0, this.alertLevel - GUARD_CFG.ALERT_DECAY * dt * 60)

// // // //     if (playerVisible) {
// // // //       this.alertLevel      = 1
// // // //       this.lastKnownPlayer = { ...playerTile }
// // // //       ga.recordSpot(this.geneIdx)
// // // //       MultiAgentCoord.broadcastSighting(this, playerTile, allGuards)
// // // //     }

// // // //     this.state = this.tree.tick({
// // // //       guardTile:     { x: this.tileX, y: this.tileY },
// // // //       playerTile:    playerVisible ? playerTile : null,
// // // //       escapeTile:    this.escapeTile,
// // // //       lastKnown:     this.lastKnownPlayer,
// // // //       playerVisible,
// // // //       alertLevel:    this.alertLevel,
// // // //     })

// // // //     if (this.alertLevel > 0.8)
// // // //       MultiAgentCoord.assignBlocker(allGuards, this.escapeTile)

// // // //     const target = this._resolveTarget(heatmap)

// // // //     const recalcInterval = Math.max(15, GUARD_CFG.PATH_RECALC - Math.floor(this.gene.predictionAcc * 20))
// // // //     if (target && (this.framesSincePath > recalcInterval || this.path.length === 0)) {
// // // //       this.path  = AStar.findPath(this.grid, this.tileX, this.tileY, target.x, target.y)
// // // //       this.pathIdx = 1
// // // //       this.debugPath = this.path
// // // //       this.framesSincePath = 0
// // // //     }

// // // //     this._followPath(dt)
// // // //     this._updateColor()
// // // //   }

// // // //   // ── Resolve movement target ──────────────────────────────────

// // // //   _resolveTarget(heatmap) {
// // // //     switch (this.state) {
// // // //       case BEHAVIOR.CHASE:
// // // //         return this.lastKnownPlayer

// // // //       case BEHAVIOR.BLOCK:
// // // //         return this.escapeTile

// // // //       case BEHAVIOR.INVESTIGATE:
// // // //         if (!this.lastKnownPlayer) return null
// // // //         if (this._distTo(this.lastKnownPlayer) < 2) {
// // // //           if (this.gene.aggression > 0.5) {
// // // //             this.dfsQueue = DFS.sweep(this.grid, this.tileX, this.tileY, 60)
// // // //             this.dfsStep  = 0
// // // //           } else {
// // // //             this.bfsQueue = BFS.sweep(this.grid, this.tileX, this.tileY, 80)
// // // //             this.bfsStep  = 0
// // // //           }
// // // //           this.state = BEHAVIOR.SEARCH
// // // //         }
// // // //         return this.lastKnownPlayer

// // // //       case BEHAVIOR.SEARCH: {
// // // //         const queue = this.gene.aggression > 0.5 ? this.dfsQueue : this.bfsQueue
// // // //         const step  = this.gene.aggression > 0.5 ? this.dfsStep  : this.bfsStep
// // // //         if (step < queue.length) {
// // // //           const t = queue[step]
// // // //           if (this._distTo(t) < 2) {
// // // //             if (this.gene.aggression > 0.5) this.dfsStep++
// // // //             else this.bfsStep++
// // // //           }
// // // //           return t
// // // //         }
// // // //         const hot = heatmap.hottest()
// // // //         if (hot.v > 0.1) return hot
// // // //         this.state = BEHAVIOR.PATROL
// // // //         return null
// // // //       }

// // // //       case BEHAVIOR.PATROL: {
// // // //         const arrived  = this.wanderTarget && this._distTo(this.wanderTarget) < 2
// // // //         const timedOut = this.wanderTimer <= 0
// // // //         if (!this.wanderTarget || arrived || timedOut) {
// // // //           this.wanderTarget = this._pickRandomWaypoint()
// // // //           this.wanderTimer  = 180 + Math.random() * 240
// // // //         }
// // // //         this.wanderTimer--
// // // //         return this.wanderTarget
// // // //       }

// // // //       default: return null
// // // //     }
// // // //   }

// // // //   // ── Follow A* path ───────────────────────────────────────────

// // // //   _followPath(dt) {
// // // //     if (this.path.length < 2 || this.pathIdx >= this.path.length) {
// // // //       this._moving = false
// // // //       return
// // // //     }

// // // //     const next = this.path[this.pathIdx]
// // // //     const tpx  = next.x * T + T / 2
// // // //     const tpy  = next.y * T + T / 2
// // // //     const dx   = tpx - this.pixelX
// // // //     const dy   = tpy - this.pixelY
// // // //     const dist = Math.hypot(dx, dy)
// // // //     const spd  = this.speed * dt

// // // //     if (dist < spd + 1) {
// // // //       this.pixelX = tpx; this.pixelY = tpy
// // // //       this.tileX  = next.x; this.tileY = next.y
// // // //       this.pathIdx++
// // // //     } else {
// // // //       this.pixelX += (dx / dist) * spd
// // // //       this.pixelY += (dy / dist) * spd
// // // //     }
    
// // // //     this._moving      = dist > 1
// // // //     this._facingLeft  = dx < 0
// // // //     this._walkFrame  += spd * 0.25
// // // //     if (dist > 1) this._facingAngle = Math.atan2(dy, dx)
// // // //   }

// // // //   // ── Visibility & hearing ─────────────────────────────────────

// // // //   canSeePlayer(playerPixelX, playerPixelY) {
// // // //     return VisibilitySystem.hasLineOfSight(
// // // //       this.grid,
// // // //       this.pixelX, this.pixelY,
// // // //       playerPixelX, playerPixelY,
// // // //       this.visionPx
// // // //     )
// // // //   }

// // // //   hearPlayer(playerTile, playerNoise) {
// // // //     const d = Math.hypot(this.tileX - playerTile.x, this.tileY - playerTile.y)
// // // //     return d < this.hearRadius * playerNoise
// // // //   }

// // // //   // ── Patrol / wander helpers ───────────────────────────────────

// // // //   _pickRandomWaypoint() {
// // // //     const COLS = this.grid.cols
// // // //     const ROWS = this.grid.rows
// // // //     for (let i = 0; i < 20; i++) {
// // // //       const rx = Math.floor(Math.random() * COLS)
// // // //       const ry = Math.floor(Math.random() * ROWS)
// // // //       if (!this.grid.isWalkable(rx, ry)) continue
// // // //       const d = this._distTo({ x: rx, y: ry })
// // // //       if (d > 4 && d < 20) return { x: rx, y: ry }
// // // //     }
// // // //     for (let i = 0; i < 50; i++) {
// // // //       const rx = Math.floor(Math.random() * COLS)
// // // //       const ry = Math.floor(Math.random() * ROWS)
// // // //       if (this.grid.isWalkable(rx, ry)) return { x: rx, y: ry }
// // // //     }
// // // //     return { x: this.tileX, y: this.tileY }
// // // //   }

// // // //   _buildPatrol() {
// // // //     const order = BFS.sweep(this.grid, this.tileX, this.tileY, 40)
// // // //     const pts   = [{ x: this.tileX, y: this.tileY }]
// // // //     for (let i = 5; i < order.length; i += 8) pts.push(order[i])
// // // //     return pts
// // // //   }

// // // //   _distTo(tile) {
// // // //     return Math.abs(this.tileX - tile.x) + Math.abs(this.tileY - tile.y)
// // // //   }

// // // //   _updateColor() {
// // // //     if (this.state === BEHAVIOR.CHASE || this.state === BEHAVIOR.BLOCK)
// // // //       this.color = COLORS.GUARD_ALERT
// // // //     else if (this.state === BEHAVIOR.SEARCH || this.state === BEHAVIOR.INVESTIGATE)
// // // //       this.color = COLORS.GUARD_SEARCH
// // // //     else
// // // //       this.color = COLORS.GUARD_PATROL
// // // //   }

// // // //   // ── Render ───────────────────────────────────────────────────

// // // //   draw(ctx, debug) {
// // // //     const x = this.pixelX
// // // //     const y = this.pixelY
// // // //     const s = T * 0.88

// // // //     // Soft vision glow behind character
// // // //     const vColor = this.state === BEHAVIOR.CHASE || this.state === BEHAVIOR.BLOCK
// // // //       ? '255,80,0'
// // // //       : this.state === BEHAVIOR.SEARCH || this.state === BEHAVIOR.INVESTIGATE
// // // //         ? '220,220,0' : '255,51,51'
// // // //     const vGrd = ctx.createRadialGradient(x, y, 0, x, y, this.visionPx)
// // // //     vGrd.addColorStop(0,   `rgba(${vColor},0.08)`)
// // // //     vGrd.addColorStop(0.6, `rgba(${vColor},0.03)`)
// // // //     vGrd.addColorStop(1,   `rgba(${vColor},0)`)
// // // //     ctx.fillStyle = vGrd
// // // //     ctx.beginPath()
// // // //     ctx.arc(x, y, this.visionPx, 0, Math.PI * 2)
// // // //     ctx.fill()

// // // //     // Alert ! or ? above head
// // // //     if (this.alertLevel > 0.6) {
// // // //       const mark   = this.alertLevel > 0.85 ? '!' : '?'
// // // //       const bounce = Math.sin(Date.now() / 150) * 3
// // // //       ctx.font      = `bold ${Math.floor(s * 0.7)}px monospace`
// // // //       ctx.textAlign = 'center'
// // // //       ctx.fillStyle  = this.alertLevel > 0.85 ? '#ff3333' : '#ffcc00'
// // // //       ctx.shadowBlur  = 8
// // // //       ctx.shadowColor = ctx.fillStyle
// // // //       ctx.fillText(mark, x, y - s * 1.55 + bounce)
// // // //       ctx.shadowBlur = 0
// // // //     }

// // // //     ctx.save()
// // // //     ctx.translate(x, y)
// // // //     if (this._facingLeft) ctx.scale(-1, 1)

// // // //     const legSwing = this._moving ? Math.sin(this._walkFrame) * 0.3 : 0
// // // //     const bodyColor = this.state === BEHAVIOR.CHASE || this.state === BEHAVIOR.BLOCK
// // // //       ? '#b71c1c'
// // // //       : this.state === BEHAVIOR.SEARCH || this.state === BEHAVIOR.INVESTIGATE
// // // //         ? '#e65100' : '#c62828'

// // // //     // Left leg
// // // //     ctx.save()
// // // //     ctx.translate(-s * 0.16, s * 0.22)
// // // //     ctx.rotate(-legSwing)
// // // //     ctx.fillStyle = '#1a237e'
// // // //     ctx.beginPath()
// // // //     ctx.roundRect(-s*0.11, 0, s*0.2, s*0.42, s*0.07)
// // // //     ctx.fill()
// // // //     ctx.fillStyle = '#0d1117'
// // // //     ctx.beginPath()
// // // //     ctx.ellipse(0, s*0.43, s*0.13, s*0.08, 0, 0, Math.PI*2)
// // // //     ctx.fill()
// // // //     ctx.restore()

// // // //     // Right leg
// // // //     ctx.save()
// // // //     ctx.translate(s * 0.16, s * 0.22)
// // // //     ctx.rotate(legSwing)
// // // //     ctx.fillStyle = '#1a237e'
// // // //     ctx.beginPath()
// // // //     ctx.roundRect(-s*0.11, 0, s*0.2, s*0.42, s*0.07)
// // // //     ctx.fill()
// // // //     ctx.fillStyle = '#0d1117'
// // // //     ctx.beginPath()
// // // //     ctx.ellipse(0, s*0.43, s*0.13, s*0.08, 0, 0, Math.PI*2)
// // // //     ctx.fill()
// // // //     ctx.restore()

// // // //     // Body
// // // //     ctx.fillStyle   = bodyColor
// // // //     ctx.shadowBlur  = this.alertLevel > 0.5 ? 14 : 5
// // // //     ctx.shadowColor = this.color
// // // //     ctx.beginPath()
// // // //     ctx.roundRect(-s*0.3, -s*0.15, s*0.6, s*0.44, s*0.12)
// // // //     ctx.fill()
// // // //     ctx.shadowBlur = 0

// // // //     // Badge
// // // //     ctx.fillStyle = '#ffd600'
// // // //     ctx.beginPath()
// // // //     ctx.arc(-s*0.1, s*0.04, s*0.09, 0, Math.PI*2)
// // // //     ctx.fill()
// // // //     ctx.fillStyle = '#0d1117'
// // // //     ctx.font      = `bold ${Math.floor(s * 0.12)}px monospace`
// // // //     ctx.textAlign = 'center'
// // // //     ctx.fillText('★', -s*0.1, s*0.08)

// // // //     // Left arm
// // // //     const armSwing = this._moving ? Math.sin(this._walkFrame + Math.PI) * 0.35 : 0
// // // //     ctx.save()
// // // //     ctx.translate(-s*0.32, -s*0.08)
// // // //     ctx.rotate(armSwing - 0.15)
// // // //     ctx.fillStyle = bodyColor
// // // //     ctx.beginPath()
// // // //     ctx.roundRect(-s*0.09, 0, s*0.18, s*0.32, s*0.07)
// // // //     ctx.fill()
// // // //     ctx.restore()

// // // //     // Right arm
// // // //     ctx.save()
// // // //     ctx.translate(s*0.32, -s*0.08)
// // // //     ctx.rotate(-armSwing + 0.15)
// // // //     ctx.fillStyle = bodyColor
// // // //     ctx.beginPath()
// // // //     ctx.roundRect(-s*0.09, 0, s*0.18, s*0.32, s*0.07)
// // // //     ctx.fill()
// // // //     ctx.restore()

// // // //     // Head
// // // //     ctx.fillStyle   = '#ffcc80'
// // // //     ctx.shadowBlur  = 6
// // // //     ctx.shadowColor = this.color
// // // //     ctx.beginPath()
// // // //     ctx.arc(0, -s*0.38, s*0.26, 0, Math.PI * 2)
// // // //     ctx.fill()
// // // //     ctx.shadowBlur = 0

// // // //     // Police hat
// // // //     ctx.fillStyle = bodyColor
// // // //     ctx.beginPath()
// // // //     ctx.roundRect(-s*0.28, -s*0.62, s*0.56, s*0.2, [s*0.06, s*0.06, 0, 0])
// // // //     ctx.fill()
// // // //     ctx.fillRect(-s*0.32, -s*0.44, s*0.64, s*0.08)
// // // //     ctx.fillStyle = '#ffd600'
// // // //     ctx.beginPath()
// // // //     ctx.arc(0, -s*0.56, s*0.07, 0, Math.PI*2)
// // // //     ctx.fill()

// // // //     // Eyes
// // // //     const isAlert = this.alertLevel > 0.5
// // // //     ctx.fillStyle = isAlert ? '#b71c1c' : '#1a237e'
// // // //     ctx.beginPath()
// // // //     ctx.arc(-s*0.1, -s*0.4, s*0.06, 0, Math.PI*2)
// // // //     ctx.fill()
// // // //     ctx.beginPath()
// // // //     ctx.arc(s*0.1, -s*0.4, s*0.06, 0, Math.PI*2)
// // // //     ctx.fill()
// // // //     ctx.fillStyle = 'white'
// // // //     ctx.beginPath()
// // // //     ctx.arc(-s*0.08, -s*0.42, s*0.022, 0, Math.PI*2)
// // // //     ctx.fill()
// // // //     ctx.beginPath()
// // // //     ctx.arc(s*0.12, -s*0.42, s*0.022, 0, Math.PI*2)
// // // //     ctx.fill()

// // // //     // Mouth
// // // //     ctx.strokeStyle = '#5d3a1a'
// // // //     ctx.lineWidth   = s * 0.04
// // // //     ctx.lineCap     = 'round'
// // // //     ctx.beginPath()
// // // //     if (isAlert) {
// // // //       ctx.moveTo(-s*0.1, -s*0.28)
// // // //       ctx.lineTo(s*0.1,  -s*0.28)
// // // //     } else {
// // // //       ctx.arc(0, -s*0.22, s*0.1, Math.PI + 0.3, -0.3)
// // // //     }
// // // //     ctx.stroke()

// // // //     ctx.restore()

// // // //     // Debug: A* path
// // // //     if (debug && this.debugPath.length > 1) {
// // // //       ctx.strokeStyle = COLORS.ASTAR_PATH
// // // //       ctx.lineWidth   = 1.5
// // // //       ctx.beginPath()
// // // //       this.debugPath.forEach((p, i) => {
// // // //         const px = p.x * T + T / 2, py = p.y * T + T / 2
// // // //         i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
// // // //       })
// // // //       ctx.stroke()
// // // //     }
// // // //   }
// // // // }
// // // import { TILE_SIZE, GUARD_CFG, BEHAVIOR, COLORS } from '../game/constants.js'
// // // import { AStar }            from '../ai/AStar.js'
// // // import { BFS }              from '../ai/BFS.js'
// // // import { DFS }              from '../ai/DFS.js'
// // // import { BehaviorTree }     from '../ai/BehaviorTree.js'
// // // import { VisibilitySystem } from './VisibilitySystem.js'
// // // import { MultiAgentCoord }  from './MultiAgentCoord.js'

// // // const T = TILE_SIZE

// // // function rr(ctx, x, y, w, h, r) {
// // //   r = Math.min(r, w / 2, h / 2)
// // //   ctx.beginPath()
// // //   ctx.moveTo(x + r, y)
// // //   ctx.lineTo(x + w - r, y)
// // //   ctx.arcTo(x + w, y,     x + w, y + r,     r)
// // //   ctx.lineTo(x + w, y + h - r)
// // //   ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
// // //   ctx.lineTo(x + r, y + h)
// // //   ctx.arcTo(x,     y + h, x,       y + h - r, r)
// // //   ctx.lineTo(x,     y + r)
// // //   ctx.arcTo(x,     y,     x + r,   y,         r)
// // //   ctx.closePath()
// // // }

// // // export class Guard {
// // //   constructor({ tileX, tileY, gene, id, geneIdx, grid, escapeTile, speedMult = 1, visionMult = 1 }) {
// // //     this.tileX      = tileX
// // //     this.tileY      = tileY
// // //     this.pixelX     = tileX * T + T / 2
// // //     this.pixelY     = tileY * T + T / 2

// // //     this.gene       = gene
// // //     this.id         = id
// // //     this.geneIdx    = geneIdx
// // //     this.grid       = grid
// // //     this.escapeTile = escapeTile

// // //     this.state           = BEHAVIOR.PATROL
// // //     this.alertLevel      = 0
// // //     this.lastKnownPlayer = null
// // //     this._isHearing      = false
// // //     this._interceptTarget = null

// // //     this.path            = []
// // //     this.pathIdx         = 1
// // //     this.debugPath       = []
// // //     this.framesSincePath = 0
// // //     this._walkFrame      = 0
// // //     this._moving         = false
// // //     this._facingLeft     = false
// // //     this._facingAngle    = 0

// // //     this.bfsQueue  = []
// // //     this.bfsStep   = 0
// // //     this.dfsQueue  = []
// // //     this.dfsStep   = 0

// // //     this.wanderTarget = null
// // //     this.wanderTimer  = 0

// // //     // Smarter patrol — build waypoints near exit
// // //     this.patrol    = this._buildSmartPatrol()
// // //     this.patrolIdx = 0

// // //     this.speed      = (GUARD_CFG.BASE_SPEED + gene.speedMult * 0.8) * T * speedMult
// // //     this.visionPx   = (GUARD_CFG.BASE_VISION + gene.visionMult * 3) * T * visionMult
// // //     this.hearRadius = (GUARD_CFG.HEAR_BASE   + gene.searchRadius * 4) * visionMult

// // //     this.tree  = new BehaviorTree(gene)
// // //     this.color = COLORS.GUARD_PATROL
// // //   }

// // //   update(dt, playerTile, playerVisible, heatmap, allGuards, ga, wantedSpeedMult = 1) {
// // //     this.framesSincePath++
// // //     this._isHearing = false
// // //     this.alertLevel = Math.max(0, this.alertLevel - GUARD_CFG.ALERT_DECAY * dt * 60)

// // //     if (playerVisible) {
// // //       this.alertLevel      = 1
// // //       this.lastKnownPlayer    = { ...playerTile }
// // //       this._investigateTarget = null   // recalc spread on next investigate
// // //       // Face toward last known position
// // //       this._facingAngle = Math.atan2(
// // //         playerTile.y * T - this.pixelY,
// // //         playerTile.x * T - this.pixelX
// // //       )
// // //       ga.recordSpot(this.geneIdx)
// // //       MultiAgentCoord.broadcastSighting(this, playerTile, allGuards)
// // //     } else if (this.lastKnownPlayer) {
// // //       // Gradually rotate vision toward last known position
// // //       const targetAngle = Math.atan2(
// // //         this.lastKnownPlayer.y * T - this.pixelY,
// // //         this.lastKnownPlayer.x * T - this.pixelX
// // //       )
// // //       const diff = targetAngle - this._facingAngle
// // //       const wrapped = ((diff + Math.PI) % (Math.PI * 2)) - Math.PI
// // //       this._facingAngle += wrapped * dt * 1.5
// // //     }

// // //     this.state = this.tree.tick({
// // //       guardTile:          { x: this.tileX, y: this.tileY },
// // //       playerTile:         playerVisible ? playerTile : null,
// // //       escapeTile:         this.escapeTile,
// // //       lastKnown:          this.lastKnownPlayer,
// // //       playerVisible,
// // //       alertLevel:         this.alertLevel,
// // //       chaseMemorySeconds: GUARD_CFG.CHASE_MEMORY,
// // //     })

// // //     if (this.alertLevel > 0.8)
// // //       MultiAgentCoord.assignBlocker(allGuards, this.escapeTile)

// // //     const target = this._resolveTarget(heatmap)

// // //     const recalcInterval = Math.max(12, GUARD_CFG.PATH_RECALC - Math.floor(this.gene.predictionAcc * 20))
// // //     if (target && (this.framesSincePath > recalcInterval || this.path.length === 0)) {
// // //       this.path        = AStar.findPath(this.grid, this.tileX, this.tileY, target.x, target.y)
// // //       this.pathIdx     = 1
// // //       this.debugPath   = this.path
// // //       this.framesSincePath = 0
// // //     }

// // //     this._followPath(dt, wantedSpeedMult)
// // //     this._updateColor()
// // //   }

// // //   setHearing(heard) { this._isHearing = heard }

// // //   _resolveTarget(heatmap) {
// // //     switch (this.state) {
// // //       case BEHAVIOR.CHASE: {
// // //         // Use intercept target if assigned, otherwise direct chase
// // //         if (this._interceptTarget) {
// // //           const d = this._distTo(this._interceptTarget)
// // //           if (d < 3) this._interceptTarget = null
// // //           else return this._interceptTarget
// // //         }
// // //         // Each guard approaches from a unique angle — no stacking on same tile
// // //         if (this.lastKnownPlayer) {
// // //           const angle  = ((this.id ?? 0) / 8) * Math.PI * 2
// // //           const spread = 3
// // //           const ox     = Math.round(Math.cos(angle) * spread)
// // //           const oy     = Math.round(Math.sin(angle) * spread)
// // //           const tx     = this.lastKnownPlayer.x + ox
// // //           const ty     = this.lastKnownPlayer.y + oy
// // //           if (tx >= 0 && ty >= 0 && tx < this.grid.cols && ty < this.grid.rows && this.grid.isWalkable(tx, ty))
// // //             return { x: tx, y: ty }
// // //         }
// // //         return this.lastKnownPlayer
// // //       }

// // //       case BEHAVIOR.BLOCK: return this.escapeTile

// // //       case BEHAVIOR.INVESTIGATE: {
// // //         if (!this.lastKnownPlayer) return null
// // //         // Each guard investigates a different offset around last known position
// // //         if (!this._investigateTarget) {
// // //           const angle = ((this.id ?? 0) / 8) * Math.PI * 2
// // //           const r     = 3 + ((this.id ?? 0) % 3)
// // //           const ox    = Math.round(Math.cos(angle) * r)
// // //           const oy    = Math.round(Math.sin(angle) * r)
// // //           const tx    = this.lastKnownPlayer.x + ox
// // //           const ty    = this.lastKnownPlayer.y + oy
// // //           this._investigateTarget = (
// // //             tx >= 0 && ty >= 0 && tx < this.grid.cols && ty < this.grid.rows && this.grid.isWalkable(tx, ty)
// // //           ) ? { x: tx, y: ty } : { ...this.lastKnownPlayer }
// // //         }
// // //         if (this._distTo(this._investigateTarget) < 2) {
// // //           this._investigateTarget = null
// // //           if (this.gene.aggression > 0.5) {
// // //             this.dfsQueue = DFS.sweep(this.grid, this.tileX, this.tileY, 60)
// // //             this.dfsStep  = 0
// // //           } else {
// // //             this.bfsQueue = BFS.sweep(this.grid, this.tileX, this.tileY, 80)
// // //             this.bfsStep  = 0
// // //           }
// // //           this.state = BEHAVIOR.SEARCH
// // //         }
// // //         return this._investigateTarget || this.lastKnownPlayer
// // //       }

// // //       case BEHAVIOR.SEARCH: {
// // //         const queue = this.gene.aggression > 0.5 ? this.dfsQueue : this.bfsQueue
// // //         const step  = this.gene.aggression > 0.5 ? this.dfsStep  : this.bfsStep
// // //         if (step < queue.length) {
// // //           const t = queue[step]
// // //           if (this._distTo(t) < 2) {
// // //             if (this.gene.aggression > 0.5) this.dfsStep++
// // //             else this.bfsStep++
// // //           }
// // //           return t
// // //         }
// // //         const hot = heatmap.hottest()
// // //         if (hot.v > 0.1) return hot
// // //         this.state = BEHAVIOR.PATROL
// // //         return null
// // //       }

// // //       case BEHAVIOR.PATROL: {
// // //         const wp = this.patrol[this.patrolIdx % this.patrol.length]
// // //         if (this._distTo(wp) < 2) {
// // //           this.patrolIdx++
// // //         } else if (this.framesSincePath > 120) {
// // //           // Stuck for too long — skip this waypoint and pick a fresh random one
// // //           this.patrolIdx++
// // //           this.patrol[this.patrolIdx % this.patrol.length] = this._pickRandomWaypoint()
// // //           this.framesSincePath = 0
// // //         }
// // //         return wp
// // //       }

// // //       default: return null
// // //     }
// // //   }

// // //   _followPath(dt, speedMult = 1) {
// // //     if (this.path.length < 2 || this.pathIdx >= this.path.length) {
// // //       this._moving = false
// // //       this.framesSincePath = 999
// // //       return
// // //     }

// // //     const next = this.path[this.pathIdx]

// // //     // Validate next tile is still walkable — path may cross a bad tile
// // //     if (!this.grid.isWalkable(next.x, next.y)) {
// // //       this.path = []
// // //       this.framesSincePath = 999
// // //       this._moving = false
// // //       return
// // //     }

// // //     const tpx  = next.x * T + T / 2
// // //     const tpy  = next.y * T + T / 2
// // //     const dx   = tpx - this.pixelX
// // //     const dy   = tpy - this.pixelY
// // //     const dist = Math.hypot(dx, dy)
// // //     const spd  = this.speed * speedMult * dt

// // //     if (dist < spd + 1) {
// // //       this.pixelX = tpx; this.pixelY = tpy
// // //       this.tileX  = next.x; this.tileY = next.y
// // //       this.pathIdx++
// // //     } else {
// // //       // Try direct movement first
// // //       const nx = this.pixelX + (dx / dist) * spd
// // //       const ny = this.pixelY + (dy / dist) * spd
// // //       const ntx = Math.floor(nx / T)
// // //       const nty = Math.floor(ny / T)

// // //       if (this.grid.isWalkable(ntx, nty)) {
// // //         // Free to move
// // //         this.pixelX = nx
// // //         this.pixelY = ny
// // //       } else {
// // //         // Blocked — try sliding along X or Y axis
// // //         const slideX = this.pixelX + (dx / dist) * spd
// // //         const slideY = this.pixelY
// // //         const stx = Math.floor(slideX / T)
// // //         const sty = Math.floor(slideY / T)

// // //         const slideYOnly = this.pixelX
// // //         const slideYOnlyY = this.pixelY + (dy / dist) * spd
// // //         const stx2 = Math.floor(slideYOnly / T)
// // //         const sty2 = Math.floor(slideYOnlyY / T)

// // //         if (this.grid.isWalkable(stx, sty)) {
// // //           this.pixelX = slideX
// // //         } else if (this.grid.isWalkable(stx2, sty2)) {
// // //           this.pixelY = slideYOnlyY
// // //         } else {
// // //           // Truly stuck — force full repath
// // //           this._stuckFrames = (this._stuckFrames || 0) + 1
// // //           if (this._stuckFrames > 10) {
// // //             this.path = []
// // //             this.framesSincePath = 999
// // //             this._stuckFrames = 0
// // //           }
// // //         }
// // //       }
// // //     }

// // //     // Update tile position from pixel
// // //     this.tileX = Math.floor(this.pixelX / T)
// // //     this.tileY = Math.floor(this.pixelY / T)

// // //     this._moving     = dist > 1
// // //     this._facingLeft = dx < 0
// // //     if (this._moving) {
// // //       this._facingAngle = Math.atan2(dy, dx)
// // //       this._stuckFrames = 0
// // //     } else if (this.state === 'patrol' || this.state === 'search') {
// // //       this._facingAngle += dt * 0.8
// // //     }
// // //     this._walkFrame += spd * 0.25
// // //   }

// // //   canSeePlayer(playerPixelX, playerPixelY) {
// // //     return VisibilitySystem.hasLineOfSight(
// // //       this.grid,
// // //       this.pixelX, this.pixelY,
// // //       playerPixelX, playerPixelY,
// // //       this.visionPx
// // //     )
// // //   }

// // //   hearPlayer(playerTile, playerNoise) {
// // //     const d = Math.hypot(this.tileX - playerTile.x, this.tileY - playerTile.y)
// // //     return d < this.hearRadius * playerNoise
// // //   }

// // //   // Smart patrol — mostly near exit, some random
// // //   _buildSmartPatrol() {
// // //     const pts = []

// // //     // Each guard gets a unique offset into the exit-area sweep so they
// // //     // don't all converge on the same waypoints
// // //     const offset = (this.id ?? 0) % 6
// // //     const exitArea = BFS.sweep(this.grid, this.escapeTile.x, this.escapeTile.y, 35)
// // //     // Take every 6th tile but start at a different offset per guard
// // //     for (let i = offset + 2; i < exitArea.length; i += 6) pts.push(exitArea[i])

// // //     // Each guard also patrols from their OWN spawn outward (not all from exit)
// // //     const ownArea = BFS.sweep(this.grid, this.tileX, this.tileY, 30)
// // //     const ownOffset = (this.id ?? 0) % 8
// // //     for (let i = ownOffset + 3; i < ownArea.length; i += 8) pts.push(ownArea[i])

// // //     // Shuffle the waypoints so guards don't march in lockstep
// // //     for (let i = pts.length - 1; i > 0; i--) {
// // //       const j = Math.floor(Math.random() * (i + 1));
// // //       [pts[i], pts[j]] = [pts[j], pts[i]]
// // //     }

// // //     return pts.length > 0 ? pts : [this._pickRandomWaypoint()]
// // //   }

// // //   _pickRandomWaypoint() {
// // //     const COLS = this.grid.cols
// // //     const ROWS = this.grid.rows
// // //     for (let i = 0; i < 20; i++) {
// // //       const rx = Math.floor(Math.random() * COLS)
// // //       const ry = Math.floor(Math.random() * ROWS)
// // //       if (!this.grid.isWalkable(rx, ry)) continue
// // //       const d = this._distTo({ x: rx, y: ry })
// // //       if (d > 4 && d < 20) return { x: rx, y: ry }
// // //     }
// // //     for (let i = 0; i < 50; i++) {
// // //       const rx = Math.floor(Math.random() * COLS)
// // //       const ry = Math.floor(Math.random() * ROWS)
// // //       if (this.grid.isWalkable(rx, ry)) return { x: rx, y: ry }
// // //     }
// // //     return { x: this.tileX, y: this.tileY }
// // //   }

// // //   _buildPatrol() { return this._buildSmartPatrol() }
// // //   _distTo(tile)  { return Math.abs(this.tileX - tile.x) + Math.abs(this.tileY - tile.y) }

// // //   _updateColor() {
// // //     if (this.state === BEHAVIOR.CHASE || this.state === BEHAVIOR.BLOCK)
// // //       this.color = COLORS.GUARD_ALERT
// // //     else if (this.state === BEHAVIOR.SEARCH || this.state === BEHAVIOR.INVESTIGATE)
// // //       this.color = COLORS.GUARD_SEARCH
// // //     else
// // //       this.color = COLORS.GUARD_PATROL
// // //   }

// // //   // draw(ctx, debug) {
// // //   //   const x = this.pixelX
// // //   //   const y = this.pixelY
// // //   //   const s = T * 0.88

// // //   //   // Hearing highlight
// // //   //   if (this._isHearing) {
// // //   //     const pulse = 0.6 + 0.4 * Math.sin(Date.now() / 80)
// // //   //     ctx.save()
// // //   //     ctx.strokeStyle = `rgba(255,230,0,${pulse})`
// // //   //     ctx.lineWidth   = 3
// // //   //     ctx.shadowBlur  = 18
// // //   //     ctx.shadowColor = '#ffdd00'
// // //   //     ctx.beginPath()
// // //   //     ctx.arc(x, y, s * 1.05, 0, Math.PI * 2)
// // //   //     ctx.stroke()
// // //   //     ctx.fillStyle = 'rgba(255,220,0,0.08)'
// // //   //     ctx.beginPath()
// // //   //     ctx.arc(x, y, s * 1.05, 0, Math.PI * 2)
// // //   //     ctx.fill()
// // //   //     ctx.restore()

// // //   //     ctx.save()
// // //   //     ctx.font      = `${Math.floor(s * 0.65)}px serif`
// // //   //     ctx.textAlign = 'center'
// // //   //     const bounce  = Math.sin(Date.now() / 120) * 2
// // //   //     ctx.fillStyle   = '#ffdd00'
// // //   //     ctx.shadowBlur  = 10
// // //   //     ctx.shadowColor = '#ffaa00'
// // //   //     ctx.fillText('👂', x, y - s * 1.55 + bounce)
// // //   //     ctx.shadowBlur = 0
// // //   //     ctx.restore()
// // //   //   }

// // //   //   // Alert ! or ?
// // //   //   if (this.alertLevel > 0.6 && !this._isHearing) {
// // //   //     const mark   = this.alertLevel > 0.85 ? '!' : '?'
// // //   //     const bounce = Math.sin(Date.now() / 150) * 3
// // //   //     ctx.font      = `bold ${Math.floor(s * 0.7)}px monospace`
// // //   //     ctx.textAlign = 'center'
// // //   //     ctx.fillStyle  = this.alertLevel > 0.85 ? '#ff3333' : '#ffcc00'
// // //   //     ctx.shadowBlur  = 8
// // //   //     ctx.shadowColor = ctx.fillStyle
// // //   //     ctx.fillText(mark, x, y - s * 1.55 + bounce)
// // //   //     ctx.shadowBlur = 0
// // //   //   }

// // //   //   ctx.save()
// // //   //   ctx.translate(x, y)
// // //   //   if (this._facingLeft) ctx.scale(-1, 1)

// // //   //   const legSwing  = this._moving ? Math.sin(this._walkFrame) * 0.3 : 0
// // //   //   const bodyColor = this.state === BEHAVIOR.CHASE || this.state === BEHAVIOR.BLOCK
// // //   //     ? '#b71c1c'
// // //   //     : this.state === BEHAVIOR.SEARCH || this.state === BEHAVIOR.INVESTIGATE
// // //   //       ? '#e65100' : '#c62828'

// // //   //   // Legs
// // //   //   ctx.save()
// // //   //   ctx.translate(-s*0.16, s*0.22)
// // //   //   ctx.rotate(-legSwing)
// // //   //   ctx.fillStyle = '#1a237e'
// // //   //   rr(ctx, -s*0.11, 0, s*0.2, s*0.42, s*0.07); ctx.fill()
// // //   //   ctx.fillStyle = '#0d1117'
// // //   //   ctx.beginPath(); ctx.ellipse(0, s*0.43, s*0.13, s*0.08, 0, 0, Math.PI*2); ctx.fill()
// // //   //   ctx.restore()

// // //   //   ctx.save()
// // //   //   ctx.translate(s*0.16, s*0.22)
// // //   //   ctx.rotate(legSwing)
// // //   //   ctx.fillStyle = '#1a237e'
// // //   //   rr(ctx, -s*0.11, 0, s*0.2, s*0.42, s*0.07); ctx.fill()
// // //   //   ctx.fillStyle = '#0d1117'
// // //   //   ctx.beginPath(); ctx.ellipse(0, s*0.43, s*0.13, s*0.08, 0, 0, Math.PI*2); ctx.fill()
// // //   //   ctx.restore()

// // //   //   // Body
// // //   //   ctx.fillStyle   = bodyColor
// // //   //   ctx.shadowBlur  = this._isHearing ? 20 : this.alertLevel > 0.5 ? 14 : 5
// // //   //   ctx.shadowColor = this._isHearing ? '#ffdd00' : this.color
// // //   //   rr(ctx, -s*0.3, -s*0.15, s*0.6, s*0.44, s*0.12); ctx.fill()
// // //   //   ctx.shadowBlur = 0

// // //   //   // Badge
// // //   //   ctx.fillStyle = '#ffd600'
// // //   //   ctx.beginPath(); ctx.arc(-s*0.1, s*0.04, s*0.09, 0, Math.PI*2); ctx.fill()
// // //   //   ctx.fillStyle = '#0d1117'
// // //   //   ctx.font = `bold ${Math.floor(s*0.12)}px monospace`
// // //   //   ctx.textAlign = 'center'
// // //   //   ctx.fillText('★', -s*0.1, s*0.08)

// // //   //   // Arms
// // //   //   const armSwing = this._moving ? Math.sin(this._walkFrame + Math.PI) * 0.35 : 0
// // //   //   ctx.save()
// // //   //   ctx.translate(-s*0.32, -s*0.08); ctx.rotate(armSwing - 0.15)
// // //   //   ctx.fillStyle = bodyColor
// // //   //   rr(ctx, -s*0.09, 0, s*0.18, s*0.32, s*0.07); ctx.fill()
// // //   //   ctx.restore()

// // //   //   ctx.save()
// // //   //   ctx.translate(s*0.32, -s*0.08); ctx.rotate(-armSwing + 0.15)
// // //   //   ctx.fillStyle = bodyColor
// // //   //   rr(ctx, -s*0.09, 0, s*0.18, s*0.32, s*0.07); ctx.fill()
// // //   //   ctx.restore()

// // //   //   // Head
// // //   //   ctx.fillStyle   = '#ffcc80'
// // //   //   ctx.shadowBlur  = 6
// // //   //   ctx.shadowColor = this._isHearing ? '#ffdd00' : this.color
// // //   //   ctx.beginPath(); ctx.arc(0, -s*0.38, s*0.26, 0, Math.PI*2); ctx.fill()
// // //   //   ctx.shadowBlur = 0

// // //   //   // Hat
// // //   //   ctx.fillStyle = bodyColor
// // //   //   rr(ctx, -s*0.28, -s*0.62, s*0.56, s*0.2, s*0.06); ctx.fill()
// // //   //   ctx.fillRect(-s*0.32, -s*0.44, s*0.64, s*0.08)
// // //   //   ctx.fillStyle = '#ffd600'
// // //   //   ctx.beginPath(); ctx.arc(0, -s*0.56, s*0.07, 0, Math.PI*2); ctx.fill()

// // //   //   // Eyes
// // //   //   const isAlert = this.alertLevel > 0.5
// // //   //   ctx.fillStyle = this._isHearing ? '#ff9800' : isAlert ? '#b71c1c' : '#1a237e'
// // //   //   ctx.beginPath(); ctx.arc(-s*0.1, -s*0.4, s*0.06, 0, Math.PI*2); ctx.fill()
// // //   //   ctx.beginPath(); ctx.arc(s*0.1, -s*0.4, s*0.06, 0, Math.PI*2); ctx.fill()
// // //   //   ctx.fillStyle = 'white'
// // //   //   ctx.beginPath(); ctx.arc(-s*0.08, -s*0.42, s*0.022, 0, Math.PI*2); ctx.fill()
// // //   //   ctx.beginPath(); ctx.arc(s*0.12, -s*0.42, s*0.022, 0, Math.PI*2); ctx.fill()

// // //   //   // Mouth
// // //   //   ctx.strokeStyle = '#5d3a1a'
// // //   //   ctx.lineWidth   = s * 0.04
// // //   //   ctx.lineCap     = 'round'
// // //   //   ctx.beginPath()
// // //   //   if (isAlert || this._isHearing) {
// // //   //     ctx.moveTo(-s*0.1, -s*0.28); ctx.lineTo(s*0.1, -s*0.28)
// // //   //   } else {
// // //   //     ctx.arc(0, -s*0.22, s*0.1, Math.PI + 0.3, -0.3)
// // //   //   }
// // //   //   ctx.stroke()
// // //   //   ctx.restore()

// // //   //   if (debug && this.debugPath.length > 1) {
// // //   //     ctx.strokeStyle = COLORS.ASTAR_PATH
// // //   //     ctx.lineWidth   = 1.5
// // //   //     ctx.beginPath()
// // //   //     this.debugPath.forEach((p, i) => {
// // //   //       const px = p.x*T+T/2, py = p.y*T+T/2
// // //   //       i === 0 ? ctx.moveTo(px,py) : ctx.lineTo(px,py)
// // //   //     })
// // //   //     ctx.stroke()
// // //   //   }
// // //   // }
// // //   draw(ctx, debug) {
// // //     const x = this.pixelX
// // //     const y = this.pixelY
// // //     const s = T * 0.88

// // //     // Alert ! or ? above head — only when alert, no hearing ring
// // //     if (this.alertLevel > 0.6) {
// // //       const mark   = this.alertLevel > 0.85 ? '!' : '?'
// // //       const bounce = Math.sin(Date.now() / 150) * 3
// // //       ctx.font      = `bold ${Math.floor(s * 0.7)}px monospace`
// // //       ctx.textAlign = 'center'
// // //       ctx.fillStyle  = this.alertLevel > 0.85 ? '#ff3333' : '#ffcc00'
// // //       ctx.shadowBlur  = 8
// // //       ctx.shadowColor = ctx.fillStyle
// // //       ctx.fillText(mark, x, y - s * 1.55 + bounce)
// // //       ctx.shadowBlur = 0
// // //     }

// // //     ctx.save()
// // //     ctx.translate(x, y)
// // //     if (this._facingLeft) ctx.scale(-1, 1)

// // //     const legSwing  = this._moving ? Math.sin(this._walkFrame) * 0.3 : 0
// // //     const bodyColor = this.state === BEHAVIOR.CHASE || this.state === BEHAVIOR.BLOCK
// // //       ? '#b71c1c'
// // //       : this.state === BEHAVIOR.SEARCH || this.state === BEHAVIOR.INVESTIGATE
// // //         ? '#e65100' : '#c62828'

// // //     // Left leg
// // //     ctx.save()
// // //     ctx.translate(-s*0.16, s*0.22)
// // //     ctx.rotate(-legSwing)
// // //     ctx.fillStyle = '#1a237e'
// // //     rr(ctx, -s*0.11, 0, s*0.2, s*0.42, s*0.07); ctx.fill()
// // //     ctx.fillStyle = '#0d1117'
// // //     ctx.beginPath(); ctx.ellipse(0, s*0.43, s*0.13, s*0.08, 0, 0, Math.PI*2); ctx.fill()
// // //     ctx.restore()

// // //     // Right leg
// // //     ctx.save()
// // //     ctx.translate(s*0.16, s*0.22)
// // //     ctx.rotate(legSwing)
// // //     ctx.fillStyle = '#1a237e'
// // //     rr(ctx, -s*0.11, 0, s*0.2, s*0.42, s*0.07); ctx.fill()
// // //     ctx.fillStyle = '#0d1117'
// // //     ctx.beginPath(); ctx.ellipse(0, s*0.43, s*0.13, s*0.08, 0, 0, Math.PI*2); ctx.fill()
// // //     ctx.restore()

// // //     // Body
// // //     ctx.fillStyle   = bodyColor
// // //     ctx.shadowBlur  = this.alertLevel > 0.5 ? 10 : 4
// // //     ctx.shadowColor = this.color
// // //     rr(ctx, -s*0.3, -s*0.15, s*0.6, s*0.44, s*0.12); ctx.fill()
// // //     ctx.shadowBlur = 0

// // //     // Badge
// // //     ctx.fillStyle = '#ffd600'
// // //     ctx.beginPath(); ctx.arc(-s*0.1, s*0.04, s*0.09, 0, Math.PI*2); ctx.fill()
// // //     ctx.fillStyle = '#0d1117'
// // //     ctx.font = `bold ${Math.floor(s*0.12)}px monospace`
// // //     ctx.textAlign = 'center'
// // //     ctx.fillText('★', -s*0.1, s*0.08)

// // //     // Arms
// // //     const armSwing = this._moving ? Math.sin(this._walkFrame + Math.PI) * 0.35 : 0
// // //     ctx.save()
// // //     ctx.translate(-s*0.32, -s*0.08); ctx.rotate(armSwing - 0.15)
// // //     ctx.fillStyle = bodyColor
// // //     rr(ctx, -s*0.09, 0, s*0.18, s*0.32, s*0.07); ctx.fill()
// // //     ctx.restore()

// // //     ctx.save()
// // //     ctx.translate(s*0.32, -s*0.08); ctx.rotate(-armSwing + 0.15)
// // //     ctx.fillStyle = bodyColor
// // //     rr(ctx, -s*0.09, 0, s*0.18, s*0.32, s*0.07); ctx.fill()
// // //     ctx.restore()

// // //     // Head
// // //     ctx.fillStyle   = '#ffcc80'
// // //     ctx.shadowBlur  = 4
// // //     ctx.shadowColor = this.color
// // //     ctx.beginPath(); ctx.arc(0, -s*0.38, s*0.26, 0, Math.PI*2); ctx.fill()
// // //     ctx.shadowBlur = 0

// // //     // Hat
// // //     ctx.fillStyle = bodyColor
// // //     rr(ctx, -s*0.28, -s*0.62, s*0.56, s*0.2, s*0.06); ctx.fill()
// // //     ctx.fillRect(-s*0.32, -s*0.44, s*0.64, s*0.08)
// // //     ctx.fillStyle = '#ffd600'
// // //     ctx.beginPath(); ctx.arc(0, -s*0.56, s*0.07, 0, Math.PI*2); ctx.fill()

// // //     // Eyes
// // //     const isAlert = this.alertLevel > 0.5
// // //     ctx.fillStyle = isAlert ? '#b71c1c' : '#1a237e'
// // //     ctx.beginPath(); ctx.arc(-s*0.1, -s*0.4, s*0.06, 0, Math.PI*2); ctx.fill()
// // //     ctx.beginPath(); ctx.arc(s*0.1, -s*0.4, s*0.06, 0, Math.PI*2); ctx.fill()
// // //     ctx.fillStyle = 'white'
// // //     ctx.beginPath(); ctx.arc(-s*0.08, -s*0.42, s*0.022, 0, Math.PI*2); ctx.fill()
// // //     ctx.beginPath(); ctx.arc(s*0.12, -s*0.42, s*0.022, 0, Math.PI*2); ctx.fill()

// // //     // Mouth
// // //     ctx.strokeStyle = '#5d3a1a'
// // //     ctx.lineWidth   = s * 0.04
// // //     ctx.lineCap     = 'round'
// // //     ctx.beginPath()
// // //     if (isAlert) {
// // //       ctx.moveTo(-s*0.1, -s*0.28); ctx.lineTo(s*0.1, -s*0.28)
// // //     } else {
// // //       ctx.arc(0, -s*0.22, s*0.1, Math.PI + 0.3, -0.3)
// // //     }
// // //     ctx.stroke()
// // //     ctx.restore()

// // //     // Debug A* path
// // //     if (debug && this.debugPath.length > 1) {
// // //       ctx.strokeStyle = COLORS.ASTAR_PATH
// // //       ctx.lineWidth   = 1.5
// // //       ctx.beginPath()
// // //       this.debugPath.forEach((p, i) => {
// // //         const px = p.x*T+T/2, py = p.y*T+T/2
// // //         i === 0 ? ctx.moveTo(px,py) : ctx.lineTo(px,py)
// // //       })
// // //       ctx.stroke()
// // //     }
// // //   }
// // // }

// // // import { TILE_SIZE, GUARD_CFG, BEHAVIOR, COLORS } from '../game/constants.js'
// // // import { AStar }            from '../ai/AStar.js'
// // // import { BFS }              from '../ai/BFS.js'
// // // import { DFS }              from '../ai/DFS.js'
// // // import { BehaviorTree }     from '../ai/BehaviorTree.js'
// // // import { VisibilitySystem } from './VisibilitySystem.js'
// // // import { MultiAgentCoord }  from './MultiAgentCoord.js'

// // // const T = TILE_SIZE

// // // export class Guard {
// // //   constructor({ tileX, tileY, gene, id, geneIdx, grid, escapeTile, speedMult = 1, visionMult = 1 }) {
// // //     this.tileX      = tileX
// // //     this.tileY      = tileY
// // //     this.pixelX     = tileX * T + T / 2
// // //     this.pixelY     = tileY * T + T / 2

// // //     this.gene       = gene
// // //     this.id         = id
// // //     this.geneIdx    = geneIdx
// // //     this.grid       = grid
// // //     this.escapeTile = escapeTile

// // //     this.state           = BEHAVIOR.PATROL
// // //     this.alertLevel      = 0
// // //     this.lastKnownPlayer = null

// // //     this.path            = []
// // //     this.pathIdx         = 1
// // //     this.debugPath       = []
// // //     this.framesSincePath = 0
// // //     this._walkFrame      = 0
// // //     this._moving         = false
// // //     this._facingLeft     = false

// // //     this.bfsQueue  = []
// // //     this.bfsStep   = 0
// // //     this.dfsQueue  = []
// // //     this.dfsStep   = 0

// // //     this.wanderTarget = null
// // //     this.wanderTimer  = 0

// // //     this.patrol    = this._buildPatrol()
// // //     this.patrolIdx = 0

// // //     this.speed      = (GUARD_CFG.BASE_SPEED + gene.speedMult * 0.8) * T
// // //     this.visionPx   = (GUARD_CFG.BASE_VISION + gene.visionMult * 3) * T
// // //     this.hearRadius = (GUARD_CFG.HEAR_BASE   + gene.searchRadius * 4)

// // //     this.tree  = new BehaviorTree(gene)
// // //     this.color = COLORS.GUARD_PATROL
// // //   }

// // //   // ── Main update ─────────────────────────────────────────────

// // //   update(dt, playerTile, playerVisible, heatmap, allGuards, ga) {
// // //     this.framesSincePath++
// // //     this.alertLevel = Math.max(0, this.alertLevel - GUARD_CFG.ALERT_DECAY * dt * 60)

// // //     if (playerVisible) {
// // //       this.alertLevel      = 1
// // //       this.lastKnownPlayer = { ...playerTile }
// // //       ga.recordSpot(this.geneIdx)
// // //       MultiAgentCoord.broadcastSighting(this, playerTile, allGuards)
// // //     }

// // //     this.state = this.tree.tick({
// // //       guardTile:     { x: this.tileX, y: this.tileY },
// // //       playerTile:    playerVisible ? playerTile : null,
// // //       escapeTile:    this.escapeTile,
// // //       lastKnown:     this.lastKnownPlayer,
// // //       playerVisible,
// // //       alertLevel:    this.alertLevel,
// // //     })

// // //     if (this.alertLevel > 0.8)
// // //       MultiAgentCoord.assignBlocker(allGuards, this.escapeTile)

// // //     const target = this._resolveTarget(heatmap)

// // //     const recalcInterval = Math.max(15, GUARD_CFG.PATH_RECALC - Math.floor(this.gene.predictionAcc * 20))
// // //     if (target && (this.framesSincePath > recalcInterval || this.path.length === 0)) {
// // //       this.path  = AStar.findPath(this.grid, this.tileX, this.tileY, target.x, target.y)
// // //       this.pathIdx = 1
// // //       this.debugPath = this.path
// // //       this.framesSincePath = 0
// // //     }

// // //     this._followPath(dt)
// // //     this._updateColor()
// // //   }

// // //   // ── Resolve movement target ──────────────────────────────────

// // //   _resolveTarget(heatmap) {
// // //     switch (this.state) {
// // //       case BEHAVIOR.CHASE:
// // //         return this.lastKnownPlayer

// // //       case BEHAVIOR.BLOCK:
// // //         return this.escapeTile

// // //       case BEHAVIOR.INVESTIGATE:
// // //         if (!this.lastKnownPlayer) return null
// // //         if (this._distTo(this.lastKnownPlayer) < 2) {
// // //           if (this.gene.aggression > 0.5) {
// // //             this.dfsQueue = DFS.sweep(this.grid, this.tileX, this.tileY, 60)
// // //             this.dfsStep  = 0
// // //           } else {
// // //             this.bfsQueue = BFS.sweep(this.grid, this.tileX, this.tileY, 80)
// // //             this.bfsStep  = 0
// // //           }
// // //           this.state = BEHAVIOR.SEARCH
// // //         }
// // //         return this.lastKnownPlayer

// // //       case BEHAVIOR.SEARCH: {
// // //         const queue = this.gene.aggression > 0.5 ? this.dfsQueue : this.bfsQueue
// // //         const step  = this.gene.aggression > 0.5 ? this.dfsStep  : this.bfsStep
// // //         if (step < queue.length) {
// // //           const t = queue[step]
// // //           if (this._distTo(t) < 2) {
// // //             if (this.gene.aggression > 0.5) this.dfsStep++
// // //             else this.bfsStep++
// // //           }
// // //           return t
// // //         }
// // //         const hot = heatmap.hottest()
// // //         if (hot.v > 0.1) return hot
// // //         this.state = BEHAVIOR.PATROL
// // //         return null
// // //       }

// // //       case BEHAVIOR.PATROL: {
// // //         const arrived  = this.wanderTarget && this._distTo(this.wanderTarget) < 2
// // //         const timedOut = this.wanderTimer <= 0
// // //         if (!this.wanderTarget || arrived || timedOut) {
// // //           this.wanderTarget = this._pickRandomWaypoint()
// // //           this.wanderTimer  = 180 + Math.random() * 240
// // //         }
// // //         this.wanderTimer--
// // //         return this.wanderTarget
// // //       }

// // //       default: return null
// // //     }
// // //   }

// // //   // ── Follow A* path ───────────────────────────────────────────

// // //   _followPath(dt) {
// // //     if (this.path.length < 2 || this.pathIdx >= this.path.length) {
// // //       this._moving = false
// // //       return
// // //     }

// // //     const next = this.path[this.pathIdx]
// // //     const tpx  = next.x * T + T / 2
// // //     const tpy  = next.y * T + T / 2
// // //     const dx   = tpx - this.pixelX
// // //     const dy   = tpy - this.pixelY
// // //     const dist = Math.hypot(dx, dy)
// // //     const spd  = this.speed * dt

// // //     if (dist < spd + 1) {
// // //       this.pixelX = tpx; this.pixelY = tpy
// // //       this.tileX  = next.x; this.tileY = next.y
// // //       this.pathIdx++
// // //     } else {
// // //       this.pixelX += (dx / dist) * spd
// // //       this.pixelY += (dy / dist) * spd
// // //     }
    
// // //     this._moving      = dist > 1
// // //     this._facingLeft  = dx < 0
// // //     this._walkFrame  += spd * 0.25
// // //     if (dist > 1) this._facingAngle = Math.atan2(dy, dx)
// // //   }

// // //   // ── Visibility & hearing ─────────────────────────────────────

// // //   canSeePlayer(playerPixelX, playerPixelY) {
// // //     return VisibilitySystem.hasLineOfSight(
// // //       this.grid,
// // //       this.pixelX, this.pixelY,
// // //       playerPixelX, playerPixelY,
// // //       this.visionPx
// // //     )
// // //   }

// // //   hearPlayer(playerTile, playerNoise) {
// // //     const d = Math.hypot(this.tileX - playerTile.x, this.tileY - playerTile.y)
// // //     return d < this.hearRadius * playerNoise
// // //   }

// // //   // ── Patrol / wander helpers ───────────────────────────────────

// // //   _pickRandomWaypoint() {
// // //     const COLS = this.grid.cols
// // //     const ROWS = this.grid.rows
// // //     for (let i = 0; i < 20; i++) {
// // //       const rx = Math.floor(Math.random() * COLS)
// // //       const ry = Math.floor(Math.random() * ROWS)
// // //       if (!this.grid.isWalkable(rx, ry)) continue
// // //       const d = this._distTo({ x: rx, y: ry })
// // //       if (d > 4 && d < 20) return { x: rx, y: ry }
// // //     }
// // //     for (let i = 0; i < 50; i++) {
// // //       const rx = Math.floor(Math.random() * COLS)
// // //       const ry = Math.floor(Math.random() * ROWS)
// // //       if (this.grid.isWalkable(rx, ry)) return { x: rx, y: ry }
// // //     }
// // //     return { x: this.tileX, y: this.tileY }
// // //   }

// // //   _buildPatrol() {
// // //     const order = BFS.sweep(this.grid, this.tileX, this.tileY, 40)
// // //     const pts   = [{ x: this.tileX, y: this.tileY }]
// // //     for (let i = 5; i < order.length; i += 8) pts.push(order[i])
// // //     return pts
// // //   }

// // //   _distTo(tile) {
// // //     return Math.abs(this.tileX - tile.x) + Math.abs(this.tileY - tile.y)
// // //   }

// // //   _updateColor() {
// // //     if (this.state === BEHAVIOR.CHASE || this.state === BEHAVIOR.BLOCK)
// // //       this.color = COLORS.GUARD_ALERT
// // //     else if (this.state === BEHAVIOR.SEARCH || this.state === BEHAVIOR.INVESTIGATE)
// // //       this.color = COLORS.GUARD_SEARCH
// // //     else
// // //       this.color = COLORS.GUARD_PATROL
// // //   }

// // //   // ── Render ───────────────────────────────────────────────────

// // //   draw(ctx, debug) {
// // //     const x = this.pixelX
// // //     const y = this.pixelY
// // //     const s = T * 0.88

// // //     // Soft vision glow behind character
// // //     const vColor = this.state === BEHAVIOR.CHASE || this.state === BEHAVIOR.BLOCK
// // //       ? '255,80,0'
// // //       : this.state === BEHAVIOR.SEARCH || this.state === BEHAVIOR.INVESTIGATE
// // //         ? '220,220,0' : '255,51,51'
// // //     const vGrd = ctx.createRadialGradient(x, y, 0, x, y, this.visionPx)
// // //     vGrd.addColorStop(0,   `rgba(${vColor},0.08)`)
// // //     vGrd.addColorStop(0.6, `rgba(${vColor},0.03)`)
// // //     vGrd.addColorStop(1,   `rgba(${vColor},0)`)
// // //     ctx.fillStyle = vGrd
// // //     ctx.beginPath()
// // //     ctx.arc(x, y, this.visionPx, 0, Math.PI * 2)
// // //     ctx.fill()

// // //     // Alert ! or ? above head
// // //     if (this.alertLevel > 0.6) {
// // //       const mark   = this.alertLevel > 0.85 ? '!' : '?'
// // //       const bounce = Math.sin(Date.now() / 150) * 3
// // //       ctx.font      = `bold ${Math.floor(s * 0.7)}px monospace`
// // //       ctx.textAlign = 'center'
// // //       ctx.fillStyle  = this.alertLevel > 0.85 ? '#ff3333' : '#ffcc00'
// // //       ctx.shadowBlur  = 8
// // //       ctx.shadowColor = ctx.fillStyle
// // //       ctx.fillText(mark, x, y - s * 1.55 + bounce)
// // //       ctx.shadowBlur = 0
// // //     }

// // //     ctx.save()
// // //     ctx.translate(x, y)
// // //     if (this._facingLeft) ctx.scale(-1, 1)

// // //     const legSwing = this._moving ? Math.sin(this._walkFrame) * 0.3 : 0
// // //     const bodyColor = this.state === BEHAVIOR.CHASE || this.state === BEHAVIOR.BLOCK
// // //       ? '#b71c1c'
// // //       : this.state === BEHAVIOR.SEARCH || this.state === BEHAVIOR.INVESTIGATE
// // //         ? '#e65100' : '#c62828'

// // //     // Left leg
// // //     ctx.save()
// // //     ctx.translate(-s * 0.16, s * 0.22)
// // //     ctx.rotate(-legSwing)
// // //     ctx.fillStyle = '#1a237e'
// // //     ctx.beginPath()
// // //     ctx.roundRect(-s*0.11, 0, s*0.2, s*0.42, s*0.07)
// // //     ctx.fill()
// // //     ctx.fillStyle = '#0d1117'
// // //     ctx.beginPath()
// // //     ctx.ellipse(0, s*0.43, s*0.13, s*0.08, 0, 0, Math.PI*2)
// // //     ctx.fill()
// // //     ctx.restore()

// // //     // Right leg
// // //     ctx.save()
// // //     ctx.translate(s * 0.16, s * 0.22)
// // //     ctx.rotate(legSwing)
// // //     ctx.fillStyle = '#1a237e'
// // //     ctx.beginPath()
// // //     ctx.roundRect(-s*0.11, 0, s*0.2, s*0.42, s*0.07)
// // //     ctx.fill()
// // //     ctx.fillStyle = '#0d1117'
// // //     ctx.beginPath()
// // //     ctx.ellipse(0, s*0.43, s*0.13, s*0.08, 0, 0, Math.PI*2)
// // //     ctx.fill()
// // //     ctx.restore()

// // //     // Body
// // //     ctx.fillStyle   = bodyColor
// // //     ctx.shadowBlur  = this.alertLevel > 0.5 ? 14 : 5
// // //     ctx.shadowColor = this.color
// // //     ctx.beginPath()
// // //     ctx.roundRect(-s*0.3, -s*0.15, s*0.6, s*0.44, s*0.12)
// // //     ctx.fill()
// // //     ctx.shadowBlur = 0

// // //     // Badge
// // //     ctx.fillStyle = '#ffd600'
// // //     ctx.beginPath()
// // //     ctx.arc(-s*0.1, s*0.04, s*0.09, 0, Math.PI*2)
// // //     ctx.fill()
// // //     ctx.fillStyle = '#0d1117'
// // //     ctx.font      = `bold ${Math.floor(s * 0.12)}px monospace`
// // //     ctx.textAlign = 'center'
// // //     ctx.fillText('★', -s*0.1, s*0.08)

// // //     // Left arm
// // //     const armSwing = this._moving ? Math.sin(this._walkFrame + Math.PI) * 0.35 : 0
// // //     ctx.save()
// // //     ctx.translate(-s*0.32, -s*0.08)
// // //     ctx.rotate(armSwing - 0.15)
// // //     ctx.fillStyle = bodyColor
// // //     ctx.beginPath()
// // //     ctx.roundRect(-s*0.09, 0, s*0.18, s*0.32, s*0.07)
// // //     ctx.fill()
// // //     ctx.restore()

// // //     // Right arm
// // //     ctx.save()
// // //     ctx.translate(s*0.32, -s*0.08)
// // //     ctx.rotate(-armSwing + 0.15)
// // //     ctx.fillStyle = bodyColor
// // //     ctx.beginPath()
// // //     ctx.roundRect(-s*0.09, 0, s*0.18, s*0.32, s*0.07)
// // //     ctx.fill()
// // //     ctx.restore()

// // //     // Head
// // //     ctx.fillStyle   = '#ffcc80'
// // //     ctx.shadowBlur  = 6
// // //     ctx.shadowColor = this.color
// // //     ctx.beginPath()
// // //     ctx.arc(0, -s*0.38, s*0.26, 0, Math.PI * 2)
// // //     ctx.fill()
// // //     ctx.shadowBlur = 0

// // //     // Police hat
// // //     ctx.fillStyle = bodyColor
// // //     ctx.beginPath()
// // //     ctx.roundRect(-s*0.28, -s*0.62, s*0.56, s*0.2, [s*0.06, s*0.06, 0, 0])
// // //     ctx.fill()
// // //     ctx.fillRect(-s*0.32, -s*0.44, s*0.64, s*0.08)
// // //     ctx.fillStyle = '#ffd600'
// // //     ctx.beginPath()
// // //     ctx.arc(0, -s*0.56, s*0.07, 0, Math.PI*2)
// // //     ctx.fill()

// // //     // Eyes
// // //     const isAlert = this.alertLevel > 0.5
// // //     ctx.fillStyle = isAlert ? '#b71c1c' : '#1a237e'
// // //     ctx.beginPath()
// // //     ctx.arc(-s*0.1, -s*0.4, s*0.06, 0, Math.PI*2)
// // //     ctx.fill()
// // //     ctx.beginPath()
// // //     ctx.arc(s*0.1, -s*0.4, s*0.06, 0, Math.PI*2)
// // //     ctx.fill()
// // //     ctx.fillStyle = 'white'
// // //     ctx.beginPath()
// // //     ctx.arc(-s*0.08, -s*0.42, s*0.022, 0, Math.PI*2)
// // //     ctx.fill()
// // //     ctx.beginPath()
// // //     ctx.arc(s*0.12, -s*0.42, s*0.022, 0, Math.PI*2)
// // //     ctx.fill()

// // //     // Mouth
// // //     ctx.strokeStyle = '#5d3a1a'
// // //     ctx.lineWidth   = s * 0.04
// // //     ctx.lineCap     = 'round'
// // //     ctx.beginPath()
// // //     if (isAlert) {
// // //       ctx.moveTo(-s*0.1, -s*0.28)
// // //       ctx.lineTo(s*0.1,  -s*0.28)
// // //     } else {
// // //       ctx.arc(0, -s*0.22, s*0.1, Math.PI + 0.3, -0.3)
// // //     }
// // //     ctx.stroke()

// // //     ctx.restore()

// // //     // Debug: A* path
// // //     if (debug && this.debugPath.length > 1) {
// // //       ctx.strokeStyle = COLORS.ASTAR_PATH
// // //       ctx.lineWidth   = 1.5
// // //       ctx.beginPath()
// // //       this.debugPath.forEach((p, i) => {
// // //         const px = p.x * T + T / 2, py = p.y * T + T / 2
// // //         i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
// // //       })
// // //       ctx.stroke()
// // //     }
// // //   }
// // // }
// // import { TILE_SIZE, GUARD_CFG, BEHAVIOR, COLORS } from '../game/constants.js'
// // import { AStar }            from '../ai/AStar.js'
// // import { BFS }              from '../ai/BFS.js'
// // import { DFS }              from '../ai/DFS.js'
// // import { BehaviorTree }     from '../ai/BehaviorTree.js'
// // import { VisibilitySystem } from './VisibilitySystem.js'
// // import { MultiAgentCoord }  from './MultiAgentCoord.js'

// // const T = TILE_SIZE

// // function rr(ctx, x, y, w, h, r) {
// //   r = Math.min(r, w / 2, h / 2)
// //   ctx.beginPath()
// //   ctx.moveTo(x + r, y)
// //   ctx.lineTo(x + w - r, y)
// //   ctx.arcTo(x + w, y,     x + w, y + r,     r)
// //   ctx.lineTo(x + w, y + h - r)
// //   ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
// //   ctx.lineTo(x + r, y + h)
// //   ctx.arcTo(x,     y + h, x,       y + h - r, r)
// //   ctx.lineTo(x,     y + r)
// //   ctx.arcTo(x,     y,     x + r,   y,         r)
// //   ctx.closePath()
// // }

// // export class Guard {
// //   constructor({ tileX, tileY, gene, id, geneIdx, grid, escapeTile, speedMult = 1, visionMult = 1 }) {
// //     this.tileX      = tileX
// //     this.tileY      = tileY
// //     this.pixelX     = tileX * T + T / 2
// //     this.pixelY     = tileY * T + T / 2

// //     this.gene       = gene
// //     this.id         = id
// //     this.geneIdx    = geneIdx
// //     this.grid       = grid
// //     this.escapeTile = escapeTile

// //     this.state           = BEHAVIOR.PATROL
// //     this.alertLevel      = 0
// //     this.lastKnownPlayer = null
// //     this._isHearing      = false
// //     this._interceptTarget = null

// //     this.path            = []
// //     this.pathIdx         = 1
// //     this.debugPath       = []
// //     this.framesSincePath = 0
// //     this._walkFrame      = 0
// //     this._moving         = false
// //     this._facingLeft     = false
// //     this._facingAngle    = 0

// //     this.bfsQueue  = []
// //     this.bfsStep   = 0
// //     this.dfsQueue  = []
// //     this.dfsStep   = 0

// //     this.wanderTarget = null
// //     this.wanderTimer  = 0

// //     // Smarter patrol — build waypoints near exit
// //     this.patrol    = this._buildSmartPatrol()
// //     this.patrolIdx = 0

// //     this.speed      = (GUARD_CFG.BASE_SPEED + gene.speedMult * 0.8) * T * speedMult
// //     this.visionPx   = (GUARD_CFG.BASE_VISION + gene.visionMult * 3) * T * visionMult
// //     this.hearRadius = (GUARD_CFG.HEAR_BASE   + gene.searchRadius * 4) * visionMult

// //     this.tree  = new BehaviorTree(gene)
// //     this.color = COLORS.GUARD_PATROL
// //   }

// //   update(dt, playerTile, playerVisible, heatmap, allGuards, ga, wantedSpeedMult = 1) {
// //     this.framesSincePath++
// //     this._isHearing = false
// //     this.alertLevel = Math.max(0, this.alertLevel - GUARD_CFG.ALERT_DECAY * dt * 60)

// //     if (playerVisible) {
// //       this.alertLevel      = 1
// //       this.lastKnownPlayer    = { ...playerTile }
// //       this._investigateTarget = null   // recalc spread on next investigate
// //       // Face toward last known position
// //       this._facingAngle = Math.atan2(
// //         playerTile.y * T - this.pixelY,
// //         playerTile.x * T - this.pixelX
// //       )
// //       ga.recordSpot(this.geneIdx)
// //       MultiAgentCoord.broadcastSighting(this, playerTile, allGuards)
// //     } else if (this.lastKnownPlayer) {
// //       // Gradually rotate vision toward last known position
// //       const targetAngle = Math.atan2(
// //         this.lastKnownPlayer.y * T - this.pixelY,
// //         this.lastKnownPlayer.x * T - this.pixelX
// //       )
// //       const diff = targetAngle - this._facingAngle
// //       const wrapped = ((diff + Math.PI) % (Math.PI * 2)) - Math.PI
// //       this._facingAngle += wrapped * dt * 1.5
// //     }

// //     this.state = this.tree.tick({
// //       guardTile:          { x: this.tileX, y: this.tileY },
// //       playerTile:         playerVisible ? playerTile : null,
// //       escapeTile:         this.escapeTile,
// //       lastKnown:          this.lastKnownPlayer,
// //       playerVisible,
// //       alertLevel:         this.alertLevel,
// //       chaseMemorySeconds: GUARD_CFG.CHASE_MEMORY,
// //     })

// //     if (this.alertLevel > 0.8)
// //       MultiAgentCoord.assignBlocker(allGuards, this.escapeTile)

// //     const target = this._resolveTarget(heatmap)

// //     const recalcInterval = Math.max(12, GUARD_CFG.PATH_RECALC - Math.floor(this.gene.predictionAcc * 20))
// //     if (target && (this.framesSincePath > recalcInterval || this.path.length === 0)) {
// //       this.path        = AStar.findPath(this.grid, this.tileX, this.tileY, target.x, target.y)
// //       this.pathIdx     = 1
// //       this.debugPath   = this.path
// //       this.framesSincePath = 0
// //     }

// //     this._followPath(dt, wantedSpeedMult)
// //     this._updateColor()
// //   }

// //   setHearing(heard) { this._isHearing = heard }

// //   _resolveTarget(heatmap) {
// //     switch (this.state) {
// //       case BEHAVIOR.CHASE: {
// //         // Use intercept target if assigned, otherwise direct chase
// //         if (this._interceptTarget) {
// //           const d = this._distTo(this._interceptTarget)
// //           if (d < 3) this._interceptTarget = null
// //           else return this._interceptTarget
// //         }
// //         // Each guard approaches from a unique angle — no stacking on same tile
// //         if (this.lastKnownPlayer) {
// //           const angle  = ((this.id ?? 0) / 8) * Math.PI * 2
// //           const spread = 3
// //           const ox     = Math.round(Math.cos(angle) * spread)
// //           const oy     = Math.round(Math.sin(angle) * spread)
// //           const tx     = this.lastKnownPlayer.x + ox
// //           const ty     = this.lastKnownPlayer.y + oy
// //           if (tx >= 0 && ty >= 0 && tx < this.grid.cols && ty < this.grid.rows && this.grid.isWalkable(tx, ty))
// //             return { x: tx, y: ty }
// //         }
// //         return this.lastKnownPlayer
// //       }

// //       case BEHAVIOR.BLOCK: return this.escapeTile

// //       case BEHAVIOR.INVESTIGATE: {
// //         if (!this.lastKnownPlayer) return null
// //         // Each guard investigates a different offset around last known position
// //         if (!this._investigateTarget) {
// //           const angle = ((this.id ?? 0) / 8) * Math.PI * 2
// //           const r     = 3 + ((this.id ?? 0) % 3)
// //           const ox    = Math.round(Math.cos(angle) * r)
// //           const oy    = Math.round(Math.sin(angle) * r)
// //           const tx    = this.lastKnownPlayer.x + ox
// //           const ty    = this.lastKnownPlayer.y + oy
// //           this._investigateTarget = (
// //             tx >= 0 && ty >= 0 && tx < this.grid.cols && ty < this.grid.rows && this.grid.isWalkable(tx, ty)
// //           ) ? { x: tx, y: ty } : { ...this.lastKnownPlayer }
// //         }
// //         if (this._distTo(this._investigateTarget) < 2) {
// //           this._investigateTarget = null
// //           if (this.gene.aggression > 0.5) {
// //             this.dfsQueue = DFS.sweep(this.grid, this.tileX, this.tileY, 60)
// //             this.dfsStep  = 0
// //           } else {
// //             this.bfsQueue = BFS.sweep(this.grid, this.tileX, this.tileY, 80)
// //             this.bfsStep  = 0
// //           }
// //           this.state = BEHAVIOR.SEARCH
// //         }
// //         return this._investigateTarget || this.lastKnownPlayer
// //       }

// //       case BEHAVIOR.SEARCH: {
// //         const queue = this.gene.aggression > 0.5 ? this.dfsQueue : this.bfsQueue
// //         const step  = this.gene.aggression > 0.5 ? this.dfsStep  : this.bfsStep
// //         if (step < queue.length) {
// //           const t = queue[step]
// //           if (this._distTo(t) < 2) {
// //             if (this.gene.aggression > 0.5) this.dfsStep++
// //             else this.bfsStep++
// //           }
// //           return t
// //         }
// //         const hot = heatmap.hottest()
// //         if (hot.v > 0.1) return hot
// //         this.state = BEHAVIOR.PATROL
// //         return null
// //       }

// //       case BEHAVIOR.PATROL: {
// //         const wp = this.patrol[this.patrolIdx % this.patrol.length]
// //         if (this._distTo(wp) < 2) {
// //           this.patrolIdx++
// //         } else if (this.framesSincePath > 120) {
// //           // Stuck for too long — skip this waypoint and pick a fresh random one
// //           this.patrolIdx++
// //           this.patrol[this.patrolIdx % this.patrol.length] = this._pickRandomWaypoint()
// //           this.framesSincePath = 0
// //         }
// //         return wp
// //       }

// //       default: return null
// //     }
// //   }

// //   _followPath(dt, speedMult = 1) {
// //     if (this.path.length < 2 || this.pathIdx >= this.path.length) {
// //       this._moving = false
// //       this.framesSincePath = 999
// //       return
// //     }

// //     const next = this.path[this.pathIdx]

// //     // Validate next tile — repath if unwalkable
// //     if (!this.grid.isWalkable(next.x, next.y)) {
// //       this._snapToTile()
// //       this.path = []
// //       this.framesSincePath = 999
// //       this._moving = false
// //       return
// //     }

// //     const tpx  = next.x * T + T / 2
// //     const tpy  = next.y * T + T / 2
// //     const dx   = tpx - this.pixelX
// //     const dy   = tpy - this.pixelY
// //     const dist = Math.hypot(dx, dy)
// //     const spd  = this.speed * speedMult * dt

// //     if (dist < spd + 1) {
// //       // Snap exactly to tile center — prevents pixel drift causing wall clips
// //       this.pixelX = tpx
// //       this.pixelY = tpy
// //       this.tileX  = next.x
// //       this.tileY  = next.y
// //       this.pathIdx++
// //       this._stuckFrames = 0
// //     } else {
// //       const ndx = dx / dist
// //       const ndy = dy / dist

// //       // Try full movement
// //       const nx  = this.pixelX + ndx * spd
// //       const ny  = this.pixelY + ndy * spd
// //       if (this.grid.isWalkable(Math.floor(nx / T), Math.floor(ny / T))) {
// //         this.pixelX = nx
// //         this.pixelY = ny
// //         this._stuckFrames = 0
// //       } else {
// //         // Try X-axis slide only
// //         const sx = this.pixelX + ndx * spd
// //         if (this.grid.isWalkable(Math.floor(sx / T), Math.floor(this.pixelY / T))) {
// //           this.pixelX = sx
// //           this._stuckFrames = 0
// //         }
// //         // Try Y-axis slide only
// //         else {
// //           const sy = this.pixelY + ndy * spd
// //           if (this.grid.isWalkable(Math.floor(this.pixelX / T), Math.floor(sy / T))) {
// //             this.pixelY = sy
// //             this._stuckFrames = 0
// //           } else {
// //             // Truly stuck — count frames then snap + repath
// //             this._stuckFrames = (this._stuckFrames || 0) + 1
// //             if (this._stuckFrames > 8) {
// //               this._snapToTile()   // snap to nearest walkable tile center
// //               this.path = []
// //               this.framesSincePath = 999
// //               this._stuckFrames = 0
// //             }
// //           }
// //         }
// //       }
// //     }

// //     // Always derive tile from pixel
// //     this.tileX = Math.floor(this.pixelX / T)
// //     this.tileY = Math.floor(this.pixelY / T)

// //     this._moving     = dist > 1
// //     this._facingLeft = dx < 0
// //     if (this._moving) {
// //       this._facingAngle = Math.atan2(dy, dx)
// //       this._stuckFrames = 0
// //     } else if (this.state === 'patrol' || this.state === 'search') {
// //       this._facingAngle += dt * 0.8
// //     }
// //     this._walkFrame += spd * 0.25
// //   }

// //   canSeePlayer(playerPixelX, playerPixelY) {
// //     return VisibilitySystem.hasLineOfSight(
// //       this.grid,
// //       this.pixelX, this.pixelY,
// //       playerPixelX, playerPixelY,
// //       this.visionPx
// //     )
// //   }

// //   hearPlayer(playerTile, playerNoise) {
// //     const d = Math.hypot(this.tileX - playerTile.x, this.tileY - playerTile.y)
// //     return d < this.hearRadius * playerNoise
// //   }

// //   // Smart patrol — mostly near exit, some random
// //   _buildSmartPatrol() {
// //     const pts = []

// //     // Each guard gets a unique offset into the exit-area sweep so they
// //     // don't all converge on the same waypoints
// //     const offset = (this.id ?? 0) % 6
// //     const exitArea = BFS.sweep(this.grid, this.escapeTile.x, this.escapeTile.y, 35)
// //     // Take every 6th tile but start at a different offset per guard
// //     for (let i = offset + 2; i < exitArea.length; i += 6) pts.push(exitArea[i])

// //     // Each guard also patrols from their OWN spawn outward (not all from exit)
// //     const ownArea = BFS.sweep(this.grid, this.tileX, this.tileY, 30)
// //     const ownOffset = (this.id ?? 0) % 8
// //     for (let i = ownOffset + 3; i < ownArea.length; i += 8) pts.push(ownArea[i])

// //     // Shuffle the waypoints so guards don't march in lockstep
// //     for (let i = pts.length - 1; i > 0; i--) {
// //       const j = Math.floor(Math.random() * (i + 1));
// //       [pts[i], pts[j]] = [pts[j], pts[i]]
// //     }

// //     return pts.length > 0 ? pts : [this._pickRandomWaypoint()]
// //   }

// //   _pickRandomWaypoint() {
// //     const COLS = this.grid.cols
// //     const ROWS = this.grid.rows
// //     for (let i = 0; i < 20; i++) {
// //       const rx = Math.floor(Math.random() * COLS)
// //       const ry = Math.floor(Math.random() * ROWS)
// //       if (!this.grid.isWalkable(rx, ry)) continue
// //       const d = this._distTo({ x: rx, y: ry })
// //       if (d > 4 && d < 20) return { x: rx, y: ry }
// //     }
// //     for (let i = 0; i < 50; i++) {
// //       const rx = Math.floor(Math.random() * COLS)
// //       const ry = Math.floor(Math.random() * ROWS)
// //       if (this.grid.isWalkable(rx, ry)) return { x: rx, y: ry }
// //     }
// //     return { x: this.tileX, y: this.tileY }
// //   }

// //   _buildPatrol() { return this._buildSmartPatrol() }

// //   // Snap guard to nearest walkable tile center — escapes wall traps
// //   _snapToTile() {
// //     const cx = Math.round(this.pixelX / T)
// //     const cy = Math.round(this.pixelY / T)
// //     // Search outward in a spiral for nearest walkable tile
// //     for (let r = 0; r <= 3; r++) {
// //       for (let ox = -r; ox <= r; ox++) {
// //         for (let oy = -r; oy <= r; oy++) {
// //           if (Math.abs(ox) !== r && Math.abs(oy) !== r) continue // only check ring
// //           const tx = cx + ox
// //           const ty = cy + oy
// //           if (tx < 0 || ty < 0 || tx >= this.grid.cols || ty >= this.grid.rows) continue
// //           if (this.grid.isWalkable(tx, ty)) {
// //             this.tileX  = tx
// //             this.tileY  = ty
// //             this.pixelX = tx * T + T / 2
// //             this.pixelY = ty * T + T / 2
// //             return
// //           }
// //         }
// //       }
// //     }
// //   }
// //   _distTo(tile)  { return Math.abs(this.tileX - tile.x) + Math.abs(this.tileY - tile.y) }

// //   _updateColor() {
// //     if (this.state === BEHAVIOR.CHASE || this.state === BEHAVIOR.BLOCK)
// //       this.color = COLORS.GUARD_ALERT
// //     else if (this.state === BEHAVIOR.SEARCH || this.state === BEHAVIOR.INVESTIGATE)
// //       this.color = COLORS.GUARD_SEARCH
// //     else
// //       this.color = COLORS.GUARD_PATROL
// //   }

// //   // draw(ctx, debug) {
// //   //   const x = this.pixelX
// //   //   const y = this.pixelY
// //   //   const s = T * 0.88

// //   //   // Hearing highlight
// //   //   if (this._isHearing) {
// //   //     const pulse = 0.6 + 0.4 * Math.sin(Date.now() / 80)
// //   //     ctx.save()
// //   //     ctx.strokeStyle = `rgba(255,230,0,${pulse})`
// //   //     ctx.lineWidth   = 3
// //   //     ctx.shadowBlur  = 18
// //   //     ctx.shadowColor = '#ffdd00'
// //   //     ctx.beginPath()
// //   //     ctx.arc(x, y, s * 1.05, 0, Math.PI * 2)
// //   //     ctx.stroke()
// //   //     ctx.fillStyle = 'rgba(255,220,0,0.08)'
// //   //     ctx.beginPath()
// //   //     ctx.arc(x, y, s * 1.05, 0, Math.PI * 2)
// //   //     ctx.fill()
// //   //     ctx.restore()

// //   //     ctx.save()
// //   //     ctx.font      = `${Math.floor(s * 0.65)}px serif`
// //   //     ctx.textAlign = 'center'
// //   //     const bounce  = Math.sin(Date.now() / 120) * 2
// //   //     ctx.fillStyle   = '#ffdd00'
// //   //     ctx.shadowBlur  = 10
// //   //     ctx.shadowColor = '#ffaa00'
// //   //     ctx.fillText('👂', x, y - s * 1.55 + bounce)
// //   //     ctx.shadowBlur = 0
// //   //     ctx.restore()
// //   //   }

// //   //   // Alert ! or ?
// //   //   if (this.alertLevel > 0.6 && !this._isHearing) {
// //   //     const mark   = this.alertLevel > 0.85 ? '!' : '?'
// //   //     const bounce = Math.sin(Date.now() / 150) * 3
// //   //     ctx.font      = `bold ${Math.floor(s * 0.7)}px monospace`
// //   //     ctx.textAlign = 'center'
// //   //     ctx.fillStyle  = this.alertLevel > 0.85 ? '#ff3333' : '#ffcc00'
// //   //     ctx.shadowBlur  = 8
// //   //     ctx.shadowColor = ctx.fillStyle
// //   //     ctx.fillText(mark, x, y - s * 1.55 + bounce)
// //   //     ctx.shadowBlur = 0
// //   //   }

// //   //   ctx.save()
// //   //   ctx.translate(x, y)
// //   //   if (this._facingLeft) ctx.scale(-1, 1)

// //   //   const legSwing  = this._moving ? Math.sin(this._walkFrame) * 0.3 : 0
// //   //   const bodyColor = this.state === BEHAVIOR.CHASE || this.state === BEHAVIOR.BLOCK
// //   //     ? '#b71c1c'
// //   //     : this.state === BEHAVIOR.SEARCH || this.state === BEHAVIOR.INVESTIGATE
// //   //       ? '#e65100' : '#c62828'

// //   //   // Legs
// //   //   ctx.save()
// //   //   ctx.translate(-s*0.16, s*0.22)
// //   //   ctx.rotate(-legSwing)
// //   //   ctx.fillStyle = '#1a237e'
// //   //   rr(ctx, -s*0.11, 0, s*0.2, s*0.42, s*0.07); ctx.fill()
// //   //   ctx.fillStyle = '#0d1117'
// //   //   ctx.beginPath(); ctx.ellipse(0, s*0.43, s*0.13, s*0.08, 0, 0, Math.PI*2); ctx.fill()
// //   //   ctx.restore()

// //   //   ctx.save()
// //   //   ctx.translate(s*0.16, s*0.22)
// //   //   ctx.rotate(legSwing)
// //   //   ctx.fillStyle = '#1a237e'
// //   //   rr(ctx, -s*0.11, 0, s*0.2, s*0.42, s*0.07); ctx.fill()
// //   //   ctx.fillStyle = '#0d1117'
// //   //   ctx.beginPath(); ctx.ellipse(0, s*0.43, s*0.13, s*0.08, 0, 0, Math.PI*2); ctx.fill()
// //   //   ctx.restore()

// //   //   // Body
// //   //   ctx.fillStyle   = bodyColor
// //   //   ctx.shadowBlur  = this._isHearing ? 20 : this.alertLevel > 0.5 ? 14 : 5
// //   //   ctx.shadowColor = this._isHearing ? '#ffdd00' : this.color
// //   //   rr(ctx, -s*0.3, -s*0.15, s*0.6, s*0.44, s*0.12); ctx.fill()
// //   //   ctx.shadowBlur = 0

// //   //   // Badge
// //   //   ctx.fillStyle = '#ffd600'
// //   //   ctx.beginPath(); ctx.arc(-s*0.1, s*0.04, s*0.09, 0, Math.PI*2); ctx.fill()
// //   //   ctx.fillStyle = '#0d1117'
// //   //   ctx.font = `bold ${Math.floor(s*0.12)}px monospace`
// //   //   ctx.textAlign = 'center'
// //   //   ctx.fillText('★', -s*0.1, s*0.08)

// //   //   // Arms
// //   //   const armSwing = this._moving ? Math.sin(this._walkFrame + Math.PI) * 0.35 : 0
// //   //   ctx.save()
// //   //   ctx.translate(-s*0.32, -s*0.08); ctx.rotate(armSwing - 0.15)
// //   //   ctx.fillStyle = bodyColor
// //   //   rr(ctx, -s*0.09, 0, s*0.18, s*0.32, s*0.07); ctx.fill()
// //   //   ctx.restore()

// //   //   ctx.save()
// //   //   ctx.translate(s*0.32, -s*0.08); ctx.rotate(-armSwing + 0.15)
// //   //   ctx.fillStyle = bodyColor
// //   //   rr(ctx, -s*0.09, 0, s*0.18, s*0.32, s*0.07); ctx.fill()
// //   //   ctx.restore()

// //   //   // Head
// //   //   ctx.fillStyle   = '#ffcc80'
// //   //   ctx.shadowBlur  = 6
// //   //   ctx.shadowColor = this._isHearing ? '#ffdd00' : this.color
// //   //   ctx.beginPath(); ctx.arc(0, -s*0.38, s*0.26, 0, Math.PI*2); ctx.fill()
// //   //   ctx.shadowBlur = 0

// //   //   // Hat
// //   //   ctx.fillStyle = bodyColor
// //   //   rr(ctx, -s*0.28, -s*0.62, s*0.56, s*0.2, s*0.06); ctx.fill()
// //   //   ctx.fillRect(-s*0.32, -s*0.44, s*0.64, s*0.08)
// //   //   ctx.fillStyle = '#ffd600'
// //   //   ctx.beginPath(); ctx.arc(0, -s*0.56, s*0.07, 0, Math.PI*2); ctx.fill()

// //   //   // Eyes
// //   //   const isAlert = this.alertLevel > 0.5
// //   //   ctx.fillStyle = this._isHearing ? '#ff9800' : isAlert ? '#b71c1c' : '#1a237e'
// //   //   ctx.beginPath(); ctx.arc(-s*0.1, -s*0.4, s*0.06, 0, Math.PI*2); ctx.fill()
// //   //   ctx.beginPath(); ctx.arc(s*0.1, -s*0.4, s*0.06, 0, Math.PI*2); ctx.fill()
// //   //   ctx.fillStyle = 'white'
// //   //   ctx.beginPath(); ctx.arc(-s*0.08, -s*0.42, s*0.022, 0, Math.PI*2); ctx.fill()
// //   //   ctx.beginPath(); ctx.arc(s*0.12, -s*0.42, s*0.022, 0, Math.PI*2); ctx.fill()

// //   //   // Mouth
// //   //   ctx.strokeStyle = '#5d3a1a'
// //   //   ctx.lineWidth   = s * 0.04
// //   //   ctx.lineCap     = 'round'
// //   //   ctx.beginPath()
// //   //   if (isAlert || this._isHearing) {
// //   //     ctx.moveTo(-s*0.1, -s*0.28); ctx.lineTo(s*0.1, -s*0.28)
// //   //   } else {
// //   //     ctx.arc(0, -s*0.22, s*0.1, Math.PI + 0.3, -0.3)
// //   //   }
// //   //   ctx.stroke()
// //   //   ctx.restore()

// //   //   if (debug && this.debugPath.length > 1) {
// //   //     ctx.strokeStyle = COLORS.ASTAR_PATH
// //   //     ctx.lineWidth   = 1.5
// //   //     ctx.beginPath()
// //   //     this.debugPath.forEach((p, i) => {
// //   //       const px = p.x*T+T/2, py = p.y*T+T/2
// //   //       i === 0 ? ctx.moveTo(px,py) : ctx.lineTo(px,py)
// //   //     })
// //   //     ctx.stroke()
// //   //   }
// //   // }
// //   draw(ctx, debug) {
// //     const x = this.pixelX
// //     const y = this.pixelY
// //     const s = T * 0.88

// //     // Alert ! or ? above head — only when alert, no hearing ring
// //     if (this.alertLevel > 0.6) {
// //       const mark   = this.alertLevel > 0.85 ? '!' : '?'
// //       const bounce = Math.sin(Date.now() / 150) * 3
// //       ctx.font      = `bold ${Math.floor(s * 0.7)}px monospace`
// //       ctx.textAlign = 'center'
// //       ctx.fillStyle  = this.alertLevel > 0.85 ? '#ff3333' : '#ffcc00'
// //       ctx.shadowBlur  = 8
// //       ctx.shadowColor = ctx.fillStyle
// //       ctx.fillText(mark, x, y - s * 1.55 + bounce)
// //       ctx.shadowBlur = 0
// //     }

// //     ctx.save()
// //     ctx.translate(x, y)
// //     if (this._facingLeft) ctx.scale(-1, 1)

// //     const legSwing  = this._moving ? Math.sin(this._walkFrame) * 0.3 : 0
// //     const bodyColor = this.state === BEHAVIOR.CHASE || this.state === BEHAVIOR.BLOCK
// //       ? '#b71c1c'
// //       : this.state === BEHAVIOR.SEARCH || this.state === BEHAVIOR.INVESTIGATE
// //         ? '#e65100' : '#c62828'

// //     // Left leg
// //     ctx.save()
// //     ctx.translate(-s*0.16, s*0.22)
// //     ctx.rotate(-legSwing)
// //     ctx.fillStyle = '#1a237e'
// //     rr(ctx, -s*0.11, 0, s*0.2, s*0.42, s*0.07); ctx.fill()
// //     ctx.fillStyle = '#0d1117'
// //     ctx.beginPath(); ctx.ellipse(0, s*0.43, s*0.13, s*0.08, 0, 0, Math.PI*2); ctx.fill()
// //     ctx.restore()

// //     // Right leg
// //     ctx.save()
// //     ctx.translate(s*0.16, s*0.22)
// //     ctx.rotate(legSwing)
// //     ctx.fillStyle = '#1a237e'
// //     rr(ctx, -s*0.11, 0, s*0.2, s*0.42, s*0.07); ctx.fill()
// //     ctx.fillStyle = '#0d1117'
// //     ctx.beginPath(); ctx.ellipse(0, s*0.43, s*0.13, s*0.08, 0, 0, Math.PI*2); ctx.fill()
// //     ctx.restore()

// //     // Body
// //     ctx.fillStyle   = bodyColor
// //     ctx.shadowBlur  = this.alertLevel > 0.5 ? 10 : 4
// //     ctx.shadowColor = this.color
// //     rr(ctx, -s*0.3, -s*0.15, s*0.6, s*0.44, s*0.12); ctx.fill()
// //     ctx.shadowBlur = 0

// //     // Badge
// //     ctx.fillStyle = '#ffd600'
// //     ctx.beginPath(); ctx.arc(-s*0.1, s*0.04, s*0.09, 0, Math.PI*2); ctx.fill()
// //     ctx.fillStyle = '#0d1117'
// //     ctx.font = `bold ${Math.floor(s*0.12)}px monospace`
// //     ctx.textAlign = 'center'
// //     ctx.fillText('★', -s*0.1, s*0.08)

// //     // Arms
// //     const armSwing = this._moving ? Math.sin(this._walkFrame + Math.PI) * 0.35 : 0
// //     ctx.save()
// //     ctx.translate(-s*0.32, -s*0.08); ctx.rotate(armSwing - 0.15)
// //     ctx.fillStyle = bodyColor
// //     rr(ctx, -s*0.09, 0, s*0.18, s*0.32, s*0.07); ctx.fill()
// //     ctx.restore()

// //     ctx.save()
// //     ctx.translate(s*0.32, -s*0.08); ctx.rotate(-armSwing + 0.15)
// //     ctx.fillStyle = bodyColor
// //     rr(ctx, -s*0.09, 0, s*0.18, s*0.32, s*0.07); ctx.fill()
// //     ctx.restore()

// //     // Head
// //     ctx.fillStyle   = '#ffcc80'
// //     ctx.shadowBlur  = 4
// //     ctx.shadowColor = this.color
// //     ctx.beginPath(); ctx.arc(0, -s*0.38, s*0.26, 0, Math.PI*2); ctx.fill()
// //     ctx.shadowBlur = 0

// //     // Hat
// //     ctx.fillStyle = bodyColor
// //     rr(ctx, -s*0.28, -s*0.62, s*0.56, s*0.2, s*0.06); ctx.fill()
// //     ctx.fillRect(-s*0.32, -s*0.44, s*0.64, s*0.08)
// //     ctx.fillStyle = '#ffd600'
// //     ctx.beginPath(); ctx.arc(0, -s*0.56, s*0.07, 0, Math.PI*2); ctx.fill()

// //     // Eyes
// //     const isAlert = this.alertLevel > 0.5
// //     ctx.fillStyle = isAlert ? '#b71c1c' : '#1a237e'
// //     ctx.beginPath(); ctx.arc(-s*0.1, -s*0.4, s*0.06, 0, Math.PI*2); ctx.fill()
// //     ctx.beginPath(); ctx.arc(s*0.1, -s*0.4, s*0.06, 0, Math.PI*2); ctx.fill()
// //     ctx.fillStyle = 'white'
// //     ctx.beginPath(); ctx.arc(-s*0.08, -s*0.42, s*0.022, 0, Math.PI*2); ctx.fill()
// //     ctx.beginPath(); ctx.arc(s*0.12, -s*0.42, s*0.022, 0, Math.PI*2); ctx.fill()

// //     // Mouth
// //     ctx.strokeStyle = '#5d3a1a'
// //     ctx.lineWidth   = s * 0.04
// //     ctx.lineCap     = 'round'
// //     ctx.beginPath()
// //     if (isAlert) {
// //       ctx.moveTo(-s*0.1, -s*0.28); ctx.lineTo(s*0.1, -s*0.28)
// //     } else {
// //       ctx.arc(0, -s*0.22, s*0.1, Math.PI + 0.3, -0.3)
// //     }
// //     ctx.stroke()
// //     ctx.restore()

// //     // Debug A* path
// //     if (debug && this.debugPath.length > 1) {
// //       ctx.strokeStyle = COLORS.ASTAR_PATH
// //       ctx.lineWidth   = 1.5
// //       ctx.beginPath()
// //       this.debugPath.forEach((p, i) => {
// //         const px = p.x*T+T/2, py = p.y*T+T/2
// //         i === 0 ? ctx.moveTo(px,py) : ctx.lineTo(px,py)
// //       })
// //       ctx.stroke()
// //     }
// //   }
// // }

// // import { TILE_SIZE, TILE, GUARD_CFG, BEHAVIOR, COLORS } from '../game/constants.js'
// // import { AStar }            from '../ai/AStar.js'
// // import { BFS }              from '../ai/BFS.js'
// // import { DFS }              from '../ai/DFS.js'
// // import { BehaviorTree }     from '../ai/BehaviorTree.js'
// // import { VisibilitySystem } from './VisibilitySystem.js'
// // import { MultiAgentCoord }  from './MultiAgentCoord.js'

// // const T = TILE_SIZE

// // export class Guard {
// //   constructor({ tileX, tileY, gene, id, geneIdx, grid, escapeTile, speedMult = 1, visionMult = 1 }) {
// //     this.tileX      = tileX
// //     this.tileY      = tileY
// //     this.pixelX     = tileX * T + T / 2
// //     this.pixelY     = tileY * T + T / 2

// //     this.gene       = gene
// //     this.id         = id
// //     this.geneIdx    = geneIdx
// //     this.grid       = grid
// //     this.escapeTile = escapeTile

// //     this.state           = BEHAVIOR.PATROL
// //     this.alertLevel      = 0
// //     this.lastKnownPlayer = null

// //     this.path            = []
// //     this.pathIdx         = 1
// //     this.debugPath       = []
// //     this.framesSincePath = 0
// //     this._walkFrame      = 0
// //     this._moving         = false
// //     this._facingLeft     = false

// //     this.bfsQueue  = []
// //     this.bfsStep   = 0
// //     this.dfsQueue  = []
// //     this.dfsStep   = 0

// //     this.wanderTarget = null
// //     this.wanderTimer  = 0

// //     this.patrol    = this._buildPatrol()
// //     this.patrolIdx = 0

// //     this.speed      = (GUARD_CFG.BASE_SPEED + gene.speedMult * 0.8) * T
// //     this.visionPx   = (GUARD_CFG.BASE_VISION + gene.visionMult * 3) * T
// //     this.hearRadius = (GUARD_CFG.HEAR_BASE   + gene.searchRadius * 4)

// //     this.tree  = new BehaviorTree(gene)
// //     this.color = COLORS.GUARD_PATROL
// //   }

// //   // ── Main update ─────────────────────────────────────────────

// //   update(dt, playerTile, playerVisible, heatmap, allGuards, ga) {
// //     this.framesSincePath++
// //     this.alertLevel = Math.max(0, this.alertLevel - GUARD_CFG.ALERT_DECAY * dt * 60)

// //     if (playerVisible) {
// //       this.alertLevel      = 1
// //       this.lastKnownPlayer = { ...playerTile }
// //       ga.recordSpot(this.geneIdx)
// //       MultiAgentCoord.broadcastSighting(this, playerTile, allGuards)
// //     }

// //     this.state = this.tree.tick({
// //       guardTile:     { x: this.tileX, y: this.tileY },
// //       playerTile:    playerVisible ? playerTile : null,
// //       escapeTile:    this.escapeTile,
// //       lastKnown:     this.lastKnownPlayer,
// //       playerVisible,
// //       alertLevel:    this.alertLevel,
// //     })

// //     if (this.alertLevel > 0.8)
// //       MultiAgentCoord.assignBlocker(allGuards, this.escapeTile)

// //     const target = this._resolveTarget(heatmap)

// //     const recalcInterval = Math.max(15, GUARD_CFG.PATH_RECALC - Math.floor(this.gene.predictionAcc * 20))
// //     if (target && (this.framesSincePath > recalcInterval || this.path.length === 0)) {
// //       this.path  = AStar.findPath(this.grid, this.tileX, this.tileY, target.x, target.y)
// //       this.pathIdx = 1
// //       this.debugPath = this.path
// //       this.framesSincePath = 0
// //     }

// //     this._followPath(dt)
// //     this._updateColor()
// //   }

// //   // ── Resolve movement target ──────────────────────────────────

// //   _resolveTarget(heatmap) {
// //     switch (this.state) {
// //       case BEHAVIOR.CHASE:
// //         return this.lastKnownPlayer

// //       case BEHAVIOR.BLOCK:
// //         return this.escapeTile

// //       case BEHAVIOR.INVESTIGATE:
// //         if (!this.lastKnownPlayer) return null
// //         if (this._distTo(this.lastKnownPlayer) < 2) {
// //           if (this.gene.aggression > 0.5) {
// //             this.dfsQueue = DFS.sweep(this.grid, this.tileX, this.tileY, 60)
// //             this.dfsStep  = 0
// //           } else {
// //             this.bfsQueue = BFS.sweep(this.grid, this.tileX, this.tileY, 80)
// //             this.bfsStep  = 0
// //           }
// //           this.state = BEHAVIOR.SEARCH
// //         }
// //         return this.lastKnownPlayer

// //       case BEHAVIOR.SEARCH: {
// //         const queue = this.gene.aggression > 0.5 ? this.dfsQueue : this.bfsQueue
// //         const step  = this.gene.aggression > 0.5 ? this.dfsStep  : this.bfsStep
// //         if (step < queue.length) {
// //           const t = queue[step]
// //           if (this._distTo(t) < 2) {
// //             if (this.gene.aggression > 0.5) this.dfsStep++
// //             else this.bfsStep++
// //           }
// //           return t
// //         }
// //         const hot = heatmap.hottest()
// //         if (hot.v > 0.1) return hot
// //         this.state = BEHAVIOR.PATROL
// //         return null
// //       }

// //       case BEHAVIOR.PATROL: {
// //         const arrived  = this.wanderTarget && this._distTo(this.wanderTarget) < 2
// //         const timedOut = this.wanderTimer <= 0
// //         if (!this.wanderTarget || arrived || timedOut) {
// //           this.wanderTarget = this._pickRandomWaypoint()
// //           this.wanderTimer  = 180 + Math.random() * 240
// //         }
// //         this.wanderTimer--
// //         return this.wanderTarget
// //       }

// //       default: return null
// //     }
// //   }

// //   // ── Follow A* path ───────────────────────────────────────────

// //   _followPath(dt) {
// //     if (this.path.length < 2 || this.pathIdx >= this.path.length) {
// //       this._moving = false
// //       return
// //     }

// //     const next = this.path[this.pathIdx]
// //     const tpx  = next.x * T + T / 2
// //     const tpy  = next.y * T + T / 2
// //     const dx   = tpx - this.pixelX
// //     const dy   = tpy - this.pixelY
// //     const dist = Math.hypot(dx, dy)
// //     const spd  = this.speed * dt

// //     if (dist < spd + 1) {
// //       this.pixelX = tpx; this.pixelY = tpy
// //       this.tileX  = next.x; this.tileY = next.y
// //       this.pathIdx++
// //     } else {
// //       this.pixelX += (dx / dist) * spd
// //       this.pixelY += (dy / dist) * spd
// //     }
    
// //     this._moving      = dist > 1
// //     this._facingLeft  = dx < 0
// //     this._walkFrame  += spd * 0.25
// //     if (dist > 1) this._facingAngle = Math.atan2(dy, dx)
// //   }

// //   // ── Visibility & hearing ─────────────────────────────────────

// //   canSeePlayer(playerPixelX, playerPixelY) {
// //     return VisibilitySystem.hasLineOfSight(
// //       this.grid,
// //       this.pixelX, this.pixelY,
// //       playerPixelX, playerPixelY,
// //       this.visionPx
// //     )
// //   }

// //   hearPlayer(playerTile, playerNoise) {
// //     const d = Math.hypot(this.tileX - playerTile.x, this.tileY - playerTile.y)
// //     return d < this.hearRadius * playerNoise
// //   }

// //   // ── Patrol / wander helpers ───────────────────────────────────

// //   _pickRandomWaypoint() {
// //     const COLS = this.grid.cols
// //     const ROWS = this.grid.rows
// //     for (let i = 0; i < 20; i++) {
// //       const rx = Math.floor(Math.random() * COLS)
// //       const ry = Math.floor(Math.random() * ROWS)
// //       if (!this.grid.isWalkable(rx, ry)) continue
// //       const d = this._distTo({ x: rx, y: ry })
// //       if (d > 4 && d < 20) return { x: rx, y: ry }
// //     }
// //     for (let i = 0; i < 50; i++) {
// //       const rx = Math.floor(Math.random() * COLS)
// //       const ry = Math.floor(Math.random() * ROWS)
// //       if (this.grid.isWalkable(rx, ry)) return { x: rx, y: ry }
// //     }
// //     return { x: this.tileX, y: this.tileY }
// //   }

// //   _buildPatrol() {
// //     const order = BFS.sweep(this.grid, this.tileX, this.tileY, 40)
// //     const pts   = [{ x: this.tileX, y: this.tileY }]
// //     for (let i = 5; i < order.length; i += 8) pts.push(order[i])
// //     return pts
// //   }

// //   _distTo(tile) {
// //     return Math.abs(this.tileX - tile.x) + Math.abs(this.tileY - tile.y)
// //   }

// //   _updateColor() {
// //     if (this.state === BEHAVIOR.CHASE || this.state === BEHAVIOR.BLOCK)
// //       this.color = COLORS.GUARD_ALERT
// //     else if (this.state === BEHAVIOR.SEARCH || this.state === BEHAVIOR.INVESTIGATE)
// //       this.color = COLORS.GUARD_SEARCH
// //     else
// //       this.color = COLORS.GUARD_PATROL
// //   }

// //   // ── Render ───────────────────────────────────────────────────

// //   draw(ctx, debug) {
// //     const x = this.pixelX
// //     const y = this.pixelY
// //     const s = T * 0.88

// //     // Soft vision glow behind character
// //     const vColor = this.state === BEHAVIOR.CHASE || this.state === BEHAVIOR.BLOCK
// //       ? '255,80,0'
// //       : this.state === BEHAVIOR.SEARCH || this.state === BEHAVIOR.INVESTIGATE
// //         ? '220,220,0' : '255,51,51'
// //     const vGrd = ctx.createRadialGradient(x, y, 0, x, y, this.visionPx)
// //     vGrd.addColorStop(0,   `rgba(${vColor},0.08)`)
// //     vGrd.addColorStop(0.6, `rgba(${vColor},0.03)`)
// //     vGrd.addColorStop(1,   `rgba(${vColor},0)`)
// //     ctx.fillStyle = vGrd
// //     ctx.beginPath()
// //     ctx.arc(x, y, this.visionPx, 0, Math.PI * 2)
// //     ctx.fill()

// //     // Alert ! or ? above head
// //     if (this.alertLevel > 0.6) {
// //       const mark   = this.alertLevel > 0.85 ? '!' : '?'
// //       const bounce = Math.sin(Date.now() / 150) * 3
// //       ctx.font      = `bold ${Math.floor(s * 0.7)}px monospace`
// //       ctx.textAlign = 'center'
// //       ctx.fillStyle  = this.alertLevel > 0.85 ? '#ff3333' : '#ffcc00'
// //       ctx.shadowBlur  = 8
// //       ctx.shadowColor = ctx.fillStyle
// //       ctx.fillText(mark, x, y - s * 1.55 + bounce)
// //       ctx.shadowBlur = 0
// //     }

// //     ctx.save()
// //     ctx.translate(x, y)
// //     if (this._facingLeft) ctx.scale(-1, 1)

// //     const legSwing = this._moving ? Math.sin(this._walkFrame) * 0.3 : 0
// //     const bodyColor = this.state === BEHAVIOR.CHASE || this.state === BEHAVIOR.BLOCK
// //       ? '#b71c1c'
// //       : this.state === BEHAVIOR.SEARCH || this.state === BEHAVIOR.INVESTIGATE
// //         ? '#e65100' : '#c62828'

// //     // Left leg
// //     ctx.save()
// //     ctx.translate(-s * 0.16, s * 0.22)
// //     ctx.rotate(-legSwing)
// //     ctx.fillStyle = '#1a237e'
// //     ctx.beginPath()
// //     ctx.roundRect(-s*0.11, 0, s*0.2, s*0.42, s*0.07)
// //     ctx.fill()
// //     ctx.fillStyle = '#0d1117'
// //     ctx.beginPath()
// //     ctx.ellipse(0, s*0.43, s*0.13, s*0.08, 0, 0, Math.PI*2)
// //     ctx.fill()
// //     ctx.restore()

// //     // Right leg
// //     ctx.save()
// //     ctx.translate(s * 0.16, s * 0.22)
// //     ctx.rotate(legSwing)
// //     ctx.fillStyle = '#1a237e'
// //     ctx.beginPath()
// //     ctx.roundRect(-s*0.11, 0, s*0.2, s*0.42, s*0.07)
// //     ctx.fill()
// //     ctx.fillStyle = '#0d1117'
// //     ctx.beginPath()
// //     ctx.ellipse(0, s*0.43, s*0.13, s*0.08, 0, 0, Math.PI*2)
// //     ctx.fill()
// //     ctx.restore()

// //     // Body
// //     ctx.fillStyle   = bodyColor
// //     ctx.shadowBlur  = this.alertLevel > 0.5 ? 14 : 5
// //     ctx.shadowColor = this.color
// //     ctx.beginPath()
// //     ctx.roundRect(-s*0.3, -s*0.15, s*0.6, s*0.44, s*0.12)
// //     ctx.fill()
// //     ctx.shadowBlur = 0

// //     // Badge
// //     ctx.fillStyle = '#ffd600'
// //     ctx.beginPath()
// //     ctx.arc(-s*0.1, s*0.04, s*0.09, 0, Math.PI*2)
// //     ctx.fill()
// //     ctx.fillStyle = '#0d1117'
// //     ctx.font      = `bold ${Math.floor(s * 0.12)}px monospace`
// //     ctx.textAlign = 'center'
// //     ctx.fillText('★', -s*0.1, s*0.08)

// //     // Left arm
// //     const armSwing = this._moving ? Math.sin(this._walkFrame + Math.PI) * 0.35 : 0
// //     ctx.save()
// //     ctx.translate(-s*0.32, -s*0.08)
// //     ctx.rotate(armSwing - 0.15)
// //     ctx.fillStyle = bodyColor
// //     ctx.beginPath()
// //     ctx.roundRect(-s*0.09, 0, s*0.18, s*0.32, s*0.07)
// //     ctx.fill()
// //     ctx.restore()

// //     // Right arm
// //     ctx.save()
// //     ctx.translate(s*0.32, -s*0.08)
// //     ctx.rotate(-armSwing + 0.15)
// //     ctx.fillStyle = bodyColor
// //     ctx.beginPath()
// //     ctx.roundRect(-s*0.09, 0, s*0.18, s*0.32, s*0.07)
// //     ctx.fill()
// //     ctx.restore()

// //     // Head
// //     ctx.fillStyle   = '#ffcc80'
// //     ctx.shadowBlur  = 6
// //     ctx.shadowColor = this.color
// //     ctx.beginPath()
// //     ctx.arc(0, -s*0.38, s*0.26, 0, Math.PI * 2)
// //     ctx.fill()
// //     ctx.shadowBlur = 0

// //     // Police hat
// //     ctx.fillStyle = bodyColor
// //     ctx.beginPath()
// //     ctx.roundRect(-s*0.28, -s*0.62, s*0.56, s*0.2, [s*0.06, s*0.06, 0, 0])
// //     ctx.fill()
// //     ctx.fillRect(-s*0.32, -s*0.44, s*0.64, s*0.08)
// //     ctx.fillStyle = '#ffd600'
// //     ctx.beginPath()
// //     ctx.arc(0, -s*0.56, s*0.07, 0, Math.PI*2)
// //     ctx.fill()

// //     // Eyes
// //     const isAlert = this.alertLevel > 0.5
// //     ctx.fillStyle = isAlert ? '#b71c1c' : '#1a237e'
// //     ctx.beginPath()
// //     ctx.arc(-s*0.1, -s*0.4, s*0.06, 0, Math.PI*2)
// //     ctx.fill()
// //     ctx.beginPath()
// //     ctx.arc(s*0.1, -s*0.4, s*0.06, 0, Math.PI*2)
// //     ctx.fill()
// //     ctx.fillStyle = 'white'
// //     ctx.beginPath()
// //     ctx.arc(-s*0.08, -s*0.42, s*0.022, 0, Math.PI*2)
// //     ctx.fill()
// //     ctx.beginPath()
// //     ctx.arc(s*0.12, -s*0.42, s*0.022, 0, Math.PI*2)
// //     ctx.fill()

// //     // Mouth
// //     ctx.strokeStyle = '#5d3a1a'
// //     ctx.lineWidth   = s * 0.04
// //     ctx.lineCap     = 'round'
// //     ctx.beginPath()
// //     if (isAlert) {
// //       ctx.moveTo(-s*0.1, -s*0.28)
// //       ctx.lineTo(s*0.1,  -s*0.28)
// //     } else {
// //       ctx.arc(0, -s*0.22, s*0.1, Math.PI + 0.3, -0.3)
// //     }
// //     ctx.stroke()

// //     ctx.restore()

// //     // Debug: A* path
// //     if (debug && this.debugPath.length > 1) {
// //       ctx.strokeStyle = COLORS.ASTAR_PATH
// //       ctx.lineWidth   = 1.5
// //       ctx.beginPath()
// //       this.debugPath.forEach((p, i) => {
// //         const px = p.x * T + T / 2, py = p.y * T + T / 2
// //         i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
// //       })
// //       ctx.stroke()
// //     }
// //   }
// // }
// import { TILE_SIZE, TILE, GUARD_CFG, BEHAVIOR, COLORS } from '../game/constants.js'
// import { AStar }            from '../ai/AStar.js'
// import { BFS }              from '../ai/BFS.js'
// import { DFS }              from '../ai/DFS.js'
// import { BehaviorTree }     from '../ai/BehaviorTree.js'
// import { VisibilitySystem } from './VisibilitySystem.js'
// import { MultiAgentCoord }  from './MultiAgentCoord.js'

// const T = TILE_SIZE

// function rr(ctx, x, y, w, h, r) {
//   r = Math.min(r, w / 2, h / 2)
//   ctx.beginPath()
//   ctx.moveTo(x + r, y)
//   ctx.lineTo(x + w - r, y)
//   ctx.arcTo(x + w, y,     x + w, y + r,     r)
//   ctx.lineTo(x + w, y + h - r)
//   ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
//   ctx.lineTo(x + r, y + h)
//   ctx.arcTo(x,     y + h, x,       y + h - r, r)
//   ctx.lineTo(x,     y + r)
//   ctx.arcTo(x,     y,     x + r,   y,         r)
//   ctx.closePath()
// }

// export class Guard {
//   constructor({ tileX, tileY, gene, id, geneIdx, grid, escapeTile, speedMult = 1, visionMult = 1 }) {
//     this.tileX      = tileX
//     this.tileY      = tileY
//     this.pixelX     = tileX * T + T / 2
//     this.pixelY     = tileY * T + T / 2

//     this.gene       = gene
//     this.id         = id
//     this.geneIdx    = geneIdx
//     this.grid       = grid
//     this.escapeTile = escapeTile

//     this.state           = BEHAVIOR.PATROL
//     this.alertLevel      = 0
//     this.lastKnownPlayer = null
//     this._isHearing      = false
//     this._interceptTarget = null

//     this.path            = []
//     this.pathIdx         = 1
//     this.debugPath       = []
//     this.framesSincePath = 0
//     this._walkFrame      = 0
//     this._moving         = false
//     this._facingLeft     = false
//     this._facingAngle    = 0

//     this.bfsQueue  = []
//     this.bfsStep   = 0
//     this.dfsQueue  = []
//     this.dfsStep   = 0

//     this.wanderTarget = null
//     this.wanderTimer  = 0

//     // Smarter patrol — build waypoints near exit
//     this.patrol    = this._buildSmartPatrol()
//     this.patrolIdx = 0

//     this.speed      = (GUARD_CFG.BASE_SPEED + gene.speedMult * 0.8) * T * speedMult
//     this.visionPx   = (GUARD_CFG.BASE_VISION + gene.visionMult * 3) * T * visionMult
//     this.hearRadius = (GUARD_CFG.HEAR_BASE   + gene.searchRadius * 4) * visionMult

//     this.tree  = new BehaviorTree(gene)
//     this.color = COLORS.GUARD_PATROL
//   }

//   update(dt, playerTile, playerVisible, heatmap, allGuards, ga, wantedSpeedMult = 1) {
//     this.framesSincePath++
//     this._isHearing = false
//     this.alertLevel = Math.max(0, this.alertLevel - GUARD_CFG.ALERT_DECAY * dt * 60)

//     if (playerVisible) {
//       this.alertLevel      = 1
//       this.lastKnownPlayer    = { ...playerTile }
//       this._investigateTarget = null   // recalc spread on next investigate
//       // Face toward last known position
//       this._facingAngle = Math.atan2(
//         playerTile.y * T - this.pixelY,
//         playerTile.x * T - this.pixelX
//       )
//       ga.recordSpot(this.geneIdx)
//       MultiAgentCoord.broadcastSighting(this, playerTile, allGuards)
//     } else if (this.lastKnownPlayer) {
//       // Gradually rotate vision toward last known position
//       const targetAngle = Math.atan2(
//         this.lastKnownPlayer.y * T - this.pixelY,
//         this.lastKnownPlayer.x * T - this.pixelX
//       )
//       const diff = targetAngle - this._facingAngle
//       const wrapped = ((diff + Math.PI) % (Math.PI * 2)) - Math.PI
//       this._facingAngle += wrapped * dt * 1.5
//     }

//     this.state = this.tree.tick({
//       guardTile:          { x: this.tileX, y: this.tileY },
//       playerTile:         playerVisible ? playerTile : null,
//       escapeTile:         this.escapeTile,
//       lastKnown:          this.lastKnownPlayer,
//       playerVisible,
//       alertLevel:         this.alertLevel,
//       chaseMemorySeconds: GUARD_CFG.CHASE_MEMORY,
//     })

//     if (this.alertLevel > 0.8)
//       MultiAgentCoord.assignBlocker(allGuards, this.escapeTile)

//     const target = this._resolveTarget(heatmap)

//     const recalcInterval = Math.max(12, GUARD_CFG.PATH_RECALC - Math.floor(this.gene.predictionAcc * 20))
//     if (target && (this.framesSincePath > recalcInterval || this.path.length === 0)) {
//       this.path = AStar.findPath(this.grid, this.tileX, this.tileY, target.x, target.y)

//       // A* failed — target unreachable. Pick a random road waypoint instead.
//       if (this.path.length === 0 && this.state === BEHAVIOR.PATROL) {
//         const fallback = this._pickRandomWaypoint()
//         this.path = AStar.findPath(this.grid, this.tileX, this.tileY, fallback.x, fallback.y)
//         // Advance patrol index so we don't retry the same bad waypoint forever
//         this.patrolIdx++
//       }

//       this.pathIdx     = 1
//       this.debugPath   = this.path
//       this.framesSincePath = 0
//     }

//     this._followPath(dt, wantedSpeedMult)
//     this._updateColor()
//   }

//   setHearing(heard) { this._isHearing = heard }

//   _resolveTarget(heatmap) {
//     switch (this.state) {
//       case BEHAVIOR.CHASE: {
//         // Use intercept target if assigned, otherwise direct chase
//         if (this._interceptTarget) {
//           const d = this._distTo(this._interceptTarget)
//           if (d < 3) this._interceptTarget = null
//           else return this._interceptTarget
//         }
//         // Each guard approaches from a unique angle — no stacking on same tile
//         if (this.lastKnownPlayer) {
//           const angle  = ((this.id ?? 0) / 8) * Math.PI * 2
//           const spread = 3
//           const ox     = Math.round(Math.cos(angle) * spread)
//           const oy     = Math.round(Math.sin(angle) * spread)
//           const tx     = this.lastKnownPlayer.x + ox
//           const ty     = this.lastKnownPlayer.y + oy
//           if (tx >= 0 && ty >= 0 && tx < this.grid.cols && ty < this.grid.rows && this.grid.isWalkable(tx, ty))
//             return { x: tx, y: ty }
//         }
//         return this.lastKnownPlayer
//       }

//       case BEHAVIOR.BLOCK: return this.escapeTile

//       case BEHAVIOR.INVESTIGATE: {
//         if (!this.lastKnownPlayer) return null
//         // Each guard investigates a different offset around last known position
//         if (!this._investigateTarget) {
//           const angle = ((this.id ?? 0) / 8) * Math.PI * 2
//           const r     = 3 + ((this.id ?? 0) % 3)
//           const ox    = Math.round(Math.cos(angle) * r)
//           const oy    = Math.round(Math.sin(angle) * r)
//           const tx    = this.lastKnownPlayer.x + ox
//           const ty    = this.lastKnownPlayer.y + oy
//           this._investigateTarget = (
//             tx >= 0 && ty >= 0 && tx < this.grid.cols && ty < this.grid.rows && this.grid.isWalkable(tx, ty)
//           ) ? { x: tx, y: ty } : { ...this.lastKnownPlayer }
//         }
//         if (this._distTo(this._investigateTarget) < 2) {
//           this._investigateTarget = null
//           if (this.gene.aggression > 0.5) {
//             this.dfsQueue = DFS.sweep(this.grid, this.tileX, this.tileY, 60)
//             this.dfsStep  = 0
//           } else {
//             this.bfsQueue = BFS.sweep(this.grid, this.tileX, this.tileY, 80)
//             this.bfsStep  = 0
//           }
//           this.state = BEHAVIOR.SEARCH
//         }
//         return this._investigateTarget || this.lastKnownPlayer
//       }

//       case BEHAVIOR.SEARCH: {
//         const queue = this.gene.aggression > 0.5 ? this.dfsQueue : this.bfsQueue
//         const step  = this.gene.aggression > 0.5 ? this.dfsStep  : this.bfsStep
//         if (step < queue.length) {
//           const t = queue[step]
//           if (this._distTo(t) < 2) {
//             if (this.gene.aggression > 0.5) this.dfsStep++
//             else this.bfsStep++
//           }
//           return t
//         }
//         const hot = heatmap.hottest()
//         if (hot.v > 0.1) return hot
//         this.state = BEHAVIOR.PATROL
//         return null
//       }

//       case BEHAVIOR.PATROL: {
//         if (!this.patrol.length) this.patrol = this._buildSmartPatrol()
//         const wp = this.patrol[this.patrolIdx % this.patrol.length]
//         if (this._distTo(wp) < 2) {
//           this.patrolIdx++
//         }
//         return wp
//       }

//       default: return null
//     }
//   }

//   _followPath(dt, speedMult = 1) {
//     if (this.path.length < 2 || this.pathIdx >= this.path.length) {
//       this._moving = false
//       this.framesSincePath = 999
//       return
//     }

//     const next = this.path[this.pathIdx]

//     // Validate next tile — repath if unwalkable
//     if (!this.grid.isWalkable(next.x, next.y)) {
//       this._snapToTile()
//       this.path = []
//       this.framesSincePath = 999
//       this._moving = false
//       return
//     }

//     const tpx  = next.x * T + T / 2
//     const tpy  = next.y * T + T / 2
//     const dx   = tpx - this.pixelX
//     const dy   = tpy - this.pixelY
//     const dist = Math.hypot(dx, dy)
//     const spd  = this.speed * speedMult * dt

//     if (dist < spd + 1) {
//       // Snap exactly to tile center — prevents pixel drift causing wall clips
//       this.pixelX = tpx
//       this.pixelY = tpy
//       this.tileX  = next.x
//       this.tileY  = next.y
//       this.pathIdx++
//       this._stuckFrames = 0
//     } else {
//       const ndx = dx / dist
//       const ndy = dy / dist

//       // Try full movement
//       const nx  = this.pixelX + ndx * spd
//       const ny  = this.pixelY + ndy * spd
//       if (this.grid.isWalkable(Math.floor(nx / T), Math.floor(ny / T))) {
//         this.pixelX = nx
//         this.pixelY = ny
//         this._stuckFrames = 0
//       } else {
//         // Try X-axis slide only
//         const sx = this.pixelX + ndx * spd
//         if (this.grid.isWalkable(Math.floor(sx / T), Math.floor(this.pixelY / T))) {
//           this.pixelX = sx
//           this._stuckFrames = 0
//         }
//         // Try Y-axis slide only
//         else {
//           const sy = this.pixelY + ndy * spd
//           if (this.grid.isWalkable(Math.floor(this.pixelX / T), Math.floor(sy / T))) {
//             this.pixelY = sy
//             this._stuckFrames = 0
//           } else {
//             // Truly stuck — count frames then snap + repath
//             this._stuckFrames = (this._stuckFrames || 0) + 1
//             if (this._stuckFrames > 8) {
//               this._snapToTile()   // snap to nearest walkable tile center
//               this.path = []
//               this.framesSincePath = 999
//               this._stuckFrames = 0
//             }
//           }
//         }
//       }
//     }

//     // Always derive tile from pixel
//     this.tileX = Math.floor(this.pixelX / T)
//     this.tileY = Math.floor(this.pixelY / T)

//     this._moving     = dist > 1
//     this._facingLeft = dx < 0
//     if (this._moving) {
//       this._facingAngle = Math.atan2(dy, dx)
//       this._stuckFrames = 0
//     } else if (this.state === 'patrol' || this.state === 'search') {
//       this._facingAngle += dt * 0.8
//     }
//     this._walkFrame += spd * 0.25
//   }

//   canSeePlayer(playerPixelX, playerPixelY) {
//     return VisibilitySystem.hasLineOfSight(
//       this.grid,
//       this.pixelX, this.pixelY,
//       playerPixelX, playerPixelY,
//       this.visionPx
//     )
//   }

//   hearPlayer(playerTile, playerNoise) {
//     const d = Math.hypot(this.tileX - playerTile.x, this.tileY - playerTile.y)
//     return d < this.hearRadius * playerNoise
//   }

//   // Smart patrol — mostly near exit, some random
//   _buildSmartPatrol() {
//     const COLS  = this.grid.cols
//     const ROWS  = this.grid.rows
//     const id    = this.id ?? 0
//     const pts   = []

//     // Divide map into a 5x4 grid of sectors
//     // Each guard visits a unique rotation of sectors based on their id
//     const SCOLS = 5, SROWS = 4
//     const sw = Math.floor(COLS / SCOLS)
//     const sh = Math.floor(ROWS / SROWS)

//     // Build sector list and rotate by guard id so each guard has a different route
//     const sectors = []
//     for (let r = 0; r < SROWS; r++)
//       for (let c = 0; c < SCOLS; c++)
//         sectors.push({ c, r })

//     // Rotate sector order uniquely per guard
//     const rotation = (id * 3) % sectors.length
//     const ordered  = [...sectors.slice(rotation), ...sectors.slice(0, rotation)]

//     // Pick one road tile per sector
//     for (const { c, r } of ordered) {
//       const x0 = c * sw + 1
//       const y0 = r * sh + 1
//       const x1 = Math.min(x0 + sw - 2, COLS - 2)
//       const y1 = Math.min(y0 + sh - 2, ROWS - 2)

//       // Try random tiles inside this sector
//       let found = false
//       for (let attempt = 0; attempt < 30; attempt++) {
//         const x = x0 + Math.floor(Math.random() * Math.max(1, x1 - x0))
//         const y = y0 + Math.floor(Math.random() * Math.max(1, y1 - y0))
//         if (this.grid.get(x, y) === TILE.ROAD) {
//           pts.push({ x, y })
//           found = true
//           break
//         }
//       }
//     }

//     // Always add spawn tile's area and exit tile as waypoints
//     pts.push({ x: this.escapeTile.x, y: this.escapeTile.y })

//     return pts.length > 1 ? pts : this._fallbackPatrol()
//   }

//   _fallbackPatrol() {
//     // Last resort: BFS from spawn, pick every 10th reachable road tile
//     const COLS = this.grid.cols
//     const ROWS = this.grid.rows
//     const pts  = []
//     for (let attempt = 0; attempt < 200; attempt++) {
//       const x = 1 + Math.floor(Math.random() * (COLS - 2))
//       const y = 1 + Math.floor(Math.random() * (ROWS - 2))
//       if (this.grid.get(x, y) === TILE.ROAD) pts.push({ x, y })
//       if (pts.length >= 8) break
//     }
//     return pts.length > 0 ? pts : [{ x: this.tileX, y: this.tileY }]
//   }

//   _pickRandomWaypoint() {
//     const COLS = this.grid.cols
//     const ROWS = this.grid.rows
//     for (let i = 0; i < 60; i++) {
//       const x = 1 + Math.floor(Math.random() * (COLS - 2))
//       const y = 1 + Math.floor(Math.random() * (ROWS - 2))
//       if (this.grid.get(x, y) === TILE.ROAD) return { x, y }
//     }
//     return { x: this.tileX, y: this.tileY }
//   }

//   _buildPatrol() { return this._buildSmartPatrol() }

//   // Snap guard to nearest walkable tile center — escapes wall traps
//   _snapToTile() {
//     const cx = Math.round(this.pixelX / T)
//     const cy = Math.round(this.pixelY / T)
//     // Search outward in a spiral for nearest walkable tile
//     for (let r = 0; r <= 3; r++) {
//       for (let ox = -r; ox <= r; ox++) {
//         for (let oy = -r; oy <= r; oy++) {
//           if (Math.abs(ox) !== r && Math.abs(oy) !== r) continue // only check ring
//           const tx = cx + ox
//           const ty = cy + oy
//           if (tx < 0 || ty < 0 || tx >= this.grid.cols || ty >= this.grid.rows) continue
//           if (this.grid.isWalkable(tx, ty)) {
//             this.tileX  = tx
//             this.tileY  = ty
//             this.pixelX = tx * T + T / 2
//             this.pixelY = ty * T + T / 2
//             return
//           }
//         }
//       }
//     }
//   }
//   _distTo(tile)  { return Math.abs(this.tileX - tile.x) + Math.abs(this.tileY - tile.y) }

//   _updateColor() {
//     if (this.state === BEHAVIOR.CHASE || this.state === BEHAVIOR.BLOCK)
//       this.color = COLORS.GUARD_ALERT
//     else if (this.state === BEHAVIOR.SEARCH || this.state === BEHAVIOR.INVESTIGATE)
//       this.color = COLORS.GUARD_SEARCH
//     else
//       this.color = COLORS.GUARD_PATROL
//   }

//   // draw(ctx, debug) {
//   //   const x = this.pixelX
//   //   const y = this.pixelY
//   //   const s = T * 0.88

//   //   // Hearing highlight
//   //   if (this._isHearing) {
//   //     const pulse = 0.6 + 0.4 * Math.sin(Date.now() / 80)
//   //     ctx.save()
//   //     ctx.strokeStyle = `rgba(255,230,0,${pulse})`
//   //     ctx.lineWidth   = 3
//   //     ctx.shadowBlur  = 18
//   //     ctx.shadowColor = '#ffdd00'
//   //     ctx.beginPath()
//   //     ctx.arc(x, y, s * 1.05, 0, Math.PI * 2)
//   //     ctx.stroke()
//   //     ctx.fillStyle = 'rgba(255,220,0,0.08)'
//   //     ctx.beginPath()
//   //     ctx.arc(x, y, s * 1.05, 0, Math.PI * 2)
//   //     ctx.fill()
//   //     ctx.restore()

//   //     ctx.save()
//   //     ctx.font      = `${Math.floor(s * 0.65)}px serif`
//   //     ctx.textAlign = 'center'
//   //     const bounce  = Math.sin(Date.now() / 120) * 2
//   //     ctx.fillStyle   = '#ffdd00'
//   //     ctx.shadowBlur  = 10
//   //     ctx.shadowColor = '#ffaa00'
//   //     ctx.fillText('👂', x, y - s * 1.55 + bounce)
//   //     ctx.shadowBlur = 0
//   //     ctx.restore()
//   //   }

//   //   // Alert ! or ?
//   //   if (this.alertLevel > 0.6 && !this._isHearing) {
//   //     const mark   = this.alertLevel > 0.85 ? '!' : '?'
//   //     const bounce = Math.sin(Date.now() / 150) * 3
//   //     ctx.font      = `bold ${Math.floor(s * 0.7)}px monospace`
//   //     ctx.textAlign = 'center'
//   //     ctx.fillStyle  = this.alertLevel > 0.85 ? '#ff3333' : '#ffcc00'
//   //     ctx.shadowBlur  = 8
//   //     ctx.shadowColor = ctx.fillStyle
//   //     ctx.fillText(mark, x, y - s * 1.55 + bounce)
//   //     ctx.shadowBlur = 0
//   //   }

//   //   ctx.save()
//   //   ctx.translate(x, y)
//   //   if (this._facingLeft) ctx.scale(-1, 1)

//   //   const legSwing  = this._moving ? Math.sin(this._walkFrame) * 0.3 : 0
//   //   const bodyColor = this.state === BEHAVIOR.CHASE || this.state === BEHAVIOR.BLOCK
//   //     ? '#b71c1c'
//   //     : this.state === BEHAVIOR.SEARCH || this.state === BEHAVIOR.INVESTIGATE
//   //       ? '#e65100' : '#c62828'

//   //   // Legs
//   //   ctx.save()
//   //   ctx.translate(-s*0.16, s*0.22)
//   //   ctx.rotate(-legSwing)
//   //   ctx.fillStyle = '#1a237e'
//   //   rr(ctx, -s*0.11, 0, s*0.2, s*0.42, s*0.07); ctx.fill()
//   //   ctx.fillStyle = '#0d1117'
//   //   ctx.beginPath(); ctx.ellipse(0, s*0.43, s*0.13, s*0.08, 0, 0, Math.PI*2); ctx.fill()
//   //   ctx.restore()

//   //   ctx.save()
//   //   ctx.translate(s*0.16, s*0.22)
//   //   ctx.rotate(legSwing)
//   //   ctx.fillStyle = '#1a237e'
//   //   rr(ctx, -s*0.11, 0, s*0.2, s*0.42, s*0.07); ctx.fill()
//   //   ctx.fillStyle = '#0d1117'
//   //   ctx.beginPath(); ctx.ellipse(0, s*0.43, s*0.13, s*0.08, 0, 0, Math.PI*2); ctx.fill()
//   //   ctx.restore()

//   //   // Body
//   //   ctx.fillStyle   = bodyColor
//   //   ctx.shadowBlur  = this._isHearing ? 20 : this.alertLevel > 0.5 ? 14 : 5
//   //   ctx.shadowColor = this._isHearing ? '#ffdd00' : this.color
//   //   rr(ctx, -s*0.3, -s*0.15, s*0.6, s*0.44, s*0.12); ctx.fill()
//   //   ctx.shadowBlur = 0

//   //   // Badge
//   //   ctx.fillStyle = '#ffd600'
//   //   ctx.beginPath(); ctx.arc(-s*0.1, s*0.04, s*0.09, 0, Math.PI*2); ctx.fill()
//   //   ctx.fillStyle = '#0d1117'
//   //   ctx.font = `bold ${Math.floor(s*0.12)}px monospace`
//   //   ctx.textAlign = 'center'
//   //   ctx.fillText('★', -s*0.1, s*0.08)

//   //   // Arms
//   //   const armSwing = this._moving ? Math.sin(this._walkFrame + Math.PI) * 0.35 : 0
//   //   ctx.save()
//   //   ctx.translate(-s*0.32, -s*0.08); ctx.rotate(armSwing - 0.15)
//   //   ctx.fillStyle = bodyColor
//   //   rr(ctx, -s*0.09, 0, s*0.18, s*0.32, s*0.07); ctx.fill()
//   //   ctx.restore()

//   //   ctx.save()
//   //   ctx.translate(s*0.32, -s*0.08); ctx.rotate(-armSwing + 0.15)
//   //   ctx.fillStyle = bodyColor
//   //   rr(ctx, -s*0.09, 0, s*0.18, s*0.32, s*0.07); ctx.fill()
//   //   ctx.restore()

//   //   // Head
//   //   ctx.fillStyle   = '#ffcc80'
//   //   ctx.shadowBlur  = 6
//   //   ctx.shadowColor = this._isHearing ? '#ffdd00' : this.color
//   //   ctx.beginPath(); ctx.arc(0, -s*0.38, s*0.26, 0, Math.PI*2); ctx.fill()
//   //   ctx.shadowBlur = 0

//   //   // Hat
//   //   ctx.fillStyle = bodyColor
//   //   rr(ctx, -s*0.28, -s*0.62, s*0.56, s*0.2, s*0.06); ctx.fill()
//   //   ctx.fillRect(-s*0.32, -s*0.44, s*0.64, s*0.08)
//   //   ctx.fillStyle = '#ffd600'
//   //   ctx.beginPath(); ctx.arc(0, -s*0.56, s*0.07, 0, Math.PI*2); ctx.fill()

//   //   // Eyes
//   //   const isAlert = this.alertLevel > 0.5
//   //   ctx.fillStyle = this._isHearing ? '#ff9800' : isAlert ? '#b71c1c' : '#1a237e'
//   //   ctx.beginPath(); ctx.arc(-s*0.1, -s*0.4, s*0.06, 0, Math.PI*2); ctx.fill()
//   //   ctx.beginPath(); ctx.arc(s*0.1, -s*0.4, s*0.06, 0, Math.PI*2); ctx.fill()
//   //   ctx.fillStyle = 'white'
//   //   ctx.beginPath(); ctx.arc(-s*0.08, -s*0.42, s*0.022, 0, Math.PI*2); ctx.fill()
//   //   ctx.beginPath(); ctx.arc(s*0.12, -s*0.42, s*0.022, 0, Math.PI*2); ctx.fill()

//   //   // Mouth
//   //   ctx.strokeStyle = '#5d3a1a'
//   //   ctx.lineWidth   = s * 0.04
//   //   ctx.lineCap     = 'round'
//   //   ctx.beginPath()
//   //   if (isAlert || this._isHearing) {
//   //     ctx.moveTo(-s*0.1, -s*0.28); ctx.lineTo(s*0.1, -s*0.28)
//   //   } else {
//   //     ctx.arc(0, -s*0.22, s*0.1, Math.PI + 0.3, -0.3)
//   //   }
//   //   ctx.stroke()
//   //   ctx.restore()

//   //   if (debug && this.debugPath.length > 1) {
//   //     ctx.strokeStyle = COLORS.ASTAR_PATH
//   //     ctx.lineWidth   = 1.5
//   //     ctx.beginPath()
//   //     this.debugPath.forEach((p, i) => {
//   //       const px = p.x*T+T/2, py = p.y*T+T/2
//   //       i === 0 ? ctx.moveTo(px,py) : ctx.lineTo(px,py)
//   //     })
//   //     ctx.stroke()
//   //   }
//   // }
//   draw(ctx, debug) {
//     const x = this.pixelX
//     const y = this.pixelY
//     const s = T * 0.88

//     // Alert ! or ? above head — only when alert, no hearing ring
//     if (this.alertLevel > 0.6) {
//       const mark   = this.alertLevel > 0.85 ? '!' : '?'
//       const bounce = Math.sin(Date.now() / 150) * 3
//       ctx.font      = `bold ${Math.floor(s * 0.7)}px monospace`
//       ctx.textAlign = 'center'
//       ctx.fillStyle  = this.alertLevel > 0.85 ? '#ff3333' : '#ffcc00'
//       ctx.shadowBlur  = 8
//       ctx.shadowColor = ctx.fillStyle
//       ctx.fillText(mark, x, y - s * 1.55 + bounce)
//       ctx.shadowBlur = 0
//     }

//     ctx.save()
//     ctx.translate(x, y)
//     if (this._facingLeft) ctx.scale(-1, 1)

//     const legSwing  = this._moving ? Math.sin(this._walkFrame) * 0.3 : 0
//     const bodyColor = this.state === BEHAVIOR.CHASE || this.state === BEHAVIOR.BLOCK
//       ? '#b71c1c'
//       : this.state === BEHAVIOR.SEARCH || this.state === BEHAVIOR.INVESTIGATE
//         ? '#e65100' : '#c62828'

//     // Left leg
//     ctx.save()
//     ctx.translate(-s*0.16, s*0.22)
//     ctx.rotate(-legSwing)
//     ctx.fillStyle = '#1a237e'
//     rr(ctx, -s*0.11, 0, s*0.2, s*0.42, s*0.07); ctx.fill()
//     ctx.fillStyle = '#0d1117'
//     ctx.beginPath(); ctx.ellipse(0, s*0.43, s*0.13, s*0.08, 0, 0, Math.PI*2); ctx.fill()
//     ctx.restore()

//     // Right leg
//     ctx.save()
//     ctx.translate(s*0.16, s*0.22)
//     ctx.rotate(legSwing)
//     ctx.fillStyle = '#1a237e'
//     rr(ctx, -s*0.11, 0, s*0.2, s*0.42, s*0.07); ctx.fill()
//     ctx.fillStyle = '#0d1117'
//     ctx.beginPath(); ctx.ellipse(0, s*0.43, s*0.13, s*0.08, 0, 0, Math.PI*2); ctx.fill()
//     ctx.restore()

//     // Body
//     ctx.fillStyle   = bodyColor
//     ctx.shadowBlur  = this.alertLevel > 0.5 ? 10 : 4
//     ctx.shadowColor = this.color
//     rr(ctx, -s*0.3, -s*0.15, s*0.6, s*0.44, s*0.12); ctx.fill()
//     ctx.shadowBlur = 0

//     // Badge
//     ctx.fillStyle = '#ffd600'
//     ctx.beginPath(); ctx.arc(-s*0.1, s*0.04, s*0.09, 0, Math.PI*2); ctx.fill()
//     ctx.fillStyle = '#0d1117'
//     ctx.font = `bold ${Math.floor(s*0.12)}px monospace`
//     ctx.textAlign = 'center'
//     ctx.fillText('★', -s*0.1, s*0.08)

//     // Arms
//     const armSwing = this._moving ? Math.sin(this._walkFrame + Math.PI) * 0.35 : 0
//     ctx.save()
//     ctx.translate(-s*0.32, -s*0.08); ctx.rotate(armSwing - 0.15)
//     ctx.fillStyle = bodyColor
//     rr(ctx, -s*0.09, 0, s*0.18, s*0.32, s*0.07); ctx.fill()
//     ctx.restore()

//     ctx.save()
//     ctx.translate(s*0.32, -s*0.08); ctx.rotate(-armSwing + 0.15)
//     ctx.fillStyle = bodyColor
//     rr(ctx, -s*0.09, 0, s*0.18, s*0.32, s*0.07); ctx.fill()
//     ctx.restore()

//     // Head
//     ctx.fillStyle   = '#ffcc80'
//     ctx.shadowBlur  = 4
//     ctx.shadowColor = this.color
//     ctx.beginPath(); ctx.arc(0, -s*0.38, s*0.26, 0, Math.PI*2); ctx.fill()
//     ctx.shadowBlur = 0

//     // Hat
//     ctx.fillStyle = bodyColor
//     rr(ctx, -s*0.28, -s*0.62, s*0.56, s*0.2, s*0.06); ctx.fill()
//     ctx.fillRect(-s*0.32, -s*0.44, s*0.64, s*0.08)
//     ctx.fillStyle = '#ffd600'
//     ctx.beginPath(); ctx.arc(0, -s*0.56, s*0.07, 0, Math.PI*2); ctx.fill()

//     // Eyes
//     const isAlert = this.alertLevel > 0.5
//     ctx.fillStyle = isAlert ? '#b71c1c' : '#1a237e'
//     ctx.beginPath(); ctx.arc(-s*0.1, -s*0.4, s*0.06, 0, Math.PI*2); ctx.fill()
//     ctx.beginPath(); ctx.arc(s*0.1, -s*0.4, s*0.06, 0, Math.PI*2); ctx.fill()
//     ctx.fillStyle = 'white'
//     ctx.beginPath(); ctx.arc(-s*0.08, -s*0.42, s*0.022, 0, Math.PI*2); ctx.fill()
//     ctx.beginPath(); ctx.arc(s*0.12, -s*0.42, s*0.022, 0, Math.PI*2); ctx.fill()

//     // Mouth
//     ctx.strokeStyle = '#5d3a1a'
//     ctx.lineWidth   = s * 0.04
//     ctx.lineCap     = 'round'
//     ctx.beginPath()
//     if (isAlert) {
//       ctx.moveTo(-s*0.1, -s*0.28); ctx.lineTo(s*0.1, -s*0.28)
//     } else {
//       ctx.arc(0, -s*0.22, s*0.1, Math.PI + 0.3, -0.3)
//     }
//     ctx.stroke()
//     ctx.restore()

//     // Debug A* path
//     if (debug && this.debugPath.length > 1) {
//       ctx.strokeStyle = COLORS.ASTAR_PATH
//       ctx.lineWidth   = 1.5
//       ctx.beginPath()
//       this.debugPath.forEach((p, i) => {
//         const px = p.x*T+T/2, py = p.y*T+T/2
//         i === 0 ? ctx.moveTo(px,py) : ctx.lineTo(px,py)
//       })
//       ctx.stroke()
//     }
//   }
// }

// import { TILE_SIZE, TILE, GUARD_CFG, BEHAVIOR, COLORS } from '../game/constants.js'
// import { AStar }            from '../ai/AStar.js'
// import { BFS }              from '../ai/BFS.js'
// import { DFS }              from '../ai/DFS.js'
// import { BehaviorTree }     from '../ai/BehaviorTree.js'
// import { VisibilitySystem } from './VisibilitySystem.js'
// import { MultiAgentCoord }  from './MultiAgentCoord.js'

// const T = TILE_SIZE

// export class Guard {
//   constructor({ tileX, tileY, gene, id, geneIdx, grid, escapeTile, speedMult = 1, visionMult = 1 }) {
//     this.tileX      = tileX
//     this.tileY      = tileY
//     this.pixelX     = tileX * T + T / 2
//     this.pixelY     = tileY * T + T / 2

//     this.gene       = gene
//     this.id         = id
//     this.geneIdx    = geneIdx
//     this.grid       = grid
//     this.escapeTile = escapeTile

//     this.state           = BEHAVIOR.PATROL
//     this.alertLevel      = 0
//     this.lastKnownPlayer = null

//     this.path            = []
//     this.pathIdx         = 1
//     this.debugPath       = []
//     this.framesSincePath = 0
//     this._walkFrame      = 0
//     this._moving         = false
//     this._facingLeft     = false

//     this.bfsQueue  = []
//     this.bfsStep   = 0
//     this.dfsQueue  = []
//     this.dfsStep   = 0

//     this.wanderTarget = null
//     this.wanderTimer  = 0

//     this.patrol    = this._buildPatrol()
//     this.patrolIdx = 0

//     this.speed      = (GUARD_CFG.BASE_SPEED + gene.speedMult * 0.8) * T
//     this.visionPx   = (GUARD_CFG.BASE_VISION + gene.visionMult * 3) * T
//     this.hearRadius = (GUARD_CFG.HEAR_BASE   + gene.searchRadius * 4)

//     this.tree  = new BehaviorTree(gene)
//     this.color = COLORS.GUARD_PATROL
//   }

//   // ── Main update ─────────────────────────────────────────────

//   update(dt, playerTile, playerVisible, heatmap, allGuards, ga) {
//     this.framesSincePath++
//     this.alertLevel = Math.max(0, this.alertLevel - GUARD_CFG.ALERT_DECAY * dt * 60)

//     if (playerVisible) {
//       this.alertLevel      = 1
//       this.lastKnownPlayer = { ...playerTile }
//       ga.recordSpot(this.geneIdx)
//       MultiAgentCoord.broadcastSighting(this, playerTile, allGuards)
//     }

//     this.state = this.tree.tick({
//       guardTile:     { x: this.tileX, y: this.tileY },
//       playerTile:    playerVisible ? playerTile : null,
//       escapeTile:    this.escapeTile,
//       lastKnown:     this.lastKnownPlayer,
//       playerVisible,
//       alertLevel:    this.alertLevel,
//     })

//     if (this.alertLevel > 0.8)
//       MultiAgentCoord.assignBlocker(allGuards, this.escapeTile)

//     const target = this._resolveTarget(heatmap)

//     const recalcInterval = Math.max(15, GUARD_CFG.PATH_RECALC - Math.floor(this.gene.predictionAcc * 20))
//     if (target && (this.framesSincePath > recalcInterval || this.path.length === 0)) {
//       this.path  = AStar.findPath(this.grid, this.tileX, this.tileY, target.x, target.y)
//       this.pathIdx = 1
//       this.debugPath = this.path
//       this.framesSincePath = 0
//     }

//     this._followPath(dt)
//     this._updateColor()
//   }

//   // ── Resolve movement target ──────────────────────────────────

//   _resolveTarget(heatmap) {
//     switch (this.state) {
//       case BEHAVIOR.CHASE:
//         return this.lastKnownPlayer

//       case BEHAVIOR.BLOCK:
//         return this.escapeTile

//       case BEHAVIOR.INVESTIGATE:
//         if (!this.lastKnownPlayer) return null
//         if (this._distTo(this.lastKnownPlayer) < 2) {
//           if (this.gene.aggression > 0.5) {
//             this.dfsQueue = DFS.sweep(this.grid, this.tileX, this.tileY, 60)
//             this.dfsStep  = 0
//           } else {
//             this.bfsQueue = BFS.sweep(this.grid, this.tileX, this.tileY, 80)
//             this.bfsStep  = 0
//           }
//           this.state = BEHAVIOR.SEARCH
//         }
//         return this.lastKnownPlayer

//       case BEHAVIOR.SEARCH: {
//         const queue = this.gene.aggression > 0.5 ? this.dfsQueue : this.bfsQueue
//         const step  = this.gene.aggression > 0.5 ? this.dfsStep  : this.bfsStep
//         if (step < queue.length) {
//           const t = queue[step]
//           if (this._distTo(t) < 2) {
//             if (this.gene.aggression > 0.5) this.dfsStep++
//             else this.bfsStep++
//           }
//           return t
//         }
//         const hot = heatmap.hottest()
//         if (hot.v > 0.1) return hot
//         this.state = BEHAVIOR.PATROL
//         return null
//       }

//       case BEHAVIOR.PATROL: {
//         const arrived  = this.wanderTarget && this._distTo(this.wanderTarget) < 2
//         const timedOut = this.wanderTimer <= 0
//         if (!this.wanderTarget || arrived || timedOut) {
//           this.wanderTarget = this._pickRandomWaypoint()
//           this.wanderTimer  = 180 + Math.random() * 240
//         }
//         this.wanderTimer--
//         return this.wanderTarget
//       }

//       default: return null
//     }
//   }

//   // ── Follow A* path ───────────────────────────────────────────

//   _followPath(dt) {
//     if (this.path.length < 2 || this.pathIdx >= this.path.length) {
//       this._moving = false
//       return
//     }

//     const next = this.path[this.pathIdx]
//     const tpx  = next.x * T + T / 2
//     const tpy  = next.y * T + T / 2
//     const dx   = tpx - this.pixelX
//     const dy   = tpy - this.pixelY
//     const dist = Math.hypot(dx, dy)
//     const spd  = this.speed * dt

//     if (dist < spd + 1) {
//       this.pixelX = tpx; this.pixelY = tpy
//       this.tileX  = next.x; this.tileY = next.y
//       this.pathIdx++
//     } else {
//       this.pixelX += (dx / dist) * spd
//       this.pixelY += (dy / dist) * spd
//     }
    
//     this._moving      = dist > 1
//     this._facingLeft  = dx < 0
//     this._walkFrame  += spd * 0.25
//     if (dist > 1) this._facingAngle = Math.atan2(dy, dx)
//   }

//   // ── Visibility & hearing ─────────────────────────────────────

//   canSeePlayer(playerPixelX, playerPixelY) {
//     return VisibilitySystem.hasLineOfSight(
//       this.grid,
//       this.pixelX, this.pixelY,
//       playerPixelX, playerPixelY,
//       this.visionPx
//     )
//   }

//   hearPlayer(playerTile, playerNoise) {
//     const d = Math.hypot(this.tileX - playerTile.x, this.tileY - playerTile.y)
//     return d < this.hearRadius * playerNoise
//   }

//   // ── Patrol / wander helpers ───────────────────────────────────

//   _pickRandomWaypoint() {
//     const COLS = this.grid.cols
//     const ROWS = this.grid.rows
//     for (let i = 0; i < 20; i++) {
//       const rx = Math.floor(Math.random() * COLS)
//       const ry = Math.floor(Math.random() * ROWS)
//       if (!this.grid.isWalkable(rx, ry)) continue
//       const d = this._distTo({ x: rx, y: ry })
//       if (d > 4 && d < 20) return { x: rx, y: ry }
//     }
//     for (let i = 0; i < 50; i++) {
//       const rx = Math.floor(Math.random() * COLS)
//       const ry = Math.floor(Math.random() * ROWS)
//       if (this.grid.isWalkable(rx, ry)) return { x: rx, y: ry }
//     }
//     return { x: this.tileX, y: this.tileY }
//   }

//   _buildPatrol() {
//     const order = BFS.sweep(this.grid, this.tileX, this.tileY, 40)
//     const pts   = [{ x: this.tileX, y: this.tileY }]
//     for (let i = 5; i < order.length; i += 8) pts.push(order[i])
//     return pts
//   }

//   _distTo(tile) {
//     return Math.abs(this.tileX - tile.x) + Math.abs(this.tileY - tile.y)
//   }

//   _updateColor() {
//     if (this.state === BEHAVIOR.CHASE || this.state === BEHAVIOR.BLOCK)
//       this.color = COLORS.GUARD_ALERT
//     else if (this.state === BEHAVIOR.SEARCH || this.state === BEHAVIOR.INVESTIGATE)
//       this.color = COLORS.GUARD_SEARCH
//     else
//       this.color = COLORS.GUARD_PATROL
//   }

//   // ── Render ───────────────────────────────────────────────────

//   draw(ctx, debug) {
//     const x = this.pixelX
//     const y = this.pixelY
//     const s = T * 0.88

//     // Soft vision glow behind character
//     const vColor = this.state === BEHAVIOR.CHASE || this.state === BEHAVIOR.BLOCK
//       ? '255,80,0'
//       : this.state === BEHAVIOR.SEARCH || this.state === BEHAVIOR.INVESTIGATE
//         ? '220,220,0' : '255,51,51'
//     const vGrd = ctx.createRadialGradient(x, y, 0, x, y, this.visionPx)
//     vGrd.addColorStop(0,   `rgba(${vColor},0.08)`)
//     vGrd.addColorStop(0.6, `rgba(${vColor},0.03)`)
//     vGrd.addColorStop(1,   `rgba(${vColor},0)`)
//     ctx.fillStyle = vGrd
//     ctx.beginPath()
//     ctx.arc(x, y, this.visionPx, 0, Math.PI * 2)
//     ctx.fill()

//     // Alert ! or ? above head
//     if (this.alertLevel > 0.6) {
//       const mark   = this.alertLevel > 0.85 ? '!' : '?'
//       const bounce = Math.sin(Date.now() / 150) * 3
//       ctx.font      = `bold ${Math.floor(s * 0.7)}px monospace`
//       ctx.textAlign = 'center'
//       ctx.fillStyle  = this.alertLevel > 0.85 ? '#ff3333' : '#ffcc00'
//       ctx.shadowBlur  = 8
//       ctx.shadowColor = ctx.fillStyle
//       ctx.fillText(mark, x, y - s * 1.55 + bounce)
//       ctx.shadowBlur = 0
//     }

//     ctx.save()
//     ctx.translate(x, y)
//     if (this._facingLeft) ctx.scale(-1, 1)

//     const legSwing = this._moving ? Math.sin(this._walkFrame) * 0.3 : 0
//     const bodyColor = this.state === BEHAVIOR.CHASE || this.state === BEHAVIOR.BLOCK
//       ? '#b71c1c'
//       : this.state === BEHAVIOR.SEARCH || this.state === BEHAVIOR.INVESTIGATE
//         ? '#e65100' : '#c62828'

//     // Left leg
//     ctx.save()
//     ctx.translate(-s * 0.16, s * 0.22)
//     ctx.rotate(-legSwing)
//     ctx.fillStyle = '#1a237e'
//     ctx.beginPath()
//     ctx.roundRect(-s*0.11, 0, s*0.2, s*0.42, s*0.07)
//     ctx.fill()
//     ctx.fillStyle = '#0d1117'
//     ctx.beginPath()
//     ctx.ellipse(0, s*0.43, s*0.13, s*0.08, 0, 0, Math.PI*2)
//     ctx.fill()
//     ctx.restore()

//     // Right leg
//     ctx.save()
//     ctx.translate(s * 0.16, s * 0.22)
//     ctx.rotate(legSwing)
//     ctx.fillStyle = '#1a237e'
//     ctx.beginPath()
//     ctx.roundRect(-s*0.11, 0, s*0.2, s*0.42, s*0.07)
//     ctx.fill()
//     ctx.fillStyle = '#0d1117'
//     ctx.beginPath()
//     ctx.ellipse(0, s*0.43, s*0.13, s*0.08, 0, 0, Math.PI*2)
//     ctx.fill()
//     ctx.restore()

//     // Body
//     ctx.fillStyle   = bodyColor
//     ctx.shadowBlur  = this.alertLevel > 0.5 ? 14 : 5
//     ctx.shadowColor = this.color
//     ctx.beginPath()
//     ctx.roundRect(-s*0.3, -s*0.15, s*0.6, s*0.44, s*0.12)
//     ctx.fill()
//     ctx.shadowBlur = 0

//     // Badge
//     ctx.fillStyle = '#ffd600'
//     ctx.beginPath()
//     ctx.arc(-s*0.1, s*0.04, s*0.09, 0, Math.PI*2)
//     ctx.fill()
//     ctx.fillStyle = '#0d1117'
//     ctx.font      = `bold ${Math.floor(s * 0.12)}px monospace`
//     ctx.textAlign = 'center'
//     ctx.fillText('★', -s*0.1, s*0.08)

//     // Left arm
//     const armSwing = this._moving ? Math.sin(this._walkFrame + Math.PI) * 0.35 : 0
//     ctx.save()
//     ctx.translate(-s*0.32, -s*0.08)
//     ctx.rotate(armSwing - 0.15)
//     ctx.fillStyle = bodyColor
//     ctx.beginPath()
//     ctx.roundRect(-s*0.09, 0, s*0.18, s*0.32, s*0.07)
//     ctx.fill()
//     ctx.restore()

//     // Right arm
//     ctx.save()
//     ctx.translate(s*0.32, -s*0.08)
//     ctx.rotate(-armSwing + 0.15)
//     ctx.fillStyle = bodyColor
//     ctx.beginPath()
//     ctx.roundRect(-s*0.09, 0, s*0.18, s*0.32, s*0.07)
//     ctx.fill()
//     ctx.restore()

//     // Head
//     ctx.fillStyle   = '#ffcc80'
//     ctx.shadowBlur  = 6
//     ctx.shadowColor = this.color
//     ctx.beginPath()
//     ctx.arc(0, -s*0.38, s*0.26, 0, Math.PI * 2)
//     ctx.fill()
//     ctx.shadowBlur = 0

//     // Police hat
//     ctx.fillStyle = bodyColor
//     ctx.beginPath()
//     ctx.roundRect(-s*0.28, -s*0.62, s*0.56, s*0.2, [s*0.06, s*0.06, 0, 0])
//     ctx.fill()
//     ctx.fillRect(-s*0.32, -s*0.44, s*0.64, s*0.08)
//     ctx.fillStyle = '#ffd600'
//     ctx.beginPath()
//     ctx.arc(0, -s*0.56, s*0.07, 0, Math.PI*2)
//     ctx.fill()

//     // Eyes
//     const isAlert = this.alertLevel > 0.5
//     ctx.fillStyle = isAlert ? '#b71c1c' : '#1a237e'
//     ctx.beginPath()
//     ctx.arc(-s*0.1, -s*0.4, s*0.06, 0, Math.PI*2)
//     ctx.fill()
//     ctx.beginPath()
//     ctx.arc(s*0.1, -s*0.4, s*0.06, 0, Math.PI*2)
//     ctx.fill()
//     ctx.fillStyle = 'white'
//     ctx.beginPath()
//     ctx.arc(-s*0.08, -s*0.42, s*0.022, 0, Math.PI*2)
//     ctx.fill()
//     ctx.beginPath()
//     ctx.arc(s*0.12, -s*0.42, s*0.022, 0, Math.PI*2)
//     ctx.fill()

//     // Mouth
//     ctx.strokeStyle = '#5d3a1a'
//     ctx.lineWidth   = s * 0.04
//     ctx.lineCap     = 'round'
//     ctx.beginPath()
//     if (isAlert) {
//       ctx.moveTo(-s*0.1, -s*0.28)
//       ctx.lineTo(s*0.1,  -s*0.28)
//     } else {
//       ctx.arc(0, -s*0.22, s*0.1, Math.PI + 0.3, -0.3)
//     }
//     ctx.stroke()

//     ctx.restore()

//     // Debug: A* path
//     if (debug && this.debugPath.length > 1) {
//       ctx.strokeStyle = COLORS.ASTAR_PATH
//       ctx.lineWidth   = 1.5
//       ctx.beginPath()
//       this.debugPath.forEach((p, i) => {
//         const px = p.x * T + T / 2, py = p.y * T + T / 2
//         i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
//       })
//       ctx.stroke()
//     }
//   }
// }
import { TILE_SIZE, TILE, GUARD_CFG, BEHAVIOR, COLORS } from '../game/constants.js'
import { AStar }            from '../ai/AStar.js'
import { BFS }              from '../ai/BFS.js'
import { DFS }              from '../ai/DFS.js'
import { BehaviorTree }     from '../ai/BehaviorTree.js'
import { VisibilitySystem } from './VisibilitySystem.js'
import { MultiAgentCoord }  from './MultiAgentCoord.js'

const T = TILE_SIZE

function rr(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y,     x + w, y + r,     r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x,     y + h, x,       y + h - r, r)
  ctx.lineTo(x,     y + r)
  ctx.arcTo(x,     y,     x + r,   y,         r)
  ctx.closePath()
}

export class Guard {
  constructor({ tileX, tileY, gene, id, geneIdx, grid, escapeTile, speedMult = 1, visionMult = 1 }) {
    this.tileX      = tileX
    this.tileY      = tileY
    this.pixelX     = tileX * T + T / 2
    this.pixelY     = tileY * T + T / 2

    this.gene       = gene
    this.id         = id
    this.geneIdx    = geneIdx
    this.grid       = grid
    this.escapeTile = escapeTile

    this.state           = BEHAVIOR.PATROL
    this.alertLevel      = 0
    this.lastKnownPlayer = null
    this._isHearing      = false
    this._interceptTarget = null

    this.path            = []
    this.pathIdx         = 1
    this.debugPath       = []
    this.framesSincePath = 0
    this._walkFrame      = 0
    this._moving         = false
    this._facingLeft     = false
    this._facingAngle    = 0

    this.bfsQueue  = []
    this.bfsStep   = 0
    this.dfsQueue  = []
    this.dfsStep   = 0

    this.wanderTarget = null
    this.wanderTimer  = 0

    // Smarter patrol — build waypoints near exit
    this.patrol    = this._buildSmartPatrol()
    this.patrolIdx = 0

    this.speed      = (GUARD_CFG.BASE_SPEED + gene.speedMult * 0.8) * T * speedMult
    this.visionPx   = (GUARD_CFG.BASE_VISION + gene.visionMult * 3) * T * visionMult
    this.hearRadius = (GUARD_CFG.HEAR_BASE   + gene.searchRadius * 4) * visionMult

    this.tree  = new BehaviorTree(gene)
    this.color = COLORS.GUARD_PATROL
  }

  update(dt, playerTile, playerVisible, heatmap, allGuards, ga, wantedSpeedMult = 1) {
    this.framesSincePath++
    this._isHearing = false
    this.alertLevel = Math.max(0, this.alertLevel - GUARD_CFG.ALERT_DECAY * dt * 60)

    if (playerVisible) {
      this.alertLevel      = 1
      this.lastKnownPlayer    = { ...playerTile }
      this._investigateTarget = null
      this._onPost            = false   // abandon post when player spotted
      this._postTarget        = null
      // Face toward last known position
      this._facingAngle = Math.atan2(
        playerTile.y * T - this.pixelY,
        playerTile.x * T - this.pixelX
      )
      ga.recordSpot(this.geneIdx)
      MultiAgentCoord.broadcastSighting(this, playerTile, allGuards)
    } else if (this.lastKnownPlayer) {
      // Gradually rotate vision toward last known position
      const targetAngle = Math.atan2(
        this.lastKnownPlayer.y * T - this.pixelY,
        this.lastKnownPlayer.x * T - this.pixelX
      )
      const diff = targetAngle - this._facingAngle
      const wrapped = ((diff + Math.PI) % (Math.PI * 2)) - Math.PI
      this._facingAngle += wrapped * dt * 1.5
    }

    this.state = this.tree.tick({
      guardTile:          { x: this.tileX, y: this.tileY },
      playerTile:         playerVisible ? playerTile : null,
      escapeTile:         this.escapeTile,
      lastKnown:          this.lastKnownPlayer,
      playerVisible,
      alertLevel:         this.alertLevel,
      chaseMemorySeconds: GUARD_CFG.CHASE_MEMORY,
    })

    if (this.alertLevel > 0.8)
      MultiAgentCoord.assignBlocker(allGuards, this.escapeTile)

    const target = this._resolveTarget(heatmap)

    const recalcInterval = Math.max(12, GUARD_CFG.PATH_RECALC - Math.floor(this.gene.predictionAcc * 20))
    if (target && (this.framesSincePath > recalcInterval || this.path.length === 0)) {
      this.path = AStar.findPath(this.grid, this.tileX, this.tileY, target.x, target.y)

      // A* failed — target unreachable. Pick a random road waypoint instead.
      if (this.path.length === 0 && this.state === BEHAVIOR.PATROL) {
        const fallback = this._pickRandomWaypoint()
        this.path = AStar.findPath(this.grid, this.tileX, this.tileY, fallback.x, fallback.y)
        // Advance patrol index so we don't retry the same bad waypoint forever
        this.patrolIdx++
      }

      this.pathIdx     = 1
      this.debugPath   = this.path
      this.framesSincePath = 0
    }

    this._followPath(dt, wantedSpeedMult)
    this._updateColor()
  }

  setHearing(heard) { this._isHearing = heard }

  _resolveTarget(heatmap) {
    switch (this.state) {
      case BEHAVIOR.CHASE: {
        // Use intercept target if assigned, otherwise direct chase
        if (this._interceptTarget) {
          const d = this._distTo(this._interceptTarget)
          if (d < 3) this._interceptTarget = null
          else return this._interceptTarget
        }
        // Each guard approaches from a unique angle — no stacking on same tile
        if (this.lastKnownPlayer) {
          const angle  = ((this.id ?? 0) / 8) * Math.PI * 2
          const spread = 3
          const ox     = Math.round(Math.cos(angle) * spread)
          const oy     = Math.round(Math.sin(angle) * spread)
          const tx     = this.lastKnownPlayer.x + ox
          const ty     = this.lastKnownPlayer.y + oy
          if (tx >= 0 && ty >= 0 && tx < this.grid.cols && ty < this.grid.rows && this.grid.isWalkable(tx, ty))
            return { x: tx, y: ty }
        }
        return this.lastKnownPlayer
      }

      case BEHAVIOR.BLOCK: return this.escapeTile

      case BEHAVIOR.INVESTIGATE: {
        if (!this.lastKnownPlayer) return null
        // Each guard investigates a different offset around last known position
        if (!this._investigateTarget) {
          const angle = ((this.id ?? 0) / 8) * Math.PI * 2
          const r     = 3 + ((this.id ?? 0) % 3)
          const ox    = Math.round(Math.cos(angle) * r)
          const oy    = Math.round(Math.sin(angle) * r)
          const tx    = this.lastKnownPlayer.x + ox
          const ty    = this.lastKnownPlayer.y + oy
          this._investigateTarget = (
            tx >= 0 && ty >= 0 && tx < this.grid.cols && ty < this.grid.rows && this.grid.isWalkable(tx, ty)
          ) ? { x: tx, y: ty } : { ...this.lastKnownPlayer }
        }
        if (this._distTo(this._investigateTarget) < 2) {
          this._investigateTarget = null
          if (this.gene.aggression > 0.5) {
            this.dfsQueue = DFS.sweep(this.grid, this.tileX, this.tileY, 60)
            this.dfsStep  = 0
          } else {
            this.bfsQueue = BFS.sweep(this.grid, this.tileX, this.tileY, 80)
            this.bfsStep  = 0
          }
          this.state = BEHAVIOR.SEARCH
        }
        return this._investigateTarget || this.lastKnownPlayer
      }

      case BEHAVIOR.SEARCH: {
        const queue = this.gene.aggression > 0.5 ? this.dfsQueue : this.bfsQueue
        const step  = this.gene.aggression > 0.5 ? this.dfsStep  : this.bfsStep
        if (step < queue.length) {
          const t = queue[step]
          if (this._distTo(t) < 2) {
            if (this.gene.aggression > 0.5) this.dfsStep++
            else this.bfsStep++
          }
          return t
        }
        const hot = heatmap.hottest()
        if (hot.v > 0.1) return hot
        this.state = BEHAVIOR.PATROL
        return null
      }

      case BEHAVIOR.PATROL: {
        // Post assignment — guard was sent back to exit or keycard after alert drops
        if (this._onPost && this._postTarget) {
          if (this._distTo(this._postTarget) < 3) {
            // Arrived at post — stay nearby with slow local patrol
            this._onPost    = false
            this._postTarget = null
            // Replace patrol with tight local waypoints around current position
            const local = []
            for (let attempt = 0; attempt < 40; attempt++) {
              const ox = Math.floor((Math.random() - 0.5) * 10)
              const oy = Math.floor((Math.random() - 0.5) * 10)
              const tx = this.tileX + ox
              const ty = this.tileY + oy
              if (tx > 0 && ty > 0 && tx < this.grid.cols - 1 && ty < this.grid.rows - 1
                  && this.grid.get(tx, ty) === TILE.ROAD) {
                local.push({ x: tx, y: ty })
              }
              if (local.length >= 6) break
            }
            if (local.length > 0) this.patrol = local
          } else {
            return this._postTarget
          }
        }

        if (!this.patrol.length) this.patrol = this._buildSmartPatrol()
        const wp = this.patrol[this.patrolIdx % this.patrol.length]
        if (this._distTo(wp) < 2) {
          this.patrolIdx++
        }
        return wp
      }

      default: return null
    }
  }

  _followPath(dt, speedMult = 1) {
    if (this.path.length < 2 || this.pathIdx >= this.path.length) {
      this._moving = false
      this.framesSincePath = 999
      return
    }

    const next = this.path[this.pathIdx]

    // Validate next tile — repath if unwalkable
    if (!this.grid.isWalkable(next.x, next.y)) {
      this._snapToTile()
      this.path = []
      this.framesSincePath = 999
      this._moving = false
      return
    }

    const tpx  = next.x * T + T / 2
    const tpy  = next.y * T + T / 2
    const dx   = tpx - this.pixelX
    const dy   = tpy - this.pixelY
    const dist = Math.hypot(dx, dy)
    const spd  = this.speed * speedMult * dt

    if (dist < spd + 1) {
      // Snap exactly to tile center — prevents pixel drift causing wall clips
      this.pixelX = tpx
      this.pixelY = tpy
      this.tileX  = next.x
      this.tileY  = next.y
      this.pathIdx++
      this._stuckFrames = 0
    } else {
      const ndx = dx / dist
      const ndy = dy / dist

      // Try full movement
      const nx  = this.pixelX + ndx * spd
      const ny  = this.pixelY + ndy * spd
      if (this.grid.isWalkable(Math.floor(nx / T), Math.floor(ny / T))) {
        this.pixelX = nx
        this.pixelY = ny
        this._stuckFrames = 0
      } else {
        // Try X-axis slide only
        const sx = this.pixelX + ndx * spd
        if (this.grid.isWalkable(Math.floor(sx / T), Math.floor(this.pixelY / T))) {
          this.pixelX = sx
          this._stuckFrames = 0
        }
        // Try Y-axis slide only
        else {
          const sy = this.pixelY + ndy * spd
          if (this.grid.isWalkable(Math.floor(this.pixelX / T), Math.floor(sy / T))) {
            this.pixelY = sy
            this._stuckFrames = 0
          } else {
            // Truly stuck — count frames then snap + repath
            this._stuckFrames = (this._stuckFrames || 0) + 1
            if (this._stuckFrames > 8) {
              this._snapToTile()   // snap to nearest walkable tile center
              this.path = []
              this.framesSincePath = 999
              this._stuckFrames = 0
            }
          }
        }
      }
    }

    // Always derive tile from pixel
    this.tileX = Math.floor(this.pixelX / T)
    this.tileY = Math.floor(this.pixelY / T)

    this._moving     = dist > 1
    this._facingLeft = dx < 0
    if (this._moving) {
      this._facingAngle = Math.atan2(dy, dx)
      this._stuckFrames = 0
    } else if (this.state === 'patrol' || this.state === 'search') {
      this._facingAngle += dt * 0.8
    }
    this._walkFrame += spd * 0.25
  }

  canSeePlayer(playerPixelX, playerPixelY) {
    return VisibilitySystem.hasLineOfSight(
      this.grid,
      this.pixelX, this.pixelY,
      playerPixelX, playerPixelY,
      this.visionPx
    )
  }

  hearPlayer(playerTile, playerNoise) {
    const d = Math.hypot(this.tileX - playerTile.x, this.tileY - playerTile.y)
    return d < this.hearRadius * playerNoise
  }

  // Smart patrol — mostly near exit, some random
  _buildSmartPatrol() {
    const COLS  = this.grid.cols
    const ROWS  = this.grid.rows
    const id    = this.id ?? 0
    const pts   = []

    // Divide map into a 5x4 grid of sectors
    // Each guard visits a unique rotation of sectors based on their id
    const SCOLS = 5, SROWS = 4
    const sw = Math.floor(COLS / SCOLS)
    const sh = Math.floor(ROWS / SROWS)

    // Build sector list and rotate by guard id so each guard has a different route
    const sectors = []
    for (let r = 0; r < SROWS; r++)
      for (let c = 0; c < SCOLS; c++)
        sectors.push({ c, r })

    // Rotate sector order uniquely per guard
    const rotation = (id * 3) % sectors.length
    const ordered  = [...sectors.slice(rotation), ...sectors.slice(0, rotation)]

    // Pick one road tile per sector
    for (const { c, r } of ordered) {
      const x0 = c * sw + 1
      const y0 = r * sh + 1
      const x1 = Math.min(x0 + sw - 2, COLS - 2)
      const y1 = Math.min(y0 + sh - 2, ROWS - 2)

      // Try random tiles inside this sector
      let found = false
      for (let attempt = 0; attempt < 30; attempt++) {
        const x = x0 + Math.floor(Math.random() * Math.max(1, x1 - x0))
        const y = y0 + Math.floor(Math.random() * Math.max(1, y1 - y0))
        if (this.grid.get(x, y) === TILE.ROAD) {
          pts.push({ x, y })
          found = true
          break
        }
      }
    }

    // Always add spawn tile's area and exit tile as waypoints
    pts.push({ x: this.escapeTile.x, y: this.escapeTile.y })

    return pts.length > 1 ? pts : this._fallbackPatrol()
  }

  _fallbackPatrol() {
    // Last resort: BFS from spawn, pick every 10th reachable road tile
    const COLS = this.grid.cols
    const ROWS = this.grid.rows
    const pts  = []
    for (let attempt = 0; attempt < 200; attempt++) {
      const x = 1 + Math.floor(Math.random() * (COLS - 2))
      const y = 1 + Math.floor(Math.random() * (ROWS - 2))
      if (this.grid.get(x, y) === TILE.ROAD) pts.push({ x, y })
      if (pts.length >= 8) break
    }
    return pts.length > 0 ? pts : [{ x: this.tileX, y: this.tileY }]
  }

  _pickRandomWaypoint() {
    const COLS = this.grid.cols
    const ROWS = this.grid.rows
    for (let i = 0; i < 60; i++) {
      const x = 1 + Math.floor(Math.random() * (COLS - 2))
      const y = 1 + Math.floor(Math.random() * (ROWS - 2))
      if (this.grid.get(x, y) === TILE.ROAD) return { x, y }
    }
    return { x: this.tileX, y: this.tileY }
  }

  _buildPatrol() { return this._buildSmartPatrol() }

  // Snap guard to nearest walkable tile center — escapes wall traps
  _snapToTile() {
    const cx = Math.round(this.pixelX / T)
    const cy = Math.round(this.pixelY / T)
    // Search outward in a spiral for nearest walkable tile
    for (let r = 0; r <= 3; r++) {
      for (let ox = -r; ox <= r; ox++) {
        for (let oy = -r; oy <= r; oy++) {
          if (Math.abs(ox) !== r && Math.abs(oy) !== r) continue // only check ring
          const tx = cx + ox
          const ty = cy + oy
          if (tx < 0 || ty < 0 || tx >= this.grid.cols || ty >= this.grid.rows) continue
          if (this.grid.isWalkable(tx, ty)) {
            this.tileX  = tx
            this.tileY  = ty
            this.pixelX = tx * T + T / 2
            this.pixelY = ty * T + T / 2
            return
          }
        }
      }
    }
  }
  _distTo(tile)  { return Math.abs(this.tileX - tile.x) + Math.abs(this.tileY - tile.y) }

  _updateColor() {
    if (this.state === BEHAVIOR.CHASE || this.state === BEHAVIOR.BLOCK)
      this.color = COLORS.GUARD_ALERT
    else if (this.state === BEHAVIOR.SEARCH || this.state === BEHAVIOR.INVESTIGATE)
      this.color = COLORS.GUARD_SEARCH
    else
      this.color = COLORS.GUARD_PATROL
  }

  // draw(ctx, debug) {
  //   const x = this.pixelX
  //   const y = this.pixelY
  //   const s = T * 0.88

  //   // Hearing highlight
  //   if (this._isHearing) {
  //     const pulse = 0.6 + 0.4 * Math.sin(Date.now() / 80)
  //     ctx.save()
  //     ctx.strokeStyle = `rgba(255,230,0,${pulse})`
  //     ctx.lineWidth   = 3
  //     ctx.shadowBlur  = 18
  //     ctx.shadowColor = '#ffdd00'
  //     ctx.beginPath()
  //     ctx.arc(x, y, s * 1.05, 0, Math.PI * 2)
  //     ctx.stroke()
  //     ctx.fillStyle = 'rgba(255,220,0,0.08)'
  //     ctx.beginPath()
  //     ctx.arc(x, y, s * 1.05, 0, Math.PI * 2)
  //     ctx.fill()
  //     ctx.restore()

  //     ctx.save()
  //     ctx.font      = `${Math.floor(s * 0.65)}px serif`
  //     ctx.textAlign = 'center'
  //     const bounce  = Math.sin(Date.now() / 120) * 2
  //     ctx.fillStyle   = '#ffdd00'
  //     ctx.shadowBlur  = 10
  //     ctx.shadowColor = '#ffaa00'
  //     ctx.fillText('👂', x, y - s * 1.55 + bounce)
  //     ctx.shadowBlur = 0
  //     ctx.restore()
  //   }

  //   // Alert ! or ?
  //   if (this.alertLevel > 0.6 && !this._isHearing) {
  //     const mark   = this.alertLevel > 0.85 ? '!' : '?'
  //     const bounce = Math.sin(Date.now() / 150) * 3
  //     ctx.font      = `bold ${Math.floor(s * 0.7)}px monospace`
  //     ctx.textAlign = 'center'
  //     ctx.fillStyle  = this.alertLevel > 0.85 ? '#ff3333' : '#ffcc00'
  //     ctx.shadowBlur  = 8
  //     ctx.shadowColor = ctx.fillStyle
  //     ctx.fillText(mark, x, y - s * 1.55 + bounce)
  //     ctx.shadowBlur = 0
  //   }

  //   ctx.save()
  //   ctx.translate(x, y)
  //   if (this._facingLeft) ctx.scale(-1, 1)

  //   const legSwing  = this._moving ? Math.sin(this._walkFrame) * 0.3 : 0
  //   const bodyColor = this.state === BEHAVIOR.CHASE || this.state === BEHAVIOR.BLOCK
  //     ? '#b71c1c'
  //     : this.state === BEHAVIOR.SEARCH || this.state === BEHAVIOR.INVESTIGATE
  //       ? '#e65100' : '#c62828'

  //   // Legs
  //   ctx.save()
  //   ctx.translate(-s*0.16, s*0.22)
  //   ctx.rotate(-legSwing)
  //   ctx.fillStyle = '#1a237e'
  //   rr(ctx, -s*0.11, 0, s*0.2, s*0.42, s*0.07); ctx.fill()
  //   ctx.fillStyle = '#0d1117'
  //   ctx.beginPath(); ctx.ellipse(0, s*0.43, s*0.13, s*0.08, 0, 0, Math.PI*2); ctx.fill()
  //   ctx.restore()

  //   ctx.save()
  //   ctx.translate(s*0.16, s*0.22)
  //   ctx.rotate(legSwing)
  //   ctx.fillStyle = '#1a237e'
  //   rr(ctx, -s*0.11, 0, s*0.2, s*0.42, s*0.07); ctx.fill()
  //   ctx.fillStyle = '#0d1117'
  //   ctx.beginPath(); ctx.ellipse(0, s*0.43, s*0.13, s*0.08, 0, 0, Math.PI*2); ctx.fill()
  //   ctx.restore()

  //   // Body
  //   ctx.fillStyle   = bodyColor
  //   ctx.shadowBlur  = this._isHearing ? 20 : this.alertLevel > 0.5 ? 14 : 5
  //   ctx.shadowColor = this._isHearing ? '#ffdd00' : this.color
  //   rr(ctx, -s*0.3, -s*0.15, s*0.6, s*0.44, s*0.12); ctx.fill()
  //   ctx.shadowBlur = 0

  //   // Badge
  //   ctx.fillStyle = '#ffd600'
  //   ctx.beginPath(); ctx.arc(-s*0.1, s*0.04, s*0.09, 0, Math.PI*2); ctx.fill()
  //   ctx.fillStyle = '#0d1117'
  //   ctx.font = `bold ${Math.floor(s*0.12)}px monospace`
  //   ctx.textAlign = 'center'
  //   ctx.fillText('★', -s*0.1, s*0.08)

  //   // Arms
  //   const armSwing = this._moving ? Math.sin(this._walkFrame + Math.PI) * 0.35 : 0
  //   ctx.save()
  //   ctx.translate(-s*0.32, -s*0.08); ctx.rotate(armSwing - 0.15)
  //   ctx.fillStyle = bodyColor
  //   rr(ctx, -s*0.09, 0, s*0.18, s*0.32, s*0.07); ctx.fill()
  //   ctx.restore()

  //   ctx.save()
  //   ctx.translate(s*0.32, -s*0.08); ctx.rotate(-armSwing + 0.15)
  //   ctx.fillStyle = bodyColor
  //   rr(ctx, -s*0.09, 0, s*0.18, s*0.32, s*0.07); ctx.fill()
  //   ctx.restore()

  //   // Head
  //   ctx.fillStyle   = '#ffcc80'
  //   ctx.shadowBlur  = 6
  //   ctx.shadowColor = this._isHearing ? '#ffdd00' : this.color
  //   ctx.beginPath(); ctx.arc(0, -s*0.38, s*0.26, 0, Math.PI*2); ctx.fill()
  //   ctx.shadowBlur = 0

  //   // Hat
  //   ctx.fillStyle = bodyColor
  //   rr(ctx, -s*0.28, -s*0.62, s*0.56, s*0.2, s*0.06); ctx.fill()
  //   ctx.fillRect(-s*0.32, -s*0.44, s*0.64, s*0.08)
  //   ctx.fillStyle = '#ffd600'
  //   ctx.beginPath(); ctx.arc(0, -s*0.56, s*0.07, 0, Math.PI*2); ctx.fill()

  //   // Eyes
  //   const isAlert = this.alertLevel > 0.5
  //   ctx.fillStyle = this._isHearing ? '#ff9800' : isAlert ? '#b71c1c' : '#1a237e'
  //   ctx.beginPath(); ctx.arc(-s*0.1, -s*0.4, s*0.06, 0, Math.PI*2); ctx.fill()
  //   ctx.beginPath(); ctx.arc(s*0.1, -s*0.4, s*0.06, 0, Math.PI*2); ctx.fill()
  //   ctx.fillStyle = 'white'
  //   ctx.beginPath(); ctx.arc(-s*0.08, -s*0.42, s*0.022, 0, Math.PI*2); ctx.fill()
  //   ctx.beginPath(); ctx.arc(s*0.12, -s*0.42, s*0.022, 0, Math.PI*2); ctx.fill()

  //   // Mouth
  //   ctx.strokeStyle = '#5d3a1a'
  //   ctx.lineWidth   = s * 0.04
  //   ctx.lineCap     = 'round'
  //   ctx.beginPath()
  //   if (isAlert || this._isHearing) {
  //     ctx.moveTo(-s*0.1, -s*0.28); ctx.lineTo(s*0.1, -s*0.28)
  //   } else {
  //     ctx.arc(0, -s*0.22, s*0.1, Math.PI + 0.3, -0.3)
  //   }
  //   ctx.stroke()
  //   ctx.restore()

  //   if (debug && this.debugPath.length > 1) {
  //     ctx.strokeStyle = COLORS.ASTAR_PATH
  //     ctx.lineWidth   = 1.5
  //     ctx.beginPath()
  //     this.debugPath.forEach((p, i) => {
  //       const px = p.x*T+T/2, py = p.y*T+T/2
  //       i === 0 ? ctx.moveTo(px,py) : ctx.lineTo(px,py)
  //     })
  //     ctx.stroke()
  //   }
  // }
  draw(ctx, debug) {
    const x = this.pixelX
    const y = this.pixelY
    const s = T * 0.88

    // Alert ! or ? above head — only when alert, no hearing ring
    if (this.alertLevel > 0.6) {
      const mark   = this.alertLevel > 0.85 ? '!' : '?'
      const bounce = Math.sin(Date.now() / 150) * 3
      ctx.font      = `bold ${Math.floor(s * 0.7)}px monospace`
      ctx.textAlign = 'center'
      ctx.fillStyle  = this.alertLevel > 0.85 ? '#ff3333' : '#ffcc00'
      ctx.shadowBlur  = 8
      ctx.shadowColor = ctx.fillStyle
      ctx.fillText(mark, x, y - s * 1.55 + bounce)
      ctx.shadowBlur = 0
    }

    ctx.save()
    ctx.translate(x, y)
    if (this._facingLeft) ctx.scale(-1, 1)

    const legSwing  = this._moving ? Math.sin(this._walkFrame) * 0.3 : 0
    const bodyColor = this.state === BEHAVIOR.CHASE || this.state === BEHAVIOR.BLOCK
      ? '#b71c1c'
      : this.state === BEHAVIOR.SEARCH || this.state === BEHAVIOR.INVESTIGATE
        ? '#e65100' : '#c62828'

    // Left leg
    ctx.save()
    ctx.translate(-s*0.16, s*0.22)
    ctx.rotate(-legSwing)
    ctx.fillStyle = '#1a237e'
    rr(ctx, -s*0.11, 0, s*0.2, s*0.42, s*0.07); ctx.fill()
    ctx.fillStyle = '#0d1117'
    ctx.beginPath(); ctx.ellipse(0, s*0.43, s*0.13, s*0.08, 0, 0, Math.PI*2); ctx.fill()
    ctx.restore()

    // Right leg
    ctx.save()
    ctx.translate(s*0.16, s*0.22)
    ctx.rotate(legSwing)
    ctx.fillStyle = '#1a237e'
    rr(ctx, -s*0.11, 0, s*0.2, s*0.42, s*0.07); ctx.fill()
    ctx.fillStyle = '#0d1117'
    ctx.beginPath(); ctx.ellipse(0, s*0.43, s*0.13, s*0.08, 0, 0, Math.PI*2); ctx.fill()
    ctx.restore()

    // Body
    ctx.fillStyle   = bodyColor
    ctx.shadowBlur  = this.alertLevel > 0.5 ? 10 : 4
    ctx.shadowColor = this.color
    rr(ctx, -s*0.3, -s*0.15, s*0.6, s*0.44, s*0.12); ctx.fill()
    ctx.shadowBlur = 0

    // Badge
    ctx.fillStyle = '#ffd600'
    ctx.beginPath(); ctx.arc(-s*0.1, s*0.04, s*0.09, 0, Math.PI*2); ctx.fill()
    ctx.fillStyle = '#0d1117'
    ctx.font = `bold ${Math.floor(s*0.12)}px monospace`
    ctx.textAlign = 'center'
    ctx.fillText('★', -s*0.1, s*0.08)

    // Arms
    const armSwing = this._moving ? Math.sin(this._walkFrame + Math.PI) * 0.35 : 0
    ctx.save()
    ctx.translate(-s*0.32, -s*0.08); ctx.rotate(armSwing - 0.15)
    ctx.fillStyle = bodyColor
    rr(ctx, -s*0.09, 0, s*0.18, s*0.32, s*0.07); ctx.fill()
    ctx.restore()

    ctx.save()
    ctx.translate(s*0.32, -s*0.08); ctx.rotate(-armSwing + 0.15)
    ctx.fillStyle = bodyColor
    rr(ctx, -s*0.09, 0, s*0.18, s*0.32, s*0.07); ctx.fill()
    ctx.restore()

    // Head
    ctx.fillStyle   = '#ffcc80'
    ctx.shadowBlur  = 4
    ctx.shadowColor = this.color
    ctx.beginPath(); ctx.arc(0, -s*0.38, s*0.26, 0, Math.PI*2); ctx.fill()
    ctx.shadowBlur = 0

    // Hat
    ctx.fillStyle = bodyColor
    rr(ctx, -s*0.28, -s*0.62, s*0.56, s*0.2, s*0.06); ctx.fill()
    ctx.fillRect(-s*0.32, -s*0.44, s*0.64, s*0.08)
    ctx.fillStyle = '#ffd600'
    ctx.beginPath(); ctx.arc(0, -s*0.56, s*0.07, 0, Math.PI*2); ctx.fill()

    // Eyes
    const isAlert = this.alertLevel > 0.5
    ctx.fillStyle = isAlert ? '#b71c1c' : '#1a237e'
    ctx.beginPath(); ctx.arc(-s*0.1, -s*0.4, s*0.06, 0, Math.PI*2); ctx.fill()
    ctx.beginPath(); ctx.arc(s*0.1, -s*0.4, s*0.06, 0, Math.PI*2); ctx.fill()
    ctx.fillStyle = 'white'
    ctx.beginPath(); ctx.arc(-s*0.08, -s*0.42, s*0.022, 0, Math.PI*2); ctx.fill()
    ctx.beginPath(); ctx.arc(s*0.12, -s*0.42, s*0.022, 0, Math.PI*2); ctx.fill()

    // Mouth
    ctx.strokeStyle = '#5d3a1a'
    ctx.lineWidth   = s * 0.04
    ctx.lineCap     = 'round'
    ctx.beginPath()
    if (isAlert) {
      ctx.moveTo(-s*0.1, -s*0.28); ctx.lineTo(s*0.1, -s*0.28)
    } else {
      ctx.arc(0, -s*0.22, s*0.1, Math.PI + 0.3, -0.3)
    }
    ctx.stroke()
    ctx.restore()

    // Debug A* path
    if (debug && this.debugPath.length > 1) {
      ctx.strokeStyle = COLORS.ASTAR_PATH
      ctx.lineWidth   = 1.5
      ctx.beginPath()
      this.debugPath.forEach((p, i) => {
        const px = p.x*T+T/2, py = p.y*T+T/2
        i === 0 ? ctx.moveTo(px,py) : ctx.lineTo(px,py)
      })
      ctx.stroke()
    }
  }
}