// // // // import { CityGenerator }   from '../world/CityGenerator.js'
// // // // import { Tilemap }          from '../world/Tilemap.js'
// // // // import { Player }           from '../player/Player.js'
// // // // import { Guard }            from '../systems/Guard.js'
// // // // import { HeatMap }          from '../ai/HeatMap.js'
// // // // import { GeneticAlgorithm } from '../ai/GeneticAlgorithm.js'
// // // // import { EventBus }         from '../systems/EventBus.js'
// // // // import { ScreenShake }      from '../systems/ScreenShake.js'
// // // // import { Spotlight }        from '../systems/Spotlight.js'
// // // // import { KeycardSystem }    from '../systems/KeycardSystem.js'
// // // // import { WantedSystem }     from '../systems/WantedSystem.js'
// // // // import { CANVAS, ROUND_CFG, TILE_SIZE, TILE } from './constants.js'

// // // // const T = TILE_SIZE

// // // // export class Game {
// // // //   constructor(canvas) {
// // // //     this.canvas = canvas
// // // //     this.ctx    = canvas.getContext('2d')
// // // //     canvas.width  = CANVAS.WIDTH
// // // //     canvas.height = CANVAS.HEIGHT

// // // //     this.state   = 'menu'
// // // //     this.round   = 1
// // // //     this.escaped = 0
// // // //     this.keys    = {}
// // // //     this.debug   = false

// // // //     this.ga          = new GeneticAlgorithm()
// // // //     this.heatmap     = new HeatMap()
// // // //     this.screenShake = new ScreenShake()
// // // //     this.keycard     = new KeycardSystem()
// // // //     this.wanted      = new WantedSystem()

// // // //     this._wasSpotted  = false
// // // //     this._radioLines  = []
// // // //     this._hearingRings = []
// // // //     this._lightsOut   = false
// // // //     this._sewers      = []

// // // //     this._loop   = this._loop.bind(this)
// // // //     this._lastTs = null
// // // //     this._rafId  = null

// // // //     this._bindKeys()
// // // //   }

// // // //   startRound() {
// // // //     const { grid, playerStart, escapePoint, guardSpawns, sewers, keycardPos } =
// // // //       CityGenerator.generate(Date.now())

// // // //     this.grid        = grid
// // // //     this.escapePoint = escapePoint
// // // //     this._sewers     = sewers || []
// // // //     this.player      = new Player(playerStart.x, playerStart.y)
// // // //     this.heatmap.reset()
// // // //     this.keycard.reset(keycardPos)
// // // //     this.wanted.reset()
// // // //     this._radioLines  = []
// // // //     this._hearingRings = []
// // // //     this._wasSpotted  = false
// // // //     this._lightsOut   = false

// // // //     const numGuards = Math.min(
// // // //       ROUND_CFG.INITIAL_GUARDS + (this.round - 1) * ROUND_CFG.GUARDS_PER_ROUND,
// // // //       ROUND_CFG.MAX_GUARDS
// // // //     )

// // // //     this.guards = guardSpawns.slice(0, numGuards).map((sp, i) =>
// // // //       new Guard({
// // // //         tileX:      sp.x,
// // // //         tileY:      sp.y,
// // // //         gene:       this.ga.geneFor(i),
// // // //         id:         i,
// // // //         geneIdx:    i % this.ga.population.length,
// // // //         grid,
// // // //         escapeTile: escapePoint,
// // // //       })
// // // //     )

// // // //     this.timeLeft = ROUND_CFG.TIME_LIMIT
// // // //     this._lastTs  = null
// // // //     this.state    = 'playing'

// // // //     if (this._rafId) cancelAnimationFrame(this._rafId)
// // // //     this._rafId = requestAnimationFrame(this._loop)
// // // //   }

// // // //   stop() {
// // // //     if (this._rafId) cancelAnimationFrame(this._rafId)
// // // //     this._rafId = null
// // // //   }

// // // //   _loop(ts) {
// // // //     if (this.state !== 'playing') return
// // // //     const dt = this._lastTs
// // // //       ? Math.min((ts - this._lastTs) / 1000, 0.05)
// // // //       : 0.016
// // // //     this._lastTs   = ts
// // // //     this.timeLeft -= dt
// // // //     this._update(dt)
// // // //     this._render(dt)
// // // //     this._rafId = requestAnimationFrame(this._loop)
// // // //   }

// // // //   _update(dt) {
// // // //     this.player.update(dt, this.grid, this.keys)

// // // //     // Lights out
// // // //     this._lightsOut = this.timeLeft <= ROUND_CFG.LIGHTS_OUT_AT
// // // //     if (this._lightsOut) {
// // // //       this.player.visionPx = Math.max(
// // // //         TILE_SIZE * 3,
// // // //         this.player.visionPx - dt * TILE_SIZE * 0.5
// // // //       )
// // // //     }

// // // //     // Keycard pickup
// // // //     const justCollected = this.keycard.update(
// // // //       this.player.tileX, this.player.tileY, this.grid
// // // //     )
// // // //     if (justCollected) this.screenShake.shake(0.3)

// // // //     // Wanted level
// // // //     this.wanted.update(dt, this._wasSpotted)

// // // //     // Sewer teleport
// // // //     this._checkSewer()

// // // //     this.heatmap.decay()
// // // //     if (Math.random() < 0.016) this.heatmap.spread()

// // // //     const pTile    = { x: this.player.tileX, y: this.player.tileY }
// // // //     let anySpotted = false
// // // //     let spotter    = null

// // // //     for (const g of this.guards) {
// // // //       const visible = g.canSeePlayer(this.player.pixelX, this.player.pixelY)
// // // //       const heard   = g.hearPlayer(pTile, this.player.noise)

// // // //       if (visible) { anySpotted = true; spotter = g }

// // // //       g.setHearing(heard)

// // // //       if (heard) {
// // // //         g.alertLevel = Math.min(1, g.alertLevel + 0.05)
// // // //         if (g.alertLevel > 0.5 && !g.lastKnownPlayer)
// // // //           g.lastKnownPlayer = { ...pTile }
// // // //         if (g.alertLevel > 0.5 && (g.alertLevel - 0.05) <= 0.5)
// // // //           this.screenShake.shake(0.25)
// // // //         this._hearingRings.push({
// // // //           x: g.pixelX, y: g.pixelY,
// // // //           radius: T * 0.5, life: 1.0,
// // // //         })
// // // //       }

// // // //       g.update(dt, pTile, visible, this.heatmap, this.guards, this.ga, this.wanted.speedMult)
// // // //     }

// // // //     // Hearing rings decay
// // // //     for (const r of this._hearingRings) {
// // // //       r.radius += dt * T * 12
// // // //       r.life   -= dt * 2.5
// // // //     }
// // // //     this._hearingRings = this._hearingRings.filter(r => r.life > 0)

// // // //     if (anySpotted && !this._wasSpotted) this.screenShake.shake(0.7)
// // // //     this._wasSpotted = anySpotted

// // // //     // // Radio lines
// // // //     // if (anySpotted && spotter) {
// // // //     //   this._radioLines = this.guards
// // // //     //     .filter(g => g !== spotter)
// // // //     //     .map(g => ({ x1: spotter.pixelX, y1: spotter.pixelY, x2: g.pixelX, y2: g.pixelY, life: 1.0 }))
// // // //     // }
// // // //     // if (this._radioLines.length) {
// // // //     //   this._radioLines.forEach(l => l.life -= dt * 1.8)
// // // //     //   this._radioLines = this._radioLines.filter(l => l.life > 0)
// // // //     // }

// // // //     if (anySpotted) this.heatmap.spike(pTile.x, pTile.y, 5)
// // // //     else if (Math.random() < 0.01) this.heatmap.spike(pTile.x, pTile.y, 1)

// // // //     this.globalAlert = anySpotted

// // // //     // Caught
// // // //     const caught = this.guards.some(g =>
// // // //       Math.hypot(g.pixelX - this.player.pixelX, g.pixelY - this.player.pixelY) < T * 0.85
// // // //     )
// // // //     if (caught) {
// // // //       this.screenShake.shake(1.0)
// // // //       this.guards.forEach(g => {
// // // //         if (Math.hypot(g.pixelX - this.player.pixelX, g.pixelY - this.player.pixelY) < T * 0.85)
// // // //           this.ga.recordCapture(g.geneIdx)
// // // //       })
// // // //       this._endRound('caught')
// // // //       return
// // // //     }

// // // //     // Escape — only if keycard collected
// // // //     const distToEscape = Math.hypot(
// // // //       this.player.pixelX - (this.escapePoint.x * T + T / 2),
// // // //       this.player.pixelY - (this.escapePoint.y * T + T / 2)
// // // //     )
// // // //     if (distToEscape < T * 1.2) {
// // // //       if (!this.keycard.isUnlocked) {
// // // //         // Flash warning — no keycard
// // // //         this.screenShake.shake(0.2)
// // // //       } else {
// // // //         this.escaped++
// // // //         this._endRound('escaped')
// // // //         return
// // // //       }
// // // //     }

// // // //     if (this.timeLeft <= 0) this._endRound('timeout')
// // // //   }

// // // //   _checkSewer() {
// // // //     if (this._sewers.length < 2) return
// // // //     if (this._sewerCooldown > 0) {
// // // //       this._sewerCooldown -= 0.016
// // // //       return
// // // //     }
// // // //     const [s1, s2] = this._sewers
// // // //     const onS1 = Math.abs(this.player.tileX - s1.x) <= 1 && Math.abs(this.player.tileY - s1.y) <= 1
// // // //     const onS2 = Math.abs(this.player.tileX - s2.x) <= 1 && Math.abs(this.player.tileY - s2.y) <= 1

// // // //     if (onS1 || onS2) {
// // // //       const dest = onS1 ? s2 : s1
// // // //       this.player.pixelX = dest.x * T + T / 2
// // // //       this.player.pixelY = dest.y * T + T / 2
// // // //       this.player.tileX  = dest.x
// // // //       this.player.tileY  = dest.y
// // // //       this._sewerCooldown = 2.0
// // // //       this.screenShake.shake(0.4)
// // // //       // Sewer makes noise — alert nearby guards
// // // //       this.heatmap.spike(dest.x, dest.y, 8)
// // // //     }
// // // //   }

// // // //   // _render(dt = 0.016) {
// // // //   //   const { ctx, grid, player, guards, heatmap, debug } = this

// // // //   //   const shake = this.screenShake.update(dt)
// // // //   //   ctx.save()
// // // //   //   ctx.translate(shake.x, shake.y)
// // // //   //   ctx.clearRect(-30, -30, CANVAS.WIDTH + 60, CANVAS.HEIGHT + 60)

// // // //   //   // 1. Tiles (with lights out flag)
// // // //   //   Tilemap.draw(ctx, grid, this._lightsOut)

// // // //   //   // 2. Heatmap debug
// // // //   //   if (debug) Tilemap.drawHeatmap(ctx, heatmap, grid)

// // // //   //   // 3. Red zone warning overlay
// // // //   //   this._drawRedZoneWarning(ctx, grid)

// // // //   //   // 4. Spotlights before fog
// // // //   //   for (const g of guards) {
// // // //   //     Spotlight.draw(ctx, g.pixelX, g.pixelY, g._facingAngle ?? 0, g.visionPx, g.alertLevel, g.state)
// // // //   //   }

// // // //   //   // 5. Fog
// // // //   //   if (!debug) {
// // // //   //     const visionR = this._lightsOut
// // // //   //       ? player.visionPx * 0.55
// // // //   //       : player.visionPx
// // // //   //     Tilemap.drawFog(ctx, player.pixelX, player.pixelY, visionR, CANVAS.WIDTH, CANVAS.HEIGHT)
// // // //   //   }

// // // //   //   // 6. Hearing rings
// // // //   //   this._drawHearingRings(ctx)

// // // //   //   // 7. Radio lines
// // // //   //   this._drawRadioLines(ctx)

// // // //   //   // 8. Sprites
// // // //   //   for (const g of guards) g.draw(ctx, debug)
// // // //   //   player.draw(ctx)

// // // //   //   // 9. Escape UI
// // // //   //   this._drawEscapeUI(ctx)

// // // //   //   // 10. Lights out warning
// // // //   //   if (this._lightsOut) this._drawLightsOutOverlay(ctx)

// // // //   //   // 11. Red vignette when spotted
// // // //   //   if (this._wasSpotted) {
// // // //   //     const pulse = 0.15 + 0.08 * Math.sin(Date.now() / 80)
// // // //   //     ctx.fillStyle = `rgba(255,0,0,${pulse})`
// // // //   //     ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)
// // // //   //   }

// // // //   //   ctx.restore()
// // // //   // }
// // // //   _render(dt = 0.016) {
// // // //   const { ctx, grid, player, guards, heatmap, debug } = this

// // // //   const shake = this.screenShake.update(dt)
// // // //   ctx.save()
// // // //   ctx.translate(shake.x, shake.y)
// // // //   ctx.clearRect(-30, -30, CANVAS.WIDTH + 60, CANVAS.HEIGHT + 60)

// // // //   // 1. City tiles (keycard drawn here gets covered by fog — intentional)
// // // //   Tilemap.draw(ctx, grid, this._lightsOut)

// // // //   // 2. Heatmap debug
// // // //   if (debug) Tilemap.drawHeatmap(ctx, heatmap, grid)

// // // //   // 3. Red zone warning
// // // //   this._drawRedZoneWarning(ctx, grid)

// // // //   // 4. Spotlights before fog
// // // //   for (const g of guards) {
// // // //     Spotlight.draw(ctx, g.pixelX, g.pixelY, g._facingAngle ?? 0, g.visionPx, g.alertLevel, g.state)
// // // //   }

// // // //   // 5. Fog
// // // //   if (!debug) {
// // // //     const visionR = this._lightsOut ? player.visionPx * 0.55 : player.visionPx
// // // //     Tilemap.drawFog(ctx, player.pixelX, player.pixelY, visionR, CANVAS.WIDTH, CANVAS.HEIGHT)
// // // //   }

// // // //   // 6. Keycard drawn AFTER fog — always visible through darkness
// // // //   if (!this.keycard.collected) this._drawKeycardAboveFog(ctx)

// // // //   // 7. Hearing rings
// // // //   this._drawHearingRings(ctx)

// // // //   // 8. Radio lines
// // // //   this._drawRadioLines(ctx)

// // // //   // 9. Sprites
// // // //   for (const g of guards) g.draw(ctx, debug)
// // // //   player.draw(ctx)

// // // //   // 10. Escape UI always on top
// // // //   this._drawEscapeUI(ctx)

// // // //   // 11. Lights out overlay
// // // //   if (this._lightsOut) this._drawLightsOutOverlay(ctx)

// // // //   // 12. Red vignette when spotted
// // // //   if (this._wasSpotted) {
// // // //     const pulse = 0.15 + 0.08 * Math.sin(Date.now() / 80)
// // // //     ctx.fillStyle = `rgba(255,0,0,${pulse})`
// // // //     ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)
// // // //   }

// // // //   ctx.restore()
// // // // }

// // // // _drawKeycardAboveFog(ctx) {
// // // //   const pos = this.keycard.pos
// // // //   if (!pos) return

// // // //   const cx  = pos.x * TILE_SIZE + TILE_SIZE / 2
// // // //   const cy  = pos.y * TILE_SIZE + TILE_SIZE / 2
// // // //   const now = Date.now()
// // // //   const bob = Math.sin(now / 400) * 3

// // // //   // Bright background tile so it punches through fog
// // // //   ctx.fillStyle = 'rgba(255,220,0,0.25)'
// // // //   ctx.fillRect(pos.x * TILE_SIZE, pos.y * TILE_SIZE, TILE_SIZE, TILE_SIZE)

// // // //   // Outer pulsing ring
// // // //   const pulse = 0.5 + 0.5 * Math.sin(now / 300)
// // // //   ctx.strokeStyle = `rgba(255,220,0,${0.6 + pulse * 0.4})`
// // // //   ctx.lineWidth   = 2
// // // //   ctx.shadowBlur  = 16
// // // //   ctx.shadowColor = '#ffdd00'
// // // //   ctx.beginPath()
// // // //   ctx.arc(cx, cy, TILE_SIZE * (0.9 + pulse * 0.3), 0, Math.PI * 2)
// // // //   ctx.stroke()
// // // //   ctx.shadowBlur = 0

// // // //   // Key emoji floating above
// // // //   ctx.font      = `${Math.floor(TILE_SIZE * 0.9)}px serif`
// // // //   ctx.textAlign = 'center'
// // // //   ctx.shadowBlur  = 14
// // // //   ctx.shadowColor = '#ffdd00'
// // // //   ctx.fillText('🗝️', cx, cy + TILE_SIZE * 0.3 + bob)
// // // //   ctx.shadowBlur = 0

// // // //   // "KEY" label above it
// // // //   ctx.font        = `bold ${Math.floor(TILE_SIZE * 0.55)}px 'Orbitron', monospace`
// // // //   ctx.fillStyle   = '#ffdd00'
// // // //   ctx.shadowBlur  = 8
// // // //   ctx.shadowColor = '#ffaa00'
// // // //   ctx.fillText('KEY', cx, cy - TILE_SIZE * 0.8 + bob)
// // // //   ctx.shadowBlur = 0

// // // //   // Bouncing arrow pointing down to key
// // // //   const arrowBob = Math.sin(now / 250) * 4
// // // //   ctx.fillStyle   = '#ffdd00'
// // // //   ctx.shadowBlur  = 8
// // // //   ctx.shadowColor = '#ffaa00'
// // // //   ctx.beginPath()
// // // //   ctx.moveTo(cx,                  cy - TILE_SIZE * 1.2 + arrowBob)
// // // //   ctx.lineTo(cx - TILE_SIZE * 0.25, cy - TILE_SIZE * 1.5 + arrowBob)
// // // //   ctx.lineTo(cx + TILE_SIZE * 0.25, cy - TILE_SIZE * 1.5 + arrowBob)
// // // //   ctx.closePath()
// // // //   ctx.fill()
// // // //   ctx.shadowBlur = 0
// // // // }

// // // //   _drawRedZoneWarning(ctx, grid) {
// // // //     // Pulse red tint on redzone tiles visible to player
// // // //     const pulse = 0.08 + 0.04 * Math.sin(Date.now() / 400)
// // // //     for (let y = 0; y < grid.rows; y++) {
// // // //       for (let x = 0; x < grid.cols; x++) {
// // // //         if (grid.get(x, y) === TILE.REDZONE) {
// // // //           ctx.fillStyle = `rgba(200,0,0,${pulse})`
// // // //           ctx.fillRect(x * T, y * T, T, T)
// // // //         }
// // // //       }
// // // //     }
// // // //   }

// // // //   _drawHearingRings(ctx) {
// // // //     for (const r of this._hearingRings) {
// // // //       ctx.save()
// // // //       ctx.globalAlpha = r.life * 0.7
// // // //       ctx.strokeStyle = `rgba(255,220,0,${r.life})`
// // // //       ctx.lineWidth   = 1.5
// // // //       ctx.shadowBlur  = 8
// // // //       ctx.shadowColor = '#ffcc00'
// // // //       ctx.beginPath()
// // // //       ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2)
// // // //       ctx.stroke()
// // // //       ctx.restore()
// // // //     }
// // // //   }

// // // //   _drawRadioLines(ctx) {
// // // //     if (!this._radioLines?.length) return
// // // //     for (const line of this._radioLines) {
// // // //       ctx.save()
// // // //       ctx.globalAlpha = line.life * 0.9
// // // //       ctx.strokeStyle = '#ff3333'
// // // //       ctx.lineWidth   = 1.5
// // // //       ctx.setLineDash([4, 4])
// // // //       ctx.shadowBlur  = 6
// // // //       ctx.shadowColor = '#ff3333'
// // // //       ctx.beginPath()
// // // //       ctx.moveTo(line.x1, line.y1)
// // // //       ctx.lineTo(line.x2, line.y2)
// // // //       ctx.stroke()
// // // //       ctx.setLineDash([])
// // // //       ctx.fillStyle   = `rgba(255,200,0,${line.life})`
// // // //       ctx.shadowBlur  = 10
// // // //       ctx.shadowColor = '#ffcc00'
// // // //       ctx.beginPath()
// // // //       ctx.arc(line.x2, line.y2 - T * 0.9, T * 0.18, 0, Math.PI * 2)
// // // //       ctx.fill()
// // // //       ctx.restore()
// // // //     }
// // // //   }

// // // //   _drawEscapeUI(ctx) {
// // // //     const ex  = this.escapePoint
// // // //     if (!ex) return
// // // //     const cx  = ex.x * T + T / 2
// // // //     const cy  = ex.y * T + T / 2
// // // //     const now = Date.now()
// // // //     const locked = !this.keycard.isUnlocked

// // // //     // Base tile
// // // //     ctx.fillStyle = locked ? 'rgba(255,80,0,0.4)' : 'rgba(0,255,136,0.5)'
// // // //     ctx.fillRect(ex.x * T, ex.y * T, T, T)

// // // //     const color  = locked ? '255,80,0' : '0,255,136'
// // // //     const hex    = locked ? '#ff5000'  : '#00ff88'

// // // //     const pulse1 = 0.5 + 0.5 * Math.sin(now / 350)
// // // //     ctx.strokeStyle = `rgba(${color},${0.6 + pulse1 * 0.4})`
// // // //     ctx.lineWidth   = 2.5
// // // //     ctx.shadowBlur  = 20
// // // //     ctx.shadowColor = hex
// // // //     ctx.beginPath()
// // // //     ctx.arc(cx, cy, T * (1.1 + pulse1 * 0.4), 0, Math.PI * 2)
// // // //     ctx.stroke()
// // // //     ctx.shadowBlur = 0

// // // //     // Label
// // // //     ctx.font      = `bold ${T - 2}px 'Orbitron', monospace`
// // // //     ctx.textAlign = 'center'
// // // //     const label   = locked ? '🔒 KEY?' : 'EXIT'
// // // //     const labelY  = cy - T * 1.9
// // // //     ctx.fillStyle = 'rgba(0,0,0,0.9)'
// // // //     ctx.fillText(label, cx + 1, labelY + 1)
// // // //     ctx.fillStyle   = hex
// // // //     ctx.shadowBlur  = 14
// // // //     ctx.shadowColor = hex
// // // //     ctx.fillText(label, cx, labelY)
// // // //     ctx.shadowBlur = 0

// // // //     // Arrow (only when unlocked)
// // // //     if (!locked) {
// // // //       const arrowBob = Math.sin(now / 280) * 4
// // // //       ctx.fillStyle   = '#00ff88'
// // // //       ctx.shadowBlur  = 10
// // // //       ctx.shadowColor = '#00ff88'
// // // //       ctx.beginPath()
// // // //       ctx.moveTo(cx,           cy - T * 1.0 + arrowBob)
// // // //       ctx.lineTo(cx - T * 0.3, cy - T * 1.4 + arrowBob)
// // // //       ctx.lineTo(cx + T * 0.3, cy - T * 1.4 + arrowBob)
// // // //       ctx.closePath()
// // // //       ctx.fill()
// // // //       ctx.shadowBlur = 0
// // // //     }
// // // //   }

// // // //   _drawLightsOutOverlay(ctx) {
// // // //     // Dark vignette around edges
// // // //     const grd = ctx.createRadialGradient(
// // // //       CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2, CANVAS.HEIGHT * 0.2,
// // // //       CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2, CANVAS.HEIGHT * 0.8
// // // //     )
// // // //     grd.addColorStop(0, 'rgba(0,0,0,0)')
// // // //     grd.addColorStop(1, 'rgba(0,0,10,0.7)')
// // // //     ctx.fillStyle = grd
// // // //     ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)

// // // //     // Warning text
// // // //     const alpha = 0.5 + 0.5 * Math.sin(Date.now() / 500)
// // // //     ctx.font      = `bold ${T}px 'Orbitron', monospace`
// // // //     ctx.textAlign = 'center'
// // // //     ctx.fillStyle = `rgba(100,100,255,${alpha})`
// // // //     ctx.shadowBlur  = 12
// // // //     ctx.shadowColor = '#4444ff'
// // // //     ctx.fillText('⚡ LIGHTS OUT', CANVAS.WIDTH / 2, 60)
// // // //     ctx.shadowBlur = 0
// // // //   }

// // // //   _endRound(result) {
// // // //     this.stop()
// // // //     this.state = 'end'
// // // //     this.ga.evolve()
// // // //     EventBus.emit('round:end', {
// // // //       result,
// // // //       round:      this.round,
// // // //       generation: this.ga.generation,
// // // //       escaped:    this.escaped,
// // // //       guards:     this.guards.length,
// // // //       bestGene:   this.ga.best,
// // // //       gaHistory:  this.ga.history,
// // // //     })
// // // //     this.round++
// // // //   }

// // // //   // _bindKeys() {
// // // //   //   const BLOCK_SCROLL = new Set([
// // // //   //     'ArrowUp','ArrowDown','ArrowLeft','ArrowRight',
// // // //   //     'Space','Tab','PageUp','PageDown','Home','End',
// // // //   //   ])
// // // //   //   window.addEventListener('keydown', e => {
// // // //   //     if (BLOCK_SCROLL.has(e.code)) e.preventDefault()
// // // //   //     this.keys[e.code] = true
// // // //   //     if (e.code === 'Tab') this.debug = !this.debug
// // // //   //   })
// // // //   //   window.addEventListener('keyup', e => { this.keys[e.code] = false })
// // // //   // }
// // // //   _bindKeys() {
// // // //   const BLOCK_SCROLL = new Set([
// // // //     'ArrowUp','ArrowDown','ArrowLeft','ArrowRight',
// // // //     'Space','Tab','PageUp','PageDown','Home','End',
// // // //   ])
// // // //   window.addEventListener('keydown', e => {
// // // //     if (BLOCK_SCROLL.has(e.code)) e.preventDefault()
// // // //     this.keys[e.code] = true
// // // //     if (e.code === 'Tab') this.debug = !this.debug
// // // //   })
// // // //   window.addEventListener('keyup', e => { this.keys[e.code] = false })
// // // // }

// // // //   drawMenuPreview() {
// // // //     const { grid } = CityGenerator.generate(42)
// // // //     this.ctx.clearRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)
// // // //     Tilemap.draw(this.ctx, grid)
// // // //     this.ctx.fillStyle = 'rgba(5,5,8,0.65)'
// // // //     this.ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)
// // // //   }
// // // // }

// // // // import { CityGenerator }   from '../world/CityGenerator.js'
// // // // import { Tilemap }          from '../world/Tilemap.js'
// // // // import { Player }           from '../player/Player.js'
// // // // import { Guard }            from '../systems/Guard.js'
// // // // import { HeatMap }          from '../ai/HeatMap.js'
// // // // import { GeneticAlgorithm } from '../ai/GeneticAlgorithm.js'
// // // // import { EventBus }         from '../systems/EventBus.js'
// // // // import { ScreenShake }      from '../systems/ScreenShake.js'
// // // // import { Spotlight }        from '../systems/Spotlight.js'
// // // // import { KeycardSystem }    from '../systems/KeycardSystem.js'
// // // // import { WantedSystem }     from '../systems/WantedSystem.js'
// // // // import { CANVAS, ROUND_CFG, TILE_SIZE, TILE } from './constants.js'

// // // // const T = TILE_SIZE

// // // // export class Game {
// // // //   constructor(canvas) {
// // // //     this.canvas = canvas
// // // //     this.ctx    = canvas.getContext('2d')
// // // //     canvas.width  = CANVAS.WIDTH
// // // //     canvas.height = CANVAS.HEIGHT

// // // //     this.state   = 'menu'
// // // //     this.round   = 1
// // // //     this.escaped = 0
// // // //     this.keys    = {}
// // // //     this.debug   = false

// // // //     this.ga          = new GeneticAlgorithm()
// // // //     this.heatmap     = new HeatMap()
// // // //     this.screenShake = new ScreenShake()
// // // //     this.keycard     = new KeycardSystem()
// // // //     this.wanted      = new WantedSystem()

// // // //     this._wasSpotted  = false
// // // //     this._radioLines  = []
// // // //     this._hearingRings = []
// // // //     this._lightsOut   = false
// // // //     this._sewers      = []

// // // //     this._loop   = this._loop.bind(this)
// // // //     this._lastTs = null
// // // //     this._rafId  = null

// // // //     this._bindKeys()
// // // //   }

// // // //   startRound() {
// // // //     const { grid, playerStart, escapePoint, guardSpawns, sewers, keycardPos } =
// // // //       CityGenerator.generate(Date.now())

// // // //     this.grid        = grid
// // // //     this.escapePoint = escapePoint
// // // //     this._sewers     = sewers || []
// // // //     this.player      = new Player(playerStart.x, playerStart.y)
// // // //     this.heatmap.reset()
// // // //     this.keycard.reset(keycardPos)
// // // //     this.wanted.reset()
// // // //     this._radioLines  = []
// // // //     this._hearingRings = []
// // // //     this._wasSpotted  = false
// // // //     this._lightsOut   = false

// // // //     const numGuards = Math.min(
// // // //       ROUND_CFG.INITIAL_GUARDS + (this.round - 1) * ROUND_CFG.GUARDS_PER_ROUND,
// // // //       ROUND_CFG.MAX_GUARDS
// // // //     )

// // // //     this.guards = guardSpawns.slice(0, numGuards).map((sp, i) =>
// // // //       new Guard({
// // // //         tileX:      sp.x,
// // // //         tileY:      sp.y,
// // // //         gene:       this.ga.geneFor(i),
// // // //         id:         i,
// // // //         geneIdx:    i % this.ga.population.length,
// // // //         grid,
// // // //         escapeTile: escapePoint,
// // // //       })
// // // //     )

// // // //     this.timeLeft = ROUND_CFG.TIME_LIMIT
// // // //     this._lastTs  = null
// // // //     this.state    = 'playing'

// // // //     if (this._rafId) cancelAnimationFrame(this._rafId)
// // // //     this._rafId = requestAnimationFrame(this._loop)
// // // //   }

// // // //   stop() {
// // // //     if (this._rafId) cancelAnimationFrame(this._rafId)
// // // //     this._rafId = null
// // // //   }

// // // //   _loop(ts) {
// // // //     if (this.state !== 'playing') return
// // // //     const dt = this._lastTs
// // // //       ? Math.min((ts - this._lastTs) / 1000, 0.05)
// // // //       : 0.016
// // // //     this._lastTs   = ts
// // // //     this.timeLeft -= dt
// // // //     this._update(dt)
// // // //     this._render(dt)
// // // //     this._rafId = requestAnimationFrame(this._loop)
// // // //   }

// // // //   _update(dt) {
// // // //     this.player.update(dt, this.grid, this.keys)

// // // //     // Lights out
// // // //     this._lightsOut = this.timeLeft <= ROUND_CFG.LIGHTS_OUT_AT
// // // //     if (this._lightsOut) {
// // // //       this.player.visionPx = Math.max(
// // // //         TILE_SIZE * 3,
// // // //         this.player.visionPx - dt * TILE_SIZE * 0.5
// // // //       )
// // // //     }

// // // //     // Keycard pickup
// // // //     const justCollected = this.keycard.update(
// // // //       this.player.tileX, this.player.tileY, this.grid
// // // //     )
// // // //     if (justCollected) this.screenShake.shake(0.3)

// // // //     // Wanted level
// // // //     this.wanted.update(dt, this._wasSpotted)

// // // //     // Sewer teleport
// // // //     this._checkSewer()

// // // //     this.heatmap.decay()
// // // //     if (Math.random() < 0.016) this.heatmap.spread()

// // // //     // const pTile    = { x: this.player.tileX, y: this.player.tileY }
// // // //     // let anySpotted = false
// // // //     // let spotter    = null
// // // //     const pTile    = { x: this.player.tileX, y: this.player.tileY }
// // // // let anySpotted = false
// // // // let spotter    = null

// // // // // Red zone — if player steps on REDZONE tile, all guards get alerted immediately
// // // // const onRedZone = this.grid.get(pTile.x, pTile.y) === TILE.REDZONE
// // // // if (onRedZone) {
// // // //   for (const g of this.guards) {
// // // //     g.alertLevel      = Math.min(1, g.alertLevel + 0.08)
// // // //     g.lastKnownPlayer = { ...pTile }
// // // //   }
// // // //   this.heatmap.spike(pTile.x, pTile.y, 6)
// // // // }

// // // //     for (const g of this.guards) {
// // // //       const visible = g.canSeePlayer(this.player.pixelX, this.player.pixelY)
// // // //       const heard   = g.hearPlayer(pTile, this.player.noise)

// // // //       if (visible) { anySpotted = true; spotter = g }

// // // //       g.setHearing(heard)

// // // //       if (heard) {
// // // //         g.alertLevel = Math.min(1, g.alertLevel + 0.05)
// // // //         if (g.alertLevel > 0.5 && !g.lastKnownPlayer)
// // // //           g.lastKnownPlayer = { ...pTile }
// // // //         // Only shake ONCE when a guard first crosses hearing threshold — not every frame
// // // //         if (g.alertLevel > 0.5 && (g.alertLevel - 0.05) <= 0.5 && !this._hearingShookGuards?.has(g.id)) {
// // // //           this._hearingShookGuards = this._hearingShookGuards || new Set()
// // // //           this._hearingShookGuards.add(g.id)
// // // //           this.screenShake.shake(0.18)
// // // //         }

// // // //       } else {
// // // //         // Clear hearing shake flag when guard calms down so it can fire again next time
// // // //         this._hearingShookGuards?.delete(g.id)
// // // //       }

// // // //       g.update(dt, pTile, visible, this.heatmap, this.guards, this.ga, this.wanted.speedMult)
// // // //     }


// // // //     if (anySpotted && !this._wasSpotted) this.screenShake.shake(0.7)
// // // //     this._wasSpotted = anySpotted

// // // //     // // Radio lines
// // // //     // if (anySpotted && spotter) {
// // // //     //   this._radioLines = this.guards
// // // //     //     .filter(g => g !== spotter)
// // // //     //     .map(g => ({ x1: spotter.pixelX, y1: spotter.pixelY, x2: g.pixelX, y2: g.pixelY, life: 1.0 }))
// // // //     // }
// // // //     // if (this._radioLines.length) {
// // // //     //   this._radioLines.forEach(l => l.life -= dt * 1.8)
// // // //     //   this._radioLines = this._radioLines.filter(l => l.life > 0)
// // // //     // }

// // // //     if (anySpotted) this.heatmap.spike(pTile.x, pTile.y, 5)
// // // //     else if (Math.random() < 0.01) this.heatmap.spike(pTile.x, pTile.y, 1)

// // // //     this.globalAlert = anySpotted

// // // //     // Caught
// // // //     const caught = this.guards.some(g =>
// // // //       Math.hypot(g.pixelX - this.player.pixelX, g.pixelY - this.player.pixelY) < T * 0.85
// // // //     )
// // // //     if (caught) {
// // // //       this.screenShake.shake(0.5)  // reduced from 1.0, only fires once at round end
// // // //       this.guards.forEach(g => {
// // // //         if (Math.hypot(g.pixelX - this.player.pixelX, g.pixelY - this.player.pixelY) < T * 0.85)
// // // //           this.ga.recordCapture(g.geneIdx)
// // // //       })
// // // //       this._endRound('caught')
// // // //       return
// // // //     }

// // // //     // Escape — only if keycard collected
// // // //     const distToEscape = Math.hypot(
// // // //       this.player.pixelX - (this.escapePoint.x * T + T / 2),
// // // //       this.player.pixelY - (this.escapePoint.y * T + T / 2)
// // // //     )
// // // //     if (distToEscape < T * 1.2) {
// // // //       if (!this.keycard.isUnlocked) {
// // // //         // No shake here — exit is visually locked, no need to shake every frame
// // // //       } else {
// // // //         this.escaped++
// // // //         this._endRound('escaped')
// // // //         return
// // // //       }
// // // //     }

// // // //     if (this.timeLeft <= 0) this._endRound('timeout')
// // // //   }

// // // //   _checkSewer() {
// // // //     if (this._sewers.length < 2) return
// // // //     if (this._sewerCooldown > 0) {
// // // //       this._sewerCooldown -= 0.016
// // // //       return
// // // //     }
// // // //     const [s1, s2] = this._sewers
// // // //     const onS1 = Math.abs(this.player.tileX - s1.x) <= 1 && Math.abs(this.player.tileY - s1.y) <= 1
// // // //     const onS2 = Math.abs(this.player.tileX - s2.x) <= 1 && Math.abs(this.player.tileY - s2.y) <= 1

// // // //     if (onS1 || onS2) {
// // // //       const dest = onS1 ? s2 : s1
// // // //       this.player.pixelX = dest.x * T + T / 2
// // // //       this.player.pixelY = dest.y * T + T / 2
// // // //       this.player.tileX  = dest.x
// // // //       this.player.tileY  = dest.y
// // // //       this._sewerCooldown = 2.0
// // // //       this.screenShake.shake(0.4)
// // // //       // Sewer makes noise — alert nearby guards
// // // //       this.heatmap.spike(dest.x, dest.y, 8)
// // // //     }
// // // //   }

// // // //   // _render(dt = 0.016) {
// // // //   //   const { ctx, grid, player, guards, heatmap, debug } = this

// // // //   //   const shake = this.screenShake.update(dt)
// // // //   //   ctx.save()
// // // //   //   ctx.translate(shake.x, shake.y)
// // // //   //   ctx.clearRect(-30, -30, CANVAS.WIDTH + 60, CANVAS.HEIGHT + 60)

// // // //   //   // 1. Tiles (with lights out flag)
// // // //   //   Tilemap.draw(ctx, grid, this._lightsOut)

// // // //   //   // 2. Heatmap debug
// // // //   //   if (debug) Tilemap.drawHeatmap(ctx, heatmap, grid)

// // // //   //   // 3. Red zone warning overlay
// // // //   //   this._drawRedZoneWarning(ctx, grid)

// // // //   //   // 4. Spotlights before fog
// // // //   //   for (const g of guards) {
// // // //   //     Spotlight.draw(ctx, g.pixelX, g.pixelY, g._facingAngle ?? 0, g.visionPx, g.alertLevel, g.state)
// // // //   //   }

// // // //   //   // 5. Fog
// // // //   //   if (!debug) {
// // // //   //     const visionR = this._lightsOut
// // // //   //       ? player.visionPx * 0.55
// // // //   //       : player.visionPx
// // // //   //     Tilemap.drawFog(ctx, player.pixelX, player.pixelY, visionR, CANVAS.WIDTH, CANVAS.HEIGHT)
// // // //   //   }

// // // //   //   // 6. Hearing rings
// // // //   //   this._drawHearingRings(ctx)

// // // //   //   // 7. Radio lines
// // // //   //   this._drawRadioLines(ctx)

// // // //   //   // 8. Sprites
// // // //   //   for (const g of guards) g.draw(ctx, debug)
// // // //   //   player.draw(ctx)

// // // //   //   // 9. Escape UI
// // // //   //   this._drawEscapeUI(ctx)

// // // //   //   // 10. Lights out warning
// // // //   //   if (this._lightsOut) this._drawLightsOutOverlay(ctx)

// // // //   //   // 11. Red vignette when spotted
// // // //   //   if (this._wasSpotted) {
// // // //   //     const pulse = 0.15 + 0.08 * Math.sin(Date.now() / 80)
// // // //   //     ctx.fillStyle = `rgba(255,0,0,${pulse})`
// // // //   //     ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)
// // // //   //   }

// // // //   //   ctx.restore()
// // // //   // }
// // // //   _render(dt = 0.016) {
// // // //   const { ctx, grid, player, guards, heatmap, debug } = this

// // // //   const shake = this.screenShake.update(dt)
// // // //   ctx.save()
// // // //   ctx.translate(shake.x, shake.y)
// // // //   ctx.clearRect(-30, -30, CANVAS.WIDTH + 60, CANVAS.HEIGHT + 60)

// // // //   // 1. City tiles (keycard drawn here gets covered by fog — intentional)
// // // //   Tilemap.draw(ctx, grid, this._lightsOut)

// // // //   // 2. Heatmap debug
// // // //   if (debug) Tilemap.drawHeatmap(ctx, heatmap, grid)

// // // //   // 3. Red zone warning
// // // //   this._drawRedZoneWarning(ctx, grid)

// // // //   // 4. Spotlights before fog
// // // //   for (const g of guards) {
// // // //     Spotlight.draw(ctx, g.pixelX, g.pixelY, g._facingAngle ?? 0, g.visionPx, g.alertLevel, g.state)
// // // //   }

// // // //   // 5. Fog
// // // //   if (!debug) {
// // // //     const visionR = this._lightsOut ? player.visionPx * 0.55 : player.visionPx
// // // //     Tilemap.drawFog(ctx, player.pixelX, player.pixelY, visionR, CANVAS.WIDTH, CANVAS.HEIGHT)
// // // //   }

// // // //   // 6. Keycard drawn AFTER fog — always visible through darkness
// // // //   if (!this.keycard.collected) this._drawKeycardAboveFog(ctx)

// // // //   // 8. Radio lines
// // // //   this._drawRadioLines(ctx)

// // // //   // 9. Sprites
// // // //   for (const g of guards) g.draw(ctx, debug)
// // // //   player.draw(ctx)

// // // //   // 10. Escape UI always on top
// // // //   this._drawEscapeUI(ctx)

// // // //   // 11. Lights out overlay
// // // //   if (this._lightsOut) this._drawLightsOutOverlay(ctx)

// // // //   if (this._wasSpotted) {
// // // //   const pulse = 0.15 + 0.08 * Math.sin(Date.now() / 80)
// // // //   ctx.fillStyle = `rgba(255,0,0,${pulse})`
// // // //   ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)
// // // // }

// // // // // 13. Red zone warning — pulsing orange border when player is in red zone
// // // // if (this.grid.get(this.player.tileX, this.player.tileY) === TILE.REDZONE) {
// // // //   const p  = 0.5 + 0.5 * Math.sin(Date.now() / 120)
// // // //   const bw = 14
// // // //   ctx.fillStyle = `rgba(255,80,0,${0.25 + p * 0.2})`
// // // //   ctx.fillRect(0, 0, CANVAS.WIDTH, bw)
// // // //   ctx.fillRect(0, CANVAS.HEIGHT - bw, CANVAS.WIDTH, bw)
// // // //   ctx.fillRect(0, 0, bw, CANVAS.HEIGHT)
// // // //   ctx.fillRect(CANVAS.WIDTH - bw, 0, bw, CANVAS.HEIGHT)
// // // //   ctx.font        = 'bold 13px monospace'
// // // //   ctx.textAlign   = 'center'
// // // //   ctx.fillStyle   = `rgba(255,120,0,${0.7 + p * 0.3})`
// // // //   ctx.shadowBlur  = 10
// // // //   ctx.shadowColor = '#ff5500'
// // // //   ctx.fillText('⚠ RED ZONE — GUARDS ALERTED', CANVAS.WIDTH / 2, 28)
// // // //   ctx.shadowBlur  = 0
// // // // }

// // // // ctx.restore()
// // // // }

// // // // _drawKeycardAboveFog(ctx) {
// // // //   const pos = this.keycard.pos
// // // //   if (!pos) return

// // // //   const cx  = pos.x * TILE_SIZE + TILE_SIZE / 2
// // // //   const cy  = pos.y * TILE_SIZE + TILE_SIZE / 2
// // // //   const now = Date.now()
// // // //   const bob = Math.sin(now / 400) * 3

// // // //   // Bright background tile so it punches through fog
// // // //   ctx.fillStyle = 'rgba(255,220,0,0.25)'
// // // //   ctx.fillRect(pos.x * TILE_SIZE, pos.y * TILE_SIZE, TILE_SIZE, TILE_SIZE)

// // // //   // Outer pulsing ring
// // // //   const pulse = 0.5 + 0.5 * Math.sin(now / 300)
// // // //   ctx.strokeStyle = `rgba(255,220,0,${0.6 + pulse * 0.4})`
// // // //   ctx.lineWidth   = 2
// // // //   ctx.shadowBlur  = 16
// // // //   ctx.shadowColor = '#ffdd00'
// // // //   ctx.beginPath()
// // // //   ctx.arc(cx, cy, TILE_SIZE * (0.9 + pulse * 0.3), 0, Math.PI * 2)
// // // //   ctx.stroke()
// // // //   ctx.shadowBlur = 0

// // // //   // Key emoji floating above
// // // //   ctx.font      = `${Math.floor(TILE_SIZE * 0.9)}px serif`
// // // //   ctx.textAlign = 'center'
// // // //   ctx.shadowBlur  = 14
// // // //   ctx.shadowColor = '#ffdd00'
// // // //   ctx.fillText('🗝️', cx, cy + TILE_SIZE * 0.3 + bob)
// // // //   ctx.shadowBlur = 0

// // // //   // "KEY" label above it
// // // //   ctx.font        = `bold ${Math.floor(TILE_SIZE * 0.55)}px 'Orbitron', monospace`
// // // //   ctx.fillStyle   = '#ffdd00'
// // // //   ctx.shadowBlur  = 8
// // // //   ctx.shadowColor = '#ffaa00'
// // // //   ctx.fillText('KEY', cx, cy - TILE_SIZE * 0.8 + bob)
// // // //   ctx.shadowBlur = 0

// // // //   // Bouncing arrow pointing down to key
// // // //   const arrowBob = Math.sin(now / 250) * 4
// // // //   ctx.fillStyle   = '#ffdd00'
// // // //   ctx.shadowBlur  = 8
// // // //   ctx.shadowColor = '#ffaa00'
// // // //   ctx.beginPath()
// // // //   ctx.moveTo(cx,                  cy - TILE_SIZE * 1.2 + arrowBob)
// // // //   ctx.lineTo(cx - TILE_SIZE * 0.25, cy - TILE_SIZE * 1.5 + arrowBob)
// // // //   ctx.lineTo(cx + TILE_SIZE * 0.25, cy - TILE_SIZE * 1.5 + arrowBob)
// // // //   ctx.closePath()
// // // //   ctx.fill()
// // // //   ctx.shadowBlur = 0
// // // // }

// // // //   _drawRedZoneWarning(ctx, grid) {
// // // //     // Pulse red tint on redzone tiles visible to player
// // // //     const pulse = 0.08 + 0.04 * Math.sin(Date.now() / 400)
// // // //     for (let y = 0; y < grid.rows; y++) {
// // // //       for (let x = 0; x < grid.cols; x++) {
// // // //         if (grid.get(x, y) === TILE.REDZONE) {
// // // //           ctx.fillStyle = `rgba(200,0,0,${pulse})`
// // // //           ctx.fillRect(x * T, y * T, T, T)
// // // //         }
// // // //       }
// // // //     }
// // // //   }

// // // //   _drawHearingRings(ctx) {
// // // //     for (const r of this._hearingRings) {
// // // //       ctx.save()
// // // //       ctx.globalAlpha = r.life * 0.7
// // // //       ctx.strokeStyle = `rgba(255,220,0,${r.life})`
// // // //       ctx.lineWidth   = 1.5
// // // //       ctx.shadowBlur  = 8
// // // //       ctx.shadowColor = '#ffcc00'
// // // //       ctx.beginPath()
// // // //       ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2)
// // // //       ctx.stroke()
// // // //       ctx.restore()
// // // //     }
// // // //   }

// // // //   _drawRadioLines(ctx) {
// // // //     if (!this._radioLines?.length) return
// // // //     for (const line of this._radioLines) {
// // // //       ctx.save()
// // // //       ctx.globalAlpha = line.life * 0.9
// // // //       ctx.strokeStyle = '#ff3333'
// // // //       ctx.lineWidth   = 1.5
// // // //       ctx.setLineDash([4, 4])
// // // //       ctx.shadowBlur  = 6
// // // //       ctx.shadowColor = '#ff3333'
// // // //       ctx.beginPath()
// // // //       ctx.moveTo(line.x1, line.y1)
// // // //       ctx.lineTo(line.x2, line.y2)
// // // //       ctx.stroke()
// // // //       ctx.setLineDash([])
// // // //       ctx.fillStyle   = `rgba(255,200,0,${line.life})`
// // // //       ctx.shadowBlur  = 10
// // // //       ctx.shadowColor = '#ffcc00'
// // // //       ctx.beginPath()
// // // //       ctx.arc(line.x2, line.y2 - T * 0.9, T * 0.18, 0, Math.PI * 2)
// // // //       ctx.fill()
// // // //       ctx.restore()
// // // //     }
// // // //   }

// // // //   _drawEscapeUI(ctx) {
// // // //     const ex  = this.escapePoint
// // // //     if (!ex) return
// // // //     const cx  = ex.x * T + T / 2
// // // //     const cy  = ex.y * T + T / 2
// // // //     const now = Date.now()
// // // //     const locked = !this.keycard.isUnlocked

// // // //     // Base tile
// // // //     ctx.fillStyle = locked ? 'rgba(255,80,0,0.4)' : 'rgba(0,255,136,0.5)'
// // // //     ctx.fillRect(ex.x * T, ex.y * T, T, T)

// // // //     const color  = locked ? '255,80,0' : '0,255,136'
// // // //     const hex    = locked ? '#ff5000'  : '#00ff88'

// // // //     const pulse1 = 0.5 + 0.5 * Math.sin(now / 350)
// // // //     ctx.strokeStyle = `rgba(${color},${0.6 + pulse1 * 0.4})`
// // // //     ctx.lineWidth   = 2.5
// // // //     ctx.shadowBlur  = 20
// // // //     ctx.shadowColor = hex
// // // //     ctx.beginPath()
// // // //     ctx.arc(cx, cy, T * (1.1 + pulse1 * 0.4), 0, Math.PI * 2)
// // // //     ctx.stroke()
// // // //     ctx.shadowBlur = 0

// // // //     // Label
// // // //     ctx.font      = `bold ${T - 2}px 'Orbitron', monospace`
// // // //     ctx.textAlign = 'center'
// // // //     const label   = locked ? '🔒 KEY?' : 'EXIT'
// // // //     const labelY  = cy - T * 1.9
// // // //     ctx.fillStyle = 'rgba(0,0,0,0.9)'
// // // //     ctx.fillText(label, cx + 1, labelY + 1)
// // // //     ctx.fillStyle   = hex
// // // //     ctx.shadowBlur  = 14
// // // //     ctx.shadowColor = hex
// // // //     ctx.fillText(label, cx, labelY)
// // // //     ctx.shadowBlur = 0

// // // //     // Arrow (only when unlocked)
// // // //     if (!locked) {
// // // //       const arrowBob = Math.sin(now / 280) * 4
// // // //       ctx.fillStyle   = '#00ff88'
// // // //       ctx.shadowBlur  = 10
// // // //       ctx.shadowColor = '#00ff88'
// // // //       ctx.beginPath()
// // // //       ctx.moveTo(cx,           cy - T * 1.0 + arrowBob)
// // // //       ctx.lineTo(cx - T * 0.3, cy - T * 1.4 + arrowBob)
// // // //       ctx.lineTo(cx + T * 0.3, cy - T * 1.4 + arrowBob)
// // // //       ctx.closePath()
// // // //       ctx.fill()
// // // //       ctx.shadowBlur = 0
// // // //     }
// // // //   }

// // // //   _drawLightsOutOverlay(ctx) {
// // // //     // Dark vignette around edges
// // // //     const grd = ctx.createRadialGradient(
// // // //       CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2, CANVAS.HEIGHT * 0.2,
// // // //       CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2, CANVAS.HEIGHT * 0.8
// // // //     )
// // // //     grd.addColorStop(0, 'rgba(0,0,0,0)')
// // // //     grd.addColorStop(1, 'rgba(0,0,10,0.7)')
// // // //     ctx.fillStyle = grd
// // // //     ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)

// // // //     // Warning text
// // // //     const alpha = 0.5 + 0.5 * Math.sin(Date.now() / 500)
// // // //     ctx.font      = `bold ${T}px 'Orbitron', monospace`
// // // //     ctx.textAlign = 'center'
// // // //     ctx.fillStyle = `rgba(100,100,255,${alpha})`
// // // //     ctx.shadowBlur  = 12
// // // //     ctx.shadowColor = '#4444ff'
// // // //     ctx.fillText('⚡ LIGHTS OUT', CANVAS.WIDTH / 2, 60)
// // // //     ctx.shadowBlur = 0
// // // //   }

// // // //   _endRound(result) {
// // // //     this.stop()
// // // //     this.state = 'end'
// // // //     this.ga.evolve()
// // // //     EventBus.emit('round:end', {
// // // //       result,
// // // //       round:      this.round,
// // // //       generation: this.ga.generation,
// // // //       escaped:    this.escaped,
// // // //       guards:     this.guards.length,
// // // //       bestGene:   this.ga.best,
// // // //       gaHistory:  this.ga.history,
// // // //     })
// // // //     this.round++
// // // //   }

// // // //   // _bindKeys() {
// // // //   //   const BLOCK_SCROLL = new Set([
// // // //   //     'ArrowUp','ArrowDown','ArrowLeft','ArrowRight',
// // // //   //     'Space','Tab','PageUp','PageDown','Home','End',
// // // //   //   ])
// // // //   //   window.addEventListener('keydown', e => {
// // // //   //     if (BLOCK_SCROLL.has(e.code)) e.preventDefault()
// // // //   //     this.keys[e.code] = true
// // // //   //     if (e.code === 'Tab') this.debug = !this.debug
// // // //   //   })
// // // //   //   window.addEventListener('keyup', e => { this.keys[e.code] = false })
// // // //   // }
// // // //   _bindKeys() {
// // // //   const BLOCK_SCROLL = new Set([
// // // //     'ArrowUp','ArrowDown','ArrowLeft','ArrowRight',
// // // //     'Space','Tab','PageUp','PageDown','Home','End',
// // // //   ])
// // // //   window.addEventListener('keydown', e => {
// // // //     if (BLOCK_SCROLL.has(e.code)) e.preventDefault()
// // // //     this.keys[e.code] = true
// // // //     if (e.code === 'Tab') this.debug = !this.debug
// // // //   })
// // // //   window.addEventListener('keyup', e => { this.keys[e.code] = false })
// // // // }

// // // //   drawMenuPreview() {
// // // //     const { grid } = CityGenerator.generate(42)
// // // //     this.ctx.clearRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)
// // // //     Tilemap.draw(this.ctx, grid)
// // // //     this.ctx.fillStyle = 'rgba(5,5,8,0.65)'
// // // //     this.ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)
// // // //   }
// // // // }

// // // import { CityGenerator }   from '../world/CityGenerator.js'
// // // import { Tilemap }          from '../world/Tilemap.js'
// // // import { Player }           from '../player/Player.js'
// // // import { Guard }            from '../systems/Guard.js'
// // // import { HeatMap }          from '../ai/HeatMap.js'
// // // import { GeneticAlgorithm } from '../ai/GeneticAlgorithm.js'
// // // import { EventBus }         from '../systems/EventBus.js'
// // // import { ScreenShake }      from '../systems/ScreenShake.js'
// // // import { Spotlight }        from '../systems/Spotlight.js'
// // // import { KeycardSystem }    from '../systems/KeycardSystem.js'
// // // import { WantedSystem }     from '../systems/WantedSystem.js'
// // // import { CANVAS, ROUND_CFG, TILE_SIZE, TILE } from './constants.js'

// // // const T = TILE_SIZE

// // // export class Game {
// // //   constructor(canvas) {
// // //     this.canvas = canvas
// // //     this.ctx    = canvas.getContext('2d')
// // //     canvas.width  = CANVAS.WIDTH
// // //     canvas.height = CANVAS.HEIGHT

// // //     this.state   = 'menu'
// // //     this.round   = 1
// // //     this.escaped = 0
// // //     this.keys    = {}
// // //     this.debug   = false

// // //     this.ga          = new GeneticAlgorithm()
// // //     this.heatmap     = new HeatMap()
// // //     this.screenShake = new ScreenShake()
// // //     this.keycard     = new KeycardSystem()
// // //     this.wanted      = new WantedSystem()

// // //     this._wasSpotted  = false
// // //     this._radioLines  = []
// // //     this._hearingRings = []
// // //     this._lightsOut   = false
// // //     this._sewers      = []

// // //     this._loop   = this._loop.bind(this)
// // //     this._lastTs = null
// // //     this._rafId  = null

// // //     this._bindKeys()
// // //   }

// // //   // Difficulty modifier table
// // //   static _diffConfig(difficulty) {
// // //     // ROUND_CFG.INITIAL_GUARDS = 5, so guardMult 0.8 = 4 guards round 1
// // //     const D = {
// // //       routine:  { guardMult:0.8,  timeMult:1.0,  speedMult:1.0,  visionMult:1.0,  keycards:1, lightsOutAt:75  },
// // //       alert:    { guardMult:1.0,  timeMult:0.93, speedMult:1.05, visionMult:1.1,  keycards:1, lightsOutAt:75  },
// // //       lockdown: { guardMult:1.4,  timeMult:0.87, speedMult:1.1,  visionMult:1.2,  keycards:2, lightsOutAt:75  },
// // //       manhunt:  { guardMult:1.8,  timeMult:0.77, speedMult:1.25, visionMult:1.35, keycards:2, lightsOutAt:60  },
// // //     }
// // //     return D[difficulty] || D.routine
// // //   }

// // //   startRound(config = {}) {
// // //     const { mode = 'city', difficulty = 'routine' } = config
// // //     this._mode       = mode
// // //     this._difficulty = difficulty
// // //     const diff       = Game._diffConfig(difficulty)

// // //     const { grid, playerStart, escapePoint, guardSpawns, sewers, keycardPos, keycardPositions } =
// // //       CityGenerator.generate(Date.now(), { mapType: mode, keycards: diff.keycards })

// // //     this.grid         = grid
// // //     this.escapePoint  = escapePoint
// // //     this._sewers      = sewers || []
// // //     this._lightsOutAt = diff.lightsOutAt
// // //     this.player       = new Player(playerStart.x, playerStart.y)
// // //     this.heatmap.reset()
// // //     this.keycard.reset(keycardPositions || keycardPos, diff.keycards)
// // //     this.wanted.reset()
// // //     this._radioLines   = []
// // //     this._hearingRings = []
// // //     this._wasSpotted   = false
// // //     this._lightsOut    = false

// // //     const baseGuards = Math.min(
// // //       ROUND_CFG.INITIAL_GUARDS + (this.round - 1) * ROUND_CFG.GUARDS_PER_ROUND,
// // //       ROUND_CFG.MAX_GUARDS
// // //     )
// // //     const numGuards = Math.min(Math.round(baseGuards * diff.guardMult), ROUND_CFG.MAX_GUARDS)

// // //     this.guards = guardSpawns.slice(0, numGuards).map((sp, i) =>
// // //       new Guard({
// // //         tileX:      sp.x,
// // //         tileY:      sp.y,
// // //         gene:       this.ga.geneFor(i),
// // //         id:         i,
// // //         geneIdx:    i % this.ga.population.length,
// // //         grid,
// // //         escapeTile: escapePoint,
// // //         speedMult:  diff.speedMult,
// // //         visionMult: diff.visionMult,
// // //       })
// // //     )

// // //     this.timeLeft = ROUND_CFG.TIME_LIMIT * diff.timeMult
// // //     this._lastTs  = null
// // //     this.state    = 'playing'

// // //     if (this._rafId) cancelAnimationFrame(this._rafId)
// // //     this._rafId = requestAnimationFrame(this._loop)
// // //   }

// // //   stop() {
// // //     if (this._rafId) cancelAnimationFrame(this._rafId)
// // //     this._rafId = null
// // //   }

// // //   _loop(ts) {
// // //     if (this.state !== 'playing') return
// // //     const dt = this._lastTs
// // //       ? Math.min((ts - this._lastTs) / 1000, 0.05)
// // //       : 0.016
// // //     this._lastTs   = ts
// // //     this.timeLeft -= dt
// // //     this._update(dt)
// // //     this._render(dt)
// // //     this._rafId = requestAnimationFrame(this._loop)
// // //   }

// // //   _update(dt) {
// // //     this.player.update(dt, this.grid, this.keys)

// // //     // Lights out
// // //     this._lightsOut = this.timeLeft <= (this._lightsOutAt ?? ROUND_CFG.LIGHTS_OUT_AT)
// // //     if (this._lightsOut) {
// // //       this.player.visionPx = Math.max(
// // //         TILE_SIZE * 3,
// // //         this.player.visionPx - dt * TILE_SIZE * 0.5
// // //       )
// // //     }

// // //     // Keycard pickup
// // //     const justCollected = this.keycard.update(
// // //       this.player.tileX, this.player.tileY, this.grid
// // //     )
// // //     if (justCollected) this.screenShake.shake(0.3)

// // //     // Wanted level
// // //     this.wanted.update(dt, this._wasSpotted)

// // //     // Sewer teleport
// // //     this._checkSewer()

// // //     this.heatmap.decay()
// // //     if (Math.random() < 0.016) this.heatmap.spread()

// // //     const pTile    = { x: this.player.tileX, y: this.player.tileY }
// // //     let anySpotted = false
// // //     let spotter    = null

// // //     // Red zone — stepping on it forces CHASE on ALL guards immediately
// // //     const onRedZone = this.grid.get(pTile.x, pTile.y) === TILE.REDZONE
// // //     if (onRedZone) {
// // //       for (const g of this.guards) {
// // //         g.alertLevel      = 1.0
// // //         g.lastKnownPlayer = { ...pTile }
// // //         g.state           = 'chase'
// // //       }
// // //       this.heatmap.spike(pTile.x, pTile.y, 10)
// // //       if (!this._redZoneShook) { this.screenShake.shake(0.6); this._redZoneShook = true }
// // //     } else {
// // //       this._redZoneShook = false
// // //     }

// // //     for (const g of this.guards) {
// // //       const visible = g.canSeePlayer(this.player.pixelX, this.player.pixelY)
// // //       const heard   = g.hearPlayer(pTile, this.player.noise)

// // //       if (visible) { anySpotted = true; spotter = g }

// // //       g.setHearing(heard)

// // //       if (heard) {
// // //         g.alertLevel = Math.min(1, g.alertLevel + 0.05)
// // //         if (g.alertLevel > 0.5 && !g.lastKnownPlayer)
// // //           g.lastKnownPlayer = { ...pTile }
// // //         if (g.alertLevel > 0.5 && (g.alertLevel - 0.05) <= 0.5)
// // //           this.screenShake.shake(0.25)
// // //       }

// // //       g.update(dt, pTile, visible, this.heatmap, this.guards, this.ga, this.wanted.speedMult)
// // //     }

// // //     if (anySpotted && !this._wasSpotted) this.screenShake.shake(0.7)
// // //     this._wasSpotted = anySpotted

// // //     // // Radio lines
// // //     // if (anySpotted && spotter) {
// // //     //   this._radioLines = this.guards
// // //     //     .filter(g => g !== spotter)
// // //     //     .map(g => ({ x1: spotter.pixelX, y1: spotter.pixelY, x2: g.pixelX, y2: g.pixelY, life: 1.0 }))
// // //     // }
// // //     // if (this._radioLines.length) {
// // //     //   this._radioLines.forEach(l => l.life -= dt * 1.8)
// // //     //   this._radioLines = this._radioLines.filter(l => l.life > 0)
// // //     // }

// // //     if (anySpotted) this.heatmap.spike(pTile.x, pTile.y, 5)
// // //     else if (Math.random() < 0.01) this.heatmap.spike(pTile.x, pTile.y, 1)

// // //     this.globalAlert = anySpotted

// // //     // Caught
// // //     const caught = this.guards.some(g =>
// // //       Math.hypot(g.pixelX - this.player.pixelX, g.pixelY - this.player.pixelY) < T * 0.85
// // //     )
// // //     if (caught) {
// // //       this.screenShake.shake(1.0)
// // //       this.guards.forEach(g => {
// // //         if (Math.hypot(g.pixelX - this.player.pixelX, g.pixelY - this.player.pixelY) < T * 0.85)
// // //           this.ga.recordCapture(g.geneIdx)
// // //       })
// // //       this._endRound('caught')
// // //       return
// // //     }

// // //     // Escape — only if keycard collected
// // //     const distToEscape = Math.hypot(
// // //       this.player.pixelX - (this.escapePoint.x * T + T / 2),
// // //       this.player.pixelY - (this.escapePoint.y * T + T / 2)
// // //     )
// // //     if (distToEscape < T * 1.2) {
// // //       if (!this.keycard.isUnlocked) {
// // //         // Flash warning — no keycard
// // //         this.screenShake.shake(0.2)
// // //       } else {
// // //         this.escaped++
// // //         this._endRound('escaped')
// // //         return
// // //       }
// // //     }

// // //     if (this.timeLeft <= 0) this._endRound('timeout')
// // //   }

// // //   _checkSewer() {
// // //     if (this._sewers.length < 2) return
// // //     if (this._sewerCooldown > 0) {
// // //       this._sewerCooldown -= 0.016
// // //       return
// // //     }
// // //     const [s1, s2] = this._sewers
// // //     const onS1 = Math.abs(this.player.tileX - s1.x) <= 1 && Math.abs(this.player.tileY - s1.y) <= 1
// // //     const onS2 = Math.abs(this.player.tileX - s2.x) <= 1 && Math.abs(this.player.tileY - s2.y) <= 1

// // //     if (onS1 || onS2) {
// // //       const dest = onS1 ? s2 : s1
// // //       this.player.pixelX = dest.x * T + T / 2
// // //       this.player.pixelY = dest.y * T + T / 2
// // //       this.player.tileX  = dest.x
// // //       this.player.tileY  = dest.y
// // //       this._sewerCooldown = 2.0
// // //       this.screenShake.shake(0.4)
// // //       // Sewer makes noise — alert nearby guards
// // //       this.heatmap.spike(dest.x, dest.y, 8)
// // //     }
// // //   }

// // //   // _render(dt = 0.016) {
// // //   //   const { ctx, grid, player, guards, heatmap, debug } = this

// // //   //   const shake = this.screenShake.update(dt)
// // //   //   ctx.save()
// // //   //   ctx.translate(shake.x, shake.y)
// // //   //   ctx.clearRect(-30, -30, CANVAS.WIDTH + 60, CANVAS.HEIGHT + 60)

// // //   //   // 1. Tiles (with lights out flag)
// // //   //   Tilemap.draw(ctx, grid, this._lightsOut)

// // //   //   // 2. Heatmap debug
// // //   //   if (debug) Tilemap.drawHeatmap(ctx, heatmap, grid)

// // //   //   // 3. Red zone warning overlay
// // //   //   this._drawRedZoneWarning(ctx, grid)

// // //   //   // 4. Spotlights before fog
// // //   //   for (const g of guards) {
// // //   //     Spotlight.draw(ctx, g.pixelX, g.pixelY, g._facingAngle ?? 0, g.visionPx, g.alertLevel, g.state)
// // //   //   }

// // //   //   // 5. Fog
// // //   //   if (!debug) {
// // //   //     const visionR = this._lightsOut
// // //   //       ? player.visionPx * 0.55
// // //   //       : player.visionPx
// // //   //     Tilemap.drawFog(ctx, player.pixelX, player.pixelY, visionR, CANVAS.WIDTH, CANVAS.HEIGHT)
// // //   //   }

// // //   //   // 6. Hearing rings
// // //   // 
// // //   //   // 7. Radio lines
// // //   //   this._drawRadioLines(ctx)

// // //   //   // 8. Sprites
// // //   //   for (const g of guards) g.draw(ctx, debug)
// // //   //   player.draw(ctx)

// // //   //   // 9. Escape UI
// // //   //   this._drawEscapeUI(ctx)

// // //   //   // 10. Lights out warning
// // //   //   if (this._lightsOut) this._drawLightsOutOverlay(ctx)

// // //   //   // 11. Red vignette when spotted
// // //   //   if (this._wasSpotted) {
// // //   //     const pulse = 0.15 + 0.08 * Math.sin(Date.now() / 80)
// // //   //     ctx.fillStyle = `rgba(255,0,0,${pulse})`
// // //   //     ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)
// // //   //   }

// // //   //   ctx.restore()
// // //   // }
// // //   _render(dt = 0.016) {
// // //   const { ctx, grid, player, guards, heatmap, debug } = this

// // //   const shake = this.screenShake.update(dt)
// // //   ctx.save()
// // //   ctx.translate(shake.x, shake.y)
// // //   ctx.clearRect(-30, -30, CANVAS.WIDTH + 60, CANVAS.HEIGHT + 60)

// // //   // 1. City tiles (keycard drawn here gets covered by fog — intentional)
// // //   Tilemap.draw(ctx, grid, this._lightsOut)

// // //   // 2. Heatmap debug
// // //   if (debug) Tilemap.drawHeatmap(ctx, heatmap, grid)

// // //   // 3. Red zone warning
// // //   this._drawRedZoneWarning(ctx, grid)

// // //   // 4. Spotlights before fog
// // //   for (const g of guards) {
// // //     Spotlight.draw(ctx, g.pixelX, g.pixelY, g._facingAngle ?? 0, g.visionPx, g.alertLevel, g.state)
// // //   }

// // //   // 5. Fog
// // //   if (!debug) {
// // //     const visionR = this._lightsOut ? player.visionPx * 0.55 : player.visionPx
// // //     Tilemap.drawFog(ctx, player.pixelX, player.pixelY, visionR, CANVAS.WIDTH, CANVAS.HEIGHT)
// // //   }

// // //   // 6. All remaining keycards drawn AFTER fog — always visible
// // //   if (!this.keycard.isUnlocked) this._drawKeycardAboveFog(ctx)

// // //   // 7. Hearing rings
// // //   this._drawHearingRings(ctx)

// // //   // 8. Radio lines
// // //   this._drawRadioLines(ctx)

// // //   // 9. Sprites
// // //   for (const g of guards) g.draw(ctx, debug)
// // //   player.draw(ctx)

// // //   // 10. Escape UI always on top
// // //   this._drawEscapeUI(ctx)

// // //   // 11. Lights out overlay
// // //   if (this._lightsOut) this._drawLightsOutOverlay(ctx)

// // //   // 12. Red vignette when spotted
// // //   if (this._wasSpotted) {
// // //     const pulse = 0.15 + 0.08 * Math.sin(Date.now() / 80)
// // //     ctx.fillStyle = `rgba(255,0,0,${pulse})`
// // //     ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)
// // //   }

// // //   // 13. Red zone — pulsing orange border + warning text
// // //   if (this.grid?.get(this.player.tileX, this.player.tileY) === TILE.REDZONE) {
// // //     const p  = 0.5 + 0.5 * Math.sin(Date.now() / 120)
// // //     const bw = 14
// // //     ctx.fillStyle = `rgba(255,80,0,${0.3 + p * 0.2})`
// // //     ctx.fillRect(0, 0, CANVAS.WIDTH, bw)
// // //     ctx.fillRect(0, CANVAS.HEIGHT - bw, CANVAS.WIDTH, bw)
// // //     ctx.fillRect(0, 0, bw, CANVAS.HEIGHT)
// // //     ctx.fillRect(CANVAS.WIDTH - bw, 0, bw, CANVAS.HEIGHT)
// // //     ctx.font      = 'bold 13px monospace'
// // //     ctx.textAlign = 'center'
// // //     ctx.fillStyle   = `rgba(255,120,0,${0.8 + p * 0.2})`
// // //     ctx.shadowBlur  = 10
// // //     ctx.shadowColor = '#ff5500'
// // //     ctx.fillText('⚠ RED ZONE — ALL GUARDS CONVERGING', CANVAS.WIDTH / 2, 28)
// // //     ctx.shadowBlur  = 0
// // //   }

// // //   ctx.restore()
// // // }

// // // _drawKeycardAboveFog(ctx) {
// // //   const positions = this.keycard.remaining
// // //   if (!positions.length) return
// // //   const T   = TILE_SIZE
// // //   const now = Date.now()
// // //   const total = this.keycard._total

// // //   for (let ki = 0; ki < positions.length; ki++) {
// // //     const pos   = positions[ki]
// // //     const cx    = pos.x * T + T / 2
// // //     const cy    = pos.y * T + T / 2
// // //     const bob   = Math.sin(now / 400 + ki) * 3
// // //     const pulse = 0.5 + 0.5 * Math.sin(now / 300 + ki * 1.2)

// // //     ctx.fillStyle = 'rgba(255,220,0,0.22)'
// // //     ctx.fillRect(pos.x * T, pos.y * T, T, T)

// // //     ctx.strokeStyle = `rgba(255,220,0,${0.5 + pulse * 0.5})`
// // //     ctx.lineWidth   = 2
// // //     ctx.shadowBlur  = 16
// // //     ctx.shadowColor = '#ffdd00'
// // //     ctx.beginPath()
// // //     ctx.arc(cx, cy, T * (0.9 + pulse * 0.3), 0, Math.PI * 2)
// // //     ctx.stroke()
// // //     ctx.shadowBlur = 0

// // //     ctx.font      = `${Math.floor(T * 0.9)}px serif`
// // //     ctx.textAlign = 'center'
// // //     ctx.shadowBlur  = 14
// // //     ctx.shadowColor = '#ffdd00'
// // //     ctx.fillText('🗝️', cx, cy + T * 0.3 + bob)
// // //     ctx.shadowBlur = 0

// // //     // Show "KEY 1/3" label if multiple
// // //     const label = total > 1 ? `KEY ${ki + 1}/${total}` : 'KEY'
// // //     ctx.font        = `bold ${Math.floor(T * 0.5)}px 'Orbitron', monospace`
// // //     ctx.fillStyle   = '#ffdd00'
// // //     ctx.shadowBlur  = 8
// // //     ctx.shadowColor = '#ffaa00'
// // //     ctx.fillText(label, cx, cy - T * 0.8 + bob)
// // //     ctx.shadowBlur = 0

// // //     const arrowBob = Math.sin(now / 250 + ki) * 4
// // //     ctx.fillStyle   = '#ffdd00'
// // //     ctx.shadowBlur  = 6
// // //     ctx.shadowColor = '#ffaa00'
// // //     ctx.beginPath()
// // //     ctx.moveTo(cx,            cy - T * 1.2 + arrowBob)
// // //     ctx.lineTo(cx - T * 0.22, cy - T * 1.5 + arrowBob)
// // //     ctx.lineTo(cx + T * 0.22, cy - T * 1.5 + arrowBob)
// // //     ctx.closePath()
// // //     ctx.fill()
// // //     ctx.shadowBlur = 0
// // //   }
// // // }

// // //   _drawRedZoneWarning(ctx, grid) {
// // //     // Pulse red tint on redzone tiles visible to player
// // //     const pulse = 0.08 + 0.04 * Math.sin(Date.now() / 400)
// // //     for (let y = 0; y < grid.rows; y++) {
// // //       for (let x = 0; x < grid.cols; x++) {
// // //         if (grid.get(x, y) === TILE.REDZONE) {
// // //           ctx.fillStyle = `rgba(200,0,0,${pulse})`
// // //           ctx.fillRect(x * T, y * T, T, T)
// // //         }
// // //       }
// // //     }
// // //   }

// // //   _drawHearingRings(ctx) {
// // //     for (const r of this._hearingRings) {
// // //       ctx.save()
// // //       ctx.globalAlpha = r.life * 0.7
// // //       ctx.strokeStyle = `rgba(255,220,0,${r.life})`
// // //       ctx.lineWidth   = 1.5
// // //       ctx.shadowBlur  = 8
// // //       ctx.shadowColor = '#ffcc00'
// // //       ctx.beginPath()
// // //       ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2)
// // //       ctx.stroke()
// // //       ctx.restore()
// // //     }
// // //   }

// // //   _drawRadioLines(ctx) {
// // //     if (!this._radioLines?.length) return
// // //     for (const line of this._radioLines) {
// // //       ctx.save()
// // //       ctx.globalAlpha = line.life * 0.9
// // //       ctx.strokeStyle = '#ff3333'
// // //       ctx.lineWidth   = 1.5
// // //       ctx.setLineDash([4, 4])
// // //       ctx.shadowBlur  = 6
// // //       ctx.shadowColor = '#ff3333'
// // //       ctx.beginPath()
// // //       ctx.moveTo(line.x1, line.y1)
// // //       ctx.lineTo(line.x2, line.y2)
// // //       ctx.stroke()
// // //       ctx.setLineDash([])
// // //       ctx.fillStyle   = `rgba(255,200,0,${line.life})`
// // //       ctx.shadowBlur  = 10
// // //       ctx.shadowColor = '#ffcc00'
// // //       ctx.beginPath()
// // //       ctx.arc(line.x2, line.y2 - T * 0.9, T * 0.18, 0, Math.PI * 2)
// // //       ctx.fill()
// // //       ctx.restore()
// // //     }
// // //   }

// // //   _drawEscapeUI(ctx) {
// // //     const ex  = this.escapePoint
// // //     if (!ex) return
// // //     const cx  = ex.x * T + T / 2
// // //     const cy  = ex.y * T + T / 2
// // //     const now = Date.now()
// // //     const locked = !this.keycard.isUnlocked

// // //     // Base tile
// // //     ctx.fillStyle = locked ? 'rgba(255,80,0,0.4)' : 'rgba(0,255,136,0.5)'
// // //     ctx.fillRect(ex.x * T, ex.y * T, T, T)

// // //     const color  = locked ? '255,80,0' : '0,255,136'
// // //     const hex    = locked ? '#ff5000'  : '#00ff88'

// // //     const pulse1 = 0.5 + 0.5 * Math.sin(now / 350)
// // //     ctx.strokeStyle = `rgba(${color},${0.6 + pulse1 * 0.4})`
// // //     ctx.lineWidth   = 2.5
// // //     ctx.shadowBlur  = 20
// // //     ctx.shadowColor = hex
// // //     ctx.beginPath()
// // //     ctx.arc(cx, cy, T * (1.1 + pulse1 * 0.4), 0, Math.PI * 2)
// // //     ctx.stroke()
// // //     ctx.shadowBlur = 0

// // //     // Label
// // //     ctx.font      = `bold ${T - 2}px 'Orbitron', monospace`
// // //     ctx.textAlign = 'center'
// // //     const remaining = this.keycard.remaining?.length || 0
// // //     const total     = this.keycard._total || 1
// // //     const got       = total - remaining
// // //     const label     = locked
// // //       ? (total > 1 ? `🔒 KEY ${got}/${total}` : '🔒 KEY?')
// // //       : 'EXIT'
// // //     const labelY  = cy - T * 1.9
// // //     ctx.fillStyle = 'rgba(0,0,0,0.9)'
// // //     ctx.fillText(label, cx + 1, labelY + 1)
// // //     ctx.fillStyle   = hex
// // //     ctx.shadowBlur  = 14
// // //     ctx.shadowColor = hex
// // //     ctx.fillText(label, cx, labelY)
// // //     ctx.shadowBlur = 0

// // //     // Arrow (only when unlocked)
// // //     if (!locked) {
// // //       const arrowBob = Math.sin(now / 280) * 4
// // //       ctx.fillStyle   = '#00ff88'
// // //       ctx.shadowBlur  = 10
// // //       ctx.shadowColor = '#00ff88'
// // //       ctx.beginPath()
// // //       ctx.moveTo(cx,           cy - T * 1.0 + arrowBob)
// // //       ctx.lineTo(cx - T * 0.3, cy - T * 1.4 + arrowBob)
// // //       ctx.lineTo(cx + T * 0.3, cy - T * 1.4 + arrowBob)
// // //       ctx.closePath()
// // //       ctx.fill()
// // //       ctx.shadowBlur = 0
// // //     }
// // //   }

// // //   _drawLightsOutOverlay(ctx) {
// // //     // Dark vignette around edges
// // //     const grd = ctx.createRadialGradient(
// // //       CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2, CANVAS.HEIGHT * 0.2,
// // //       CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2, CANVAS.HEIGHT * 0.8
// // //     )
// // //     grd.addColorStop(0, 'rgba(0,0,0,0)')
// // //     grd.addColorStop(1, 'rgba(0,0,10,0.7)')
// // //     ctx.fillStyle = grd
// // //     ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)

// // //     // Warning text
// // //     const alpha = 0.5 + 0.5 * Math.sin(Date.now() / 500)
// // //     ctx.font      = `bold ${T}px 'Orbitron', monospace`
// // //     ctx.textAlign = 'center'
// // //     ctx.fillStyle = `rgba(100,100,255,${alpha})`
// // //     ctx.shadowBlur  = 12
// // //     ctx.shadowColor = '#4444ff'
// // //     ctx.fillText('⚡ LIGHTS OUT', CANVAS.WIDTH / 2, 60)
// // //     ctx.shadowBlur = 0
// // //   }

// // //   _endRound(result) {
// // //     this.stop()
// // //     this.state = 'end'
// // //     this.ga.evolve()
// // //     EventBus.emit('round:end', {
// // //       result,
// // //       round:      this.round,
// // //       generation: this.ga.generation,
// // //       escaped:    this.escaped,
// // //       guards:     this.guards.length,
// // //       bestGene:   this.ga.best,
// // //       gaHistory:  this.ga.history,
// // //       mode:       this._mode,
// // //       difficulty: this._difficulty,
// // //     })
// // //     this.round++
// // //   }

// // //   // _bindKeys() {
// // //   //   const BLOCK_SCROLL = new Set([
// // //   //     'ArrowUp','ArrowDown','ArrowLeft','ArrowRight',
// // //   //     'Space','Tab','PageUp','PageDown','Home','End',
// // //   //   ])
// // //   //   window.addEventListener('keydown', e => {
// // //   //     if (BLOCK_SCROLL.has(e.code)) e.preventDefault()
// // //   //     this.keys[e.code] = true
// // //   //     if (e.code === 'Tab') this.debug = !this.debug
// // //   //   })
// // //   //   window.addEventListener('keyup', e => { this.keys[e.code] = false })
// // //   // }
// // //   _bindKeys() {
// // //   const BLOCK_SCROLL = new Set([
// // //     'ArrowUp','ArrowDown','ArrowLeft','ArrowRight',
// // //     'Space','Tab','PageUp','PageDown','Home','End',
// // //   ])
// // //   window.addEventListener('keydown', e => {
// // //     if (BLOCK_SCROLL.has(e.code)) e.preventDefault()
// // //     this.keys[e.code] = true
// // //     if (e.code === 'Tab') this.debug = !this.debug
// // //   })
// // //   window.addEventListener('keyup', e => { this.keys[e.code] = false })
// // // }

// // //   drawMenuPreview() {
// // //     const { grid } = CityGenerator.generate(42)
// // //     this.ctx.clearRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)
// // //     Tilemap.draw(this.ctx, grid)
// // //     this.ctx.fillStyle = 'rgba(5,5,8,0.65)'
// // //     this.ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)
// // //   }
// // // }

// // import { CityGenerator }   from '../world/CityGenerator.js'
// // import { Tilemap }          from '../world/Tilemap.js'
// // import { Player }           from '../player/Player.js'
// // import { Guard }            from '../systems/Guard.js'
// // import { HeatMap }          from '../ai/HeatMap.js'
// // import { GeneticAlgorithm } from '../ai/GeneticAlgorithm.js'
// // import { EventBus }         from '../systems/EventBus.js'
// // import { ScreenShake }      from '../systems/ScreenShake.js'
// // import { Spotlight }        from '../systems/Spotlight.js'
// // import { KeycardSystem }    from '../systems/KeycardSystem.js'
// // import { WantedSystem }     from '../systems/WantedSystem.js'
// // import { CANVAS, TILE_SIZE, TILE } from './constants.js'

// // const T = TILE_SIZE

// // export class Game {
// //   constructor(canvas) {
// //     this.canvas = canvas
// //     this.ctx    = canvas.getContext('2d')
// //     canvas.width  = CANVAS.WIDTH
// //     canvas.height = CANVAS.HEIGHT

// //     this.state   = 'menu'
// //     this.escaped = 0
// //     this.keys    = {}
// //     this.debug   = false

// //     this.ga          = new GeneticAlgorithm()
// //     this.heatmap     = new HeatMap()
// //     this.screenShake = new ScreenShake()
// //     this.keycard     = new KeycardSystem()
// //     this.wanted      = new WantedSystem()

// //     this._wasSpotted  = false
// //     this._radioLines  = []
// //     this._hearingRings = []
// //     this._lightsOut   = false
// //     this._sewers      = []

// //     this._loop   = this._loop.bind(this)
// //     this._lastTs = null
// //     this._rafId  = null

// //     this._bindKeys()
// //   }

// //   // Difficulty modifier table
// //   static _diffConfig(difficulty) {
// //     // ROUND_CFG.INITIAL_GUARDS = 5, so guardMult 0.8 = 4 guards round 1
// //     const D = {
// //       routine:  { guardMult:0.8,  timeMult:1.0,  speedMult:1.0,  visionMult:1.0,  keycards:1, lightsOutAt:75  },
// //       alert:    { guardMult:1.0,  timeMult:0.93, speedMult:1.05, visionMult:1.1,  keycards:1, lightsOutAt:75  },
// //       lockdown: { guardMult:1.4,  timeMult:0.87, speedMult:1.1,  visionMult:1.2,  keycards:2, lightsOutAt:75  },
// //       manhunt:  { guardMult:1.8,  timeMult:0.77, speedMult:1.25, visionMult:1.35, keycards:2, lightsOutAt:60  },
// //     }
// //     return D[difficulty] || D.routine
// //   }

// //   startRound(config = {}) {
// //     const { mode = 'city', difficulty = 'routine' } = config
// //     this._mode       = mode
// //     this._difficulty = difficulty
// //     const diff       = Game._diffConfig(difficulty)

// //     const { grid, playerStart, escapePoint, guardSpawns, sewers, keycardPos, keycardPositions } =
// //       CityGenerator.generate(Date.now(), { mapType: mode, keycards: diff.keycards })

// //     this.grid         = grid
// //     this.escapePoint  = escapePoint
// //     this._sewers      = sewers || []
// //     this._lightsOutAt = diff.lightsOutAt
// //     this.player       = new Player(playerStart.x, playerStart.y)
// //     this.heatmap.reset()
// //     this.keycard.reset(keycardPositions || keycardPos, diff.keycards)
// //     this.wanted.reset()
// //     this._radioLines   = []
// //     this._hearingRings = []
// //     this._wasSpotted   = false
// //     this._lightsOut    = false

// //     // Guard count fixed per mode — difficulty multiplier applied on top
// //     const MODE_GUARDS = {
// //       city:       6,   // balanced urban patrol
// //       warehouse:  5,   // sparse but open sightlines
// //       slums:      8,   // crowded dense streets
// //       industrial: 7,   // heavy facility security
// //     }
// //     const baseGuards = MODE_GUARDS[mode] || 6
// //     const numGuards  = Math.max(1, Math.round(baseGuards * diff.guardMult))

// //     this.guards = guardSpawns.slice(0, numGuards).map((sp, i) =>
// //       new Guard({
// //         tileX:      sp.x,
// //         tileY:      sp.y,
// //         gene:       this.ga.geneFor(i),
// //         id:         i,
// //         geneIdx:    i % this.ga.population.length,
// //         grid,
// //         escapeTile: escapePoint,
// //         speedMult:  diff.speedMult,
// //         visionMult: diff.visionMult,
// //       })
// //     )

// //     this.timeLeft = 150 * diff.timeMult
// //     this._lastTs  = null
// //     this.state    = 'playing'

// //     if (this._rafId) cancelAnimationFrame(this._rafId)
// //     this._rafId = requestAnimationFrame(this._loop)
// //   }

// //   stop() {
// //     if (this._rafId) cancelAnimationFrame(this._rafId)
// //     this._rafId = null
// //   }

// //   _loop(ts) {
// //     if (this.state !== 'playing') return
// //     const dt = this._lastTs
// //       ? Math.min((ts - this._lastTs) / 1000, 0.05)
// //       : 0.016
// //     this._lastTs   = ts
// //     this.timeLeft -= dt
// //     this._update(dt)
// //     this._render(dt)
// //     this._rafId = requestAnimationFrame(this._loop)
// //   }

// //   _update(dt) {
// //     this.player.update(dt, this.grid, this.keys)

// //     // Lights out
// //     this._lightsOut = this.timeLeft <= (this._lightsOutAt ?? 75)
// //     if (this._lightsOut) {
// //       this.player.visionPx = Math.max(
// //         TILE_SIZE * 3,
// //         this.player.visionPx - dt * TILE_SIZE * 0.5
// //       )
// //     }

// //     // Keycard pickup
// //     const justCollected = this.keycard.update(
// //       this.player.tileX, this.player.tileY, this.grid
// //     )
// //     if (justCollected) this.screenShake.shake(0.3)

// //     // Wanted level
// //     this.wanted.update(dt, this._wasSpotted)

// //     // Sewer teleport
// //     this._checkSewer()

// //     this.heatmap.decay()
// //     if (Math.random() < 0.016) this.heatmap.spread()

// //     const pTile    = { x: this.player.tileX, y: this.player.tileY }
// //     let anySpotted = false
// //     let spotter    = null

// //     // Red zone — stepping on it forces CHASE on ALL guards immediately
// //     const onRedZone = this.grid.get(pTile.x, pTile.y) === TILE.REDZONE
// //     if (onRedZone) {
// //       for (const g of this.guards) {
// //         g.alertLevel      = 1.0
// //         g.lastKnownPlayer = { ...pTile }
// //         g.state           = 'chase'
// //       }
// //       this.heatmap.spike(pTile.x, pTile.y, 10)
// //       if (!this._redZoneShook) { this.screenShake.shake(0.6); this._redZoneShook = true }
// //     } else {
// //       this._redZoneShook = false
// //     }

// //     for (const g of this.guards) {
// //       const visible = g.canSeePlayer(this.player.pixelX, this.player.pixelY)
// //       const heard   = g.hearPlayer(pTile, this.player.noise)

// //       if (visible) { anySpotted = true; spotter = g }

// //       g.setHearing(heard)

// //       if (heard) {
// //         g.alertLevel = Math.min(1, g.alertLevel + 0.05)
// //         if (g.alertLevel > 0.5 && !g.lastKnownPlayer)
// //           g.lastKnownPlayer = { ...pTile }
// //         if (g.alertLevel > 0.5 && (g.alertLevel - 0.05) <= 0.5)
// //           this.screenShake.shake(0.25)
// //       }

// //       g.update(dt, pTile, visible, this.heatmap, this.guards, this.ga, this.wanted.speedMult)
// //     }

// //     if (anySpotted && !this._wasSpotted) this.screenShake.shake(0.7)
// //     this._wasSpotted = anySpotted

// //     // // Radio lines
// //     // if (anySpotted && spotter) {
// //     //   this._radioLines = this.guards
// //     //     .filter(g => g !== spotter)
// //     //     .map(g => ({ x1: spotter.pixelX, y1: spotter.pixelY, x2: g.pixelX, y2: g.pixelY, life: 1.0 }))
// //     // }
// //     // if (this._radioLines.length) {
// //     //   this._radioLines.forEach(l => l.life -= dt * 1.8)
// //     //   this._radioLines = this._radioLines.filter(l => l.life > 0)
// //     // }

// //     if (anySpotted) this.heatmap.spike(pTile.x, pTile.y, 5)
// //     else if (Math.random() < 0.01) this.heatmap.spike(pTile.x, pTile.y, 1)

// //     this.globalAlert = anySpotted

// //     // Caught
// //     const caught = this.guards.some(g =>
// //       Math.hypot(g.pixelX - this.player.pixelX, g.pixelY - this.player.pixelY) < T * 0.85
// //     )
// //     if (caught) {
// //       this.screenShake.shake(1.0)
// //       this.guards.forEach(g => {
// //         if (Math.hypot(g.pixelX - this.player.pixelX, g.pixelY - this.player.pixelY) < T * 0.85)
// //           this.ga.recordCapture(g.geneIdx)
// //       })
// //       this._endRound('caught')
// //       return
// //     }

// //     // Escape — only if keycard collected
// //     const distToEscape = Math.hypot(
// //       this.player.pixelX - (this.escapePoint.x * T + T / 2),
// //       this.player.pixelY - (this.escapePoint.y * T + T / 2)
// //     )
// //     if (distToEscape < T * 1.2) {
// //       if (!this.keycard.isUnlocked) {
// //         // Flash warning — no keycard
// //         this.screenShake.shake(0.2)
// //       } else {
// //         this.escaped++
// //         this._endRound('escaped')
// //         return
// //       }
// //     }

// //     if (this.timeLeft <= 0) this._endRound('timeout')
// //   }

// //   _checkSewer() {
// //     if (this._sewers.length < 2) return
// //     if (this._sewerCooldown > 0) {
// //       this._sewerCooldown -= 0.016
// //       return
// //     }
// //     const [s1, s2] = this._sewers
// //     const onS1 = Math.abs(this.player.tileX - s1.x) <= 1 && Math.abs(this.player.tileY - s1.y) <= 1
// //     const onS2 = Math.abs(this.player.tileX - s2.x) <= 1 && Math.abs(this.player.tileY - s2.y) <= 1

// //     if (onS1 || onS2) {
// //       const dest = onS1 ? s2 : s1
// //       this.player.pixelX = dest.x * T + T / 2
// //       this.player.pixelY = dest.y * T + T / 2
// //       this.player.tileX  = dest.x
// //       this.player.tileY  = dest.y
// //       this._sewerCooldown = 2.0
// //       this.screenShake.shake(0.4)
// //       // Sewer makes noise — alert nearby guards
// //       this.heatmap.spike(dest.x, dest.y, 8)
// //     }
// //   }

// //   // _render(dt = 0.016) {
// //   //   const { ctx, grid, player, guards, heatmap, debug } = this

// //   //   const shake = this.screenShake.update(dt)
// //   //   ctx.save()
// //   //   ctx.translate(shake.x, shake.y)
// //   //   ctx.clearRect(-30, -30, CANVAS.WIDTH + 60, CANVAS.HEIGHT + 60)

// //   //   // 1. Tiles (with lights out flag)
// //   //   Tilemap.draw(ctx, grid, this._lightsOut)

// //   //   // 2. Heatmap debug
// //   //   if (debug) Tilemap.drawHeatmap(ctx, heatmap, grid)

// //   //   // 3. Red zone warning overlay
// //   //   this._drawRedZoneWarning(ctx, grid)

// //   //   // 4. Spotlights before fog
// //   //   for (const g of guards) {
// //   //     Spotlight.draw(ctx, g.pixelX, g.pixelY, g._facingAngle ?? 0, g.visionPx, g.alertLevel, g.state)
// //   //   }

// //   //   // 5. Fog
// //   //   if (!debug) {
// //   //     const visionR = this._lightsOut
// //   //       ? player.visionPx * 0.55
// //   //       : player.visionPx
// //   //     Tilemap.drawFog(ctx, player.pixelX, player.pixelY, visionR, CANVAS.WIDTH, CANVAS.HEIGHT)
// //   //   }

// //   //   // 6. Hearing rings
// //   // 
// //   //   // 7. Radio lines
// //   //   this._drawRadioLines(ctx)

// //   //   // 8. Sprites
// //   //   for (const g of guards) g.draw(ctx, debug)
// //   //   player.draw(ctx)

// //   //   // 9. Escape UI
// //   //   this._drawEscapeUI(ctx)

// //   //   // 10. Lights out warning
// //   //   if (this._lightsOut) this._drawLightsOutOverlay(ctx)

// //   //   // 11. Red vignette when spotted
// //   //   if (this._wasSpotted) {
// //   //     const pulse = 0.15 + 0.08 * Math.sin(Date.now() / 80)
// //   //     ctx.fillStyle = `rgba(255,0,0,${pulse})`
// //   //     ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)
// //   //   }

// //   //   ctx.restore()
// //   // }
// //   _render(dt = 0.016) {
// //   const { ctx, grid, player, guards, heatmap, debug } = this

// //   const shake = this.screenShake.update(dt)
// //   ctx.save()
// //   ctx.translate(shake.x, shake.y)
// //   ctx.clearRect(-30, -30, CANVAS.WIDTH + 60, CANVAS.HEIGHT + 60)

// //   // 1. City tiles (keycard drawn here gets covered by fog — intentional)
// //   Tilemap.draw(ctx, grid, this._lightsOut)

// //   // 2. Heatmap debug
// //   if (debug) Tilemap.drawHeatmap(ctx, heatmap, grid)

// //   // 3. Red zone warning
// //   this._drawRedZoneWarning(ctx, grid)

// //   // 4. Spotlights before fog
// //   for (const g of guards) {
// //     Spotlight.draw(ctx, g.pixelX, g.pixelY, g._facingAngle ?? 0, g.visionPx, g.alertLevel, g.state)
// //   }

// //   // 5. Fog
// //   if (!debug) {
// //     const visionR = this._lightsOut ? player.visionPx * 0.55 : player.visionPx
// //     Tilemap.drawFog(ctx, player.pixelX, player.pixelY, visionR, CANVAS.WIDTH, CANVAS.HEIGHT)
// //   }

// //   // 6. All remaining keycards drawn AFTER fog — always visible
// //   if (!this.keycard.isUnlocked) this._drawKeycardAboveFog(ctx)

// //   // 7. Hearing rings
// //   this._drawHearingRings(ctx)

// //   // 8. Radio lines
// //   this._drawRadioLines(ctx)

// //   // 9. Sprites
// //   for (const g of guards) g.draw(ctx, debug)
// //   player.draw(ctx)

// //   // 10. Escape UI always on top
// //   this._drawEscapeUI(ctx)

// //   // 11. Lights out overlay
// //   if (this._lightsOut) this._drawLightsOutOverlay(ctx)

// //   // 12. Red vignette when spotted
// //   if (this._wasSpotted) {
// //     const pulse = 0.15 + 0.08 * Math.sin(Date.now() / 80)
// //     ctx.fillStyle = `rgba(255,0,0,${pulse})`
// //     ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)
// //   }

// //   // 13. Red zone — pulsing orange border + warning text
// //   if (this.grid?.get(this.player.tileX, this.player.tileY) === TILE.REDZONE) {
// //     const p  = 0.5 + 0.5 * Math.sin(Date.now() / 120)
// //     const bw = 14
// //     ctx.fillStyle = `rgba(255,80,0,${0.3 + p * 0.2})`
// //     ctx.fillRect(0, 0, CANVAS.WIDTH, bw)
// //     ctx.fillRect(0, CANVAS.HEIGHT - bw, CANVAS.WIDTH, bw)
// //     ctx.fillRect(0, 0, bw, CANVAS.HEIGHT)
// //     ctx.fillRect(CANVAS.WIDTH - bw, 0, bw, CANVAS.HEIGHT)
// //     ctx.font      = 'bold 13px monospace'
// //     ctx.textAlign = 'center'
// //     ctx.fillStyle   = `rgba(255,120,0,${0.8 + p * 0.2})`
// //     ctx.shadowBlur  = 10
// //     ctx.shadowColor = '#ff5500'
// //     ctx.fillText('⚠ RED ZONE — ALL GUARDS CONVERGING', CANVAS.WIDTH / 2, 28)
// //     ctx.shadowBlur  = 0
// //   }

// //   ctx.restore()
// // }

// // _drawKeycardAboveFog(ctx) {
// //   const positions = this.keycard.remaining
// //   if (!positions.length) return
// //   const T   = TILE_SIZE
// //   const now = Date.now()
// //   const total = this.keycard._total

// //   for (let ki = 0; ki < positions.length; ki++) {
// //     const pos   = positions[ki]
// //     const cx    = pos.x * T + T / 2
// //     const cy    = pos.y * T + T / 2
// //     const bob   = Math.sin(now / 400 + ki) * 3
// //     const pulse = 0.5 + 0.5 * Math.sin(now / 300 + ki * 1.2)

// //     ctx.fillStyle = 'rgba(255,220,0,0.22)'
// //     ctx.fillRect(pos.x * T, pos.y * T, T, T)

// //     ctx.strokeStyle = `rgba(255,220,0,${0.5 + pulse * 0.5})`
// //     ctx.lineWidth   = 2
// //     ctx.shadowBlur  = 16
// //     ctx.shadowColor = '#ffdd00'
// //     ctx.beginPath()
// //     ctx.arc(cx, cy, T * (0.9 + pulse * 0.3), 0, Math.PI * 2)
// //     ctx.stroke()
// //     ctx.shadowBlur = 0

// //     ctx.font      = `${Math.floor(T * 0.9)}px serif`
// //     ctx.textAlign = 'center'
// //     ctx.shadowBlur  = 14
// //     ctx.shadowColor = '#ffdd00'
// //     ctx.fillText('🗝️', cx, cy + T * 0.3 + bob)
// //     ctx.shadowBlur = 0

// //     // Show "KEY 1/3" label if multiple
// //     const label = total > 1 ? `KEY ${ki + 1}/${total}` : 'KEY'
// //     ctx.font        = `bold ${Math.floor(T * 0.5)}px 'Orbitron', monospace`
// //     ctx.fillStyle   = '#ffdd00'
// //     ctx.shadowBlur  = 8
// //     ctx.shadowColor = '#ffaa00'
// //     ctx.fillText(label, cx, cy - T * 0.8 + bob)
// //     ctx.shadowBlur = 0

// //     const arrowBob = Math.sin(now / 250 + ki) * 4
// //     ctx.fillStyle   = '#ffdd00'
// //     ctx.shadowBlur  = 6
// //     ctx.shadowColor = '#ffaa00'
// //     ctx.beginPath()
// //     ctx.moveTo(cx,            cy - T * 1.2 + arrowBob)
// //     ctx.lineTo(cx - T * 0.22, cy - T * 1.5 + arrowBob)
// //     ctx.lineTo(cx + T * 0.22, cy - T * 1.5 + arrowBob)
// //     ctx.closePath()
// //     ctx.fill()
// //     ctx.shadowBlur = 0
// //   }
// // }

// //   _drawRedZoneWarning(ctx, grid) {
// //     // Pulse red tint on redzone tiles visible to player
// //     const pulse = 0.08 + 0.04 * Math.sin(Date.now() / 400)
// //     for (let y = 0; y < grid.rows; y++) {
// //       for (let x = 0; x < grid.cols; x++) {
// //         if (grid.get(x, y) === TILE.REDZONE) {
// //           ctx.fillStyle = `rgba(200,0,0,${pulse})`
// //           ctx.fillRect(x * T, y * T, T, T)
// //         }
// //       }
// //     }
// //   }

// //   _drawHearingRings(ctx) {
// //     for (const r of this._hearingRings) {
// //       ctx.save()
// //       ctx.globalAlpha = r.life * 0.7
// //       ctx.strokeStyle = `rgba(255,220,0,${r.life})`
// //       ctx.lineWidth   = 1.5
// //       ctx.shadowBlur  = 8
// //       ctx.shadowColor = '#ffcc00'
// //       ctx.beginPath()
// //       ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2)
// //       ctx.stroke()
// //       ctx.restore()
// //     }
// //   }

// //   _drawRadioLines(ctx) {
// //     if (!this._radioLines?.length) return
// //     for (const line of this._radioLines) {
// //       ctx.save()
// //       ctx.globalAlpha = line.life * 0.9
// //       ctx.strokeStyle = '#ff3333'
// //       ctx.lineWidth   = 1.5
// //       ctx.setLineDash([4, 4])
// //       ctx.shadowBlur  = 6
// //       ctx.shadowColor = '#ff3333'
// //       ctx.beginPath()
// //       ctx.moveTo(line.x1, line.y1)
// //       ctx.lineTo(line.x2, line.y2)
// //       ctx.stroke()
// //       ctx.setLineDash([])
// //       ctx.fillStyle   = `rgba(255,200,0,${line.life})`
// //       ctx.shadowBlur  = 10
// //       ctx.shadowColor = '#ffcc00'
// //       ctx.beginPath()
// //       ctx.arc(line.x2, line.y2 - T * 0.9, T * 0.18, 0, Math.PI * 2)
// //       ctx.fill()
// //       ctx.restore()
// //     }
// //   }

// //   _drawEscapeUI(ctx) {
// //     const ex  = this.escapePoint
// //     if (!ex) return
// //     const cx  = ex.x * T + T / 2
// //     const cy  = ex.y * T + T / 2
// //     const now = Date.now()
// //     const locked = !this.keycard.isUnlocked

// //     // Base tile
// //     ctx.fillStyle = locked ? 'rgba(255,80,0,0.4)' : 'rgba(0,255,136,0.5)'
// //     ctx.fillRect(ex.x * T, ex.y * T, T, T)

// //     const color  = locked ? '255,80,0' : '0,255,136'
// //     const hex    = locked ? '#ff5000'  : '#00ff88'

// //     const pulse1 = 0.5 + 0.5 * Math.sin(now / 350)
// //     ctx.strokeStyle = `rgba(${color},${0.6 + pulse1 * 0.4})`
// //     ctx.lineWidth   = 2.5
// //     ctx.shadowBlur  = 20
// //     ctx.shadowColor = hex
// //     ctx.beginPath()
// //     ctx.arc(cx, cy, T * (1.1 + pulse1 * 0.4), 0, Math.PI * 2)
// //     ctx.stroke()
// //     ctx.shadowBlur = 0

// //     // Label
// //     ctx.font      = `bold ${T - 2}px 'Orbitron', monospace`
// //     ctx.textAlign = 'center'
// //     const remaining = this.keycard.remaining?.length || 0
// //     const total     = this.keycard._total || 1
// //     const got       = total - remaining
// //     const label     = locked
// //       ? (total > 1 ? `🔒 KEY ${got}/${total}` : '🔒 KEY?')
// //       : 'EXIT'
// //     const labelY  = cy - T * 1.9
// //     ctx.fillStyle = 'rgba(0,0,0,0.9)'
// //     ctx.fillText(label, cx + 1, labelY + 1)
// //     ctx.fillStyle   = hex
// //     ctx.shadowBlur  = 14
// //     ctx.shadowColor = hex
// //     ctx.fillText(label, cx, labelY)
// //     ctx.shadowBlur = 0

// //     // Arrow (only when unlocked)
// //     if (!locked) {
// //       const arrowBob = Math.sin(now / 280) * 4
// //       ctx.fillStyle   = '#00ff88'
// //       ctx.shadowBlur  = 10
// //       ctx.shadowColor = '#00ff88'
// //       ctx.beginPath()
// //       ctx.moveTo(cx,           cy - T * 1.0 + arrowBob)
// //       ctx.lineTo(cx - T * 0.3, cy - T * 1.4 + arrowBob)
// //       ctx.lineTo(cx + T * 0.3, cy - T * 1.4 + arrowBob)
// //       ctx.closePath()
// //       ctx.fill()
// //       ctx.shadowBlur = 0
// //     }
// //   }

// //   _drawLightsOutOverlay(ctx) {
// //     // Dark vignette around edges
// //     const grd = ctx.createRadialGradient(
// //       CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2, CANVAS.HEIGHT * 0.2,
// //       CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2, CANVAS.HEIGHT * 0.8
// //     )
// //     grd.addColorStop(0, 'rgba(0,0,0,0)')
// //     grd.addColorStop(1, 'rgba(0,0,10,0.7)')
// //     ctx.fillStyle = grd
// //     ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)

// //     // Warning text
// //     const alpha = 0.5 + 0.5 * Math.sin(Date.now() / 500)
// //     ctx.font      = `bold ${T}px 'Orbitron', monospace`
// //     ctx.textAlign = 'center'
// //     ctx.fillStyle = `rgba(100,100,255,${alpha})`
// //     ctx.shadowBlur  = 12
// //     ctx.shadowColor = '#4444ff'
// //     ctx.fillText('⚡ LIGHTS OUT', CANVAS.WIDTH / 2, 60)
// //     ctx.shadowBlur = 0
// //   }

// //   _endRound(result) {
// //     this.stop()
// //     this.state = 'end'
// //     this.ga.evolve()
// //     EventBus.emit('round:end', {
// //       result,
// //       generation: this.ga.generation,
// //       escaped:    this.escaped,
// //       guards:     this.guards.length,
// //       bestGene:   this.ga.best,
// //       gaHistory:  this.ga.history,
// //       mode:       this._mode,
// //       difficulty: this._difficulty,
// //     })
// //   }

// //   // _bindKeys() {
// //   //   const BLOCK_SCROLL = new Set([
// //   //     'ArrowUp','ArrowDown','ArrowLeft','ArrowRight',
// //   //     'Space','Tab','PageUp','PageDown','Home','End',
// //   //   ])
// //   //   window.addEventListener('keydown', e => {
// //   //     if (BLOCK_SCROLL.has(e.code)) e.preventDefault()
// //   //     this.keys[e.code] = true
// //   //     if (e.code === 'Tab') this.debug = !this.debug
// //   //   })
// //   //   window.addEventListener('keyup', e => { this.keys[e.code] = false })
// //   // }
// //   _bindKeys() {
// //   const BLOCK_SCROLL = new Set([
// //     'ArrowUp','ArrowDown','ArrowLeft','ArrowRight',
// //     'Space','Tab','PageUp','PageDown','Home','End',
// //   ])
// //   window.addEventListener('keydown', e => {
// //     if (BLOCK_SCROLL.has(e.code)) e.preventDefault()
// //     this.keys[e.code] = true
// //     if (e.code === 'Tab') this.debug = !this.debug
// //   })
// //   window.addEventListener('keyup', e => { this.keys[e.code] = false })
// // }

// //   drawMenuPreview() {
// //     const { grid } = CityGenerator.generate(42)
// //     this.ctx.clearRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)
// //     Tilemap.draw(this.ctx, grid)
// //     this.ctx.fillStyle = 'rgba(5,5,8,0.65)'
// //     this.ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)
// //   }
// // }
// import { CityGenerator }   from '../world/CityGenerator.js'
// import { Tilemap }          from '../world/Tilemap.js'
// import { Player }           from '../player/Player.js'
// import { Guard }            from '../systems/Guard.js'
// import { HeatMap }          from '../ai/HeatMap.js'
// import { GeneticAlgorithm } from '../ai/GeneticAlgorithm.js'
// import { EventBus }         from '../systems/EventBus.js'
// import { ScreenShake }      from '../systems/ScreenShake.js'
// import { Spotlight }        from '../systems/Spotlight.js'
// import { KeycardSystem }    from '../systems/KeycardSystem.js'
// import { WantedSystem }     from '../systems/WantedSystem.js'
// import { CANVAS, TILE_SIZE, TILE } from './constants.js'

// const T = TILE_SIZE

// export class Game {
//   constructor(canvas) {
//     this.canvas = canvas
//     this.ctx    = canvas.getContext('2d')
//     canvas.width  = CANVAS.WIDTH
//     canvas.height = CANVAS.HEIGHT

//     this.state   = 'menu'
//     this.escaped = 0
//     this.keys    = {}
//     this.debug   = false

//     this.ga          = new GeneticAlgorithm()
//     this.heatmap     = new HeatMap()
//     this.screenShake = new ScreenShake()
//     this.keycard     = new KeycardSystem()
//     this.wanted      = new WantedSystem()

//     this._wasSpotted  = false
//     this._radioLines  = []
//     this._hearingRings = []
//     this._lightsOut   = false
//     this._sewers      = []

//     this._loop   = this._loop.bind(this)
//     this._lastTs = null
//     this._rafId  = null

//     this._bindKeys()
//   }

//   // Difficulty modifier table
//   static _diffConfig(difficulty) {
//     // ROUND_CFG.INITIAL_GUARDS = 5, so guardMult 0.8 = 4 guards round 1
//     const D = {
//       routine:  { guardMult:0.8,  timeMult:1.0,  speedMult:1.0,  visionMult:1.0,  keycards:1, lightsOutAt:75  },
//       alert:    { guardMult:1.0,  timeMult:0.93, speedMult:1.05, visionMult:1.1,  keycards:1, lightsOutAt:75  },
//       lockdown: { guardMult:1.4,  timeMult:0.87, speedMult:1.1,  visionMult:1.2,  keycards:2, lightsOutAt:75  },
//       manhunt:  { guardMult:1.8,  timeMult:0.77, speedMult:1.25, visionMult:1.35, keycards:2, lightsOutAt:60  },
//     }
//     return D[difficulty] || D.routine
//   }

//   startRound(config = {}) {
//     const { mode = 'city', difficulty = 'routine' } = config
//     this._mode       = mode
//     this._difficulty = difficulty
//     const diff       = Game._diffConfig(difficulty)

//     const { grid, playerStart, escapePoint, guardSpawns, sewers, keycardPos, keycardPositions } =
//       CityGenerator.generate(Date.now(), { mapType: mode, keycards: diff.keycards })

//     this.grid         = grid
//     this.escapePoint  = escapePoint
//     this._sewers      = sewers || []
//     this._lightsOutAt = diff.lightsOutAt
//     this.player       = new Player(playerStart.x, playerStart.y)
//     this.heatmap.reset()
//     this.keycard.reset(keycardPositions || keycardPos, diff.keycards)
//     this.wanted.reset()
//     this._radioLines   = []
//     this._hearingRings = []
//     this._wasSpotted   = false
//     this._lightsOut    = false

//     // Guard count fixed per mode — difficulty multiplier applied on top
//     const MODE_GUARDS = {
//       city:       6,   // balanced urban patrol
//       warehouse:  5,   // sparse but open sightlines
//       slums:      8,   // crowded dense streets
//       industrial: 7,   // heavy facility security
//     }
//     const baseGuards = MODE_GUARDS[mode] || 6
//     const numGuards  = Math.max(1, Math.round(baseGuards * diff.guardMult))

//     this.guards = guardSpawns.slice(0, numGuards).map((sp, i) =>
//       new Guard({
//         tileX:      sp.x,
//         tileY:      sp.y,
//         gene:       this.ga.geneFor(i),
//         id:         i,
//         geneIdx:    i % this.ga.population.length,
//         grid,
//         escapeTile: escapePoint,
//         speedMult:  diff.speedMult,
//         visionMult: diff.visionMult,
//       })
//     )

//     this.timeLeft = 150 * diff.timeMult
//     this._lastTs  = null
//     this.state    = 'playing'

//     if (this._rafId) cancelAnimationFrame(this._rafId)
//     this._rafId = requestAnimationFrame(this._loop)
//   }

//   stop() {
//     if (this._rafId) cancelAnimationFrame(this._rafId)
//     this._rafId = null
//   }

//   _loop(ts) {
//     if (this.state !== 'playing') return
//     const dt = this._lastTs
//       ? Math.min((ts - this._lastTs) / 1000, 0.05)
//       : 0.016
//     this._lastTs   = ts
//     this.timeLeft -= dt
//     this._update(dt)
//     this._render(dt)
//     this._rafId = requestAnimationFrame(this._loop)
//   }

//   _update(dt) {
//     this.player.update(dt, this.grid, this.keys)

//     // Lights out
//     this._lightsOut = this.timeLeft <= (this._lightsOutAt ?? 75)
//     // Lights out: just 10% radius reduction — not pitch black

//     // Keycard pickup
//     const justCollected = this.keycard.update(
//       this.player.tileX, this.player.tileY, this.grid
//     )
//     if (justCollected) this.screenShake.shake(0.3)

//     // Wanted level
//     this.wanted.update(dt, this._wasSpotted)

//     // Sewer teleport
//     this._checkSewer()

//     this.heatmap.decay()
//     if (Math.random() < 0.016) this.heatmap.spread()

//     const pTile    = { x: this.player.tileX, y: this.player.tileY }
//     let anySpotted = false
//     let spotter    = null

//     // Red zone — stepping on it forces CHASE on ALL guards immediately
//     const onRedZone = this.grid.get(pTile.x, pTile.y) === TILE.REDZONE
//     if (onRedZone) {
//       for (const g of this.guards) {
//         g.alertLevel      = 1.0
//         g.lastKnownPlayer = { ...pTile }
//         g.state           = 'chase'
//       }
//       this.heatmap.spike(pTile.x, pTile.y, 10)
//       if (!this._redZoneShook) { this.screenShake.shake(0.6); this._redZoneShook = true }
//     } else {
//       this._redZoneShook = false
//     }

//     for (const g of this.guards) {
//       const visible = g.canSeePlayer(this.player.pixelX, this.player.pixelY)
//       const heard   = g.hearPlayer(pTile, this.player.noise)

//       if (visible) { anySpotted = true; spotter = g }

//       g.setHearing(heard)

//       if (heard) {
//         g.alertLevel = Math.min(1, g.alertLevel + 0.05)
//         if (g.alertLevel > 0.5 && !g.lastKnownPlayer)
//           g.lastKnownPlayer = { ...pTile }
//         if (g.alertLevel > 0.5 && (g.alertLevel - 0.05) <= 0.5)
//           this.screenShake.shake(0.25)
//       }

//       g.update(dt, pTile, visible, this.heatmap, this.guards, this.ga, this.wanted.speedMult)
//     }

//     if (anySpotted && !this._wasSpotted) this.screenShake.shake(0.7)
//     this._wasSpotted = anySpotted

//     // // Radio lines
//     // if (anySpotted && spotter) {
//     //   this._radioLines = this.guards
//     //     .filter(g => g !== spotter)
//     //     .map(g => ({ x1: spotter.pixelX, y1: spotter.pixelY, x2: g.pixelX, y2: g.pixelY, life: 1.0 }))
//     // }
//     // if (this._radioLines.length) {
//     //   this._radioLines.forEach(l => l.life -= dt * 1.8)
//     //   this._radioLines = this._radioLines.filter(l => l.life > 0)
//     // }

//     if (anySpotted) this.heatmap.spike(pTile.x, pTile.y, 5)
//     else if (Math.random() < 0.01) this.heatmap.spike(pTile.x, pTile.y, 1)

//     this.globalAlert = anySpotted

//     // Caught
//     const caught = this.guards.some(g =>
//       Math.hypot(g.pixelX - this.player.pixelX, g.pixelY - this.player.pixelY) < T * 0.85
//     )
//     if (caught) {
//       this.screenShake.shake(1.0)
//       this.guards.forEach(g => {
//         if (Math.hypot(g.pixelX - this.player.pixelX, g.pixelY - this.player.pixelY) < T * 0.85)
//           this.ga.recordCapture(g.geneIdx)
//       })
//       this._endRound('caught')
//       return
//     }

//     // Escape — only if keycard collected
//     const distToEscape = Math.hypot(
//       this.player.pixelX - (this.escapePoint.x * T + T / 2),
//       this.player.pixelY - (this.escapePoint.y * T + T / 2)
//     )
//     if (distToEscape < T * 1.2) {
//       if (!this.keycard.isUnlocked) {
//         // Flash warning — no keycard
//         this.screenShake.shake(0.2)
//       } else {
//         this.escaped++
//         this._endRound('escaped')
//         return
//       }
//     }

//     if (this.timeLeft <= 0) this._endRound('timeout')
//   }

//   _checkSewer() {
//     if (this._sewers.length < 2) return
//     if (this._sewerCooldown > 0) {
//       this._sewerCooldown -= 0.016
//       return
//     }
//     const [s1, s2] = this._sewers
//     const onS1 = Math.abs(this.player.tileX - s1.x) <= 1 && Math.abs(this.player.tileY - s1.y) <= 1
//     const onS2 = Math.abs(this.player.tileX - s2.x) <= 1 && Math.abs(this.player.tileY - s2.y) <= 1

//     if (onS1 || onS2) {
//       const dest = onS1 ? s2 : s1
//       this.player.pixelX = dest.x * T + T / 2
//       this.player.pixelY = dest.y * T + T / 2
//       this.player.tileX  = dest.x
//       this.player.tileY  = dest.y
//       this._sewerCooldown = 2.0
//       this.screenShake.shake(0.4)
//       // Sewer makes noise — alert nearby guards
//       this.heatmap.spike(dest.x, dest.y, 8)
//     }
//   }

//   // _render(dt = 0.016) {
//   //   const { ctx, grid, player, guards, heatmap, debug } = this

//   //   const shake = this.screenShake.update(dt)
//   //   ctx.save()
//   //   ctx.translate(shake.x, shake.y)
//   //   ctx.clearRect(-30, -30, CANVAS.WIDTH + 60, CANVAS.HEIGHT + 60)

//   //   // 1. Tiles (with lights out flag)
//   //   Tilemap.draw(ctx, grid, this._lightsOut)

//   //   // 2. Heatmap debug
//   //   if (debug) Tilemap.drawHeatmap(ctx, heatmap, grid)

//   //   // 3. Red zone warning overlay
//   //   this._drawRedZoneWarning(ctx, grid)

//   //   // 4. Spotlights before fog
//   //   for (const g of guards) {
//   //     Spotlight.draw(ctx, g.pixelX, g.pixelY, g._facingAngle ?? 0, g.visionPx, g.alertLevel, g.state)
//   //   }

//   //   // 5. Fog
//   //   if (!debug) {
//   //     const visionR = this._lightsOut
//   //       ? player.visionPx * 0.55
//   //       : player.visionPx
//   //     Tilemap.drawFog(ctx, player.pixelX, player.pixelY, visionR, CANVAS.WIDTH, CANVAS.HEIGHT)
//   //   }

//   //   // 6. Hearing rings
//   // 
//   //   // 7. Radio lines
//   //   this._drawRadioLines(ctx)

//   //   // 8. Sprites
//   //   for (const g of guards) g.draw(ctx, debug)
//   //   player.draw(ctx)

//   //   // 9. Escape UI
//   //   this._drawEscapeUI(ctx)

//   //   // 10. Lights out warning
//   //   if (this._lightsOut) this._drawLightsOutOverlay(ctx)

//   //   // 11. Red vignette when spotted
//   //   if (this._wasSpotted) {
//   //     const pulse = 0.15 + 0.08 * Math.sin(Date.now() / 80)
//   //     ctx.fillStyle = `rgba(255,0,0,${pulse})`
//   //     ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)
//   //   }

//   //   ctx.restore()
//   // }
//   _render(dt = 0.016) {
//   const { ctx, grid, player, guards, heatmap, debug } = this

//   const shake = this.screenShake.update(dt)
//   ctx.save()
//   ctx.translate(shake.x, shake.y)
//   ctx.clearRect(-30, -30, CANVAS.WIDTH + 60, CANVAS.HEIGHT + 60)

//   // 1. City tiles (keycard drawn here gets covered by fog — intentional)
//   Tilemap.draw(ctx, grid, this._lightsOut)

//   // 2. Heatmap debug
//   if (debug) Tilemap.drawHeatmap(ctx, heatmap, grid)

//   // 3. Red zone warning
//   this._drawRedZoneWarning(ctx, grid)

//   // 4. Spotlights before fog
//   for (const g of guards) {
//     Spotlight.draw(ctx, g.pixelX, g.pixelY, g._facingAngle ?? 0, g.visionPx, g.alertLevel, g.state)
//   }

//   // 5. Fog
//   if (!debug) {
//     const visionR = this._lightsOut ? player.visionPx * 0.9 : player.visionPx
//     Tilemap.drawFog(ctx, player.pixelX, player.pixelY, visionR, CANVAS.WIDTH, CANVAS.HEIGHT)
//   }

//   // 6. All remaining keycards drawn AFTER fog — always visible
//   if (!this.keycard.isUnlocked) this._drawKeycardAboveFog(ctx)

//   // 7. Hearing rings
//   this._drawHearingRings(ctx)

//   // 8. Radio lines
//   this._drawRadioLines(ctx)

//   // 9. Sprites
//   for (const g of guards) g.draw(ctx, debug)
//   player.draw(ctx)

//   // 10. Escape UI always on top
//   this._drawEscapeUI(ctx)

//   // 11. Lights out overlay
//   if (this._lightsOut) this._drawLightsOutOverlay(ctx)

//   // 12. Red vignette when spotted
//   if (this._wasSpotted) {
//     const pulse = 0.15 + 0.08 * Math.sin(Date.now() / 80)
//     ctx.fillStyle = `rgba(255,0,0,${pulse})`
//     ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)
//   }

//   // 13. Red zone — pulsing orange border + warning text
//   if (this.grid?.get(this.player.tileX, this.player.tileY) === TILE.REDZONE) {
//     const p  = 0.5 + 0.5 * Math.sin(Date.now() / 120)
//     const bw = 14
//     ctx.fillStyle = `rgba(255,80,0,${0.3 + p * 0.2})`
//     ctx.fillRect(0, 0, CANVAS.WIDTH, bw)
//     ctx.fillRect(0, CANVAS.HEIGHT - bw, CANVAS.WIDTH, bw)
//     ctx.fillRect(0, 0, bw, CANVAS.HEIGHT)
//     ctx.fillRect(CANVAS.WIDTH - bw, 0, bw, CANVAS.HEIGHT)
//     ctx.font      = 'bold 13px monospace'
//     ctx.textAlign = 'center'
//     ctx.fillStyle   = `rgba(255,120,0,${0.8 + p * 0.2})`
//     ctx.shadowBlur  = 10
//     ctx.shadowColor = '#ff5500'
//     ctx.fillText('⚠ RED ZONE — ALL GUARDS CONVERGING', CANVAS.WIDTH / 2, 28)
//     ctx.shadowBlur  = 0
//   }

//   ctx.restore()
// }

// _drawKeycardAboveFog(ctx) {
//   const positions = this.keycard.remaining
//   if (!positions.length) return
//   const T   = TILE_SIZE
//   const now = Date.now()
//   const total = this.keycard._total

//   for (let ki = 0; ki < positions.length; ki++) {
//     const pos   = positions[ki]
//     const cx    = pos.x * T + T / 2
//     const cy    = pos.y * T + T / 2
//     const bob   = Math.sin(now / 400 + ki) * 3
//     const pulse = 0.5 + 0.5 * Math.sin(now / 300 + ki * 1.2)

//     ctx.fillStyle = 'rgba(255,220,0,0.22)'
//     ctx.fillRect(pos.x * T, pos.y * T, T, T)

//     ctx.strokeStyle = `rgba(255,220,0,${0.5 + pulse * 0.5})`
//     ctx.lineWidth   = 2
//     ctx.shadowBlur  = 16
//     ctx.shadowColor = '#ffdd00'
//     ctx.beginPath()
//     ctx.arc(cx, cy, T * (0.9 + pulse * 0.3), 0, Math.PI * 2)
//     ctx.stroke()
//     ctx.shadowBlur = 0

//     ctx.font      = `${Math.floor(T * 0.9)}px serif`
//     ctx.textAlign = 'center'
//     ctx.shadowBlur  = 14
//     ctx.shadowColor = '#ffdd00'
//     ctx.fillText('🗝️', cx, cy + T * 0.3 + bob)
//     ctx.shadowBlur = 0

//     // Show "KEY 1/3" label if multiple
//     const label = total > 1 ? `KEY ${ki + 1}/${total}` : 'KEY'
//     ctx.font        = `bold ${Math.floor(T * 0.5)}px 'Orbitron', monospace`
//     ctx.fillStyle   = '#ffdd00'
//     ctx.shadowBlur  = 8
//     ctx.shadowColor = '#ffaa00'
//     ctx.fillText(label, cx, cy - T * 0.8 + bob)
//     ctx.shadowBlur = 0

//     const arrowBob = Math.sin(now / 250 + ki) * 4
//     ctx.fillStyle   = '#ffdd00'
//     ctx.shadowBlur  = 6
//     ctx.shadowColor = '#ffaa00'
//     ctx.beginPath()
//     ctx.moveTo(cx,            cy - T * 1.2 + arrowBob)
//     ctx.lineTo(cx - T * 0.22, cy - T * 1.5 + arrowBob)
//     ctx.lineTo(cx + T * 0.22, cy - T * 1.5 + arrowBob)
//     ctx.closePath()
//     ctx.fill()
//     ctx.shadowBlur = 0
//   }
// }

//   _drawRedZoneWarning(ctx, grid) {
//     // Pulse red tint on redzone tiles visible to player
//     const pulse = 0.08 + 0.04 * Math.sin(Date.now() / 400)
//     for (let y = 0; y < grid.rows; y++) {
//       for (let x = 0; x < grid.cols; x++) {
//         if (grid.get(x, y) === TILE.REDZONE) {
//           ctx.fillStyle = `rgba(200,0,0,${pulse})`
//           ctx.fillRect(x * T, y * T, T, T)
//         }
//       }
//     }
//   }

//   _drawHearingRings(ctx) {
//     for (const r of this._hearingRings) {
//       ctx.save()
//       ctx.globalAlpha = r.life * 0.7
//       ctx.strokeStyle = `rgba(255,220,0,${r.life})`
//       ctx.lineWidth   = 1.5
//       ctx.shadowBlur  = 8
//       ctx.shadowColor = '#ffcc00'
//       ctx.beginPath()
//       ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2)
//       ctx.stroke()
//       ctx.restore()
//     }
//   }

//   _drawRadioLines(ctx) {
//     if (!this._radioLines?.length) return
//     for (const line of this._radioLines) {
//       ctx.save()
//       ctx.globalAlpha = line.life * 0.9
//       ctx.strokeStyle = '#ff3333'
//       ctx.lineWidth   = 1.5
//       ctx.setLineDash([4, 4])
//       ctx.shadowBlur  = 6
//       ctx.shadowColor = '#ff3333'
//       ctx.beginPath()
//       ctx.moveTo(line.x1, line.y1)
//       ctx.lineTo(line.x2, line.y2)
//       ctx.stroke()
//       ctx.setLineDash([])
//       ctx.fillStyle   = `rgba(255,200,0,${line.life})`
//       ctx.shadowBlur  = 10
//       ctx.shadowColor = '#ffcc00'
//       ctx.beginPath()
//       ctx.arc(line.x2, line.y2 - T * 0.9, T * 0.18, 0, Math.PI * 2)
//       ctx.fill()
//       ctx.restore()
//     }
//   }

//   _drawEscapeUI(ctx) {
//     const ex  = this.escapePoint
//     if (!ex) return
//     const cx  = ex.x * T + T / 2
//     const cy  = ex.y * T + T / 2
//     const now = Date.now()
//     const locked = !this.keycard.isUnlocked

//     // Base tile
//     ctx.fillStyle = locked ? 'rgba(255,80,0,0.4)' : 'rgba(0,255,136,0.5)'
//     ctx.fillRect(ex.x * T, ex.y * T, T, T)

//     const color  = locked ? '255,80,0' : '0,255,136'
//     const hex    = locked ? '#ff5000'  : '#00ff88'

//     const pulse1 = 0.5 + 0.5 * Math.sin(now / 350)
//     ctx.strokeStyle = `rgba(${color},${0.6 + pulse1 * 0.4})`
//     ctx.lineWidth   = 2.5
//     ctx.shadowBlur  = 20
//     ctx.shadowColor = hex
//     ctx.beginPath()
//     ctx.arc(cx, cy, T * (1.1 + pulse1 * 0.4), 0, Math.PI * 2)
//     ctx.stroke()
//     ctx.shadowBlur = 0

//     // Label
//     ctx.font      = `bold ${T - 2}px 'Orbitron', monospace`
//     ctx.textAlign = 'center'
//     const remaining = this.keycard.remaining?.length || 0
//     const total     = this.keycard._total || 1
//     const got       = total - remaining
//     const label     = locked
//       ? (total > 1 ? `🔒 KEY ${got}/${total}` : '🔒 KEY?')
//       : 'EXIT'
//     const labelY  = cy - T * 1.9
//     ctx.fillStyle = 'rgba(0,0,0,0.9)'
//     ctx.fillText(label, cx + 1, labelY + 1)
//     ctx.fillStyle   = hex
//     ctx.shadowBlur  = 14
//     ctx.shadowColor = hex
//     ctx.fillText(label, cx, labelY)
//     ctx.shadowBlur = 0

//     // Arrow (only when unlocked)
//     if (!locked) {
//       const arrowBob = Math.sin(now / 280) * 4
//       ctx.fillStyle   = '#00ff88'
//       ctx.shadowBlur  = 10
//       ctx.shadowColor = '#00ff88'
//       ctx.beginPath()
//       ctx.moveTo(cx,           cy - T * 1.0 + arrowBob)
//       ctx.lineTo(cx - T * 0.3, cy - T * 1.4 + arrowBob)
//       ctx.lineTo(cx + T * 0.3, cy - T * 1.4 + arrowBob)
//       ctx.closePath()
//       ctx.fill()
//       ctx.shadowBlur = 0
//     }
//   }

//   _drawLightsOutOverlay(ctx) {
//     // Dark vignette around edges
//     const grd = ctx.createRadialGradient(
//       CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2, CANVAS.HEIGHT * 0.2,
//       CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2, CANVAS.HEIGHT * 0.8
//     )
//     grd.addColorStop(0, 'rgba(0,0,0,0)')
//     grd.addColorStop(1, 'rgba(0,0,10,0.7)')
//     ctx.fillStyle = grd
//     ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)

//     // Warning text
//     const alpha = 0.5 + 0.5 * Math.sin(Date.now() / 500)
//     ctx.font      = `bold ${T}px 'Orbitron', monospace`
//     ctx.textAlign = 'center'
//     ctx.fillStyle = `rgba(100,100,255,${alpha})`
//     ctx.shadowBlur  = 12
//     ctx.shadowColor = '#4444ff'
//     ctx.fillText('⚡ LIGHTS OUT', CANVAS.WIDTH / 2, 60)
//     ctx.shadowBlur = 0
//   }

//   _endRound(result) {
//     this.stop()
//     this.state = 'end'
//     this.ga.evolve()
//     EventBus.emit('round:end', {
//       result,
//       generation: this.ga.generation,
//       escaped:    this.escaped,
//       guards:     this.guards.length,
//       bestGene:   this.ga.best,
//       gaHistory:  this.ga.history,
//       mode:       this._mode,
//       difficulty: this._difficulty,
//     })
//   }

//   // _bindKeys() {
//   //   const BLOCK_SCROLL = new Set([
//   //     'ArrowUp','ArrowDown','ArrowLeft','ArrowRight',
//   //     'Space','Tab','PageUp','PageDown','Home','End',
//   //   ])
//   //   window.addEventListener('keydown', e => {
//   //     if (BLOCK_SCROLL.has(e.code)) e.preventDefault()
//   //     this.keys[e.code] = true
//   //     if (e.code === 'Tab') this.debug = !this.debug
//   //   })
//   //   window.addEventListener('keyup', e => { this.keys[e.code] = false })
//   // }
//   _bindKeys() {
//   const BLOCK_SCROLL = new Set([
//     'ArrowUp','ArrowDown','ArrowLeft','ArrowRight',
//     'Space','Tab','PageUp','PageDown','Home','End',
//   ])
//   window.addEventListener('keydown', e => {
//     if (BLOCK_SCROLL.has(e.code)) e.preventDefault()
//     this.keys[e.code] = true
//     if (e.code === 'Tab') this.debug = !this.debug
//   })
//   window.addEventListener('keyup', e => { this.keys[e.code] = false })
// }

//   drawMenuPreview() {
//     const { grid } = CityGenerator.generate(42)
//     this.ctx.clearRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)
//     Tilemap.draw(this.ctx, grid)
//     this.ctx.fillStyle = 'rgba(5,5,8,0.65)'
//     this.ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)
//   }
// }

import { CityGenerator }   from '../world/CityGenerator.js'
import { Tilemap }          from '../world/Tilemap.js'
import { Player }           from '../player/Player.js'
import { Guard }            from '../systems/Guard.js'
import { HeatMap }          from '../ai/HeatMap.js'
import { GeneticAlgorithm } from '../ai/GeneticAlgorithm.js'
import { EventBus }         from '../systems/EventBus.js'
import { ScreenShake }      from '../systems/ScreenShake.js'
import { Spotlight }        from '../systems/Spotlight.js'
import { KeycardSystem }    from '../systems/KeycardSystem.js'
import { WantedSystem }     from '../systems/WantedSystem.js'
import { CANVAS, TILE_SIZE, TILE } from './constants.js'

const T = TILE_SIZE

export class Game {
  constructor(canvas) {
    this.canvas = canvas
    this.ctx    = canvas.getContext('2d')
    canvas.width  = CANVAS.WIDTH
    canvas.height = CANVAS.HEIGHT

    this.state   = 'menu'
    this.escaped = 0
    this.keys    = {}
    this.debug   = false

    this.ga          = new GeneticAlgorithm()
    this.heatmap     = new HeatMap()
    this.screenShake = new ScreenShake()
    this.keycard     = new KeycardSystem()
    this.wanted      = new WantedSystem()

    this._wasSpotted  = false
    this._radioLines  = []
    this._hearingRings = []
    this._lightsOut   = false
    this._sewers      = []

    this._loop   = this._loop.bind(this)
    this._lastTs = null
    this._rafId  = null

    this._bindKeys()
  }

  // Difficulty modifier table
  static _diffConfig(difficulty) {
    // ROUND_CFG.INITIAL_GUARDS = 5, so guardMult 0.8 = 4 guards round 1
    const D = {
      routine:  { guardMult:0.8,  timeMult:1.0,  speedMult:1.0,  visionMult:1.0,  keycards:1, lightsOutAt:75  },
      alert:    { guardMult:1.0,  timeMult:0.93, speedMult:1.05, visionMult:1.1,  keycards:1, lightsOutAt:75  },
      lockdown: { guardMult:1.4,  timeMult:0.87, speedMult:1.1,  visionMult:1.2,  keycards:2, lightsOutAt:75  },
      manhunt:  { guardMult:1.8,  timeMult:0.77, speedMult:1.25, visionMult:1.35, keycards:2, lightsOutAt:60  },
    }
    return D[difficulty] || D.routine
  }

  startRound(config = {}) {
    const { mode = 'city', difficulty = 'routine' } = config
    this._mode       = mode
    this._difficulty = difficulty
    const diff       = Game._diffConfig(difficulty)

    const { grid, playerStart, escapePoint, guardSpawns, sewers, keycardPos, keycardPositions } =
      CityGenerator.generate(Date.now(), { mapType: mode, keycards: diff.keycards })

    this.grid         = grid
    this.escapePoint  = escapePoint
    this._sewers      = sewers || []
    this._lightsOutAt = diff.lightsOutAt
    this.player       = new Player(playerStart.x, playerStart.y)
    this.heatmap.reset()
    this.keycard.reset(keycardPositions || keycardPos, diff.keycards)
    this.wanted.reset()
    this._radioLines    = []
    this._hearingRings  = []
    this._wasSpotted    = false
    this._lightsOut     = false
    this._wasHighAlert  = false   // tracks high→mid transition
    this._postGuards    = {}      // { exitGuardId, keyGuardId } assigned after cooldown

    // Guard count fixed per mode — difficulty multiplier applied on top
    const MODE_GUARDS = {
      city:       6,   // balanced urban patrol
      warehouse:  5,   // sparse but open sightlines
      slums:      8,   // crowded dense streets
      industrial: 7,   // heavy facility security
    }
    const baseGuards = MODE_GUARDS[mode] || 6
    const numGuards  = Math.max(1, Math.round(baseGuards * diff.guardMult))

    this.guards = guardSpawns.slice(0, numGuards).map((sp, i) =>
      new Guard({
        tileX:      sp.x,
        tileY:      sp.y,
        gene:       this.ga.geneFor(i),
        id:         i,
        geneIdx:    i % this.ga.population.length,
        grid,
        escapeTile: escapePoint,
        speedMult:  diff.speedMult,
        visionMult: diff.visionMult,
      })
    )

    this.timeLeft = 150 * diff.timeMult
    this._lastTs  = null
    this.state    = 'playing'

    if (this._rafId) cancelAnimationFrame(this._rafId)
    this._rafId = requestAnimationFrame(this._loop)
  }

  stop() {
    if (this._rafId) cancelAnimationFrame(this._rafId)
    this._rafId = null
  }

  _loop(ts) {
    if (this.state !== 'playing') return
    const dt = this._lastTs
      ? Math.min((ts - this._lastTs) / 1000, 0.05)
      : 0.016
    this._lastTs   = ts
    this.timeLeft -= dt
    this._update(dt)
    this._render(dt)
    this._rafId = requestAnimationFrame(this._loop)
  }

  _update(dt) {
    this.player.update(dt, this.grid, this.keys)

    // Lights out
    this._lightsOut = this.timeLeft <= (this._lightsOutAt ?? 75)
    // Lights out: just 10% radius reduction — not pitch black

    // Keycard pickup
    const justCollected = this.keycard.update(
      this.player.tileX, this.player.tileY, this.grid
    )
    if (justCollected) this.screenShake.shake(0.3)

    // Wanted level
    this.wanted.update(dt, this._wasSpotted)

    // Sewer teleport
    this._checkSewer()

    this.heatmap.decay()
    if (Math.random() < 0.016) this.heatmap.spread()

    const pTile    = { x: this.player.tileX, y: this.player.tileY }
    let anySpotted = false
    let spotter    = null

    // Red zone — stepping on it forces CHASE on ALL guards immediately
    const onRedZone = this.grid.get(pTile.x, pTile.y) === TILE.REDZONE
    if (onRedZone) {
      for (const g of this.guards) {
        g.alertLevel      = 1.0
        g.lastKnownPlayer = { ...pTile }
        g.state           = 'chase'
      }
      this.heatmap.spike(pTile.x, pTile.y, 10)
      if (!this._redZoneShook) { this.screenShake.shake(0.6); this._redZoneShook = true }
    } else {
      this._redZoneShook = false
    }

    for (const g of this.guards) {
      const visible = g.canSeePlayer(this.player.pixelX, this.player.pixelY)
      const heard   = g.hearPlayer(pTile, this.player.noise)

      if (visible) { anySpotted = true; spotter = g }

      g.setHearing(heard)

      if (heard) {
        g.alertLevel = Math.min(1, g.alertLevel + 0.05)
        if (g.alertLevel > 0.5 && !g.lastKnownPlayer)
          g.lastKnownPlayer = { ...pTile }
        if (g.alertLevel > 0.5 && (g.alertLevel - 0.05) <= 0.5)
          this.screenShake.shake(0.25)
      }

      g.update(dt, pTile, visible, this.heatmap, this.guards, this.ga, this.wanted.speedMult)
    }

    if (anySpotted && !this._wasSpotted) this.screenShake.shake(0.7)
    this._wasSpotted = anySpotted

    // // Radio lines
    // if (anySpotted && spotter) {
    //   this._radioLines = this.guards
    //     .filter(g => g !== spotter)
    //     .map(g => ({ x1: spotter.pixelX, y1: spotter.pixelY, x2: g.pixelX, y2: g.pixelY, life: 1.0 }))
    // }
    // if (this._radioLines.length) {
    //   this._radioLines.forEach(l => l.life -= dt * 1.8)
    //   this._radioLines = this._radioLines.filter(l => l.life > 0)
    // }

    if (anySpotted) this.heatmap.spike(pTile.x, pTile.y, 5)
    else if (Math.random() < 0.01) this.heatmap.spike(pTile.x, pTile.y, 1)

    this.globalAlert = anySpotted

    // ── Alert transition: HIGH → MID ─────────────────────────
    // When global alert drops from high (any guard alert>0.6) to mid/low,
    // send one guard back to exit and one to nearest uncollected keycard
    const isHighAlert = this.guards.some(g => g.alertLevel > 0.6)
    if (this._wasHighAlert && !isHighAlert) {
      this._assignPostGuards()
    }
    this._wasHighAlert = isHighAlert

    // Caught
    const caught = this.guards.some(g =>
      Math.hypot(g.pixelX - this.player.pixelX, g.pixelY - this.player.pixelY) < T * 0.85
    )
    if (caught) {
      this.screenShake.shake(1.0)
      this.guards.forEach(g => {
        if (Math.hypot(g.pixelX - this.player.pixelX, g.pixelY - this.player.pixelY) < T * 0.85)
          this.ga.recordCapture(g.geneIdx)
      })
      this._endRound('caught')
      return
    }

    // Escape — only if keycard collected
    const distToEscape = Math.hypot(
      this.player.pixelX - (this.escapePoint.x * T + T / 2),
      this.player.pixelY - (this.escapePoint.y * T + T / 2)
    )
    if (distToEscape < T * 1.2) {
      if (!this.keycard.isUnlocked) {
        // Flash warning — no keycard
        this.screenShake.shake(0.2)
      } else {
        this.escaped++
        this._endRound('escaped')
        return
      }
    }

    if (this.timeLeft <= 0) this._endRound('timeout')
  }

  _checkSewer() {
    if (this._sewers.length < 2) return
    if (this._sewerCooldown > 0) {
      this._sewerCooldown -= 0.016
      return
    }
    const [s1, s2] = this._sewers
    const onS1 = Math.abs(this.player.tileX - s1.x) <= 1 && Math.abs(this.player.tileY - s1.y) <= 1
    const onS2 = Math.abs(this.player.tileX - s2.x) <= 1 && Math.abs(this.player.tileY - s2.y) <= 1

    if (onS1 || onS2) {
      const dest = onS1 ? s2 : s1
      this.player.pixelX = dest.x * T + T / 2
      this.player.pixelY = dest.y * T + T / 2
      this.player.tileX  = dest.x
      this.player.tileY  = dest.y
      this._sewerCooldown = 2.0
      this.screenShake.shake(0.4)
      // Sewer makes noise — alert nearby guards
      this.heatmap.spike(dest.x, dest.y, 8)
    }
  }

  // _render(dt = 0.016) {
  //   const { ctx, grid, player, guards, heatmap, debug } = this

  //   const shake = this.screenShake.update(dt)
  //   ctx.save()
  //   ctx.translate(shake.x, shake.y)
  //   ctx.clearRect(-30, -30, CANVAS.WIDTH + 60, CANVAS.HEIGHT + 60)

  //   // 1. Tiles (with lights out flag)
  //   Tilemap.draw(ctx, grid, this._lightsOut)

  //   // 2. Heatmap debug
  //   if (debug) Tilemap.drawHeatmap(ctx, heatmap, grid)

  //   // 3. Red zone warning overlay
  //   this._drawRedZoneWarning(ctx, grid)

  //   // 4. Spotlights before fog
  //   for (const g of guards) {
  //     Spotlight.draw(ctx, g.pixelX, g.pixelY, g._facingAngle ?? 0, g.visionPx, g.alertLevel, g.state)
  //   }

  //   // 5. Fog
  //   if (!debug) {
  //     const visionR = this._lightsOut
  //       ? player.visionPx * 0.55
  //       : player.visionPx
  //     Tilemap.drawFog(ctx, player.pixelX, player.pixelY, visionR, CANVAS.WIDTH, CANVAS.HEIGHT)
  //   }

  //   // 6. Hearing rings
  // 
  //   // 7. Radio lines
  //   this._drawRadioLines(ctx)

  //   // 8. Sprites
  //   for (const g of guards) g.draw(ctx, debug)
  //   player.draw(ctx)

  //   // 9. Escape UI
  //   this._drawEscapeUI(ctx)

  //   // 10. Lights out warning
  //   if (this._lightsOut) this._drawLightsOutOverlay(ctx)

  //   // 11. Red vignette when spotted
  //   if (this._wasSpotted) {
  //     const pulse = 0.15 + 0.08 * Math.sin(Date.now() / 80)
  //     ctx.fillStyle = `rgba(255,0,0,${pulse})`
  //     ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)
  //   }

  //   ctx.restore()
  // }
  _render(dt = 0.016) {
  const { ctx, grid, player, guards, heatmap, debug } = this

  const shake = this.screenShake.update(dt)
  ctx.save()
  ctx.translate(shake.x, shake.y)
  ctx.clearRect(-30, -30, CANVAS.WIDTH + 60, CANVAS.HEIGHT + 60)

  // 1. City tiles (keycard drawn here gets covered by fog — intentional)
  Tilemap.draw(ctx, grid, this._lightsOut)

  // 2. Heatmap debug
  if (debug) Tilemap.drawHeatmap(ctx, heatmap, grid)

  // 3. Red zone warning
  this._drawRedZoneWarning(ctx, grid)

  // 4. Spotlights before fog
  for (const g of guards) {
    Spotlight.draw(ctx, g.pixelX, g.pixelY, g._facingAngle ?? 0, g.visionPx, g.alertLevel, g.state)
  }

  // 5. Fog
  if (!debug) {
    const visionR = this._lightsOut ? player.visionPx * 0.9 : player.visionPx
    Tilemap.drawFog(ctx, player.pixelX, player.pixelY, visionR, CANVAS.WIDTH, CANVAS.HEIGHT)
  }

  // 6. All remaining keycards drawn AFTER fog — always visible
  if (!this.keycard.isUnlocked) this._drawKeycardAboveFog(ctx)

  // 7. Hearing rings
  this._drawHearingRings(ctx)

  // 8. Radio lines
  this._drawRadioLines(ctx)

  // 9. Sprites
  for (const g of guards) g.draw(ctx, debug)
  player.draw(ctx)

  // 10. Escape UI always on top
  this._drawEscapeUI(ctx)

  // 11. Lights out overlay
  if (this._lightsOut) this._drawLightsOutOverlay(ctx)

  // 12. Red vignette when spotted
  if (this._wasSpotted) {
    const pulse = 0.15 + 0.08 * Math.sin(Date.now() / 80)
    ctx.fillStyle = `rgba(255,0,0,${pulse})`
    ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)
  }

  // 13. Red zone — pulsing orange border + warning text
  if (this.grid?.get(this.player.tileX, this.player.tileY) === TILE.REDZONE) {
    const p  = 0.5 + 0.5 * Math.sin(Date.now() / 120)
    const bw = 14
    ctx.fillStyle = `rgba(255,80,0,${0.3 + p * 0.2})`
    ctx.fillRect(0, 0, CANVAS.WIDTH, bw)
    ctx.fillRect(0, CANVAS.HEIGHT - bw, CANVAS.WIDTH, bw)
    ctx.fillRect(0, 0, bw, CANVAS.HEIGHT)
    ctx.fillRect(CANVAS.WIDTH - bw, 0, bw, CANVAS.HEIGHT)
    ctx.font      = 'bold 13px monospace'
    ctx.textAlign = 'center'
    ctx.fillStyle   = `rgba(255,120,0,${0.8 + p * 0.2})`
    ctx.shadowBlur  = 10
    ctx.shadowColor = '#ff5500'
    ctx.fillText('⚠ RED ZONE — ALL GUARDS CONVERGING', CANVAS.WIDTH / 2, 28)
    ctx.shadowBlur  = 0
  }

  ctx.restore()
}

_drawKeycardAboveFog(ctx) {
  const positions = this.keycard.remaining
  if (!positions.length) return
  const T   = TILE_SIZE
  const now = Date.now()
  const total = this.keycard._total

  for (let ki = 0; ki < positions.length; ki++) {
    const pos   = positions[ki]
    const cx    = pos.x * T + T / 2
    const cy    = pos.y * T + T / 2
    const bob   = Math.sin(now / 400 + ki) * 3
    const pulse = 0.5 + 0.5 * Math.sin(now / 300 + ki * 1.2)

    ctx.fillStyle = 'rgba(255,220,0,0.22)'
    ctx.fillRect(pos.x * T, pos.y * T, T, T)

    ctx.strokeStyle = `rgba(255,220,0,${0.5 + pulse * 0.5})`
    ctx.lineWidth   = 2
    ctx.shadowBlur  = 16
    ctx.shadowColor = '#ffdd00'
    ctx.beginPath()
    ctx.arc(cx, cy, T * (0.9 + pulse * 0.3), 0, Math.PI * 2)
    ctx.stroke()
    ctx.shadowBlur = 0

    ctx.font      = `${Math.floor(T * 0.9)}px serif`
    ctx.textAlign = 'center'
    ctx.shadowBlur  = 14
    ctx.shadowColor = '#ffdd00'
    ctx.fillText('🗝️', cx, cy + T * 0.3 + bob)
    ctx.shadowBlur = 0

    // Show "KEY 1/3" label if multiple
    const label = total > 1 ? `KEY ${ki + 1}/${total}` : 'KEY'
    ctx.font        = `bold ${Math.floor(T * 0.5)}px 'Orbitron', monospace`
    ctx.fillStyle   = '#ffdd00'
    ctx.shadowBlur  = 8
    ctx.shadowColor = '#ffaa00'
    ctx.fillText(label, cx, cy - T * 0.8 + bob)
    ctx.shadowBlur = 0

    const arrowBob = Math.sin(now / 250 + ki) * 4
    ctx.fillStyle   = '#ffdd00'
    ctx.shadowBlur  = 6
    ctx.shadowColor = '#ffaa00'
    ctx.beginPath()
    ctx.moveTo(cx,            cy - T * 1.2 + arrowBob)
    ctx.lineTo(cx - T * 0.22, cy - T * 1.5 + arrowBob)
    ctx.lineTo(cx + T * 0.22, cy - T * 1.5 + arrowBob)
    ctx.closePath()
    ctx.fill()
    ctx.shadowBlur = 0
  }
}

  _drawRedZoneWarning(ctx, grid) {
    // Pulse red tint on redzone tiles visible to player
    const pulse = 0.08 + 0.04 * Math.sin(Date.now() / 400)
    for (let y = 0; y < grid.rows; y++) {
      for (let x = 0; x < grid.cols; x++) {
        if (grid.get(x, y) === TILE.REDZONE) {
          ctx.fillStyle = `rgba(200,0,0,${pulse})`
          ctx.fillRect(x * T, y * T, T, T)
        }
      }
    }
  }

  _drawHearingRings(ctx) {
    for (const r of this._hearingRings) {
      ctx.save()
      ctx.globalAlpha = r.life * 0.7
      ctx.strokeStyle = `rgba(255,220,0,${r.life})`
      ctx.lineWidth   = 1.5
      ctx.shadowBlur  = 8
      ctx.shadowColor = '#ffcc00'
      ctx.beginPath()
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()
    }
  }

  _drawRadioLines(ctx) {
    if (!this._radioLines?.length) return
    for (const line of this._radioLines) {
      ctx.save()
      ctx.globalAlpha = line.life * 0.9
      ctx.strokeStyle = '#ff3333'
      ctx.lineWidth   = 1.5
      ctx.setLineDash([4, 4])
      ctx.shadowBlur  = 6
      ctx.shadowColor = '#ff3333'
      ctx.beginPath()
      ctx.moveTo(line.x1, line.y1)
      ctx.lineTo(line.x2, line.y2)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle   = `rgba(255,200,0,${line.life})`
      ctx.shadowBlur  = 10
      ctx.shadowColor = '#ffcc00'
      ctx.beginPath()
      ctx.arc(line.x2, line.y2 - T * 0.9, T * 0.18, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }
  }

  _drawEscapeUI(ctx) {
    const ex  = this.escapePoint
    if (!ex) return
    const cx  = ex.x * T + T / 2
    const cy  = ex.y * T + T / 2
    const now = Date.now()
    const locked = !this.keycard.isUnlocked

    // Base tile
    ctx.fillStyle = locked ? 'rgba(255,80,0,0.4)' : 'rgba(0,255,136,0.5)'
    ctx.fillRect(ex.x * T, ex.y * T, T, T)

    const color  = locked ? '255,80,0' : '0,255,136'
    const hex    = locked ? '#ff5000'  : '#00ff88'

    const pulse1 = 0.5 + 0.5 * Math.sin(now / 350)
    ctx.strokeStyle = `rgba(${color},${0.6 + pulse1 * 0.4})`
    ctx.lineWidth   = 2.5
    ctx.shadowBlur  = 20
    ctx.shadowColor = hex
    ctx.beginPath()
    ctx.arc(cx, cy, T * (1.1 + pulse1 * 0.4), 0, Math.PI * 2)
    ctx.stroke()
    ctx.shadowBlur = 0

    // Label
    ctx.font      = `bold ${T - 2}px 'Orbitron', monospace`
    ctx.textAlign = 'center'
    const remaining = this.keycard.remaining?.length || 0
    const total     = this.keycard._total || 1
    const got       = total - remaining
    const label     = locked
      ? (total > 1 ? `🔒 KEY ${got}/${total}` : '🔒 KEY?')
      : 'EXIT'
    const labelY  = cy - T * 1.9
    ctx.fillStyle = 'rgba(0,0,0,0.9)'
    ctx.fillText(label, cx + 1, labelY + 1)
    ctx.fillStyle   = hex
    ctx.shadowBlur  = 14
    ctx.shadowColor = hex
    ctx.fillText(label, cx, labelY)
    ctx.shadowBlur = 0

    // Arrow (only when unlocked)
    if (!locked) {
      const arrowBob = Math.sin(now / 280) * 4
      ctx.fillStyle   = '#00ff88'
      ctx.shadowBlur  = 10
      ctx.shadowColor = '#00ff88'
      ctx.beginPath()
      ctx.moveTo(cx,           cy - T * 1.0 + arrowBob)
      ctx.lineTo(cx - T * 0.3, cy - T * 1.4 + arrowBob)
      ctx.lineTo(cx + T * 0.3, cy - T * 1.4 + arrowBob)
      ctx.closePath()
      ctx.fill()
      ctx.shadowBlur = 0
    }
  }

  _drawLightsOutOverlay(ctx) {
    // Dark vignette around edges
    const grd = ctx.createRadialGradient(
      CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2, CANVAS.HEIGHT * 0.2,
      CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2, CANVAS.HEIGHT * 0.8
    )
    grd.addColorStop(0, 'rgba(0,0,0,0)')
    grd.addColorStop(1, 'rgba(0,0,10,0.7)')
    ctx.fillStyle = grd
    ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)

    // Warning text
    const alpha = 0.5 + 0.5 * Math.sin(Date.now() / 500)
    ctx.font      = `bold ${T}px 'Orbitron', monospace`
    ctx.textAlign = 'center'
    ctx.fillStyle = `rgba(100,100,255,${alpha})`
    ctx.shadowBlur  = 12
    ctx.shadowColor = '#4444ff'
    ctx.fillText('⚡ LIGHTS OUT', CANVAS.WIDTH / 2, 60)
    ctx.shadowBlur = 0
  }

  _assignPostGuards() {
    const guards = this.guards
    if (!guards.length) return

    // Sort by how far each guard is from their assigned post — pick closest
    const exitTile = this.escapePoint

    // Find uncollected keycard positions
    const keyTiles = this.keycard.remaining || []
    const keyTile  = keyTiles.length > 0 ? keyTiles[0] : null

    // Pick guard closest to exit for exit post
    const exitGuard = guards
      .filter(g => g.state !== 'chase')
      .sort((a, b) =>
        Math.hypot(a.tileX - exitTile.x, a.tileY - exitTile.y) -
        Math.hypot(b.tileX - exitTile.x, b.tileY - exitTile.y)
      )[0]

    if (exitGuard) {
      exitGuard._postTarget = { ...exitTile }
      exitGuard._onPost     = true
      this._postGuards.exitGuardId = exitGuard.id
    }

    // Pick a DIFFERENT guard closest to uncollected keycard
    if (keyTile) {
      const keyGuard = guards
        .filter(g => g.state !== 'chase' && g.id !== exitGuard?.id)
        .sort((a, b) =>
          Math.hypot(a.tileX - keyTile.x, a.tileY - keyTile.y) -
          Math.hypot(b.tileX - keyTile.x, b.tileY - keyTile.y)
        )[0]

      if (keyGuard) {
        keyGuard._postTarget = { ...keyTile }
        keyGuard._onPost     = true
        this._postGuards.keyGuardId = keyGuard.id
      }
    }
  }

  _endRound(result) {
    this.stop()
    this.state = 'end'
    this.ga.evolve()
    EventBus.emit('round:end', {
      result,
      generation: this.ga.generation,
      escaped:    this.escaped,
      guards:     this.guards.length,
      bestGene:   this.ga.best,
      gaHistory:  this.ga.history,
      mode:       this._mode,
      difficulty: this._difficulty,
    })
  }

  // _bindKeys() {
  //   const BLOCK_SCROLL = new Set([
  //     'ArrowUp','ArrowDown','ArrowLeft','ArrowRight',
  //     'Space','Tab','PageUp','PageDown','Home','End',
  //   ])
  //   window.addEventListener('keydown', e => {
  //     if (BLOCK_SCROLL.has(e.code)) e.preventDefault()
  //     this.keys[e.code] = true
  //     if (e.code === 'Tab') this.debug = !this.debug
  //   })
  //   window.addEventListener('keyup', e => { this.keys[e.code] = false })
  // }
  _bindKeys() {
  const BLOCK_SCROLL = new Set([
    'ArrowUp','ArrowDown','ArrowLeft','ArrowRight',
    'Space','Tab','PageUp','PageDown','Home','End',
  ])
  window.addEventListener('keydown', e => {
    if (BLOCK_SCROLL.has(e.code)) e.preventDefault()
    this.keys[e.code] = true
    if (e.code === 'Tab') this.debug = !this.debug
  })
  window.addEventListener('keyup', e => { this.keys[e.code] = false })
}

  drawMenuPreview() {
    const { grid } = CityGenerator.generate(42)
    this.ctx.clearRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)
    Tilemap.draw(this.ctx, grid)
    this.ctx.fillStyle = 'rgba(5,5,8,0.65)'
    this.ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)
  }
}