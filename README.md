# 🏙️ Evolving Escape City

A stealth-survival game where AI guards continuously **evolve** to catch you using real AI algorithms.

## 🎮 Gameplay

You start somewhere in a procedurally generated city. Your goal: **reach the green escape tile** before time runs out or the guards catch you.

Every round, the guards get smarter. After each round, a **Genetic Algorithm** evolves their strategies — the best hunters survive and reproduce.

---

## 🧠 AI Algorithms Used

| Algorithm | Role |
|-----------|------|
| **BFS** | Guards sweep areas room by room when player is unknown |
| **DFS** | Guards dive deep into buildings to flush you out |
| **A\*** | Guards compute optimal chase paths when they spot you |
| **Hill Climbing** | Guards pick best action each frame (chase/block/search/patrol) |
| **Genetic Algorithm** | Guard genes evolve across rounds — speed, vision, teamwork, aggression |
| **Heatmap (Probabilistic)** | Guards estimate where you probably are based on last sightings |
| **Behavior Trees** | Clean state logic: PATROL → INVESTIGATE → SEARCH → CHASE → BLOCK |
| **Multi-Agent Coordination** | High-teamwork guards radio your position to nearby units |
| **Procedural Generation** | City layout is randomly generated every round via seeded RNG |
| **Fog of War** | You only see your immediate area — guards lurk in darkness |

---

## 🗂️ Project Structure

```
evolving-escape-city/
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx               # React entry
    ├── App.jsx                # Root component
    ├── index.css              # Global styles
    │
    ├── game/
    │   ├── constants.js       # Tile sizes, speeds, colours, config
    │   ├── Game.js            # Main game loop & state machine
    │   └── Round.js           # Per-round logic
    │
    ├── world/
    │   ├── Grid.js            # 2D tile grid data structure
    │   ├── CityGenerator.js   # Procedural city (roads + buildings)
    │   └── Tilemap.js         # Canvas rendering of the city
    │
    ├── ai/
    │   ├── AStar.js           # A* pathfinding
    │   ├── BFS.js             # Breadth-first area sweep
    │   ├── DFS.js             # Depth-first building dive
    │   ├── HillClimbing.js    # Guard action decision scoring
    │   ├── BehaviorTree.js    # Guard state machine orchestrator
    │   ├── HeatMap.js         # Probabilistic player location tracking
    │   └── GeneticAlgorithm.js# Evolve guard genes between rounds
    │
    ├── player/
    │   └── Player.js          # Player movement, stealth, noise
    │
    ├── systems/
    │   ├── Guard.js           # Guard entity (uses all AI modules)
    │   ├── MultiAgentCoord.js # Guard-to-guard radio communication
    │   ├── VisibilitySystem.js# Line-of-sight raycasting
    │   └── EventBus.js        # Pub/sub game event system
    │
    ├── ui/
    │   ├── HUD.jsx            # Round, time, alert level display
    │   ├── Overlay.jsx        # Menu / round end screen
    │   ├── GenePanel.jsx      # Live guard gene visualiser
    │   ├── Legend.jsx         # Colour key
    │   └── DebugOverlay.jsx   # A* paths, heatmap toggle
    │
    └── hooks/
        └── useGameLoop.js     # requestAnimationFrame React hook
```

---

## 🚀 Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/evolving-escape-city.git
cd evolving-escape-city

# 2. Install dependencies
npm install

# 3. Run dev server
npm run dev

# 4. Open in browser
# http://localhost:5173
```

---

## 🎯 Controls

| Key | Action |
|-----|--------|
| `WASD` / `Arrow Keys` | Move |
| `Shift` | Sprint (faster but noisy!) |
| `Ctrl` | Crouch (quiet but slow) |
| `Tab` | Toggle debug mode (shows A* paths + heatmap) |
| `G` | Toggle guard gene panel |

---

## 🧬 How the Genetic Algorithm Works

Each guard has **genes**:
- `aggression` — how directly they chase
- `searchRadius` — how wide they sweep
- `teamwork` — how much they share intel
- `visionMult` — sight range multiplier
- `speedMult` — movement speed multiplier
- `patrolFreq` — how often they change patrol routes
- `predictionAcc` — how well they predict your next move

After each round:
1. Guards are ranked by **fitness** (catches + spots)
2. Top 2 survive unchanged (elitism)
3. The rest are bred via **crossover** with random **mutation**
4. Next round's guards inherit the winning traits

By round 5–10, guards are significantly smarter than round 1.

---

## 🌐 Deploy to GitHub Pages

```bash
npm run build
# Then push the dist/ folder, or use GitHub Actions
```

---

## 🛠️ Tech Stack

- **React 18** — UI components (HUD, overlays, panels)
- **Vite** — lightning fast dev server + bundler
- **HTML5 Canvas** — game rendering
- **Vanilla JS** — all game/AI logic (no game engine needed)

---

## 📚 AI Concepts Demonstrated

This project is essentially an **interactive AI research simulation**:

- Search algorithms (informed + uninformed)
- Evolutionary computation
- Multi-agent systems
- Decision theory
- Probabilistic reasoning
- Procedural content generation
