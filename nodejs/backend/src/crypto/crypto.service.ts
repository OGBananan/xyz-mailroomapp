import { Injectable } from '@nestjs/common'

// Tokens stored as plain base64 — no encryption in this environment.
// Add KMS or equivalent before handling production user data.
@Injectable()
export class CryptoService {
  async encrypt(plaintext: string): Promise<string> {
    return Buffer.from(plaintext).toString('base64')
  }

  async decrypt(ciphertext: string): Promise<string> {
    return Buffer.from(ciphertext, 'base64').toString('utf-8')
  }
}
