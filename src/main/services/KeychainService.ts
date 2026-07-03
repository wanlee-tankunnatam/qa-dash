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

  async setServicePassword(id: string, password: string): Promise<void> {
    try {
      await keytar.setPassword(this.SERVICE, `svc:${id}`, password)
    } catch (err) {
      throw new Error('KEYCHAIN_ERROR: ' + (err as Error).message)
    }
  }

  async getServicePassword(id: string): Promise<string | null> {
    try {
      return await keytar.getPassword(this.SERVICE, `svc:${id}`)
    } catch (err) {
      throw new Error('KEYCHAIN_ERROR: ' + (err as Error).message)
    }
  }

  async deleteServicePassword(id: string): Promise<void> {
    try {
      await keytar.deletePassword(this.SERVICE, `svc:${id}`)
    } catch (err) {
      throw new Error('KEYCHAIN_ERROR: ' + (err as Error).message)
    }
  }

  async setServiceToken(id: string, token: string): Promise<void> {
    try {
      await keytar.setPassword(this.SERVICE, `svc:${id}:token`, token)
    } catch (err) {
      throw new Error('KEYCHAIN_ERROR: ' + (err as Error).message)
    }
  }

  async getServiceToken(id: string): Promise<string | null> {
    try {
      return await keytar.getPassword(this.SERVICE, `svc:${id}:token`)
    } catch (err) {
      throw new Error('KEYCHAIN_ERROR: ' + (err as Error).message)
    }
  }

  async deleteServiceToken(id: string): Promise<void> {
    try {
      await keytar.deletePassword(this.SERVICE, `svc:${id}:token`)
    } catch (err) {
      throw new Error('KEYCHAIN_ERROR: ' + (err as Error).message)
    }
  }

  async setServiceSecret(id: string, secret: string): Promise<void> {
    try {
      await keytar.setPassword(this.SERVICE, `svc:${id}:secret`, secret)
    } catch (err) {
      throw new Error('KEYCHAIN_ERROR: ' + (err as Error).message)
    }
  }

  async getServiceSecret(id: string): Promise<string | null> {
    try {
      return await keytar.getPassword(this.SERVICE, `svc:${id}:secret`)
    } catch (err) {
      throw new Error('KEYCHAIN_ERROR: ' + (err as Error).message)
    }
  }

  async deleteServiceSecret(id: string): Promise<void> {
    try {
      await keytar.deletePassword(this.SERVICE, `svc:${id}:secret`)
    } catch (err) {
      throw new Error('KEYCHAIN_ERROR: ' + (err as Error).message)
    }
  }
}
