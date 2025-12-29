import rateLimit from 'express-rate-limit';

// General API rate limit
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 100 : 1000, // More lenient in development
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Skip rate limiting in development
        return process.env.NODE_ENV === 'development';
    }
});

// Strict limit for sync endpoint (resource-intensive)
export const syncLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 5 : 50, // Much more lenient in development
    message: 'Too many sync requests. Please wait before syncing again.',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    skip: (req) => {
        // Skip rate limiting in development
        return process.env.NODE_ENV === 'development';
    }
});

// Auth rate limiter (prevent brute force)
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 10 : 100, // Much more lenient in development
    message: 'Too many authentication attempts. Please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Skip rate limiting in development
        return process.env.NODE_ENV === 'development';
    }
});

