// src/lib/argon.ts
import * as argon2 from 'argon2';

export async function hashPassword(password: string): Promise<string> {
  return await argon2.hash(password, {
    type: argon2.argon2id, // Uses Argon2id by default (recommended)
    memoryCost: 65536, // 64MB memory usage
    timeCost: 3, // Number of iterations
    parallelism: 1, // Number of threads
    hashLength: 32, // Hash output length in bytes
  });
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
}
