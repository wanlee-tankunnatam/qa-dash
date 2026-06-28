import { defineStore } from 'pinia'

interface SettingsState {
  anthropicKeySet: boolean
  loading: boolean
  error: string | null
}

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => ({
    anthropicKeySet: false,
    loading: false,
    error: null,
  }),

  actions: {
    async saveAnthropicKey(key: string): Promise<void> {
      this.loading = true
      this.error = null
      try {
        await window.qaApi.setCredential('anthropic-key', key)
        this.anthropicKeySet = true
      } catch (e) {
        this.error = (e as Error).message
        throw e
      } finally {
        this.loading = false
      }
    },

    async deleteAnthropicKey(): Promise<void> {
      this.loading = true
      this.error = null
      try {
        await window.qaApi.deleteCredential('anthropic-key')
        this.anthropicKeySet = false
      } catch (e) {
        this.error = (e as Error).message
        throw e
      } finally {
        this.loading = false
      }
    },

    async checkKeysStatus(): Promise<void> {
      // Key status check is handled by IPC — placeholder for Phase 2
      // anthropicKeySet reflects whether the key has been saved
    },
  },
})
