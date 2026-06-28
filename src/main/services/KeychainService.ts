import keytar from 'keytar'

type CredentialKey = 'jira-token' | 'anthropic-key'

export class KeychainService {
  private readonly SERVICE = 'QADash'

  async setCredential(key: CredentialKey, value: string): Promise<void> {
    try {
      await keytar.setPassword(this.SERVICE, key, value)
    } catch (err) {
      throw new Error('KEYCHAIN_ERROR: ' + (err as Error).message)
    }
  }

  async getCredential(key: CredentialKey): Promise<string | null> {
    try {
      return await keytar.getPassword(this.SERVICE, key)
    } catch (err) {
      throw new Error('KEYCHAIN_ERROR: ' + (err as Error).message)
    }
  }

  async deleteCredential(key: CredentialKey): Promise<void> {
    try {
      await keytar.deletePassword(this.SERVICE, key)
    } catch (err) {
      throw new Error('KEYCHAIN_ERROR: ' + (err as Error).message)
    }
  }
}
