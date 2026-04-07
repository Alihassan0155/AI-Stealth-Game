export class WantedSystem {
  constructor() {
    this.level     = 0
    this._points   = 0
    this._cooldown = 0
    this.COOLDOWN_TO_DROP = 8
  }

  reset() {
    this.level     = 0
    this._points   = 0
    this._cooldown = 0
  }

  update(dt, spotted) {
    if (spotted) {
      this._cooldown = 0
      this._points  += dt * 18
      if (this._points >= 100 && this.level < 5) {
        this.level++
        this._points = 0
      }
    } else {
      this._cooldown += dt
      if (this._cooldown >= this.COOLDOWN_TO_DROP && this.level > 0) {
        this._cooldown = 0
        this._points   = 80
        this.level     = Math.max(0, this.level - 1)
      }
    }
  }

  get speedMult() {
    return 1 + this.level * 0.12
  }

  get progress() {
    return this._points / 100
  }
}