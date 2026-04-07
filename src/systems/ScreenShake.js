/**
 * ScreenShake — camera trauma system.
 *
 * Call shake(intensity) to trigger.
 * Each frame, apply() returns {x, y} offset to translate the canvas by.
 *
 * Intensities:
 *   0.3  — soft (guard hears you)
 *   0.6  — medium (guard spots you)
 *   1.0  — heavy (caught / alarm)
 */
export class ScreenShake {
  constructor() {
    this.trauma   = 0     // 0–1, decays each frame
    this.offsetX  = 0
    this.offsetY  = 0
    this._seed    = 0
  }

  /** Add trauma. Values stack, capped at 1. */
  shake(intensity = 0.5) {
    this.trauma = Math.min(1, this.trauma + intensity)
  }

  /**
   * Call once per frame. Returns { x, y } pixel offset.
   * Apply with ctx.translate(x, y) before drawing, ctx.translate(-x,-y) after.
   */
  update(dt) {
    if (this.trauma <= 0) {
      this.offsetX = 0
      this.offsetY = 0
      return { x: 0, y: 0 }
    }

    // Shake magnitude scales with trauma squared (feels more natural)
    const MAX_OFFSET = 18
    const mag = this.trauma * this.trauma * MAX_OFFSET

    // Fast pseudo-random noise using sin
    this._seed += dt * 60
    this.offsetX = mag * (Math.sin(this._seed * 7.3 + 1.1) * 2 - 1) * 0.5
    this.offsetY = mag * (Math.sin(this._seed * 6.1 + 2.4) * 2 - 1) * 0.5

    // Decay — higher trauma decays faster
    this.trauma = Math.max(0, this.trauma - dt * 3.5)

    return { x: this.offsetX, y: this.offsetY }
  }

  get active() { return this.trauma > 0.01 }
}