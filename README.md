# Evolving Escape City

**A browser-based stealth game that demonstrates search, planning and evolving multi-agent behaviors.**

The player navigates a procedurally generated city while AI-controlled guards investigate, search, pursue, and coordinate. The game is implemented with React, Vite and a custom JavaScript game loop.

## How it works

- **Search:** BFS and DFS modules support exploration and area search.
- **Pathfinding:** A* supports goal-directed navigation.
- **Action selection:** hill climbing and behavior-tree code organize guard choices.
- **Adaptation:** genetic-algorithm code models changing guard parameters across rounds.
- **Perception:** visibility, heatmaps, and related systems inform guard responses.
- **Coordination:** multiple guards can share information through coordination logic.

These describe modules present in the repository; they are not a benchmark of optimal AI performance.

## Code map

```text
src/
  ai/          Search, pathfinding, behavior and genetic algorithms
  game/        Game loop and core constants
  player/      Player state and controls
  systems/     Guards, visibility, coordination and other game systems
  ui/          React HUD, overlays and information panels
  world/       City generation, grid and tile rendering
  hooks/       React game-loop integration
```

## Run locally

```bash
git clone https://github.com/Alihassan0155/AI-Stealth-Game.git
cd AI-Stealth-Game
npm install
npm run dev
```

Open the development URL printed by Vite (typically `http://localhost:5173`).

```bash
npm run build
```

The repository currently defines a lint script, but no CI/test pass is claimed here.

## Controls and gameplay

The game is intended for keyboard-based movement (WASD or arrow keys). For the latest interaction details, inspect the in-game interface and keyboard handling; this README deliberately avoids listing unverified keybindings and game rules.

## Why this project is interesting

Instead of an isolated pathfinding example, the code puts several classical AI techniques into the same interactive environment. It is useful for inspecting how algorithmic choices are reflected in simulated agent behavior, but it should not be represented as a scientific evaluation of those techniques.

**Suggested next addition:** record a short real gameplay video or GIF and place it near the top of this README. No screenshot or video is included in this documentation-only refresh.

---

**Maintainer:** [Alihassan0155](https://github.com/Alihassan0155) · [Portfolio](https://ali-hassan-khan-portfolio.vercel.app/)
