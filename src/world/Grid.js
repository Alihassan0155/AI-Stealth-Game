// import { GRID, TILE } from '../game/constants.js'

// const { COLS, ROWS } = GRID

// export class Grid {
//   constructor() {
//     this.cols  = COLS
//     this.rows  = ROWS
//     this.cells = new Uint8Array(COLS * ROWS)
//   }

//   _idx(x, y) { return y * COLS + x }

//   get(x, y) {
//     if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return TILE.WALL
//     return this.cells[this._idx(x, y)]
//   }

//   set(x, y, val) {
//     if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return
//     this.cells[this._idx(x, y)] = val
//   }

//   isWalkable(x, y) {
//     const t = this.get(x, y)
//     return t !== TILE.WALL && t !== TILE.BUILDING
//   }

//   /** 4-directional walkable neighbours */
//   neighbours4(x, y) {
//     return [[x+1,y],[x-1,y],[x,y+1],[x,y-1]]
//       .filter(([nx, ny]) => this.isWalkable(nx, ny))
//   }

//   /** Find all tiles of a given type */
//   findAll(type) {
//     const result = []
//     for (let y = 0; y < ROWS; y++)
//       for (let x = 0; x < COLS; x++)
//         if (this.get(x, y) === type) result.push({ x, y })
//     return result
//   }

//   static manhattan(ax, ay, bx, by) {
//     return Math.abs(ax - bx) + Math.abs(ay - by)
//   }

//   static euclidean(ax, ay, bx, by) {
//     return Math.hypot(ax - bx, ay - by)
//   }
// }


import { TILE } from '../game/constants.js'

export class Grid {
  constructor(cols, rows) {
    this.cols = cols
    this.rows = rows
    this.data = new Uint8Array(cols * rows)
  }

  get(x, y) {
    if (x < 0 || y < 0 || x >= this.cols || y >= this.rows) return TILE.BUILDING
    return this.data[y * this.cols + x]
  }

  set(x, y, val) {
    if (x < 0 || y < 0 || x >= this.cols || y >= this.rows) return
    this.data[y * this.cols + x] = val
  }

  isWalkable(x, y) {
    const t = this.get(x, y)
    return t === TILE.ROAD
        || t === TILE.DOOR
        || t === TILE.ESCAPE
        || t === TILE.SEWER
        || t === TILE.KEYCARD
        || t === TILE.REDZONE
  }

  neighbours4(x, y) {
  return [
    [x - 1, y],
    [x + 1, y],
    [x, y - 1],
    [x, y + 1],
  ].filter(([nx, ny]) => this.isWalkable(nx, ny))
}

  findAll(tileType) {
    const result = []
    for (let y = 0; y < this.rows; y++)
      for (let x = 0; x < this.cols; x++)
        if (this.get(x, y) === tileType) result.push({ x, y })
    return result
  }

  static manhattan(x1, y1, x2, y2) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2)
  }

  static euclidean(x1, y1, x2, y2) {
    return Math.hypot(x1 - x2, y1 - y2)
  }
}