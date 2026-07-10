import Anthropic from '@anthropic-ai/sdk'
import { KeychainService } from './KeychainService.js'
import { AI_MODEL } from '../../shared/constants.js'

const MODEL = AI_MODEL

export class AIService {
  private client: Anthropic | null = null

  private async getClient(): Promise<Anthropic> {
    if (!this.client) {
      const keychainService = new KeychainService()
      const apiKey = await keychainService.getAnthropicKey()
      if (!apiKey) {
        throw new Error('Anthropic API key not found in keychain')
      }
      this.client = new Anthropic({ apiKey })
    }
    return this.client
  }

  async ask(prompt: string, systemPrompt?: string): Promise<string> {
    const client = await this.getClient()
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 2048,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const content = message.content[0]
    if (content.type === 'text') {
      return content.text
    }
    throw new Error('Unexpected response type from API')
  }

  async stream(prompt: string, onChunk: (text: string) => void, systemPrompt?: string): Promise<void> {
    const client = await this.getClient()
    const stream = await client.messages.stream({
      model: MODEL,
      max_tokens: 2048,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        onChunk(chunk.delta.text)
      }
    }
  }
}
