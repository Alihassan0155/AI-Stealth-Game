import { TILE_SIZE } from '../game/constants.js'

const T = TILE_SIZE

/**
 * VisibilitySystem — Line-of-sight raycasting between two pixel positions.
 *
 * Walks a ray from source to target in sub-tile steps.
 * If any tile along the ray is non-walkable (wall/building), vision is blocked.
 */
export class VisibilitySystem {
  /**
   * @param {import('../world/Grid.js').Grid} grid
   * @param {number} ax - source pixel x
   * @param {number} ay - source pixel y
   * @param {number} bx - target pixel x
   * @param {number} by - target pixel y
   * @param {number} maxRange - max pixel distance
   * @returns {boolean}
   */
  static hasLineOfSight(grid, ax, ay, bx, by, maxRange) {
    const dist = Math.hypot(ax - bx, ay - by)
    if (dist > maxRange) return false

    const steps = Math.ceil(dist / T * 2)
    for (let i = 0; i <= steps; i++) {
      const t  = i / steps
      const rx = ax + (bx - ax) * t
      const ry = ay + (by - ay) * t
      const tx = Math.floor(rx / T)
      const ty = Math.floor(ry / T)
      if (!grid.isWalkable(tx, ty)) return false
    }
    return true
  }
}
