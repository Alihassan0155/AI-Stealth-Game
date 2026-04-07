import { TILE_SIZE } from '../game/constants.js'

const T = TILE_SIZE

export class SoundVisualizer {
  constructor() {
    this.rings        = []
    this._spawnTimer  = 0
  }

  reset() {
    this.rings       = []
    this._spawnTimer = 0
  }

  update(dt, px, py, noise, moving) {
    const interval = noise > 2 ? 0.18 : noise > 0.5 ? 0.35 : 0.8

    this._spawnTimer += dt
    if (moving && this._spawnTimer >= interval) {
      this._spawnTimer = 0
      this.rings.push({
        x:    px,
        y:    py,
        radius: T * 0.3,
        maxR:   noise * T * 4.5,
        life:   1.0,
        noise,
      })
    }

    for (const r of this.rings) {
      r.life   -= dt * (noise > 2 ? 2.2 : 1.4)
      r.radius += dt * noise * T * 7
    }

    this.rings = this.rings.filter(r => r.life > 0 && r.radius < r.maxR + T)
  }

  draw(ctx, px, py, noise, hearRadius, moving) {
    if (!moving && noise < 0.4) return

    const color = noise > 2   ? '255,80,0'
                : noise > 0.8 ? '255,200,0'
                : '0,212,255'

    for (const r of this.rings) {
      const alpha = r.life * 0.55
      ctx.save()
      ctx.strokeStyle = `rgba(${color},${alpha})`
      ctx.lineWidth   = 1.5
      ctx.shadowBlur  = noise > 2 ? 8 : 4
      ctx.shadowColor = `rgba(${color},0.4)`
      ctx.beginPath()
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()
    }

    // Dashed hearing threshold circle
    const hearPx = hearRadius * T * noise
    ctx.save()
    ctx.strokeStyle = `rgba(${color},0.25)`
    ctx.lineWidth   = 1
    ctx.setLineDash([5, 6])
    ctx.beginPath()
    ctx.arc(px, py, hearPx, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.restore()
  }
}