// // // // import { Grid } from './Grid.js'
// // // // import { TILE, GRID } from '../game/constants.js'

// // // // const { COLS, ROWS } = GRID

// // // // /**
// // // //  * CityGenerator — Procedural city via seeded RNG + recursive subdivision
// // // //  *
// // // //  * Returns: { grid, playerStart, escapePoint, guardSpawns }
// // // //  */
// // // // export class CityGenerator {
// // // //   static generate(seed = Date.now()) {
// // // //     const rng  = CityGenerator._rng(seed)
// // // //     const grid = new Grid()
// // // //     grid.cells.fill(TILE.WALL)

// // // //     const ROAD_SPACING = 9
// // // //     const ROAD_WIDTH   = 2

// // // //     // ── Lay road grid ──────────────────────────────────────
// // // //     for (let y = 0; y < ROWS; y++)
// // // //       if (y % ROAD_SPACING < ROAD_WIDTH)
// // // //         for (let x = 0; x < COLS; x++) grid.set(x, y, TILE.ROAD)

// // // //     for (let x = 0; x < COLS; x++)
// // // //       if (x % ROAD_SPACING < ROAD_WIDTH)
// // // //         for (let y = 0; y < ROWS; y++) grid.set(x, y, TILE.ROAD)

// // // //     // ── Fill city blocks ───────────────────────────────────
// // // //     for (let bRow = 0; bRow * ROAD_SPACING < ROWS; bRow++) {
// // // //       for (let bCol = 0; bCol * ROAD_SPACING < COLS; bCol++) {
// // // //         const x0 = bCol * ROAD_SPACING + ROAD_WIDTH
// // // //         const y0 = bRow * ROAD_SPACING + ROAD_WIDTH
// // // //         const x1 = Math.min(x0 + ROAD_SPACING - ROAD_WIDTH - 1, COLS - 1)
// // // //         const y1 = Math.min(y0 + ROAD_SPACING - ROAD_WIDTH - 1, ROWS - 1)
// // // //         if (x1 <= x0 || y1 <= y0) continue

// // // //         if (rng() < 0.8) {
// // // //           CityGenerator._placeBuilding(grid, x0, y0, x1, y1, rng)
// // // //         } else {
// // // //           // open courtyard
// // // //           for (let y = y0; y <= y1; y++)
// // // //             for (let x = x0; x <= x1; x++) grid.set(x, y, TILE.ROAD)
// // // //         }
// // // //       }
// // // //     }

// // // //     // ── Escape point on map edge ───────────────────────────
// // // //     const escapePoint = CityGenerator._edgeRoadTile(grid, rng)
// // // //     grid.set(escapePoint.x, escapePoint.y, TILE.ESCAPE)

// // // //     // ── Player start far from escape ───────────────────────
// // // //     let playerStart
// // // //     let tries = 0
// // // //     do {
// // // //       playerStart = CityGenerator._randomRoad(grid, rng)
// // // //       tries++
// // // //     } while (Grid.manhattan(playerStart.x, playerStart.y, escapePoint.x, escapePoint.y) < 25 && tries < 500)
// // // //     grid.set(playerStart.x, playerStart.y, TILE.START)

// // // //     // ── Guard spawns far from player ───────────────────────
// // // //     const guardSpawns = []
// // // //     tries = 0
// // // //     while (guardSpawns.length < 10 && tries < 400) {
// // // //       tries++
// // // //       const p = CityGenerator._randomRoad(grid, rng)
// // // //       if (Grid.manhattan(p.x, p.y, playerStart.x, playerStart.y) > 12)
// // // //         guardSpawns.push(p)
// // // //     }

// // // //     return { grid, playerStart, escapePoint, guardSpawns }
// // // //   }

// // // //   // ── Private helpers ────────────────────────────────────────

// // // //   static _placeBuilding(grid, x0, y0, x1, y1, rng) {
// // // //     // outer shell
// // // //     for (let y = y0; y <= y1; y++)
// // // //       for (let x = x0; x <= x1; x++) {
// // // //         const isEdge = x === x0 || x === x1 || y === y0 || y === y1
// // // //         grid.set(x, y, isEdge ? TILE.WALL : TILE.BUILDING)
// // // //       }
// // // //     // interior rooms
// // // //     CityGenerator._subdivide(grid, x0+1, y0+1, x1-1, y1-1, rng, 1)
// // // //     // door
// // // //     CityGenerator._addDoor(grid, x0, y0, x1, y1, rng)
// // // //   }

// // // //   static _subdivide(grid, x0, y0, x1, y1, rng, depth) {
// // // //     const w = x1 - x0, h = y1 - y0
// // // //     if (w < 3 || h < 3 || depth <= 0) return

// // // //     if (h >= 4 && rng() < 0.5) {
// // // //       const sy = y0 + 1 + Math.floor(rng() * (h - 2))
// // // //       for (let x = x0; x <= x1; x++) grid.set(x, sy, TILE.WALL)
// // // //       grid.set(x0 + Math.floor(rng() * (w + 1)), sy, TILE.BUILDING) // gap
// // // //     } else if (w >= 4) {
// // // //       const sx = x0 + 1 + Math.floor(rng() * (w - 2))
// // // //       for (let y = y0; y <= y1; y++) grid.set(sx, y, TILE.WALL)
// // // //       grid.set(sx, y0 + Math.floor(rng() * (h + 1)), TILE.BUILDING) // gap
// // // //     }
// // // //   }

// // // //   static _addDoor(grid, x0, y0, x1, y1, rng) {
// // // //     const side = Math.floor(rng() * 4)
// // // //     let dx, dy
// // // //     const w = x1 - x0, h = y1 - y0
// // // //     if      (side === 0) { dx = x0 + 1 + Math.floor(rng() * (w - 1)); dy = y0 }
// // // //     else if (side === 1) { dx = x1; dy = y0 + 1 + Math.floor(rng() * (h - 1)) }
// // // //     else if (side === 2) { dx = x0 + 1 + Math.floor(rng() * (w - 1)); dy = y1 }
// // // //     else                 { dx = x0; dy = y0 + 1 + Math.floor(rng() * (h - 1)) }
// // // //     grid.set(dx, dy, TILE.DOOR)
// // // //   }

// // // //   static _randomRoad(grid, rng) {
// // // //     let x, y
// // // //     do {
// // // //       x = Math.floor(rng() * COLS)
// // // //       y = Math.floor(rng() * ROWS)
// // // //     } while (grid.get(x, y) !== TILE.ROAD)
// // // //     return { x, y }
// // // //   }

// // // //   static _edgeRoadTile(grid, rng) {
// // // //     const candidates = []
// // // //     for (let x = 0; x < COLS; x++) {
// // // //       if (grid.get(x, 0) === TILE.ROAD)        candidates.push({ x, y: 0 })
// // // //       if (grid.get(x, ROWS-1) === TILE.ROAD)   candidates.push({ x, y: ROWS-1 })
// // // //     }
// // // //     for (let y = 0; y < ROWS; y++) {
// // // //       if (grid.get(0, y) === TILE.ROAD)        candidates.push({ x: 0, y })
// // // //       if (grid.get(COLS-1, y) === TILE.ROAD)  candidates.push({ x: COLS-1, y })
// // // //     }
// // // //     return candidates[Math.floor(rng() * candidates.length)] || { x: 1, y: 1 }
// // // //   }

// // // //   /** Linear Congruential Generator — fast, seeded, deterministic */
// // // //   static _rng(seed) {
// // // //     let s = (seed >>> 0) || 12345
// // // //     return () => {
// // // //       s = (Math.imul(1664525, s) + 1013904223) >>> 0
// // // //       return s / 0xffffffff
// // // //     }
// // // //   }
// // // // }
// // // import { Grid } from './Grid.js'
// // // import { TILE } from '../game/constants.js'

// // // // Seeded LCG random
// // // function makeLCG(seed) {
// // //   let s = seed >>> 0
// // //   return () => {
// // //     s = (Math.imul(1664525, s) + 1013904223) >>> 0
// // //     return s / 0xffffffff
// // //   }
// // // }

// // // export class CityGenerator {
// // //   static generate(seed) {
// // //     const rng  = makeLCG(seed)
// // //     const COLS = 60, ROWS = 40
// // //     const grid = new Grid(COLS, ROWS)

// // //     // ── 1. Fill with buildings ──────────────────────────────
// // //     for (let y = 0; y < ROWS; y++)
// // //       for (let x = 0; x < COLS; x++)
// // //         grid.set(x, y, TILE.BUILDING)

// // //     // ── 2. Road grid — wider spacing = tighter map ──────────
// // //     const ROAD_SPACING = 13   // was 9 — fewer, wider blocks
// // //     const ROAD_WIDTH   = 2

// // //     for (let y = 0; y < ROWS; y++)
// // //       for (let x = 0; x < COLS; x++) {
// // //         const onRoadX = x % ROAD_SPACING < ROAD_WIDTH
// // //         const onRoadY = y % ROAD_SPACING < ROAD_WIDTH
// // //         if (onRoadX || onRoadY) grid.set(x, y, TILE.ROAD)
// // //       }

// // //     // ── 3. Buildings with rooms ─────────────────────────────
// // //     for (let by = 0; by < ROWS; by += ROAD_SPACING) {
// // //       for (let bx = 0; bx < COLS; bx += ROAD_SPACING) {
// // //         const bw = ROAD_SPACING - ROAD_WIDTH
// // //         const bh = ROAD_SPACING - ROAD_WIDTH
// // //         const ox = bx + ROAD_WIDTH
// // //         const oy = by + ROAD_WIDTH
// // //         if (rng() < 0.82) {
// // //           CityGenerator._subdivide(grid, rng, ox, oy, bw, bh, 0)
// // //           // Add door
// // //           const side = Math.floor(rng() * 4)
// // //           const mx   = ox + Math.floor(bw / 2)
// // //           const my   = oy + Math.floor(bh / 2)
// // //           if (side === 0) grid.set(mx, oy - 1, TILE.DOOR)
// // //           else if (side === 1) grid.set(ox + bw, my, TILE.DOOR)
// // //           else if (side === 2) grid.set(mx, oy + bh, TILE.DOOR)
// // //           else grid.set(ox - 1, my, TILE.DOOR)
// // //         }
// // //       }
// // //     }

// // //     // ── 4. Dead end alleys ──────────────────────────────────
// // //     CityGenerator._addDeadEnds(grid, rng, COLS, ROWS)

// // //     // ── 5. Red zones (2 areas with higher guard density) ────
// // //     const redZones = CityGenerator._addRedZones(grid, rng, COLS, ROWS)

// // //     // ── 6. Sewer tunnels ────────────────────────────────────
// // //     const sewers = CityGenerator._addSewers(grid, rng, COLS, ROWS)

// // //     // ── 7. Escape point on edge ─────────────────────────────
// // //     const escapePoint = CityGenerator._placeEscape(grid, rng, COLS, ROWS)

// // //     // ── 8. Keycard somewhere in the middle of the map ───────
// // //     const keycardPos = CityGenerator._placeKeycard(grid, rng, COLS, ROWS)

// // //     // ── 9. Player start — far from escape ───────────────────
// // //     const playerStart = CityGenerator._placePlayer(grid, rng, COLS, ROWS, escapePoint)

// // //     // ── 10. Guard spawns ─────────────────────────────────────
// // //     const guardSpawns = CityGenerator._placeGuards(
// // //       grid, rng, COLS, ROWS, playerStart, escapePoint, redZones
// // //     )

// // //     return { grid, playerStart, escapePoint, guardSpawns, redZones, sewers, keycardPos }
// // //   }

// // //   static _subdivide(grid, rng, x, y, w, h, depth) {
// // //     if (w < 3 || h < 3 || depth > 2) return
// // //     if (rng() < 0.4) return  // leave open

// // //     // Horizontal or vertical split
// // //     if (w > h) {
// // //       const mx = x + 2 + Math.floor(rng() * (w - 3))
// // //       for (let j = y; j < y + h; j++) grid.set(mx, j, TILE.BUILDING)
// // //       // door in wall
// // //       const dy = y + Math.floor(rng() * h)
// // //       grid.set(mx, dy, TILE.DOOR)
// // //       CityGenerator._subdivide(grid, rng, x, y, mx - x, h, depth + 1)
// // //       CityGenerator._subdivide(grid, rng, mx + 1, y, x + w - mx - 1, h, depth + 1)
// // //     } else {
// // //       const my = y + 2 + Math.floor(rng() * (h - 3))
// // //       for (let i = x; i < x + w; i++) grid.set(i, my, TILE.BUILDING)
// // //       const dx = x + Math.floor(rng() * w)
// // //       grid.set(dx, my, TILE.DOOR)
// // //       CityGenerator._subdivide(grid, rng, x, y, w, my - y, depth + 1)
// // //       CityGenerator._subdivide(grid, rng, x, my + 1, w, y + h - my - 1, depth + 1)
// // //     }
// // //   }

// // //   static _addDeadEnds(grid, rng, COLS, ROWS) {
// // //     // Add 8–12 dead end alleys jutting off roads
// // //     const count = 8 + Math.floor(rng() * 5)
// // //     for (let i = 0; i < count; i++) {
// // //       // Find a road tile on the edge of a building block
// // //       for (let attempt = 0; attempt < 50; attempt++) {
// // //         const x = 2 + Math.floor(rng() * (COLS - 4))
// // //         const y = 2 + Math.floor(rng() * (ROWS - 4))
// // //         if (grid.get(x, y) !== TILE.ROAD) continue

// // //         // Pick a direction into a building
// // //         const dirs = [[1,0],[-1,0],[0,1],[0,-1]]
// // //         const [dx, dy] = dirs[Math.floor(rng() * 4)]
// // //         if (grid.get(x + dx, y + dy) !== TILE.BUILDING) continue

// // //         // Carve a short alley 3–6 tiles deep
// // //         const len = 3 + Math.floor(rng() * 4)
// // //         let cx = x + dx, cy = y + dy
// // //         for (let j = 0; j < len; j++) {
// // //           if (cx < 1 || cy < 1 || cx >= COLS-1 || cy >= ROWS-1) break
// // //           if (grid.get(cx, cy) === TILE.ROAD) break
// // //           grid.set(cx, cy, TILE.ROAD)
// // //           cx += dx; cy += dy
// // //         }
// // //         break
// // //       }
// // //     }
// // //   }

// // //   static _addRedZones(grid, rng, COLS, ROWS) {
// // //     const zones = []
// // //     // 2 red zones, each ~6x6 tiles around a road intersection
// // //     for (let i = 0; i < 2; i++) {
// // //       for (let attempt = 0; attempt < 30; attempt++) {
// // //         const cx = 8 + Math.floor(rng() * (COLS - 16))
// // //         const cy = 8 + Math.floor(rng() * (ROWS - 16))
// // //         if (grid.get(cx, cy) !== TILE.ROAD) continue
// // //         const r = 5 + Math.floor(rng() * 3)
// // //         zones.push({ cx, cy, r })
// // //         // Paint road tiles in zone as REDZONE
// // //         for (let dy = -r; dy <= r; dy++)
// // //           for (let dx = -r; dx <= r; dx++)
// // //             if (Math.abs(dx) + Math.abs(dy) <= r) {
// // //               const t = grid.get(cx+dx, cy+dy)
// // //               if (t === TILE.ROAD) grid.set(cx+dx, cy+dy, TILE.REDZONE)
// // //             }
// // //         break
// // //       }
// // //     }
// // //     return zones
// // //   }

// // //   static _addSewers(grid, rng, COLS, ROWS) {
// // //     const sewers = []
// // //     // Place 2 sewer entrances on roads, remember them for teleport
// // //     const positions = []
// // //     for (let i = 0; i < 2; i++) {
// // //       for (let attempt = 0; attempt < 80; attempt++) {
// // //         const x = 3 + Math.floor(rng() * (COLS - 6))
// // //         const y = 3 + Math.floor(rng() * (ROWS - 6))
// // //         if (grid.get(x, y) !== TILE.ROAD) continue
// // //         // Keep sewers far apart
// // //         if (positions.length > 0) {
// // //           const d = Math.hypot(x - positions[0].x, y - positions[0].y)
// // //           if (d < 20) continue
// // //         }
// // //         grid.set(x, y, TILE.SEWER)
// // //         positions.push({ x, y })
// // //         break
// // //       }
// // //     }
// // //     return positions
// // //   }

// // //   // static _placeEscape(grid, rng, COLS, ROWS) {
// // //   //   // Place on a road tile near the edge
// // //   //   for (let attempt = 0; attempt < 200; attempt++) {
// // //   //     const side = Math.floor(rng() * 4)
// // //   //     let x, y
// // //   //     if (side === 0) { x = Math.floor(rng() * COLS); y = 0 }
// // //   //     else if (side === 1) { x = COLS-1; y = Math.floor(rng() * ROWS) }
// // //   //     else if (side === 2) { x = Math.floor(rng() * COLS); y = ROWS-1 }
// // //   //     else { x = 0; y = Math.floor(rng() * ROWS) }
// // //   //     if (grid.isWalkable(x, y) || grid.get(x,y) === TILE.BUILDING) {
// // //   //       grid.set(x, y, TILE.ESCAPE)
// // //   //       return { x, y }
// // //   //     }
// // //   //   }
// // //   //   grid.set(0, 0, TILE.ESCAPE)
// // //   //   return { x: 0, y: 0 }
// // //   // }

// // //   static _placeEscape(grid, rng, COLS, ROWS) {
// // //   // Try edge tiles first — must be walkable or forcibly set to ROAD
// // //   const candidates = []

// // //   // Collect all edge-adjacent road tiles (1 tile in from edge)
// // //   for (let x = 1; x < COLS - 1; x++) {
// // //     if (grid.isWalkable(x, 1))       candidates.push({ x, y: 1 })
// // //     if (grid.isWalkable(x, ROWS - 2)) candidates.push({ x, y: ROWS - 2 })
// // //   }
// // //   for (let y = 1; y < ROWS - 1; y++) {
// // //     if (grid.isWalkable(1, y))       candidates.push({ x: 1, y })
// // //     if (grid.isWalkable(COLS - 2, y)) candidates.push({ x: COLS - 2, y })
// // //   }

// // //   if (candidates.length > 0) {
// // //     // Pick a random valid candidate
// // //     const pick = candidates[Math.floor(rng() * candidates.length)]
// // //     grid.set(pick.x, pick.y, TILE.ESCAPE)
// // //     return pick
// // //   }

// // //   // Fallback — find ANY walkable tile near edge
// // //   for (let attempt = 0; attempt < 500; attempt++) {
// // //     const side = Math.floor(rng() * 4)
// // //     let x, y
// // //     if      (side === 0) { x = 1 + Math.floor(rng() * (COLS - 2)); y = 1 }
// // //     else if (side === 1) { x = COLS - 2; y = 1 + Math.floor(rng() * (ROWS - 2)) }
// // //     else if (side === 2) { x = 1 + Math.floor(rng() * (COLS - 2)); y = ROWS - 2 }
// // //     else                 { x = 1; y = 1 + Math.floor(rng() * (ROWS - 2)) }

// // //     // Force a road tile here and connect it to nearest road
// // //     grid.set(x, y, TILE.ROAD)
// // //     // Carve toward center until we hit a road
// // //     const cx = Math.floor(COLS / 2)
// // //     const cy = Math.floor(ROWS / 2)
// // //     let tx = x, ty = y
// // //     for (let step = 0; step < 15; step++) {
// // //       if (tx < cx) tx++; else if (tx > cx) tx--
// // //       if (grid.get(tx, ty) === TILE.ROAD) break
// // //       grid.set(tx, ty, TILE.ROAD)
// // //     }
// // //     tx = x; ty = y
// // //     for (let step = 0; step < 15; step++) {
// // //       if (ty < cy) ty++; else if (ty > cy) ty--
// // //       if (grid.get(tx, ty) === TILE.ROAD) break
// // //       grid.set(tx, ty, TILE.ROAD)
// // //     }

// // //     grid.set(x, y, TILE.ESCAPE)
// // //     return { x, y }
// // //   }

// // //   // Last resort
// // //   grid.set(2, 2, TILE.ROAD)
// // //   grid.set(2, 2, TILE.ESCAPE)
// // //   return { x: 2, y: 2 }
// // // }

// // // static _placeKeycard(grid, rng, COLS, ROWS) {
// // //     // Place keycard roughly in the center area of the map
// // //     for (let attempt = 0; attempt < 200; attempt++) {
// // //       const x = Math.floor(COLS * 0.3 + rng() * COLS * 0.4)
// // //       const y = Math.floor(ROWS * 0.3 + rng() * ROWS * 0.4)
// // //       if (grid.get(x, y) === TILE.ROAD || grid.get(x, y) === TILE.REDZONE) {
// // //         grid.set(x, y, TILE.KEYCARD)
// // //         return { x, y }
// // //       }
// // //     }
// // //     return null
// // //   }

// // // static _placePlayer(grid, rng, COLS, ROWS, escape) {
// // //   // Must be walkable AND far from escape
// // //   for (let attempt = 0; attempt < 500; attempt++) {
// // //     const x = 2 + Math.floor(rng() * (COLS - 4))
// // //     const y = 2 + Math.floor(rng() * (ROWS - 4))
// // //     if (!grid.isWalkable(x, y)) continue
// // //     const d = Math.hypot(x - escape.x, y - escape.y)
// // //     if (d > 25) return { x, y }
// // //   }
// // //   // Fallback — find any walkable tile far enough
// // //   for (let attempt = 0; attempt < 500; attempt++) {
// // //     const x = 2 + Math.floor(rng() * (COLS - 4))
// // //     const y = 2 + Math.floor(rng() * (ROWS - 4))
// // //     if (!grid.isWalkable(x, y)) continue
// // //     return { x, y }
// // //   }
// // //   return { x: Math.floor(COLS / 2), y: Math.floor(ROWS / 2) }
// // // }

  

  

// // //   static _placeGuards(grid, rng, COLS, ROWS, player, escape, redZones) {
// // //     const spawns = []
// // //     const attempts = 200

// // //     // Place extra guards in/near red zones
// // //     for (const zone of redZones) {
// // //       for (let i = 0; i < 2; i++) {
// // //         for (let attempt = 0; attempt < 50; attempt++) {
// // //           const x = zone.cx + Math.floor((rng() - 0.5) * zone.r * 2)
// // //           const y = zone.cy + Math.floor((rng() - 0.5) * zone.r * 2)
// // //           if (!grid.isWalkable(x, y)) continue
// // //           const dp = Math.hypot(x - player.x, y - player.y)
// // //           if (dp < 8) continue
// // //           spawns.push({ x, y })
// // //           break
// // //         }
// // //       }
// // //     }

// // //     // Place guards near escape to force timing
// // //     for (let i = 0; i < 2; i++) {
// // //       for (let attempt = 0; attempt < 50; attempt++) {
// // //         const x = escape.x + Math.floor((rng() - 0.5) * 12)
// // //         const y = escape.y + Math.floor((rng() - 0.5) * 12)
// // //         if (x < 0 || y < 0 || x >= COLS || y >= ROWS) continue
// // //         if (!grid.isWalkable(x, y)) continue
// // //         const dp = Math.hypot(x - player.x, y - player.y)
// // //         if (dp < 8) continue
// // //         spawns.push({ x, y })
// // //         break
// // //       }
// // //     }

// // //     // Fill remaining random spawns
// // //     for (let attempt = 0; attempt < attempts && spawns.length < 20; attempt++) {
// // //       const x = 1 + Math.floor(rng() * (COLS - 2))
// // //       const y = 1 + Math.floor(rng() * (ROWS - 2))
// // //       if (!grid.isWalkable(x, y)) continue
// // //       const dp = Math.hypot(x - player.x, y - player.y)
// // //       if (dp < 12) continue
// // //       spawns.push({ x, y })
// // //     }

// // //     return spawns
// // //   }
// // // }

// // // import { Grid } from './Grid.js'
// // // import { TILE, GRID } from '../game/constants.js'

// // // const { COLS, ROWS } = GRID

// // // /**
// // //  * CityGenerator — Procedural city via seeded RNG + recursive subdivision
// // //  *
// // //  * Returns: { grid, playerStart, escapePoint, guardSpawns }
// // //  */
// // // export class CityGenerator {
// // //   static generate(seed = Date.now()) {
// // //     const rng  = CityGenerator._rng(seed)
// // //     const grid = new Grid()
// // //     grid.cells.fill(TILE.WALL)

// // //     const ROAD_SPACING = 9
// // //     const ROAD_WIDTH   = 2

// // //     // ── Lay road grid ──────────────────────────────────────
// // //     for (let y = 0; y < ROWS; y++)
// // //       if (y % ROAD_SPACING < ROAD_WIDTH)
// // //         for (let x = 0; x < COLS; x++) grid.set(x, y, TILE.ROAD)

// // //     for (let x = 0; x < COLS; x++)
// // //       if (x % ROAD_SPACING < ROAD_WIDTH)
// // //         for (let y = 0; y < ROWS; y++) grid.set(x, y, TILE.ROAD)

// // //     // ── Fill city blocks ───────────────────────────────────
// // //     for (let bRow = 0; bRow * ROAD_SPACING < ROWS; bRow++) {
// // //       for (let bCol = 0; bCol * ROAD_SPACING < COLS; bCol++) {
// // //         const x0 = bCol * ROAD_SPACING + ROAD_WIDTH
// // //         const y0 = bRow * ROAD_SPACING + ROAD_WIDTH
// // //         const x1 = Math.min(x0 + ROAD_SPACING - ROAD_WIDTH - 1, COLS - 1)
// // //         const y1 = Math.min(y0 + ROAD_SPACING - ROAD_WIDTH - 1, ROWS - 1)
// // //         if (x1 <= x0 || y1 <= y0) continue

// // //         if (rng() < 0.8) {
// // //           CityGenerator._placeBuilding(grid, x0, y0, x1, y1, rng)
// // //         } else {
// // //           // open courtyard
// // //           for (let y = y0; y <= y1; y++)
// // //             for (let x = x0; x <= x1; x++) grid.set(x, y, TILE.ROAD)
// // //         }
// // //       }
// // //     }

// // //     // ── Escape point on map edge ───────────────────────────
// // //     const escapePoint = CityGenerator._edgeRoadTile(grid, rng)
// // //     grid.set(escapePoint.x, escapePoint.y, TILE.ESCAPE)

// // //     // ── Player start far from escape ───────────────────────
// // //     let playerStart
// // //     let tries = 0
// // //     do {
// // //       playerStart = CityGenerator._randomRoad(grid, rng)
// // //       tries++
// // //     } while (Grid.manhattan(playerStart.x, playerStart.y, escapePoint.x, escapePoint.y) < 25 && tries < 500)
// // //     grid.set(playerStart.x, playerStart.y, TILE.START)

// // //     // ── Guard spawns far from player ───────────────────────
// // //     const guardSpawns = []
// // //     tries = 0
// // //     while (guardSpawns.length < 10 && tries < 400) {
// // //       tries++
// // //       const p = CityGenerator._randomRoad(grid, rng)
// // //       if (Grid.manhattan(p.x, p.y, playerStart.x, playerStart.y) > 12)
// // //         guardSpawns.push(p)
// // //     }

// // //     return { grid, playerStart, escapePoint, guardSpawns }
// // //   }

// // //   // ── Private helpers ────────────────────────────────────────

// // //   static _placeBuilding(grid, x0, y0, x1, y1, rng) {
// // //     // outer shell
// // //     for (let y = y0; y <= y1; y++)
// // //       for (let x = x0; x <= x1; x++) {
// // //         const isEdge = x === x0 || x === x1 || y === y0 || y === y1
// // //         grid.set(x, y, isEdge ? TILE.WALL : TILE.BUILDING)
// // //       }
// // //     // interior rooms
// // //     CityGenerator._subdivide(grid, x0+1, y0+1, x1-1, y1-1, rng, 1)
// // //     // door
// // //     CityGenerator._addDoor(grid, x0, y0, x1, y1, rng)
// // //   }

// // //   static _subdivide(grid, x0, y0, x1, y1, rng, depth) {
// // //     const w = x1 - x0, h = y1 - y0
// // //     if (w < 3 || h < 3 || depth <= 0) return

// // //     if (h >= 4 && rng() < 0.5) {
// // //       const sy = y0 + 1 + Math.floor(rng() * (h - 2))
// // //       for (let x = x0; x <= x1; x++) grid.set(x, sy, TILE.WALL)
// // //       grid.set(x0 + Math.floor(rng() * (w + 1)), sy, TILE.BUILDING) // gap
// // //     } else if (w >= 4) {
// // //       const sx = x0 + 1 + Math.floor(rng() * (w - 2))
// // //       for (let y = y0; y <= y1; y++) grid.set(sx, y, TILE.WALL)
// // //       grid.set(sx, y0 + Math.floor(rng() * (h + 1)), TILE.BUILDING) // gap
// // //     }
// // //   }

// // //   static _addDoor(grid, x0, y0, x1, y1, rng) {
// // //     const side = Math.floor(rng() * 4)
// // //     let dx, dy
// // //     const w = x1 - x0, h = y1 - y0
// // //     if      (side === 0) { dx = x0 + 1 + Math.floor(rng() * (w - 1)); dy = y0 }
// // //     else if (side === 1) { dx = x1; dy = y0 + 1 + Math.floor(rng() * (h - 1)) }
// // //     else if (side === 2) { dx = x0 + 1 + Math.floor(rng() * (w - 1)); dy = y1 }
// // //     else                 { dx = x0; dy = y0 + 1 + Math.floor(rng() * (h - 1)) }
// // //     grid.set(dx, dy, TILE.DOOR)
// // //   }

// // //   static _randomRoad(grid, rng) {
// // //     let x, y
// // //     do {
// // //       x = Math.floor(rng() * COLS)
// // //       y = Math.floor(rng() * ROWS)
// // //     } while (grid.get(x, y) !== TILE.ROAD)
// // //     return { x, y }
// // //   }

// // //   static _edgeRoadTile(grid, rng) {
// // //     const candidates = []
// // //     for (let x = 0; x < COLS; x++) {
// // //       if (grid.get(x, 0) === TILE.ROAD)        candidates.push({ x, y: 0 })
// // //       if (grid.get(x, ROWS-1) === TILE.ROAD)   candidates.push({ x, y: ROWS-1 })
// // //     }
// // //     for (let y = 0; y < ROWS; y++) {
// // //       if (grid.get(0, y) === TILE.ROAD)        candidates.push({ x: 0, y })
// // //       if (grid.get(COLS-1, y) === TILE.ROAD)  candidates.push({ x: COLS-1, y })
// // //     }
// // //     return candidates[Math.floor(rng() * candidates.length)] || { x: 1, y: 1 }
// // //   }

// // //   /** Linear Congruential Generator — fast, seeded, deterministic */
// // //   static _rng(seed) {
// // //     let s = (seed >>> 0) || 12345
// // //     return () => {
// // //       s = (Math.imul(1664525, s) + 1013904223) >>> 0
// // //       return s / 0xffffffff
// // //     }
// // //   }
// // // }
// // import { Grid } from './Grid.js'
// // import { TILE } from '../game/constants.js'

// // // Seeded LCG random
// // function makeLCG(seed) {
// //   let s = seed >>> 0
// //   return () => {
// //     s = (Math.imul(1664525, s) + 1013904223) >>> 0
// //     return s / 0xffffffff
// //   }
// // }

// // export class CityGenerator {
// //   static generate(seed) {
// //     const rng  = makeLCG(seed)
// //     const COLS = 60, ROWS = 40
// //     const grid = new Grid(COLS, ROWS)

// //     // ── 1. Fill with buildings ──────────────────────────────
// //     for (let y = 0; y < ROWS; y++)
// //       for (let x = 0; x < COLS; x++)
// //         grid.set(x, y, TILE.BUILDING)

// //     // ── 2. Road grid — wider spacing = tighter map ──────────
// //     const ROAD_SPACING = 13   // was 9 — fewer, wider blocks
// //     const ROAD_WIDTH   = 2

// //     for (let y = 0; y < ROWS; y++)
// //       for (let x = 0; x < COLS; x++) {
// //         const onRoadX = x % ROAD_SPACING < ROAD_WIDTH
// //         const onRoadY = y % ROAD_SPACING < ROAD_WIDTH
// //         if (onRoadX || onRoadY) grid.set(x, y, TILE.ROAD)
// //       }

// //     // ── 3. Buildings with rooms ─────────────────────────────
// //     for (let by = 0; by < ROWS; by += ROAD_SPACING) {
// //       for (let bx = 0; bx < COLS; bx += ROAD_SPACING) {
// //         const bw = ROAD_SPACING - ROAD_WIDTH
// //         const bh = ROAD_SPACING - ROAD_WIDTH
// //         const ox = bx + ROAD_WIDTH
// //         const oy = by + ROAD_WIDTH
// //         if (rng() < 0.82) {
// //           CityGenerator._subdivide(grid, rng, ox, oy, bw, bh, 0)
// //           // Add door
// //           const side = Math.floor(rng() * 4)
// //           const mx   = ox + Math.floor(bw / 2)
// //           const my   = oy + Math.floor(bh / 2)
// //           if (side === 0) grid.set(mx, oy - 1, TILE.DOOR)
// //           else if (side === 1) grid.set(ox + bw, my, TILE.DOOR)
// //           else if (side === 2) grid.set(mx, oy + bh, TILE.DOOR)
// //           else grid.set(ox - 1, my, TILE.DOOR)
// //         }
// //       }
// //     }

// //     // ── 4. Dead end alleys ──────────────────────────────────
// //     CityGenerator._addDeadEnds(grid, rng, COLS, ROWS)

// //     // ── 5. Red zones (2 areas with higher guard density) ────
// //     const redZones = CityGenerator._addRedZones(grid, rng, COLS, ROWS)

// //     // ── 6. Sewer tunnels ────────────────────────────────────
// //     const sewers = CityGenerator._addSewers(grid, rng, COLS, ROWS)

// //     // ── 7. Escape point on edge ─────────────────────────────
// //     const escapePoint = CityGenerator._placeEscape(grid, rng, COLS, ROWS)

// //     // ── 8. Keycard somewhere in the middle of the map ───────
// //     const keycardPos = CityGenerator._placeKeycard(grid, rng, COLS, ROWS)

// //     // ── 9. Player start — far from escape ───────────────────
// //     const playerStart = CityGenerator._placePlayer(grid, rng, COLS, ROWS, escapePoint)

// //     // ── 10. Guard spawns ─────────────────────────────────────
// //     const guardSpawns = CityGenerator._placeGuards(
// //       grid, rng, COLS, ROWS, playerStart, escapePoint, redZones
// //     )

// //     return { grid, playerStart, escapePoint, guardSpawns, redZones, sewers, keycardPos }
// //   }

// //   static _subdivide(grid, rng, x, y, w, h, depth) {
// //     if (w < 3 || h < 3 || depth > 2) return
// //     if (rng() < 0.4) return  // leave open

// //     // Horizontal or vertical split
// //     if (w > h) {
// //       const mx = x + 2 + Math.floor(rng() * (w - 3))
// //       for (let j = y; j < y + h; j++) grid.set(mx, j, TILE.BUILDING)
// //       // door in wall
// //       const dy = y + Math.floor(rng() * h)
// //       grid.set(mx, dy, TILE.DOOR)
// //       CityGenerator._subdivide(grid, rng, x, y, mx - x, h, depth + 1)
// //       CityGenerator._subdivide(grid, rng, mx + 1, y, x + w - mx - 1, h, depth + 1)
// //     } else {
// //       const my = y + 2 + Math.floor(rng() * (h - 3))
// //       for (let i = x; i < x + w; i++) grid.set(i, my, TILE.BUILDING)
// //       const dx = x + Math.floor(rng() * w)
// //       grid.set(dx, my, TILE.DOOR)
// //       CityGenerator._subdivide(grid, rng, x, y, w, my - y, depth + 1)
// //       CityGenerator._subdivide(grid, rng, x, my + 1, w, y + h - my - 1, depth + 1)
// //     }
// //   }

// //   static _addDeadEnds(grid, rng, COLS, ROWS) {
// //     // Add 8–12 dead end alleys jutting off roads
// //     const count = 8 + Math.floor(rng() * 5)
// //     for (let i = 0; i < count; i++) {
// //       // Find a road tile on the edge of a building block
// //       for (let attempt = 0; attempt < 50; attempt++) {
// //         const x = 2 + Math.floor(rng() * (COLS - 4))
// //         const y = 2 + Math.floor(rng() * (ROWS - 4))
// //         if (grid.get(x, y) !== TILE.ROAD) continue

// //         // Pick a direction into a building
// //         const dirs = [[1,0],[-1,0],[0,1],[0,-1]]
// //         const [dx, dy] = dirs[Math.floor(rng() * 4)]
// //         if (grid.get(x + dx, y + dy) !== TILE.BUILDING) continue

// //         // Carve a short alley 3–6 tiles deep
// //         const len = 3 + Math.floor(rng() * 4)
// //         let cx = x + dx, cy = y + dy
// //         for (let j = 0; j < len; j++) {
// //           if (cx < 1 || cy < 1 || cx >= COLS-1 || cy >= ROWS-1) break
// //           if (grid.get(cx, cy) === TILE.ROAD) break
// //           grid.set(cx, cy, TILE.ROAD)
// //           cx += dx; cy += dy
// //         }
// //         break
// //       }
// //     }
// //   }

// //   static _addRedZones(grid, rng, COLS, ROWS) {
// //     const zones = []
// //     // 2 red zones, each ~6x6 tiles around a road intersection
// //     for (let i = 0; i < 2; i++) {
// //       for (let attempt = 0; attempt < 30; attempt++) {
// //         const cx = 8 + Math.floor(rng() * (COLS - 16))
// //         const cy = 8 + Math.floor(rng() * (ROWS - 16))
// //         if (grid.get(cx, cy) !== TILE.ROAD) continue
// //         const r = 5 + Math.floor(rng() * 3)
// //         zones.push({ cx, cy, r })
// //         // Paint road tiles in zone as REDZONE
// //         for (let dy = -r; dy <= r; dy++)
// //           for (let dx = -r; dx <= r; dx++)
// //             if (Math.abs(dx) + Math.abs(dy) <= r) {
// //               const t = grid.get(cx+dx, cy+dy)
// //               if (t === TILE.ROAD) grid.set(cx+dx, cy+dy, TILE.REDZONE)
// //             }
// //         break
// //       }
// //     }
// //     return zones
// //   }

// //   static _addSewers(grid, rng, COLS, ROWS) {
// //     const sewers = []
// //     // Place 2 sewer entrances on roads, remember them for teleport
// //     const positions = []
// //     for (let i = 0; i < 2; i++) {
// //       for (let attempt = 0; attempt < 80; attempt++) {
// //         const x = 3 + Math.floor(rng() * (COLS - 6))
// //         const y = 3 + Math.floor(rng() * (ROWS - 6))
// //         if (grid.get(x, y) !== TILE.ROAD) continue
// //         // Keep sewers far apart
// //         if (positions.length > 0) {
// //           const d = Math.hypot(x - positions[0].x, y - positions[0].y)
// //           if (d < 20) continue
// //         }
// //         grid.set(x, y, TILE.SEWER)
// //         positions.push({ x, y })
// //         break
// //       }
// //     }
// //     return positions
// //   }

// //   // static _placeEscape(grid, rng, COLS, ROWS) {
// //   //   // Place on a road tile near the edge
// //   //   for (let attempt = 0; attempt < 200; attempt++) {
// //   //     const side = Math.floor(rng() * 4)
// //   //     let x, y
// //   //     if (side === 0) { x = Math.floor(rng() * COLS); y = 0 }
// //   //     else if (side === 1) { x = COLS-1; y = Math.floor(rng() * ROWS) }
// //   //     else if (side === 2) { x = Math.floor(rng() * COLS); y = ROWS-1 }
// //   //     else { x = 0; y = Math.floor(rng() * ROWS) }
// //   //     if (grid.isWalkable(x, y) || grid.get(x,y) === TILE.BUILDING) {
// //   //       grid.set(x, y, TILE.ESCAPE)
// //   //       return { x, y }
// //   //     }
// //   //   }
// //   //   grid.set(0, 0, TILE.ESCAPE)
// //   //   return { x: 0, y: 0 }
// //   // }

// //   static _placeEscape(grid, rng, COLS, ROWS) {
// //   // Try edge tiles first — must be walkable or forcibly set to ROAD
// //   const candidates = []

// //   // Collect all edge-adjacent road tiles (1 tile in from edge)
// //   for (let x = 1; x < COLS - 1; x++) {
// //     if (grid.isWalkable(x, 1))       candidates.push({ x, y: 1 })
// //     if (grid.isWalkable(x, ROWS - 2)) candidates.push({ x, y: ROWS - 2 })
// //   }
// //   for (let y = 1; y < ROWS - 1; y++) {
// //     if (grid.isWalkable(1, y))       candidates.push({ x: 1, y })
// //     if (grid.isWalkable(COLS - 2, y)) candidates.push({ x: COLS - 2, y })
// //   }

// //   if (candidates.length > 0) {
// //     // Pick a random valid candidate
// //     const pick = candidates[Math.floor(rng() * candidates.length)]
// //     grid.set(pick.x, pick.y, TILE.ESCAPE)
// //     return pick
// //   }

// //   // Fallback — find ANY walkable tile near edge
// //   for (let attempt = 0; attempt < 500; attempt++) {
// //     const side = Math.floor(rng() * 4)
// //     let x, y
// //     if      (side === 0) { x = 1 + Math.floor(rng() * (COLS - 2)); y = 1 }
// //     else if (side === 1) { x = COLS - 2; y = 1 + Math.floor(rng() * (ROWS - 2)) }
// //     else if (side === 2) { x = 1 + Math.floor(rng() * (COLS - 2)); y = ROWS - 2 }
// //     else                 { x = 1; y = 1 + Math.floor(rng() * (ROWS - 2)) }

// //     // Force a road tile here and connect it to nearest road
// //     grid.set(x, y, TILE.ROAD)
// //     // Carve toward center until we hit a road
// //     const cx = Math.floor(COLS / 2)
// //     const cy = Math.floor(ROWS / 2)
// //     let tx = x, ty = y
// //     for (let step = 0; step < 15; step++) {
// //       if (tx < cx) tx++; else if (tx > cx) tx--
// //       if (grid.get(tx, ty) === TILE.ROAD) break
// //       grid.set(tx, ty, TILE.ROAD)
// //     }
// //     tx = x; ty = y
// //     for (let step = 0; step < 15; step++) {
// //       if (ty < cy) ty++; else if (ty > cy) ty--
// //       if (grid.get(tx, ty) === TILE.ROAD) break
// //       grid.set(tx, ty, TILE.ROAD)
// //     }

// //     grid.set(x, y, TILE.ESCAPE)
// //     return { x, y }
// //   }

// //   // Last resort
// //   grid.set(2, 2, TILE.ROAD)
// //   grid.set(2, 2, TILE.ESCAPE)
// //   return { x: 2, y: 2 }
// // }

// // static _placeKeycard(grid, rng, COLS, ROWS) {
// //     // Place keycard roughly in the center area of the map
// //     for (let attempt = 0; attempt < 200; attempt++) {
// //       const x = Math.floor(COLS * 0.3 + rng() * COLS * 0.4)
// //       const y = Math.floor(ROWS * 0.3 + rng() * ROWS * 0.4)
// //       if (grid.get(x, y) === TILE.ROAD || grid.get(x, y) === TILE.REDZONE) {
// //         grid.set(x, y, TILE.KEYCARD)
// //         return { x, y }
// //       }
// //     }
// //     return null
// //   }

// // static _placePlayer(grid, rng, COLS, ROWS, escape) {
// //   // Count walkable neighbours — ensures player isn't trapped in dead end
// //   const openEnough = (x, y) => {
// //     let open = 0
// //     if (grid.isWalkable(x+1, y)) open++
// //     if (grid.isWalkable(x-1, y)) open++
// //     if (grid.isWalkable(x, y+1)) open++
// //     if (grid.isWalkable(x, y-1)) open++
// //     return open >= 2
// //   }
// //   // Must be walkable, open, far from escape
// //   for (let attempt = 0; attempt < 800; attempt++) {
// //     const x = 2 + Math.floor(rng() * (COLS - 4))
// //     const y = 2 + Math.floor(rng() * (ROWS - 4))
// //     if (!grid.isWalkable(x, y)) continue
// //     if (!openEnough(x, y)) continue
// //     if (Math.hypot(x - escape.x, y - escape.y) > 20) return { x, y }
// //   }
// //   // Fallback — open but relaxed distance
// //   for (let attempt = 0; attempt < 500; attempt++) {
// //     const x = 2 + Math.floor(rng() * (COLS - 4))
// //     const y = 2 + Math.floor(rng() * (ROWS - 4))
// //     if (!grid.isWalkable(x, y)) continue
// //     if (openEnough(x, y)) return { x, y }
// //   }
// //   return { x: Math.floor(COLS / 2), y: Math.floor(ROWS / 2) }
// // }

  

  

// //   static _placeGuards(grid, rng, COLS, ROWS, player, escape, redZones) {
// //     const spawns = []
// //     const attempts = 200

// //     // Place extra guards in/near red zones
// //     for (const zone of redZones) {
// //       for (let i = 0; i < 2; i++) {
// //         for (let attempt = 0; attempt < 50; attempt++) {
// //           const x = zone.cx + Math.floor((rng() - 0.5) * zone.r * 2)
// //           const y = zone.cy + Math.floor((rng() - 0.5) * zone.r * 2)
// //           if (!grid.isWalkable(x, y)) continue
// //           const dp = Math.hypot(x - player.x, y - player.y)
// //           if (dp < 8) continue
// //           spawns.push({ x, y })
// //           break
// //         }
// //       }
// //     }

// //     // Place guards near escape to force timing
// //     for (let i = 0; i < 2; i++) {
// //       for (let attempt = 0; attempt < 50; attempt++) {
// //         const x = escape.x + Math.floor((rng() - 0.5) * 12)
// //         const y = escape.y + Math.floor((rng() - 0.5) * 12)
// //         if (x < 0 || y < 0 || x >= COLS || y >= ROWS) continue
// //         if (!grid.isWalkable(x, y)) continue
// //         const dp = Math.hypot(x - player.x, y - player.y)
// //         if (dp < 8) continue
// //         spawns.push({ x, y })
// //         break
// //       }
// //     }

// //     // Fill remaining random spawns
// //     for (let attempt = 0; attempt < attempts && spawns.length < 20; attempt++) {
// //       const x = 1 + Math.floor(rng() * (COLS - 2))
// //       const y = 1 + Math.floor(rng() * (ROWS - 2))
// //       if (!grid.isWalkable(x, y)) continue
// //       const dp = Math.hypot(x - player.x, y - player.y)
// //       if (dp < 12) continue
// //       spawns.push({ x, y })
// //     }

// //     return spawns
// //   }
// // }




// //---------------------------------------------------------------------------------------


// // import { Grid } from './Grid.js'
// // import { TILE, GRID } from '../game/constants.js'

// // const { COLS, ROWS } = GRID

// // /**
// //  * CityGenerator — Procedural city via seeded RNG + recursive subdivision
// //  *
// //  * Returns: { grid, playerStart, escapePoint, guardSpawns }
// //  */
// // export class CityGenerator {
// //   static generate(seed = Date.now()) {
// //     const rng  = CityGenerator._rng(seed)
// //     const grid = new Grid()
// //     grid.cells.fill(TILE.WALL)

// //     const ROAD_SPACING = 9
// //     const ROAD_WIDTH   = 2

// //     // ── Lay road grid ──────────────────────────────────────
// //     for (let y = 0; y < ROWS; y++)
// //       if (y % ROAD_SPACING < ROAD_WIDTH)
// //         for (let x = 0; x < COLS; x++) grid.set(x, y, TILE.ROAD)

// //     for (let x = 0; x < COLS; x++)
// //       if (x % ROAD_SPACING < ROAD_WIDTH)
// //         for (let y = 0; y < ROWS; y++) grid.set(x, y, TILE.ROAD)

// //     // ── Fill city blocks ───────────────────────────────────
// //     for (let bRow = 0; bRow * ROAD_SPACING < ROWS; bRow++) {
// //       for (let bCol = 0; bCol * ROAD_SPACING < COLS; bCol++) {
// //         const x0 = bCol * ROAD_SPACING + ROAD_WIDTH
// //         const y0 = bRow * ROAD_SPACING + ROAD_WIDTH
// //         const x1 = Math.min(x0 + ROAD_SPACING - ROAD_WIDTH - 1, COLS - 1)
// //         const y1 = Math.min(y0 + ROAD_SPACING - ROAD_WIDTH - 1, ROWS - 1)
// //         if (x1 <= x0 || y1 <= y0) continue

// //         if (rng() < 0.8) {
// //           CityGenerator._placeBuilding(grid, x0, y0, x1, y1, rng)
// //         } else {
// //           // open courtyard
// //           for (let y = y0; y <= y1; y++)
// //             for (let x = x0; x <= x1; x++) grid.set(x, y, TILE.ROAD)
// //         }
// //       }
// //     }

// //     // ── Escape point on map edge ───────────────────────────
// //     const escapePoint = CityGenerator._edgeRoadTile(grid, rng)
// //     grid.set(escapePoint.x, escapePoint.y, TILE.ESCAPE)

// //     // ── Player start far from escape ───────────────────────
// //     let playerStart
// //     let tries = 0
// //     do {
// //       playerStart = CityGenerator._randomRoad(grid, rng)
// //       tries++
// //     } while (Grid.manhattan(playerStart.x, playerStart.y, escapePoint.x, escapePoint.y) < 25 && tries < 500)
// //     grid.set(playerStart.x, playerStart.y, TILE.START)

// //     // ── Guard spawns far from player ───────────────────────
// //     const guardSpawns = []
// //     tries = 0
// //     while (guardSpawns.length < 10 && tries < 400) {
// //       tries++
// //       const p = CityGenerator._randomRoad(grid, rng)
// //       if (Grid.manhattan(p.x, p.y, playerStart.x, playerStart.y) > 12)
// //         guardSpawns.push(p)
// //     }

// //     return { grid, playerStart, escapePoint, guardSpawns }
// //   }

// //   // ── Private helpers ────────────────────────────────────────

// //   static _placeBuilding(grid, x0, y0, x1, y1, rng) {
// //     // outer shell
// //     for (let y = y0; y <= y1; y++)
// //       for (let x = x0; x <= x1; x++) {
// //         const isEdge = x === x0 || x === x1 || y === y0 || y === y1
// //         grid.set(x, y, isEdge ? TILE.WALL : TILE.BUILDING)
// //       }
// //     // interior rooms
// //     CityGenerator._subdivide(grid, x0+1, y0+1, x1-1, y1-1, rng, 1)
// //     // door
// //     CityGenerator._addDoor(grid, x0, y0, x1, y1, rng)
// //   }

// //   static _subdivide(grid, x0, y0, x1, y1, rng, depth) {
// //     const w = x1 - x0, h = y1 - y0
// //     if (w < 3 || h < 3 || depth <= 0) return

// //     if (h >= 4 && rng() < 0.5) {
// //       const sy = y0 + 1 + Math.floor(rng() * (h - 2))
// //       for (let x = x0; x <= x1; x++) grid.set(x, sy, TILE.WALL)
// //       grid.set(x0 + Math.floor(rng() * (w + 1)), sy, TILE.BUILDING) // gap
// //     } else if (w >= 4) {
// //       const sx = x0 + 1 + Math.floor(rng() * (w - 2))
// //       for (let y = y0; y <= y1; y++) grid.set(sx, y, TILE.WALL)
// //       grid.set(sx, y0 + Math.floor(rng() * (h + 1)), TILE.BUILDING) // gap
// //     }
// //   }

// //   static _addDoor(grid, x0, y0, x1, y1, rng) {
// //     const side = Math.floor(rng() * 4)
// //     let dx, dy
// //     const w = x1 - x0, h = y1 - y0
// //     if      (side === 0) { dx = x0 + 1 + Math.floor(rng() * (w - 1)); dy = y0 }
// //     else if (side === 1) { dx = x1; dy = y0 + 1 + Math.floor(rng() * (h - 1)) }
// //     else if (side === 2) { dx = x0 + 1 + Math.floor(rng() * (w - 1)); dy = y1 }
// //     else                 { dx = x0; dy = y0 + 1 + Math.floor(rng() * (h - 1)) }
// //     grid.set(dx, dy, TILE.DOOR)
// //   }

// //   static _randomRoad(grid, rng) {
// //     let x, y
// //     do {
// //       x = Math.floor(rng() * COLS)
// //       y = Math.floor(rng() * ROWS)
// //     } while (grid.get(x, y) !== TILE.ROAD)
// //     return { x, y }
// //   }

// //   static _edgeRoadTile(grid, rng) {
// //     const candidates = []
// //     for (let x = 0; x < COLS; x++) {
// //       if (grid.get(x, 0) === TILE.ROAD)        candidates.push({ x, y: 0 })
// //       if (grid.get(x, ROWS-1) === TILE.ROAD)   candidates.push({ x, y: ROWS-1 })
// //     }
// //     for (let y = 0; y < ROWS; y++) {
// //       if (grid.get(0, y) === TILE.ROAD)        candidates.push({ x: 0, y })
// //       if (grid.get(COLS-1, y) === TILE.ROAD)  candidates.push({ x: COLS-1, y })
// //     }
// //     return candidates[Math.floor(rng() * candidates.length)] || { x: 1, y: 1 }
// //   }

// //   /** Linear Congruential Generator — fast, seeded, deterministic */
// //   static _rng(seed) {
// //     let s = (seed >>> 0) || 12345
// //     return () => {
// //       s = (Math.imul(1664525, s) + 1013904223) >>> 0
// //       return s / 0xffffffff
// //     }
// //   }
// // }
// import { Grid } from './Grid.js'
// import { TILE } from '../game/constants.js'

// // Seeded LCG random
// function makeLCG(seed) {
//   let s = seed >>> 0
//   return () => {
//     s = (Math.imul(1664525, s) + 1013904223) >>> 0
//     return s / 0xffffffff
//   }
// }

// export class CityGenerator {
//   static generate(seed, opts = {}) {
//     const { mapType = 'city', keycards = 1 } = opts
//     const rng  = makeLCG(seed)
//     const COLS = 60, ROWS = 40
//     const grid = new Grid(COLS, ROWS)

//     // ── 1. Archetype config ────────────────────────────────
//     // Each map type changes road spacing and building density
//     const ARCHETYPE = {
//       city:       { ROAD_SPACING: 13, ROAD_WIDTH: 2, BUILDING_CHANCE: 0.82, RED_ZONES: 2 },
//       warehouse:  { ROAD_SPACING: 18, ROAD_WIDTH: 3, BUILDING_CHANCE: 0.45, RED_ZONES: 1 },
//       slums:      { ROAD_SPACING: 8,  ROAD_WIDTH: 1, BUILDING_CHANCE: 0.90, RED_ZONES: 2 },
//       industrial: { ROAD_SPACING: 15, ROAD_WIDTH: 2, BUILDING_CHANCE: 0.70, RED_ZONES: 3 },
//     }
//     const arch = ARCHETYPE[mapType] || ARCHETYPE.city
//     const ROAD_SPACING     = arch.ROAD_SPACING
//     const ROAD_WIDTH       = arch.ROAD_WIDTH
//     const BUILDING_CHANCE  = arch.BUILDING_CHANCE
//     const NUM_RED_ZONES    = arch.RED_ZONES

//     // ── 2. Fill with buildings ──────────────────────────────
//     for (let y = 0; y < ROWS; y++)
//       for (let x = 0; x < COLS; x++)
//         grid.set(x, y, TILE.BUILDING)

//     for (let y = 0; y < ROWS; y++)
//       for (let x = 0; x < COLS; x++) {
//         const onRoadX = x % ROAD_SPACING < ROAD_WIDTH
//         const onRoadY = y % ROAD_SPACING < ROAD_WIDTH
//         if (onRoadX || onRoadY) grid.set(x, y, TILE.ROAD)
//       }

//     // ── 3. Buildings with rooms ─────────────────────────────
//     for (let by = 0; by < ROWS; by += ROAD_SPACING) {
//       for (let bx = 0; bx < COLS; bx += ROAD_SPACING) {
//         const bw = ROAD_SPACING - ROAD_WIDTH
//         const bh = ROAD_SPACING - ROAD_WIDTH
//         const ox = bx + ROAD_WIDTH
//         const oy = by + ROAD_WIDTH
//         if (rng() < BUILDING_CHANCE) {
//           CityGenerator._subdivide(grid, rng, ox, oy, bw, bh, 0)
//           // Add door
//           const side = Math.floor(rng() * 4)
//           const mx   = ox + Math.floor(bw / 2)
//           const my   = oy + Math.floor(bh / 2)
//           if (side === 0) grid.set(mx, oy - 1, TILE.DOOR)
//           else if (side === 1) grid.set(ox + bw, my, TILE.DOOR)
//           else if (side === 2) grid.set(mx, oy + bh, TILE.DOOR)
//           else grid.set(ox - 1, my, TILE.DOOR)
//         }
//       }
//     }

//     // ── 4. Dead end alleys ──────────────────────────────────
//     CityGenerator._addDeadEnds(grid, rng, COLS, ROWS)

//     // ── 5. Red zones (2 areas with higher guard density) ────
//     const redZones = CityGenerator._addRedZones(grid, rng, COLS, ROWS, NUM_RED_ZONES)

//     // ── 6. Sewer tunnels ────────────────────────────────────
//     const sewers = CityGenerator._addSewers(grid, rng, COLS, ROWS)

//     // ── 7. Escape point on edge ─────────────────────────────
//     const escapePoint = CityGenerator._placeEscape(grid, rng, COLS, ROWS)

//     // ── 8. Player first (guards + keycards placed around them) 
//     const playerStart = CityGenerator._placePlayer(grid, rng, COLS, ROWS, escapePoint, [])

//     // ── 9. Keycards — far from player, far from escape ───────
//     const keycardPositions = []
//     for (let k = 0; k < keycards; k++) {
//       const pos = CityGenerator._placeKeycard(
//         grid, rng, COLS, ROWS, k, keycards, playerStart, [], escapePoint
//       )
//       if (pos) keycardPositions.push(pos)
//     }
//     const keycardPos = keycardPositions[0] || null

//     // ── 10. Guards — scattered, 1 near each key, 1 near exit ─
//     const guardSpawns = CityGenerator._placeGuards(
//       grid, rng, COLS, ROWS, playerStart, escapePoint, redZones, keycardPositions
//     )

//     return { grid, playerStart, escapePoint, guardSpawns, redZones, sewers, keycardPos, keycardPositions }
//   }

//   static _subdivide(grid, rng, x, y, w, h, depth) {
//     if (w < 3 || h < 3 || depth > 2) return
//     if (rng() < 0.4) return  // leave open

//     // Horizontal or vertical split
//     if (w > h) {
//       const mx = x + 2 + Math.floor(rng() * (w - 3))
//       for (let j = y; j < y + h; j++) grid.set(mx, j, TILE.BUILDING)
//       // door in wall
//       const dy = y + Math.floor(rng() * h)
//       grid.set(mx, dy, TILE.DOOR)
//       CityGenerator._subdivide(grid, rng, x, y, mx - x, h, depth + 1)
//       CityGenerator._subdivide(grid, rng, mx + 1, y, x + w - mx - 1, h, depth + 1)
//     } else {
//       const my = y + 2 + Math.floor(rng() * (h - 3))
//       for (let i = x; i < x + w; i++) grid.set(i, my, TILE.BUILDING)
//       const dx = x + Math.floor(rng() * w)
//       grid.set(dx, my, TILE.DOOR)
//       CityGenerator._subdivide(grid, rng, x, y, w, my - y, depth + 1)
//       CityGenerator._subdivide(grid, rng, x, my + 1, w, y + h - my - 1, depth + 1)
//     }
//   }

//   static _addDeadEnds(grid, rng, COLS, ROWS) {
//     // Add 8–12 dead end alleys jutting off roads
//     const count = 8 + Math.floor(rng() * 5)
//     for (let i = 0; i < count; i++) {
//       // Find a road tile on the edge of a building block
//       for (let attempt = 0; attempt < 50; attempt++) {
//         const x = 2 + Math.floor(rng() * (COLS - 4))
//         const y = 2 + Math.floor(rng() * (ROWS - 4))
//         if (grid.get(x, y) !== TILE.ROAD) continue

//         // Pick a direction into a building
//         const dirs = [[1,0],[-1,0],[0,1],[0,-1]]
//         const [dx, dy] = dirs[Math.floor(rng() * 4)]
//         if (grid.get(x + dx, y + dy) !== TILE.BUILDING) continue

//         // Carve a short alley 3–6 tiles deep
//         const len = 3 + Math.floor(rng() * 4)
//         let cx = x + dx, cy = y + dy
//         for (let j = 0; j < len; j++) {
//           if (cx < 1 || cy < 1 || cx >= COLS-1 || cy >= ROWS-1) break
//           if (grid.get(cx, cy) === TILE.ROAD) break
//           grid.set(cx, cy, TILE.ROAD)
//           cx += dx; cy += dy
//         }
//         break
//       }
//     }
//   }

//   static _addRedZones(grid, rng, COLS, ROWS, count = 2) {
//     const zones = []
//     for (let i = 0; i < count; i++) {
//       for (let attempt = 0; attempt < 30; attempt++) {
//         const cx = 8 + Math.floor(rng() * (COLS - 16))
//         const cy = 8 + Math.floor(rng() * (ROWS - 16))
//         if (grid.get(cx, cy) !== TILE.ROAD) continue
//         const r = 5 + Math.floor(rng() * 3)
//         zones.push({ cx, cy, r })
//         // Paint road tiles in zone as REDZONE
//         for (let dy = -r; dy <= r; dy++)
//           for (let dx = -r; dx <= r; dx++)
//             if (Math.abs(dx) + Math.abs(dy) <= r) {
//               const t = grid.get(cx+dx, cy+dy)
//               if (t === TILE.ROAD) grid.set(cx+dx, cy+dy, TILE.REDZONE)
//             }
//         break
//       }
//     }
//     return zones
//   }

//   static _addSewers(grid, rng, COLS, ROWS) {
//     const sewers = []
//     // Place 2 sewer entrances on roads, remember them for teleport
//     const positions = []
//     for (let i = 0; i < 2; i++) {
//       for (let attempt = 0; attempt < 80; attempt++) {
//         const x = 3 + Math.floor(rng() * (COLS - 6))
//         const y = 3 + Math.floor(rng() * (ROWS - 6))
//         if (grid.get(x, y) !== TILE.ROAD) continue
//         // Keep sewers far apart
//         if (positions.length > 0) {
//           const d = Math.hypot(x - positions[0].x, y - positions[0].y)
//           if (d < 20) continue
//         }
//         grid.set(x, y, TILE.SEWER)
//         positions.push({ x, y })
//         break
//       }
//     }
//     return positions
//   }

//   // static _placeEscape(grid, rng, COLS, ROWS) {
//   //   // Place on a road tile near the edge
//   //   for (let attempt = 0; attempt < 200; attempt++) {
//   //     const side = Math.floor(rng() * 4)
//   //     let x, y
//   //     if (side === 0) { x = Math.floor(rng() * COLS); y = 0 }
//   //     else if (side === 1) { x = COLS-1; y = Math.floor(rng() * ROWS) }
//   //     else if (side === 2) { x = Math.floor(rng() * COLS); y = ROWS-1 }
//   //     else { x = 0; y = Math.floor(rng() * ROWS) }
//   //     if (grid.isWalkable(x, y) || grid.get(x,y) === TILE.BUILDING) {
//   //       grid.set(x, y, TILE.ESCAPE)
//   //       return { x, y }
//   //     }
//   //   }
//   //   grid.set(0, 0, TILE.ESCAPE)
//   //   return { x: 0, y: 0 }
//   // }

//   static _placeEscape(grid, rng, COLS, ROWS) {
//   // Try edge tiles first — must be walkable or forcibly set to ROAD
//   const candidates = []

//   // Collect all edge-adjacent road tiles (1 tile in from edge)
//   for (let x = 1; x < COLS - 1; x++) {
//     if (grid.isWalkable(x, 1))       candidates.push({ x, y: 1 })
//     if (grid.isWalkable(x, ROWS - 2)) candidates.push({ x, y: ROWS - 2 })
//   }
//   for (let y = 1; y < ROWS - 1; y++) {
//     if (grid.isWalkable(1, y))       candidates.push({ x: 1, y })
//     if (grid.isWalkable(COLS - 2, y)) candidates.push({ x: COLS - 2, y })
//   }

//   if (candidates.length > 0) {
//     // Pick a random valid candidate
//     const pick = candidates[Math.floor(rng() * candidates.length)]
//     grid.set(pick.x, pick.y, TILE.ESCAPE)
//     return pick
//   }

//   // Fallback — find ANY walkable tile near edge
//   for (let attempt = 0; attempt < 500; attempt++) {
//     const side = Math.floor(rng() * 4)
//     let x, y
//     if      (side === 0) { x = 1 + Math.floor(rng() * (COLS - 2)); y = 1 }
//     else if (side === 1) { x = COLS - 2; y = 1 + Math.floor(rng() * (ROWS - 2)) }
//     else if (side === 2) { x = 1 + Math.floor(rng() * (COLS - 2)); y = ROWS - 2 }
//     else                 { x = 1; y = 1 + Math.floor(rng() * (ROWS - 2)) }

//     // Force a road tile here and connect it to nearest road
//     grid.set(x, y, TILE.ROAD)
//     // Carve toward center until we hit a road
//     const cx = Math.floor(COLS / 2)
//     const cy = Math.floor(ROWS / 2)
//     let tx = x, ty = y
//     for (let step = 0; step < 15; step++) {
//       if (tx < cx) tx++; else if (tx > cx) tx--
//       if (grid.get(tx, ty) === TILE.ROAD) break
//       grid.set(tx, ty, TILE.ROAD)
//     }
//     tx = x; ty = y
//     for (let step = 0; step < 15; step++) {
//       if (ty < cy) ty++; else if (ty > cy) ty--
//       if (grid.get(tx, ty) === TILE.ROAD) break
//       grid.set(tx, ty, TILE.ROAD)
//     }

//     grid.set(x, y, TILE.ESCAPE)
//     return { x, y }
//   }

//   // Last resort
//   grid.set(2, 2, TILE.ROAD)
//   grid.set(2, 2, TILE.ESCAPE)
//   return { x: 2, y: 2 }
// }

// static _placeKeycard(grid, rng, COLS, ROWS, idx = 0, total = 1, player = null, guardSpawns = [], escape = null) {
//     // Score candidates — higher = better keycard spot
//     // Prefer: far from player, near at least one guard, near escape, on road
//     const score = (x, y) => {
//       let s = 0
//       // Far from player spawn = good (forced to venture into danger)
//       if (player) s += Math.min(Math.hypot(x - player.x, y - player.y), 30)
//       // Near at least one guard = dangerous placement
//       if (guardSpawns.length) {
//         const minGuardDist = Math.min(...guardSpawns.map(g => Math.hypot(x - g.x, y - g.y)))
//         s += Math.max(0, 20 - minGuardDist) * 1.5  // bonus for being close to guards
//       }
//       // FAR from escape = player must cross map after collecting key
//       if (escape) s += Math.min(Math.hypot(x - escape.x, y - escape.y), 35) * 1.2
//       return s
//     }

//     // Spread multiple keycards across map thirds horizontally
//     const seg    = 1 / total
//     const xStart = Math.floor(COLS * (0.05 + seg * idx))
//     const xEnd   = Math.floor(COLS * (0.05 + seg * (idx + 1)))
//     const yStart = Math.floor(ROWS * 0.1)
//     const yEnd   = Math.floor(ROWS * 0.9)

//     // Sample candidates and pick the best scored one
//     let best = null, bestScore = -1
//     for (let attempt = 0; attempt < 400; attempt++) {
//       const x = xStart + Math.floor(rng() * Math.max(1, xEnd - xStart))
//       const y = yStart + Math.floor(rng() * Math.max(1, yEnd - yStart))
//       const t = grid.get(x, y)
//       if (t !== TILE.ROAD && t !== TILE.REDZONE) continue
//       // Must be at least 10 tiles from player
//       if (player && Math.hypot(x - player.x, y - player.y) < 10) continue
//       const s = score(x, y)
//       if (s > bestScore) { bestScore = s; best = { x, y } }
//     }

//     if (best) {
//       grid.set(best.x, best.y, TILE.KEYCARD)
//       return best
//     }

//     // Fallback — any road tile in zone
//     for (let attempt = 0; attempt < 200; attempt++) {
//       const x = Math.floor(rng() * COLS)
//       const y = Math.floor(rng() * ROWS)
//       if (grid.get(x, y) === TILE.ROAD) {
//         grid.set(x, y, TILE.KEYCARD)
//         return { x, y }
//       }
//     }
//     return null
//   }

// static _placePlayer(grid, rng, COLS, ROWS, escape, guardSpawns = []) {
//   const openEnough = (x, y) => {
//     let open = 0
//     if (grid.isWalkable(x+1, y)) open++
//     if (grid.isWalkable(x-1, y)) open++
//     if (grid.isWalkable(x, y+1)) open++
//     if (grid.isWalkable(x, y-1)) open++
//     return open >= 2
//   }

//   const farFromGuards = (x, y, minDist) =>
//     guardSpawns.every(g => Math.hypot(x - g.x, y - g.y) >= minDist)

//   // Best: open + far from escape + far from all guards (18 tiles)
//   for (let attempt = 0; attempt < 1000; attempt++) {
//     const x = 2 + Math.floor(rng() * (COLS - 4))
//     const y = 2 + Math.floor(rng() * (ROWS - 4))
//     if (!grid.isWalkable(x, y)) continue
//     if (!openEnough(x, y)) continue
//     if (Math.hypot(x - escape.x, y - escape.y) < 20) continue
//     if (!farFromGuards(x, y, 18)) continue
//     return { x, y }
//   }
//   // Relax guard distance to 12
//   for (let attempt = 0; attempt < 500; attempt++) {
//     const x = 2 + Math.floor(rng() * (COLS - 4))
//     const y = 2 + Math.floor(rng() * (ROWS - 4))
//     if (!grid.isWalkable(x, y)) continue
//     if (!openEnough(x, y)) continue
//     if (!farFromGuards(x, y, 12)) continue
//     return { x, y }
//   }
//   // Last resort — any open walkable tile
//   for (let attempt = 0; attempt < 500; attempt++) {
//     const x = 2 + Math.floor(rng() * (COLS - 4))
//     const y = 2 + Math.floor(rng() * (ROWS - 4))
//     if (grid.isWalkable(x, y) && openEnough(x, y)) return { x, y }
//   }
//   return { x: Math.floor(COLS / 2), y: Math.floor(ROWS / 2) }
// }

  

  

//   static _placeGuards(grid, rng, COLS, ROWS, player, escape, redZones, keycardPositions = []) {
//     const spawns = []
//     const MIN_PLAYER_DIST  = 16   // never spawn this close to player
//     const MIN_GUARD_SPREAD = 8    // guards must be this far from each other

//     const isFarFromPlayer  = (x, y) => !player || Math.hypot(x - player.x, y - player.y) >= MIN_PLAYER_DIST
//     const isFarFromSpawns  = (x, y) => spawns.every(s => Math.hypot(x - s.x, y - s.y) >= MIN_GUARD_SPREAD)

//     const findNear = (cx, cy, radius, fallbackRadius = radius * 2) => {
//       for (let attempt = 0; attempt < 80; attempt++) {
//         const angle = rng() * Math.PI * 2
//         const r     = 2 + rng() * radius
//         const x     = Math.round(cx + Math.cos(angle) * r)
//         const y     = Math.round(cy + Math.sin(angle) * r)
//         if (x < 1 || y < 1 || x >= COLS - 1 || y >= ROWS - 1) continue
//         if (!grid.isWalkable(x, y)) continue
//         if (!isFarFromPlayer(x, y)) continue
//         if (!isFarFromSpawns(x, y)) continue
//         return { x, y }
//       }
//       // Fallback with bigger radius
//       for (let attempt = 0; attempt < 60; attempt++) {
//         const angle = rng() * Math.PI * 2
//         const r     = radius + rng() * fallbackRadius
//         const x     = Math.round(cx + Math.cos(angle) * r)
//         const y     = Math.round(cy + Math.sin(angle) * r)
//         if (x < 1 || y < 1 || x >= COLS - 1 || y >= ROWS - 1) continue
//         if (!grid.isWalkable(x, y)) continue
//         if (!isFarFromPlayer(x, y)) continue
//         return { x, y }
//       }
//       return null
//     }

//     // ── 1. One guard near each keycard ──────────────────────
//     for (const kp of keycardPositions) {
//       const s = findNear(kp.x, kp.y, 5)
//       if (s) spawns.push(s)
//     }

//     // ── 2. One guard near the exit ───────────────────────────
//     const exitGuard = findNear(escape.x, escape.y, 6)
//     if (exitGuard) spawns.push(exitGuard)

//     // ── 3. One guard per red zone ────────────────────────────
//     for (const zone of redZones) {
//       const s = findNear(zone.cx, zone.cy, zone.r)
//       if (s) spawns.push(s)
//     }

//     // ── 4. Fill rest scattered across the whole map ──────────
//     // Divide map into a grid of sectors — place one guard per sector
//     const SECTOR_COLS = 4
//     const SECTOR_ROWS = 3
//     const sw = Math.floor(COLS / SECTOR_COLS)
//     const sh = Math.floor(ROWS / SECTOR_ROWS)

//     for (let row = 0; row < SECTOR_ROWS; row++) {
//       for (let col = 0; col < SECTOR_COLS; col++) {
//         const cx = Math.floor(sw * col + sw / 2)
//         const cy = Math.floor(sh * row + sh / 2)
//         for (let attempt = 0; attempt < 60; attempt++) {
//           const x = sw * col + 1 + Math.floor(rng() * (sw - 2))
//           const y = sh * row + 1 + Math.floor(rng() * (sh - 2))
//           if (x >= COLS || y >= ROWS) continue
//           if (!grid.isWalkable(x, y)) continue
//           if (!isFarFromPlayer(x, y)) continue
//           if (!isFarFromSpawns(x, y)) continue
//           spawns.push({ x, y })
//           break
//         }
//       }
//     }

//     return spawns
//   }
// }



// import { Grid } from './Grid.js'
// import { TILE, GRID } from '../game/constants.js'

// const { COLS, ROWS } = GRID

// /**
//  * CityGenerator — Procedural city via seeded RNG + recursive subdivision
//  *
//  * Returns: { grid, playerStart, escapePoint, guardSpawns }
//  */
// export class CityGenerator {
//   static generate(seed = Date.now()) {
//     const rng  = CityGenerator._rng(seed)
//     const grid = new Grid()
//     grid.cells.fill(TILE.WALL)

//     const ROAD_SPACING = 9
//     const ROAD_WIDTH   = 2

//     // ── Lay road grid ──────────────────────────────────────
//     for (let y = 0; y < ROWS; y++)
//       if (y % ROAD_SPACING < ROAD_WIDTH)
//         for (let x = 0; x < COLS; x++) grid.set(x, y, TILE.ROAD)

//     for (let x = 0; x < COLS; x++)
//       if (x % ROAD_SPACING < ROAD_WIDTH)
//         for (let y = 0; y < ROWS; y++) grid.set(x, y, TILE.ROAD)

//     // ── Fill city blocks ───────────────────────────────────
//     for (let bRow = 0; bRow * ROAD_SPACING < ROWS; bRow++) {
//       for (let bCol = 0; bCol * ROAD_SPACING < COLS; bCol++) {
//         const x0 = bCol * ROAD_SPACING + ROAD_WIDTH
//         const y0 = bRow * ROAD_SPACING + ROAD_WIDTH
//         const x1 = Math.min(x0 + ROAD_SPACING - ROAD_WIDTH - 1, COLS - 1)
//         const y1 = Math.min(y0 + ROAD_SPACING - ROAD_WIDTH - 1, ROWS - 1)
//         if (x1 <= x0 || y1 <= y0) continue

//         if (rng() < 0.8) {
//           CityGenerator._placeBuilding(grid, x0, y0, x1, y1, rng)
//         } else {
//           // open courtyard
//           for (let y = y0; y <= y1; y++)
//             for (let x = x0; x <= x1; x++) grid.set(x, y, TILE.ROAD)
//         }
//       }
//     }

//     // ── Escape point on map edge ───────────────────────────
//     const escapePoint = CityGenerator._edgeRoadTile(grid, rng)
//     grid.set(escapePoint.x, escapePoint.y, TILE.ESCAPE)

//     // ── Player start far from escape ───────────────────────
//     let playerStart
//     let tries = 0
//     do {
//       playerStart = CityGenerator._randomRoad(grid, rng)
//       tries++
//     } while (Grid.manhattan(playerStart.x, playerStart.y, escapePoint.x, escapePoint.y) < 25 && tries < 500)
//     grid.set(playerStart.x, playerStart.y, TILE.START)

//     // ── Guard spawns far from player ───────────────────────
//     const guardSpawns = []
//     tries = 0
//     while (guardSpawns.length < 10 && tries < 400) {
//       tries++
//       const p = CityGenerator._randomRoad(grid, rng)
//       if (Grid.manhattan(p.x, p.y, playerStart.x, playerStart.y) > 12)
//         guardSpawns.push(p)
//     }

//     return { grid, playerStart, escapePoint, guardSpawns }
//   }

//   // ── Private helpers ────────────────────────────────────────

//   static _placeBuilding(grid, x0, y0, x1, y1, rng) {
//     // outer shell
//     for (let y = y0; y <= y1; y++)
//       for (let x = x0; x <= x1; x++) {
//         const isEdge = x === x0 || x === x1 || y === y0 || y === y1
//         grid.set(x, y, isEdge ? TILE.WALL : TILE.BUILDING)
//       }
//     // interior rooms
//     CityGenerator._subdivide(grid, x0+1, y0+1, x1-1, y1-1, rng, 1)
//     // door
//     CityGenerator._addDoor(grid, x0, y0, x1, y1, rng)
//   }

//   static _subdivide(grid, x0, y0, x1, y1, rng, depth) {
//     const w = x1 - x0, h = y1 - y0
//     if (w < 3 || h < 3 || depth <= 0) return

//     if (h >= 4 && rng() < 0.5) {
//       const sy = y0 + 1 + Math.floor(rng() * (h - 2))
//       for (let x = x0; x <= x1; x++) grid.set(x, sy, TILE.WALL)
//       grid.set(x0 + Math.floor(rng() * (w + 1)), sy, TILE.BUILDING) // gap
//     } else if (w >= 4) {
//       const sx = x0 + 1 + Math.floor(rng() * (w - 2))
//       for (let y = y0; y <= y1; y++) grid.set(sx, y, TILE.WALL)
//       grid.set(sx, y0 + Math.floor(rng() * (h + 1)), TILE.BUILDING) // gap
//     }
//   }

//   static _addDoor(grid, x0, y0, x1, y1, rng) {
//     const side = Math.floor(rng() * 4)
//     let dx, dy
//     const w = x1 - x0, h = y1 - y0
//     if      (side === 0) { dx = x0 + 1 + Math.floor(rng() * (w - 1)); dy = y0 }
//     else if (side === 1) { dx = x1; dy = y0 + 1 + Math.floor(rng() * (h - 1)) }
//     else if (side === 2) { dx = x0 + 1 + Math.floor(rng() * (w - 1)); dy = y1 }
//     else                 { dx = x0; dy = y0 + 1 + Math.floor(rng() * (h - 1)) }
//     grid.set(dx, dy, TILE.DOOR)
//   }

//   static _randomRoad(grid, rng) {
//     let x, y
//     do {
//       x = Math.floor(rng() * COLS)
//       y = Math.floor(rng() * ROWS)
//     } while (grid.get(x, y) !== TILE.ROAD)
//     return { x, y }
//   }

//   static _edgeRoadTile(grid, rng) {
//     const candidates = []
//     for (let x = 0; x < COLS; x++) {
//       if (grid.get(x, 0) === TILE.ROAD)        candidates.push({ x, y: 0 })
//       if (grid.get(x, ROWS-1) === TILE.ROAD)   candidates.push({ x, y: ROWS-1 })
//     }
//     for (let y = 0; y < ROWS; y++) {
//       if (grid.get(0, y) === TILE.ROAD)        candidates.push({ x: 0, y })
//       if (grid.get(COLS-1, y) === TILE.ROAD)  candidates.push({ x: COLS-1, y })
//     }
//     return candidates[Math.floor(rng() * candidates.length)] || { x: 1, y: 1 }
//   }

//   /** Linear Congruential Generator — fast, seeded, deterministic */
//   static _rng(seed) {
//     let s = (seed >>> 0) || 12345
//     return () => {
//       s = (Math.imul(1664525, s) + 1013904223) >>> 0
//       return s / 0xffffffff
//     }
//   }
// }
import { Grid } from './Grid.js'
import { TILE } from '../game/constants.js'

// Seeded LCG random
function makeLCG(seed) {
  let s = seed >>> 0
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0
    return s / 0xffffffff
  }
}

export class CityGenerator {
  static generate(seed, opts = {}) {
    const { mapType = 'city', keycards = 1 } = opts
    const rng  = makeLCG(seed)
    const COLS = 60, ROWS = 40
    const grid = new Grid(COLS, ROWS)

    // ── 1. Archetype config ────────────────────────────────
    // Each map type changes road spacing and building density
    const ARCHETYPE = {
      city:       { ROAD_SPACING: 13, ROAD_WIDTH: 2, BUILDING_CHANCE: 0.82, RED_ZONES: 2 },
      warehouse:  { ROAD_SPACING: 18, ROAD_WIDTH: 3, BUILDING_CHANCE: 0.45, RED_ZONES: 1 },
      slums:      { ROAD_SPACING: 8,  ROAD_WIDTH: 1, BUILDING_CHANCE: 0.90, RED_ZONES: 2 },
      industrial: { ROAD_SPACING: 15, ROAD_WIDTH: 2, BUILDING_CHANCE: 0.70, RED_ZONES: 3 },
    }
    const arch = ARCHETYPE[mapType] || ARCHETYPE.city
    const ROAD_SPACING     = arch.ROAD_SPACING
    const ROAD_WIDTH       = arch.ROAD_WIDTH
    const BUILDING_CHANCE  = arch.BUILDING_CHANCE
    const NUM_RED_ZONES    = arch.RED_ZONES

    // ── 2. Fill with buildings ──────────────────────────────
    for (let y = 0; y < ROWS; y++)
      for (let x = 0; x < COLS; x++)
        grid.set(x, y, TILE.BUILDING)

    for (let y = 0; y < ROWS; y++)
      for (let x = 0; x < COLS; x++) {
        const onRoadX = x % ROAD_SPACING < ROAD_WIDTH
        const onRoadY = y % ROAD_SPACING < ROAD_WIDTH
        if (onRoadX || onRoadY) grid.set(x, y, TILE.ROAD)
      }

    // ── 3. Buildings with rooms ─────────────────────────────
    for (let by = 0; by < ROWS; by += ROAD_SPACING) {
      for (let bx = 0; bx < COLS; bx += ROAD_SPACING) {
        const bw = ROAD_SPACING - ROAD_WIDTH
        const bh = ROAD_SPACING - ROAD_WIDTH
        const ox = bx + ROAD_WIDTH
        const oy = by + ROAD_WIDTH
        if (rng() < BUILDING_CHANCE) {
          CityGenerator._subdivide(grid, rng, ox, oy, bw, bh, 0)
          // Add door
          const side = Math.floor(rng() * 4)
          const mx   = ox + Math.floor(bw / 2)
          const my   = oy + Math.floor(bh / 2)
          if (side === 0) grid.set(mx, oy - 1, TILE.DOOR)
          else if (side === 1) grid.set(ox + bw, my, TILE.DOOR)
          else if (side === 2) grid.set(mx, oy + bh, TILE.DOOR)
          else grid.set(ox - 1, my, TILE.DOOR)
        }
      }
    }

    // ── 4. Dead end alleys ──────────────────────────────────
    CityGenerator._addDeadEnds(grid, rng, COLS, ROWS)

    // ── 5. Red zones (2 areas with higher guard density) ────
    const redZones = CityGenerator._addRedZones(grid, rng, COLS, ROWS, NUM_RED_ZONES)

    // ── 6. Sewer tunnels ────────────────────────────────────
    const sewers = CityGenerator._addSewers(grid, rng, COLS, ROWS)

    // ── 7. Escape point on edge ─────────────────────────────
    const escapePoint = CityGenerator._placeEscape(grid, rng, COLS, ROWS)

    // ── 8. Player first (guards + keycards placed around them) 
    const playerStart = CityGenerator._placePlayer(grid, rng, COLS, ROWS, escapePoint, [])

    // ── 9. Keycards — far from player, far from escape ───────
    const keycardPositions = []
    for (let k = 0; k < keycards; k++) {
      const pos = CityGenerator._placeKeycard(
        grid, rng, COLS, ROWS, k, keycards, playerStart, [], escapePoint
      )
      if (pos) keycardPositions.push(pos)
    }
    const keycardPos = keycardPositions[0] || null

    // ── 10. Guards — scattered, 1 near each key, 1 near exit ─
    const guardSpawns = CityGenerator._placeGuards(
      grid, rng, COLS, ROWS, playerStart, escapePoint, redZones, keycardPositions
    )

    return { grid, playerStart, escapePoint, guardSpawns, redZones, sewers, keycardPos, keycardPositions }
  }

  static _subdivide(grid, rng, x, y, w, h, depth) {
    if (w < 3 || h < 3 || depth > 2) return
    if (rng() < 0.4) return  // leave open

    // Horizontal or vertical split
    if (w > h) {
      const mx = x + 2 + Math.floor(rng() * (w - 3))
      for (let j = y; j < y + h; j++) grid.set(mx, j, TILE.BUILDING)
      // door in wall
      const dy = y + Math.floor(rng() * h)
      grid.set(mx, dy, TILE.DOOR)
      CityGenerator._subdivide(grid, rng, x, y, mx - x, h, depth + 1)
      CityGenerator._subdivide(grid, rng, mx + 1, y, x + w - mx - 1, h, depth + 1)
    } else {
      const my = y + 2 + Math.floor(rng() * (h - 3))
      for (let i = x; i < x + w; i++) grid.set(i, my, TILE.BUILDING)
      const dx = x + Math.floor(rng() * w)
      grid.set(dx, my, TILE.DOOR)
      CityGenerator._subdivide(grid, rng, x, y, w, my - y, depth + 1)
      CityGenerator._subdivide(grid, rng, x, my + 1, w, y + h - my - 1, depth + 1)
    }
  }

  static _addDeadEnds(grid, rng, COLS, ROWS) {
    // Add 8–12 dead end alleys jutting off roads
    const count = 8 + Math.floor(rng() * 5)
    for (let i = 0; i < count; i++) {
      // Find a road tile on the edge of a building block
      for (let attempt = 0; attempt < 50; attempt++) {
        const x = 2 + Math.floor(rng() * (COLS - 4))
        const y = 2 + Math.floor(rng() * (ROWS - 4))
        if (grid.get(x, y) !== TILE.ROAD) continue

        // Pick a direction into a building
        const dirs = [[1,0],[-1,0],[0,1],[0,-1]]
        const [dx, dy] = dirs[Math.floor(rng() * 4)]
        if (grid.get(x + dx, y + dy) !== TILE.BUILDING) continue

        // Carve a short alley 3–6 tiles deep
        const len = 3 + Math.floor(rng() * 4)
        let cx = x + dx, cy = y + dy
        for (let j = 0; j < len; j++) {
          if (cx < 1 || cy < 1 || cx >= COLS-1 || cy >= ROWS-1) break
          if (grid.get(cx, cy) === TILE.ROAD) break
          grid.set(cx, cy, TILE.ROAD)
          cx += dx; cy += dy
        }
        break
      }
    }
  }

  static _addRedZones(grid, rng, COLS, ROWS, count = 2) {
    const zones = []
    for (let i = 0; i < count; i++) {
      for (let attempt = 0; attempt < 30; attempt++) {
        const cx = 8 + Math.floor(rng() * (COLS - 16))
        const cy = 8 + Math.floor(rng() * (ROWS - 16))
        if (grid.get(cx, cy) !== TILE.ROAD) continue
        const r = 5 + Math.floor(rng() * 3)
        zones.push({ cx, cy, r })
        // Paint road tiles in zone as REDZONE
        for (let dy = -r; dy <= r; dy++)
          for (let dx = -r; dx <= r; dx++)
            if (Math.abs(dx) + Math.abs(dy) <= r) {
              const t = grid.get(cx+dx, cy+dy)
              if (t === TILE.ROAD) grid.set(cx+dx, cy+dy, TILE.REDZONE)
            }
        break
      }
    }
    return zones
  }

  static _addSewers(grid, rng, COLS, ROWS) {
    const sewers = []
    // Place 2 sewer entrances on roads, remember them for teleport
    const positions = []
    for (let i = 0; i < 2; i++) {
      for (let attempt = 0; attempt < 80; attempt++) {
        const x = 3 + Math.floor(rng() * (COLS - 6))
        const y = 3 + Math.floor(rng() * (ROWS - 6))
        if (grid.get(x, y) !== TILE.ROAD) continue
        // Keep sewers far apart
        if (positions.length > 0) {
          const d = Math.hypot(x - positions[0].x, y - positions[0].y)
          if (d < 20) continue
        }
        grid.set(x, y, TILE.SEWER)
        positions.push({ x, y })
        break
      }
    }
    return positions
  }

  // static _placeEscape(grid, rng, COLS, ROWS) {
  //   // Place on a road tile near the edge
  //   for (let attempt = 0; attempt < 200; attempt++) {
  //     const side = Math.floor(rng() * 4)
  //     let x, y
  //     if (side === 0) { x = Math.floor(rng() * COLS); y = 0 }
  //     else if (side === 1) { x = COLS-1; y = Math.floor(rng() * ROWS) }
  //     else if (side === 2) { x = Math.floor(rng() * COLS); y = ROWS-1 }
  //     else { x = 0; y = Math.floor(rng() * ROWS) }
  //     if (grid.isWalkable(x, y) || grid.get(x,y) === TILE.BUILDING) {
  //       grid.set(x, y, TILE.ESCAPE)
  //       return { x, y }
  //     }
  //   }
  //   grid.set(0, 0, TILE.ESCAPE)
  //   return { x: 0, y: 0 }
  // }

  static _placeEscape(grid, rng, COLS, ROWS) {
  // Try edge tiles first — must be walkable or forcibly set to ROAD
  const candidates = []

  // Collect all edge-adjacent road tiles (1 tile in from edge)
  for (let x = 1; x < COLS - 1; x++) {
    if (grid.isWalkable(x, 1))       candidates.push({ x, y: 1 })
    if (grid.isWalkable(x, ROWS - 2)) candidates.push({ x, y: ROWS - 2 })
  }
  for (let y = 1; y < ROWS - 1; y++) {
    if (grid.isWalkable(1, y))       candidates.push({ x: 1, y })
    if (grid.isWalkable(COLS - 2, y)) candidates.push({ x: COLS - 2, y })
  }

  if (candidates.length > 0) {
    // Pick a random valid candidate
    const pick = candidates[Math.floor(rng() * candidates.length)]
    grid.set(pick.x, pick.y, TILE.ESCAPE)
    return pick
  }

  // Fallback — find ANY walkable tile near edge
  for (let attempt = 0; attempt < 500; attempt++) {
    const side = Math.floor(rng() * 4)
    let x, y
    if      (side === 0) { x = 1 + Math.floor(rng() * (COLS - 2)); y = 1 }
    else if (side === 1) { x = COLS - 2; y = 1 + Math.floor(rng() * (ROWS - 2)) }
    else if (side === 2) { x = 1 + Math.floor(rng() * (COLS - 2)); y = ROWS - 2 }
    else                 { x = 1; y = 1 + Math.floor(rng() * (ROWS - 2)) }

    // Force a road tile here and connect it to nearest road
    grid.set(x, y, TILE.ROAD)
    // Carve toward center until we hit a road
    const cx = Math.floor(COLS / 2)
    const cy = Math.floor(ROWS / 2)
    let tx = x, ty = y
    for (let step = 0; step < 15; step++) {
      if (tx < cx) tx++; else if (tx > cx) tx--
      if (grid.get(tx, ty) === TILE.ROAD) break
      grid.set(tx, ty, TILE.ROAD)
    }
    tx = x; ty = y
    for (let step = 0; step < 15; step++) {
      if (ty < cy) ty++; else if (ty > cy) ty--
      if (grid.get(tx, ty) === TILE.ROAD) break
      grid.set(tx, ty, TILE.ROAD)
    }

    grid.set(x, y, TILE.ESCAPE)
    return { x, y }
  }

  // Last resort
  grid.set(2, 2, TILE.ROAD)
  grid.set(2, 2, TILE.ESCAPE)
  return { x: 2, y: 2 }
}

static _placeKeycard(grid, rng, COLS, ROWS, idx = 0, total = 1, player = null, guardSpawns = [], escape = null) {
    // Score candidates — higher = better keycard spot
    // Prefer: far from player, near at least one guard, near escape, on road
    const score = (x, y) => {
      let s = 0
      // Far from player spawn = good (forced to venture into danger)
      if (player) s += Math.min(Math.hypot(x - player.x, y - player.y), 30)
      // Near at least one guard = dangerous placement
      if (guardSpawns.length) {
        const minGuardDist = Math.min(...guardSpawns.map(g => Math.hypot(x - g.x, y - g.y)))
        s += Math.max(0, 20 - minGuardDist) * 1.5  // bonus for being close to guards
      }
      // FAR from escape = player must cross map after collecting key
      if (escape) s += Math.min(Math.hypot(x - escape.x, y - escape.y), 35) * 1.2
      return s
    }

    // Spread multiple keycards across map thirds horizontally
    const seg    = 1 / total
    const xStart = Math.floor(COLS * (0.05 + seg * idx))
    const xEnd   = Math.floor(COLS * (0.05 + seg * (idx + 1)))
    const yStart = Math.floor(ROWS * 0.1)
    const yEnd   = Math.floor(ROWS * 0.9)

    // Sample candidates and pick the best scored one
    let best = null, bestScore = -1
    for (let attempt = 0; attempt < 400; attempt++) {
      const x = xStart + Math.floor(rng() * Math.max(1, xEnd - xStart))
      const y = yStart + Math.floor(rng() * Math.max(1, yEnd - yStart))
      const t = grid.get(x, y)
      if (t !== TILE.ROAD && t !== TILE.REDZONE) continue
      // Must be at least 10 tiles from player
      if (player && Math.hypot(x - player.x, y - player.y) < 10) continue
      const s = score(x, y)
      if (s > bestScore) { bestScore = s; best = { x, y } }
    }

    if (best) {
      grid.set(best.x, best.y, TILE.KEYCARD)
      return best
    }

    // Fallback — any road tile in zone
    for (let attempt = 0; attempt < 200; attempt++) {
      const x = Math.floor(rng() * COLS)
      const y = Math.floor(rng() * ROWS)
      if (grid.get(x, y) === TILE.ROAD) {
        grid.set(x, y, TILE.KEYCARD)
        return { x, y }
      }
    }
    return null
  }

static _placePlayer(grid, rng, COLS, ROWS, escape, guardSpawns = []) {
  const openEnough = (x, y) => {
    let open = 0
    if (grid.isWalkable(x+1, y)) open++
    if (grid.isWalkable(x-1, y)) open++
    if (grid.isWalkable(x, y+1)) open++
    if (grid.isWalkable(x, y-1)) open++
    return open >= 2
  }

  const farFromGuards = (x, y, minDist) =>
    guardSpawns.every(g => Math.hypot(x - g.x, y - g.y) >= minDist)

  // Best: open + far from escape + far from all guards (18 tiles)
  for (let attempt = 0; attempt < 1000; attempt++) {
    const x = 2 + Math.floor(rng() * (COLS - 4))
    const y = 2 + Math.floor(rng() * (ROWS - 4))
    if (!grid.isWalkable(x, y)) continue
    if (!openEnough(x, y)) continue
    if (Math.hypot(x - escape.x, y - escape.y) < 20) continue
    if (!farFromGuards(x, y, 18)) continue
    return { x, y }
  }
  // Relax guard distance to 12
  for (let attempt = 0; attempt < 500; attempt++) {
    const x = 2 + Math.floor(rng() * (COLS - 4))
    const y = 2 + Math.floor(rng() * (ROWS - 4))
    if (!grid.isWalkable(x, y)) continue
    if (!openEnough(x, y)) continue
    if (!farFromGuards(x, y, 12)) continue
    return { x, y }
  }
  // Last resort — any open walkable tile
  for (let attempt = 0; attempt < 500; attempt++) {
    const x = 2 + Math.floor(rng() * (COLS - 4))
    const y = 2 + Math.floor(rng() * (ROWS - 4))
    if (grid.isWalkable(x, y) && openEnough(x, y)) return { x, y }
  }
  return { x: Math.floor(COLS / 2), y: Math.floor(ROWS / 2) }
}

  

  

  static _placeGuards(grid, rng, COLS, ROWS, player, escape, redZones, keycardPositions = []) {
    const spawns = []
    const MIN_PLAYER_DIST  = 16
    const MIN_GUARD_SPREAD = 8

    // Guard must be on a ROAD tile with ≥2 open neighbours — never in dead ends or empty space
    const isGoodSpawn = (x, y) => {
      if (x < 1 || y < 1 || x >= COLS - 1 || y >= ROWS - 1) return false
      if (grid.get(x, y) !== TILE.ROAD) return false
      const open = [[x+1,y],[x-1,y],[x,y+1],[x,y-1]]
        .filter(([nx,ny]) => grid.isWalkable(nx, ny)).length
      return open >= 2
    }

    const isFarFromPlayer = (x, y) => !player || Math.hypot(x - player.x, y - player.y) >= MIN_PLAYER_DIST
    const isFarFromSpawns = (x, y) => spawns.every(s => Math.hypot(x - s.x, y - s.y) >= MIN_GUARD_SPREAD)

    const findNear = (cx, cy, radius, fallbackRadius = radius * 2) => {
      for (let attempt = 0; attempt < 100; attempt++) {
        const angle = rng() * Math.PI * 2
        const r     = 2 + rng() * radius
        const x     = Math.round(cx + Math.cos(angle) * r)
        const y     = Math.round(cy + Math.sin(angle) * r)
        if (!isGoodSpawn(x, y)) continue
        if (!isFarFromPlayer(x, y)) continue
        if (!isFarFromSpawns(x, y)) continue
        return { x, y }
      }
      // Fallback — bigger radius, relax guard spread
      for (let attempt = 0; attempt < 100; attempt++) {
        const angle = rng() * Math.PI * 2
        const r     = radius + rng() * fallbackRadius
        const x     = Math.round(cx + Math.cos(angle) * r)
        const y     = Math.round(cy + Math.sin(angle) * r)
        if (!isGoodSpawn(x, y)) continue
        if (!isFarFromPlayer(x, y)) continue
        return { x, y }
      }
      return null
    }

    // ── 1. One guard near each keycard ──────────────────────
    for (const kp of keycardPositions) {
      const s = findNear(kp.x, kp.y, 5)
      if (s) spawns.push(s)
    }

    // ── 2. One guard near the exit ───────────────────────────
    const exitGuard = findNear(escape.x, escape.y, 6)
    if (exitGuard) spawns.push(exitGuard)

    // ── 3. One guard per red zone ────────────────────────────
    for (const zone of redZones) {
      const s = findNear(zone.cx, zone.cy, zone.r)
      if (s) spawns.push(s)
    }

    // ── 4. Fill rest scattered across the whole map ──────────
    // Divide map into a grid of sectors — place one guard per sector
    const SECTOR_COLS = 4
    const SECTOR_ROWS = 3
    const sw = Math.floor(COLS / SECTOR_COLS)
    const sh = Math.floor(ROWS / SECTOR_ROWS)

    for (let row = 0; row < SECTOR_ROWS; row++) {
      for (let col = 0; col < SECTOR_COLS; col++) {
        for (let attempt = 0; attempt < 80; attempt++) {
          const x = sw * col + 1 + Math.floor(rng() * (sw - 2))
          const y = sh * row + 1 + Math.floor(rng() * (sh - 2))
          if (!isGoodSpawn(x, y)) continue
          if (!isFarFromPlayer(x, y)) continue
          if (!isFarFromSpawns(x, y)) continue
          spawns.push({ x, y })
          break
        }
      }
    }

    return spawns
  }
}