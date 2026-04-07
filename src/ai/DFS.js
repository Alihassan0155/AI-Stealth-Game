/**
 * DFS — Depth-First Search for aggressive building dives.
 *
 * Why DFS here?
 *   - Uninformed search: dives deep into one corridor before backtracking
 *   - Guards with high aggression gene use DFS → they plunge into buildings
 *   - Creates intense "there's a guard in the building" moments
 *   - Contrasts with BFS guards who sweep systematically outward
 */
export class DFS {
  /**
   * Generate a DFS exploration order from (sx, sy).
   *
   * @param {import('../world/Grid.js').Grid} grid
   * @param {number} sx
   * @param {number} sy
   * @param {number} maxTiles
   * @returns {{x:number,y:number}[]}
   */
  static sweep(grid, sx, sy, maxTiles = 60) {
    const visited = new Set()
    const stack   = [{ x: sx, y: sy }]
    const order   = []
    const key = (x, y) => `${x},${y}`

    while (stack.length > 0 && order.length < maxTiles) {
      const { x, y } = stack.pop()
      const k = key(x, y)
      if (visited.has(k)) continue

      visited.add(k)
      order.push({ x, y })

      // Push neighbours in reverse so we pop the "first" one first
      const nbrs = grid.neighbours4(x, y)
      for (let i = nbrs.length - 1; i >= 0; i--) {
        const [nx, ny] = nbrs[i]
        if (!visited.has(key(nx, ny))) stack.push({ x: nx, y: ny })
      }
    }

    return order
  }
}
