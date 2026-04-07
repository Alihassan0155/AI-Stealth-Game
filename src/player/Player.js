// import { TILE_SIZE, TILE, PLAYER_CFG } from '../game/constants.js'

// const T = TILE_SIZE

// export class Player {
//   constructor(startTileX, startTileY) {
//     this.tileX     = startTileX
//     this.tileY     = startTileY
//     this.pixelX    = startTileX * T + T / 2
//     this.pixelY    = startTileY * T + T / 2

//     this.sprinting  = false
//     this.crouching  = false
//     this.noise      = PLAYER_CFG.NOISE_WALK
//     this.visionPx   = PLAYER_CFG.VISION_TILES * T

//     this._walkFrame  = 0
//     this._moving     = false
//     this._facingLeft = false
//   }

  

//   update(dt, grid, keys) {
//     let dx = 0, dy = 0
//     if (keys['ArrowLeft']  || keys['KeyA']) dx = -1
//     if (keys['ArrowRight'] || keys['KeyD']) dx =  1
//     if (keys['ArrowUp']    || keys['KeyW']) dy = -1
//     if (keys['ArrowDown']  || keys['KeyS']) dy =  1

//     this.sprinting = !!(keys['ShiftLeft']   || keys['ShiftRight'])
//     this.crouching = !!(keys['ControlLeft'] || keys['ControlRight'])

//     const speedMult = this.sprinting ? PLAYER_CFG.SPRINT_MULT
//                     : this.crouching ? PLAYER_CFG.CROUCH_MULT : 1

//     this.noise = this.sprinting ? PLAYER_CFG.NOISE_SPRINT
//                : this.crouching ? PLAYER_CFG.NOISE_CROUCH : PLAYER_CFG.NOISE_WALK

//     const speed = PLAYER_CFG.SPEED * T * speedMult * dt
//     const moving = dx !== 0 || dy !== 0

//     if (moving) {
//       this._walkFrame += dt * (this.sprinting ? 14 : 7)
//       const nx = this.pixelX + dx * speed
//       const ny = this.pixelY + dy * speed
//       const tx = Math.floor(nx / T)
//       const ty = Math.floor(ny / T)
//       if (grid.isWalkable(tx, ty) || grid.get(tx, ty) === TILE.ESCAPE) {
//         this.pixelX = nx; this.pixelY = ny
//         this.tileX  = tx; this.tileY  = ty
//       }
//     }

//     this._moving     = moving
//     if (dx !== 0) this._facingLeft = dx < 0
//   }

//   draw(ctx) {
//     const x = this.pixelX
//     const y = this.pixelY
//     const s = T * 0.9

//     ctx.save()
//     ctx.translate(x, y)
//     if (this._facingLeft) ctx.scale(-1, 1)

//     // Crouch squish
//     const squat = this.crouching ? 0.75 : 1
//     ctx.scale(1, squat)

//     // Sprint lean
//     if (this.sprinting) ctx.rotate(0.18)

//     // Leg animation
//     const legSwing = this._moving ? Math.sin(this._walkFrame) * 0.35 : 0

//     // Left leg
//     ctx.save()
//     ctx.translate(-s * 0.18, s * 0.25)
//     ctx.rotate(-legSwing)
//     ctx.fillStyle = '#1565c0'
//     ctx.beginPath()
//     ctx.roundRect(-s*0.12, 0, s*0.22, s*0.45, s*0.08)
//     ctx.fill()
//     ctx.fillStyle = '#0d1117'
//     ctx.beginPath()
//     ctx.ellipse(0, s*0.46, s*0.15, s*0.09, 0, 0, Math.PI*2)
//     ctx.fill()
//     ctx.restore()

//     // Right leg
//     ctx.save()
//     ctx.translate(s * 0.18, s * 0.25)
//     ctx.rotate(legSwing)
//     ctx.fillStyle = '#1565c0'
//     ctx.beginPath()
//     ctx.roundRect(-s*0.12, 0, s*0.22, s*0.45, s*0.08)
//     ctx.fill()
//     ctx.fillStyle = '#0d1117'
//     ctx.beginPath()
//     ctx.ellipse(0, s*0.46, s*0.15, s*0.09, 0, 0, Math.PI*2)
//     ctx.fill()
//     ctx.restore()

//     // Body / hoodie
//     ctx.fillStyle = this.sprinting ? '#00bcd4' : this.crouching ? '#006064' : '#0097a7'
//     ctx.shadowBlur  = 12
//     ctx.shadowColor = '#00d4ff'
//     ctx.beginPath()
//     ctx.roundRect(-s*0.32, -s*0.18, s*0.64, s*0.5, s*0.15)
//     ctx.fill()
//     ctx.shadowBlur = 0

//     // Hoodie pocket
//     ctx.fillStyle = 'rgba(0,0,0,0.2)'
//     ctx.beginPath()
//     ctx.roundRect(-s*0.14, s*0.1, s*0.28, s*0.16, s*0.06)
//     ctx.fill()

//     // Left arm
//     const armSwing = this._moving ? Math.sin(this._walkFrame + Math.PI) * 0.4 : 0
//     ctx.save()
//     ctx.translate(-s*0.34, -s*0.1)
//     ctx.rotate(armSwing - 0.2)
//     ctx.fillStyle = '#0097a7'
//     ctx.beginPath()
//     ctx.roundRect(-s*0.1, 0, s*0.2, s*0.35, s*0.08)
//     ctx.fill()
//     ctx.restore()

//     // Right arm
//     ctx.save()
//     ctx.translate(s*0.34, -s*0.1)
//     ctx.rotate(-armSwing + 0.2)
//     ctx.fillStyle = '#0097a7'
//     ctx.beginPath()
//     ctx.roundRect(-s*0.1, 0, s*0.2, s*0.35, s*0.08)
//     ctx.fill()
//     ctx.restore()

//     // Head
//     ctx.fillStyle = '#ffcc80'
//     ctx.shadowBlur  = 8
//     ctx.shadowColor = '#00d4ff'
//     ctx.beginPath()
//     ctx.arc(0, -s*0.42, s*0.28, 0, Math.PI * 2)
//     ctx.fill()
//     ctx.shadowBlur = 0

//     // Hair
//     ctx.fillStyle = '#4a2c0a'
//     ctx.beginPath()
//     ctx.arc(0, -s*0.6, s*0.26, Math.PI, 0)
//     ctx.fill()
//     ctx.beginPath()
//     ctx.arc(-s*0.26, -s*0.44, s*0.1, 0, Math.PI*2)
//     ctx.fill()

//     // Eyes
//     ctx.fillStyle = '#1a237e'
//     ctx.beginPath()
//     ctx.arc(-s*0.1, -s*0.44, s*0.065, 0, Math.PI*2)
//     ctx.fill()
//     ctx.beginPath()
//     ctx.arc(s*0.1, -s*0.44, s*0.065, 0, Math.PI*2)
//     ctx.fill()
//     // Eye shine
//     ctx.fillStyle = 'white'
//     ctx.beginPath()
//     ctx.arc(-s*0.08, -s*0.46, s*0.025, 0, Math.PI*2)
//     ctx.fill()
//     ctx.beginPath()
//     ctx.arc(s*0.12, -s*0.46, s*0.025, 0, Math.PI*2)
//     ctx.fill()

//     // Mouth
//     ctx.strokeStyle = '#5d3a1a'
//     ctx.lineWidth = s * 0.04
//     ctx.lineCap = 'round'
//     ctx.beginPath()
//     if (this.sprinting) {
//       ctx.arc(0, -s*0.36, s*0.1, 0.1, Math.PI - 0.1)
//     } else {
//       ctx.arc(0, -s*0.42, s*0.12, 0.2, Math.PI - 0.2)
//     }
//     ctx.stroke()

//     // Sprint noise ring
//     if (this.sprinting) {
//       ctx.strokeStyle = 'rgba(255,100,0,0.6)'
//       ctx.lineWidth = 2
//       ctx.setLineDash([4, 4])
//       ctx.beginPath()
//       ctx.arc(0, 0, T * 1.4, 0, Math.PI * 2)
//       ctx.stroke()
//       ctx.setLineDash([])
//     }

//     ctx.restore()
//   }
// }

import { TILE_SIZE, TILE, PLAYER_CFG } from '../game/constants.js'

const T = TILE_SIZE

function rr(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}

// ── Footstep audio via Web Audio API ──────────────────────────
class FootstepAudio {
  constructor() {
    this._ctx       = null
    this._timer     = 0
    this._stepLeft  = true
  }

  _getCtx() {
    if (!this._ctx) {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)()
    }
    return this._ctx
  }

  /**
   * Call every frame. Plays a click/thud at the right interval.
   * @param {number} dt
   * @param {boolean} moving
   * @param {boolean} sprinting
   * @param {boolean} crouching
   */
  update(dt, moving, sprinting, crouching) {
    if (!moving) { this._timer = 0; return }

    // Step interval: sprint = fast, crouch = slow, walk = normal
    const interval = sprinting ? 0.22 : crouching ? 0.55 : 0.35
    this._timer += dt

    if (this._timer >= interval) {
      this._timer = 0
      this._playStep(sprinting, crouching)
      this._stepLeft = !this._stepLeft
    }
  }

  _playStep(sprinting, crouching) {
    try {
      const ac  = this._getCtx()
      const now = ac.currentTime

      // Oscillator for the "thud" tone
      const osc = ac.createOscillator()
      const env = ac.createGain()
      const filter = ac.createBiquadFilter()

      filter.type            = 'lowpass'
      filter.frequency.value = sprinting ? 280 : crouching ? 120 : 180

      // Left/right foot slight pitch variation
      const basePitch = sprinting ? 140 : crouching ? 60 : 90
      osc.frequency.value = basePitch + (this._stepLeft ? 8 : -8)
      osc.type = 'sine'

      // Volume: sprint = loud, crouch = very quiet, walk = medium
      const vol = sprinting ? 0.18 : crouching ? 0.03 : 0.09

      env.gain.setValueAtTime(vol, now)
      env.gain.exponentialRampToValueAtTime(0.0001, now + 0.12)

      // Second oscillator for texture (noise-like crunch)
      const osc2 = ac.createOscillator()
      const env2 = ac.createGain()
      osc2.type = 'sawtooth'
      osc2.frequency.value = basePitch * 2.5
      env2.gain.setValueAtTime(vol * 0.3, now)
      env2.gain.exponentialRampToValueAtTime(0.0001, now + 0.06)

      osc.connect(filter)
      filter.connect(env)
      env.connect(ac.destination)

      osc2.connect(env2)
      env2.connect(ac.destination)

      osc.start(now)
      osc.stop(now + 0.15)
      osc2.start(now)
      osc2.stop(now + 0.08)

    } catch(e) {
      // Audio not available — silently ignore
    }
  }
}

export class Player {
  constructor(startTileX, startTileY) {
    this.tileX     = startTileX
    this.tileY     = startTileY
    this.pixelX    = startTileX * T + T / 2
    this.pixelY    = startTileY * T + T / 2

    this.sprinting  = false
    this.crouching  = false
    this.noise      = PLAYER_CFG.NOISE_WALK
    this.visionPx   = PLAYER_CFG.VISION_TILES * T

    this._walkFrame  = 0
    this._moving     = false
    this._facingLeft = false

    this._audio = new FootstepAudio()
  }

  update(dt, grid, keys) {
    let dx = 0, dy = 0
    if (keys['ArrowLeft']  || keys['KeyA']) dx = -1
    if (keys['ArrowRight'] || keys['KeyD']) dx =  1
    if (keys['ArrowUp']    || keys['KeyW']) dy = -1
    if (keys['ArrowDown']  || keys['KeyS']) dy =  1

    this.sprinting = !!(keys['ShiftLeft']   || keys['ShiftRight'])
    this.crouching = !!(keys['ControlLeft'] || keys['ControlRight'])

    const speedMult = this.sprinting ? PLAYER_CFG.SPRINT_MULT
                    : this.crouching ? PLAYER_CFG.CROUCH_MULT : 1

    this.noise = this.sprinting ? PLAYER_CFG.NOISE_SPRINT
               : this.crouching ? PLAYER_CFG.NOISE_CROUCH : PLAYER_CFG.NOISE_WALK

    const speed  = PLAYER_CFG.SPEED * T * speedMult * dt
    const moving = dx !== 0 || dy !== 0

    if (moving) {
      this._walkFrame += dt * (this.sprinting ? 14 : 7)
      const nx = this.pixelX + dx * speed
      const ny = this.pixelY + dy * speed
      const tx = Math.floor(nx / T)
      const ty = Math.floor(ny / T)
      if (grid.isWalkable(tx, ty) || grid.get(tx, ty) === TILE.ESCAPE) {
        this.pixelX = nx; this.pixelY = ny
        this.tileX  = tx; this.tileY  = ty
      }
    }

    this._moving     = moving
    if (dx !== 0) this._facingLeft = dx < 0

    // Footstep audio
    this._audio.update(dt, moving, this.sprinting, this.crouching)
  }

  draw(ctx) {
    const x = this.pixelX
    const y = this.pixelY
    const s = T * 0.9

    ctx.save()
    ctx.translate(x, y)
    if (this._facingLeft) ctx.scale(-1, 1)

    const squat = this.crouching ? 0.75 : 1
    ctx.scale(1, squat)
    if (this.sprinting) ctx.rotate(0.18)

    const legSwing = this._moving ? Math.sin(this._walkFrame) * 0.35 : 0

    // Left leg
    ctx.save()
    ctx.translate(-s * 0.18, s * 0.25)
    ctx.rotate(-legSwing)
    ctx.fillStyle = '#1565c0'
    rr(ctx, -s*0.12, 0, s*0.22, s*0.45, s*0.08)
    ctx.fill()
    ctx.fillStyle = '#0d1117'
    ctx.beginPath()
    ctx.ellipse(0, s*0.46, s*0.15, s*0.09, 0, 0, Math.PI*2)
    ctx.fill()
    ctx.restore()

    // Right leg
    ctx.save()
    ctx.translate(s * 0.18, s * 0.25)
    ctx.rotate(legSwing)
    ctx.fillStyle = '#1565c0'
    rr(ctx, -s*0.12, 0, s*0.22, s*0.45, s*0.08)
    ctx.fill()
    ctx.fillStyle = '#0d1117'
    ctx.beginPath()
    ctx.ellipse(0, s*0.46, s*0.15, s*0.09, 0, 0, Math.PI*2)
    ctx.fill()
    ctx.restore()

    // Body
    ctx.fillStyle   = this.sprinting ? '#00bcd4' : this.crouching ? '#006064' : '#0097a7'
    ctx.shadowBlur  = 12
    ctx.shadowColor = '#00d4ff'
    rr(ctx, -s*0.32, -s*0.18, s*0.64, s*0.5, s*0.15)
    ctx.fill()
    ctx.shadowBlur = 0

    // Pocket
    ctx.fillStyle = 'rgba(0,0,0,0.2)'
    rr(ctx, -s*0.14, s*0.1, s*0.28, s*0.16, s*0.06)
    ctx.fill()

    // Arms
    const armSwing = this._moving ? Math.sin(this._walkFrame + Math.PI) * 0.4 : 0
    ctx.save()
    ctx.translate(-s*0.34, -s*0.1)
    ctx.rotate(armSwing - 0.2)
    ctx.fillStyle = '#0097a7'
    rr(ctx, -s*0.1, 0, s*0.2, s*0.35, s*0.08)
    ctx.fill()
    ctx.restore()

    ctx.save()
    ctx.translate(s*0.34, -s*0.1)
    ctx.rotate(-armSwing + 0.2)
    ctx.fillStyle = '#0097a7'
    rr(ctx, -s*0.1, 0, s*0.2, s*0.35, s*0.08)
    ctx.fill()
    ctx.restore()

    // Head
    ctx.fillStyle   = '#ffcc80'
    ctx.shadowBlur  = 8
    ctx.shadowColor = '#00d4ff'
    ctx.beginPath()
    ctx.arc(0, -s*0.42, s*0.28, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0

    // Hair
    ctx.fillStyle = '#4a2c0a'
    ctx.beginPath()
    ctx.arc(0, -s*0.6, s*0.26, Math.PI, 0)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(-s*0.26, -s*0.44, s*0.1, 0, Math.PI*2)
    ctx.fill()

    // Eyes
    ctx.fillStyle = '#1a237e'
    ctx.beginPath()
    ctx.arc(-s*0.1, -s*0.44, s*0.065, 0, Math.PI*2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(s*0.1, -s*0.44, s*0.065, 0, Math.PI*2)
    ctx.fill()
    ctx.fillStyle = 'white'
    ctx.beginPath()
    ctx.arc(-s*0.08, -s*0.46, s*0.025, 0, Math.PI*2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(s*0.12, -s*0.46, s*0.025, 0, Math.PI*2)
    ctx.fill()

    // Mouth
    ctx.strokeStyle = '#5d3a1a'
    ctx.lineWidth   = s * 0.04
    ctx.lineCap     = 'round'
    ctx.beginPath()
    if (this.sprinting) {
      ctx.arc(0, -s*0.36, s*0.1, 0.1, Math.PI - 0.1)
    } else {
      ctx.arc(0, -s*0.42, s*0.12, 0.2, Math.PI - 0.2)
    }
    ctx.stroke()

    // Sprint noise ring
    if (this.sprinting) {
      ctx.strokeStyle = 'rgba(255,100,0,0.6)'
      ctx.lineWidth   = 2
      ctx.setLineDash([4, 4])
      ctx.beginPath()
      ctx.arc(0, 0, T * 1.4, 0, Math.PI * 2)
      ctx.stroke()
      ctx.setLineDash([])
    }

    ctx.restore()
  }
}