/**
 * BFS — Breadth-First Search for systematic area sweeps.
 *
 * Why BFS here?
 *   - Uninformed search: explores all tiles at distance 1, then 2, then 3...
 *   - Guards use this when player location is UNKNOWN → clears areas level by level
 *   - Methodical, predictable — gives the "sweep team" behaviour
 */
export class BFS {
  /**
   * Generate a BFS exploration order starting from (sx, sy).
   * Guards follow this tile list one-by-one as their search route.
   *
   * @param {import('../world/Grid.js').Grid} grid
   * @param {number} sx
   * @param {number} sy
   * @param {number} maxTiles - stop after this many tiles
   * @returns {{x:number,y:number}[]}
   */
  static sweep(grid, sx, sy, maxTiles = 80) {
    const visited = new Set()
    const queue   = [{ x: sx, y: sy }]
    const order   = []
    const key = (x, y) => `${x},${y}`

    visited.add(key(sx, sy))

    while (queue.length > 0 && order.length < maxTiles) {
      const { x, y } = queue.shift()
      order.push({ x, y })

      for (const [nx, ny] of grid.neighbours4(x, y)) {
        const k = key(nx, ny)
        if (!visited.has(k)) {
          visited.add(k)
          queue.push({ x: nx, y: ny })
        }
      }
    }

    return order
  }

  /**
   * BFS shortest path — simpler than A* (no heuristic).
   * Used by low-intelligence guards in early rounds.
   */
  static shortestPath(grid, sx, sy, gx, gy) {
    const key     = (x, y) => `${x},${y}`
    const visited = new Map()
    const queue   = [{ x: sx, y: sy }]
    visited.set(key(sx, sy), null)

    while (queue.length > 0) {
      const cur = queue.shift()
      if (cur.x === gx && cur.y === gy) {
        const path = []
        let k = key(cur.x, cur.y)
        while (k !== null) {
          const [px, py] = k.split(',').map(Number)
          path.unshift({ x: px, y: py })
          k = visited.get(k)
        }
        return path
      }
      for (const [nx, ny] of grid.neighbours4(cur.x, cur.y)) {
        const nk = key(nx, ny)
        if (!visited.has(nk)) {
          visited.set(nk, key(cur.x, cur.y))
          queue.push({ x: nx, y: ny })
        }
      }
    }
    return []
  }
}
