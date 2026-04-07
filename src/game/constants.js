// // ─────────────────────────────────────────────────────────────
// // constants.js  — single source of truth for all game config
// // ─────────────────────────────────────────────────────────────

// export const TILE_SIZE = 20

// export const GRID = { COLS: 60, ROWS: 40 }

// export const CANVAS = {
//   WIDTH:  GRID.COLS * TILE_SIZE,
//   HEIGHT: GRID.ROWS * TILE_SIZE,
// }

// export const TILE = {
//   EMPTY:   0,
//   WALL:    1,
//   ROAD:    2,
//   BUILDING:3,
//   DOOR:    4,
//   ESCAPE:  5,
//   START:   6,
// }

// export const COLORS = {
//   0: '#0a0a12',
//   1: '#0d1117',
//   2: '#111827',
//   3: '#0c1a2e',
//   4: '#2d1b69',
//   5: '#00ff88',
//   6: '#111827',
//   ROAD_LINE:    'rgba(0,212,255,0.04)',
//   PLAYER:       '#00d4ff',
//   GUARD_PATROL: '#ff3333',
//   GUARD_ALERT:  '#ff8800',
//   GUARD_SEARCH: '#e8e800',
//   ASTAR_PATH:   'rgba(255,136,0,0.35)',
//   escapePulse:  (a) => `rgba(0,255,136,${a})`,
//   heat:         (v) => `rgba(255,${Math.floor(60*(1-v))},0,${v*0.55})`,
// }

// export const PLAYER_CFG = {
//   SPEED:        2.5,
//   SPRINT_MULT:  1.8,
//   CROUCH_MULT:  0.5,
//   VISION_TILES: 8,
//   NOISE_WALK:   1.0,
//   NOISE_SPRINT: 2.5,
//   NOISE_CROUCH: 0.3,
// }

// export const GUARD_CFG = {
//   BASE_SPEED:   1.8,
//   BASE_VISION:  6,
//   HEAR_BASE:    4,
//   ALERT_DECAY:  0.008,
//   COMM_RANGE:   15,
//   PATH_RECALC:  30,
// }

// export const ROUND_CFG = {
//   TIME_LIMIT:       180,
//   INITIAL_GUARDS:   4,
//   MAX_GUARDS:       12,
//   GUARDS_PER_ROUND: 1,
// }

// export const GA_CFG = {
//   POPULATION:     10,
//   MUTATION_RATE:  0.15,
//   MUTATION_RANGE: 0.3,
//   ELITISM:        2,
//   FITNESS_CATCH:  10,
//   FITNESS_SPOT:   2,
// }

// export const BEHAVIOR = {
//   PATROL:      'patrol',
//   INVESTIGATE: 'investigate',
//   SEARCH:      'search',
//   CHASE:       'chase',
//   BLOCK:       'block',
// }


export const TILE_SIZE = 20

export const TILE = {
  EMPTY:   0,
  ROAD:    1,
  BUILDING:2,
  DOOR:    3,
  ESCAPE:  4,
  SEWER:   5,
  KEYCARD: 6,
  REDZONE: 7,
}

export const COLORS = {
  [TILE.EMPTY]:    '#0a0a0f',
  [TILE.ROAD]:     '#12121a',
  [TILE.BUILDING]: '#1a1a2e',
  [TILE.DOOR]:     '#2a1a0e',
  [TILE.ESCAPE]:   '#003320',
  [TILE.SEWER]:    '#0a1a0a',
  [TILE.KEYCARD]:  '#1a1a00',
  [TILE.REDZONE]:  '#1a0505',
  ROAD_LINE:       'rgba(255,255,255,0.03)',
  GUARD_PATROL:    '#ff3333',
  GUARD_ALERT:     '#ff6600',
  GUARD_SEARCH:    '#ffaa00',
  ASTAR_PATH:      'rgba(255,140,0,0.6)',
  heat:     v => `rgba(255,60,0,${Math.min(v * 0.6, 0.5)})`,
  escapePulse: a => `rgba(0,255,136,${a})`,
}

export const CANVAS = {
  WIDTH:  1200,
  HEIGHT: 800,
}

export const PLAYER_CFG = {
  SPEED:        3.5,
  SPRINT_MULT:  1.8,
  CROUCH_MULT:  0.5,
  VISION_TILES: 8,
  NOISE_WALK:   1.0,
  NOISE_SPRINT: 2.5,
  NOISE_CROUCH: 0.3,
}

export const GUARD_CFG = {
  BASE_SPEED:   2.8,    // was 1.8 — significantly faster
  BASE_VISION:  7,      // was 6
  HEAR_BASE:    5,
  ALERT_DECAY:  0.003,  // slower decay — guards stay alert longer
  PATH_RECALC:  20,
  COMM_RANGE:   25,
  CHASE_MEMORY: 5.0,    // seconds guard keeps chasing after losing sight
}

export const ROUND_CFG = {
  TIME_LIMIT:      150,   // was 180 — less time
  INITIAL_GUARDS:  5,     // was 4
  GUARDS_PER_ROUND:1,
  MAX_GUARDS:      14,
  LIGHTS_OUT_AT:   75,    // seconds remaining when lights go out
}

export const BEHAVIOR = {
  PATROL:      'patrol',
  INVESTIGATE: 'investigate',
  SEARCH:      'search',
  CHASE:       'chase',
  BLOCK:       'block',
}


export const GA_CFG = {
  POPULATION:     10,
  MUTATION_RATE:  0.15,
  MUTATION_RANGE: 0.3,
  ELITISM:        2,
  FITNESS_CATCH:  10,
  FITNESS_SPOT:   2,
}
