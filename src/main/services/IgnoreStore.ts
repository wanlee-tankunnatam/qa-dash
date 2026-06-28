import Store from 'electron-store'

type IgnoreRecord = Record<string, string[]>

interface StoreSchema {
  ignores: IgnoreRecord
}

export class IgnoreStore {
  private store: Store<StoreSchema>

  constructor() {
    this.store = new Store<StoreSchema>({
      name: 'ignores',
      defaults: { ignores: {} },
    })
    this.clearStale()
  }

  private today(): string {
    return new Date().toISOString().split('T')[0]
  }

  ignore(taskId: string): void {
    try {
      const date = this.today()
      const ignores = this.store.get('ignores') ?? {}
      const list = ignores[date] ?? []
      if (!list.includes(taskId)) {
        list.push(taskId)
      }
      ignores[date] = list
      this.store.set('ignores', ignores)
    } catch {
      // store error — silently skip
    }
  }

  unignore(taskId: string): void {
    try {
      const date = this.today()
      const ignores = this.store.get('ignores') ?? {}
      const list = ignores[date] ?? []
      ignores[date] = list.filter((id) => id !== taskId)
      this.store.set('ignores', ignores)
    } catch {
      // store error — silently skip
    }
  }

  isIgnored(taskId: string): boolean {
    try {
      const date = this.today()
      const ignores = this.store.get('ignores') ?? {}
      return (ignores[date] ?? []).includes(taskId)
    } catch {
      return false
    }
  }

  getIgnoredToday(): string[] {
    try {
      const date = this.today()
      const ignores = this.store.get('ignores') ?? {}
      return ignores[date] ?? []
    } catch {
      return []
    }
  }

  clearStale(): void {
    try {
      const date = this.today()
      const ignores = this.store.get('ignores') ?? {}
      const filtered: IgnoreRecord = {}
      if (ignores[date]) {
        filtered[date] = ignores[date]
      }
      this.store.set('ignores', filtered)
    } catch {
      // store error — silently skip
    }
  }
}
