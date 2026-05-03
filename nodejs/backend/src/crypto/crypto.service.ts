import { Injectable } from '@nestjs/common'
import { DecryptCommand, EncryptCommand, KMSClient } from '@aws-sdk/client-kms'
import { env } from '../config/env.js'

@Injectable()
export class CryptoService {
  private readonly kms = new KMSClient({ region: env.AWS_REGION })

  async encrypt(plaintext: string): Promise<string> {
    const { CiphertextBlob } = await this.kms.send(
      new EncryptCommand({ KeyId: env.KMS_KEY_ID, Plaintext: Buffer.from(plaintext) }),
    )
    if (!CiphertextBlob) throw new Error('KMS encrypt: no ciphertext')
    return Buffer.from(CiphertextBlob).toString('base64')
  }

  async decrypt(ciphertext: string): Promise<string> {
    const { Plaintext } = await this.kms.send(
      new DecryptCommand({
        KeyId: env.KMS_KEY_ID,
        CiphertextBlob: Buffer.from(ciphertext, 'base64'),
      }),
    )
    if (!Plaintext) throw new Error('KMS decrypt: no plaintext')
    return Buffer.from(Plaintext).toString('utf-8')
  }
}
