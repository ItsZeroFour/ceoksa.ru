/// <reference types="node" />
import { Decipheriv } from 'crypto';
import { Algorithm } from '../../../types';
/**
 * It creates a cipher instance used for decryption
 *
 * @param key - The decryption key
 * @param algorithm - The algorithm to use to create the Cipher
 *
 * @returns A {@link Decipheriv} instance created with the given key & algorithm
 */
export declare const createDecryptionCipher: (key: string, algorithm?: Algorithm) => Decipheriv;
//# sourceMappingURL=decrypt.d.ts.map