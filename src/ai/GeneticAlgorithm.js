import { GA_CFG } from '../game/constants.js'

/**
 * GeneticAlgorithm — Evolves guard strategies across rounds.
 *
 * Each guard has a "gene" object with numeric traits (0–1).
 * After a round, guards are ranked by fitness (catches + spots).
 * The best genes survive (elitism), then crossover + mutation
 * produces the next generation.
 *
 * By round 5–10, guards are measurably faster, more coordinated,
 * and better at predicting the player's escape routes.
 *
 * Gene traits:
 *   aggression     — tendency to chase directly vs. flank
 *   searchRadius   — how wide a BFS sweep they perform
 *   patrolFreq     — how often they change patrol waypoints
 *   teamwork       — how much intel they share with nearby guards
 *   predictionAcc  — how often they recalculate their A* path
 *   visionMult     — multiplier on base vision range
 *   speedMult      — multiplier on base movement speed
 */
export class GeneticAlgorithm {
  constructor() {
    this.population  = Array.from({ length: GA_CFG.POPULATION }, () => this._randomGene())
    this.fitness     = new Array(GA_CFG.POPULATION).fill(0)
    this.generation  = 1
    this.best        = this.population[0]
    this.history     = []   // fitness snapshots per generation
  }

  _randomGene() {
    return {
      aggression:    Math.random(),
      searchRadius:  0.3 + Math.random() * 0.7,
      patrolFreq:    Math.random(),
      teamwork:      Math.random(),
      predictionAcc: Math.random(),
      visionMult:    0.5 + Math.random(),
      speedMult:     0.7 + Math.random() * 0.6,
    }
  }

  /** Call when a guard catches the player */
  recordCapture(geneIdx) {
    if (geneIdx >= 0 && geneIdx < this.fitness.length)
      this.fitness[geneIdx] += GA_CFG.FITNESS_CATCH
  }

  /** Call when a guard spots (sees) the player */
  recordSpot(geneIdx) {
    if (geneIdx >= 0 && geneIdx < this.fitness.length)
      this.fitness[geneIdx] += GA_CFG.FITNESS_SPOT
  }

  /**
   * Evolve to next generation.
   * Call this at the END of each round.
   * @returns {object} best gene of new generation
   */
  evolve() {
    const ranked = this.population
      .map((gene, i) => ({ gene, fitness: this.fitness[i] }))
      .sort((a, b) => b.fitness - a.fitness)

    this.best = ranked[0].gene
    this.history.push({
      generation: this.generation,
      avgFitness: this.fitness.reduce((s, f) => s + f, 0) / this.fitness.length,
      maxFitness: ranked[0].fitness,
    })

    // Elitism: keep top N unchanged
    const nextGen = ranked.slice(0, GA_CFG.ELITISM).map(r => ({ ...r.gene }))

    // Fill rest via crossover from top 4
    while (nextGen.length < GA_CFG.POPULATION) {
      const parentA = ranked[Math.floor(Math.random() * 4)].gene
      const parentB = ranked[Math.floor(Math.random() * 4)].gene
      nextGen.push(this._crossover(parentA, parentB))
    }

    this.population = nextGen
    this.fitness    = new Array(GA_CFG.POPULATION).fill(0)
    this.generation++

    return this.best
  }

  _crossover(a, b) {
    const child = {}
    for (const key of Object.keys(a)) {
      // Uniform crossover
      child[key] = Math.random() < 0.5 ? a[key] : b[key]
      // Mutation
      if (Math.random() < GA_CFG.MUTATION_RATE) {
        child[key] = Math.max(0, Math.min(1,
          child[key] + (Math.random() - 0.5) * GA_CFG.MUTATION_RANGE
        ))
      }
    }
    return child
  }

  /** Get gene for guard index (wraps around population size) */
  geneFor(index) {
    return this.population[index % this.population.length]
  }
}
