import CryptoJS from 'crypto-js';
import { logWarn, logError } from './logger.js';

// Get encryption key at runtime (after dotenv loads)
const getEncryptionKey = () => {
    const key = process.env.ENCRYPTION_KEY || process.env.JWT_SECRET;
    if (!key) {
        logWarn('ENCRYPTION_KEY not set. Using JWT_SECRET as fallback. Set ENCRYPTION_KEY for better security.');
    }
    return key;
};

/**
 * Encrypt sensitive data (like access tokens)
 */
export const encrypt = (text) => {
    if (!text) return null;
    const ENCRYPTION_KEY = getEncryptionKey();
    if (!ENCRYPTION_KEY) {
        logError('ENCRYPTION_KEY is required for encryption');
        return null;
    }
    try {
        return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
    } catch (error) {
        logError('Encryption error', error);
        return null;
    }
};

/**
 * Decrypt sensitive data
 */
export const decrypt = (encryptedText) => {
    if (!encryptedText) return null;
    const ENCRYPTION_KEY = getEncryptionKey();
    if (!ENCRYPTION_KEY) {
        logError('ENCRYPTION_KEY is required for decryption');
        return null;
    }
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        // If decryption fails, bytes will be empty - might be unencrypted token
        if (!decrypted && encryptedText) {
            // Try to use as-is (for backward compatibility with unencrypted tokens)
            logWarn('Decryption returned empty - token might be unencrypted, using as-is');
            return encryptedText;
        }
        return decrypted;
    } catch (error) {
        logError('Decryption error', error);
        // Fallback: return as-is for backward compatibility
        return encryptedText;
    }
};

