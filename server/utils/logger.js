/**
 * Secure logging utility that filters sensitive information
 */

const SENSITIVE_FIELDS = ['password', 'accessToken', 'token', 'secret', 'authorization', 'cookie'];

/**
 * Sanitize object to remove sensitive fields
 */
const sanitize = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    
    if (Array.isArray(obj)) {
        return obj.map(item => sanitize(item));
    }
    
    const sanitized = { ...obj };
    
    for (const key in sanitized) {
        const lowerKey = key.toLowerCase();
        
        // Remove sensitive fields
        if (SENSITIVE_FIELDS.some(field => lowerKey.includes(field))) {
            sanitized[key] = '[REDACTED]';
        } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
            sanitized[key] = sanitize(sanitized[key]);
        }
    }
    
    return sanitized;
};

/**
 * Log info (development only)
 */
export const logInfo = (message, data = null) => {
    if (process.env.NODE_ENV === 'development') {
        console.log(`[INFO] ${message}`, data ? sanitize(data) : '');
    }
};

/**
 * Log error (always logs, but sanitizes data)
 */
export const logError = (message, error = null) => {
    const errorData = error ? {
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        ...sanitize(error)
    } : null;
    
    console.error(`[ERROR] ${message}`, errorData || '');
};

/**
 * Log warning
 */
export const logWarn = (message, data = null) => {
    console.warn(`[WARN] ${message}`, data ? sanitize(data) : '');
};

