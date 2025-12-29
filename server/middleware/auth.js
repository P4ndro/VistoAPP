import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { logError } from '../utils/logger.js';

// Get JWT_SECRET at runtime (after dotenv loads)
const getJWTSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        logError('ERROR: JWT_SECRET is not defined in .env file');
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        }
    }
    return secret;
};

export const authMiddleware = async (req, res, next) => {
    try {
        const JWT_SECRET = getJWTSecret();
        if (!JWT_SECRET) {
            return res.status(500).json({ error: 'Server configuration error' });
        }

        // Extract token from cookie or Authorization header
        const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        // Verify JWT token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Find user in database
        const user = await User.findById(decoded.userId).select('-accessToken');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Attach user to request object
        req.user = user;

        // Continue to next middleware/route
        next();

    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

