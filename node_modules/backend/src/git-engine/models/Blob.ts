/**
 * Blob - Represents file content in the Git object model
 * Blobs are the fundamental storage unit for file data
 */
export class Blob {
  constructor(
    public readonly content: string,
    public readonly hash: string
  ) {}

  /**
   * Get the size of the blob content in bytes
   */
  get size(): number {
    return Buffer.byteLength(this.content, 'utf8');
  }

  /**
   * Create a Blob from content, generating its hash
   */
  static create(content: string): Blob {
    const hash = Blob.generateHash(content);
    return new Blob(content, hash);
  }

  /**
   * Generate a hash for blob content (simplified SHA-1 simulation)
   */
  private static generateHash(content: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha1').update(`blob ${content}`).digest('hex');
  }

  /**
   * Serialize blob to JSON
   */
  toJSON() {
    return {
      type: 'blob',
      content: this.content,
      hash: this.hash,
      size: this.size
    };
  }
}
