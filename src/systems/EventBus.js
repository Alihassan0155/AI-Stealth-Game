/**
 * EventBus — lightweight pub/sub for decoupled game events.
 *
 * Usage:
 *   EventBus.on('player:spotted', (data) => { ... })
 *   EventBus.emit('player:spotted', { guard, tile })
 *   EventBus.off('player:spotted', handler)
 *
 * Events used in the game:
 *   player:spotted  → guard sees player
 *   player:caught   → guard catches player
 *   player:escaped  → player reaches escape tile
 *   round:end       → round finished (reason: caught|escaped|timeout)
 *   guard:alert     → guard alert level changed
 */
class EventBusClass {
  constructor() {
    this._listeners = {}
  }

  on(event, handler) {
    if (!this._listeners[event]) this._listeners[event] = []
    this._listeners[event].push(handler)
    return () => this.off(event, handler)   // returns an unsubscribe function
  }

  off(event, handler) {
    if (!this._listeners[event]) return
    this._listeners[event] = this._listeners[event].filter(h => h !== handler)
  }

  emit(event, data) {
    if (!this._listeners[event]) return
    for (const handler of this._listeners[event]) handler(data)
  }

  clear() {
    this._listeners = {}
  }
}

export const EventBus = new EventBusClass()
