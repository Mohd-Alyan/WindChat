/**
 * End-to-End Encryption utility using Web Crypto API
 * 
 * This module provides encryption and decryption functions using AES-GCM
 * with keys derived from the room key using PBKDF2.
 */

// Derive a cryptographic key from the room key string
async function deriveKey(roomKey) {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(roomKey),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  // Use a static salt for deterministic key derivation
  // In production, consider using a more sophisticated approach
  const salt = encoder.encode('windchat-salt-2024');

  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt a message using AES-GCM
 * @param {string} message - Plain text message
 * @param {string} roomKey - Room key for encryption
 * @returns {Promise<string>} Base64 encoded encrypted message with IV
 */
export async function encryptMessage(message, roomKey) {
  try {
    const encoder = new TextEncoder();
    const key = await deriveKey(roomKey);
    
    // Generate a random initialization vector
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Encrypt the message
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      encoder.encode(message)
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encryptedData.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encryptedData), iv.length);

    // Convert to base64 for transmission
    return arrayBufferToBase64(combined);
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt message');
  }
}

/**
 * Decrypt a message using AES-GCM
 * @param {string} encryptedMessage - Base64 encoded encrypted message
 * @param {string} roomKey - Room key for decryption
 * @returns {Promise<string>} Decrypted plain text message
 */
export async function decryptMessage(encryptedMessage, roomKey) {
  try {
    const key = await deriveKey(roomKey);
    const decoder = new TextDecoder();
    
    // Convert from base64
    const combined = base64ToArrayBuffer(encryptedMessage);
    
    // Extract IV and encrypted data
    const iv = combined.slice(0, 12);
    const encryptedData = combined.slice(12);

    // Decrypt the message
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      encryptedData
    );

    return decoder.decode(decryptedData);
  } catch (error) {
    console.error('Decryption error:', error);
    return '[Error: Could not decrypt message]';
  }
}

/**
 * Convert ArrayBuffer to Base64 string
 */
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert Base64 string to ArrayBuffer
 */
function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Generate a random room key
 * @param {number} length - Length of the key (default: 16)
 * @returns {string} Random alphanumeric room key
 */
export function generateRoomKey(length = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const randomValues = crypto.getRandomValues(new Uint8Array(length));
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length];
  }
  
  return result;
}
