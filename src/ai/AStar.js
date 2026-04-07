import { Grid } from '../world/Grid.js'

/**
 * AStar — A* pathfinding used by guards when chasing the player.
 *
 * Why A* here?
 *   - Informed search: uses Manhattan heuristic to prioritise tiles closer to goal
 *   - Finds optimal path, recalculated every N frames as player moves
 *   - Smarter guards (higher gene.predictionAcc) recalculate more often
 */
export class AStar {
  /**
   * @param {Grid}   grid
   * @param {number} sx - start x (tile)
   * @param {number} sy - start y (tile)
   * @param {number} gx - goal x (tile)
   * @param {number} gy - goal y (tile)
   * @returns {{x:number,y:number}[]}  path from start→goal, or []
   */
  static findPath(grid, sx, sy, gx, gy) {
    const key  = (x, y) => x * 1000 + y
    const h    = (x, y) => Grid.manhattan(x, y, gx, gy)

    const open   = new Map()
    const closed = new Set()

    open.set(key(sx, sy), { x: sx, y: sy, g: 0, f: h(sx, sy), parent: null })

    let iterations = 0
    const MAX = 2000

    while (open.size > 0 && iterations++ < MAX) {
      // Pick node with lowest f-score
      let current = null
      for (const node of open.values())
        if (!current || node.f < current.f) current = node

      if (current.x === gx && current.y === gy)
        return AStar._reconstruct(current)

      open.delete(key(current.x, current.y))
      closed.add(key(current.x, current.y))

      for (const [nx, ny] of grid.neighbours4(current.x, current.y)) {
        const nk = key(nx, ny)
        if (closed.has(nk)) continue
        const g  = current.g + 1
        const ex = open.get(nk)
        if (!ex || g < ex.g)
          open.set(nk, { x: nx, y: ny, g, f: g + h(nx, ny), parent: current })
      }
    }

    return [] // no path
  }

  static _reconstruct(node) {
    const path = []
    let cur = node
    while (cur) { path.unshift({ x: cur.x, y: cur.y }); cur = cur.parent }
    return path
  }
}
